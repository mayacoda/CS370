import * as THREE from 'three'

export class TextureLoader {
    static loadCubeTexture(texturePaths: string[]) {
        const loader = new THREE.CubeTextureLoader();
        return loader.load(texturePaths);
    }

    static loadTexture(texturePath: string) {
        const loader = new THREE.TextureLoader();
        return loader.load(texturePath);
    }
}
