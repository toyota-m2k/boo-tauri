<script lang="ts">
  import {getLocalPoint, getLocalPointAsPercentage} from "./utils/Utils";
  import {logger} from "./model/DebugLog";
  import {tick} from "svelte";
  import {viewModel} from "./model/ViewModel";

  let view: HTMLDivElement
  const scale$ = viewModel.mediaScale
  let transformOrigin: { x: number, y: number } = { x: 50, y: 50 }
  let scrollPosition: { x: number, y: number } = { x: 0, y: 0 }
  const draggingInfo = {
    isDragging: false,
    startAt: { x: 0, y: 0,},
    scrollRange: { x: 0, y: 0 }
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault()
    e.stopPropagation()
    const local = getLocalPointAsPercentage(e)
    logger.debug(`onWheel (${local?.x ?? "u/a"}, ${local?.y ?? "u/a"})`)
    // transformOrigin = `${local.x}% ${local.y}%`
    // transformOrigin = local
    if (e.deltaY > 0) {
      viewModel.zoom(-1)
    } else {
      viewModel.zoom(1)
    }
  }

  function scrollTo(dx:number, dy:number) {

  }

  function onMouseDownOnPlayer(e:MouseEvent) {
    if($scale$===1) return
    draggingInfo.isDragging = true
    draggingInfo.startAt = {x:e.clientX, y:e.clientY}
  }
  function onMouseMoveOnPlayer(e:MouseEvent) {
    if(draggingInfo.isDragging) {
      const dx = (e.clientX - draggingInfo.startAt.x)
      const dy = (e.clientY - draggingInfo.startAt.y)
      scrollPosition = {x: dx, y: dy}
      logger.debug(`dx=${dx}, dy=${dy}`)
    }
  }

  function onMouseUpOnPlayer() {
    draggingInfo.isDragging = false
  }


  // $: if($scale$!=1 && view) {
  //   tick()
  //   logger.debug(`scale=${$scale$}`)
  //   logger.debug(`${view.scrollLeft},${view.scrollTop} ${view.scrollWidth},${view.scrollHeight}`)
  // } else {
  //   scrollPosition = {x: 0, y: 0}
  // }

</script>

<div
  class="zoom-container w-full h-full relative flex justify-center items-center overflow-hidden"
  bind:this={view}
  style:transform="scale({$scale$})"
  style:transform-origin="{transformOrigin.x}% {transformOrigin.y}%"
  style:translate="{scrollPosition.x}px {scrollPosition.y}px"
  on:wheel={onWheel}
  on:mousedown={onMouseDownOnPlayer}
  on:mousemove={onMouseMoveOnPlayer}
  on:mouseup={onMouseUpOnPlayer}
  role="none"
  >
  <slot/>
</div>

<style lang="scss">
</style>