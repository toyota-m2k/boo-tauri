import {authentication} from "./Authentication"
import {BooError} from "./BooError";

class BooProtocolImpl implements IBooProtocol {
  private hostInfo: IHostInfo | undefined
  private capabilities: ICapabilities | undefined
  private authToken: IAuthToken | undefined
  private challenge: string | undefined
  private requirePassword: (() => Promise<string>)

  constructor(requirePassword: () => Promise<string>) {
    this.requirePassword = requirePassword
  }

  private reset() {
    this.capabilities = undefined
    this.hostInfo = undefined
    this.authToken = undefined
    this.challenge = undefined
  }

  async setup(hostInfo: IHostInfo): Promise<boolean> {
    try {
      this.reset()
      this.hostInfo = hostInfo
      this.capabilities = await this.getCapabilities(hostInfo)
      this.challenge = this.capabilities?.challenge
      return this.capabilities !== undefined
    } catch (e: any) {
      console.error(e)
      return false
    }
  }

  private async getCapabilities(hostInfo: IHostInfo): Promise<ICapabilities> {
    const url = this.baseUri + 'capability'
    const r = await fetch(url)
    if (!r.ok) {
      throw new Error(`fetch failed: ${r.status}`)
    }
    return (await r.json()) as ICapabilities
  }

  private get baseUri(): string {
    if (this.hostInfo === undefined) {
      throw new Error('hostInfo is not initialized')
    }
    return `http://${this.hostInfo.host}:${this.hostInfo.port}/`
  }

  private get needAuth(): boolean {
    return this.capabilities?.authentication === true
  }

  private async auth(password: string): Promise<boolean> {
    // if(!this.needAuth) {
    //     return true // no authentication required
    // }

    const challenge = await this.getChallenge(false)
    if (!challenge) {
      throw new BooError('generic', 'failed to get challenge')
    }
    const url = this.baseUri + 'auth'
    const r = await fetch(url, {
      method: "PUT",
      cache: "no-cache",
      headers: {
        "Content-Type": "text/plain",
      },
      body: authentication.createPassPhrase(password, challenge)
    })
    if (!r.ok) {
      return false
    }
    this.authToken = await r.json() as IAuthToken
    return true
  }

  private async getChallenge(force: boolean): Promise<string | undefined> {
    if (!force && this.challenge) {
      return this.challenge
    }
    const url = this.baseUri + 'auth'
    const r = await fetch(url)
    if (!r.ok) {
      return undefined
    }
    this.challenge = (await r.json())["challenge"] as string
    return this.challenge
  }

  private async ensureAuth(): Promise<void> {
    let password: string | undefined
    do {
      password = await this.requirePassword()
      if (!password) {
        throw new BooError('cancel', 'password has not been set.')
      }
    } while (!await this.auth(password));
  }

  private async withAuthToken<T>(fn: (token?: string) => Promise<T>): Promise<T> {
    if (!this.needAuth) {
      return await fn()
    }
    while (true) {
      try {
        if (this.authToken) {
          return await fn(this.authToken.token)
        } else {
          throw new BooError('auth', 'auth token is not set.')
        }
      } catch (e: unknown) {
        if (BooError.isBooError(e) && e.reason === 'auth') {
          await this.ensureAuth()
        } else {
          throw e
        }
      }
    }
  }

  private async handleResponse<T>(r: Response): Promise<T> {
    if (!r.ok) {
      if (r.status === 401) {
        this.challenge = (await r.json())["challenge"] as string
        throw new BooError('auth', 'authentication failed')
      } else {
        throw new Error(`fetch failed: ${r.status}`)
      }
    }
    return await r.json() as T
  }

  async list(req: IListRequest): Promise<IMediaList> {
    return await this.withAuthToken(async (token?: string) => {
      const query = new URLSearchParams()
      if (token) {
        query.set('auth', token)
      }
      if (req.category) {
        query.set('c', req.category)
      }
      if (req.mark !== undefined) {
        query.set('m', req.mark.toString())
      }
      if (req.rating !== undefined) {
        query.set('r', req.rating.toString())
      }
      if (req.type) {
        query.set('type', req.type)
      }
      if (req.sourceType) {
        query.set('s', req.sourceType.toString())
      }
      if (req.search) {
        query.set('t', req.search)
      }

      const url = this.baseUri + 'list?' + query.toString()
      return await this.handleResponse<IMediaList>(await fetch(url))
    })
  }

  async chapters(mediaId: string): Promise<IChapterList> {
    const url = this.baseUri + `chapter?id=${mediaId}`
    return await this.handleResponse<IChapterList>(await fetch(url))
  }

  getItemUrl(mediaItem: IMediaItem): string {
    switch (mediaItem.type) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return this.baseUri + `photo?id=${mediaItem.id}`
      default:
        return this.baseUri + `video?id=${mediaItem.id}`
    }
  }

  async checkUpdate(): Promise<boolean> {
    throw new Error("Method not implemented.")
  }

  async getCurrent(): Promise<string> {
    const url = this.baseUri + 'current'
    return (await this.handleResponse<IDResponse>(await fetch(url))).id
  }

  async setCurrent(mediaId: string): Promise<void> {
    const url = this.baseUri + 'current'
    await fetch(url, {
      method: "PUT",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({id: mediaId})
    })
  }

  async getReputation(mediaId: string): Promise<IRequtation> {
    if (!this.capabilities?.reputation) {
      return {id: mediaId}
    }
    const url = this.baseUri + `reputation?id=${mediaId}`
    return await this.handleResponse<IRequtation>(await fetch(url))
  }

  async setReputation(req: IRequtation): Promise<void> {
    if (this.capabilities?.reputation !== 2) {
      return
    }
    const url = this.baseUri + 'reputation'
    await fetch(url, {
      method: "PUT",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req)
    })
  }

  async categories(): Promise<ICategory[]> {
    if (!this.capabilities?.category) {
      return []
    }
    const url = this.baseUri + 'categories'
    return await this.handleResponse<ICategory[]>(await fetch(url))
  }

  async marks(): Promise<IMark[]> {
    if (!this.capabilities?.mark) {
      return []
    }
    const url = this.baseUri + 'marks'
    return await this.handleResponse<IMark[]>(await fetch(url))
  }

  async ratings(): Promise<IRatingList> {
    if (!this.capabilities?.rating) {
      return {default: 0, items: []}
    }
    const url = this.baseUri + 'ratings'
    return await this.handleResponse<IRatingList>(await fetch(url))
  }
}

export function createBooProtocol(requirePassword: () => Promise<string>): IBooProtocol {
  return new BooProtocolImpl(requirePassword)
}