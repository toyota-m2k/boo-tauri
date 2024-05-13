import {TimingSwitch} from "../utils/TimingSwitch";
import {viewModel} from "./ViewModel";
import type {Unsubscriber} from "svelte/store";

export class MouseConcealer {
  private element:HTMLElement|undefined
  private unsubscriver?:Unsubscriber
  private timer: TimingSwitch = new TimingSwitch(2000, ()=>{
    this.conceal()
    return false
  })
  public start(element:HTMLElement, timeout:number=2000) {
    this.timer.setInterval(timeout)
    this.element = element;

    // elementに、別のイベントハンドラが登録されていない前提
    element.onmousemove = () => {
      this.onMouseMove();
    }
    this.unsubscriver = viewModel.playing.subscribe((playing)=>{
      if(!playing) {
        this.timer.cancel()
        this.reveal()
      } else {
        this.timer.start()
      }
    })
  }
  public stop() {
    this.timer.cancel()
    this.reveal()
    this.unsubscriver?.()
  }

  private conceal() {
      if(this.element) {
        this.element.style.cursor = 'none';
      }
    }
  private reveal() {
      if(this.element) {
        this.element.style.cursor = 'auto';
      }
    }

  private onMouseMove() {
    this.reveal()
    this.timer.start()
  }
}