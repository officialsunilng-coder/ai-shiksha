import { useEffect, useState } from 'react'
import {
  Award,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  FlaskConical,
  FolderKanban,
  Home,
  Lightbulb,
  LockKeyhole,
  Menu,
  Moon,
  Play,
  Search,
  Send,
  Save,
  Settings,
  Sparkles,
  Sun,
  Target,
  Trophy,
  WifiOff,
  X,
} from 'lucide-react'
import { allLessons, curriculum, guidedProjects } from './data/curriculum'
import type { CurriculumLesson, GuidedProject } from './types/curriculum'
import { exportLearningRecordPdf } from './export-learning-record'
import { MLStudio } from './MLStudio'
import { offlineModel } from './offline-model'
import './App.css'

type View = 'home' | 'learn' | 'projects' | 'studio' | 'tutor' | 'progress'
type TutorMode = 'learn' | 'homework' | 'project' | 'quiz'
type Scores = Record<string, number>
type ProjectProgress = Record<string, string[]>

const navigation = [
  { id: 'home' as View, label: 'Home', icon: Home },
  { id: 'learn' as View, label: 'AI Course', icon: BookOpen },
  { id: 'projects' as View, label: 'Projects', icon: FolderKanban },
  { id: 'studio' as View, label: 'ML Studio', icon: FlaskConical },
  { id: 'tutor' as View, label: 'AI Tutor', icon: Bot },
  { id: 'progress' as View, label: 'Progress', icon: Award },
]

function loadJson<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) as T : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [view, setView] = useState<View>('home')
  const [selectedLesson, setSelectedLesson] = useState<CurriculumLesson | null>(null)
  const [selectedProject, setSelectedProject] = useState<GuidedProject | null>(null)
  const [completed, setCompleted] = useState<string[]>(() => loadJson('shiksha-progress-v2', []))
  const [scores, setScores] = useState<Scores>(() => loadJson('shiksha-scores-v2', {}))
  const [projectProgress, setProjectProgress] = useState<ProjectProgress>(() => loadJson('shiksha-projects-v2', {}))
  const [dark, setDark] = useState(() => localStorage.getItem('shiksha-theme') === 'dark')
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [tutorMode, setTutorMode] = useState<TutorMode>('learn')
  const [tutorSeed, setTutorSeed] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('shiksha-theme', dark ? 'dark' : 'light')
  }, [dark])
  useEffect(() => localStorage.setItem('shiksha-progress-v2', JSON.stringify(completed)), [completed])
  useEffect(() => localStorage.setItem('shiksha-scores-v2', JSON.stringify(scores)), [scores])
  useEffect(() => localStorage.setItem('shiksha-projects-v2', JSON.stringify(projectProgress)), [projectProgress])

  const navigate = (next: View) => {
    setSelectedLesson(null)
    setSelectedProject(null)
    setView(next)
    setMenuOpen(false)
  }

  const openLesson = (lesson: CurriculumLesson) => {
    setSelectedLesson(lesson)
    setView('learn')
  }

  const openTutor = (mode: TutorMode, seed = '') => {
    setTutorMode(mode)
    setTutorSeed(seed)
    setView('tutor')
    setSelectedProject(null)
  }

  const recordScore = (lessonId: string, score: number) => {
    setScores((current) => ({ ...current, [lessonId]: Math.max(current[lessonId] || 0, score) }))
    if (score >= 70) setCompleted((current) => current.includes(lessonId) ? current : [...current, lessonId])
  }

  const updateProjectProgress = (projectId: string, stepIds: string[]) => {
    setProjectProgress((current) => ({ ...current, [projectId]: stepIds }))
  }

  return (
    <div className="app-shell">
      <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <div className="brand-mark"><img src="./shikshaai-icon.png" alt="" /></div>
          <div><strong>AI Shiksha</strong><span>Curiosity has no Zipcode</span></div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button>
        </div>
        <nav aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={view === id ? 'nav-item active' : 'nav-item'} onClick={() => navigate(id)}>
              <Icon size={20} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="offline-card">
          <WifiOff size={20} />
          <div><strong>100% offline</strong><span>Course, projects, progress, and AI tutor stay on this device.</span></div>
        </div>
        <button className="nav-item settings-button"><Settings size={20} /><span>Settings</span></button>
      </aside>

      {menuOpen && <button className="scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <main>
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button>
          <div className="search">
            <Search size={18} />
            <input
              aria-label="Search the AI course"
              placeholder="Search AI lessons and topics..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                if (event.target.value.trim()) navigate('learn')
              }}
            />
          </div>
          <div className="top-actions">
            <span className="offline-pill"><WifiOff size={15} /> Offline ready</span>
            <button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle color theme">{dark ? <Sun /> : <Moon />}</button>
            <div className="avatar">SN</div>
          </div>
        </header>

        <div className="page">
          {view === 'home' && <HomeView completed={completed} scores={scores} projectProgress={projectProgress} openLesson={openLesson} navigate={navigate} openTutor={openTutor} />}
          {view === 'learn' && (selectedLesson
            ? <LessonView lesson={selectedLesson} bestScore={scores[selectedLesson.id] || 0} onBack={() => setSelectedLesson(null)} onScore={recordScore} openTutor={openTutor} />
            : <LearnView completed={completed} scores={scores} search={search} openLesson={openLesson} />)}
          {view === 'projects' && (selectedProject
            ? <ProjectDetail project={selectedProject} completedSteps={projectProgress[selectedProject.id] || []} onBack={() => setSelectedProject(null)} onProgress={updateProjectProgress} openTutor={openTutor} />
            : <ProjectsView projectProgress={projectProgress} openProject={setSelectedProject} />)}
          {view === 'studio' && <MLStudio />}
          {view === 'tutor' && <TutorView initialMode={tutorMode} seed={tutorSeed} />}
          {view === 'progress' && <ProgressView completed={completed} scores={scores} projectProgress={projectProgress} openLesson={openLesson} />}
        </div>
      </main>
    </div>
  )
}

