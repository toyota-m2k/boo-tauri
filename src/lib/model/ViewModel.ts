import {createBooProtocol} from "../protocol/BooProtocol";
import {
  type CurrentValueReadable,
  currentValueStore,
  type CurrentValueStore
} from "../utils/CurrentValueStore";
import {HostInfo} from "./HostInfo";
import {launch} from "../utils/Utils";
import PasswordDialog from "../dialog/PasswordDialog.svelte";
import {showDialog} from "../dialog/Dialog";
import SettingsDialog from "../dialog/SettingsDialog.svelte";
import {settings} from "./Settings";
import type {IChapter, IChapterList, IListRequest, IMediaItem, IMediaList, PlayMode} from '../protocol/IBooProtocol'

export interface IViewModel {
  // Observable Properties
  // requirePassword: () => Promise<string|undefined>
  mediaList: CurrentValueReadable<IMediaList>
  listRequest: IListRequest
  hostInfo: CurrentValueReadable<HostInfo | undefined>
  currentIndex: CurrentValueReadable<number>
  // currentMediaItem: CurrentValueReadable<IMediaItem|undefined>
  isBusy: CurrentValueReadable<boolean>
  chapterList: CurrentValueReadable<IChapterList | undefined>
  currentPosition: CurrentValueStore<number>
  fitMode: CurrentValueStore<FitMode>
  playMode: CurrentValueReadable<PlayMode>

  // dialogs
  // settingsDialog: CurrentValueReadable<boolean>
  // passwordDialog: CurrentValueReadable<boolean>

  videoSupported: CurrentValueReadable<boolean>
  audioSupported: CurrentValueReadable<boolean>
  photoSupported: CurrentValueReadable<boolean>
  typeSelectable: CurrentValueReadable<boolean>

  videoSelected: CurrentValueStore<boolean>
  audioSelected: CurrentValueStore<boolean>
  photoSelected: CurrentValueStore<boolean>

  // Methods
  initialize(): Promise<void>
  setHost: (hostInfo: HostInfo) => Promise<boolean>
  setCurrentIndex: (index: number) => boolean
  mediaUrl: (mediaItem: IMediaItem) => string
  mediaItemAt: (index: number) => IMediaItem | undefined
  next: () => boolean
  hasNext: () => boolean
  prev: () => boolean
  hasPrev: () => boolean
  nextChapter: () => void
  prevChapter: (isPlaying: boolean) => void

  nextPlayMode(): void

  showSettingsDialog: () => void

  showPasswordDialog: () => Promise<string|undefined>
  // closePasswordDialog: (password:string | undefined) => void
}

export type FitMode = "fit" | "fill" | "original"

class ViewModel implements IViewModel {
  requirePassword: () => Promise<string|undefined> = this.showPasswordDialog

  boo = createBooProtocol(() => {
    return this.requirePassword()
  })

  // カレントホスト
  hostInfo = currentValueStore<HostInfo | undefined>(undefined)

  // カレントホスト設定変更中の操作を禁止するためのフラグ
  isBusy = currentValueStore<boolean>(false)

  // メディアリスト
  mediaList = currentValueStore<IMediaList>({list: [], date: 0})

  listRequest: IListRequest = {type: "all", sourceType: 1}


  async initialize() {
    await settings.load()
    this.playMode.set(settings.playMode)
    const hostInfo = settings.currentHost
    if (hostInfo) {
      await this.setHost(hostInfo)
    } else {
      await this.showSettingsDialog()
    }
  }


  // プレーヤー関連

  // - カレントメディアインデックス
  private _currentIndex = currentValueStore<number>(-1)
  get currentIndex(): CurrentValueReadable<number> {
    return this._currentIndex
  }

  // - カレントアイテムのURLを取得
  mediaUrl(mediaItem: IMediaItem): string {
    return this.boo.getItemUrl(mediaItem)
  }

  // インデックスで指定されたMediaItemを取得
  mediaItemAt(index: number): IMediaItem | undefined {
    return (index < 0 || this.mediaList.currentValue.list.length <= index) ? undefined : this.mediaList.currentValue.list[index]
  }

  // currentMediaItem = currentValueMap(this.currentIndex, index => (index<0 || this.mediaList.currentValue.list.length <= index) ? undefined : this.mediaList.currentValue.list[index])

  // チャプターリスト
  chapterList = currentValueStore<IChapterList | undefined>(undefined)

  // hasChapterList: CurrentValueReadable<boolean> = currentValueMap(this.chapterList, cl => cl !== undefined && cl.items.length > 0)

  // 再生位置
  currentPosition = currentValueStore<number>(0)

  fitMode: CurrentValueStore<FitMode> = currentValueStore<FitMode>("fit")

  // 再生方法
  playMode: CurrentValueStore<PlayMode> = currentValueStore<PlayMode>("sequential")


  typeSelectable = currentValueStore<boolean>(false)

  videoSupported = currentValueStore<boolean>(false)
  audioSupported = currentValueStore<boolean>(false)
  photoSupported = currentValueStore<boolean>(false)

