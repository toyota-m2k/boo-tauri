<script lang="ts">
  import List from './List.svelte'
  import {onDestroy, onMount, tick} from 'svelte'
  import OptionSelector from './OptionSelector.svelte'
  import {launch} from './utils/Utils'

  let container: HTMLDivElement
  let footer: HTMLDivElement
  let list: HTMLDivElement

  onMount(() => {
    window.addEventListener('resize', adjustPosition)
    launch(async ()=>{
      await tick()
      adjustPosition()
    })
    return ()=> {
      window.removeEventListener('resize', adjustPosition)
    }
  });

  function adjustPosition() {
    const height = footer.offsetHeight
    list.style.bottom = `${height}px`
  }

</script>

<div bind:this={container} class="side-panel h-full w-full">
  <div bind:this={list} class="side-panel-body absolute top-0 left-0 right-0 overflow-y-auto">
    <List/>
  </div>
  <div bind:this={footer} class="side-panel-footer absolute left-0 right-0 bottom-0">
    <OptionSelector on:heightChanged={adjustPosition}/>
  </div>
</div>