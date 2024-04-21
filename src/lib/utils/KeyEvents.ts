interface IKeyEvents {
  register(key:string, { shift, ctrl, alt}:{shift?:boolean, ctrl?:boolean, alt?:boolean}, callback:()=>void):void

  unregister: (keyCode:string) => void
}

class KeyEvents implements IKeyEvents {
  private keyMap: {[key:string]:()=>void} = {}

  private genKey(keyCode:string, { shift, ctrl, alt}:{shift?:boolean, ctrl?:boolean, alt?:boolean}) {
    return `${keyCode}/${shift?"S":""}${ctrl?"C":""}${alt?"A":""}`
  }
  register(keyCode:string, { shift, ctrl, alt}:{shift?:boolean, ctrl?:boolean, alt?:boolean}, callback:()=>void):void {
    this.keyMap[this.genKey(keyCode, {shift, ctrl, alt})] = callback
  }

  unregister = (keyCode:string) => {
    delete this.keyMap[keyCode]
  }

  constructor() {
    window.addEventListener("keydown", (e)=>{
      if(e.defaultPrevented) return

      const fn = this.keyMap[this.genKey(e.code, {shift:e.shiftKey, ctrl:e.ctrlKey, alt:e.altKey})]
      if(fn) {
          fn()
        // イベントが処理された場合は「ダブルアクション」を抑制
        e.preventDefault()
      }
    }, true)
  }
}

export const keyEvents:IKeyEvents = new KeyEvents()
