<script lang="ts">
  import {viewModel} from "./ViewModel";
  import type {Readable} from "svelte/store";

  let player: HTMLVideoElement
  let currentIndex$: Readable<number> = viewModel.currentIndex
  let currentMediaItem: IMediaItem | undefined
  let currentMediaUrl: string | undefined
  let currentMediaType: string | undefined
  $: currentMediaItem = viewModel.mediaItemAt($currentIndex$)
  $: currentMediaUrl = currentMediaItem ? viewModel.mediaUrl(currentMediaItem) : undefined
  $: currentMediaType = currentMediaItem?.type

  let duration: number = 0
  let currentPosition$ = viewModel.currentPosition
  let paused: boolean = false
  let ended: boolean = false

  let fitMode = viewModel.fitMode //: "fit"|"fill"|"original" = "fit"


  function togglePlay() {
    if (!player) {
      return;
    }
    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }
  }
</script>


<div class="player-container">
  {#if currentMediaType === "mp4"}
    <video
      class="media-view"
      class:fit={$fitMode==="fit"}
      class:fill={$fitMode==="fill"}
      class:original={$fitMode==="original"}
      bind:this={player}
      src={currentMediaUrl}
      on:click={togglePlay}
      bind:duration
      bind:currentTime={$currentPosition$}
      bind:paused
      bind:ended
      autoplay
    >
      <track kind="captions" src="">
    </video>
  {:else if currentMediaType === "png" || currentMediaType === "jpg"}
    <img src="{currentMediaUrl}" class="media-view" alt="">
  {:else if currentMediaType === "mp3"}
    <p>audio type is not supported yet.</p>
  {:else if currentMediaType}
    <p>unknown media type: {currentMediaType}</p>
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

  .media-view {
    max-width: 100vw;
    max-height: 100vh;
  }

  .media-view.fit {
    width: 100vw;
    height: 100vh;
    margin: auto; /* これによりビデオがコンテナの中央に配置されます */
    object-fit: contain; /* ビデオがコンテナの幅または高さに合わせて調整されます */
  }

  .media-view.fill {
    width: 100vw;
    height: 100vh;
    margin: auto; /* これによりビデオがコンテナの中央に配置されます */
    object-fit: cover; /* ビデオがコンテナの幅または高さに合わせて調整されます */
  }

  .media-view.original {
    width: auto;
    height: auto;
    margin: auto; /* これによりビデオがコンテナの中央に配置されます */
    object-fit: cover; /* ビデオがコンテナの幅または高さに合わせて調整されます */
  }
</style>