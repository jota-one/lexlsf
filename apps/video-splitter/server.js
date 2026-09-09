/**
 * Local server for the sign splitter.
 *
 * Binds to 127.0.0.1 only: this is a desktop tool that happens to use a browser
 * for its interface, never something to expose on a network.
 *
 * The expensive ffmpeg pass runs once per video, on upload. The motion curve is
 * then handed to the browser, which re-segments locally every time a slider
 * moves — so adjusting settings is instant and costs nothing.
 */

import { execFile } from 'node:child_process'
import { createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'

import { cutClip, extractMotion } from './lib/analysis.js'
import { chooseFolder, freeName, isDirectory, isInside, moveFile, normaliseClipName, revealInFinder } from './lib/files.js'
import { resolveFfmpeg } from './lib/ffmpeg.js'

const ROOT = fileURLToPath(new URL('.', import.meta.url))
const PUBLIC_DIR = join(ROOT, 'public')
const WORK_DIR = join(ROOT, 'work')
const PORT = Number(process.env.PORT ?? 4321)
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
}

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.avi', '.mkv', '.webm'])

mkdirSync(WORK_DIR, { recursive: true })

/**
 * Runs an async handler and answers 500 if it throws. Without this an unhandled
 * rejection would take the whole server down under the person using it.
 */
function guard(promise, res) {
  promise.catch((error) => {
    console.error(error)
    if (!res.headersSent) {
      sendJson(res, 500, { error: error?.message ?? 'Erreur interne.' })
    } else {
      res.end()
    }
  })
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(body) })
  res.end(body)
}

/** Serves a file, honouring Range requests — Safari will not play video without them. */
function sendFile(req, res, filePath, contentType) {
  let stats
  try {
    stats = statSync(filePath)
  } catch {
    sendJson(res, 404, { error: 'Fichier introuvable.' })
    return
  }

  if (req.method === 'HEAD') {
    res.writeHead(200, { 'content-type': contentType, 'content-length': stats.size, 'accept-ranges': 'bytes' })
    res.end()
    return
  }

  const range = req.headers.range
  if (typeof range === 'string') {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim())
    if (match !== null) {
      const start = match[1] === '' ? 0 : Number(match[1])
      const end = match[2] === '' ? stats.size - 1 : Math.min(Number(match[2]), stats.size - 1)
      if (Number.isFinite(start) && start <= end) {
        res.writeHead(206, {
          'content-type': contentType,
          'content-length': end - start + 1,
          'content-range': `bytes ${start}-${end}/${stats.size}`,
          'accept-ranges': 'bytes',
        })
        createReadStream(filePath, { start, end }).pipe(res)
        return
      }
    }
  }

  res.writeHead(200, { 'content-type': contentType, 'content-length': stats.size, 'accept-ranges': 'bytes' })
  createReadStream(filePath).pipe(res)
}

/** Ids are generated here, never taken from the client, but check anyway. */
function isSafeId(id) {
  return typeof id === 'string' && /^[0-9a-f]{16}$/.test(id)
}

function videoDir(id) {
  return join(WORK_DIR, id)
}

function findSourceFile(id) {
  const dir = videoDir(id)
  if (!existsSync(dir)) {
    return null
  }
  const entry = readdirSync(dir).find((name) => name.startsWith('source'))
  return entry === undefined ? null : join(dir, entry)
}

async function handleUpload(req, res) {
  const rawName = String(req.headers['x-filename'] ?? 'video.mp4')
  const extension = extname(rawName).toLowerCase()
  if (!VIDEO_EXTENSIONS.has(extension)) {
    sendJson(res, 400, { error: `Format non reconnu (${extension || 'sans extension'}). Formats acceptés : mp4, mov, m4v, avi, mkv, webm.` })
    return
  }

  const id = [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, '0')).join('')
  const dir = videoDir(id)
  mkdirSync(dir, { recursive: true })
  const sourcePath = join(dir, `source${extension}`)

  let received = 0
  req.on('data', (chunk) => {
    received += chunk.length
    if (received > MAX_UPLOAD_BYTES) {
      req.destroy()
    }
  })

  try {
    await pipeline(req, createWriteStream(sourcePath))
  } catch {
    rmSync(dir, { recursive: true, force: true })
    sendJson(res, 400, { error: 'Transfert interrompu. La vidéo dépasse peut-être 2 Go.' })
    return
  }

  try {
    const { times, values } = await extractMotion(sourcePath)
    sendJson(res, 200, {
      id,
      name: rawName,
      duration: times[times.length - 1],
      times,
      values,
    })
  } catch (error) {
    rmSync(dir, { recursive: true, force: true })
    sendJson(res, 500, { error: error.message })
  }
}

