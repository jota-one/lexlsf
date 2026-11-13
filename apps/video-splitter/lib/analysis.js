/**
 * The two ffmpeg passes the app needs: read motion out of a video, and cut clips.
 *
 * No ffprobe anywhere — duration and frame rate are derived from the motion
 * samples, which keeps the dependency down to a single bundled binary.
 */

import { execFile } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { resolveFfmpeg } from './ffmpeg.js'

const execFileAsync = promisify(execFile)

// Same 4:3 window the site keeps when it optimizes an upload (see pb/hooks.go),
// so motion is measured on exactly the framing that ends up online.
const ANALYSIS_FILTERS = [
  'crop=ih*4/3:ih',
  'scale=160:-2',
  'format=gray',
  'gblur=sigma=2.5',
  'tblend=all_mode=difference',
  'signalstats',
]

function ffmpegPath() {
  const { path } = resolveFfmpeg()
  if (path === null) {
    throw new Error('ffmpeg introuvable. Voir le README pour l’installer.')
  }
  return path
}

/** Runs one pass over the video and returns { times, values }, one entry per frame. */
export async function extractMotion(videoPath) {
  const dir = mkdtempSync(join(tmpdir(), 'lsf-motion-'))
  const dumpPath = join(dir, 'motion.txt')
  try {
    await execFileAsync(ffmpegPath(), [
      '-hide_banner', '-loglevel', 'error',
      '-i', videoPath,
      '-an',
      '-vf', `${ANALYSIS_FILTERS.join(',')},metadata=print:key=lavfi.signalstats.YAVG:file=${dumpPath}`,
      '-f', 'null', '-',
    ], { maxBuffer: 64 * 1024 * 1024 })

    const dump = readFileSync(dumpPath, 'utf8')
    const times = []
    const values = []
    const pattern = /pts_time:([\d.]+)\s*\nlavfi\.signalstats\.YAVG=([\d.]+)/g
    let match = pattern.exec(dump)
    while (match !== null) {
      times.push(Number(match[1]))
      values.push(Number(match[2]))
      match = pattern.exec(dump)
    }
    if (times.length === 0) {
      throw new Error('Aucune image lisible dans ce fichier. Est-ce bien une vidéo ?')
    }
    return { times, values }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/**
 * Cuts one clip. Re-encodes rather than copying: stream copy would snap each cut
 * to the nearest keyframe, which is nowhere near frame accurate.
 */
export async function cutClip(videoPath, start, end, outputPath) {
  await execFileAsync(ffmpegPath(), [
    '-hide_banner', '-loglevel', 'error',
    '-y',
    '-ss', start.toFixed(3),
    '-to', end.toFixed(3),
    '-i', videoPath,
    '-an',
    '-c:v', 'libx264',
    '-crf', '18',
    '-preset', 'veryfast',
    '-movflags', '+faststart',
    outputPath,
  ], { maxBuffer: 16 * 1024 * 1024 })
}
