import {Game, GameScene} from "../../engine-lib/data";
import {loadCharacter} from "../common/character";
import {loadCamera} from "../common/camera";
import {loadLights} from "./lights";
import {loadObjects} from "../common/scene";
import {initGamePlay, LEVEL_2_SCORE, LEVEL_2_TIME_LIMIT} from "./gameplay";
import {initGui, showInstructions} from "../common/gui";
import {loadLevel1} from "../level1";

export async function loadLevel2(game: Game) {
    const SCENE_NAME = 'level 2'

    const scene = new GameScene(SCENE_NAME);

    game.addScene(scene);

    await scene.loadSkybox([
        'skybox/green/px.png',
        'skybox/green/nx.png',
        'skybox/green/py.png',
        'skybox/green/ny.png',
        'skybox/green/pz.png',
        'skybox/green/nz.png'
    ]);

    await scene.loadTerrain('HeightMap9.png', 'textures/Ground-Texture2.png', {
        repeat: 20,
        color: '#888',
        maxHeight: 10,
        hasPhysics: true,
        widthExtents: 130,
        depthExtents: 130
    });

    scene.setFog('#4b816e', 0.03);

    const character = await loadCharacter(scene);

    loadCamera(scene, character);
    loadLights(scene);
    await loadObjects(scene);

    initGui(scene, {
        pausePlayCallback: state => {
            state ? game.pause() : game.play();
        },
        restartCallback: () => {
            game.startLoad();
            loadLevel1(game).then(() => {
                game.endLoad();
            })
        }
    });

    const text = [
        `
        Let's step it up a bit. Now there are <strong>TWO</strong> balls.<br>
        And a time limit.
        `,
        `
        You have <strong>${LEVEL_2_TIME_LIMIT} minutes</strong><br>
        to catch <strong>${LEVEL_2_SCORE} balls</strong>
        `,
        `GO!`
    ]
    showInstructions(scene, text, () => {
        initGamePlay(scene, character, () => {
            showInstructions(scene, ['Nice job! Have yourself a bone'], () => {})
        }, () => {
            showInstructions(scene, ['Game over, you didn\'t make it'], () => {})
        });
    });

    game.loadScene(SCENE_NAME);
}
