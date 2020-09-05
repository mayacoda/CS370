import {GameObject} from "./GameObject";
import {
    HemisphereLightHelper,
    Light as THREELight,
    SpotLightHelper,
    PointLightHelper,
    DirectionalLightHelper,
    CameraHelper,
    AmbientLight,
    HemisphereLight,
    DirectionalLight,
    OrthographicCamera,
    PointLight,
    SpotLight,
    Color
} from "three";

export enum LightType {
    AmbientLight = 'AmbientLight',
    HemisphereLight = 'HemisphereLight',
    DirectionalLight = 'DirectionalLight',
    PointLight = 'PointLight',
    SpotLight = 'SpotLight'
}

export class Light extends GameObject {
    object3D: THREELight
    helper?: SpotLightHelper | PointLightHelper | DirectionalLightHelper | HemisphereLightHelper;
    cameraHelper?: CameraHelper

    constructor(private type: LightType) {
        super();
        switch (type) {
            case LightType.AmbientLight:
                this.object3D = new AmbientLight();
                break;
            case LightType.HemisphereLight:
                this.object3D = new HemisphereLight();
                break;
            case LightType.DirectionalLight:
                this.object3D = new DirectionalLight();
                this.object3D.shadow.mapSize.width = 256;
                this.object3D.shadow.mapSize.height = 256;
                this.object3D.shadow.bias = 0.1;
                this.object3D.shadow.radius = 5;
                const d = 10
                let camera = this.object3D.shadow.camera as OrthographicCamera;
                camera.left = -d;
                camera.right = d;
                camera.bottom = -d;
                camera.top = d;
                // this.cameraHelper = new CameraHelper(camera)
                break;
            case LightType.PointLight:
                this.object3D = new PointLight();
                this.object3D.castShadow = false;
                this.object3D.shadow.mapSize.width = 256;
                this.object3D.shadow.mapSize.height = 256;
                this.object3D.shadow.bias = 0.1;
                this.object3D.shadow.radius = 5;
                break;
            case LightType.SpotLight:
                this.object3D = new SpotLight();
                break;
        }
    }

    setColor(...color: Array<string | number>) {
        if (color.length === 2 && this.object3D instanceof HemisphereLight) {
            this.object3D.groundColor = new Color(color[0])
            this.object3D.skyColor = new Color(color[1])
        } else {
            this.object3D.color = new Color(color[0])
        }
    }

    setIntensity(intensity: number) {
        this.object3D.intensity = intensity
    }

    start() {
        super.start();
        const scene = this.getScene();

        if (scene) {
            if (this.helper) {
                scene.getScene().add(this.helper)
            }

            if (this.cameraHelper) {
                scene.getScene().add(this.cameraHelper)
            }
        }
    }

    createHelper() {
        switch (this.object3D.type) {
            case LightType.HemisphereLight:
                this.helper = new HemisphereLightHelper(this.object3D as HemisphereLight, .5);
                break;
            case LightType.DirectionalLight:
                this.helper = new DirectionalLightHelper(this.object3D as DirectionalLight, .5);
                break;
            case LightType.PointLight:
                this.helper = new PointLightHelper(this.object3D as PointLight, .5);
                // this.helper.matrixAutoUpdate = true;
                break;
            case LightType.SpotLight:
                this.helper = new SpotLightHelper(this.object3D as SpotLight, .5);
                break;
        }
    }
}
