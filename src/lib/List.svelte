<script lang="ts">
  import {viewModel} from "./ViewModel";

  const mediaList = viewModel.mediaList;


</script>

<div>
  {#if $mediaList.list.length !== 0}
    {#each $mediaList.list as item, i (item.id)}
      <div role="button" tabindex="0" on:click={ ()=>viewModel.setCurrentIndex(i) }>{item.name} ({item.duration})</div>
    {/each}
  {:else}
    <div>No media found</div>
  {/if}

</div>

<style lang="scss">
  .media-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
</style>