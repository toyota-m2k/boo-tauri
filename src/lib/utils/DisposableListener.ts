import type { IDisposable } from "./IDisposable"

interface IDisposableListener extends IDisposable {
  setListener(listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void
}

/**
 * addEventListener()の後、removeEventListener()を呼ぶためのIDisposableクラス
 * 解除用にlistener を覚えておかなくてもよいので、少し簡潔に書ける。
 */
class DisposableListener<T extends EventTarget> implements IDisposableListener {
  private listener?: EventListenerOrEventListenerObject

  constructor(private readonly target: T, private readonly type: string, listener?: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    this.target = target
    this.type = type
    this.listener = listener
    if(target && listener && type) {
      target.addEventListener(type, listener, options)
    }
  }

  dispose(): void {
    const listener = this.listener
    if(listener) {
      this.target.removeEventListener(this.type!, listener!)
      this.listener = undefined
    }
  }

  setListener(listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
    if(this.listener) { throw new Error("DisposableListener is already attached.") }
    this.listener = listener
    this.target.addEventListener(this.type, listener, options)
  }
}

/**
 * addEventListener()の後、removeEventListener()を呼ぶためのIDisposableを作成する
 * @param target    リスナーの登録先
 * @param type      イベントタイプ
 * @param listener  リスナー
 * @param options   オプション
 */
export function disposableListener<T extends EventTarget>(target: T, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): IDisposable {
  return new DisposableListener(target, type, listener, options)
}

export function tryDisposableListener<T extends EventTarget>(target: T|undefined, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): IDisposable|undefined {
  if(target) {
    return new DisposableListener(target, type, listener, options)
  } else undefined
}

/**
 * IDisposableListenerを、作成＋リスナーの登録の二段階で構築するための１段階目
 * @param target  リスナーの登録先
 * @param type    イベントタイプ
 */
export function prepareDisposableListener<T extends EventTarget>(target: T, type: string): IDisposableListener {
  return new DisposableListener(target, type)
}

