export function launch<T>(fn: () => Promise<T>) {
  fn().catch((e) => {
    console.error(e)
  })
}

export async function delay(msec: number, signal?: AbortSignal): Promise<void> {
  let abortListener: (() => void) | undefined = undefined
  const promise = new Promise((resolve, reject) => {
    let timeout: number | undefined = undefined
    if (signal !== undefined) {
      abortListener = () => {
        if (timeout !== undefined) {
          clearTimeout(timeout)
        }
        reject(signal.reason)
      }
      signal.addEventListener("abort", abortListener)
    }
    timeout = setTimeout(resolve, msec)
  })
  try {
    await promise
  } finally {
    if (signal !== undefined && abortListener !== undefined) {
      signal.removeEventListener("abort", abortListener)
    }
  }
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