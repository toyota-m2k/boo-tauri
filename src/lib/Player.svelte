<script lang="ts">
  import {viewModel} from "./model/ViewModel";
  import type {Readable} from "svelte/store";
  import type {IMediaItem} from './protocol/IBooProtocol'
  import {launch} from './utils/Utils'
  import {tick} from 'svelte'

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

  function onEnded() {
    launch(async () => {
      await tick()
      switch (viewModel.playMode.currentValue) {
        case "sequential":
          viewModel.next()
          break
        case "repeat":
          viewModel.currentPosition.set(0)
          await player.play()
          break
        default:
          break
      }
    })
  }
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
      on:click|preventDefault={togglePlay}
      bind:duration
      bind:currentTime={$currentPosition$}
      bind:paused
      bind:ended
      on:ended={onEnded}
      autoplay
      controls
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
    height: 100%;
    overflow: hidden; /* コンテナからはみ出たビデオの部分を隠します */
  }

  .media-view {
    max-width: 100%;
    max-height: 100%;
  }

  .media-view.fit {
    width: 100%;
    height: 100%;
    margin: auto; /* これによりビデオがコンテナの中央に配置されます */
    object-fit: contain; /* ビデオがコンテナの幅または高さに合わせて調整されます */
  }

  .media-view.fill {
    width: 100%;
    height: 100%;
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