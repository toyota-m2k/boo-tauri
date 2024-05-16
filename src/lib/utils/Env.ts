import {tauriEx, type OSPlatForm} from "./TauriEx";

export class Env {
  static _isTauri: boolean = false;
  static _os:OSPlatForm = "U"

  static async init() {
    try {
      this._os = await tauriEx.getOS()
      this._isTauri = this._os[1] !== 'B'
      if(this._isTauri) {
        await tauriEx.setupTitleBar()
      }
    } catch(e) {
      this._os = "U"
      this._isTauri = false
    }
  }

  static get isTauri(): boolean {
    return this._isTauri
  }
  static get os(): OSPlatForm {
    return this._os
  }
  static get isMac(): boolean {
    return this._os[0] === 'M'
  }
  static get isWin(): boolean {
    return this._os[0] === 'W'
  }
  static get isLinux(): boolean {
    return this._os[0] === 'L'
  }
}