async function readJson(req, limit = 1024 * 1024) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (body.length > limit) {
      throw new Error('Requête trop volumineuse.')
    }
  }
  return JSON.parse(body)
}

async function handleCut(req, res, id) {
  const source = findSourceFile(id)
  if (source === null) {
    sendJson(res, 404, { error: 'Vidéo inconnue. Redéposez-la.' })
    return
  }

  let segments
  try {
    segments = (await readJson(req)).segments
  } catch {
    sendJson(res, 400, { error: 'Requête illisible.' })
    return
  }
  if (!Array.isArray(segments) || segments.length === 0) {
    sendJson(res, 400, { error: 'Aucun signe à découper.' })
    return
  }

  const clipsDir = join(videoDir(id), 'clips')
  rmSync(clipsDir, { recursive: true, force: true })
  mkdirSync(clipsDir, { recursive: true })

  const clips = []
  try {
    for (const [index, segment] of segments.entries()) {
      const start = Number(segment.start)
      const end = Number(segment.end)
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        sendJson(res, 400, { error: `Segment ${index + 1} invalide.` })
        return
      }
      const name = `signe_${String(index + 1).padStart(2, '0')}.mp4`
      await cutClip(source, start, end, join(clipsDir, name))
      clips.push({ name, start, end, duration: end - start, url: `/api/videos/${id}/clips/${name}` })
    }
  } catch (error) {
    sendJson(res, 500, { error: `Le découpage a échoué : ${error.message}` })
    return
  }

  sendJson(res, 200, { clips, folder: clipsDir })
}

async function handleRename(req, res, clipsDir, currentName) {
  if (!existsSync(join(clipsDir, currentName))) {
    sendJson(res, 404, { error: 'Ce clip n’existe plus.' })
    return
  }

  let requested
  try {
    requested = (await readJson(req)).name
  } catch {
    sendJson(res, 400, { error: 'Requête illisible.' })
    return
  }

  const result = normaliseClipName(requested)
  if (!result.ok) {
    sendJson(res, 400, { error: result.reason })
    return
  }

  const { name } = result
  if (name !== currentName && existsSync(join(clipsDir, name))) {
    sendJson(res, 409, { error: 'Un clip porte déjà ce nom.' })
    return
  }

  if (name !== currentName) {
    renameSync(join(clipsDir, currentName), join(clipsDir, name))
  }
  sendJson(res, 200, { name })
}

async function handleMove(req, res, id) {
  let destination
  try {
    destination = (await readJson(req)).destination
  } catch {
    sendJson(res, 400, { error: 'Requête illisible.' })
    return
  }

  if (typeof destination !== 'string' || !isDirectory(destination)) {
    sendJson(res, 400, { error: 'Ce dossier de destination n’existe pas.' })
    return
  }

  const clipsDir = join(videoDir(id), 'clips')
  if (!existsSync(clipsDir)) {
    sendJson(res, 404, { error: 'Aucun clip à déplacer.' })
    return
  }

  const names = readdirSync(clipsDir).filter((name) => extname(name).toLowerCase() === '.mp4')
  if (names.length === 0) {
    sendJson(res, 404, { error: 'Aucun clip à déplacer.' })
    return
  }

  const moved = []
  try {
    for (const name of names) {
      // Never overwrite what is already there; suffix the way the Finder does.
      const finalName = freeName(destination, name)
      moveFile(join(clipsDir, name), join(destination, finalName))
      moved.push({ from: name, to: finalName })
    }
  } catch (error) {
    sendJson(res, 500, { error: `Déplacement interrompu : ${error.message}`, moved, destination })
    return
  }

  sendJson(res, 200, { destination, moved })
}

