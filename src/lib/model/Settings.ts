import {HostInfo, HostInfoList} from "./HostInfo";
import {Preferences} from "./Preferences";
import {launch} from "../utils/Utils";
import type {PlayMode} from '../protocol/IBooProtocol'

export interface ISettings {
  currentHost: HostInfo | undefined
  get hostInfoList(): HostInfoList
  playMode: PlayMode
  slideShowInterval: number
  load(): Promise<void>
  save(): Promise<void>
}

export type ColorVariation = 'default' | 'orange' | 'melon' | 'cherry' | 'grape' | 'carrot' | 'blueberry' | 'soda'
export const colorVariations: ColorVariation[] = ['default', 'orange', 'melon', 'cherry', 'grape', 'carrot', 'blueberry', 'soda']

class Settings implements ISettings {
  private _preferences = new Preferences()
  private _hostInfoList = new HostInfoList()

  async load(): Promise<void> {
    await this._preferences.load()
    this._hostInfoList = new HostInfoList(this._preferences.get('hostInfoList', []), this._preferences.get('currentHostIndex', -1))
  }
  get currentHost(): HostInfo|undefined {
    return this._hostInfoList.currentHost
  }
  set currentHost(hostInfo: HostInfo|undefined) {
    this._hostInfoList.currentHost = hostInfo
  }

  get hostInfoList(): HostInfoList {
    return this._hostInfoList
  }

  get slideShowInterval(): number {
    return this._preferences.get('slideShowInterval', 1)
  }
  set slideShowInterval(interval: number) {
    this._preferences.set('slideShowInterval', interval)
  }

  get playMode(): PlayMode {
    return this._preferences.get('playMode', 'sequential')
  }
  set playMode(playMode: PlayMode) {
    this._preferences.set('playMode', playMode)
    launch(()=> { return this.save() })
  }

  get colorVariation(): ColorVariation {
    return this._preferences.get('colorVariation', 'default')
  }
  set colorVariation(colorVariation: ColorVariation) {
    this._preferences.set('colorVariation', colorVariation)
  }
  get isDarkMode(): boolean {
    return this._preferences.get('isDarkMode', false)
  }
  set isDarkMode(isDarkMode: boolean) {
    this._preferences.set('isDarkMode', isDarkMode)
  }

  async save() {
    if(this._hostInfoList.isModified) {
      this._preferences.set('hostInfoList', this._hostInfoList.list)
      this._preferences.set('currentHostIndex', this._hostInfoList.currentHostIndex)
      this._hostInfoList.clearModified()
    }
    await this._preferences.save()
  }

  /**
   * 変更を破棄して設定を元に戻す
   */
  async reset(): Promise<void> {
    if(this._preferences.isModified||this._hostInfoList.isModified) {
      this._preferences = new Preferences()
      await this.load()
    }
  }

}

export const settings = new Settings()

