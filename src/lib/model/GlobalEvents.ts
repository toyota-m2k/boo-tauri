import {EventListeners} from "../utils/EventBus";

export const eventWindowSizeChanged = new EventListeners()  // args: width, height
export const eventPlayRequest = new EventListeners() // args: true: play, false: pause

