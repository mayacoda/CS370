import {Game} from "../engine-lib/data";
import {loadLevel1} from "./level1";

async function init() {
    // fetch the canvas element
    let canvas = document.querySelector('#canvas');
    if (canvas === null || !(canvas instanceof HTMLCanvasElement)) return

    // start the game
    const game = new Game(canvas);
    game.startLoad();
    await game.preload()

    // load the first level
    await loadLevel1(game);

    game.onLoadStart(() => {
        const loader = document.querySelector('.loading') as HTMLElement;
        loader.style.opacity = '1';
    })

    game.onLoadEnd(() => {
        const loader = document.querySelector('.loading') as HTMLElement;
        loader.style.opacity = '0';
    })

    game.start();
    game.endLoad();
}

init();
