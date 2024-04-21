<script lang="ts">
  import { logger } from "./model/DebugLog"
  import {Button} from "flowbite-svelte";
  import SvgIcon from "./common/SvgIcon.svelte";
  import {launch} from "./utils/Utils";
  import {tick} from "svelte";
  const messages = logger.messages;
  let listContainer: HTMLDivElement;
  $: if($messages.length>0) {
    launch(async () => {
      await tick()
      listContainer.lastElementChild?.scrollIntoView();
    })
  }
</script>

<div class="absolute top-4 bottom-4 right-4 w-1/4 bg-green-800 overflow-clip border-blue-400 border-2 rounded">
  <div class="h-8 flex flex-row-reverse bg-blue-400 items-center">
    <Button size="xs" class="h-5 mr-2" on:click={()=>logger.clear()}>
      <SvgIcon class="h-4 w-4" name="clear" path="M 6 19A 2,2,0,0,0,8,21H 16A 2,2,0,0,0,18,19V 7H 6V 19M 8 9H 16V 19H 8V 9M 15.5 4L 14.5 3H 9.5L 8.5 4H 5V 6H 19V 4H 15.5Z"/>
    </Button>
  </div>
  <div class="px-1.5 absolute top-8 bottom-0 left-0 right-0 overflow-y-auto bg-green-100">
    <div bind:this={listContainer} class="border-black">
      {#each $messages as m (m.id)}
        <div class="{m.level}">{m.message}</div>
      {/each}
    </div>
  </div>
</div>

<style>
  .error {
    color: red;
  }
  .warn {
    color: orange;
  }
  .info {
    color: blue;
  }
</style>
