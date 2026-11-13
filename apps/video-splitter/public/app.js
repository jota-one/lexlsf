/**
 * The upload happens once; everything after it is local.
 *
 * The server hands over the motion curve, and this file re-runs the segmentation
 * on every slider move. That is why the trace reacts instantly: no round trip,
 * no ffmpeg, just the shared algorithm running on an array of numbers.
 */

import { DEFAULTS, findSegments } from './segmentation.js'

const el = (id) => document.getElementById(id)

const state = {
  id: null,
  name: '',
  times: [],
  values: [],
  duration: 0,
  analysis: null,
  settings: { ...DEFAULTS },
  clipsFolder: null,
  clips: [],
}

const controls = {
  sensitivity: { input: el('sensitivity'), output: el('sensitivity-out'), format: (v) => v.toFixed(2) },
  minPause: { input: el('min-pause'), output: el('min-pause-out'), format: (v) => `${v.toFixed(2)} s` },
  minSign: { input: el('min-sign'), output: el('min-sign-out'), format: (v) => `${v.toFixed(2)} s` },
  pad: { input: el('pad'), output: el('pad-out'), format: (v) => `${v.toFixed(2)} s` },
}

/* ---------- ffmpeg banner ---------- */

async function showFfmpegStatus() {
  const chip = el('ffmpeg-chip')
  try {
    const response = await fetch('/api/status')
    const { ffmpeg } = await response.json()
    chip.dataset.state = ffmpeg
    chip.textContent = {
      bundled: 'ffmpeg embarqué — rien à installer',
      system: 'ffmpeg de votre Mac',
      missing: 'ffmpeg introuvable — voir le README',
    }[ffmpeg] ?? 'état inconnu'
  } catch {
    chip.dataset.state = 'missing'
    chip.textContent = 'serveur injoignable'
  }
}

/* ---------- upload ---------- */

function showError(node, message) {
  node.textContent = message
  node.hidden = false
}

function upload(file) {
  const error = el('error')
  const progress = el('progress')
  const bar = el('progress-bar')
  const label = el('progress-label')

  error.hidden = true
  progress.hidden = false
  bar.style.width = '0%'
  label.textContent = 'Transfert…'

  const request = new XMLHttpRequest()
  request.open('POST', '/api/videos')
  request.setRequestHeader('x-filename', encodeURIComponent(file.name).replace(/%20/g, ' '))
  request.setRequestHeader('content-type', 'application/octet-stream')

  request.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100)
      bar.style.width = `${percent}%`
      if (percent === 100) {
        label.textContent = 'Analyse des mouvements…'
      }
    }
  })

  request.addEventListener('load', () => {
    let payload
    try {
      payload = JSON.parse(request.responseText)
    } catch {
      progress.hidden = true
      showError(error, 'Réponse illisible du serveur.')
      return
    }
    progress.hidden = true
    if (request.status !== 200) {
      showError(error, payload.error ?? 'Le transfert a échoué.')
      return
    }
    onVideoReady(payload)
  })

  request.addEventListener('error', () => {
    progress.hidden = true
    showError(error, 'Le serveur ne répond plus. Est-il toujours lancé ?')
  })

  request.send(file)
}

