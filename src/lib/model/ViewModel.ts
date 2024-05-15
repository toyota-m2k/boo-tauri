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
import {type ColorVariation, settings} from "./Settings";
import type {IChapter, IChapterList, IListRequest, IMediaItem, IMediaList, PlayMode} from '../protocol/IBooProtocol'
import type {IDisposable} from '../utils/IDisposable'
import {Disposer} from '../utils/Disposer'
import {disposableSubscribe} from '../utils/DisposableSubscribe'
import {Env} from "../utils/Env";
import {tauriEx} from "../utils/TauriEx";
import {getDisabledRanges, type IRange, RangeOrNull} from "./ChapterUtils";

export interface IViewModel {
  colorVariation: CurrentValueStore<ColorVariation>
  isDarkMode: CurrentValueStore<boolean>

  // Observable Properties
  // requirePassword: () => Promise<string|undefined>
  mediaList: CurrentValueReadable<IMediaList>
  listRequest: IListRequest
  hostInfo: CurrentValueReadable<HostInfo | undefined>
  currentIndex: CurrentValueReadable<number>
  initialSeekPosition: number
  // currentMediaItem: CurrentValueReadable<IMediaItem|undefined>
  isBusy: CurrentValueReadable<boolean>
  chapterList: CurrentValueReadable<IChapterList | undefined>
  disabledRanges: CurrentValueReadable<IRange[]>
  currentPosition: CurrentValueStore<number>
  duration: CurrentValueStore<number>
  fitMode: CurrentValueStore<FitMode>
  playMode: CurrentValueReadable<PlayMode>

  playing: CurrentValueStore<boolean>
  mediaScale: CurrentValueReadable<number>

  // non-observables
  currentItem:IMediaItem|undefined

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
  recoverMediaUrl: (mediaItem: IMediaItem) => Promise<string>
  mediaItemAt: (index: number) => IMediaItem | undefined
  next: () => boolean
  hasNext: () => boolean
  prev: () => boolean
  hasPrev: () => boolean
  nextChapter: () => void
  prevChapter: () => void

  nextPlayMode(): void

  showSettingsDialog: () => void

  showPasswordDialog: () => Promise<string|undefined>
  // closePasswordDialog: (password:string | undefined) => void

  zoom(v: number): void

  saveCurrentPosition: (hostInfo?:HostInfo) => Promise<void>
}

export type FitMode = "fit" | "fill" | "original"

class ViewModel implements IViewModel {
  requirePassword: () => Promise<string|undefined> = this.showPasswordDialog

  boo = createBooProtocol(() => {
    return this.requirePassword()
  })

  // デザインテーマ
  colorVariation: CurrentValueStore<ColorVariation> = currentValueStore<ColorVariation>("default")
  isDarkMode: CurrentValueStore<boolean> = currentValueStore<boolean>(false)

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
    this.colorVariation.set(settings.colorVariation)
    this.isDarkMode.set(settings.isDarkMode)

