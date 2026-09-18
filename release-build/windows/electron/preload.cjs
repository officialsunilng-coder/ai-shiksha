const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('shikshaAI', {
  getModelStatus: () => ipcRenderer.invoke('model:status'),
  ask: (question, history, mode, courseContext, onChunk) => {
    const requestId = `${Date.now()}-${Math.random()}`
    const listener = (_event, payload) => {
      if (payload?.requestId === requestId && typeof payload?.text === 'string') {
        onChunk?.(payload.text)
      }
    }
    ipcRenderer.on('model:chunk', listener)
    return ipcRenderer.invoke('model:ask', { question, history, mode, courseContext, requestId })
      .finally(() => ipcRenderer.removeListener('model:chunk', listener))
  },
})