function HomeView({ completed, scores, projectProgress, openLesson, navigate, openTutor }: {
  completed: string[]
  scores: Scores
  projectProgress: ProjectProgress
  openLesson: (lesson: CurriculumLesson) => void
  navigate: (view: View) => void
  openTutor: (mode: TutorMode, seed?: string) => void
}) {
  const progress = Math.round((completed.length / allLessons.length) * 100)
  const nextLesson = allLessons.find((item) => !completed.includes(item.id)) || allLessons[0]
  const averageScore = Object.values(scores).length
    ? Math.round(Object.values(scores).reduce((total, score) => total + score, 0) / Object.values(scores).length)
    : 0
  const activeProjects = Object.values(projectProgress).filter((steps) => steps.length > 0).length

  return (
    <>
      <section className="welcome branded-welcome">
        <img className="welcome-banner" src="./shikshaai-banner.png" alt="AI Shiksha — Every mind deserves a chance. Knowledge belongs to everyone. Ideas can come from anywhere." />
        <div className="welcome-content">
          <div><span className="eyebrow"><Sparkles size={16} /> Complete offline AI pathway · Grades 5–10</span><p>Learn AI concepts, train your own models, build projects, and prove your knowledge through assessments.</p></div>
          <button className="primary" onClick={() => openLesson(nextLesson)}>Continue course <ChevronRight size={18} /></button>
        </div>
      </section>

      <section className="stats-grid">
        <article><span className="stat-icon orange"><BookOpen /></span><div><strong>{completed.length}/{allLessons.length}</strong><span>Lessons mastered</span></div></article>
        <article><span className="stat-icon green"><ClipboardCheck /></span><div><strong>{averageScore || '—'}{averageScore ? '%' : ''}</strong><span>Average assessment</span></div></article>
        <article><span className="stat-icon purple"><FolderKanban /></span><div><strong>{activeProjects}/5</strong><span>Projects started</span></div></article>
        <article className="progress-stat"><div><strong>{progress}%</strong><span>AI pathway complete</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></article>
      </section>

      <div className="learning-path-callout">
        <div><Target /><span><strong>Your next step</strong><small>Module {curriculum.find((module) => module.id === nextLesson.moduleId)?.order}: {nextLesson.title}</small></span></div>
        <button onClick={() => openLesson(nextLesson)}>Start lesson <ChevronRight size={16} /></button>
      </div>

      <SectionTitle title="AI learning pathway" action="Open full course" onAction={() => navigate('learn')} />
      <div className="module-strip">
        {curriculum.map((module) => {
          const done = module.lessons.filter((item) => completed.includes(item.id)).length
          return <button key={module.id} onClick={() => openLesson(module.lessons.find((item) => !completed.includes(item.id)) || module.lessons[0])}>
            <span style={{ background: module.color }}>{module.order}</span>
            <div><small>{done}/{module.lessons.length} complete</small><strong>{module.title}</strong><em>{module.description}</em></div>
          </button>
        })}
      </div>

      <SectionTitle title="Learn by doing" />
      <div className="feature-grid">
        <button onClick={() => navigate('projects')}><FolderKanban /><div><strong>Guided AI projects</strong><span>Build evidence at every milestone</span></div><ChevronRight /></button>
        <button onClick={() => navigate('studio')}><FlaskConical /><div><strong>Train your own model</strong><span>Classify text or images and cluster numbers</span></div><ChevronRight /></button>
        <button onClick={() => openTutor('homework')}><Bot /><div><strong>Homework coach</strong><span>Hints, explanations, and checking</span></div><ChevronRight /></button>
        <button onClick={() => openTutor('quiz')}><Trophy /><div><strong>Practice with AI</strong><span>Adaptive questions without internet</span></div><ChevronRight /></button>
      </div>
    </>
  )
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <div className="section-title"><h2>{title}</h2>{action && <button onClick={onAction}>{action} <ChevronRight size={16} /></button>}</div>
}

