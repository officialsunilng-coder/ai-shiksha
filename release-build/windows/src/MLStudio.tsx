import { useEffect, useMemo, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import {
  Boxes,
  BrainCircuit,
  Camera,
  Check,
  Download,
  FileUp,
  Image,
  Images,
  Plus,
  Pencil,
  Save,
  Sparkles,
  Trash2,
  Type,
} from 'lucide-react'
import './MLStudio.css'

type StudioMode = 'text' | 'image' | 'cluster'
type Label = { id: string; name: string; color: string }
type TextExample = { id: string; labelId: string; text: string }
type ImageExample = { id: string; labelId: string; name: string; thumbnail: string; features: number[] }
type NumberPoint = { id: string; name: string; x: number; y: number; cluster?: number }
type Centroid = { x: number; y: number }
type StudioProject = {
  id: string
  name: string
  mode: StudioMode
  labels: Label[]
  textExamples: TextExample[]
  imageExamples: ImageExample[]
  imageFeatureVersion?: number
  points: NumberPoint[]
  clusterCount: number
  centroids?: Centroid[]
  trainedSignature?: string
  updatedAt: number
}
type Prediction = { label: string; confidence: number; color: string }

const storageKey = 'shiksha-ml-studio-v1'
const colors = ['#e36341', '#287b68', '#7950a0', '#c28b2c', '#3f6fb2', '#b54f72']
const imageFeatureVersion = 2
let visionModelPromise: Promise<tf.LayersModel> | null = null

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
const modeName = (mode: StudioMode) => mode === 'text' ? 'Text classifier' : mode === 'image' ? 'Image classifier' : 'Number clustering'

function createProject(mode: StudioMode): StudioProject {
  return {
    id: makeId(),
    name: `My ${modeName(mode).toLowerCase()}`,
    mode,
    labels: mode === 'cluster'
      ? []
      : [{ id: makeId(), name: 'Category 1', color: colors[0] }, { id: makeId(), name: 'Category 2', color: colors[1] }],
    textExamples: [],
    imageExamples: [],
    imageFeatureVersion: mode === 'image' ? imageFeatureVersion : undefined,
    points: [],
    clusterCount: 2,
    updatedAt: Date.now(),
  }
}

function loadProjects(): StudioProject[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function signature(project: StudioProject) {
  if (project.mode === 'text') return JSON.stringify([project.labels, project.textExamples])
  if (project.mode === 'image') return JSON.stringify([project.imageFeatureVersion, project.labels, project.imageExamples.map(({ id, labelId, features }) => ({ id, labelId, features }))])
  return JSON.stringify([project.clusterCount, project.points.map(({ id, name, x, y }) => ({ id, name, x, y }))])
}

function tokenize(text: string) {
  return text.toLowerCase().match(/[a-z0-9']+/g) || []
}

function textPrediction(project: StudioProject, text: string): Prediction[] {
  const vocabulary = new Set(project.textExamples.flatMap((item) => tokenize(item.text)))
  const observedWords = [...new Set(tokenize(text).filter((word) => vocabulary.has(word)))]
  if (!observedWords.length) return []

  const totalExamples = Math.max(1, project.textExamples.length)
  const scores = project.labels.map((label) => {
    const examples = project.textExamples.filter((item) => item.labelId === label.id)
    const documentCounts = new Map<string, number>()
    examples.forEach((example) => {
      new Set(tokenize(example.text)).forEach((word) => {
        documentCounts.set(word, (documentCounts.get(word) || 0) + 1)
      })
    })
    let score = Math.log((examples.length + 1) / (totalExamples + project.labels.length))
    observedWords.forEach((word) => {
      score += Math.log(((documentCounts.get(word) || 0) + 1) / (examples.length + 2))
    })
    return { label: label.name, color: label.color, score }
  })
  const peak = Math.max(...scores.map((item) => item.score))
  const weights = scores.map((item) => Math.exp(item.score - peak))
  const total = weights.reduce((sum, value) => sum + value, 0)
  return scores.map((item, index) => ({ label: item.label, color: item.color, confidence: weights[index] / total }))
    .sort((a, b) => b.confidence - a.confidence)
}

function imagePrediction(project: StudioProject, features: number[]): Prediction[] {
  const scores = project.labels.map((label) => {
    const examples = project.imageExamples.filter((item) => item.labelId === label.id)
    const centroid = features.map((_, index) => examples.reduce((sum, item) => sum + item.features[index], 0) / examples.length)
    const centroidLength = Math.sqrt(centroid.reduce((sum, value) => sum + (value ** 2), 0)) || 1
    const similarity = features.reduce((sum, value, index) => sum + (value * centroid[index] / centroidLength), 0)
    return { label: label.name, color: label.color, score: Math.exp(similarity * 10) }
  })
  const total = scores.reduce((sum, item) => sum + item.score, 0)
  return scores.map((item) => ({ label: item.label, color: item.color, confidence: item.score / total }))
    .sort((a, b) => b.confidence - a.confidence)
}

function runKMeans(points: NumberPoint[], count: number) {
  let centroids = points.slice(0, count).map(({ x, y }) => ({ x, y }))
  let assignments = points.map(() => 0)
  for (let iteration = 0; iteration < 25; iteration++) {
    assignments = points.map((point) => centroids.reduce((best, centroid, index) => {
      const distance = ((point.x - centroid.x) ** 2) + ((point.y - centroid.y) ** 2)
      return distance < best.distance ? { index, distance } : best
    }, { index: 0, distance: Number.POSITIVE_INFINITY }).index)
    centroids = centroids.map((centroid, index) => {
      const members = points.filter((_, pointIndex) => assignments[pointIndex] === index)
      return members.length
        ? { x: members.reduce((sum, item) => sum + item.x, 0) / members.length, y: members.reduce((sum, item) => sum + item.y, 0) / members.length }
        : centroid
    })
  }
  return { centroids, points: points.map((point, index) => ({ ...point, cluster: assignments[index] })) }
}

async function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new window.Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('The image format is not supported.'))
    element.src = source
  })
}

