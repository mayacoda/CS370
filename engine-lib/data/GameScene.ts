import {GameObject} from "./GameObject";
import * as THREE from "three";
import {GameCycleEntity} from "./interfaces/GameCycleEntity";
import {TextureLoader} from "./TextureLoader";
import {ServiceLocator} from "./ServiceLocator";
import {Terrain} from "./Terrain";

export class GameScene extends GameCycleEntity {
    private objects: Set<GameObject>
    private scene: THREE.Scene


    private skyboxMesh?: THREE.Mesh;
    private terrain?: Terrain;

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
        object.setScene(this);
    }

    removeObject(object: GameObject) {
        this.objects.delete(object);
        object.setScene(null)
    }

    /**
     * @param texture - pos-x, neg-x, pos-y, neg-y, pos-z, neg-z.
     */
    async loadSkybox(texture: string[] | string) {
        // cube texture map
        if (Array.isArray(texture)) {
            this.scene.background = await TextureLoader.loadCubeTexture(texture);
        } else {
            // equirectangular map
            const skybox = await TextureLoader.loadTexture(texture);
            skybox.magFilter = THREE.LinearFilter;
            skybox.minFilter = THREE.LinearFilter;

            const shader = THREE.ShaderLib.equirect;
            const material = new THREE.ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: shader.uniforms,
                depthWrite: false,
                side: THREE.BackSide,
            });
            material.uniforms.tEquirect.value = skybox;
            const plane = new THREE.BoxBufferGeometry(1, 1, 1);
            this.skyboxMesh = new THREE.Mesh(plane, material);
            this.skyboxMesh.name = 'SkyBox';
            this.scene.add(this.skyboxMesh);
        }
    }

    loadBackgroundColor(color: string | number) {
        this.scene.background = new THREE.Color(color)
    }

    start() {
        super.start();

        for (const object of this.objects) {
            if (object.object3D) {
                this.scene.add(object.object3D);
            }

            object.start();
        }
    }

    update(): void {
        super.update();
        if (this.skyboxMesh) {
            this.skyboxMesh.position.copy(ServiceLocator.getService<THREE.Camera>('camera').position)
        }

        for (const object of this.objects) {
            object.update();
        }
    }

    async loadTerrain(heightMap: string, texture: string) {
        this.terrain = new Terrain();
        await this.terrain.loadTerrain(heightMap, texture, {maxHeight: 10});
        this.scene.add(this.terrain.object3D)
    }

    convertToTerrainPoint(x: number, y: number, z:number): THREE.Vector3
    convertToTerrainPoint(x: number, z:number): THREE.Vector3
    convertToTerrainPoint(...args: number[]) {
        let x = 0, y, z = 0, yDiff = 0;
        if (args.length === 3) {
            x = args[0];
            yDiff = args[1];
            z = args[2];
        } else if (args.length === 2) {
            x = args[0];
            z = args[1];
        }

        y = this.terrain ? this.terrain.getHeightAtPoint(x, z) || 0 : 0;
        return new THREE.Vector3(x, y + yDiff, z);
    }
}