function LearnView({ completed, scores, search, openLesson }: { completed: string[]; scores: Scores; search: string; openLesson: (lesson: CurriculumLesson) => void }) {
  const [grade, setGrade] = useState<number | 'all'>('all')
  const query = search.trim().toLowerCase()
  const visibleModules = curriculum.map((module) => ({
    ...module,
    lessons: module.lessons.filter((item) => {
      const gradeMatches = grade === 'all' || (grade >= item.gradeMin && grade <= item.gradeMax)
      const searchMatches = !query || `${item.title} ${item.summary} ${item.objectives.join(' ')} ${item.vocabulary.map((entry) => entry.term).join(' ')}`.toLowerCase().includes(query)
      return gradeMatches && searchMatches
    }),
  })).filter((module) => module.lessons.length)

  return (
    <>
      <div className="page-heading"><span className="eyebrow"><BookOpen size={16} /> Offline AI academy</span><h1>From first ideas to complete AI projects</h1><p>Six connected modules, 24 lessons, assessments, and evidence-based progression for grades 5–10.</p></div>
      <div className="filter-row">
        <button className={grade === 'all' ? 'selected' : ''} onClick={() => setGrade('all')}>All grades</button>
        {[5, 6, 7, 8, 9, 10].map((item) => <button key={item} className={grade === item ? 'selected' : ''} onClick={() => setGrade(item)}>Grade {item}</button>)}
      </div>
      {visibleModules.length === 0 && <div className="empty-state"><Search /><h2>No lessons found</h2><p>Try a different course topic or grade.</p></div>}
      <div className="course-roadmap">
        {visibleModules.map((module) => {
          const completeCount = module.lessons.filter((item) => completed.includes(item.id)).length
          return <section className="course-module" key={module.id}>
            <div className="module-heading">
              <span style={{ background: module.color }}>{module.order}</span>
              <div><small>{module.gradeBand} · {completeCount}/{module.lessons.length} mastered</small><h2>{module.title}</h2><p>{module.description}</p></div>
              <div className="module-progress"><i style={{ width: `${(completeCount / module.lessons.length) * 100}%`, background: module.color }} /></div>
            </div>
            <div className="lesson-grid wide">
              {module.lessons.map((item) => <LessonCard key={item.id} lesson={item} done={completed.includes(item.id)} score={scores[item.id]} onClick={() => openLesson(item)} />)}
            </div>
          </section>
        })}
      </div>
    </>
  )
}

function LessonCard({ lesson, done, score, onClick }: { lesson: CurriculumLesson; done: boolean; score?: number; onClick: () => void }) {
  return (
    <button className="lesson-card" onClick={onClick}>
      <span className="lesson-cover" style={{ background: lesson.color }}>
        <BrainCircuit />
        <b>Lesson {lesson.order}</b>
        {done && <i><Check size={15} /></i>}
      </span>
      <span className="lesson-body">
        <small>Grades {lesson.gradeMin}–{lesson.gradeMax} · {lesson.difficulty}</small>
        <strong>{lesson.title}</strong>
        <span>{lesson.summary}</span>
        <em><Play size={13} /> {lesson.minutes} min {score !== undefined && <>· Best score {score}%</>}</em>
      </span>
    </button>
  )
}

