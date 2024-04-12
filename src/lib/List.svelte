<script lang="ts">
    import {viewModel} from "./ViewModel";

    const mediaList = viewModel.mediaList;


</script>

<div>
        {#each $mediaList.list as item, i (item.id)}
            <div role="button" tabindex="0" on:click={ ()=>viewModel.setCurrentIndex(i) }>{item.name} ({item.duration})</div>
        {/each}
</div>

<style lang="scss">
    .media-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
    }
</style>