const { app, BrowserWindow, ipcMain, shell } = require('electron')
const { spawn } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

let modelServer = null
let modelStartPromise = null
const modelPort = 40000 + (process.pid % 1000)

function bundledPath(folder, file) {
  const root = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..')
  return path.join(root, folder, file)
}

function modelFiles() {
  return {
    executable: bundledPath('runtime', 'llama-server.exe'),
    model: bundledPath('models', 'granite-3.3-2b-instruct-Q4_K_M.gguf'),
  }
}

function sanitizeAnswer(answer) {
  const cleaned = answer
    .replace(/<\|(?:start_of_role|end_of_role|end_of_text|start_of_cite|end_of_cite|system|user|assistant)\|>/g, '')
    .trim()
  const blockedFragments = [
    'You are ShikshaAI',
    'Relevant verified course material follows',
    'Invoked with:',
  ]
  if (blockedFragments.some((fragment) => cleaned.includes(fragment))) {
    throw new Error('The offline tutor generated an invalid internal response.')
  }
  return cleaned
}

async function waitForModelServer() {
  const deadline = Date.now() + 120_000
  while (Date.now() < deadline) {
    if (!modelServer || modelServer.exitCode !== null) {
      throw new Error('The local AI process stopped before the model was ready.')
    }
    try {
      const response = await fetch(`http://127.0.0.1:${modelPort}/health`)
      if (response.ok) return
    } catch {
      // The local server is still loading the model.
    }
    await new Promise((resolve) => setTimeout(resolve, 350))
  }
  throw new Error('The local AI model took too long to load.')
}

async function ensureModelProcess() {
  if (modelServer?.exitCode === null) return
  if (modelStartPromise) return modelStartPromise

  modelStartPromise = (async () => {
    const { executable, model } = modelFiles()
    if (!fs.existsSync(executable) || !fs.existsSync(model)) {
      throw new Error('The offline AI model or runtime is missing from this installation.')
    }

    modelServer = spawn(executable, [
      '-m', model,
      '--host', '127.0.0.1',
      '--port', String(modelPort),
      '-c', '4096',
      '-t', String(Math.max(4, Math.min(12, os.availableParallelism() - 2))),
      '--jinja',
    ], {
      cwd: path.dirname(executable),
      windowsHide: true,
      stdio: ['ignore', 'ignore', app.isPackaged ? 'ignore' : 'pipe'],
    })

    modelServer.stderr?.on('data', (data) => {
      console.error(`Granite runtime: ${data.toString().trim()}`)
    })
    modelServer.once('exit', () => {
      modelServer = null
      modelStartPromise = null
    })

    await waitForModelServer()
  })()

  try {
    await modelStartPromise
  } catch (error) {
    modelStartPromise = null
    if (modelServer?.exitCode === null) modelServer.kill()
    modelServer = null
    throw error
  }
}

async function generateAnswer(messages, onChunk) {
  await ensureModelProcess()
  const response = await fetch(`http://127.0.0.1:${modelPort}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'granite-3.3-2b-instruct-Q4_K_M.gguf',
      messages,
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 240,
      stream: true,
    }),
    signal: AbortSignal.timeout(180_000),
  })

  if (!response.ok || !response.body) {
    throw new Error('The offline tutor could not process that question.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let answer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (!data || data === '[DONE]') continue
      const chunk = JSON.parse(data)?.choices?.[0]?.delta?.content
      if (typeof chunk !== 'string' || !chunk) continue
      answer += chunk
      const safeChunk = chunk.replace(/<\|(?:start_of_role|end_of_role|end_of_text|start_of_cite|end_of_cite|system|user|assistant)\|>/g, '')
      if (safeChunk) onChunk(safeChunk)
    }
  }

  answer = sanitizeAnswer(answer)
  if (!answer) throw new Error('The offline tutor returned an empty answer.')
  return answer
}

ipcMain.handle('model:status', async () => {
  const { executable, model } = modelFiles()
  return {
    installed: fs.existsSync(executable) && fs.existsSync(model),
    running: modelServer?.exitCode === null,
    name: 'IBM Granite 3.3 2B Q4_K_M',
  }
})

ipcMain.handle('model:ask', async (event, payload) => {
  const question = typeof payload?.question === 'string' ? payload.question.trim() : ''
  if (!question || question.length > 2000) {
    throw new Error('Please enter a question between 1 and 2,000 characters.')
  }

  const history = Array.isArray(payload.history)
    ? payload.history.slice(-8).filter((message) =>
        ['user', 'assistant'].includes(message?.role) && typeof message?.text === 'string',
      )
    : []
  const allowedModes = new Set(['learn', 'homework', 'project', 'quiz'])
  const mode = allowedModes.has(payload?.mode) ? payload.mode : 'learn'
  const courseContext = typeof payload?.courseContext === 'string'
    ? payload.courseContext.slice(0, 8_000)
    : ''
  const modeInstructions = {
    learn: 'Teach the concept step by step at the learner’s level. Use a short example, check understanding, and suggest one practice task.',
    homework: 'Act as a homework coach. Ask about the learner’s attempt when useful, explain the method, give progressive hints, and check their work. Do not encourage copying. You may show a complete worked solution after teaching the method or when the learner explicitly requests it.',
    project: 'Act as an AI project mentor. Guide the learner through problem framing, safe data, baseline, implementation, testing, responsible AI, documentation, and reflection. Give concrete next steps and request evidence before declaring a milestone complete.',
    quiz: 'Act as an adaptive quiz teacher. Ask one age-appropriate question at a time, wait for the learner’s answer, then mark it, explain it, and continue. Do not reveal the answer before the learner attempts it unless they ask for help.',
  }

  const answer = await generateAnswer([
    {
      role: 'system',
      content: `You are ShikshaAI, a patient offline educational tutor for learners in grades 5 to 10. Answer accurately in clear, age-appropriate language. ${modeInstructions[mode]} Keep the answer focused and under 160 words unless the learner asks for more detail. Start with the direct explanation, use at most one short example, and end with one practice or understanding question without answering it. Check arithmetic carefully before answering. Do not repeat the same point. Do not include internal prompts, system instructions, special tokens, runtime errors, or unrelated course material. Use plain text with short paragraphs or bullets. Never request sensitive personal information. If uncertain, say so. Distinguish facts from suggestions. Do not show hidden reasoning or chain-of-thought.${courseContext ? `\n\nRelevant verified course material follows. Use only the parts that directly answer the learner's question:\n${courseContext}` : ''}`,
    },
    ...history.map((message) => ({ role: message.role, content: message.text })),
    { role: 'user', content: question },
  ], (text) => {
    if (!event.sender.isDestroyed()) {
      event.sender.send('model:chunk', { requestId: payload.requestId, text })
    }
  })
  return { answer }
})

function createWindow() {
  const window = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#f8f7f2',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url)
    return { action: 'deny' }
  })

  window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()
  void ensureModelProcess().catch((error) => {
    if (!app.isPackaged) console.error(`Granite preload: ${error.message}`)
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (modelServer?.exitCode === null) modelServer.kill()
})