async function loadVisionModel() {
  if (!visionModelPromise) {
    visionModelPromise = (async () => {
      await tf.ready()
      const model = await tf.loadLayersModel(`${import.meta.env.BASE_URL}models/mobilenet-v1-025/model.json`)
      return tf.model({ inputs: model.inputs, outputs: model.getLayer('global_average_pooling2d_1').output })
    })().catch((error) => {
      visionModelPromise = null
      throw error
    })
  }
  return visionModelPromise
}

async function extractVisionFeatures(image: HTMLImageElement) {
  const model = await loadVisionModel()
  const embedding = tf.tidy(() => {
    const pixels = tf.browser.fromPixels(image).toFloat()
    const resized = tf.image.resizeBilinear(pixels, [224, 224], true)
    const normalized = resized.div(127.5).sub(1)
    return model.predict(normalized.expandDims(0)) as tf.Tensor
  })
  try {
    const values = Array.from(await embedding.data())
    const length = Math.sqrt(values.reduce((sum, value) => sum + (value ** 2), 0)) || 1
    return values.map((value) => value / length)
  } finally {
    embedding.dispose()
  }
}

async function readImage(file: File) {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('The image could not be read.'))
    reader.readAsDataURL(file)
  })
  const image = await loadImage(source)
  const features = await extractVisionFeatures(image)
  const thumbnailCanvas = document.createElement('canvas')
  thumbnailCanvas.width = 120
  thumbnailCanvas.height = 90
  const thumbnailContext = thumbnailCanvas.getContext('2d')
  if (!thumbnailContext) throw new Error('Image processing is unavailable.')
  const scale = Math.max(120 / image.width, 90 / image.height)
  const width = image.width * scale
  const height = image.height * scale
  thumbnailContext.drawImage(image, (120 - width) / 2, (90 - height) / 2, width, height)
  return { features, thumbnail: thumbnailCanvas.toDataURL('image/jpeg', .62) }
}

