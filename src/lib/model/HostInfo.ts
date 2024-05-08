import type {IHostInfo} from '../protocol/IBooProtocol'

export class HostInfo implements IHostInfo {
  displayName: string
  host: string
  port: number

  currentMediaId?: string|undefined
  currentMediaPosition?: number|undefined

  constructor(name: string, host: string, port: number) {
    this.displayName = name
    this.host = host
    this.port = port
  }
}


export class HostInfoList {
  private readonly _list: HostInfo[]
  private _isModified = false
  private _currentHostIndex = -1

  constructor(list: HostInfo[] = [], currentHostIndex: number = -1) {
    this._list = list
    this._currentHostIndex = currentHostIndex
  }

  private composeHostKey(host: string, port: number): string {
    return `${host}:${port}`
  }

  private hostKey(hostInfo: HostInfo): string {
    return this.composeHostKey(hostInfo.host, hostInfo.port)
  }

  get currentHost(): HostInfo|undefined {
    return this._currentHostIndex >= 0 ? this._list[this._currentHostIndex] : undefined
  }

  get currentHostIndex(): number {
    return this._currentHostIndex
  }

  set currentHost(hostInfo: HostInfo|undefined) {
    if(hostInfo) {
      const index = this._list.findIndex((info) => this.hostKey(info) === this.hostKey(hostInfo))
      if(index >= 0 && index!==this._currentHostIndex) {
        this._currentHostIndex = index
        this._isModified = true
      }
    } else if(this._currentHostIndex >= 0) {
      this._currentHostIndex = -1
      this._isModified = true
    }
  }

  // setCurrentHostIndex(index: number) {
  //   if(index >= 0 && index<this._list.length && index!==this._currentHostIndex) {
  //     this._currentHostIndex = index
  //     this._isModified = true
  //   }
  // }

  // updateCurrentMediaInfo(mediaId: string|undefined, position: number=0) {
  //   if(this._currentHostIndex < 0) return
  //   const hostInfo = this._list[this._currentHostIndex]
  //   hostInfo.currentMediaId = mediaId
  //   hostInfo.currentMediaPosition = position
  //   this._isModified = true
  // }
  updateCurrentMediaInfo(mediaId: string|undefined, position: number=0, hostInfo?: HostInfo|undefined) {
    hostInfo = hostInfo || this.currentHost
    if(!hostInfo) return
    const target = this._list.find((info) => this.hostKey(info) === this.hostKey(hostInfo))
    if(!target) return
    target.currentMediaId = mediaId
    target.currentMediaPosition = position
    this._isModified = true
  }

  get list(): HostInfo[] {
    return this._list
  }
  get isModified(): boolean {
    return this._isModified
  }
  clearModified() {
    this._isModified = false
  }

  add(hostInfo: HostInfo): boolean {
    const index = this._list.findIndex((info) => this.hostKey(info) === this.hostKey(hostInfo))
    if(index >= 0) return false
    this._isModified = true
    this._list.push(hostInfo)
    return true
  }
  // update(hostInfo: HostInfo): boolean {
  //   const index = this._list.findIndex((info) => this.hostKey(info) === this.hostKey(hostInfo))
  //   if(index < 0) return false
  //   this._isModified = true
  //   this._list[index] = hostInfo
  //   return true
  // }
  remove(hostInfo:HostInfo): number {
    const index = this._list.findIndex((info) => this.hostKey(info) === this.hostKey(hostInfo))
    if(index < 0) return -1
    this._isModified = true
    this._list.splice(index, 1)
    return index
  }
}