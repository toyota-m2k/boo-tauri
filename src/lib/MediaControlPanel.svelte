<script lang="ts">
  import {viewModel} from "./model/ViewModel";
  import {createEventDispatcher} from "svelte";
  import type {IChapter, IChapterList} from "./protocol/IBooProtocol";
  import {getDisabledRanges, type IRange, RangeOrNull} from "./model/ChapterUtils";

  const currentTime$ = viewModel.currentPosition
  const duration$ = viewModel.duration
  const chapterList$ = viewModel.chapterList

  let currentTimePercent = 0
  $: currentTimePercent = ($currentTime$ / $duration$) * 100

  let hasChapters = false
  let disabledRanges:IRange[] = []
  $: resolveDisabledRanges($chapterList$)

  function resolveDisabledRanges(chapterList: IChapterList|undefined) {
    const mediaItem = viewModel.currentItem
    if (!mediaItem || !chapterList || !chapterList.chapters?.length) {
      hasChapters = false
      disabledRanges = []
      return
    }
    hasChapters = true
    disabledRanges = getDisabledRanges(chapterList.chapters, RangeOrNull(mediaItem.start, mediaItem.end))
  }


  const dispatch = createEventDispatcher()

  function onDragStart(_: MouseEvent) {
    dispatch("seekStart", {position: $currentTime$})
  }
  function onDragEnd(_: MouseEvent) {
    dispatch("seekEnd", {position: $currentTime$})
  }


</script>

<div class="w-full">
  <div class="absolute left-[12px] right-[12px] top-0 h-[8px] bg-transparent">
    <div
      class="slider-bar"
      style="background: linear-gradient(to right, var(--color-purple-600) 0%, var(--color-purple-600) {currentTimePercent}%, var(--color-green-500) {currentTimePercent}%, var(--color-green-500) 100%);"
    />

    {#each disabledRanges as range (range.start)}
      <div class="absolute top-0 h-[8px]"
           style="background: var(--color-gray-500);
           left: {range.start / 10 / $duration$}%;
           right: {range.end ? 100 - range.end / 10 / $duration$ : 100}%;"
      />
    {/each}
  </div>

  <input class="slider w-full appearance-none cursor-pointer focus:outline-0 shadow-none" type="range" min="0" max={$duration$}
         on:mousedown={onDragStart} on:mouseup={onDragEnd}
         bind:value={$currentTime$} step="any"/>
</div>

<style lang="scss">
  .slider-bar{
    position: absolute;
    top: 0;
    height: 8px;
    width: 100%;
  }

  .slider {
    z-index: 10; // つまみを手前に表示
    position: absolute;
    top: 4px;
    left: 0;
    right: 0;
    background-color: transparent; // 背景色を透明に

    // つまみをSVG画像に置き換える
    &::-webkit-slider-thumb {
      appearance: none; // デフォルトのつまみのスタイルを解除
      width: 24px; // 幅
      height: 24px; // 高さ
      border: none; // デフォルトの線を消す
      padding: 0; // 余白をなくす
      margin: 0; // マージンをなくす
      cursor: pointer; // カーソルを分かりやすく
      background-image: url('./thumb.svg'); // SVG画像のパスを指定
      background-size: cover; // 画像をカバーするように表示
      background-color: transparent; // 背景色を透明に
      z-index: 2000; // つまみを手前に表示
    }
  }

</style>