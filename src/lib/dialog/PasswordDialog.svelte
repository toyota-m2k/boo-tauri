<script lang="ts">
  import {Button, Input, Label, Modal} from "flowbite-svelte";
  import {type CompletionProc} from "../model/ViewModel";
  import {onDestroy, onMount, tick} from "svelte";
  import {createKeyEvents, keyFor} from "../utils/KeyEvents";
  import {switchKeyEventCaster} from "../utils/KeyEvents.js";

  // export let promise: Promise<string|undefined>|undefined
  export let title: string = "Password"
  export let completion: CompletionProc<string|undefined> | undefined
  let password = ""
  let textInput: HTMLInputElement

  function complete(ok:boolean) {
    completion?.(ok ? password : undefined)
    // viewModel.closePasswordDialog(ok ? password : undefined)
  }

  let resumeKeys:()=>void
  onMount(async ()=>{
    const dlgKeyEvents = createKeyEvents()
    .register(keyFor({key:"Enter", asCode:true}), ()=>complete(true))
    .register(keyFor({key:"Escape", asCode:true}), ()=>complete(false))
    resumeKeys = switchKeyEventCaster(dlgKeyEvents)
    await tick()
    textInput.focus()
  })
  onDestroy(()=> {
    resumeKeys?.()
  })

</script>

<Modal title="{title}" open={true} dismissable={false}>
  <div class="mb-6 default_surface">
    <Label class="mb-2">Password</Label>
<!--    <Input bind:this={textInput} type="password" placeholder="•••••••••" required bind:value={password}/>-->
    <Input let:props>
      <input {...props} bind:this={textInput} type="password" placeholder="•••••••••" required bind:value={password}/>
    </Input>
  </div>
  <svelte:fragment slot="footer">
    <Button class="default_button" on:click={()=>complete(true)}>OK</Button>
    <Button class="other_button" on:click={()=>complete(false)}>Cancel</Button>
  </svelte:fragment>
</Modal>