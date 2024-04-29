import {logger} from "../model/DebugLog";

export class TimingSwitch {
  constructor (
    private interval:number,
    private callback:()=>boolean|void,
  ){
    logger.debug("TimingSwitch: interval="+this.interval)
  }
  private timerId:number = 0

  setInterval(interval:number) {
    this.interval = interval
  }

  start() {
    logger.debug("TimingSwitch.start: timeout="+this.interval)
    this.cancel()
    this.timerId = setTimeout(()=>{
      this.cancel()
      if(this.callback()) {
        this.start()    // リスタート
      }
    }, this.interval)
  }

  cancel() {
    if(this.timerId!==0) {
      clearTimeout(this.timerId)
      this.timerId = 0
    }
  }
}