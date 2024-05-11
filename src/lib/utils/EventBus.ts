/**
 * EventBusで使用するイベント名を定義するためのi/f
 * なんでも文字列で片づけるJavascriptの流儀が嫌いなので、ちゃんと定義して使うことを強制する。
 */
export interface IEventName {
  name: string
}

/**
 * EventBusの実装
 */
class EventBus {
  private listeners: { [key: string]: Function[] } = {};

  on(event: IEventName, callback: Function) {
    if (!this.listeners[event.name]) {
      this.listeners[event.name] = [];
    }
    this.listeners[event.name].push(callback);
  }

  off(event: IEventName, callback: Function) {
    if (!this.listeners[event.name]) {
      return;
    }
    this.listeners[event.name] = this.listeners[event.name].filter(
      listener => listener !== callback
    );
  }

  emit(event: IEventName, ...args: any[]) {
    if (!this.listeners[event.name]) {
      return;
    }
    this.listeners[event.name].forEach(listener => listener(...args));
  }
}

export const eventBus = new EventBus()

/**
 * イベント毎にインスタンスを作るためのクラス
 * EventBusも、IEventNameで名前を定義してから使うようにしてしまったので、
 * 結果的に、このクラスを使うのと大差はなくなった。
 * どちらを使うかは好みの問題。
 */
export class EventListeners {
  listeners: Function[] = []
  addListener(listener: (...args:any[])=>void) {
    this.listeners.push(listener)
  }
  removeListener(listener: Function) {
    this.listeners = this.listeners.filter(l => l !== listener)
  }
  emit(...args: any[]) {
    this.listeners.forEach(listener => listener(...args))
  }
}
