<script lang="ts">
  import {viewModel} from "./lib/model/ViewModel";
  import Player from "./lib/Player.svelte";
  import TitleBar from "./lib/TitleBar.svelte";
  import {onMount, tick} from "svelte";
  import {delay, launch} from "./lib/utils/Utils";
  import SidePanel from './lib/SidePanel.svelte'
  import DebugView from "./lib/DebugView.svelte";
  import {logger} from "./lib/model/DebugLog";
  import { fade } from 'svelte/transition'
  import {tauriEx} from "./lib/utils/TauriEx";
  import {Env} from "./lib/utils/Env";
  import {globalKeyEvents, keyFor} from "./lib/utils/KeyEvents";

  const SidePanelThreshold = 1024

  const currentIndex$ = viewModel.currentIndex;
  $: title = viewModel.mediaItemAt($currentIndex$)?.name ?? "No Media"
  const loading$ = viewModel.isBusy;
  $: if(!$loading$) {
    launch(async () => {
      await tick()
      onWindowSizeChanged()
      // if(Env.isTauri) {
      //   await tauriEx.setFocusListener((focus)=>{
      //     logger.debug(`focus: ${focus}`)
      //   })
      // }
    })
  }

  let container: HTMLElement
  let headerElem: HTMLElement
  let playerElem: HTMLElement

  // let mainContent: HTMLElement
  // let sidePanel: HTMLElement
  const debugLog = logger.enabled

  let titleBarHeight = 50
  let titleBarShown = true

  let sidePanelWidth = 250 //getComputedStyle(document.documentElement).getPropertyValue('--side-panel-width')
  let sidePanelShown = true
  let sidePanelOverWrap = false

  // region Side Panel
  // function showSidePanel(overwrap:boolean) {
  //   sidePanel.style.left = '0'
  //   if (overwrap) {
  //     mainContent.style.left = '0'
  //   } else {
  //     mainContent.style.left = `${sidePanelWidth}`
  //   }
  //   logger.info(`showSidePanel: sidePanel.left=${sidePanel.style.left} / mainContent.left=${mainContent.style.left}`)
  // }
  // function hideSidePanel() {
  //   sidePanel.style.left = `-${sidePanelWidth}`
  //   mainContent.style.left = '0'
  //   logger.info(`hideSidePanel: ${sidePanel.style.left}`)
  // }
  // function isSidePanelShown() {
  //   const org = sidePanel.style.left
  //   return !org || org === '0px' || org === '0'|| org === ''
  // }
  // function toggleSidePanel() {
  //   logger.info(`toggleSidePanel`)
  //   if(isSidePanelShown()) {
  //     hideSidePanel()
  //   } else {
  //     showSidePanel(window.innerWidth<SidePanelThreshold)
  //   }
  //   updateBodyPadding() // 初めてサイドパネルを表示するとき用
  // }
  // endregion


  // ヘッダーの高さを取得してbodyのpadding-topに設定する関数
  function updateBodyPadding() {
    const headerHeight = titleBarShown ? headerElem.offsetHeight : 0 // ヘッダーの高さを取得
    container.style.top  = `${headerHeight}px` // 取得した高さをbodyのpadding-topに設定
    container.style.height = `calc(100vh - ${headerHeight}px)` // ヘッダーの高さを引いた高さを設定
  }

  async function toggleFullScreen() {
    if(Env.isTauri) {
      if(!await tauriEx.isFullscreen()) {
        logger.info("tauri: normal --> fullscreen")
        await tauriEx.fullscreen(true)
        await tick()
        sidePanelShown = false
        titleBarShown = false
      } else {
        logger.info("tauri: fullscreen --> normal")
        await tauriEx.fullscreen(false)
        await tick()
        // sidePanelShown = true
        titleBarShown = true
      }
    } else {
      if (!document.fullscreenElement) {
        logger.info("normal --> fullscreen")
        await playerElem.requestFullscreen?.()
      } else {
        logger.info("fullscreen --> normal")
        await document.exitFullscreen()
      }
    }
  }

  function onWindowSizeChanged() {
    logger.info("sidePanelWidth: " + sidePanelWidth)

    if(!Env.isTauri || !tauriEx.isFullscreen()) {
      // 画面幅が  px以上になったらサイドパネルを表示する
      if (window.innerWidth >= SidePanelThreshold) {
        sidePanelShown = true
        sidePanelOverWrap = false
      }
      // 画面幅が SidePanelThreshold px未満になったらサイドパネルを非表示にする
      else {
        sidePanelShown = false
        sidePanelOverWrap = true
      }
    }
    updateBodyPadding()
  }

  // viewModel.setHost(new HostInfo("Boo", "192.168.0.151", 6001))
  onMount(async ()=> {
    await Env.init()
    await viewModel.initialize()

    globalKeyEvents
    .register(
      keyFor({key: "KeyD", asCode: true}, {commandOrControl: true, shift: true}),
      () => {
      logger.enabled.set(!logger.enabled.currentValue)
    })
    .register([
      keyFor({key: "F11", asCode: true}, {}, "W"),
      keyFor({key: "KeyF", asCode: true}, {commandOrControl: true, shift: true}),],
      () => { toggleFullScreen() })
    .activate()
    //
    // keyEvents.register("KeyL", {ctrl:true, shift:true}, () => {
    //   logger.enabled.set(!logger.enabled.currentValue)
    // })
    // keyEvents.register("F11", {}, () => {
    //   if(!document.fullscreenElement) {
    //     // プレーヤーペインをフルスクリーンにする
    //     playerElem.requestFullscreen()
    //     // TauriのWindowを最大化して、Windowのタイトルバーを非表示にする
    //     tauriFullScreen(true)
    //   } else {
    //     document.exitFullscreen()
    //     tauriFullScreen(false)
    //   }
    // })
  })



