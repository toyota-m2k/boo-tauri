<script lang="ts">
  import Viewbox from "./Viewbox.svelte";
  import {createEventDispatcher} from 'svelte';
  import {viewModel} from "./ViewModel";
  import {Button, GradientButton} from "flowbite-svelte";
  // import {CogOutline} from "flowbite-svelte-icons";
  import {ICON_COG,ICON_REPEAT,ICON_SINGLE,ICON_SEQUENTIAL} from './Icons.js'
  import SvgIcon from './SvgIcon.svelte'

  export let title: string;
  const playMode = viewModel.playMode;


  const dispatch = createEventDispatcher();

  function toggleSidePanel() {
    dispatch('toggleSidePanel');
  }

  let headerElem: HTMLElement;
  let fitMode = viewModel.fitMode;
  function nextFitMode() {
    if($fitMode === 'fit') {
      viewModel.fitMode.set('fill');
    } else if($fitMode === 'fill'){
      viewModel.fitMode.set('original');
    } else {
      viewModel.fitMode.set('fit');
    }
  }

  function showSettingsDialog() {
    // const p = viewModel.showPasswordDialog()
    // p.then((pwd) => {
    //     console.log("pwd=" + pwd)
    //   })
    //   .catch((e) => {
    //     console.log("error=" + e)
    //   })
    //   .finally(() => {
    //     console.log("finally")
    //   })


    viewModel.showSettingsDialog()
  }
</script>


<div bind:this={headerElem} class="header bg-teal-800 text-gray-50">
  <div class="left-header">
    <button class="menu-button" on:click={toggleSidePanel}>☰</button>
    <div class="appName">BooTauri</div>
  </div>
  <Viewbox text="{title}" class="flex-grow"/>
  <nav>
    <GradientButton size="sm" class="h-7" on:click={nextFitMode}>{$fitMode}</GradientButton>
    <GradientButton size="xs" class="h-7" on:click={()=>viewModel.nextPlayMode()}>
      {#if $playMode === 'single'}
        <SvgIcon class="h-4 w-4" path={ICON_SINGLE}/>
      {:else if $playMode === 'sequential'}
        <SvgIcon class="h-4 w-4" path={ICON_SEQUENTIAL}/>
      {:else}
        <SvgIcon class="h-4 w-4" path={ICON_REPEAT}/>
      {/if}
    </GradientButton>
    <GradientButton size="xs" class="h-7" on:click={showSettingsDialog}>
      <SvgIcon class="h-4 w-4" path={ICON_COG}/>
    </GradientButton>
    <!-- 他のナビゲーション要素 -->
  </nav>
</div>

<style lang="scss">
  .header {
    padding: 2px 10px; /* パディング */
    box-sizing: border-box;
    display: flex; /* フレックスボックスを使用 */
    justify-content: space-between; /* タイトルとナビゲーションを両端に配置 */
    align-items: center; /* アイテムを中央揃え */
  }

  //.header h1 {
  //  margin: 0; /* タイトルのマージンをリセット */
  //}

  .left-header {
    display: flex;
    align-items: center;
  }

  /* サイドパネル開閉ボタンのスタイル */
  .menu-button {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 10px;
  }

  .appName {
    font-size: 1.5rem;
    margin-right: 1rem;
  }

  nav {
    display: flex;
    gap: 4px;
    flex-direction: row; /* ナビゲーションを横並びに */
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

</style>