  videoSelected = currentValueStore<boolean>(true)
  audioSelected = currentValueStore<boolean>(true)
  photoSelected = currentValueStore<boolean>(true)

  // Dialogs
  // settingsDialog = currentValueStore<boolean>(false)
  // passwordDialog = currentValueStore<boolean>(false)

  async setHost(hostInfo: HostInfo): Promise<boolean> {
    if (this.isBusy.currentValue) {
      return false
    }

    this._currentIndex.set(-1)
    this.currentPosition.set(0)
    this.mediaList.set({list: [], date: 0})
    this.hostInfo.set(undefined)
    this.isBusy.set(true)

    this.typeSelectable.set(false)
    this.videoSupported.set(false)
    this.audioSupported.set(false)
    this.photoSupported.set(false)

    this.videoSelected.set(true)
    this.audioSelected.set(true)
    this.photoSelected.set(true)

    try {
      if (await this.boo.setup(hostInfo)) {
        const list = await this.boo.list(this.listRequest)
        this.mediaList.set(list)
        this.hostInfo.set(hostInfo)
        if (list.list.length > 0) {
          this.setCurrentIndex(0)
        }
        let c = 0
        if(this.boo.isSupported("v")) {
          this.videoSupported.set(true)
          c++
        }
        if(this.boo.isSupported("a")) {
          this.audioSupported.set(true)
          c++
        }
        if(this.boo.isSupported("p")) {
          this.photoSupported.set(true)
          c++
        }
        if(c>1) {
          this.typeSelectable.set(true)
        }
        return true
      } else {
        return false
      }
    } finally {
      this.isBusy.set(false)
    }
  }

  setCurrentIndex(index: number): boolean {
    const mediaList = this.mediaList.currentValue
    if (0 <= index && index < mediaList.list.length) {
      this.chapterList.set(undefined)
      this._currentIndex.set(index)
      launch(async () => {
        const cl = await this.boo.chapters(mediaList.list[index].id)
        if (index == this.currentIndex.currentValue) {   // check if the index is still the same
          this.chapterList.set(cl)
        }
      })
      return true
    } else {
      return false
    }
  }

  next(): boolean {
    return this.setCurrentIndex(this.currentIndex.currentValue + 1)
  }

  hasNext(): boolean {
    const list = this.mediaList.currentValue
    const index = this.currentIndex.currentValue
    return index + 1 < list.list.length
  }

  prev(): boolean {
    return this.setCurrentIndex(this.currentIndex.currentValue - 1)
  }

  hasPrev(): boolean {
    const index = this.currentIndex.currentValue
    return index > 0
  }

  private goChapter(chapter: IChapter | undefined) {
    if (chapter) {
      this.currentPosition.set(chapter.position / 1000)
    }
  }

  nextChapter(/*isPlaying:boolean*/) {
    const cl = this.chapterList.currentValue?.items
    const pos = this.currentPosition.currentValue * 1000 // ms
    this.goChapter(cl?.find((c, i) => {
      return pos < c.position
    }))
  }

  prevChapter(isPlaying: boolean) {
    const cl = this.chapterList.currentValue?.items
    const pos = this.currentPosition.currentValue * 1000 - (isPlaying ? 250 : 0)  // ms
    this.goChapter(cl?.findLast((c, i) => {
      return pos > c.position
    }))
  }

  nextPlayMode() {
    const current = this.playMode.currentValue
    const next = current === "sequential" ? "repeat" : current === "repeat" ? "single" : "sequential"
    this.playMode.set(next)
    settings.playMode = next
  }

  async showSettingsDialog() {
    if(await showDialog<boolean>((params) => {
      return new SettingsDialog(params)
    })) {
      const hostInfo = settings.currentHost
      if(hostInfo) {
        await this.setHost(hostInfo)
      }
    }
  }

  private passwordPromise: Promise<string|undefined> | undefined
  private passwordResolver: ((value: string|undefined) => void) | undefined

  async showPasswordDialog(): Promise<string|undefined>{
    return showDialog<string|undefined>((params)=>{ return new PasswordDialog(params) })


    // let complettionProc: CompletionProc<string|undefined>|undefined = undefined
    // function complete(value: string|undefined) {
    //   if(complettionProc) {
    //     complettionProc(value)
    //   }
    // }
    //
    // const elem = document.getElementById("dialogContainer") as HTMLElement
    // let dlg: PasswordDialog|undefined
    // const password = await new Promise<string|undefined>((resolve, reject) => {
    //   dlg = new PasswordDialog({
    //     target: elem,
    //     props: {
    //       title: "Password",
    //       completion: (value:string|undefined)=> {
    //         resolve(value)
    //       }
    //     }
    //   })
    // })
    // if(dlg!==undefined) {
    //   dlg.$destroy()
    // }
    // return password
  }

  // closePasswordDialog(password:string | undefined) {
  //   this.passwordDialog.set(false)
  //   if(this.passwordResolver) {
  //     this.passwordResolver(password)
  //   }
  // }
}

export type CompletionProc<T> = (value: T) => void
export const viewModel: IViewModel = new ViewModel()