function handleStatic(req, res, pathname) {
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1)
  const filePath = join(PUBLIC_DIR, normalize(relative))
  if (!resolve(filePath).startsWith(resolve(PUBLIC_DIR))) {
    sendJson(res, 403, { error: 'Accès refusé.' })
    return
  }
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    sendJson(res, 404, { error: 'Page introuvable.' })
    return
  }
  sendFile(req, res, filePath, MIME_TYPES[extname(filePath)] ?? 'application/octet-stream')
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const { pathname } = url

  if (req.method === 'GET' && pathname === '/api/status') {
    const { path, source } = resolveFfmpeg()
    sendJson(res, 200, { ffmpeg: source, path })
    return
  }

  if (req.method === 'POST' && pathname === '/api/videos') {
    guard(handleUpload(req, res), res)
    return
  }

  const videoMatch = /^\/api\/videos\/([0-9a-f]{16})(\/.*)?$/.exec(pathname)
  if (videoMatch !== null) {
    const id = videoMatch[1]
    const rest = videoMatch[2] ?? ''
    if (!isSafeId(id)) {
      sendJson(res, 400, { error: 'Identifiant invalide.' })
      return
    }

    if (req.method === 'POST' && rest === '/clips') {
      guard(handleCut(req, res, id), res)
      return
    }
    if (req.method === 'GET' && rest === '/source') {
      const source = findSourceFile(id)
      if (source === null) {
        sendJson(res, 404, { error: 'Vidéo inconnue.' })
        return
      }
      sendFile(req, res, source, MIME_TYPES[extname(source)] ?? 'video/mp4')
      return
    }
    if (req.method === 'POST' && rest === '/move') {
      guard(handleMove(req, res, id), res)
      return
    }

    const clipMatch = /^\/clips\/([^/]+)$/.exec(rest)
    if (clipMatch !== null) {
      let name
      try {
        name = decodeURIComponent(clipMatch[1])
      } catch {
        sendJson(res, 400, { error: 'Nom de fichier illisible.' })
        return
      }
      const clipsDir = join(videoDir(id), 'clips')
      if (!isInside(clipsDir, name) || extname(name).toLowerCase() !== '.mp4') {
        sendJson(res, 400, { error: 'Nom de fichier invalide.' })
        return
      }
      if (req.method === 'GET' || req.method === 'HEAD') {
        sendFile(req, res, join(clipsDir, name), 'video/mp4')
        return
      }
      if (req.method === 'PATCH') {
        guard(handleRename(req, res, clipsDir, name), res)
        return
      }
    }
  }

  if (req.method === 'POST' && pathname === '/api/choose-folder') {
    guard(
      chooseFolder('Où déposer les clips ?').then((path) =>
        sendJson(res, 200, path === null ? { cancelled: true } : { path })),
      res,
    )
    return
  }

  if (req.method === 'POST' && pathname === '/api/reveal') {
    readJson(req)
      .then(({ path }) => {
        if (typeof path !== 'string' || !isDirectory(path)) {
          sendJson(res, 400, { error: 'Ce dossier n’existe pas.' })
          return
        }
        revealInFinder(path)
        sendJson(res, 200, { ok: true })
      })
      .catch(() => sendJson(res, 400, { error: 'Requête illisible.' }))
    return
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    handleStatic(req, res, pathname)
    return
  }

  sendJson(res, 404, { error: 'Route inconnue.' })
})

server.listen(PORT, '127.0.0.1', () => {
  const { source, path } = resolveFfmpeg()
  const url = `http://127.0.0.1:${PORT}`
  console.log('')
  console.log('  Découpeur de signes LSF')
  console.log(`  ${url}`)
  console.log('')
  if (source === 'missing') {
    console.log('  ⚠️  ffmpeg est introuvable — le découpage ne fonctionnera pas.')
    console.log('     Voir la section « ffmpeg » du README.')
  } else if (source === 'system') {
    console.log(`  ffmpeg : celui installé sur cette machine (${path})`)
  } else {
    console.log('  ffmpeg : version embarquée, rien à installer')
  }
  console.log('')
  console.log('  Ctrl+C pour arrêter.')
  console.log('')
  if (process.env.NO_OPEN !== '1') {
    execFile('open', [url], () => {})
  }
})
