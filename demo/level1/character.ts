import {GameScene} from "../../engine-lib/data";
import {AnimatedGameObject} from "../../engine-lib/data/AnimatedGameObject";

export async function loadCharacter(scene: GameScene) {

    const dog = new AnimatedGameObject();
    await dog.loadFBX('models/api/Api.fbx');

    dog.scale(2);
    dog.translate(scene.convertToTerrainPoint(3, -4));
    dog.rotate(0, Math.PI - Math.PI / 4, 0);
    dog.castShadow(true)

    dog.playAnimation('Dog Armature|walk');

    document.addEventListener("keydown", ev => {
        if (ev.key === 'a') {
            console.log('crossfading from walk to run');
            dog.crossFadeAnimation('Dog Armature|walk', 'Dog Armature|running', 5);
        }

        if (ev.key === 'f') {
            console.log('crossfading from run to walk');
            dog.crossFadeAnimation('Dog Armature|running', 'Dog Armature|walk', 5);
        }

        if(ev.key === 's') {
            console.log('walking the dog')
            dog.playAnimation('Dog Armature|walk')
        }

        if(ev.key === 'd') {
            console.log('running the dog')
            dog.playAnimation('Dog Armature|running')
        }
    })

    scene.addObject(dog);
}
