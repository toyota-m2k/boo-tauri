import type { Readable, Subscriber, Unsubscriber, Updater, Writable } from "svelte/store"
import { derived, writable } from "svelte/store"
import type { StartStopNotifier } from "svelte/store"

/**
 * Readable + 現在の値を取得できるインタフェース
 */
export interface CurrentValueReadable<T> extends Readable<T> {
  readonly currentValue: T
}

/**
 * Writable + 現在の値を取得できるインタフェース
 */
export interface CurrentValueStore<T> extends CurrentValueReadable<T>, Writable<T> {
}

/**
 * `CurrentValueStore` を生成します。
 * @param value 初期値
 * @param start 購読の開始・終了の通知を受け取るコールバック
 */
export function currentValueStore<T>(value: T, start?: StartStopNotifier<T>): CurrentValueStore<T> {
  const store = writable(value, start)
  
  function set(newValue: T): void {
    value = newValue
    store.set(newValue)
  }
  
  function update(fn: Updater<T>): void {
    set(fn(value))
  }
  
  function subscribe(run: Subscriber<T>, invalidate?: (value?: T) => void): Unsubscriber {
    return store.subscribe(run, invalidate)
  }
  
  return {
    set,
    update,
    subscribe,
    get currentValue(): T {
      return value
    }
  }
}

/**
 * 引数で指定した値を保持してそれ以後更新されない `CurrentValueReadable` を生成します。
 * @param value 値
 */
export function currentValueJust<T>(value: T): CurrentValueReadable<T> {
  return {
    currentValue: value,
    subscribe(subscriber: Subscriber<T>) {
      subscriber(value)
      return () => { /* do nothing */ }
    }
  }
}

/**
 * `CurrentValueReadable` 1つを第1引数にとって、
 * その値を第2引数の関数で変換した `CurrentValueReadable` を生成します。
 * @param store
 * @param fn
 */
export function currentValueMap<S, T>(store: CurrentValueReadable<S>, fn: (value: S) => T): CurrentValueReadable<T> {
  const { subscribe } = derived(store, fn)
  return {
    subscribe,
    get currentValue(): T {
      return fn(store.currentValue)
    }
  }
}
