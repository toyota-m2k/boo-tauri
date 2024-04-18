<script lang="ts">
  import {onDestroy, onMount, tick} from 'svelte'
  import {twMerge} from 'tailwind-merge'
  import {launch} from '../utils/Utils'

  let className = '';
  export let text = '';
  export { className as class }

  export const maxFontSize = 20 // 最大フォントサイズ
  export const minFontSize = 10 // 最小フォントサイズ

  // let fontSize = initialFontSize;
  let container: HTMLDivElement

  let prevText = ''
  $: if (prevText !== text) {
    prevText = text
    launch(async ()=>{
      await tick()
      adjustFontSize()
    })
  }

  onMount(async () => {
    window.addEventListener('resize', adjustFontSize)
  });
  onDestroy(() => {
    window.removeEventListener('resize', adjustFontSize)
  });

  function adjustFontSize() {
    let containerWidth = container.offsetWidth

    container.style.fontSize = `${maxFontSize}px`
    let maxWidth = container.scrollWidth
    if(maxWidth <= containerWidth) return

    for(let fontSize = maxFontSize-1 ; fontSize>=minFontSize ; fontSize--) {
      container.style.fontSize = `${fontSize}px`
      if(container.scrollWidth <= containerWidth) return
    }
  }
</script>

<style>
  .text-container {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

<div bind:this={container} class={twMerge("text-container", className)}>
  {text}
</div>