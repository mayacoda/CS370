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

    async loadModel(path: string) {
        this.mesh = await ModelLoader.loadModel(path)
    }

    rotate(vec3: Vec3) {
        if (!this.mesh) return
        this.mesh.rotateX(vec3.x)
        this.mesh.rotateY(vec3.y)
        this.mesh.rotateZ(vec3.z)
    }
}
