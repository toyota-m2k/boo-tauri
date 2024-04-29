<script lang="ts">
  import {viewModel} from "./model/ViewModel";
  import type {Readable} from "svelte/store";
  import type {IMediaItem} from './protocol/IBooProtocol'
  import {delay, launch} from './utils/Utils'
  import {tick} from 'svelte'
  import SlideShowPanel from "./SlideShowPanel.svelte";
  import {logger} from "./model/DebugLog";
  import {fade, scale} from 'svelte/transition'
  import {TimingSwitch} from "./utils/TimingSwitch";
  import MediaControlPanel from "./MediaControlPanel.svelte";
  import ZoomView from "./ZoomView.svelte";

  let imageViewer: HTMLImageElement
  let player: HTMLVideoElement
  let currentIndex$: Readable<number> = viewModel.currentIndex
  let playMode$: Readable<string> = viewModel.playMode
  let currentMediaItem: IMediaItem | undefined
  let currentMediaUrl: string | undefined
  let currentMediaType: string | undefined
  let abortController: AbortController|undefined
  $: currentMediaItem = viewModel.mediaItemAt($currentIndex$)
  $: currentMediaUrl = currentMediaItem ? viewModel.mediaUrl(currentMediaItem) : undefined
  $: currentMediaType = currentMediaItem?.type
  $: playing$ = viewModel.playing
  // $: if(currentMediaItem && currentMediaItem.media==='p' && $playMode$==='sequential') {
  //     if(abortController) {
  //       abortController.abort()
  //       abortController = undefined
  //     }
  //     launch(async ()=> {
  //       abortController = abortController ?? new AbortController()
  //       await delay(settings.slideShowInterval * 1000, abortController.signal)
  //       viewModel.next()
  //     });
  //   }

  const duration$ = viewModel.duration
  const currentPosition$ = viewModel.currentPosition
  // let paused: boolean = false
  // let ended: boolean = false

  let showControlPanel = false
  let controlPanelTimingSwitch = new TimingSwitch(2000, ()=>{
    showControlPanel = false
  })

  let fitMode = viewModel.fitMode //: "fit"|"fill"|"original" = "fit"

  function onEnded() {
    logger.info("onEnded")
    launch(async () => {
      await tick()
      switch (viewModel.playMode.currentValue) {
        case "sequential":
          if( !seekingInfo.seeking) {
            viewModel.next()
          }
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

  function onPlay() {
    logger.info("onPlay")
    viewModel.playing.set(true)
  }

  function onPause() {
    logger.info("onPause")
    viewModel.playing.set(false)
  }

  function togglePlay() {
    if(player) {
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    } else {
      viewModel.playing.update((it)=>!it)
    }
  }

  function onMouseEnterToPanel(e:MouseEvent) {
    logger.info("onMouseEnter")
    controlPanelTimingSwitch.cancel()
      if(!showControlPanel) {
      showControlPanel = true
    }
  }
  // function onMouseOver(e:MouseEvent) {
  //   logger.info("onMouseOver")
  // }
  function onMouseLeaveFromPanel(e:MouseEvent) {
    logger.info(`onMouseLeave y=${e.y} offsetY  =${e.offsetY}`)
    if(showControlPanel) {
      controlPanelTimingSwitch.start()
    }
  }
  // function onMouseOut(e:MouseEvent) {
  //   logger.info("onMouseOut")
  // }
  function onMouseMoveOnPanel(e:MouseEvent) {
    if(!showControlPanel) {
      showControlPanel = true
    }
  }

  const seekingInfo = { seeking:false, playing:false }
  function onSeekStart() {
    seekingInfo.seeking = true
    seekingInfo.playing = !player.paused
    player.pause()
  }

  function onSeekEnd() {
    seekingInfo.seeking = false
    if(seekingInfo.playing) {
      launch(async () => {
        await player.play()
      })
    }
  }


</script>


<div class="player-container bg-background w-full h-full">
  <ZoomView on:click={togglePlay}>
  {#if currentMediaType === "mp4"}
    <video
      class="media-view"
      class:fit={$fitMode==="fit"}
      class:fill={$fitMode==="fill"}
      class:original={$fitMode==="original"}
      bind:this={player}
      src={currentMediaUrl}
      bind:duration={$duration$}
      bind:currentTime={$currentPosition$}
      on:play={onPlay}
      on:pause={onPause}
      on:ended={onEnded}
      autoplay
    >
      <track kind="captions" src="">
    </video>
  {:else if currentMediaType === "png" || currentMediaType === "jpg"}
    <img src="{currentMediaUrl}" class="media-view" alt=""
         draggable="false"
         bind:this={imageViewer}
         >
  {:else if currentMediaType === "mp3"}
    <p>audio type is not supported yet.</p>
  {:else if currentMediaType}
    <p>unknown media type: {currentMediaType}</p>
  {:else}
    <p>No media item selected</p>
  {/if}
  </ZoomView>

  <div class="absolute bottom-0 pb-2 left-0 right-0 flex justify-center h-[95px]" on:mouseenter={onMouseEnterToPanel} on:mousemove={onMouseMoveOnPanel} on:mouseleave={onMouseLeaveFromPanel} role="none">

  {#if showControlPanel}
  <div class="absolute w-full bottom-0 div-gradient" transition:fade>
    {#if currentMediaType === "mp4"}
      <MediaControlPanel
        on:seekStart={onSeekStart}
        on:seekEnd={onSeekEnd}
        on:toggle={togglePlay}
      />
    {:else if currentMediaType === "png" || currentMediaType === "jpg"}
      <SlideShowPanel />
    {/if}
  </div>
  {/if}

  </div>


</div>

<style>
    /*.player-container {*/
    /*  display: flex;*/
    /*  justify-content: center;*/
    /*  align-items: center;*/
    /*  height: 100%;*/
    /*  overflow: hidden; !* コンテナからはみ出たビデオの部分を隠します *!*/
    /*}*/

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

  .div-gradient {
    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 10%, rgba(0,0,0,0.7) 40%);
  }
</style>