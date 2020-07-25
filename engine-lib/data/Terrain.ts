import {GameObject} from "./GameObject";
import {TextureLoader} from "./TextureLoader";
import * as THREE from "three";

export interface TerrainSettings {
    width?: number
    height?: number,
    maxHeight?: number,
    repeat?: number,
    color?: string
}

export class Terrain extends GameObject {
    private data?: Float32Array;
    private maxHeight: number = 3;

    async loadTerrain(heightMap: string, texture: string, {width = 100, height = 100, maxHeight = 3, repeat = 1, color = '#888'}: TerrainSettings) {
        this.maxHeight = maxHeight
        const image = await TextureLoader.loadImageData(heightMap)

        const plane = new THREE.PlaneBufferGeometry(width, height, image.width - 1, image.height - 1);
        plane.rotateX(-Math.PI / 2);

        this.data = await readHeightData(image);

        const vertices = plane.attributes.position.array

        for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            // j + 1 because it is the y component that we modify

            // @ts-ignore
            vertices[j + 1] = this.data[i] * maxHeight;
        }

        plane.computeVertexNormals();

        const map = await TextureLoader.loadTexture(texture)
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(repeat, repeat)

        const groundMaterial = new THREE.MeshToonMaterial({map, shininess: 0, color})
        this.object3D = new THREE.Mesh(plane, groundMaterial);
        this.object3D.receiveShadow = true;
        this.object3D.name = 'Terrain';
    }

    getHeightAtPoint(x: number, z: number) {
        const raycaster = new THREE.Raycaster(new THREE.Vector3(x, this.maxHeight + 0.1, z), new THREE.Vector3(0, -1, 0));
        const intersects = raycaster.intersectObject(this.object3D);

        let intersection = intersects[0];
        return intersection ? intersection.point.y : null;
    }

    getNormalAtPoint(x: number, z: number) {
        const raycaster = new THREE.Raycaster(new THREE.Vector3(x, this.maxHeight + 0.1, z), new THREE.Vector3(0, -1, 0));
        const intersects = raycaster.intersectObject(this.object3D);

        const intersection = intersects[0];
        if (intersection && intersection.face) {
            return intersection.face.normal;
        }
        return null;
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
