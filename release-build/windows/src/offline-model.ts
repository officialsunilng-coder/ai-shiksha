import { Capacitor, registerPlugin } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'

export type TutorMode = 'learn' | 'homework' | 'project' | 'quiz'

export interface ModelStatus {
  installed: boolean
  running: boolean
  name: string
  modelPath?: string
}

export interface TutorMessage {
  role: 'user' | 'assistant'
  text: string
}

interface NativeModelPlugin {
  getModelStatus: () => Promise<ModelStatus>
  ask: (options: {
    question: string
    history: TutorMessage[]
    mode: TutorMode
    courseContext: string
    requestId: string
  }) => Promise<{ answer: string }>
  addListener: (
    eventName: 'modelChunk',
    listener: (event: { requestId: string; text: string }) => void,
  ) => Promise<PluginListenerHandle>
}

const NativeOfflineModel = registerPlugin<NativeModelPlugin>('OfflineModel')

export const offlineModel = {
  isAvailable(): boolean {
    return Boolean(window.shikshaAI) || Capacitor.isNativePlatform()
  },

  getModelStatus(): Promise<ModelStatus> {
    if (window.shikshaAI) return window.shikshaAI.getModelStatus()
    if (Capacitor.isNativePlatform()) return NativeOfflineModel.getModelStatus()
    return Promise.resolve({
      installed: false,
      running: false,
      name: 'IBM Granite 3.3 2B Q4_K_M',
    })
  },

  async ask(
    question: string,
    history: TutorMessage[],
    mode: TutorMode,
    courseContext: string,
    onChunk?: (text: string) => void,
  ): Promise<{ answer: string }> {
    if (window.shikshaAI) {
      return window.shikshaAI.ask(question, history, mode, courseContext, onChunk)
    }
    if (!Capacitor.isNativePlatform()) {
      throw new Error('The offline model is available in an installed desktop or mobile application.')
    }

    const requestId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    const listener = await NativeOfflineModel.addListener('modelChunk', (event) => {
      if (event.requestId === requestId && event.text) onChunk?.(event.text)
    })
    try {
      return await NativeOfflineModel.ask({
        question,
        history,
        mode,
        courseContext,
        requestId,
      })
    } finally {
      await listener.remove()
    }
  },
}
