<script lang="ts">
  import {viewModel} from "./lib/ViewModel";
  import {HostInfo} from "./lib/HostInfo";
  import List from "./lib/List.svelte";
  import Player from "./lib/Player.svelte";
  import TitleBar from "./lib/TitleBar.svelte";
  import {onMount, tick} from "svelte";
  import {launch} from "./lib/Utils";

  const SidePanelThreshold = 1024
  const currentIndex$ = viewModel.currentIndex;
  $: title = viewModel.mediaItemAt($currentIndex$)?.name ?? "No Media"
  const loading$ = viewModel.isBusy;
  $: if(!$loading$) {
    launch(async () => {
      await tick()
      onWindowSizeChanged()
    })
  }

  let container: HTMLElement
  let headerElem: HTMLElement
  let mainContent: HTMLElement
  let sidePanel: HTMLElement
  const sidePanelWidth = getComputedStyle(document.documentElement).getPropertyValue('--side-panel-width')

  // region Side Panel
  function showSidePanel(overwrap:boolean) {
    sidePanel.style.left = '0'
    if (overwrap) {
      mainContent.style.left = '0'
    } else {
      mainContent.style.left = `${sidePanelWidth}`
    }
  }
  function hideSidePanel() {
    sidePanel.style.left = `-${sidePanelWidth}`
    mainContent.style.left = '0'
  }
  function isSidePanelShown() {
    const org = sidePanel.style.left
    return !org || org === '0px' || org === '0'|| org === ''
  }
  function toggleSidePanel() {
    if(isSidePanelShown()) {
      hideSidePanel()
    } else {
      showSidePanel(window.innerWidth<SidePanelThreshold)
    }
    updateBodyPadding() // 初めてサイドパネルを表示するとき用
  }
  // endregion


  // ヘッダーの高さを取得してbodyのpadding-topに設定する関数
  function updateBodyPadding() {
    const headerHeight = headerElem.offsetHeight // ヘッダーの高さを取得
    container.style.top  = `${headerHeight}px` // 取得した高さをbodyのpadding-topに設定
    container.style.height = `calc(100vh - ${headerHeight}px)` // ヘッダーの高さを引いた高さを設定
  }

  function onWindowSizeChanged() {
    // 画面幅が  px以上になったらサイドパネルを表示する
    if (window.innerWidth >= SidePanelThreshold) {
      showSidePanel(false)
    }
    // 画面幅が SidePanelThreshold px未満になったらサイドパネルを非表示にする
    else {
      hideSidePanel()
    }
    updateBodyPadding()
  }

  // viewModel.setHost(new HostInfo("Boo", "192.168.0.151", 6001))
  onMount(async ()=> {
    await viewModel.initialize()
  })

</script>

<svelte:window on:resize={onWindowSizeChanged} />
<div bind:this={headerElem} class="header">
  <TitleBar title={title} on:toggleSidePanel={toggleSidePanel}/>
</div>

<main bind:this={container} class="my-container">
  <div bind:this={sidePanel} class="side-panel">
    <List/>
  </div>

  <!-- ページの主要コンテンツ -->
  <div bind:this={mainContent} class="main-content">
    <!-- コンテンツ -->
    <Player/>
  </div>
</main>

<!-- ダイアログ -->
<div id="dialogContainer"/>

<!--<PasswordDialog/>-->
<!--<SettingsDialog/>-->

<style lang="scss">
  .header {
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
    width: var(--side-panel-width);
    top: 0;
    bottom: 0;
    left: calc(-1 * var(--side-panel-width));
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