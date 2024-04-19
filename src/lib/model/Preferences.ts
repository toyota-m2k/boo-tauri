import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import {currentValueStore} from "../utils/CurrentValueStore";

export class Preferences {
  private static readonly SETTINGS_FILE = 'settings.json'

  private fileName: string
  private settings: Record<string, unknown> = {}
  private dirty = false

  constructor(fileName: string=Preferences.SETTINGS_FILE) {
    this.fileName = fileName
  }
  public async load(): Promise<void> {
    try {
      const settings = await readTextFile(this.fileName)
      this.settings = JSON.parse(settings)
      this.dirty = false
    } catch (error) {
      console.error('Failed to load settings', error)
      this.settings = {
        hostInfoList: [
          {
            displayName: "2F-MakibaO-Boo",
            host: "192.168.0.151",
            port: 3500
          },
          {
            displayName: "2F-MakibaO-SA",
            host: "192.168.0.151",
            port: 3800
          },
          {
            displayName: "1F-TamayoPtx-Boo",
            host: "192.168.0.152",
            port: 3500
          },
          {
            displayName: "1F-TamayoPtx-SA",
            host: "192.168.0.152",
            port: 3800
          },
        ],
        currentHost: {
          displayName: "2F-MakibaO-Boo",
          host: "192.168.0.151",
          port: 3500
        },

      }
    }
  }

  public async save(force:boolean=false): Promise<void> {
    if(!this.dirty && !force) return
    try {
      await writeTextFile(this.fileName, JSON.stringify(this.settings))
    } catch (error) {
      console.error('Failed to save settings', error)
    }
  }

  public get<T>(key: string, defaultValue: T): T {
    return this.settings[key] as T ?? defaultValue
  }

  public set<T>(key: string, value: T): void {
    this.settings[key] = value
    this.dirty = true
  }
}