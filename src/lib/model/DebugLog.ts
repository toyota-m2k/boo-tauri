import {type CurrentValueReadable, type CurrentValueStore, currentValueStore} from "../utils/CurrentValueStore";

type DevMessageLevel = "info" | "warn" | "error"
interface IDebugMessage {
    id: number
    level: DevMessageLevel
    message: string
}
interface IDebugLog {
    push: (message: string, level:DevMessageLevel) => void
    info(message: string): void
    warn(message: string): void
    error(message: string): void
    clear: () => void
    enabled: CurrentValueStore<boolean>
    messages: CurrentValueReadable<IDebugMessage[]>
}


class DebugLog implements IDebugLog {
    private nextId = 0
    messages = currentValueStore<IDebugMessage[]>([])
    push(message: string, level:DevMessageLevel) {
        if(!this.enabled.currentValue) return
        this.messages.update((prev) => [...prev, {id: this.nextId++, level, message}])
        switch(level) {
            case "info": console.info(message); break
            case "warn": console.warn(message); break
            case "error": console.error(message); break
        }
    }
    info(message: string) { this.push(message, "info") }
    warn(message: string) { this.push(message, "warn") }
    error(message: string) { this.push(message, "error")  }
    clear() { this.messages.update(() => []) }
    enabled = currentValueStore(true)
}

export const logger : IDebugLog = new DebugLog()