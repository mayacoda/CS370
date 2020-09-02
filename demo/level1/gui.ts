import {GameScene} from "../../engine-lib/data";

export function initGui(scene: GameScene) {
    const gui = scene.getGUI();
    gui.setDefaultGuiStyle('flex-direction: column;')

    const header = createElement('header');

    header.appendChild(createElement('time'));
    const scoreElement = createElement('score');
    scoreElement.innerHTML = '0';
    header.appendChild(scoreElement);

    gui.addElement(header);
    gui.addElement(createElement('exclamation'))
}

function createElement(className: string) {
    const element = document.createElement('div');
    element.classList.add(className);
    return element;
}
