import {Game, GameScene} from "../../engine-lib/data";
import {loadCharacter} from "../common/character";
import {loadCamera} from "../common/camera";
import {loadLights} from "./lights";
import {loadObjects} from "../common/scene";
import {initGamePlay, LEVEL_2_SCORE, LEVEL_2_TIME_LIMIT} from "./gameplay";
import {initGui, showInstructions} from "../common/gui";
import {loadLevel1} from "../level1";
import {updateHighScore} from "../common/high-score";
import {LEVEL_2_SCENE_NAME} from "../common/levels";

export async function loadLevel2(game: Game) {
    const SCENE_NAME = LEVEL_2_SCENE_NAME

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
            music.stop();
            loadLevel1(game).then(() => {
                game.endLoad();
            })
        }
    });

    const audio = game.getAudio();

    const music = await audio.loadSound(
        'audio/Vacation Casual - Sir Cubworth.mp3',
        'level_2_music'
    );
    music.setLoop(true);
    music.setVolume(0.3);
    music.play();

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
        initGamePlay(scene, character, (time: number) => {
            updateHighScore(SCENE_NAME, time);

            showInstructions(scene, ['Nice job! Have yourself a bone'], () => {})
        }, () => {
            showInstructions(scene, ['Game over, you didn\'t make it'], () => {})
        });
    });

    game.loadScene(SCENE_NAME);
}
