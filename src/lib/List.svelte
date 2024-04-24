<script lang="ts">
  import {viewModel} from "./model/ViewModel";
  import {Table, TableBody, TableBodyCell, TableBodyRow, TableHeadCell} from "flowbite-svelte";
  import {onMount} from "svelte";
  import {formatSize, formatTime} from './utils/Utils'
  import {globalKeyEvents, keyFor} from "./utils/KeyEvents";

  const mediaList = viewModel.mediaList;
  const currentIndex = viewModel.currentIndex;
  let currentId:string|undefined
  let tableBody:TableBody;
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
    globalKeyEvents.beginRegister((registry) => {
      registry
        .register(keyFor("ArrowUp", {key: "ArrowUp", asCode: true}, {}), () => viewModel.prev())
        .register(keyFor("ArrowDown", {key: "ArrowDown", asCode: true}, {}), () => viewModel.next())
    })
  })

</script>

<div>
  {#if $mediaList.list.length !== 0}
    <Table hoverable={true}>
      <TableBody bind:this={tableBody}>
      {#each $mediaList.list as item, i (item.id)}
        <TableBodyRow id={item.id}>
          <TableBodyCell on:click={ (e)=>onSelect(e,i) } tdClass="cursor-pointer whitespace-nowrap font-medium text-xs">
            <div class:bg-indigo-500={currentId===item.id} class="px-1 py-0.5">
              <div class:text-white={currentId===item.id}>{item.name}</div>
              <div class:text-gray-300={currentId===item.id} class:text-gray-500={currentId!==item.id}>{item.duration!==undefined ? formatTime(item.duration) : formatSize(item.size) }</div>
            </div>
          </TableBodyCell>
        </TableBodyRow>
<!--      <div role="button" tabindex="0" on:click={ ()=>viewModel.setCurrentIndex(i) }>{item.name} ({item.duration})</div>-->
      {/each}
      </TableBody>
    </Table>
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