interface IKeyEvents {
  register: (keyCode:string, callback:()=>void) => void
  unregister: (keyCode:string) => void
}

class KeyEvents implements IKeyEvents {
  private keyMap: {[key:string]:()=>void} = {}
  register = (keyCode:string, callback:()=>void) => {
    this.keyMap[keyCode] = callback
  }
  unregister = (keyCode:string) => {
    delete this.keyMap[keyCode]
  }

  constructor() {
    window.addEventListener("keydown", (e)=>{
      if(e.defaultPrevented) return

      let handled = false
      const fn = this.keyMap[e.key]
      if(fn) {
        fn()
        // イベントが処理された場合は「ダブルアクション」を抑制
        e.preventDefault()
      }
    }, true)
  }
}

export const keyEvents:IKeyEvents = new KeyEvents()
