<script lang="ts">
  import {viewModel} from "./lib/ViewModel";
  import {HostInfo} from "./lib/HostInfo";
  import List from "./lib/List.svelte";
  import Player from "./lib/Player.svelte";

  let sidePanel: HTMLElement
  const sidePanelWidth = getComputedStyle(document.documentElement).getPropertyValue('--side-panel-width')
  function toggleSidePanel() {
    sidePanel.style.left = sidePanel.style.left === '0px' ? `-${sidePanelWidth}` : '0px';
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
  }

  viewModel.setHost(new HostInfo("Boo", "localhost", 3500))

</script>

<svelte:window on:resize={onWindowSizeChanged} />
<main class="container">
  <div bind:this={sidePanel} class="side-panel">
    <List/>

  </div>

  <button class="menu-button" on:click={toggleSidePanel}>メニュー</button>

  <!-- ページの主要コンテンツ -->
  <div class="main-content">
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
    text-align: center;
  }


  /* サイドパネルの基本スタイル */
  .side-panel {
    width: var(--side-panel-width);
    height: 100%;
    position: fixed;
    left: calc(-1 * var(--side-panel-width));
    transition: left 0.3s;
    background-color: #f0f0f0;
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
  .menu-button {
    display: none;
    position: fixed;
    top: 20px;
    left: 20px;
  }

  /* 画面幅が600px未満の場合、メニューボタンを表示 */
  @media (max-width: 599px) {
    .menu-button {
      display: block;
    }
  }
</style>