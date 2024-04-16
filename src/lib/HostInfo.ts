export class HostInfo implements IHostInfo {
  displayName: string
  host: string
  port: number

  constructor(name: string, host: string, port: number) {
    this.displayName = name
    this.host = host
    this.port = port
  }
}
