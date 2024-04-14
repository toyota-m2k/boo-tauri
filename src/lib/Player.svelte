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

    let fitMode: "fit"|"fill"|"natural" = "natural"


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


<div class="player-container">
    {#if $currentIndex$>=0}
    <video
            class:fit={fitMode==="fit"}
            class:fill={fitMode==="fill"}
            class:natural={fitMode==="natural"}
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

<style>
    .player-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        overflow: hidden; /* コンテナからはみ出たビデオの部分を隠します */
    }

    video {
        max-width: 100vw;
        max-height: 100vh;
    }
    video.fit {
        width: 100vw;
        height: 100vh;
        margin: auto; /* これによりビデオがコンテナの中央に配置されます */
        object-fit: contain; /* ビデオがコンテナの幅または高さに合わせて調整されます */
    }
    video.fill {
        width: 100vw;
        height: 100vh;
        margin: auto; /* これによりビデオがコンテナの中央に配置されます */
        object-fit: cover ; /* ビデオがコンテナの幅または高さに合わせて調整されます */
    }
    video.natural {
        width: auto;
        height: auto;
        margin: auto; /* これによりビデオがコンテナの中央に配置されます */
        object-fit: cover; /* ビデオがコンテナの幅または高さに合わせて調整されます */
    }
</style>