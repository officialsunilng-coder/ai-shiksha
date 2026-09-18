import { jsPDF } from 'jspdf'
import type { CurriculumModule, GuidedProject } from './types/curriculum'

type LearningRecordInput = {
  completed: string[]
  scores: Record<string, number>
  projectProgress: Record<string, string[]>
  curriculum: CurriculumModule[]
  projects: GuidedProject[]
  courseComplete: boolean
}

export function exportLearningRecordPdf({
  completed,
  scores,
  projectProgress,
  curriculum,
  projects,
  courseComplete,
}: LearningRecordInput) {
  const document = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = document.internal.pageSize.getWidth()
  const pageHeight = document.internal.pageSize.getHeight()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  let y = 18

  const newPageIfNeeded = (height: number) => {
    if (y + height <= pageHeight - margin) return
    document.addPage()
    y = 18
  }

  const heading = (text: string, size = 14) => {
    newPageIfNeeded(10)
    document.setFont('helvetica', 'bold')
    document.setFontSize(size)
    document.setTextColor(34, 50, 47)
    document.text(text, margin, y)
    y += size * 0.5 + 4
  }

  const line = (text: string, options?: { bold?: boolean; indent?: number; color?: [number, number, number] }) => {
    const indent = options?.indent || 0
    document.setFont('helvetica', options?.bold ? 'bold' : 'normal')
    document.setFontSize(9.5)
    document.setTextColor(...(options?.color || [63, 72, 70]))
    const wrapped = document.splitTextToSize(text, contentWidth - indent)
    const height = wrapped.length * 4.6
    newPageIfNeeded(height + 2)
    document.text(wrapped, margin + indent, y)
    y += height + 1.5
  }

  document.setFillColor(36, 88, 79)
  document.rect(0, 0, pageWidth, 43, 'F')
  document.setTextColor(255, 255, 255)
  document.setFont('helvetica', 'bold')
  document.setFontSize(21)
  document.text('ShikshaAI Learning Record', margin, 19)
  document.setFont('helvetica', 'normal')
  document.setFontSize(10)
  document.text('Offline AI pathway - Grades 5 to 10', margin, 27)
  document.text(`Generated ${new Date().toLocaleString()}`, margin, 34)
  y = 53

  const lessonTotal = curriculum.reduce((total, module) => total + module.lessons.length, 0)
  const completedCapstones = projects.filter((project) =>
    project.difficulty === 'Capstone' && (projectProgress[project.id]?.length || 0) === project.steps.length,
  )

  heading('Course summary', 15)
  line(`Status: ${courseComplete ? 'AI pathway completed' : 'In progress'}`, { bold: true })
  line(`Lessons mastered: ${completed.length} of ${lessonTotal}`)
  line(`Passing assessments: ${Object.values(scores).filter((score) => score >= 70).length}`)
  line(`Completed capstone projects: ${completedCapstones.length}`)
  line('Completion standard: all 24 lessons at 70% or higher and at least one completed capstone project.')

  heading('Module and assessment record')
  for (const module of curriculum) {
    const mastered = module.lessons.filter((lesson) => completed.includes(lesson.id)).length
    heading(`${module.order}. ${module.title} - ${mastered}/${module.lessons.length} mastered`, 11)
    for (const lesson of module.lessons) {
      const status = completed.includes(lesson.id) ? 'Mastered' : scores[lesson.id] !== undefined ? 'Attempted' : 'Not attempted'
      const score = scores[lesson.id] !== undefined ? `${scores[lesson.id]}%` : 'No score'
      line(`${status} | ${score} | ${lesson.title}`, { indent: 3 })
    }
  }

  heading('Project portfolio')
  for (const project of projects) {
    const done = projectProgress[project.id]?.length || 0
    heading(`${project.title} - ${done}/${project.steps.length} milestones`, 11)
    line(`${project.gradeBand} | ${project.difficulty} | ${project.duration}`, { indent: 3 })
    for (let index = 0; index < project.steps.length; index++) {
      const milestoneId = `${project.id}-${index}`
      line(`${projectProgress[project.id]?.includes(milestoneId) ? 'Completed' : 'Pending'}: ${project.steps[index].title}`, { indent: 6 })
    }
  }

  heading('Verification note')
  line('This record was generated from progress stored locally on this device. A teacher or guardian should review project evidence and confirm completion requirements.')

  document.save('ShikshaAI-learning-record.pdf')
}