function LessonView({ lesson, bestScore, onBack, onScore, openTutor }: {
  lesson: CurriculumLesson
  bestScore: number
  onBack: () => void
  onScore: (lessonId: string, score: number) => void
  openTutor: (mode: TutorMode, seed?: string) => void
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<number | null>(null)
  const isQuiz = step === lesson.sections.length
  const section = lesson.sections[step]

  const submitQuiz = () => {
    const correct = lesson.quiz.filter((question) => answers[question.id] === question.correctIndex).length
    const score = Math.round((correct / lesson.quiz.length) * 100)
    setResult(score)
    onScore(lesson.id, score)
  }

  return (
    <article className="lesson-detail course-player">
      <button className="back-link" onClick={onBack}>← Back to course</button>
      <div className="lesson-banner" style={{ background: lesson.color }}>
        <BrainCircuit size={48} />
        <div><small>{lesson.difficulty} · Grades {lesson.gradeMin}–{lesson.gradeMax}</small><h1>{lesson.title}</h1><span>{lesson.minutes} minutes · {lesson.sections.length} learning steps + assessment</span></div>
      </div>

      <div className="lesson-stepper">
        {lesson.sections.map((item, index) => <button key={item.title} className={step === index ? 'active' : step > index ? 'complete' : ''} onClick={() => setStep(index)}><span>{step > index ? <Check size={14} /> : index + 1}</span><em>{item.title}</em></button>)}
        <button className={isQuiz ? 'active' : result !== null ? 'complete' : ''} onClick={() => setStep(lesson.sections.length)}><span>{result !== null ? <Check size={14} /> : lesson.sections.length + 1}</span><em>Assessment</em></button>
      </div>

      {!isQuiz && section && <div className="lesson-copy structured">
        {step === 0 && <div className="objective-panel"><Target /><div><h3>By the end, you can:</h3><ul>{lesson.objectives.map((item) => <li key={item}>{item}</li>)}</ul></div></div>}
        <span className="eyebrow">Step {step + 1} of {lesson.sections.length}</span>
        <h2>{section.title}</h2>
        <p className="lesson-body">{section.body}</p>
        <div className="activity-box"><Lightbulb /><div><strong>Try it yourself</strong><p className="lesson-activity">{section.activity}</p></div></div>
        <div className="vocabulary"><h3>Key words</h3>{lesson.vocabulary.map((item) => <div key={item.term}><strong>{item.term}</strong><span>{item.meaning}</span></div>)}</div>
        <div className="lesson-actions">
          <button disabled={step === 0} onClick={() => setStep((current) => current - 1)}><ChevronLeft /> Previous</button>
          <button className="coach-button" onClick={() => openTutor('learn', `Please help me understand the lesson “${lesson.title}”, especially “${section.title}”.`)}><Bot /> Ask tutor</button>
          <button className="primary" onClick={() => setStep((current) => current + 1)}>{step === lesson.sections.length - 1 ? 'Take assessment' : 'Next step'} <ChevronRight /></button>
        </div>
      </div>}

      {isQuiz && <div className="lesson-copy structured">
        <span className="eyebrow"><ClipboardCheck size={16} /> Mastery assessment</span>
        <h2>Show what you learned</h2>
        <p>Score at least 70% to master this lesson. Read each explanation and retry whenever needed.</p>
        <div className="quiz-list">
          {lesson.quiz.map((question, index) => <fieldset key={question.id}>
            <legend>{index + 1}. {question.prompt}</legend>
            {question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => { setAnswers((current) => ({ ...current, [question.id]: optionIndex })); setResult(null) }} /><span>{option}</span></label>)}
            {result !== null && <p className={answers[question.id] === question.correctIndex ? 'answer correct' : 'answer incorrect'}>{question.explanation}</p>}
          </fieldset>)}
        </div>
        {result !== null && <div className={result >= 70 ? 'assessment-result pass' : 'assessment-result retry'}>{result >= 70 ? <Trophy /> : <Target />}<div><strong>{result}% — {result >= 70 ? 'Lesson mastered!' : 'Review and try again'}</strong><span>{result >= 70 ? 'Your progress was saved on this device.' : 'Return to any step, then retake the assessment.'}</span>{bestScore > result && <small>Best score: {bestScore}%</small>}</div></div>}
        <div className="lesson-actions"><button onClick={() => setStep(lesson.sections.length - 1)}><ChevronLeft /> Review lesson</button><button className="primary" disabled={Object.keys(answers).length !== lesson.quiz.length} onClick={submitQuiz}>{result === null ? 'Submit assessment' : 'Retake assessment'} <ClipboardCheck /></button></div>
      </div>}
    </article>
  )
}

