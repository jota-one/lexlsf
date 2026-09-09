/**
 * Split a continuous LSF recording into one clip per sign.
 *
 * The signer performs a sign, returns to rest, performs the next one, and so on.
 * This script locates the rest periods and cuts between them.
 *
 * How pauses are detected: each frame is cropped to the same 4:3 window the site
 * optimizer keeps (see pb/hooks.go), downscaled, blurred, then differenced with
 * the previous frame. The blur matters — without it, H.264 edge shimmer on static
 * background objects reads as motion and swallows real pauses. The resulting
 * per-frame motion curve is thresholded: sustained low plateaus are the pauses.
 *
 * Cuts land in the middle of each pause, with a small pad kept around every sign.
 *
 * Default mode is analysis only: it writes a review sheet and the segment list,
 * but no clips. Inspect the sheet, then re-run with --write.
 *
 * Usage:
 *   node scripts/split-sign-video.js recording.mp4
 *   node scripts/split-sign-video.js recording.mp4 --write
 *   node scripts/split-sign-video.js recording.mp4 --write --optimize
 *
 * Options:
 *   --out DIR         output directory (default: <video basename>_clips)
 *   --write           actually cut the clips
 *   --optimize        also produce the site-optimized version of each clip
 *   --min-pause S     shortest gap counted as a pause (default 0.30)
 *   --min-sign S      shortest span counted as a sign (default 0.50)
 *   --pad S           padding kept around each sign (default 0.12)
 *   --sensitivity F   0..1 between rest and active level (default 0.25)
 *                     lower = more permissive, risks merging two signs
 *                     higher = stricter, risks splitting one sign on an internal hold
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, extname, join, resolve } from 'node:path'

// Shared with the local web app so the two can never drift apart. It lives
// there because that folder is what gets zipped and sent to the client.
import { DEFAULTS, findSegments } from '../apps/video-splitter/public/segmentation.js'

// Same geometry and codec settings as the `sign` collection hook in pb/hooks.go
const SITE_CROP = 'crop=ih*4/3:ih'
const SITE_OPTIMIZE_VF = `${SITE_CROP},scale=720:-2:flags=lanczos:force_divisible_by=2,fps=24`

function parseArgs(argv) {
  const opts = {
    video: null,
    out: null,
    write: false,
    optimize: false,
    ...DEFAULTS,
  }
  const numeric = {
    '--min-pause': 'minPause',
    '--min-sign': 'minSign',
    '--pad': 'pad',
    '--sensitivity': 'sensitivity',
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--write') {
      opts.write = true
    } else if (arg === '--optimize') {
      opts.optimize = true
    } else if (arg === '--out') {
      opts.out = argv[++i]
    } else if (numeric[arg] !== undefined) {
      const value = Number(argv[++i])
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`${arg} expects a positive number`)
      }
      opts[numeric[arg]] = value
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`)
    } else if (opts.video === null) {
      opts.video = arg
    } else {
      throw new Error(`Unexpected argument: ${arg}`)
    }
  }
  if (opts.video === null) {
    throw new Error('Missing video path. See the header of this file for usage.')
  }
  return opts
}

function run(bin, args) {
  return execFileSync(bin, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

function ffmpeg(args) {
  return run('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args])
}

/**
 * Per-frame motion curve: [{ time, value }, ...].
 *
 * The crop/blur chain is what makes the signal usable; see the file header.
 */
