<script lang="ts">

import {Button} from "flowbite-svelte";
import {ICON_NEXT, ICON_PLAY, ICON_PREV, ICON_REPEAT, ICON_STOP} from "./Icons";
import SvgIcon from "./common/SvgIcon.svelte";
import {viewModel} from "./model/ViewModel";
import {startSlideShow, toggleSlideShow} from "./model/SlideShowModel";
import {onMount} from "svelte";

const playing$ = viewModel.playing

function prev() {
  viewModel.prev()
}
function next() {
  viewModel.next()
}
function toggle() {
  toggleSlideShow()
}

onMount(() => {
  if(viewModel.playing.currentValue) {
    startSlideShow()
  }
})

</script>

<div class="flex justify-center gap-2 pb-2">
  <Button class="p-0 control_button rounded-none" size="xs" on:click={prev}>
    <SvgIcon class="h-7 w-7" path={ICON_PREV}/>
  </Button>
  <Button class="p-0 control_button rounded-none" size="xs" on:click={toggle}>
    {#if $playing$}
      <SvgIcon class="h-7 w-7" path={ICON_STOP}/>
    {:else}
      <SvgIcon class="h-7 w-7" path={ICON_PLAY}/>
    {/if}
  </Button>
  <Button class="p-0 control_button rounded-none" size="xs" on:click={next}>
    <SvgIcon class="h-7 w-7" path={ICON_NEXT}/>
  </Button>
</div>