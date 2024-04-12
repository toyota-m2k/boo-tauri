<script lang="ts">
    import {viewModel} from "./ViewModel";
    import type {Readable} from "svelte/store";

    let player: HTMLVideoElement
    let currentIndex$:Readable<number> = viewModel.currentIndex
    let currentMediaItem: IMediaItem|undefined
    let currentMediaUrl: string|undefined
    $: currentMediaItem = viewModel.mediaItemAt($currentIndex$)
    $: currentMediaUrl = currentMediaItem ? viewModel.mediaUrl(currentMediaItem) : undefined

    let duration: number = 0
    let currentPosition$ = viewModel.currentPosition
    let paused: boolean = false
    let ended: boolean = false


    const togglePlay = () => {
        if (!player) {
            return;
        }
        if (player.paused) {
            player.play();
        } else {
            player.pause();
        }
    };
</script>


<div>
    {#if $currentIndex$>=0}
    <video
            bind:this={player}
            src={currentMediaUrl}
            on:mousedown={togglePlay}
            bind:duration
            bind:currentTime={$currentPosition$}
            bind:paused
            bind:ended
            autoplay
    >
        <track kind="captions" src="">
    </video>
    {:else}
        <p>No media item selected</p>
    {/if}

</div>