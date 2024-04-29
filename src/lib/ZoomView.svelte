<script lang="ts">
  import {logger} from "./model/DebugLog";
  import {viewModel} from "./model/ViewModel";
  import {globalToLocalPoint} from "./utils/Utils";

  let view: HTMLDivElement
  const scale$ = viewModel.mediaScale
  let transformOrigin: { x: number, y: number } = { x: 50, y: 50 }
  let translation: { x: number, y: number } = { x: 0, y: 0 }
  export let scaleMax: number = 10
  export let scaleMin: number = 1

  const draggingInfo = {
    isDragging: false,
    startAt: { x: 0, y: 0,},
    initialTranslation: { x: 0, y: 0 },
    scrollRange: { x: 0, y: 0 }
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault()
    e.stopPropagation()
    const contentRect = view.getBoundingClientRect()
    const local = globalToLocalPoint(view, e.clientX, e.clientY)
    logger.debug(`onWheel (${local?.x ?? "u/a"}, ${local?.y ?? "u/a"})`)
    // transformOrigin = getLocalPointAsPercentage(e)
    const pivot = local
    const orgScale = viewModel.mediaScale.currentValue
    let newScale
    if(e.deltaY > 0) {
      newScale = Math.max(scaleMin, orgScale - 0.1)
    } else {
      newScale = Math.min(scaleMax, orgScale + 0.1)
    }
    // const px1 = -translation.x + (pivot.x-0.5*contentRect.width)
    // const py1 = -translation.y + (pivot.y-0.5*contentRect.height)
    // const px2 = px1*newScale/orgScale
    // const py2 = py1*newScale/orgScale
    // const dx = px2 - px1
    // const dy = py2 - py1

    // const dx = (newScale - orgScale) * (pivot.x - 0.5 * contentRect.width)
    // const dy = (newScale - orgScale) * (pivot.y - 0.5 * contentRect.height)
    // const x0 = (pivot.x - translation.x) / orgScale
    // const y0 = (pivot.y - translation.y) / orgScale
    // const dx = x0 * (newScale - 1)
    // const dy = y0 * (newScale - 1)


    const dx = (pivot.x+translation.x) * (newScale - orgScale)
    const dy = (pivot.y+translation.y) * (newScale - orgScale)



    translation = {x: translation.x - dx, y: translation.y - dy}
    viewModel.zoom(newScale)
  }

  function scrollTo(dx:number, dy:number) {

  }

  function onMouseDownOnPlayer(e:MouseEvent) {
    const local = globalToLocalPoint(view,e.clientX,e.clientY)
    logger.debug(`clicked at ${local.x},${local.y}`)

    if($scale$===1) return
    draggingInfo.isDragging = true
    draggingInfo.initialTranslation = {...translation}
    draggingInfo.startAt = {x:e.clientX, y:e.clientY}

  }
  function onMouseMoveOnPlayer(e:MouseEvent) {
    if(draggingInfo.isDragging) {
      const dx = (e.clientX - draggingInfo.startAt.x)
      const dy = (e.clientY - draggingInfo.startAt.y)
      translation = {x: draggingInfo.initialTranslation.x+dx, y: draggingInfo.initialTranslation.y+dy}
      logger.debug(`dx=${dx}, dy=${dy}`)
    }
  }

  function onMouseUpOnPlayer() {
    draggingInfo.isDragging = false
  }


  $: if($scale$===1) {
    translation = {x: 0, y: 0}
  }
  let container: HTMLDivElement

</script>

<div bind:this={container} class="container w-full h-full"
   on:wheel={onWheel}
   on:mousedown={onMouseDownOnPlayer}
   on:mousemove={onMouseMoveOnPlayer}
   on:mouseup={onMouseUpOnPlayer}
   role="none"
  >
  <div
    class="zoom-container w-full h-full relative flex justify-center items-center overflow-hidden"
    bind:this={view}
    style:transform="scale({$scale$})"
    style:transform-origin="0 0"
    style:translate="{translation.x}px {translation.y}px"
    >
    <slot/>
  </div>
</div>
<style lang="scss">
</style>