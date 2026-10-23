export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(value < 10 ? 2 : 1).replace('.', ',')} ${units[i]}`
}

// Files above this size get a memory warning; processing is never blocked.
export const LARGE_FILE_BYTES = 100 * 1024 * 1024
