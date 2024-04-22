import { getCurrent } from '@tauri-apps/api/window'
import {logger} from "../model/DebugLog";

export async function tauriFullScreen(flag:boolean): Promise<void> {
  try {
    if (flag) {
      if (!await getCurrent().isMaximized()) {
        return await getCurrent().maximize()
      }
    } else {
      if (await getCurrent().isMaximized()) {
        return await getCurrent().unmaximize()
      }
    }
  } catch(e) {
    logger.error('Failed to set fullscreen')
  }
}

