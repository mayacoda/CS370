type EventHandlerCallback = () => void;

export class GameCycleEntity {
    protected updateHandlers = new Set<EventHandlerCallback>();
    protected startHandlers = new Set<EventHandlerCallback>();
    protected destroyHandlers = new Set<EventHandlerCallback>();

    start() {
        this.startHandlers.forEach(fn => fn())
    }
    update(time?: number) {
        this.updateHandlers.forEach(fn => fn())
    }
    destroy() {
        this.destroyHandlers.forEach(fn => fn())
    }

    onUpdate(callback: EventHandlerCallback) {
        this.updateHandlers.add(callback)
    }

    onStart(callback: EventHandlerCallback) {
        this.startHandlers.add(callback)
    }

    onDestroy(callback: EventHandlerCallback) {
        this.destroyHandlers.add(callback)
    }
}