function onVideoReady(payload) {
  state.id = payload.id
  state.name = payload.name
  state.times = payload.times
  state.values = payload.values
  state.duration = payload.duration

  el('source-name').textContent = payload.name
  el('scrub').src = `/api/videos/${payload.id}/source`
  el('step-adjust').hidden = false
  el('step-cut').hidden = false
  el('clips').replaceChildren()
  el('moved').hidden = true
  el('move').hidden = true
  el('reveal').hidden = true
  state.clipsFolder = null
  state.clips = []

  recompute()
  el('step-adjust').scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ---------- segmentation ---------- */

function recompute() {
  state.analysis = findSegments(state.times, state.values, state.settings)
  renderSegments()
  drawTrace()
}

function formatTime(seconds) {
  return `${seconds.toFixed(2)} s`
}

function renderSegments() {
  const { segments } = state.analysis
  el('count').textContent = segments.length === 1 ? '1 signe' : `${segments.length} signes`

  const list = el('segments')
  if (segments.length === 0) {
    list.replaceChildren(Object.assign(document.createElement('p'), {
      className: 'empty',
      textContent: 'Aucun signe détecté. Baissez la sensibilité, ou vérifiez que la vidéo contient bien des pauses.',
    }))
    return
  }

  list.replaceChildren(...segments.map((segment, index) => {
    const item = document.createElement('li')

    const number = document.createElement('span')
    number.className = 'index'
    number.textContent = String(index + 1).padStart(2, '0')

    const range = document.createElement('span')
    range.className = 'range'
    range.textContent = `${formatTime(segment.start)} → ${formatTime(segment.end)}`

    const length = document.createElement('span')
    length.className = 'length'
    length.textContent = formatTime(segment.end - segment.start)

    const play = document.createElement('button')
    play.type = 'button'
    play.className = 'play'
    play.textContent = 'Voir'
    play.addEventListener('click', () => previewSegment(segment, play))

    item.append(number, range, length, play)
    return item
  }))
}

/* ---------- preview straight from the source video ---------- */

let previewTimer = null

function previewSegment(segment, button) {
  const video = el('scrub')
  const readout = el('trace-readout')
  clearTimeout(previewTimer)

  for (const other of document.querySelectorAll('.play[aria-pressed="true"]')) {
    other.setAttribute('aria-pressed', 'false')
  }
  button.setAttribute('aria-pressed', 'true')

  readout.hidden = false
  video.currentTime = segment.start
  video.play().catch(() => {})

  previewTimer = setTimeout(() => {
    video.pause()
    button.setAttribute('aria-pressed', 'false')
    readout.hidden = true
  }, (segment.end - segment.start) * 1000)

  const tick = () => {
    el('scrub-time').textContent = formatTime(video.currentTime)
    if (!video.paused) {
      requestAnimationFrame(tick)
    }
  }
  requestAnimationFrame(tick)
}

/* ---------- the trace ---------- */

const canvas = el('trace-canvas')
const context = canvas.getContext('2d')

function drawTrace() {
  if (state.analysis === null) {
    return
  }

  const ratio = window.devicePixelRatio || 1
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  canvas.width = Math.round(width * ratio)
  canvas.height = Math.round(height * ratio)
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, width, height)

  const { curve, threshold, segments } = state.analysis
  const bandHeight = 30
  const plotHeight = height - bandHeight - 12
  const peak = Math.max(...curve, threshold * 1.4)
  const toX = (time) => (time / state.duration) * width
  const toY = (value) => plotHeight - (value / peak) * (plotHeight - 10)

  // Motion curve, filled: the shape of the recording at a glance.
  context.beginPath()
  context.moveTo(0, plotHeight)
  for (let i = 0; i < curve.length; i++) {
    context.lineTo(toX(state.times[i]), toY(curve[i]))
  }
  context.lineTo(width, plotHeight)
  context.closePath()
  context.fillStyle = 'rgba(185, 198, 214, 0.28)'
  context.fill()

  context.beginPath()
  for (let i = 0; i < curve.length; i++) {
    const x = toX(state.times[i])
    const y = toY(curve[i])
    if (i === 0) {
      context.moveTo(x, y)
    } else {
      context.lineTo(x, y)
    }
  }
  context.strokeStyle = '#b9c6d6'
  context.lineWidth = 1
  context.stroke()

  // Threshold: the line the sensitivity slider moves.
  context.beginPath()
  context.setLineDash([5, 4])
  context.moveTo(0, toY(threshold))
  context.lineTo(width, toY(threshold))
  context.strokeStyle = '#f5c518'
  context.lineWidth = 1.5
  context.stroke()
  context.setLineDash([])

  // Retained signs, as blocks under the curve.
  context.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace'
  context.textBaseline = 'middle'
  for (const [index, segment] of segments.entries()) {
    const x = toX(segment.start)
    const blockWidth = Math.max(2, toX(segment.end) - x)
    context.fillStyle = '#f5c518'
    context.fillRect(x, plotHeight + 12, blockWidth, bandHeight)
    if (blockWidth > 22) {
      context.fillStyle = '#13273f'
      context.textAlign = 'center'
      context.fillText(String(index + 1).padStart(2, '0'), x + blockWidth / 2, plotHeight + 12 + bandHeight / 2)
    }
  }
}

canvas.addEventListener('mousemove', (event) => {
  if (state.analysis === null || state.duration === 0) {
    return
  }
  const bounds = canvas.getBoundingClientRect()
  const time = ((event.clientX - bounds.left) / bounds.width) * state.duration
  const video = el('scrub')
  if (video.paused) {
    el('trace-readout').hidden = false
    video.currentTime = Math.max(0, Math.min(state.duration, time))
    el('scrub-time').textContent = formatTime(time)
  }
})

