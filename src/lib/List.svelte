<script lang="ts">
  import {viewModel} from "./model/ViewModel";
  // import {Table, TableBody, TableBodyCell, TableBodyRow} from "flowbite-svelte";
  import {onMount} from "svelte";
  import {formatSize, formatTime} from './utils/Utils'
  import {globalKeyEvents, keyFor} from "./utils/KeyEvents";
  import {eventWindowSizeChanged} from "./model/GlobalEvents";

  const mediaList = viewModel.mediaList;
  const currentIndex = viewModel.currentIndex;
  let currentId:string|undefined
  $: currentId = viewModel.mediaItemAt($currentIndex)?.id
  $: if(currentId) {
    try {
      // tableBody.scrollToRow(currentId)
      document.getElementById(currentId)?.scrollIntoView({behavior: "smooth", block: "nearest"})
    } catch (e) {
      console.error(e)
    }
  }

  function onSelect(e:MouseEvent, index:number) {
    e.preventDefault()
    e.stopPropagation()
    viewModel.setCurrentIndex(index)
  }

  onMount(() => {
    globalKeyEvents
    .register(keyFor({key: "ArrowUp", asCode: true}, {}), () => viewModel.prev())
    .register(keyFor({key: "ArrowDown", asCode: true}, {}), () => viewModel.next())

    eventWindowSizeChanged.addListener(() => {
      // tableBody.scrollToRow(currentId)
      if(currentId) {
        document.getElementById(currentId)?.scrollIntoView({behavior: "smooth", block: "nearest"})
      }
    })
  })

</script>

<div class="list-root bg-background text-background-on">
  {#if $mediaList.list.length !== 0}
    <table class="w-full">
      {#each $mediaList.list as item, i (item.id)}
        <tr id={item.id}>
          <td on:click={ (e)=>onSelect(e,i) } class="cursor-pointer whitespace-nowrap font-medium text-xs common_surface ">
            <div class="px-1 py-0.5" class:selected={currentId===item.id}>
              <div  >{item.name}</div>
              <div class:text-secondary-on-alt={currentId===item.id} class:text-surface-on-alt={currentId!==item.id}>{item.duration!==undefined ? formatTime(item.duration) : formatSize(item.size) }</div>
            </div>
          </td>
        </tr>
<!--      <div role="button" tabindex="0" on:click={ ()=>viewModel.setCurrentIndex(i) }>{item.name} ({item.duration})</div>-->
      {/each}
    </table>
  {:else}
    <div>No media found</div>
  {/if}

</div>

<style lang="scss">
  //.media-list {
  //  display: flex;
  //  flex-wrap: wrap;
  //  justify-content: space-around;
  //}
</style>