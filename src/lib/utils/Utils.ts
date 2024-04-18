export function launch<T>(fn: () => Promise<T>) {
  (async () => {
    return fn()
  })()
}

export function formatTime(time: number): string {
  const h = Math.floor(time / 3600)
  const m = Math.floor((time % 3600) / 60)
  const s = Math.floor(time % 60)
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function formatSize(size: number): string {
  if (size < 1024) {
    return `${size}B`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)}KB`
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)}MB`
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`
}