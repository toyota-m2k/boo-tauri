import {logger} from "../model/DebugLog";
import {Env} from "./Env";
import {globalShortcut} from "@tauri-apps/api";

interface IBrowserKey {
  key: string
  asCode?: boolean   // true: key は code で指定される / false: key は key
}

interface IKeyDef {
  browserKey: IBrowserKey
  tauriKey: string
}

interface IModifierKey {
  shift?: boolean
  ctrl?: boolean
  alt?: boolean   // Windows: Alt, Mac: Option
  meta?: boolean  // Windows: Win, Mac: ⌘ Command  --> Tauriでは、SUPER
  commandOrControl?: boolean // Windows: Ctrl, Mac: Command  : true にすると、ctrl/meta の指定は無視する
}

interface IKey {
  keyDef: IKeyDef
  modifierKey: IModifierKey
  os?: "W" | "M" | "L" | "WM" | "WL" | "ML" | "WML"
}

export function keyFor(tauriKey:string, browserKey: IBrowserKey, modifierKey={}, os?:"W" | "M" | "L" | "WM" | "WL" | "ML" | "WML"): IKey {
  return { keyDef: { browserKey, tauriKey }, modifierKey, os }
}


class KeyEventHandler {
  targetKeys: IKey[]
  action: ()=>void

  constructor(targetKey: IKey|IKey[], action:()=>void) {
    this.targetKeys = Array.isArray(targetKey) ? targetKey : [targetKey]
    this.action = action
  }

  static isTargetOS(targetKey:IKey): boolean {
    return (!targetKey.os || targetKey.os.indexOf(Env.os[0]) >=0)

  }

  private static canHandleSingle(targetKey:IKey, e: KeyboardEvent): boolean {
    // ターゲットOSか？
    if (!this.isTargetOS(targetKey)) return false
    // キーが一致するか？
    if (targetKey.keyDef.browserKey.asCode) {
      if (e.code !== targetKey.keyDef.browserKey.key) return false
    } else {
      if (e.key !== targetKey.keyDef.browserKey.key) return false
    }
    // 修飾キーが一致するか？
    const modifierKey = targetKey.modifierKey
    if (modifierKey.commandOrControl) {
      // commandOrControl が true なら、ctrl/meta より優先して評価する
      if (!(Env.isMac ? e.metaKey : e.ctrlKey)) return false
    } else {
      if (e.ctrlKey !== (modifierKey.ctrl===true)) return false
      if (e.metaKey !== (modifierKey.meta===true)) return false
    }
    if (e.shiftKey !== (modifierKey.shift===true)) return false
    if (e.altKey !== (modifierKey.alt===true)) return false

    return true
  }

  private canHandle(e: KeyboardEvent): boolean {
    return this.targetKeys.some((targetKey) => KeyEventHandler.canHandleSingle(targetKey, e))
  }

  handle(e: KeyboardEvent): boolean {
    if(this.canHandle(e)) {
      this.action()
    }
    return false
  }
}

// export function keyHandler(targetKey: IKey|IKey[], action:()=>void): KeyEventHandler {
//   return new KeyEventHandler(targetKey, action)
// }
export interface IKeyEventsRegistry {
  register(targetKey: IKey|IKey[], action:()=>void): IKeyEventsRegistry
}

export interface IKeyEvents {
  activate(): Promise<IKeyEvents>
  deactivate(): Promise<IKeyEvents>
  beginRegister(fn: (registry: IKeyEventsRegistry)=>void): Promise<void>
}

class KeyEvents implements IKeyEvents, IKeyEventsRegistry {
  private handlers: KeyEventHandler[] = []
  private _activated: boolean = false

  get activated(): boolean { return this._activated }

  // register(handler: KeyEventHandler): KeyEvents {
  //   this.handlers.push(handler)
  //   return this
  // }

  register(targetKey: IKey|IKey[], action:()=>void): KeyEvents {
    this.handlers.push(new KeyEventHandler(targetKey, action))
    return this
  }

