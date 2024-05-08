import type {SvelteComponent} from "svelte";

export async function showDialog<T>(createDialog:(params:any)=>SvelteComponent, props:[]=[]):Promise<T> {
  // let completionProc: CompletionProc<T>|undefined = undefined
  // function complete(value: T) {
  //   if(completionProc) {
  //     completionProc(value)
  //   }
  // }

  const elem = document.getElementById("dialogContainer") as HTMLElement
  let dlg: SvelteComponent|undefined
  const result = await new Promise<T>((resolve) => {
    dlg = createDialog({
      target: elem,
      props: {
        ...props,
        completion: (value:T)=> {
          resolve(value)
        }
      }
    })
  })
  if(dlg!==undefined) {
    dlg.$destroy()
  }
  return result

}