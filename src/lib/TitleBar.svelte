<script lang="ts">
  import Viewbox from "./common/Viewbox.svelte";
  import {createEventDispatcher} from 'svelte';
  import {viewModel} from "./model/ViewModel";
  import {Button} from "flowbite-svelte";
  import {
    ICON_COG,
    ICON_REPEAT,
    ICON_SINGLE,
    ICON_SEQUENTIAL,
    ICON_MENU,
    ICON_MODE_FIT,
    ICON_MODE_FILL, ICON_MODE_ORIGINAL
  } from './Icons.js'
  import SvgIcon from './common/SvgIcon.svelte'
  import type {Readable} from "svelte/store";

  export let title: string;
  const playMode = viewModel.playMode;

  let currentIndex$: Readable<number> = viewModel.currentIndex
  $: currentMediaType = viewModel.mediaItemAt($currentIndex$)?.media


  const dispatch = createEventDispatcher()

  function toggleSidePanel() {
    dispatch('toggleSidePanel');
  }

  // let headerElem: HTMLElement;
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


<div class="header bg-primary text-primary-on">
  <div class="left-header">
    <button class="menu-button text-primary-on" on:click={toggleSidePanel}>
      <SvgIcon class="h-6 w-6" path={ICON_MENU}/>
    </button>
  </div>
  <Viewbox text="{title}" class="flex-grow mr-2"/>
  <nav>
    {#if currentMediaType!=="p"}
      <Button class="rounded h-7 secondary_button" size="xs" on:click={nextFitMode}>
        {#if $fitMode === 'original'}
          <SvgIcon class="h-4 w-4" path={ICON_MODE_ORIGINAL}/>
        {:else if $fitMode === 'fit'}
          <SvgIcon class="h-4 w-4" path={ICON_MODE_FIT}/>
        {:else}
          <SvgIcon class="h-4 w-4" path={ICON_MODE_FILL}/>
        {/if}
      </Button>
      <Button size="xs" class="rounded h-7 secondary_button" on:click={()=>viewModel.nextPlayMode()}>
        {#if $playMode === 'single'}
          <SvgIcon class="h-4 w-4" path={ICON_SINGLE}/>
        {:else if $playMode === 'sequential'}
          <SvgIcon class="h-4 w-4" path={ICON_SEQUENTIAL}/>
        {:else}
          <SvgIcon class="h-4 w-4" path={ICON_REPEAT}/>
        {/if}
      </Button>
    {/if}
    <Button size="xs" class="rounded h-7 secondary_button" on:click={showSettingsDialog}>
      <SvgIcon class="h-4 w-4" path={ICON_COG}/>
    </Button>
    <!-- 他のナビゲーション要素 -->
  </nav>
</div>

<style lang="scss">
  .header {
    height: 100%;
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
    font-size: 24px;
    cursor: pointer;
    padding: 10px;
  }

  //.appName {
  //  font-size: 1.5rem;
  //  margin-right: 1rem;
  //}

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