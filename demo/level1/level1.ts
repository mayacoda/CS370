import {Game, GameScene} from "../../engine-lib";
import {loadLights, loadObjects} from "./scene";

export async function loadLevel1(game: Game) {
    const scene = new GameScene();

    game.addScene(scene, 'level 1')

    scene.loadSkybox('skybox/Epic_GloriousPink_EquiRect.png');

    await scene.loadTerrain('textures/heightmap_128.jpg', 'textures/terrain.jpg');

    // scene.loadSkybox([
    //     'skybox/CartoonBaseNightSky_Cam_2_Left+X.png',
    //     'skybox/CartoonBaseNightSky_Cam_3_Right-X.png',
    //     'skybox/CartoonBaseNightSky_Cam_4_Up+Y.png',
    //     'skybox/CartoonBaseNightSky_Cam_5_Down-Y.png',
    //     'skybox/CartoonBaseNightSky_Cam_0_Front+Z.png',
    //     'skybox/CartoonBaseNightSky_Cam_1_Back-Z.png'
    // ]);

    await loadObjects(scene);
    loadLights(scene);
}
