import {createBooProtocol} from "./BooProtocol";
import {
    currentValueMap,
    type CurrentValueReadable,
    currentValueStore,
    type CurrentValueStore
} from "./CurrentValueStore";
import {HostInfo} from "./HostInfo";
import {launch} from "./Utils";

export interface IViewModel {
    // Observable Properties
    requirePassword: ()=>Promise<string>
    mediaList: CurrentValueReadable<IMediaList>
    listRequest: IListRequest
    hostInfo: CurrentValueReadable<HostInfo|undefined>
    currentIndex: CurrentValueReadable<number>
    // currentMediaItem: CurrentValueReadable<IMediaItem|undefined>
    isBusy: CurrentValueReadable<boolean>
    chapterList: CurrentValueReadable<IChapterList|undefined>
    currentPosition: CurrentValueStore<number>

    // Methods
    setHost: (hostInfo:HostInfo)=>Promise<boolean>
    setCurrentIndex: (index:number)=>boolean
    mediaUrl: (mediaItem:IMediaItem)=>string
    mediaItemAt: (index:number)=>IMediaItem|undefined
    next: ()=>boolean
    hasNext: ()=>boolean
    prev: ()=>boolean
    hasPrev: ()=>boolean
    nextChapter: ()=>void
    prevChapter: (isPlaying:boolean)=>void

}

class ViewModel implements IViewModel {
    requirePassword : ()=>Promise<string> = async ()=>{return "a"}
    boo = createBooProtocol(()=>{
        return this.requirePassword()
    })

    mediaList= currentValueStore<IMediaList>({list:[], date:0})

    listRequest: IListRequest = { type: "all", sourceType: 1 }

    hostInfo = currentValueStore<HostInfo|undefined>(undefined)

    private _currentIndex = currentValueStore<number>(-1)
    get currentIndex(): CurrentValueReadable<number> { return this._currentIndex }
    mediaUrl(mediaItem:IMediaItem): string {
        return this.boo.getItemUrl(mediaItem)
    }
    mediaItemAt(index:number):IMediaItem|undefined {
        return (index<0 || this.mediaList.currentValue.list.length <= index) ? undefined : this.mediaList.currentValue.list[index]
    }

    // currentMediaItem = currentValueMap(this.currentIndex, index => (index<0 || this.mediaList.currentValue.list.length <= index) ? undefined : this.mediaList.currentValue.list[index])

    isBusy = currentValueStore<boolean>(false)

    chapterList = currentValueStore<IChapterList|undefined>(undefined)

    // hasChapterList: CurrentValueReadable<boolean> = currentValueMap(this.chapterList, cl => cl !== undefined && cl.items.length > 0)

    currentPosition = currentValueStore<number>(0)

    async setHost(hostInfo:HostInfo): Promise<boolean> {
        if(this.isBusy.currentValue) {
            return false
        }

        this._currentIndex.set(-1)
        this.currentPosition.set(0)
        this.mediaList.set({list:[], date:0})
        this.hostInfo.set(undefined)
        this.isBusy.set(true)

        try {
            if (await this.boo.setup(hostInfo)) {
                const list = await this.boo.list(this.listRequest)
                this.mediaList.set(list)
                this.hostInfo.set(hostInfo)
                if(list.list.length > 0) {
                    this.setCurrentIndex(0)
                }
                return true
            } else {
                return false
            }
        } finally {
            this.isBusy.set(false)
        }
    }

    setCurrentIndex(index:number):boolean {
        const mediaList = this.mediaList.currentValue
        if(0<=index && index < mediaList.list.length) {
            this.chapterList.set(undefined)
            this._currentIndex.set(index)
            launch(async () => {
                const cl = await this.boo.chapters(mediaList.list[index].id)
                if(index == this.currentIndex.currentValue) {   // check if the index is still the same
                    this.chapterList.set(cl)
                }
            })
            return true
        } else {
            return false
        }
    }

    next():boolean {
        return this.setCurrentIndex(this.currentIndex.currentValue+1)
    }
    hasNext():boolean {
        const list = this.mediaList.currentValue
        const index = this.currentIndex.currentValue
        return index+1 < list.list.length
    }

    prev():boolean {
        return this.setCurrentIndex(this.currentIndex.currentValue-1)
    }

    hasPrev():boolean {
        const index = this.currentIndex.currentValue
        return index > 0
    }

    private goChapter(chapter:IChapter|undefined) {
        if(chapter) {
            this.currentPosition.set(chapter.position/1000)
        }
    }

    nextChapter(/*isPlaying:boolean*/) {
        const cl = this.chapterList.currentValue?.items
        const pos = this.currentPosition.currentValue * 1000 // ms
        this.goChapter(cl?.find((c, i) => {
            return pos < c.position
        }))
    }
    prevChapter(isPlaying:boolean) {
        const cl = this.chapterList.currentValue?.items
        const pos = this.currentPosition.currentValue * 1000  -  (isPlaying ? 250 : 0 )  // ms
        this.goChapter(cl?.findLast((c, i) => {
            return pos > c.position
        }))
    }
}

export const viewModel: IViewModel = new ViewModel()