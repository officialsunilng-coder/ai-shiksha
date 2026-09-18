import type { ModelStatus, TutorMessage, TutorMode } from './offline-model'

export {}

declare global {
  interface Window {
    shikshaAI?: {
      getModelStatus: () => Promise<ModelStatus>
      ask: (
        question: string,
        history: TutorMessage[],
        mode?: TutorMode,
        courseContext?: string,
        onChunk?: (text: string) => void,
      ) => Promise<{ answer: string }>
    }
  }
}