</script>

<svelte:window on:resize={onWindowSizeChanged}/>
<div bind:this={headerElem} class="title-bar" style:height={`${titleBarHeight}px`} style:top={titleBarShown ? "0px" : `-${titleBarHeight}px`}>
  <TitleBar title={title} on:toggleSidePanel={()=> sidePanelShown=!sidePanelShown}/>
</div>

<main bind:this={container} class="my-container" style:top={titleBarShown ? `${titleBarHeight}px` : "0px"}>
  <div class="side-panel" style:width="{sidePanelWidth}px" style:left={sidePanelShown ? "0px" : `-${sidePanelWidth}px`}>
    <SidePanel/>
  </div>

  <!-- ページの主要コンテンツ -->
  <div bind:this={playerElem} class="main-content" style:left={sidePanelOverWrap||!sidePanelShown ? "0px" : `${sidePanelWidth}px`}>
    <!-- コンテンツ -->
    <Player/>
  </div>

  {#if $loading$}
    <div transition:fade class="loading absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center bg-gray-500">
      <div class="spinner fill-gray-200">Loading ...</div>
    </div>
  {/if}

  {#if $debugLog}
    <DebugView/>
  {/if}
</main>

<!-- ダイアログ -->
<div id="dialogContainer"/>

<!--<PasswordDialog/>-->
<!--<SettingsDialog/>-->

<style lang="scss">
  .title-bar {
    position: fixed; /* ヘッダーを固定 */
    top: 0; /* 上部から0pxの位置に */
    left: 0; /* 左端から0pxの位置に */
    width: 100%; /* 幅を100%に設定 */
    z-index: 10; /* 他の要素より前面に表示 */
  }

  .my-container {
    position: relative;
    margin: 0;
    width: 100%;
    //height: 100%;
    display: flex;
    //flex-direction: column;
    //justify-content: center;
    //text-align: center;
  }



  /* サイドパネルの基本スタイル */
  .side-panel {
    position: absolute;
    //width: 250px;
    top: 0;
    bottom: 0;
    left: 0;
    transition: left 0.3s;
    background-color: #f0f0f0;
    overflow-y: auto; /* 縦方向のスクロールバーを有効にする */
    z-index: 10; /* Playerより上に表示：これを入れておかないと、on:click を Playerが先にハンドルしてしまう */
  }

  .main-content {
    position: absolute;
    top: 0;
    bottom: 0;
    background-color: #f8f8f8;
    left: 0;
    right: 0;
  }

  /* 画面幅が600px以上の場合、サイドパネルを表示 */
  //@media (min-width: 600px) {
  //  .side-panel {
  //    left: 0;
  //  }
  //  .main-content {
  //    left: var(--side-panel-width); /* side-panelの幅だけ左に余白を設定 */
  //  }
  //}

  //@media (max-width: 599px) {
  //  .main-content {
  //    margin-left: 0; /* side-panelの幅だけ左に余白を設定 */
  //  }
  //}

</style>