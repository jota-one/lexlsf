/**
 * Naming and moving the produced clips.
 *
 * Clip names are typed by hand — they end up carrying the sign's term — so they
 * keep accents, spaces and apostrophes. Only what would break a path or confuse
 * the Finder is refused.
 */

import { execFile } from 'node:child_process'
import { copyFileSync, existsSync, renameSync, statSync, unlinkSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

// Path separators, the Finder's reserved colon, the shell-hostile set, and
// control characters. Spaces, hyphens and accents are deliberately allowed:
// "langue des signes" and "sourd-muet" are names she will actually type.
// eslint-disable-next-line no-control-regex -- rejecting control characters is the point
const FORBIDDEN = /[/\\:*?"<>|\u0000-\u001f]/

const MAX_NAME_LENGTH = 100

/**
 * Cleans a name typed in the interface into a filename.
 * @returns {{ ok: true, name: string } | { ok: false, reason: string }}
 */
export function normaliseClipName(raw) {
  if (typeof raw !== 'string') {
    return { ok: false, reason: 'Nom manquant.' }
  }

  // macOS hands back decomposed accents; compose them so "é" is a single character.
  let name = raw.normalize('NFC').trim()

  if (name === '') {
    return { ok: false, reason: 'Le nom ne peut pas être vide.' }
  }
  if (FORBIDDEN.test(name)) {
    return { ok: false, reason: 'Caractères interdits : / \\ : * ? " < > |' }
  }
  if (name.startsWith('.')) {
    return { ok: false, reason: 'Le nom ne peut pas commencer par un point.' }
  }

  if (extname(name).toLowerCase() !== '.mp4') {
    name = `${name}.mp4`
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, reason: `Nom trop long (${MAX_NAME_LENGTH} caractères maximum).` }
  }

  return { ok: true, name }
}

/** True when `name` is a plain filename that stays inside `directory`. */
export function isInside(directory, name) {
  if (typeof name !== 'string' || name === '' || name !== basename(name)) {
    return false
  }
  return resolve(join(directory, name)).startsWith(`${resolve(directory)}/`)
}

/** Finder-style suffixing, so a move never overwrites an existing file. */
export function freeName(directory, name) {
  if (!existsSync(join(directory, name))) {
    return name
  }
  const extension = extname(name)
  const stem = name.slice(0, name.length - extension.length)
  for (let counter = 2; counter < 1000; counter++) {
    const candidate = `${stem} ${counter}${extension}`
    if (!existsSync(join(directory, candidate))) {
      return candidate
    }
  }
  throw new Error(`Impossible de trouver un nom libre pour « ${name} ».`)
}

/**
 * Moves one file, falling back to copy + delete when source and destination sit
 * on different volumes — an external disk or a network share.
 */
export function moveFile(from, to) {
  try {
    renameSync(from, to)
  } catch (error) {
    if (error.code !== 'EXDEV') {
      throw error
    }
    copyFileSync(from, to)
    unlinkSync(from)
  }
}

/** Native folder picker. Returns null when the person dismisses it. */
export async function chooseFolder(prompt) {
  const script = `POSIX path of (choose folder with prompt ${JSON.stringify(prompt)})`
  try {
    const { stdout } = await execFileAsync('osascript', ['-e', script])
    const path = stdout.trim()
    return path === '' ? null : path
  } catch (error) {
    // Dismissing the dialog exits with status 1 and "User canceled".
    if (/User canceled/i.test(error.stderr ?? '')) {
      return null
    }
    throw new Error("Le sélecteur de dossier n'a pas pu s'ouvrir.")
  }
}

export function isDirectory(path) {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

export function revealInFinder(path) {
  execFile('open', [path], () => {})
}
