import type { IDisposable } from "./IDisposable"
import type { Invalidator, Readable, Subscriber, Unsubscriber } from "svelte/store"
import { tryDisposableListener } from "./DisposableListener"

interface IDisposableSubscribe<T> extends IDisposable {
  attach(readable: Readable<T>, run: Subscriber<T>, invalidate?: Invalidator<T>):void
}

class DisposableSubscribe<T> implements IDisposableSubscribe<T> {
  private unsubscribe?: Unsubscriber
  private disposableListener?: IDisposable

  constructor(readable?: Readable<T>, run?: Subscriber<T>, invalidate?: Invalidator<T>, signal?: AbortSignal) {
    if(readable && run) {
      this.attach(readable, run, invalidate, signal)
    }
  }

  dispose() {
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.disposableListener?.dispose()
    this.disposableListener = undefined
  }

  attach(readable: Readable<T>, run: Subscriber<T>, invalidate?: Invalidator<T>, signal?: AbortSignal) {
    this.dispose()
    this.unsubscribe = readable.subscribe(run, invalidate)
    this.disposableListener = tryDisposableListener(signal, "abort", () => {
      this.dispose()
    })
  }
}

export function disposableSubscribe<T>(readable: Readable<T>, run: Subscriber<T>, invalidate?: Invalidator<T>, signal?:AbortSignal): IDisposableSubscribe<T> {
  return new DisposableSubscribe(readable, run, invalidate, signal)
}

export function prepareDisposableSubscribe<T>(): IDisposableSubscribe<T> {
  return new DisposableSubscribe<T>()
}