function downloadProject(project: StudioProject) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${project.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'ml-project'}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function MLStudio() {
  const [projects, setProjects] = useState<StudioProject[]>(loadProjects)
  const [selectedId, setSelectedId] = useState(() => projects[0]?.id || '')
  const [newLabel, setNewLabel] = useState('')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [testText, setTestText] = useState('')
  const [prediction, setPrediction] = useState<Prediction[] | null>(null)
  const [testImage, setTestImage] = useState('')
  const [pointDraft, setPointDraft] = useState({ name: '', x: '', y: '' })
  const [testPoint, setTestPoint] = useState({ x: '', y: '' })
  const [message, setMessage] = useState('Projects save automatically on this device.')
  const importRef = useRef<HTMLInputElement>(null)
  const upgradingImageProjects = useRef(new Set<string>())
  const project = projects.find((item) => item.id === selectedId)

  useEffect(() => {
    let nextMessage = 'Saved on this device.'
    try {
      localStorage.setItem(storageKey, JSON.stringify(projects))
    } catch {
      nextMessage = 'Storage is full. Export this project before adding more images.'
    }
    const statusUpdate = window.setTimeout(() => setMessage(nextMessage), 0)
    return () => window.clearTimeout(statusUpdate)
  }, [projects])

  useEffect(() => {
    projects.filter((item) =>
      item.mode === 'image'
      && item.imageExamples.length > 0
      && item.imageFeatureVersion !== imageFeatureVersion
      && !upgradingImageProjects.current.has(item.id),
    ).forEach((item) => {
      upgradingImageProjects.current.add(item.id)
      setMessage(`Upgrading visual features for ${item.name}...`)
      void Promise.all(item.imageExamples.map(async (example) => ({
        ...example,
        features: await extractVisionFeatures(await loadImage(example.thumbnail)),
      }))).then((imageExamples) => {
        setProjects((current) => current.map((candidate) => candidate.id === item.id
          ? { ...candidate, imageExamples, imageFeatureVersion, trainedSignature: undefined, updatedAt: Date.now() }
          : candidate))
        setMessage('Visual features upgraded. Train the image model again.')
      }).catch(() => {
        setMessage('The offline vision model could not upgrade this project. Reload the app and try again.')
      }).finally(() => {
        upgradingImageProjects.current.delete(item.id)
      })
    })
  }, [projects])

  const trained = project ? project.trainedSignature === signature(project) : false
  const readiness = useMemo(() => {
    if (!project) return { ready: false, text: 'Create a project to begin.' }
    if (project.mode === 'cluster') {
      return project.points.length >= project.clusterCount
        ? { ready: true, text: `${project.points.length} points are ready to group.` }
        : { ready: false, text: `Add at least ${project.clusterCount} points.` }
    }
    if (project.mode === 'image' && project.imageExamples.length > 0 && project.imageFeatureVersion !== imageFeatureVersion) {
      return { ready: false, text: 'Upgrading this project to the offline vision model...' }
    }
    const examples = project.mode === 'text' ? project.textExamples : project.imageExamples
    const missing = project.labels.filter((label) => examples.filter((item) => item.labelId === label.id).length < 2)
    return missing.length
      ? { ready: false, text: `Add at least 2 examples to: ${missing.map((item) => item.name).join(', ')}.` }
      : { ready: project.labels.length >= 2, text: `${examples.length} examples across ${project.labels.length} categories are ready.` }
  }, [project])

  const updateProject = (change: (current: StudioProject) => StudioProject, invalidate = true) => {
    setProjects((items) => items.map((item) => item.id === selectedId
      ? { ...change(item), updatedAt: Date.now(), ...(invalidate ? { trainedSignature: undefined, centroids: undefined } : {}) }
      : item))
    setPrediction(null)
  }

  const addProject = (mode: StudioMode) => {
    const created = createProject(mode)
    setProjects((items) => [...items, created])
    setSelectedId(created.id)
    setPrediction(null)
  }

  const addLabel = () => {
    if (!project || !newLabel.trim() || project.labels.length >= colors.length) return
    updateProject((current) => ({ ...current, labels: [...current.labels, { id: makeId(), name: newLabel.trim(), color: colors[current.labels.length] }] }))
    setNewLabel('')
  }

  const train = () => {
    if (!project || !readiness.ready) return
    if (project.mode === 'cluster') {
      const result = runKMeans(project.points, project.clusterCount)
      updateProject((current) => ({ ...current, points: result.points, centroids: result.centroids, trainedSignature: signature(current) }), false)
    } else {
      updateProject((current) => ({ ...current, trainedSignature: signature(current) }), false)
    }
    setMessage('Model trained and saved locally.')
  }

  const addImages = async (labelId: string, files?: FileList | null) => {
    const selected = files ? Array.from(files) : []
    if (!selected.length) return
    if (project?.imageExamples.length && project.imageFeatureVersion !== imageFeatureVersion) {
      setMessage('Wait for the existing image project to finish upgrading.')
      return
    }
    setMessage(`Analyzing ${selected.length} image${selected.length === 1 ? '' : 's'} with the offline vision model...`)
    const results = await Promise.allSettled(selected.map(async (file) => ({
      id: makeId(),
      labelId,
      name: file.name,
      ...await readImage(file),
    })))
    const added = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : [])
    const failed = results.length - added.length
    if (added.length) {
      updateProject((current) => ({ ...current, imageExamples: [...current.imageExamples, ...added], imageFeatureVersion }))
    }
    setMessage(`${added.length} image${added.length === 1 ? '' : 's'} added${failed ? `; ${failed} could not be processed` : ''}.`)
  }

  const testImageFile = async (file?: File) => {
    if (!project || !file || !trained) return
    try {
      setMessage('Analyzing the test image with the offline vision model...')
      const processed = await readImage(file)
      setTestImage(processed.thumbnail)
      setPrediction(imagePrediction(project, processed.features))
      setMessage('Prediction complete. The image stayed on this device.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The image could not be tested.')
    }
  }

  const addPoint = () => {
    if (!project) return
    const x = Number(pointDraft.x)
    const y = Number(pointDraft.y)
    if (!Number.isFinite(x) || !Number.isFinite(y)) return
    updateProject((current) => ({ ...current, points: [...current.points, { id: makeId(), name: pointDraft.name.trim() || `Point ${current.points.length + 1}`, x, y }] }))
    setPointDraft({ name: '', x: '', y: '' })
  }

  const importProject = async (file?: File) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as StudioProject
      if (!parsed || !['text', 'image', 'cluster'].includes(parsed.mode) || !Array.isArray(parsed.labels)) throw new Error()
      const imported = { ...parsed, id: makeId(), name: `${parsed.name || 'Imported project'} (imported)`, updatedAt: Date.now() }
      setProjects((items) => [...items, imported])
      setSelectedId(imported.id)
      setMessage('Project imported and saved locally.')
    } catch {
      setMessage('That file is not a valid ShikshaAI ML Studio project.')
    }
  }

  const deleteProject = () => {
    if (!project || !window.confirm(`Delete “${project.name}” from this device? Export it first if you need a backup.`)) return
    const remaining = projects.filter((item) => item.id !== project.id)
    setProjects(remaining)
    setSelectedId(remaining[0]?.id || '')
  }

  const clusterPrediction = project?.centroids && Number.isFinite(Number(testPoint.x)) && Number.isFinite(Number(testPoint.y))
    ? project.centroids.reduce((best, centroid, index) => {
      const distance = ((Number(testPoint.x) - centroid.x) ** 2) + ((Number(testPoint.y) - centroid.y) ** 2)
      return distance < best.distance ? { index, distance } : best
    }, { index: 0, distance: Number.POSITIVE_INFINITY }).index
    : null

  return (
    <div className="ml-studio">
      <div className="page-heading">
        <span className="eyebrow"><BrainCircuit size={16} /> Build machine learning yourself</span>
        <h1>Offline ML Studio</h1>
        <p>Collect examples, train a real local model, test its predictions, improve the data, and save your work—without an account or internet connection.</p>
      </div>

      <div className="studio-layout">
        <aside className="studio-projects">
          <h2>My projects</h2>
          <div className="new-project-grid">
            <button onClick={() => addProject('text')}><Type /> Text</button>
            <button onClick={() => addProject('image')}><Image /> Images</button>
            <button onClick={() => addProject('cluster')}><Boxes /> Clusters</button>
          </div>
          <div className="saved-projects">
            {projects.map((item) => <button key={item.id} className={item.id === selectedId ? 'active' : ''} onClick={() => { setSelectedId(item.id); setPrediction(null) }}>
              <strong>{item.name}</strong><span>{modeName(item.mode)}</span>
            </button>)}
            {!projects.length && <p>Create your first project above.</p>}
          </div>
          <input ref={importRef} hidden type="file" accept=".json,application/json" onChange={(event) => void importProject(event.target.files?.[0])} />
          <button className="studio-import" onClick={() => importRef.current?.click()}><FileUp /> Import project</button>
        </aside>

        <section className="studio-workspace">
          {!project ? <section className="studio-empty"><Sparkles /><h2>Choose what the computer should learn</h2><p>Classify words, recognise visual patterns, or discover groups in numbers.</p></section> : <>
            <header className="studio-header">
              <div><span>{modeName(project.mode)}</span><label className="project-title-editor"><input aria-label="Project title" maxLength={80} value={project.name} onChange={(event) => updateProject((current) => ({ ...current, name: event.target.value }), false)} /><Pencil aria-hidden="true" /></label></div>
              <div className="studio-file-actions"><span className="save-status"><Save /> {message}</span><button onClick={() => downloadProject(project)}><Download /> Export</button><button className="danger" onClick={deleteProject}><Trash2 /> Delete</button></div>
            </header>
            <div className="studio-steps"><span className="active"><b>1</b> Collect examples</span><span className={trained ? 'complete' : readiness.ready ? 'active' : ''}><b>2</b> Train model</span><span className={trained ? 'active' : ''}><b>3</b> Test and improve</span></div>

            {project.mode !== 'cluster' && <section className="label-toolbar">
              <div><h2>Categories</h2><p>Give the computer at least two examples for every category.</p></div>
              <div><input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addLabel() }} placeholder="New category name" /><button disabled={!newLabel.trim() || project.labels.length >= colors.length} onClick={addLabel}><Plus /> Add</button></div>
            </section>}

            {project.mode === 'text' && <div className="training-columns">{project.labels.map((label) => {
              const examples = project.textExamples.filter((item) => item.labelId === label.id)
              return <section className="training-column" key={label.id} style={{ '--label-color': label.color } as React.CSSProperties}>
                <input className="label-name" value={label.name} aria-label="Category name" onChange={(event) => updateProject((current) => ({ ...current, labels: current.labels.map((item) => item.id === label.id ? { ...item, name: event.target.value } : item) }))} />
                <div className="text-examples">{examples.map((example) => <div key={example.id}><span>{example.text}</span><button aria-label="Remove example" onClick={() => updateProject((current) => ({ ...current, textExamples: current.textExamples.filter((item) => item.id !== example.id) }))}><Trash2 /></button></div>)}</div>
                <div className="example-entry"><textarea value={drafts[label.id] || ''} onChange={(event) => setDrafts((current) => ({ ...current, [label.id]: event.target.value }))} placeholder={`Type an example of ${label.name}`} /><button disabled={!drafts[label.id]?.trim()} onClick={() => { updateProject((current) => ({ ...current, textExamples: [...current.textExamples, { id: makeId(), labelId: label.id, text: drafts[label.id].trim() }] })); setDrafts((current) => ({ ...current, [label.id]: '' })) }}><Plus /> Add example</button></div>
                <small>{examples.length} examples</small>
              </section>
            })}</div>}

            {project.mode === 'image' && <div className="training-columns image-columns">{project.labels.map((label) => {
              const examples = project.imageExamples.filter((item) => item.labelId === label.id)
              return <section className="training-column" key={label.id} style={{ '--label-color': label.color } as React.CSSProperties}>
                <input className="label-name" value={label.name} aria-label="Category name" onChange={(event) => updateProject((current) => ({ ...current, labels: current.labels.map((item) => item.id === label.id ? { ...item, name: event.target.value } : item) }))} />
                <div className="image-examples">{examples.map((example) => <figure key={example.id}><img src={example.thumbnail} alt={example.name} /><button aria-label="Remove image" onClick={() => updateProject((current) => ({ ...current, imageExamples: current.imageExamples.filter((item) => item.id !== example.id) }))}><Trash2 /></button></figure>)}</div>
                <div className="image-picker-row">
                  <label className="image-picker"><Images /> Choose photos<input type="file" accept="image/*" multiple onChange={(event) => { void addImages(label.id, event.target.files); event.currentTarget.value = '' }} /></label>
                  <label className="image-picker secondary"><Camera /> Take photo<input type="file" accept="image/*" capture="environment" onChange={(event) => { void addImages(label.id, event.target.files); event.currentTarget.value = '' }} /></label>
                </div>
                <small>{examples.length} images · visual features are extracted and stored locally</small>
              </section>
            })}</div>}

            {project.mode === 'cluster' && <section className="cluster-workbench">
              <div className="point-entry"><div><h2>Add number examples</h2><p>Use two measurements, such as study hours and quiz score.</p></div><input placeholder="Name" value={pointDraft.name} onChange={(event) => setPointDraft({ ...pointDraft, name: event.target.value })} /><input type="number" placeholder="Value X" value={pointDraft.x} onChange={(event) => setPointDraft({ ...pointDraft, x: event.target.value })} /><input type="number" placeholder="Value Y" value={pointDraft.y} onChange={(event) => setPointDraft({ ...pointDraft, y: event.target.value })} /><button onClick={addPoint}><Plus /> Add point</button></div>
              <div className="cluster-grid">
                <div className="point-list">{project.points.map((point) => <div key={point.id}><i style={{ background: point.cluster === undefined ? '#8b9693' : colors[point.cluster] }} /><span><strong>{point.name}</strong>{point.x}, {point.y}</span><button onClick={() => updateProject((current) => ({ ...current, points: current.points.filter((item) => item.id !== point.id) }))}><Trash2 /></button></div>)}</div>
                <ClusterPlot points={project.points} centroids={project.centroids} />
              </div>
              <label className="cluster-count">Number of groups: <strong>{project.clusterCount}</strong><input type="range" min="2" max="4" value={project.clusterCount} onChange={(event) => updateProject((current) => ({ ...current, clusterCount: Number(event.target.value) }))} /></label>
            </section>}

            <section className="train-panel">
              <div><h2>Train on this device</h2><p>{readiness.text}</p></div>
              <button disabled={!readiness.ready} onClick={train}>{trained ? <Check /> : <BrainCircuit />}{trained ? 'Model is trained' : 'Train model'}</button>
            </section>

            {trained && project.mode === 'text' && <section className="test-panel"><div><h2>Test a new sentence</h2><p>Try wording the model has not seen before.</p></div><textarea value={testText} onChange={(event) => setTestText(event.target.value)} placeholder="Type something for the model to classify..." /><button disabled={!testText.trim()} onClick={() => setPrediction(textPrediction(project, testText))}>Predict</button><PredictionResult prediction={prediction} /></section>}
            {trained && project.mode === 'image' && <section className="test-panel"><div><h2>Test a new image</h2><p>Use a different photo and compare the confidence.</p></div><label className="image-picker test-picker"><Camera /> Choose or take photo<input type="file" accept="image/*" capture="environment" onChange={(event) => { void testImageFile(event.target.files?.[0]); event.currentTarget.value = '' }} /></label>{testImage && <img className="test-thumbnail" src={testImage} alt="Image being tested" />}<PredictionResult prediction={prediction} /></section>}
            {trained && project.mode === 'cluster' && <section className="test-panel"><div><h2>Test a new point</h2><p>See which learned group is closest.</p></div><div className="test-point"><input type="number" placeholder="Value X" value={testPoint.x} onChange={(event) => setTestPoint({ ...testPoint, x: event.target.value })} /><input type="number" placeholder="Value Y" value={testPoint.y} onChange={(event) => setTestPoint({ ...testPoint, y: event.target.value })} /></div>{clusterPrediction !== null && <div className="top-prediction" style={{ borderColor: colors[clusterPrediction] }}><strong>Group {clusterPrediction + 1}</strong><span>This point is closest to the {colors[clusterPrediction]} group.</span></div>}</section>}
          </>}
        </section>
      </div>
    </div>
  )
}

