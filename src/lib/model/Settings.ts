import { HostInfo } from "./HostInfo";
import {Preferences} from "./Preferences";
import {launch} from "../utils/Utils";
import type {PlayMode} from '../protocol/IBooProtocol'

export interface ISettings {
  currentHost: HostInfo | undefined
  hostInfoList: HostInfo[]
  playMode: PlayMode
  slideShowInterval: number
  load(): Promise<void>
  save(): Promise<void>
}

export type ColorVariation = 'default' | 'orange' | 'melon' | 'cherry' | 'grape' | 'carrot' | 'blueberry' | 'soda'
export const colorVariations: ColorVariation[] = ['default', 'orange', 'melon', 'cherry', 'grape', 'carrot', 'blueberry', 'soda']

class Settings implements ISettings {
  private preferences = new Preferences()
  async load(): Promise<void> {
    await this.preferences.load()
  }
  get currentHost(): HostInfo|undefined {
    return this.preferences.get('currentHost', undefined)
  }
  set currentHost(hostInfo: HostInfo|undefined) {
    this.preferences.set('currentHost', hostInfo)
  }

  get hostInfoList(): HostInfo[] {
    return this.preferences.get('hostInfoList', [])
  }

  set hostInfoList(hostInfoList: HostInfo[]) {
    this.preferences.set('hostInfoList', hostInfoList)
  }

  get slideShowInterval(): number {
    return this.preferences.get('slideShowInterval', 1)
  }
  set slideShowInterval(interval: number) {
    this.preferences.set('slideShowInterval', interval)
  }

  get playMode(): PlayMode {
    return this.preferences.get('playMode', 'sequential')
  }
  set playMode(playMode: PlayMode) {
    this.preferences.set('playMode', playMode)
    launch(()=> { return this.save() })
  }

  get colorVariation(): ColorVariation {
    return this.preferences.get('colorVariation', 'default')
  }
  set colorVariation(colorVariation: ColorVariation) {
    this.preferences.set('colorVariation', colorVariation)
  }
  get isDarkMode(): boolean {
    return this.preferences.get('isDarkMode', false)
  }
  set isDarkMode(isDarkMode: boolean) {
    this.preferences.set('isDarkMode', isDarkMode)
  }

  async save() {
    await this.preferences.save()
  }
}

export const settings = new Settings()

