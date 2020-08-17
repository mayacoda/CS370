export class GameInput {
    private static _instance: GameInput;
    private mouseEvent: MouseEvent | null = null;
    private keyboardEvent: KeyboardEvent | null = null;
    private keysPressed: { [key: string]: boolean } = {}


    static get instance(): GameInput {
        if (!this._instance) {
            this._instance = new GameInput();
        }

        return this._instance;
    }

    constructor() {
        document.addEventListener('mousedown', ev => {
            this.mouseEvent = ev;
        });

        document.addEventListener('mouseup', () => {
            this.mouseEvent = null;
        });

        document.addEventListener('keydown', ev => {
            this.keysPressed[ev.key] = true;
        })

        document.addEventListener('keypress', ev => {
            this.keyboardEvent = ev;
        })

        document.addEventListener('keyup', ev => {
            this.keysPressed[ev.key] = false;

            if (!Object.values(this.keysPressed).some(val => val)) {
                this.keyboardEvent = null;
            }
        })
    }

    static get MouseInput() {
        if (GameInput.instance.mouseEvent) {
            return GameInput.instance.mouseEvent
        }

        return null;
    }

    static get KeyBoardInput() {
        if (GameInput.instance.keyboardEvent) {
            return GameInput.instance.keyboardEvent
        }
        return null;
    }

    static isKeyPressed(key: string) {
        return !!GameInput.instance.keysPressed[key]
    }
}
