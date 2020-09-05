import {GameObject, Light, LightType} from "../../engine-lib/data";

export async function createLampPost() {
    const lampPost = new GameObject();
    await lampPost.loadObj('models/lamp-post.obj', 'models/lamp-post.mtl');

    const light = new Light(LightType.PointLight);
    // light.object3D.castShadow = true;
    light.setColor('#dd9151');
    light.setIntensity(.5);

    const lightContainer = new GameObject();
    lightContainer.addChild(light);

    light.translate(0, 3.75);
    lampPost.addChild(lightContainer);

    return lampPost

}
