import { getCurrent } from '@tauri-apps/api/window'
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

