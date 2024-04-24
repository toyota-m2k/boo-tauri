import { getCurrent } from '@tauri-apps/api/window'
import { os } from '@tauri-apps/api'
import {logger} from "../model/DebugLog";

export async function tauriFullScreen(flag:boolean): Promise<void> {
  try {
    if (flag) {
      // Windowを最大化
      await getCurrent().maximize()
      // Fullscreen（タイトルバー非表示）にする
      await getCurrent().setFullscreen(true)
    } else {
      await getCurrent().setFullscreen(false)
      await getCurrent().unmaximize()
    }
  } catch(e) {
    logger.error('Failed to set fullscreen')
  }
}

export type OS = "L" | "M" | "W" | "U" | "LB" | "MB" | "WB" | "UB"

export async function getOS(): Promise<OS> {
  try {
    switch(await os.type()) {
      case "Linux": return "L"
      case "Darwin": return "M"
      case "Windows_NT": return "W"
      default: return "U"
    }
  } catch(e) {
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