function extractMotion(video) {
  const dir = mkdtempSync(join(tmpdir(), 'sign-split-'))
  const dumpPath = join(dir, 'motion.txt')
  try {
    ffmpeg([
      '-i', video,
      '-an',
      '-vf', [
        SITE_CROP,
        'scale=160:-2',
        'format=gray',
        'gblur=sigma=2.5',
        'tblend=all_mode=difference',
        'signalstats',
        `metadata=print:key=lavfi.signalstats.YAVG:file=${dumpPath}`,
      ].join(','),
      '-f', 'null', '-',
    ])
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
      throw new Error('No motion samples produced — is the input a readable video?')
    }
    return { times, values }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function cutClip(video, segment, outputPath) {
  ffmpeg([
    '-y',
    '-ss', segment.start.toFixed(3),
    '-to', segment.end.toFixed(3),
    '-i', video,
    '-an',
    '-c:v', 'libx264',
    '-crf', '18',
    '-preset', 'veryfast',
    outputPath,
  ])
}

/** Mirrors the optimization the `sign` hook applies on upload. */
function optimizeClip(inputPath, outputPath) {
  ffmpeg([
    '-y',
    '-i', inputPath,
    '-vf', SITE_OPTIMIZE_VF,
    '-c:v', 'libx265',
    '-crf', '24',
    '-preset', 'slow',
    // x265 prints its banner on stderr regardless of ffmpeg's -loglevel
    '-x265-params', 'log-level=error',
    '-tag:v', 'hvc1',
    '-an',
    '-movflags', '+faststart',
    outputPath,
  ])
}

/** Contact sheet: four frames per segment, so cuts can be checked at a glance. */
function buildReviewSheet(video, segments, outDir) {
  const frameDir = mkdtempSync(join(tmpdir(), 'sign-review-'))
  try {
    let index = 0
    for (const [position, segment] of segments.entries()) {
      for (const ratio of [0.08, 0.36, 0.64, 0.94]) {
        const time = segment.start + (segment.end - segment.start) * ratio
        const label = `${String(position + 1).padStart(2, '0')} @ ${time.toFixed(2)}s`
        ffmpeg([
          '-y',
          '-ss', time.toFixed(3),
          '-i', video,
          '-frames:v', '1',
          '-vf', `scale=240:-2,drawtext=text='${label}':x=4:y=4:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.6`,
          join(frameDir, `${String(index).padStart(4, '0')}.jpg`),
        ])
        index++
      }
    }
    const sheetPath = join(outDir, 'review.jpg')
    ffmpeg([
      '-y',
      '-i', join(frameDir, '%04d.jpg'),
      '-vf', `tile=4x${segments.length}`,
      '-frames:v', '1',
      sheetPath,
    ])
    return sheetPath
  } finally {
    rmSync(frameDir, { recursive: true, force: true })
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2))
  const video = resolve(opts.video)
  if (!existsSync(video)) {
    throw new Error(`Video not found: ${video}`)
  }

  const stem = basename(video, extname(video))
  const outDir = resolve(opts.out ?? `${stem}_clips`)
  mkdirSync(outDir, { recursive: true })

  const { times, values } = extractMotion(video)
  const analysis = findSegments(times, values, opts)
  const { segments } = analysis

  console.log(`rest=${analysis.rest.toFixed(3)}  active=${analysis.active.toFixed(3)}  threshold=${analysis.threshold.toFixed(3)}  fps=${analysis.fps.toFixed(1)}`)
  console.log(`${segments.length} sign(s) detected\n`)
  for (const [index, segment] of segments.entries()) {
    const label = String(index + 1).padStart(2, '0')
    console.log(`  ${label}  ${segment.start.toFixed(2).padStart(6)} -> ${segment.end.toFixed(2).padStart(6)}   (${(segment.end - segment.start).toFixed(2)}s)`)
  }

  writeFileSync(join(outDir, 'segments.json'), `${JSON.stringify(segments, null, 2)}\n`)
  const sheetPath = buildReviewSheet(video, segments, outDir)
  console.log(`\nReview sheet: ${sheetPath}`)

  if (!opts.write) {
    console.log('\nAnalysis only. Check the review sheet, then re-run with --write to cut the clips.')
    return
  }

  console.log('')
  for (const [index, segment] of segments.entries()) {
    const label = String(index + 1).padStart(2, '0')
    const clipPath = join(outDir, `${stem}_${label}.mp4`)
    cutClip(video, segment, clipPath)
    console.log(`  wrote ${clipPath}`)
    if (opts.optimize) {
      const optimizedPath = join(outDir, `${stem}_${label}_optim.mp4`)
      optimizeClip(clipPath, optimizedPath)
      console.log(`  wrote ${optimizedPath}`)
    }
  }
}

try {
  main()
} catch (error) {
  console.error(`❌ ${error.message}`)
  process.exit(1)
}
