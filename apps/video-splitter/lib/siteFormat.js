/**
 * The video format of the site: what the `sign` hook in pb/hooks.go turns every
 * upload into. Clips already in it (HEVC) are left alone by the server, so the
 * app writes them in it straight away, light enough for the upload limit.
 *
 * Shared with scripts/split-sign-video.js. It lives here because this folder is
 * what gets zipped and sent to the client.
 */

/** The 4:3 window the site keeps, taken from the middle of the image. */
export const SITE_CROP = 'crop=ih*4/3:ih'

/** That window, 720 px wide, 24 images per second. */
export const SITE_VIDEO_FILTER = `${SITE_CROP},scale=720:-2:flags=lanczos:force_divisible_by=2,fps=24`

/** ffmpeg output options, after the input: HEVC, no sound, playable while loading. */
export const SITE_ENCODE_ARGS = [
  '-vf', SITE_VIDEO_FILTER,
  '-an',
  '-c:v', 'libx265',
  '-crf', '24',
  '-preset', 'slow',
  // x265 prints its banner on stderr regardless of ffmpeg's -loglevel
  '-x265-params', 'log-level=error',
  // The tag Apple players need to recognise HEVC in an mp4
  '-tag:v', 'hvc1',
  '-movflags', '+faststart',
]
