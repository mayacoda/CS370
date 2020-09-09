import {createElement} from "./gui-util";

export function createMenuButton() {
    const element = createElement('menu-button');
    element.addEventListener('click', () => console.log('opening the menu'))
    return element;
}

export function createPausePlayButton(pausePlayCallback: (state: boolean) => void) {
    const element = createElement('pause-play', 'button');
    element.innerHTML = 'pause';
    let state = false;
    element.addEventListener('click', () => {
        state = !state;
        element.innerHTML = state ? 'play' : 'pause';
        pausePlayCallback(state);
    });
    return element;
}

export function createRestartButton(restartCallback: () => void) {
    const element = createElement('restart', 'button');
    element.innerHTML = 'restart';
    element.addEventListener('click', () => {
       restartCallback();
    });
    return element;
}
