import {GameScene, Light, LightType} from "../../engine-lib/data";

export function loadLights(scene: GameScene) {
    const hemisphereLight = new Light(LightType.HemisphereLight);
    hemisphereLight.setColor('#2c525d', '#57dea7')
    hemisphereLight.setIntensity(0.5)
    scene.addObject(hemisphereLight)

    const directionalLight = new Light(LightType.DirectionalLight);
    directionalLight.setColor('#fceaab')
    directionalLight.setIntensity(0.5)
    directionalLight.translate(0, 20, 0)
    directionalLight.object3D.castShadow = true;

    scene.addObject(directionalLight)
}
