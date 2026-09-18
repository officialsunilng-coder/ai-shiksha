export type QuizQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type LessonSection = {
  title: string
  body: string
  activity: string
}

export type CurriculumLesson = {
  id: string
  moduleId: string
  order: number
  title: string
  summary: string
  gradeMin: number
  gradeMax: number
  minutes: number
  difficulty: 'Foundation' | 'Explorer' | 'Builder'
  color: string
  objectives: string[]
  vocabulary: Array<{ term: string; meaning: string }>
  sections: LessonSection[]
  quiz: QuizQuestion[]
}

export type CurriculumModule = {
  id: string
  order: number
  title: string
  description: string
  color: string
  gradeBand: string
  lessons: CurriculumLesson[]
}

export type GuidedProject = {
  id: string
  title: string
  gradeBand: string
  duration: string
  difficulty: 'Starter' | 'Intermediate' | 'Capstone'
  summary: string
  outcome: string
  skills: string[]
  materials: string[]
  essentialQuestion?: string
  studentBrief?: string
  workedExample?: string
  safety?: string[]
  deliverables?: string[]
  steps: Array<{
    title: string
    instructions: string
    evidence: string
    tasks?: string[]
    qualityChecks?: string[]
  }>
  rubric: Array<{ criterion: string; excellent: string }>
}
