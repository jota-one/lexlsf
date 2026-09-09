/**
 * Turns a per-frame motion curve into one segment per sign.
 *
 * Pure ESM, no platform APIs: the browser imports it to re-segment live while
 * the sliders move, and scripts/split-sign-video.js imports it so the command
 * line and the app can never drift apart. Keep it dependency-free.
 *
 * The curve itself comes from ffmpeg (see lib/analysis.js): each frame is
 * cropped, blurred and differenced with the previous one. Blur is not cosmetic —
 * without it, H.264 edge shimmer on static background objects reads as motion
 * and swallows real pauses.
 */

export const DEFAULTS = {
  /** Shortest stillness that counts as a pause, in seconds. */
  minPause: 0.3,
  /** Shortest span that counts as a sign, in seconds. */
  minSign: 0.5,
  /** Extra time kept on both sides of every sign, in seconds. */
  pad: 0.12,
  /** Where the threshold sits between the rest level and the active level, 0..1. */
  sensitivity: 0.25,
}

/** Moving average over +/- `radius` samples, to drop single-frame noise. */
export function smooth(values, radius) {
  return values.map((_, index) => {
    const from = Math.max(0, index - radius)
    const to = Math.min(values.length, index + radius + 1)
    let sum = 0
    for (let i = from; i < to; i++) {
      sum += values[i]
    }
    return sum / (to - from)
  })
}

function percentile(sorted, ratio) {
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))
  return sorted[index]
}

/**
 * @param {number[]} times   presentation timestamp of each frame, in seconds
 * @param {number[]} values  motion amount of each frame
 * @param {object}   options overrides for DEFAULTS
 */
export function findSegments(times, values, options = {}) {
  const opts = { ...DEFAULTS, ...options }
  if (times.length === 0) {
    return { rest: 0, active: 0, threshold: 0, fps: 0, curve: [], pauses: [], segments: [] }
  }

  // The first frame has nothing to be differenced against, so ffmpeg reports a
  // meaningless spike there. Left alone it can invent a sign at 0.00 s.
  const cleaned = values.length > 1 ? [values[1], ...values.slice(1)] : [...values]

  const curve = smooth(cleaned, 2)
  const sorted = [...curve].sort((a, b) => a - b)

  // Rest and active levels are read off this recording's own distribution rather
  // than hardcoded, so the threshold adapts to each room's lighting and noise.
  const rest = percentile(sorted, 0.15)
  const active = percentile(sorted, 0.9)
  const threshold = rest + opts.sensitivity * (active - rest)

  const endOfVideo = times[times.length - 1]
  const span = endOfVideo - times[0]
  const fps = span > 0 ? times.length / span : 0
  const minPauseFrames = Math.max(1, Math.round(opts.minPause * fps))

  // Runs of consecutive frames below the threshold are candidate pauses.
  const pauses = []
  let i = 0
  while (i < curve.length) {
    if (curve[i] >= threshold) {
      i++
      continue
    }
    let j = i
    while (j < curve.length && curve[j] < threshold) {
      j++
    }
    if (j - i >= minPauseFrames) {
      pauses.push({ start: times[i], end: times[j - 1] })
    }
    i = j
  }

  // Whatever sits between two pauses and lasts long enough is a sign.
  const spans = []
  let previousEnd = 0
  for (const pause of pauses) {
    if (pause.start - previousEnd >= opts.minSign) {
      spans.push({ start: previousEnd, end: pause.start })
    }
    previousEnd = pause.end
  }
  if (endOfVideo - previousEnd >= opts.minSign) {
    spans.push({ start: previousEnd, end: endOfVideo })
  }

  const segments = spans.map((span) => ({
    start: Math.max(0, span.start - opts.pad),
    end: Math.min(endOfVideo, span.end + opts.pad),
  }))

  return { rest, active, threshold, fps, curve, pauses, segments }
}