function ProjectsView({ projectProgress, openProject }: { projectProgress: ProjectProgress; openProject: (project: GuidedProject) => void }) {
  return (
    <>
      <div className="page-heading"><span className="eyebrow"><FolderKanban size={16} /> Build a real portfolio</span><h1>AI Project Studio</h1><p>Follow milestones, save evidence, ask the offline coach, and evaluate your work with clear rubrics.</p></div>
      <SectionTitle title="Guided projects" />
      <div className="project-grid">
        {guidedProjects.map((project) => {
          const done = projectProgress[project.id]?.length || 0
          return <button key={project.id} className="project-card" onClick={() => openProject(project)}>
            <span className={`difficulty ${project.difficulty.toLowerCase()}`}>{project.difficulty}</span>
            <FolderKanban />
            <small>{project.gradeBand} · {project.duration}</small>
            <strong>{project.title}</strong>
            <p>{project.summary}</p>
            <div className="project-progress"><i style={{ width: `${(done / project.steps.length) * 100}%` }} /></div>
            <em>{done}/{project.steps.length} milestones complete <ChevronRight size={15} /></em>
          </button>
        })}
      </div>
    </>
  )
}

function ProjectDetail({ project, completedSteps, onBack, onProgress, openTutor }: {
  project: GuidedProject
  completedSteps: string[]
  onBack: () => void
  onProgress: (projectId: string, stepIds: string[]) => void
  openTutor: (mode: TutorMode, seed?: string) => void
}) {
  const [notes, setNotes] = useState(() => localStorage.getItem(`shiksha-project-notes-${project.id}`) || '')
  const [savedNotes, setSavedNotes] = useState(notes)
  const toggleStep = (stepId: string) => {
    const next = completedSteps.includes(stepId) ? completedSteps.filter((item) => item !== stepId) : [...completedSteps, stepId]
    onProgress(project.id, next)
  }
  const saveNotes = () => {
    localStorage.setItem(`shiksha-project-notes-${project.id}`, notes)
    setSavedNotes(notes)
  }
  return (
    <article className="project-detail">
      <button className="back-link" onClick={onBack}>← Back to projects</button>
      <div className="project-hero"><span className={`difficulty ${project.difficulty.toLowerCase()}`}>{project.difficulty}</span><h1>{project.title}</h1><p>{project.summary}</p><div>{project.gradeBand} · {project.duration} · {project.skills.join(' · ')}</div></div>
      <div className="project-layout">
        <div>
          <section className="project-outcome"><Target /><div><strong>Final outcome</strong><p>{project.outcome}</p></div></section>
          {project.essentialQuestion && <section className="project-learning-brief"><span className="eyebrow">Essential question</span><h2>{project.essentialQuestion}</h2><p>{project.studentBrief}</p><h3>Worked example</h3><p>{project.workedExample}</p></section>}
          {project.deliverables && <section className="project-deliverables"><h2>What you must produce</h2><ol>{project.deliverables.map((item) => <li key={item}>{item}</li>)}</ol></section>}
          <h2>Project milestones</h2>
          <div className="milestone-list">
            {project.steps.map((step, index) => {
              const id = `${project.id}-${index}`
              const done = completedSteps.includes(id)
              return <article key={id} className={done ? 'done' : ''}>
                <button onClick={() => toggleStep(id)} aria-label={done ? 'Mark incomplete' : 'Mark complete'}>{done ? <Check /> : index + 1}</button>
                <div><h3>{step.title}</h3><p>{step.instructions}</p>{step.tasks && <><strong className="milestone-label">Complete these tasks</strong><ol>{step.tasks.map((task) => <li key={task}>{task}</li>)}</ol></>}{step.qualityChecks && <><strong className="milestone-label">Quality checks</strong><ul>{step.qualityChecks.map((check) => <li key={check}>{check}</li>)}</ul></>}<small><strong>Evidence to save:</strong> {step.evidence}</small></div>
              </article>
            })}
          </div>
          <div className="project-notes"><h2>Project journal</h2><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Record decisions, tests, failures, evidence, and next steps. Notes stay on this device." /><div className="journal-actions"><span>{notes === savedNotes ? 'Journal saved on this device.' : 'Unsaved changes'}</span><button className="primary" disabled={notes === savedNotes} onClick={saveNotes}><Save /> Save journal</button></div></div>
        </div>
        <aside className="project-sidebar">
          <div className="project-score"><strong>{Math.round((completedSteps.length / project.steps.length) * 100)}%</strong><span>Milestones completed</span><div className="progress-track"><i style={{ width: `${(completedSteps.length / project.steps.length) * 100}%` }} /></div></div>
          <button className="primary coach-full" onClick={() => openTutor('project', `Coach me through the “${project.title}” project. I have completed ${completedSteps.length} of ${project.steps.length} milestones.`)}><Bot /> Ask project coach</button>
          <h3>Success rubric</h3>
          {project.rubric.map((item) => <div className="rubric-item" key={item.criterion}><strong>{item.criterion}</strong><span>{item.excellent}</span></div>)}
          <h3>Materials</h3>
          <ul>{project.materials.map((item) => <li key={item}>{item}</li>)}</ul>
          {project.safety && <><h3>Safety and responsibility</h3><ul>{project.safety.map((item) => <li key={item}>{item}</li>)}</ul></>}
        </aside>
      </div>
    </article>
  )
}