canvas.addEventListener('mouseleave', () => {
  if (el('scrub').paused) {
    el('trace-readout').hidden = true
  }
})

window.addEventListener('resize', drawTrace)

/* ---------- cutting ---------- */

/**
 * Cutting again overwrites the clips still sitting in the work folder, names
 * included. Once they have been moved elsewhere there is nothing left to lose,
 * so the question is only worth asking while they are still here.
 */
function confirmOverwrite() {
  if (state.clips.length === 0) {
    return true
  }

  const total = state.clips.length
  const renamed = state.clips.filter((clip) => !/^signe_\d{2}\.mp4$/.test(clip.name)).length

  const lines = [
    total === 1
      ? 'Un clip a déjà été découpé et va être remplacé.'
      : `${total} clips ont déjà été découpés et vont être remplacés.`,
  ]
  if (renamed > 0) {
    lines.push(renamed === 1
      ? 'Le nom que vous avez donné à l’un d’eux sera perdu.'
      : `Les noms que vous avez donnés à ${renamed} d’entre eux seront perdus.`)
  }
  lines.push('', 'Découper à nouveau ?')

  return window.confirm(lines.join('\n'))
}

async function cut() {
  if (!confirmOverwrite()) {
    return
  }

  const button = el('cut')
  const error = el('cut-error')
  error.hidden = true
  button.disabled = true
  button.textContent = 'Découpage…'

  try {
    const response = await fetch(`/api/videos/${state.id}/clips`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ segments: state.analysis.segments }),
    })
    const payload = await response.json()
    if (!response.ok) {
      showError(error, payload.error ?? 'Le découpage a échoué.')
      return
    }
    state.clipsFolder = payload.folder
    renderClips(payload.clips)
    el('moved').hidden = true
    el('move').hidden = false
    el('reveal').hidden = false
  } catch {
    showError(error, 'Le serveur ne répond plus. Est-il toujours lancé ?')
  } finally {
    button.disabled = false
    button.textContent = 'Découper les clips'
  }
}

function renderClips(clips) {
  state.clips = clips
  el('clips').replaceChildren(...clips.map((clip) => buildClipCard(clip)))
}

/** One card: the video, its name (editable), and how long it runs. */
function buildClipCard(clip) {
  const card = document.createElement('figure')
  card.className = 'clip'

  const video = document.createElement('video')
  video.src = clip.url
  video.controls = true
  video.preload = 'metadata'
  video.playsInline = true

  const nameRow = document.createElement('div')
  nameRow.className = 'clip-name-row'

  const input = document.createElement('input')
  input.type = 'text'
  input.className = 'clip-name'
  input.value = withoutExtension(clip.name)
  input.setAttribute('aria-label', 'Nom du clip')

  const nameError = document.createElement('p')
  nameError.className = 'clip-name-error'
  nameError.hidden = true

  const commit = () => renameClip(clip, input, nameError, video)
  input.addEventListener('blur', commit)
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      input.blur()
    }
    if (event.key === 'Escape') {
      input.value = withoutExtension(clip.name)
      nameError.hidden = true
      input.blur()
    }
  })

  nameRow.append(input, nameError)

  const meta = document.createElement('figcaption')
  meta.className = 'clip-meta'

  const length = document.createElement('span')
  length.textContent = formatTime(clip.duration)

  const download = document.createElement('a')
  download.href = clip.url
  download.download = clip.name
  download.textContent = 'Enregistrer'

  meta.append(length, download)
  card.append(video, nameRow, meta)
  clip.card = card
  clip.download = download
  return card
}

function withoutExtension(name) {
  return name.replace(/\.mp4$/i, '')
}