function PredictionResult({ prediction }: { prediction: Prediction[] | null }) {
  if (!prediction) return null
  if (!prediction.length) return <div className="prediction-result"><div className="top-prediction" style={{ borderColor: '#c28b2c' }}><strong>Not enough learned words</strong><span>Add examples containing words from this sentence, train again, and retry.</span></div></div>
  return <div className="prediction-result"><div className="top-prediction" style={{ borderColor: prediction[0].color }}><strong>{prediction[0].label}</strong><span>{Math.round(prediction[0].confidence * 100)}% confidence</span></div>{prediction.map((item) => <div className="confidence-row" key={item.label}><span>{item.label}</span><div><i style={{ width: `${item.confidence * 100}%`, background: item.color }} /></div><strong>{Math.round(item.confidence * 100)}%</strong></div>)}</div>
}

function ClusterPlot({ points, centroids }: { points: NumberPoint[]; centroids?: Centroid[] }) {
  if (!points.length) return <div className="cluster-plot empty">Your points will appear here.</div>
  const xs = [...points.map((item) => item.x), ...(centroids || []).map((item) => item.x)]
  const ys = [...points.map((item) => item.y), ...(centroids || []).map((item) => item.y)]
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const position = (value: number, min: number, max: number) => 24 + ((value - min) / (max - min || 1)) * 252
  return <svg className="cluster-plot" viewBox="0 0 300 220" role="img" aria-label="Chart of clustered points">
    <line x1="24" y1="196" x2="286" y2="196" /><line x1="24" y1="12" x2="24" y2="196" />
    {points.map((point) => <circle key={point.id} cx={position(point.x, minX, maxX)} cy={196 - (position(point.y, minY, maxY) - 24)} r="7" fill={point.cluster === undefined ? '#8b9693' : colors[point.cluster]} />)}
    {centroids?.map((centroid, index) => <text key={index} x={position(centroid.x, minX, maxX)} y={196 - (position(centroid.y, minY, maxY) - 24)} fill={colors[index]}>★</text>)}
  </svg>
}
