import {GameObject} from "./GameObject";
import * as THREE from "three";
import {GameCycleEntity} from "./interfaces/GameCycleEntity";

export class GameScene extends GameCycleEntity {
    private objects: Set<GameObject>
    private scene: THREE.Scene

    constructor() {
        super();
        this.objects = new Set<GameObject>();
        this.scene = new THREE.Scene();
    }

    getScene() {
        return this.scene;
    }

    addObject(object: GameObject) {
        this.objects.add(object);
    }

    removeObject(object: GameObject) {
        this.objects.delete(object);
    }

    start() {
        for (const object of this.objects) {
            if (object.mesh) {
                this.scene.add(object.mesh)
            }
        }

        this.scene.add( new THREE.HemisphereLight( 0x443333, 0x222233, 1 ) );
    }

    update(): void {
        for (const object of this.objects) {
            object.update()
        }
    }
}
