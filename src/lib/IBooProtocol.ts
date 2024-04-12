interface IHostInfo {
    host: string
    port: number
}

interface IDResponse {
    id: string
}

interface ICapabilities {
    cmd: string
    serverName: string
    version: number
    root: string
    category: boolean
    rating: boolean
    mark: boolean
    chapter: boolean
    reputation: number  // 0: none, 1: read, 2: read|write
    diff: boolean
    sync: boolean
    acceptRequest: boolean
    hasView: boolean
    authentication: boolean
    challenge: string|undefined
}

interface IAuthToken {
    token: string
    term: number
}

interface IListRequest {
    type?: string,       // all | photo | video | audio
    category?: string|undefined,
    mark?: number|undefined,
    rating?: number|undefined,
    sourceType?: number, // 0: all, 1: listed, 2: selected
    search?: string|undefined,
}

interface IMediaItem {
    id: string,         // media id
    name: string,
    type: string,       // mp4 | jpg | mp3
    size: number,
    volume: number|undefined,
    duration: number|undefined,
}

interface IMediaList {
    list: IMediaItem[],
    date: number,    // last modified
}

interface IChapter {
    position: number,
    label: string,
    skip: boolean,
}

interface IChapterList {
    items: IChapter[],
    id: string,                 // media id
}

interface IRequtation {
    id: string,
    rating?: number|undefined,
    mark?: number|undefined,
    category?: string|undefined,
}

interface ICategory {
    label: string,
    sort: number,
    color: number,
    svg: string,
}


interface IMark {
    mark: number,
    label: string,
    svg: string,
}

interface IRating {
    rating: number,
    label: string,
    svg: string,
}

interface IRatingList {
    default: number,
    items: IRating[],
}

interface IBooProtocol {
    setup(hostInfo: IHostInfo): Promise<boolean>

    list(req:IListRequest): Promise<IMediaList>
    chapters(mediaId:string): Promise<IChapterList>
    checkUpdate(): Promise<boolean>

    getItemUrl(mediaItem:IMediaItem): string

    getCurrent(): Promise<string> // return current media id
    setCurrent(mediaId:string): Promise<void>

    getReputation(mediaId:string): Promise<IRequtation>
    setReputation(req:IRequtation): Promise<void>

    categories(): Promise<ICategory[]>
    marks(): Promise<IMark[]>
    ratings(): Promise<IRatingList>
}

