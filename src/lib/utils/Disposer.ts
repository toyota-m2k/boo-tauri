import type { IDisposable } from "./IDisposable"

export class Disposer implements IDisposable {
  private disposables: IDisposable[] = []
  add(disposable: IDisposable|undefined): Disposer {
    if(disposable) {
      this.disposables.push(disposable)
    }
    return this
  }
  remove(disposable: IDisposable|undefined): void {
    if(disposable) {
      this.disposables = this.disposables.filter(d => d !== disposable)
    }
  }

  dispose(): void {
    this.disposables.forEach(d => d.dispose())
    this.disposables = []
  }
}

