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

    static loadImageData(imagePath: string): Promise<HTMLImageElement> {
        const image = new Image();
        return new Promise((resolve, reject) => {
            image.onload = () => {
                resolve(image)
                return
            }

            image.onerror = (error) => {
                reject(error)
                return
            }

            image.src = imagePath
        })
    }
}