const tutorModes: Array<{ id: TutorMode; label: string; description: string }> = [
  { id: 'learn', label: 'Learn a concept', description: 'Explain ideas with examples' },
  { id: 'homework', label: 'Homework coach', description: 'Guide without copying' },
  { id: 'project', label: 'Project coach', description: 'Plan, build, test, improve' },
  { id: 'quiz', label: 'Quiz me', description: 'Practice and get feedback' },
]

const tutorGreetings: Record<TutorMode, string> = {
  learn: 'Tell me what you want to understand. I can explain it step by step at your grade level.',
  homework: 'Show me the homework question and what you have tried. I will give hints, explain the method, and check your work instead of simply doing it for you.',
  project: 'Tell me your project idea or current milestone. I will help you define, build, test, document, and improve it.',
  quiz: 'Tell me the topic and grade. I will ask one question at a time, wait for your answer, and explain the result.',
}

function TutorView({ initialMode, seed }: { initialMode: TutorMode; seed: string }) {
  const [mode, setMode] = useState<TutorMode>(initialMode)
  const [question, setQuestion] = useState(seed)
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [modelName, setModelName] = useState('Offline Granite model')
  const [modelStatus, setModelStatus] = useState<'checking' | 'ready' | 'unavailable'>(() => offlineModel.isAvailable() ? 'checking' : 'unavailable')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: tutorGreetings[initialMode] },
  ])

  useEffect(() => {
    if (!offlineModel.isAvailable()) return
    offlineModel.getModelStatus()
      .then((status) => {
        setModelName(status.name)
        setModelStatus(status.installed ? 'ready' : 'unavailable')
      })
      .catch(() => setModelStatus('unavailable'))
  }, [])

  const changeMode = (next: TutorMode) => {
    setMode(next)
    setMessages([{ role: 'assistant', text: tutorGreetings[next] }])
    setQuestion('')
  }

  const relevantContext = (text: string) => {
    const stopWords = new Set([
      'about', 'especially', 'explain', 'help', 'lesson', 'please', 'tell',
      'that', 'this', 'understand', 'what', 'when', 'where', 'which', 'with',
    ])
    const words = [...new Set(
      (text.toLowerCase().match(/[a-z0-9]+/g) || [])
        .filter((word) => word.length > 3 && !stopWords.has(word)),
    )]
    const ranked = allLessons.map((item) => {
      const title = item.title.toLowerCase()
      const summary = `${item.summary} ${item.objectives.join(' ')}`.toLowerCase()
      const sections = item.sections.map((section) => `${section.title} ${section.body}`).join(' ').toLowerCase()
      const titleScore = words.filter((word) => title.includes(word)).length * 6
      const summaryScore = words.filter((word) => summary.includes(word)).length * 3
      const sectionScore = words.filter((word) => sections.includes(word)).length
      const phraseScore = text.toLowerCase().includes(title) ? 20 : 0
      return { item, score: titleScore + summaryScore + sectionScore + phraseScore }
    }).sort((a, b) => b.score - a.score)
    const selected = ranked.filter((item) => item.score >= 4).slice(0, 2).map(({ item }) =>
      `${item.title}\n${item.sections.map((section) => `${section.title}: ${section.body}`).join('\n')}`,
    )
    return selected.join('\n\n')
  }

  const ask = async () => {
    const submittedQuestion = question.trim()
    if (!submittedQuestion || loading) return
    const previousMessages = messages.slice(-8)
    setMessages((items) => [...items, { role: 'user', text: submittedQuestion }])
    setQuestion('')
    setLoading(true)
    setStreaming(false)

    let streamingStarted = false
    try {
      if (!offlineModel.isAvailable()) throw new Error('The offline model is available in an installed desktop or mobile application.')
      const result = await offlineModel.ask(
        submittedQuestion,
        previousMessages,
        mode,
        relevantContext(submittedQuestion),
        (text) => {
          if (!streamingStarted) {
            streamingStarted = true
            setStreaming(true)
          }
          setMessages((items) => {
            if (items[items.length - 1]?.role !== 'assistant') {
              return [...items, { role: 'assistant', text }]
            }
            return items.map((item, index) =>
              index === items.length - 1 ? { ...item, text: item.text + text } : item,
            )
          })
        },
      )
      setMessages((items) => streamingStarted
        ? items.map((item, index) => index === items.length - 1 ? { ...item, text: result.answer } : item)
        : [...items, { role: 'assistant', text: result.answer }])
      setModelStatus('ready')
    } catch (error) {
      console.error('Offline tutor request failed.', error)
      const failureMessage = 'I could not answer that question just now. Please try asking it in a different way.'
      setMessages((items) => streamingStarted
        ? items.map((item, index) => index === items.length - 1 ? { ...item, text: failureMessage } : item)
        : [...items, { role: 'assistant', text: failureMessage }])
      const status = offlineModel.isAvailable()
        ? await offlineModel.getModelStatus().catch(() => null)
        : null
      setModelStatus(status?.installed ? 'ready' : 'unavailable')
    } finally {
      setStreaming(false)
      setLoading(false)
    }
  }

  return (
    <div className="tutor-layout expanded">
      <div className="page-heading"><span className="eyebrow"><Bot size={16} /> Private offline learning coach</span><h1>Learn, solve, build, and practice</h1><p>{modelName} runs on this device and receives relevant course material with each question.</p><span className={`model-status ${modelStatus}`}>{modelStatus === 'checking' ? 'Checking model…' : modelStatus === 'ready' ? `${modelName} installed` : 'Model unavailable'}</span></div>
      <div className="tutor-mode-grid">{tutorModes.map((item) => <button key={item.id} className={mode === item.id ? 'active' : ''} onClick={() => changeMode(item.id)}><strong>{item.label}</strong><span>{item.description}</span></button>)}</div>
      <div className="chat">
        <div className="messages">{messages.map((message, index) => <div key={index} className={`message ${message.role}`}><span>{message.role === 'assistant' ? <Bot size={18} /> : 'You'}</span><p>{message.text}{streaming && index === messages.length - 1 && message.role === 'assistant' && <span className="streaming-cursor" aria-hidden="true" />}</p></div>)}{loading && !streaming && <div className="message assistant thinking"><span><Bot size={18} /></span><p className="typing-dots" aria-label="Thinking"><i /><i /><i /></p></div>}</div>
        <div className="suggestions">
          {(mode === 'homework' ? ['Help me understand this math problem', 'Check my science answer', 'Give me a hint, not the final answer']
            : mode === 'project' ? ['Help me choose an AI project', 'Review my project plan', 'How should I test my model?']
              : mode === 'quiz' ? ['Quiz me on machine learning for grade 7', 'Test me on responsible AI', 'Give me a project-readiness quiz']
                : ['What is machine learning?', 'Explain neural networks simply', 'How do language models work?'])
            .map((item) => <button key={item} onClick={() => setQuestion(item)}>{item}</button>)}
        </div>
        <div className="composer"><textarea disabled={loading} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void ask() } }} placeholder={mode === 'homework' ? 'Paste the question and describe what you tried...' : mode === 'project' ? 'Describe your project or milestone...' : 'Ask your learning question...'} /><button disabled={loading || !question.trim()} onClick={() => void ask()} aria-label="Send question"><Send /></button></div>
      </div>
      <p className="tutor-safety"><LockKeyhole size={14} /> Your messages remain on this device. Verify important facts and ask a teacher or trusted adult for high-stakes guidance.</p>
    </div>
  )
}

