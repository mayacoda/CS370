import {GameObject} from "./GameObject";
import * as THREE from "three";
import {GameCycleEntity} from "./GameCycleEntity";
import {TextureLoader} from "./TextureLoader";
import {ServiceLocator} from "./ServiceLocator";
import {Terrain, TerrainSettings} from "./Terrain";

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
        this.scene.add(object.object3D);
    }

    removeObject(object: GameObject) {
        this.objects.delete(object);
        object.setScene(null)
        this.scene.remove(object.object3D);
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

    setBackgroundColor(color: string | number) {
        this.scene.background = new THREE.Color(color)
    }

    setFog(color: string | number, density?: number) {
        this.scene.fog = new THREE.FogExp2(color, density)
    }

    start() {
        super.start();

        if (this.terrain) {
            this.terrain.start();
        }

        for (const object of this.objects) {
            object.start();
        }
    }

    update(time?: number): void {
        super.update(time);
        if (this.skyboxMesh) {
            this.skyboxMesh.position.copy(ServiceLocator.getService<THREE.Camera>('camera').position)
        }

        for (const object of this.objects) {
            object.update(time);
        }
    }

    async loadTerrain(heightMap: string, texture: string, settings: TerrainSettings) {
        this.terrain = new Terrain();
        await this.terrain.loadTerrain(heightMap, texture, settings);
        this.scene.add(this.terrain.object3D)
    }

    convertWorldPointToTerrainPoint(x: number, y: number, z: number): THREE.Vector3
    convertWorldPointToTerrainPoint(x: number, z: number): THREE.Vector3
    convertWorldPointToTerrainPoint(...args: number[]) {
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

    convertScreenPointToTerrainPoint(x: number = 0, y: number = 0) {
        if (!this.terrain) return null;

        const mouse = new THREE.Vector2();
        const size = new THREE.Vector2();
        ServiceLocator.getService<THREE.WebGLRenderer>('renderer').getSize(size);

        mouse.x = (x / size.x) * 2 - 1;
        mouse.y = (y / size.y) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, ServiceLocator.getService<THREE.Camera>('camera'));
        const intersects = raycaster.intersectObject(this.terrain.object3D);

        return (intersects && intersects[0]) ? intersects[0].point : null;
    }

    getTerrainNormalAtPoint(x: number, z: number): THREE.Vector3 | null {
        return this.terrain ? this.terrain.getNormalAtPoint(x, z) : null
    }
}
