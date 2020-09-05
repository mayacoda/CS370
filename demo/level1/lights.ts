import {GameScene, Light, LightType} from "../../engine-lib/data";

export function loadLights(scene: GameScene) {
    const hemisphereLight = new Light(LightType.HemisphereLight);
    hemisphereLight.setColor('#209467', '#be804a')
    hemisphereLight.setIntensity(0.5)
    scene.addObject(hemisphereLight)

    const directionalLight = new Light(LightType.DirectionalLight);
    directionalLight.setColor('#faa78b')
    directionalLight.setIntensity(0.5)
    directionalLight.translate(0, 20, 0)
    directionalLight.object3D.castShadow = true;

    scene.addObject(directionalLight)
}
