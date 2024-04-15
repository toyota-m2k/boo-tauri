export function launch<T>(fn: () => Promise<T>) {
  (async () => {
    return fn()
  })()
}