/**
 * SlideShowPanel.svelte 内に書いてしまうと、コントロールパネルが非表示になるたびにリセットされて困るものをここに記述
 */
import {TimingSwitch} from "../utils/TimingSwitch";
import {viewModel} from "./ViewModel";
import {settings} from "./Settings";

function isImageType():boolean {
  const item = viewModel.currentItem
  return item?.media === "p"
}

const slideShowTimer = new TimingSwitch(settings.slideShowInterval*1000, ()=>{
  if(viewModel.playing.currentValue && viewModel.currentItem?.media==="p") {
    viewModel.next()
    slideShowTimer.setInterval(settings.slideShowInterval*1000)
    return true
  } else {
    return false
  }
})

export function startSlideShow() {
  if(viewModel.currentItem?.media!=="p") return
  viewModel.playing.set(true)
  slideShowTimer.setInterval(settings.slideShowInterval*1000)
  slideShowTimer.start()
}

export function stopSlideShow() {
  slideShowTimer.cancel()
  viewModel.playing.set(false)
}

export function toggleSlideShow() {
  if(viewModel.playing.currentValue || viewModel.currentItem?.media!=="p") {
    stopSlideShow()
  } else {
    startSlideShow()
  }
}