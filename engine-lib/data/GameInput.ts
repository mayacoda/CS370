export enum MouseButtons {
    Left,
    Middle,
    Right,
    Back,
    Forward
}

export class GameInput {
    private mouseEvent: MouseEvent | null = null;
    private keyboardEvent: KeyboardEvent | null = null;
    private scrollEvent: Event | null = null;
    private keysPressed: { [key: string]: boolean } = {}
    private mouseState: { isPressed: { [button: number]: boolean }, isMoving: boolean } = {
        isPressed: {},
        isMoving: false
    }
    private isMovingTimeout?: number;

    private static _instance?: GameInput = undefined;

    static get instance(): GameInput {
        if (!this._instance) {
            this._instance = new GameInput();
        }

        return this._instance;
    }

    constructor() {
        document.addEventListener('mousedown', ev => {
            this.mouseState.isPressed[ev.button] = true;
            this.mouseEvent = ev;
        });

        document.addEventListener('mouseup', ev => {
            this.mouseState.isPressed[ev.button] = false;
            this.mouseEvent = ev;
        });

        document.addEventListener('mousemove', ev => {
            this.mouseState.isMoving = true
            this.mouseEvent = ev;

            window.clearTimeout(this.isMovingTimeout);

            this.isMovingTimeout = window.setTimeout(() => {
                this.mouseState.isMoving = false;
                this.mouseEvent = null;
            }, 10);

        })

        document.addEventListener('keydown', ev => {
            this.keysPressed[ev.code] = true;
            this.keyboardEvent = ev;
        })

        document.addEventListener('keypress', ev => {
            this.keyboardEvent = ev;
        })

        document.addEventListener('keyup', ev => {
            this.keysPressed[ev.code] = false;
            this.keyboardEvent = ev;

            if (Object.values(this.keysPressed).filter(isPressed => isPressed).length === 0) {
                this.keyboardEvent = null;
            }
        })
    }

    static get MouseInput() {
        return GameInput.instance.mouseEvent
    }

    static get KeyBoardInput() {
        return GameInput.instance.keyboardEvent
    }

    static get ScrollInput() {
        return GameInput.instance.scrollEvent
    }

    static isKeyPressed(key: string) {
        return !!GameInput.instance.keysPressed[key];
    }

    static isMouseButtonPressed(button: MouseButtons) {
        return !!GameInput.instance.mouseState.isPressed[button];
    }

    static get isMouseMoving() {
        return GameInput.instance.mouseState.isMoving;
    }
}
