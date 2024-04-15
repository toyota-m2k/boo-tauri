<script lang="ts">
  import {viewModel} from "./lib/ViewModel";
  import {HostInfo} from "./lib/HostInfo";
  import List from "./lib/List.svelte";
  import Player from "./lib/Player.svelte";
  import Viewbox from "./lib/Viewbox.svelte";
  import TitleBar from "./lib/TitleBar.svelte";

  const currentIndex$ = viewModel.currentIndex;
  $: title = viewModel.mediaItemAt($currentIndex$)?.name ?? "No Media"

  let headerElem: HTMLElement
  let mainContent: HTMLElement
  let sidePanel: HTMLElement
  const sidePanelWidth = getComputedStyle(document.documentElement).getPropertyValue('--side-panel-width')
  function toggleSidePanel() {
    // 画面幅が600px以上の場合のみ実行
    if (window.innerWidth >= 600) {
      if (sidePanel.style.left === '0px') {
        mainContent.style.marginLeft = '0'; // main-contentの余白をなくす
      } else {
        mainContent.style.marginLeft = sidePanelWidth // main-contentの余白を設定する
      }
    } else {
      mainContent.style.marginLeft = '0'; // main-contentの余白をなくす
    }
    sidePanel.style.left = sidePanel.style.left === '0px' ? `-${sidePanelWidth}` : '0px';
  }

  // ヘッダーの高さを取得してbodyのpadding-topに設定する関数
  function updateBodyPadding() {
    const headerHeight = headerElem.offsetHeight // ヘッダーの高さを取得
    mainContent.style.paddingTop = `${headerHeight}px` // 取得した高さをbodyのpadding-topに設定
    sidePanel.style.paddingTop = `${headerHeight}px` // サイドパネルのtopにもヘッダーの高さを設定
  }
  function onWindowSizeChanged() {
    // 画面幅が600px以上になったらサイドパネルを表示する
    if (window.innerWidth >= 600) {
      sidePanel.style.left = '0';
      mainContent.style.marginLeft = sidePanelWidth
    }
    // 画面幅が600px未満になったらサイドパネルを非表示にする
    else {
      if (sidePanel.style.left === '0px') {
        sidePanel.style.left = `-${sidePanelWidth}`;
        mainContent.style.marginLeft = '0'
      }
    }
    updateBodyPadding()
  }

  viewModel.setHost(new HostInfo("Boo", "localhost", 3500))


</script>

<svelte:window on:resize={onWindowSizeChanged} />
<main class="container">
  <div bind:this={headerElem} class="header">
    <TitleBar title={title} on:toggleSidePanel={toggleSidePanel}/>
  </div>


  <div bind:this={sidePanel} class="side-panel">
    <List/>

  </div>


  <!-- ページの主要コンテンツ -->
  <div bind:this={mainContent} class="main-content">
    <!-- コンテンツ -->
    <Player/>
  </div>
</main>

<style lang="scss">
  .container {
    margin: 0;
    width: 100%;
    height: 100vh;
    //display: flex;
    //flex-direction: column;
    //justify-content: center;
    //text-align: center;
  }


  /* サイドパネルの基本スタイル */
  .side-panel {
    width: var(--side-panel-width);
    height: 100vh;
    position: fixed;
    left: calc(-1 * var(--side-panel-width));
    transition: left 0.3s;
    background-color: #f0f0f0;
    overflow-y: auto; /* 縦方向のスクロールバーを有効にする */
  }
  .main-content {
    background-color: #f8f8f8;
    height: 100%;
    margin-left: 0;
  }

  /* 画面幅が600px以上の場合、サイドパネルを表示 */
  //@media (min-width: 600px) {
    //.side-panel {
    //  //position: static; /* 固定位置を解除 */
    //}
    //.main-content {
    //  margin-left: var(--side-panel-width); /* side-panelの幅だけ左に余白を設定 */
    //}
  //}

  //@media (max-width: 599px) {
  //  .main-content {
  //    margin-left: 0; /* side-panelの幅だけ左に余白を設定 */
  //  }
  //}

  .header {
    position: fixed; /* ヘッダーを固定 */
    top: 0; /* 上部から0pxの位置に */
    left: 0; /* 左端から0pxの位置に */
    width: 100%; /* 幅を100%に設定 */
    z-index: 1000; /* 他の要素より前面に表示 */
  }


</style>