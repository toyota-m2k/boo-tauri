<script lang="ts">
  import {onDestroy, onMount} from 'svelte'

  export let text = ''
  let fontSize = 20; // 初期フォントサイズ
  let container: HTMLDivElement

  onMount(() => {
    adjustFontSize()
    window.addEventListener('resize', adjustFontSize)
  });
  onDestroy(() => {
    window.removeEventListener('resize', adjustFontSize)
  });

  function adjustFontSize() {
    let containerWidth = container.offsetWidth;
    let currentWidth = container.scrollWidth;

    // コンテナに収まるまでフォントサイズを小さくする
    while (currentWidth > containerWidth && fontSize > 10) {
      fontSize -= 1;
      currentWidth = container.scrollWidth;
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

<div bind:this={container} class="text-container" style="font-size: {fontSize}px;">
  {text}
</div>