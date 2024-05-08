<script lang="ts">
  import {viewModel} from "./model/ViewModel";
  import {createEventDispatcher} from "svelte";
  import type {IChapter} from "./protocol/IBooProtocol";
  import SvgIcon from "./common/SvgIcon.svelte";
  import {
    ICON_NEXT,
    ICON_PIN,
    ICON_PIN_OFF,
    ICON_PLAY,
    ICON_PREV,
    ICON_SKIP_NEXT,
    ICON_SKIP_PREV,
    ICON_STOP
  } from "./Icons";
  import {Button} from "flowbite-svelte";
  import {formatTime} from "./utils/Utils";

  const currentTime$ = viewModel.currentPosition
  const duration$ = viewModel.duration
  const chapterList$ = viewModel.chapterList
  const playing$ = viewModel.playing

  let currentTimePercent = 0
  $: currentTimePercent = ($currentTime$ / $duration$) * 100

  let chapters: IChapter[] = []
  // let hasChapters = false
  const disabledRanges$ = viewModel.disabledRanges

  $: chapters = $chapterList$?.chapters ?? []

  // $: if ($playing$ && hasChapters &&$currentTime$>0) {
  //   const r = disabledRanges.find(r=>r.start<=$currentTime$*1000 && r.end>=$currentTime$*1000)
  //   if(r){
  //     viewModel.currentPosition.set(r.end/1000)
  //   }
  // }

  const dispatch = createEventDispatcher()

  function onDragStart(_: MouseEvent) {
    dispatch("seekStart")
  }
  function onDragEnd(_: MouseEvent) {
    dispatch("seekEnd")
  }

  function seekTo(position: number) {
    viewModel.currentPosition.set(position/1000)
  }

  function prev() {
    viewModel.prev()
  }
  function next() {
    viewModel.next()
  }
  function prevChapter() {
    viewModel.prevChapter()
  }
  function nextChapter() {
    viewModel.nextChapter()
  }
  function toggle() {
    dispatch("toggle")
  }

</script>

<div class="media-control-panel w-full">
  <!-- Buttons -->
  <div class="buttons flex p-1 justify-center gap-2">
    <Button class="p-0 control_button rounded-none" size="xs" on:click={prev}>
      <SvgIcon class="h-7 w-7" path={ICON_PREV}/>
    </Button>
    <Button class="p-0 control_button rounded-none" size="xs" on:click={prevChapter}>
      <SvgIcon class="h-7 w-7" path={ICON_SKIP_PREV}/>
    </Button>
    <Button class="p-0 control_button rounded-none" size="xs" on:click={toggle}>
      {#if $playing$}
        <SvgIcon class="h-7 w-7 text-accent" path={ICON_STOP}/>
      {:else}
        <SvgIcon class="h-7 w-7" path={ICON_PLAY}/>
      {/if}
    </Button>
    <Button class="p-0 control_button rounded-none" size="xs" on:click={nextChapter}>
      <SvgIcon class="h-7 w-7" path={ICON_SKIP_NEXT}/>
    </Button>
    <Button class="p-0 control_button rounded-none" size="xs" on:click={next}>
      <SvgIcon class="h-7 w-7" path={ICON_NEXT}/>
    </Button>
  </div>

  <!-- Slider with Chapters -->
  <div class="slider-control relative w-full h-[55px]">
    <div class="slider-with-chapters absolute left-[12px] right-[12px] top-0 bg-pink-500">
      <div class="slider-bar absolute top-[16px] h-[8px] w-full"
        style="background: linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) {currentTimePercent}%, var(--color-secondary) {currentTimePercent}%, var(--color-secondary) 100%);"
      />
      {#each $disabledRanges$ as range (range.start)}
        <div class="gray-zone absolute top-[16px] h-[8px]"
             style="background: var(--color-gray-500);
             left: {range.start / 10 / $duration$}%;
             right: {range.end>0 ? (100 - range.end / 10 / $duration$) : 0}%;"
        />
      {/each}
      {#each chapters as chapter (chapter.position)}
        <SvgIcon class="absolute top-0 w-[24px] h-[24px] transform -translate-x-1/2 focus:outline-0 {(chapter.skip)?'text-gray-100':'text-accent'}"
                 path={chapter.skip ? ICON_PIN_OFF : ICON_PIN}
                 style="left: {chapter.position / 10 / $duration$}%"
                 withEvents={true}
                 on:click={()=>seekTo(chapter.position)}
        />
      {/each}

    </div>
    <span class="absolute top-[24px] left-[12px] text-gray-200">{formatTime($currentTime$)}</span>
    <span class="absolute top-[24px] right-[12px] text-gray-200">{formatTime($duration$)}</span>

    <input class="slider absolute w-full h-[28px] top-[14px] left-0 right-0 bg-transparent appearance-none cursor-pointer focus:outline-0 shadow-none" type="range" min="0" max={$duration$}
           on:mousedown={onDragStart} on:mouseup={onDragEnd}
           bind:value={$currentTime$} step="any"/>
  </div>
</div>

<style lang="scss">
  //.slider-bar{
  //  position: absolute;
  //  top: 0;
  //  height: 8px;
  //  width: 100%;
  //}

  .slider {

    // つまみをSVG画像に置き換える
    &::-webkit-slider-thumb {
      appearance: none; // デフォルトのつまみのスタイルを解除
      margin: 8px 0 0;
      //margin: 0; // マージンをなくす
      width: 24px; // 幅
      height: 24px; // 高さ
      border: none; // デフォルトの線を消す
      padding: 0; // 余白をなくす
      cursor: pointer; // カーソルを分かりやすく
      background-image: url('./thumb.svg'); // SVG画像のパスを指定
      background-size: cover; // 画像をカバーするように表示
      background-color: transparent; // 背景色を透明に
    }
  }

</style>