import {GameObject} from "./GameObject";
import {GameCycleEntity} from "./GameCycleEntity";
import {TextureLoader} from "./TextureLoader";
import {ServiceLocator} from "./ServiceLocator";
import {Terrain, TerrainSettings} from "./Terrain";
import {GameUI} from "./GameUI";
import {
    Vector3,
    Vector2,
    WebGLRenderer,
    Raycaster,
    Camera,
    Scene,
    Mesh,
    LinearFilter,
    ShaderLib,
    ShaderMaterial,
    BackSide,
    BoxBufferGeometry,
    Color,
    FogExp2
} from "three";

export class GameScene extends GameCycleEntity {
    private objects: Set<GameObject>
    private scene: Scene
    readonly name: string;

    private gui: GameUI;

    private skyboxMesh?: Mesh;
    private terrain?: Terrain;

    constructor(sceneName: string) {
        super();
        this.name = sceneName
        this.objects = new Set<GameObject>();
        this.scene = new Scene();
        this.gui = new GameUI(sceneName);
    }

    getGUI() {
        return this.gui;
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
            skybox.magFilter = LinearFilter;
            skybox.minFilter = LinearFilter;

            const shader = ShaderLib.equirect;
            const material = new ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: shader.uniforms,
                depthWrite: false,
                side: BackSide,
            });
            material.uniforms.tEquirect.value = skybox;
            const plane = new BoxBufferGeometry(1, 1, 1);
            this.skyboxMesh = new Mesh(plane, material);
            this.skyboxMesh.name = 'SkyBox';
            this.scene.add(this.skyboxMesh);
        }
    }

    setBackgroundColor(color: string | number) {
        this.scene.background = new Color(color)
    }

    setFog(color: string | number, density?: number) {
        this.scene.fog = new FogExp2(color, density)
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
            this.skyboxMesh.position.copy(ServiceLocator.getService<Camera>('camera').position)
        }

        for (const object of this.objects) {
            object.update(time);
        }
    }

    destroy() {
        super.destroy();

        for (const object of this.objects) {
            object.destroy();
        }

        if (this.terrain) {
            this.terrain.destroy();
        }

        this.gui.destroy();
    }

    async loadTerrain(heightMap: string, texture: string, settings: TerrainSettings) {
        this.terrain = new Terrain();
        await this.terrain.loadTerrain(heightMap, texture, settings);
        this.scene.add(this.terrain.object3D)
    }

    convertWorldPointToTerrainPoint(x: number, y: number, z: number): Vector3
    convertWorldPointToTerrainPoint(x: number, z: number): Vector3
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
        return new Vector3(x, y + yDiff, z);
    }

    convertScreenPointToTerrainPoint(x: number = 0, y: number = 0) {
        if (!this.terrain) return null;

        const mouse = new Vector2();
        const size = new Vector2();
        ServiceLocator.getService<WebGLRenderer>('renderer').getSize(size);

        mouse.x = (x / size.x) * 2 - 1;
        mouse.y = (y / size.y) * 2 + 1;

        const raycaster = new Raycaster();
        raycaster.setFromCamera(mouse, ServiceLocator.getService<Camera>('camera'));
        const intersects = raycaster.intersectObject(this.terrain.object3D);

        return (intersects && intersects[0]) ? intersects[0].point : null;
    }

    getTerrainNormalAtPoint(x: number, z: number): Vector3 | null {
        return this.terrain ? this.terrain.getNormalAtPoint(x, z) : null
    }
}
