import * as THREE from "three"
import {GameCycleEntity} from "./interfaces/GameCycleEntity";
import {Vec3} from "../utilities";
import {ModelLoader} from "./ModelLoader";

export class GameObject extends GameCycleEntity {
    mesh?: THREE.Object3D;

    constructor() {
        super()
    }

    createMesh(geometry?: THREE.Geometry, material?: THREE.Material) {
        this.mesh = new THREE.Mesh(geometry, material)
    }

    async loadObj(modelPath: string, materialPath: string) {
        this.mesh = await ModelLoader.loadObj(modelPath, materialPath);
    }

    async loadModel(path: string) {
        this.mesh = await ModelLoader.loadModel(path)
    }

    rotate(vec3: Vec3) {
        if (!this.mesh) return
        this.mesh.rotateX(vec3.x)
        this.mesh.rotateY(vec3.y)
        this.mesh.rotateZ(vec3.z)
    }

    scale(vec3: Vec3) {
        if (!this.mesh) return
        this.mesh.scale.x = vec3.x;
        this.mesh.scale.y = vec3.y;
        this.mesh.scale.z = vec3.z;
    }

    translate(vec3: Vec3) {
        if (!this.mesh) return
        this.mesh.translateX(vec3.x)
        this.mesh.translateY(vec3.y)
        this.mesh.translateZ(vec3.z)
    }
}