async function renameClip(clip, input, nameError, video) {
  const wanted = input.value.trim()
  if (wanted === withoutExtension(clip.name)) {
    nameError.hidden = true
    return
  }

  try {
    const response = await fetch(`/api/videos/${state.id}/clips/${encodeURIComponent(clip.name)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: wanted }),
    })
    const payload = await response.json()
    if (!response.ok) {
      nameError.textContent = payload.error ?? 'Renommage refusé.'
      nameError.hidden = false
      // Put the real name back: what the field shows must be what is on disk,
      // otherwise she moves files believing they are named something they aren't.
      input.value = withoutExtension(clip.name)
      return
    }

    clip.name = payload.name
    clip.url = `/api/videos/${state.id}/clips/${encodeURIComponent(payload.name)}`
    // The file moved, so the player and the download link must follow it.
    video.src = clip.url
    clip.download.href = clip.url
    clip.download.download = payload.name
    input.value = withoutExtension(payload.name)
    nameError.hidden = true
  } catch {
    nameError.textContent = 'Le serveur ne répond plus.'
    nameError.hidden = false
  }
}

/* ---------- moving the clips somewhere else ---------- */

async function moveClips() {
  const button = el('move')
  const error = el('cut-error')
  error.hidden = true
  button.disabled = true

  try {
    const chosen = await fetch('/api/choose-folder', { method: 'POST' }).then((r) => r.json())
    if (chosen.cancelled === true) {
      return
    }
    if (typeof chosen.path !== 'string') {
      showError(error, chosen.error ?? 'Aucun dossier choisi.')
      return
    }

    const response = await fetch(`/api/videos/${state.id}/move`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ destination: chosen.path }),
    })
    const payload = await response.json()
    if (!response.ok) {
      showError(error, payload.error ?? 'Le déplacement a échoué.')
      return
    }
    showMoved(payload)
  } catch {
    showError(error, 'Le serveur ne répond plus. Est-il toujours lancé ?')
  } finally {
    button.disabled = false
  }
}

function showMoved({ destination, moved }) {
  state.clipsFolder = destination

  const panel = el('moved')
  const title = document.createElement('h3')
  title.textContent = moved.length === 1 ? '1 clip déplacé' : `${moved.length} clips déplacés`

  const where = document.createElement('p')
  where.textContent = 'Ils sont maintenant dans :'

  const path = document.createElement('p')
  path.className = 'path'
  path.textContent = destination

  panel.replaceChildren(title, where, path)

  // A name already taken in the destination gets suffixed rather than overwritten.
  const renamed = moved.filter((entry) => entry.from !== entry.to)
  if (renamed.length > 0) {
    const note = document.createElement('p')
    note.textContent = 'Un fichier portait déjà ce nom sur place, ceux-ci ont été renommés :'
    const list = document.createElement('ul')
    list.append(...renamed.map((entry) => {
      const item = document.createElement('li')
      item.textContent = `${entry.from} → ${entry.to}`
      return item
    }))
    panel.append(note, list)
  }

  panel.hidden = false
  el('move').hidden = true
  state.clips = []

  for (const card of document.querySelectorAll('.clip')) {
    card.classList.add('is-moved')
    const input = card.querySelector('.clip-name')
    if (input !== null) {
      input.disabled = true
    }
  }
}

/* ---------- wiring ---------- */

function syncControl(key) {
  const { input, output, format } = controls[key]
  input.value = String(state.settings[key])
  output.textContent = format(state.settings[key])
}

for (const [key, { input, output, format }] of Object.entries(controls)) {
  input.addEventListener('input', () => {
    state.settings[key] = Number(input.value)
    output.textContent = format(state.settings[key])
    recompute()
  })
}

el('reset').addEventListener('click', () => {
  state.settings = { ...DEFAULTS }
  for (const key of Object.keys(controls)) {
    syncControl(key)
  }
  recompute()
})

const dropzone = el('dropzone')
const fileInput = el('file-input')

dropzone.addEventListener('click', () => fileInput.click())
dropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    fileInput.click()
  }
})
fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    upload(fileInput.files[0])
  }
})

for (const type of ['dragenter', 'dragover']) {
  dropzone.addEventListener(type, (event) => {
    event.preventDefault()
    dropzone.classList.add('is-over')
  })
}
for (const type of ['dragleave', 'drop']) {
  dropzone.addEventListener(type, (event) => {
    event.preventDefault()
    dropzone.classList.remove('is-over')
  })
}
dropzone.addEventListener('drop', (event) => {
  const file = event.dataTransfer?.files?.[0]
  if (file !== undefined) {
    upload(file)
  }
})

el('cut').addEventListener('click', cut)
el('move').addEventListener('click', moveClips)
el('reveal').addEventListener('click', () => {
  if (state.clipsFolder === null) {
    return
  }
  fetch('/api/reveal', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path: state.clipsFolder }),
  }).catch(() => {})
})

for (const key of Object.keys(controls)) {
  syncControl(key)
}
void showFfmpegStatus()