    const hostInfo = settings.currentHost
    if (hostInfo) {
      await this.setHost(hostInfo)
    } else {
      await this.showSettingsDialog()
    }
    if(Env.isTauri) {
      await tauriEx.setWindowCloseListener(() => {
        return this.saveCurrentPosition()
      })
    }
  }


  // プレーヤー関連

  // - カレントメディアインデックス
  private _currentIndex = currentValueStore<number>(-1)
  get currentIndex(): CurrentValueReadable<number> {
    return this._currentIndex
  }

  get currentItem():IMediaItem|undefined {
    return this.mediaItemAt(this._currentIndex.currentValue)
  }

  // - カレントアイテムのURLを取得
  mediaUrl(mediaItem: IMediaItem): string {
    return this.boo.getItemUrl(mediaItem)
  }
  async recoverMediaUrl(mediaItem: IMediaItem): Promise<string|undefined> {
    if(!await this.boo.noop()) {
      return undefined
    }
    return this.boo.getItemUrl(mediaItem)
  }

  // インデックスで指定されたMediaItemを取得
  mediaItemAt(index: number): IMediaItem | undefined {
    return (index < 0 || this.mediaList.currentValue.list.length <= index) ? undefined : this.mediaList.currentValue.list[index]
  }

  // currentMediaItem = currentValueMap(this.currentIndex, index => (index<0 || this.mediaList.currentValue.list.length <= index) ? undefined : this.mediaList.currentValue.list[index])

  // チャプターリスト
  chapterList = currentValueStore<IChapterList | undefined>(undefined)

  disabledRanges = currentValueStore<IRange[]>([])

  // hasChapterList: CurrentValueReadable<boolean> = currentValueMap(this.chapterList, cl => cl !== undefined && cl.items.length > 0)

  // 再生位置
  currentPosition = currentValueStore<number>(0)
  duration = currentValueStore<number>(0)

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

  playing = currentValueStore(false)

  // Dialogs
  // settingsDialog = currentValueStore<boolean>(false)
  // passwordDialog = currentValueStore<boolean>(false)

  private filterObserver: IDisposable | undefined
  private rawMediaList: IMediaList | undefined

  private onFilterChanged() {
    if (!this.rawMediaList) return
    const current = this.mediaItemAt(this.currentIndex.currentValue)
    const filteredList = this.rawMediaList?.list.filter(item => {
      return (this.videoSelected.currentValue && item.media === "v") ||
        (this.audioSelected.currentValue && item.media === "a") ||
        (this.photoSelected.currentValue && item.media === "p")
    })
    const index = filteredList.findIndex(item => item.id === current?.id)
    if (index < 0) {
      this._currentIndex.set(-1)
      this.currentPosition.set(0)
      this.duration.set(0)
    }
    this.mediaList.set({list: filteredList, date: this.rawMediaList.date})
    this.setCurrentIndex(index)
  }

  private _initialSeekPosition = 0
  get initialSeekPosition() {
    const r = this._initialSeekPosition
    this._initialSeekPosition = 0
    return r
  }

  async setHost(hostInfo: HostInfo): Promise<boolean> {
    if (this.isBusy.currentValue) {
      return false
    }

    this._currentIndex.set(-1)
    this.currentPosition.set(0)
    this.duration.set(0)
    this.mediaList.set({list: [], date: 0})
    this.hostInfo.set(undefined)
    this.isBusy.set(true)

    this.filterObserver?.dispose()
    this.filterObserver = undefined

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
        this.rawMediaList = list
        this.mediaList.set(list)
        this.hostInfo.set(hostInfo)

        // 前回の再生位置を復元
        let playIndex = 0
        if(hostInfo.currentMediaId) {
          list.list.find((item, index) => {
            if(item.id === hostInfo.currentMediaId) {
              playIndex = index
              this._initialSeekPosition = hostInfo.currentMediaPosition ?? 0
              // logger.info(`found: ${item.id} ${playIndex} -- ${playPosition}`)
              return true
            }
          })
        }
        this.setCurrentIndex(playIndex)

        const observers = new Disposer()
        if(this.boo.isSupported("v")) {
          this.videoSupported.set(true)
          observers.add(disposableSubscribe(this.videoSelected, () => { this.onFilterChanged() }))
        }
        if(this.boo.isSupported("a")) {
          this.audioSupported.set(true)
          observers.add(disposableSubscribe(this.audioSelected, () => { this.onFilterChanged() }))
        }
        if(this.boo.isSupported("p")) {
          this.photoSupported.set(true)
          observers.add(disposableSubscribe(this.photoSelected, () => { this.onFilterChanged() }))
        }
        if(observers.count>1) {
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
      launch(async () => {
        await this.boo.noop()
        this.chapterList.set(undefined)
        this.disabledRanges.set([])
        this.mediaScale.set(1)
        this._currentIndex.set(index)
        const id = mediaList.list[index].id
        if(id!==settings.currentHost?.currentMediaId) {
          // 前回と異なるメディアが選択された場合は、再生位置をリセット
          // 初回起動時、設定変更後のsetHost()から呼ばれたときは、リセットしない。
          settings.hostInfoList.updateCurrentMediaInfo(id)
        }
        const cl = await this.boo.chapters(id)
        if (index === this.currentIndex.currentValue) {   // check if the index is still the same
          this.chapterList.set(cl)
          if(cl.chapters) {
            const mediaItem = this.currentItem
            if(mediaItem) {
              this.disabledRanges.set(getDisabledRanges(cl.chapters, RangeOrNull(mediaItem.start, mediaItem.end)))
            }
          }
        }
        await settings.save()
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
    const cl = this.chapterList.currentValue?.chapters
    const pos = this.currentPosition.currentValue * 1000 // ms
    this.goChapter(cl?.find((c) => {
      return pos < c.position
    }))
  }

  prevChapter() {
    const cl = this.chapterList.currentValue?.chapters
    const pos = this.currentPosition.currentValue * 1000 - (this.playing.currentValue ? 250 : 0)  // ms
    this.goChapter(cl?.findLast((c) => {
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
    const orgHost = this.hostInfo.currentValue
    if(await showDialog<boolean>((params) => {

      return new SettingsDialog(params)
    })) {
      await this.saveCurrentPosition(orgHost)
      const hostInfo = settings.currentHost
      if(hostInfo) {
        await this.setHost(hostInfo)
      }
    }
  }

  // private passwordPromise: Promise<string|undefined> | undefined
  // private passwordResolver: ((value: string|undefined) => void) | undefined

  async showPasswordDialog(): Promise<string|undefined>{
    return showDialog<string|undefined>((params)=>{ return new PasswordDialog(params) })
  }

  mediaScale = currentValueStore<number>(1)
  zoom(v: number): void {
    this.mediaScale.set(v)
  }

  async saveCurrentPosition(hostInfo?:HostInfo) {
    // logger.info(`saveCurrentPosition ${this.hostInfo.currentValue?.displayName} ${this.currentItem?.media} ${this.currentPosition.currentValue}`)
    if(this.hostInfo && this.currentItem?.id && this.currentItem.media !== "p" && this.currentPosition.currentValue > 0) {
      settings.hostInfoList.updateCurrentMediaInfo(this.currentItem.id, this.currentPosition.currentValue * 1000, hostInfo)
      await settings.save()
      // logger.info("saved")
      // await delay(3000)
    }
  }
}

export type CompletionProc<T> = (value: T) => void
export const viewModel: IViewModel = new ViewModel()