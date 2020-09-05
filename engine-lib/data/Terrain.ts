import {GameObject} from "./GameObject";
import {TextureLoader} from "./TextureLoader";
import {ServiceLocator} from "./ServiceLocator";
import {PhysicsEngine} from "./PhysicsEngine";
import Ammo from "ammojs-typed";
import {
    Material,
    Mesh,
    Vector3,
    Raycaster,
    MeshToonMaterial,
    RepeatWrapping,
    PlaneBufferGeometry
} from "three";


export interface TerrainSettings {
    widthExtents?: number
    depthExtents?: number,
    maxHeight?: number,
    repeat?: number,
    color?: string,
    hasPhysics?: boolean
}

export class Terrain extends GameObject {
    private normalizedHeightData?: Float32Array;
    private maxHeight: number = 3;
    private width?: number;
    private depth?: number
    private depthExtents?: number;
    private widthExtents?: number;
    private hasPhysics = false;

    tag = 'terrain';

    async loadTerrain(heightMap: string,
                      texture: string,
                      {widthExtents = 100, depthExtents = 100, maxHeight = 3, repeat = 1, color = '#888', hasPhysics = false}: TerrainSettings) {
        this.maxHeight = maxHeight
        this.depthExtents = depthExtents;
        this.widthExtents = widthExtents;
        this.hasPhysics = hasPhysics;

        const image = await TextureLoader.loadImageData(heightMap)

        this.width = image.width;
        this.depth = image.height;

        const plane = new PlaneBufferGeometry(widthExtents, depthExtents, image.width - 1, image.height - 1);
        plane.rotateX(-Math.PI / 2);

        this.normalizedHeightData = await readHeightData(image);

        const vertices = plane.attributes.position.array

        for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            // j + 1 because it is the y component that we modify

            // @ts-ignore
            vertices[j + 1] = this.normalizedHeightData[i] * maxHeight;
        }

        plane.computeVertexNormals();

        const map = await TextureLoader.loadTexture(texture)
        map.wrapS = RepeatWrapping;
        map.wrapT = RepeatWrapping;
        map.repeat.set(repeat, repeat)

        const groundMaterial = new MeshToonMaterial({map, color})
        this.object3D = new Mesh(plane, groundMaterial);
        this.object3D.receiveShadow = true;
        this.object3D.name = 'Terrain';
    }

    start() {
        super.start();
        if (this.hasPhysics) {
            const physics = ServiceLocator.getService<PhysicsEngine>('physics');
            physics.addTerrain(this);
        }
    }

    destroy() {
        super.destroy();
        if (this.object3D instanceof Mesh) {
            this.object3D.geometry.dispose();
            if (this.object3D.material instanceof Material) {
                this.object3D.material.dispose();
            }
        }
    }

    getHeightAtPoint(x: number, z: number) {
        const raycaster = new Raycaster(new Vector3(x, this.maxHeight + 0.1, z), new Vector3(0, -1, 0));
        const intersects = raycaster.intersectObject(this.object3D);

        let intersection = intersects[0];
        return intersection ? intersection.point.y : null;
    }

    getNormalAtPoint(x: number, z: number) {
        const raycaster = new Raycaster(new Vector3(x, this.maxHeight + 0.1, z), new Vector3(0, -1, 0));
        const intersects = raycaster.intersectObject(this.object3D);

        const intersection = intersects[0];
        if (intersection && intersection.face) {
            return intersection.face.normal;
        }
        return null;
    }

    get heightData() {
        return this.normalizedHeightData;
    }

    get dimensions() {
        return {
            width: this.width,
            depth: this.depth,
            widthExtents: this.widthExtents,
            depthExtents: this.depthExtents,
            maxHeight: this.maxHeight
        };
    }

    setRigidBody(groundBody: Ammo.btRigidBody) {
        this.rb = groundBody;
    }
}

async function readHeightData(image: HTMLImageElement): Promise<Float32Array> {
    const width = image.width;
    const height = image.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (context === null) throw new Error('could not initialize context')

    const size = width * height
    const data = new Float32Array(size);

    context.drawImage(image, 0, 0);

    for (let i = 0; i < size; i++) {
        data[i] = 0
    }

    const imageData = context.getImageData(0, 0, width, height);
    const pix = imageData.data;

    let j = 0;
    for (let i = 0; i < pix.length; i += 4) {
        data[j++] = (pix[i] + pix[i + 1] + pix[i + 2]) / (3 * 255);
    }

    return data;
}
