<script lang="ts">
  import {viewModel} from "../model/ViewModel";

  const currentTime = viewModel.currentPosition
  const duration = viewModel.duration
  let currentTimePercent = 0
  $: currentTimePercent = ($currentTime / $duration) * 100
</script>

<div class="w-full">
  <div
    class="slider-bar"
    style="background: linear-gradient(to right, var(--color-purple-600) 0%, var(--color-purple-600) {currentTimePercent}%, var(--color-gray-500) {currentTimePercent}%, var(--color-gray-500) 100%);"
  />

  <input class="w-full appearance-none cursor-pointer" type="range" min="0" max={$duration}
         bind:value={$currentTime} step="any"/>
</div>

<style lang="scss">
  .slider-bar{
    width: 100%;
    height: 7px;
  }

  .slider {
    -webkit-appearance: none;

    &:focus {
      box-shadow: 0 0 3px rgb(0, 161, 255); // -webkit-向けのfocusスタイル
    }

    // つまみをSVG画像に置き換える
    &::-webkit-slider-thumb {
      -webkit-appearance: none; // デフォルトのつまみのスタイルを解除
      background: transparent; // 背景を透明に
      width: 24px; // 幅
      height: 24px; // 高さ
      border: none; // デフォルトの線を消す
      padding: 0; // 余白をなくす
      margin: 0; // マージンをなくす
      cursor: pointer; // カーソルを分かりやすく
      background-image: url('./thumb.svg'); // SVG画像のパスを指定
      background-size: cover; // 画像をカバーするように表示
    }
  }

  .slider-org {
    all:revert;
    position: absolute;
    width: 100%;
    top: 50%;
    left: 0;
    cursor: pointer;
    height: 50px;
    -webkit-appearance: none;
    appearance: none;
    -moz-appearance: none;

    /* つまみ Thumb: Chrome, Safari, Opera, Edge Chromium */
    &::-webkit-slider-thumb {
      appearance: none;
      height: 28px;
      width: 28px;
      background-color: #c0c0c0;
      border: 1px solid #808080;
      z-index: 4;
      box-shadow: none;
      border-radius: 50%;
    }
    ///* つまみ Firefox */
    //&::-moz-range-thumb {
    //  box-shadow: none;
    //  height: 28px;
    //  width: 28px;
    //  background-color: var(--color-gray20);
    //  border: 1px solid var(--color-gray50);
    //  border-radius: 50%;
    //}
  }
</style>