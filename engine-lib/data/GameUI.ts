import {GameCycleEntity} from "./GameCycleEntity";

const ELEMENT_ID = 'game_ui_layer';

const DEFAULT_STYLE = `
position: absolute;
display: flex;
height: 100%;
width: 100%;
font-family: "Helvetica Neue", "Microsoft Sans Serif", sans-serif;`

export class GameUI extends GameCycleEntity {
    private readonly uiLayer: HTMLElement
    private id: string;

    constructor(sceneName: string) {
        super();

        this.id = `${ELEMENT_ID}_${sceneName}`;

        this.uiLayer = document.createElement('div');
        this.uiLayer.setAttribute('id', this.id);
        this.uiLayer.style.cssText = DEFAULT_STYLE
        document.body.prepend(this.uiLayer);
    }

    getElement(selector: string) {
        const element = this.uiLayer.querySelector(selector);
        if (element === null) {
            throw new Error(`Could not find GUI element with selector '${selector}'`);
        }

        return element
    }

    getAllElements(selector: string) {
        return this.uiLayer.querySelectorAll(selector)
    }

    addElement(element: HTMLElement) {
        this.uiLayer.appendChild(element);
    }

    setDefaultGuiStyle(cssText: string) {
        this.uiLayer.style.cssText = DEFAULT_STYLE + cssText;
    }

    removeElement(element: HTMLElement) {
        this.uiLayer.removeChild(element);
    }

    destroy() {
        super.destroy();
        document.body.removeChild(this.uiLayer);
        this.uiLayer.innerHTML = '';
    }
}
