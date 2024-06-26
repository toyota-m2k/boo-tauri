import {getCurrent} from '@tauri-apps/api/window'
import {app, os} from '@tauri-apps/api'
import {logger} from "../model/DebugLog";
import {BaseDirectory, createDir, type FsOptions, readTextFile, writeTextFile} from "@tauri-apps/api/fs";
import {appDataDir} from "@tauri-apps/api/path";
import {tick} from "svelte";
import {delay} from "./Utils";
import {TauriEvent} from "@tauri-apps/api/event";

export type OSPlatForm = "L" | "M" | "W" | "U" | "LB" | "MB" | "WB" | "UB"

export type FSType = "uav" | "appdata" | "app" | "default"

class TauriEx {

  async setupTitleBar() {
    //const version = await import('../../../package.json').then((pkg) => pkg.version)
    try {
      const version = await app.getVersion()
      // logger.info("version = " + version)
      await getCurrent().setTitle(`BooTauri - ${version}`)
    } catch(e) {
      logger.error('Failed to set title bar: ' + e)
    }

  }

  async fullscreen(flag: boolean): Promise<void> {
    logger.info('fullscreen: ' + flag)
    try {
      if (flag) {
        // Windowを最大化
        await getCurrent().maximize()
        // Fullscreen（タイトルバー非表示）にする
        await getCurrent().setFullscreen(true)
      } else {
        await getCurrent().unmaximize()
        await getCurrent().setFullscreen(false)
      }
    } catch (e) {
      logger.error('Failed to set fullscreen: ' + e)
    }
  }

  async isFullscreen(): Promise<boolean> {
    try {
      const fs = await getCurrent().isFullscreen()
      const max = await getCurrent().isMaximized()
      logger.debug("fullscreen: " + fs + ", maximized: " + max)
      return fs || max
    } catch (e) {
      logger.error('Failed to get fullscreen: ' + e)
      return false
    }
  }

  async minimize(): Promise<void> {
    try {
      await getCurrent().minimize()
    } catch (e) {
      logger.error('Failed to minimize')
    }
  }
  async isMinimized(): Promise<boolean> {
    try {
      return await getCurrent().isMinimized()
    } catch (e) {
      logger.error('Failed to get minimized')
      return false
    }
  }

  os: OSPlatForm|undefined = undefined
  async getOS(): Promise<OSPlatForm> {
    if(this.os) {return this.os }
    try {
      switch (await os.type()) {
        case "Linux":
          this.os = "L"
          break
        case "Darwin":
          this.os = "M"
          break
        case "Windows_NT":
          this.os = "W"
          break
        default:
          this.os = "U"
          break
      }
    } catch (e) {
      logger.info("it may not be tauri")
      const userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']

      if (macosPlatforms.indexOf(platform) !== -1) {
        this.os = 'MB'
      } else if (windowsPlatforms.indexOf(platform) !== -1) {
        this.os = 'WB'
      }   else if (!os && /Linux/.test(platform)) {
        this.os = 'LB'
      } else {
        this.os = 'UB'
      }
    }
    return this.os
  }

  async setSizeChangeListener(listener: (type:string, width: number, height: number) => void): Promise<()=>void> {
    return await getCurrent().onResized(e => {
      listener(e.payload.type, e.payload.width, e.payload.height)
    })
  }

  async setBlurListener(listener: () => void): Promise<()=>void> {
    return await getCurrent().listen(TauriEvent.WINDOW_BLUR, listener)
  }

  async setFocusListener(listener: (focused: boolean) => void): Promise<()=>void> {
      return await getCurrent().onFocusChanged(({payload: focused}) => {
        listener(focused)
      })
  }

  async setWindowCloseListener(listener: () => void|Promise<void>): Promise<()=>void> {
    try {
      logger.info('set window close listener')
      return await getCurrent().onCloseRequested(async (e) => {
        const r = listener()
        if(r instanceof Promise) await r
        // this.count++
        // if(this.count<10) {
        //   e.preventDefault()
        // }
      })
    } catch(error) {
      logger.error('Failed to set window close listener')
      return ()=>{}
    }
  }

  async closeApp(): Promise<void> {
    try {
      await getCurrent().close()
    } catch (e) {
      logger.error('Failed to close app')
    }
  }

  async minimizeApp(): Promise<void> {
    try {
      if(await this.isFullscreen()) {
        await getCurrent().unmaximize()
        await getCurrent().setFullscreen(false)
        if(await this.getOS()==='M') {
          // フルスクリーン解除後１秒待つ。。。これがないと一旦は最小化されるが、すぐに戻ってきてしまう。(MACのみ)
          await delay(1000)
        }
      }
      await getCurrent().minimize()
    } catch (e) {
      logger.error('Failed to minimize app')
    }
  }


  fsType: FSType|undefined = undefined

  private async checkFsAndRead(filename:string, ops?: FsOptions): Promise<{result:boolean, data:string}> {
    const result= {result: false, data: ""}
    try {
      result.data = await readTextFile(filename, ops)
      result.result = true
    } catch(e) {
      logger.error('read error :' + e)
      try {
        await writeTextFile(filename, "{}", ops)
        result.data = "{}"
        result.result = true
      } catch (e) {
        logger.error('write error: ' + e)
      }
    }
    return result
  }


  async readJson(filename:string): Promise<string|undefined> {
    if ((await this.getOS()).length !== 1) {
      // browser mode
      return undefined
    } else {
      try {
        const dir = await appDataDir()
        return await readTextFile(filename, {dir: BaseDirectory.AppData})
      } catch(e) {
        logger.error('Read Failed (appdata): ' + e)
        return undefined
      }
    }
  }

  async writeJson(filename:string, data:string): Promise<boolean> {
    if ((await this.getOS()).length !== 1) {
      // browser mode
      return false
    } else {
      try {
        const dir = await appDataDir()
        await createDir(dir, {recursive: true})
        await writeTextFile(filename, data, {dir: BaseDirectory.AppData})
        return true
      } catch(e) {
        logger.error('Write Failed (appdata): ' + e)
        return false
      }
    }

  }
}


export const tauriEx = new TauriEx()