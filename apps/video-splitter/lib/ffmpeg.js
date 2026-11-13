/**
 * Locates the ffmpeg binary.
 *
 * Order: the copy bundled in node_modules first, then whatever is on PATH.
 * The bundled binary is built for the machine that ran `npm install`, so a
 * package zipped on an Apple Silicon Mac will not run on an Intel one — hence
 * the fallback, and the explicit message when neither works.
 */

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

function works(binary) {
  try {
    execFileSync(binary, ['-version'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

let resolved = null

export function resolveFfmpeg() {
  if (resolved !== null) {
    return resolved
  }

  let bundled = null
  try {
    bundled = require('ffmpeg-static')
  } catch {
    bundled = null
  }

  if (typeof bundled === 'string' && existsSync(bundled) && works(bundled)) {
    resolved = { path: bundled, source: 'bundled' }
    return resolved
  }

  for (const candidate of ['ffmpeg', '/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg']) {
    if (works(candidate)) {
      resolved = { path: candidate, source: 'system' }
      return resolved
    }
  }

  resolved = { path: null, source: 'missing' }
  return resolved
}
