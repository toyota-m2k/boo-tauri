import {getOS, type OS} from "./TauriEx";

export class Env {
  static _isTauri: boolean = false;
  static _os:OS = "U"

  static async init() {
    try {
      this._os = await getOS()
      this._isTauri = this._os[1] !== 'B'
    } catch(e) {
      this._os = "U"
      this._isTauri = false
    }
  }

  static get isTauri(): boolean {
    return this._isTauri
  }
  static get os(): OS {
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