import { getCurrent } from '@tauri-apps/api/window'
import { os } from '@tauri-apps/api'
import {logger} from "../model/DebugLog";

export type OSPlatForm = "L" | "M" | "W" | "U" | "LB" | "MB" | "WB" | "UB"

class TauriEx {
  async fullscreen(flag: boolean): Promise<void> {
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
      logger.error('Failed to set fullscreen')
    }
  }

  async isFullscreen(): Promise<boolean> {
    try {
      const fs = await getCurrent().isFullscreen()
      const max = await getCurrent().isMaximized()
      logger.debug("fullscreen: " + fs + ", maximized: " + max)
      return fs || max
    } catch (e) {
      logger.error('Failed to get fullscreen')
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

  async getOS(): Promise<OSPlatForm> {
    try {
      switch (await os.type()) {
        case "Linux":
          return "L"
        case "Darwin":
          return "M"
        case "Windows_NT":
          return "W"
        default:
          return "U"
      }
    } catch (e) {
      logger.info("it may not be tauri")
      const userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']

      if (macosPlatforms.indexOf(platform) !== -1) {
        return 'MB'
      } else if (windowsPlatforms.indexOf(platform) !== -1) {
        return 'WB'
      } else if (!os && /Linux/.test(platform)) {
        return 'LB'
      } else {
        return 'UB'
      }
    }
  }

  async setFocusListener(listener: (focused: boolean) => void): Promise<()=>void> {
      return await getCurrent().onFocusChanged(({payload: focused}) => {
        listener(focused)
      })
  }
}

export const tauriEx = new TauriEx()