function ProgressView({ completed, scores, projectProgress, openLesson }: { completed: string[]; scores: Scores; projectProgress: ProjectProgress; openLesson: (lesson: CurriculumLesson) => void }) {
  const lessonProgress = Math.round((completed.length / allLessons.length) * 100)
  const completedCapstone = guidedProjects.some((project) =>
    project.difficulty === 'Capstone' && (projectProgress[project.id]?.length || 0) === project.steps.length,
  )
  const courseComplete = completed.length === allLessons.length && completedCapstone

  const exportReport = () => exportLearningRecordPdf({
    completed,
    scores,
    projectProgress,
    curriculum,
    projects: guidedProjects,
    courseComplete,
  })

  return (
    <>
      <div className="page-heading"><span className="eyebrow"><Award size={16} /> Local learner record</span><h1>Mastery and project evidence</h1><p>Track every assessment and milestone. This record remains on the device and can be exported for a teacher or guardian.</p></div>
      <section className={courseComplete ? 'certificate-card complete' : 'certificate-card'}>
        <div><Award /><span><strong>{courseComplete ? 'AI pathway completed' : `${lessonProgress}% of the AI pathway complete`}</strong><small>{courseComplete ? 'All lesson and capstone requirements are satisfied.' : 'Master every lesson and finish one capstone project to complete the pathway.'}</small></span></div>
        <button onClick={exportReport}>Export PDF record <Download /></button>
      </section>
      <div className="progress-summary">
        <article><strong>{completed.length}</strong><span>of {allLessons.length} lessons mastered</span></article>
        <article><strong>{Object.values(scores).filter((score) => score >= 70).length}</strong><span>passing assessments</span></article>
        <article><strong>{completedCapstone ? 'Yes' : 'Not yet'}</strong><span>capstone completed</span></article>
      </div>
      <div className="module-report">
        {curriculum.map((module) => {
          const moduleCompleted = module.lessons.filter((item) => completed.includes(item.id)).length
          const moduleScores = module.lessons.map((item) => scores[item.id]).filter((score): score is number => score !== undefined)
          const average = moduleScores.length ? Math.round(moduleScores.reduce((sum, score) => sum + score, 0) / moduleScores.length) : 0
          return <section key={module.id}>
            <div className="report-heading"><span style={{ background: module.color }}>{module.order}</span><div><h2>{module.title}</h2><small>{moduleCompleted}/{module.lessons.length} mastered · {average ? `${average}% average` : 'No assessments yet'}</small></div></div>
            <div className="report-lessons">{module.lessons.map((item) => <button type="button" key={item.id} onClick={() => openLesson(item)} aria-label={`Open lesson: ${item.title}`}><span className={completed.includes(item.id) ? 'mastered' : ''}>{completed.includes(item.id) ? <Check /> : <Play />}</span><strong>{item.title}</strong><em>{scores[item.id] !== undefined ? `${scores[item.id]}%` : 'Not attempted'}</em></button>)}</div>
          </section>
        })}
      </div>
      <SectionTitle title="Project portfolio" />
      <div className="project-report">{guidedProjects.map((project) => { const done = projectProgress[project.id]?.length || 0; return <article key={project.id}><FolderKanban /><div><strong>{project.title}</strong><span>{done}/{project.steps.length} milestones · {project.difficulty}</span></div><em>{Math.round((done / project.steps.length) * 100)}%</em></article> })}</div>
    </>
  )
}

export default App
