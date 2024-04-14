<script lang="ts">
  import {viewModel} from "./lib/ViewModel";
  import {HostInfo} from "./lib/HostInfo";
  import List from "./lib/List.svelte";
  import Player from "./lib/Player.svelte";
  import Viewbox from "./lib/Viewbox.svelte";

  const currentIndex$ = viewModel.currentIndex;
  $: title = viewModel.mediaItemAt($currentIndex$)?.name ?? "No Media"

  let headerElem: HTMLElement
  let mainContent: HTMLElement
  let sidePanel: HTMLElement
  const sidePanelWidth = getComputedStyle(document.documentElement).getPropertyValue('--side-panel-width')
  function toggleSidePanel() {
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
    }
    // 画面幅が600px未満になったらサイドパネルを非表示にする
    else {
      if (sidePanel.style.left === '0px') {
        sidePanel.style.left = `-${sidePanelWidth}`;
      }
    }
    updateBodyPadding()
  }

  viewModel.setHost(new HostInfo("Boo", "localhost", 3500))


</script>

<svelte:window on:resize={onWindowSizeChanged} />
<main class="container">
  <header bind:this={headerElem} class="header">
    <div class="left-header">
      <button class="menu-button" on:click={toggleSidePanel}>☰</button>
      <div class="appName">BooTauri</div>
      <Viewbox text="{title}"/>
    </div>
    <nav>
      <button>ボタン1</button>
      <button>ボタン2</button>
      <!-- 他のナビゲーション要素 -->
    </nav>
  </header>


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
  }

  /* 画面幅が600px以上の場合、サイドパネルを表示 */
  @media (min-width: 600px) {
    .side-panel {
      left: 0;
    }
  }

  /* メニューボタンのスタイル */
  //.menu-button {
  //  display: none;
  //  position: fixed;
  //  top: 20px;
  //  left: 20px;
  //}
  .menu-button {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 10px;
    margin-right: 20px; /* タイトルとの間隔を調整 */
  }
  /* 画面幅が600px未満の場合、メニューボタンを表示 */
  @media (max-width: 599px) {
    .menu-button {
      display: block;
    }
  }

  .header {
    position: fixed; /* ヘッダーを固定 */
    top: 0; /* 上部から0pxの位置に */
    left: 0; /* 左端から0pxの位置に */
    width: 100%; /* 幅を100%に設定 */
    z-index: 1000; /* 他の要素より前面に表示 */
    background-color: #333; /* ヘッダーの背景色 */
    color: white; /* ヘッダー内のテキスト色 */
    padding: 2px 10px; /* パディング */
    box-sizing: border-box;
    display: flex; /* フレックスボックスを使用 */
    justify-content: space-between; /* タイトルとナビゲーションを両端に配置 */
    align-items: center; /* アイテムを中央揃え */
  }

  .header h1 {
    margin: 0; /* タイトルのマージンをリセット */
  }

  .header nav button {
    background-color: #555; /* ボタンの背景色 */
    color: white; /* ボタンのテキスト色 */
    border: none; /* ボタンの境界線を削除 */
    padding: 5px 10px; /* ボタンのパディング */
    margin-left: 10px; /* ボタン間のマージン */
    cursor: pointer; /* ホバー時のカーソルをポインターに */
  }

  .header nav button:hover {
    background-color: #666; /* ホバー時のボタンの背景色 */
  }

  .appName {
    margin-right: 10px;
    font-size: 24px;
  }
  .left-header {
    display: flex;
    align-items: center;
  }

</style>