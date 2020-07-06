import {GameObject} from "./GameObject";
import * as THREE from 'three';

export enum LightType {
    AmbientLight = 'AmbientLight',
    HemisphericLight = 'HemisphericLight',
    DirectionalLight = 'DirectionalLight',
    PointLight = 'PointLight',
    SpotLight = 'SpotLight'
}

export class Light extends GameObject {
    object3D: THREE.Light
    helper?: THREE.SpotLightHelper | THREE.PointLightHelper | THREE.DirectionalLightHelper | THREE.HemisphereLightHelper;
    cameraHelper?: THREE.CameraHelper

    constructor(private type: LightType) {
        super();
        switch (type) {
            case LightType.AmbientLight:
                this.object3D = new THREE.AmbientLight();
                break;
            case LightType.HemisphericLight:
                this.object3D = new THREE.HemisphereLight();
                break;
            case LightType.DirectionalLight:
                this.object3D = new THREE.DirectionalLight();
                this.object3D.shadow.mapSize.width = 2048;
                this.object3D.shadow.mapSize.height = 2048;
                this.object3D.shadow.bias = 0.1;
                this.object3D.shadow.radius = 5;
                const d = 10
                let camera = this.object3D.shadow.camera as THREE.OrthographicCamera;
                camera.left = -d;
                camera.right = d;
                camera.bottom = -d;
                camera.top = d;
                // this.cameraHelper = new THREE.CameraHelper(camera)
                break;
            case LightType.PointLight:
                this.object3D = new THREE.PointLight();
                this.object3D.castShadow = false;
                break;
            case LightType.SpotLight:
                this.object3D = new THREE.SpotLight();
                break;
        }
    }

    setColor(color: string | number) {
        this.object3D.color = new THREE.Color(color)
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
            case LightType.HemisphericLight:
                this.helper = new THREE.HemisphereLightHelper(this.object3D as THREE.HemisphereLight, .5);
                break;
            case LightType.DirectionalLight:
                this.helper = new THREE.DirectionalLightHelper(this.object3D as THREE.DirectionalLight, .5);
                break;
            case LightType.PointLight:
                this.helper = new THREE.PointLightHelper(this.object3D as THREE.PointLight, .5);
                // this.helper.matrixAutoUpdate = true;
                break;
            case LightType.SpotLight:
                this.helper = new THREE.SpotLightHelper(this.object3D as THREE.SpotLight, .5);
                break;
        }
    }
}