  async beginRegister(fn: (registry: IKeyEventsRegistry)=>void) : Promise<void> {
    const org = this.activated
    if(Env.isTauri) {
      await this.deactivate()
    }
    try {
      fn(this)
    } finally {
      if(org && Env.isTauri) {
        await this.activate()
      }
    }
  }

  private internalKeyboardEventHandler = (e:KeyboardEvent) => {
    if(e.defaultPrevented) return
    logger.debug(`${e.code} ${e.key} - shift:${e.shiftKey} ctrl:${e.ctrlKey} alt:${e.altKey} meta:${e.metaKey}`)
    if(!Env.isTauri) {
      for(const handler of this.handlers) {
        if(handler.handle(e)) {
          e.preventDefault()  // これどうだろう。。。tauriの動きと整合はとれるのか？
          return
        }
      }
    }
  }

  async activate():Promise<IKeyEvents> {
    if(this._activated) return this
    this._activated = true
    window.addEventListener("keydown", this.internalKeyboardEventHandler, true)
    if(Env.isTauri) {
      for(const handler of this.handlers) {
        const list = handler.targetKeys.filter((it)=>KeyEventHandler.isTargetOS(it)).map((targetKey) => targetKey.keyDef.tauriKey)
        if(list.length >1 ) {
          await globalShortcut.registerAll(list, handler.action)
        } else if (list.length === 1) {
          await globalShortcut.register(list[0], handler.action)
        }
      }
    }
    return this
  }

  async deactivate():Promise<IKeyEvents> {
    if(!this._activated) return this
    this._activated = false
    window.removeEventListener("keydown", this.internalKeyboardEventHandler, true)
    if(Env.isTauri) {
      await globalShortcut.unregisterAll()
    }
    return this
  }
}

export const globalKeyEvents : IKeyEvents = new KeyEvents()

export async function switchKeyEventCaster(subEvents: IKeyEvents) : Promise<() => Promise<void>> {
  await globalKeyEvents.deactivate()
  await subEvents.activate()
  return async () => {
    await subEvents.deactivate()
    await globalKeyEvents.activate()
  }
}

export function createKeyEvents(): IKeyEvents {
  return new KeyEvents()
}


// interface IKeyEvents {
//   register(key:string, { shift, ctrl, alt}:{shift?:boolean, ctrl?:boolean, alt?:boolean}, callback:()=>void):void
//
//   unregister: (keyCode:string) => void
// }
// /*
//   KeyboardEvent
//     altKey:   Win:Alt,  Mac: Option
//     metaKey:  Win:Win,  Mac: ⌘ Cmd
//     ctrlKey
//     shiftKey
//
//  */
//
// class KeyEventsImpl implements IKeyEvents {
//   private keyMap: {[key:string]:()=>void} = {}
//
//   private genKey(keyCode:string, { shift, ctrl, alt}:{shift?:boolean, ctrl?:boolean, alt?:boolean}) {
//     return `${keyCode}/${shift?"S":""}${ctrl?"C":""}${alt?"A":""}`
//   }
//   register(keyCode:string, { shift, ctrl, alt}:{shift?:boolean, ctrl?:boolean, alt?:boolean}, callback:()=>void):void {
//     this.keyMap[this.genKey(keyCode, {shift, ctrl, alt})] = callback
//   }
//
//   unregister = (keyCode:string) => {
//     delete this.keyMap[keyCode]
//   }
//
//   constructor() {
//     window.addEventListener("keydown", (e)=>{
//       if(e.defaultPrevented) return
//       logger.debug(`${e.code} ${e.key} (${e.location}) ${e.shiftKey} ${e.ctrlKey} ${e.altKey}`)
//       const fn = this.keyMap[this.genKey(e.code, {shift:e.shiftKey, ctrl:e.ctrlKey, alt:e.altKey})]
//       if(fn) {
//           fn()
//         // イベントが処理された場合は「ダブルアクション」を抑制
//         e.preventDefault()
//       }
//     }, true)
//   }
// }
//
// export const keyEvents:IKeyEvents = new KeyEventsImpl()
