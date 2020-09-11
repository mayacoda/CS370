import {GameScene} from "../../engine-lib/data";
import {randomRange} from "../../engine-lib/utilities";
import {createTree} from "./tree";
import {createLampPost} from "./lamp-post";
import {createFern} from "./fern";

export async function loadObjects(scene: GameScene) {
    for (let i = 0; i < 30; i++) {

        const fern = await createFern();

        fern.castShadow()
        let x = randomRange(-45, 45);
        let z = randomRange(-45, 45);
        fern.translate(scene.convertWorldPointToTerrainPoint(x, 0.3, z));

        let scale = randomRange(1, 5);
        fern.scale(scale, scale, scale);

        const rotation = scene.getTerrainNormalAtPoint(x, z);
        if (rotation !== null) {
            fern.object3D.up.copy(rotation);
        }

        scene.addObject(fern)
    }


    for (let i = 0; i < 15; i++) {

        const tree = await createTree();

        if (i % 3 === 0) {
            const sound = await scene.getAudio().loadPositionalSound('audio/birds-chirping.wav', `birds-chirping${i}`, tree);
            sound.setLoop(true);
            sound.setVolume(3);

            tree.onStart(() => {
                sound.play();
            });
        }

        tree.castShadow()
        let x = randomRange(-45, 45);
        let z = randomRange(-45, 45);
        tree.translate(scene.convertWorldPointToTerrainPoint(x, -0.2, z));

        let scale = randomRange(0.3, 1.7);
        tree.scale(scale, scale, scale);

        const rotation = scene.getTerrainNormalAtPoint(x, z);
        if (rotation !== null) {
            tree.object3D.up.copy(rotation);
        }

        tree.rotate(0, randomRange(-Math.PI, Math.PI), 0);

        scene.addObject(tree)
    }

    const tree = await createTree();
    tree.translate(scene.convertWorldPointToTerrainPoint(47, 50))
    scene.addObject(tree);

    await loadLampPosts(scene);
}

async function loadLampPosts(scene: GameScene) {

    const lampConfig = [
        [0, 0],
        [10, 20],
        [14, 10],
        [35, 50]
    ]

    for (let i = 0; i < lampConfig.length; i++){
        let [x, z] = lampConfig[i];
        const lampPost = await createLampPost();

        lampPost.translate(scene.convertWorldPointToTerrainPoint(x, z));
        lampPost.setName(`Lamp${i}`);

        scene.addObject(lampPost)
    }
}
