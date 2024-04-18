<script lang="ts">
  import {Button, Input, Label, Modal} from "flowbite-svelte";
  import {type CompletionProc, viewModel} from "../model/ViewModel";
  import {onMount, tick} from "svelte";
  import {keyEvents} from "../utils/KeyEvents";

  // export let promise: Promise<string|undefined>|undefined
  export let title: string = "Password"
  export let completion: CompletionProc<string|undefined> | undefined
  let password = ""
  let textInput: HTMLInputElement

  function complete(ok:boolean) {
    completion?.(ok ? password : undefined)
    // viewModel.closePasswordDialog(ok ? password : undefined)
  }

  onMount(()=>{
    keyEvents.register("Enter", ()=>complete(true))
    keyEvents.register("Escape", ()=>complete(false))
    tick().then(()=>textInput.focus())
    return ()=>{
      keyEvents.unregister("Enter")
      keyEvents.unregister("Escape")
    }
  })

</script>

<Modal title="{title}" open={true} dismissable={false}>
  <div class="mb-6">
    <Label class="mb-2">Password</Label>
<!--    <Input bind:this={textInput} type="password" placeholder="•••••••••" required bind:value={password}/>-->
    <Input let:props>
      <input {...props} bind:this={textInput} type="password" placeholder="•••••••••" required bind:value={password}/>
    </Input>
  </div>
  <svelte:fragment slot="footer">
    <Button on:click={()=>complete(true)}>OK</Button>
    <Button color="alternative" on:click={()=>complete(false)}>Cancel</Button>
  </svelte:fragment>
</Modal>