import * as THREE from 'three'

export class TextureLoader {
    static loadCubeTexture(texturePaths: string[]): Promise<THREE.Texture>  {
        const loader = new THREE.CubeTextureLoader();
        return new Promise((resolve, reject) => {
            loader.load(texturePaths, resolve, () => {}, reject);
        })
    }

    static loadTexture(texturePath: string): Promise<THREE.Texture> {
        const loader = new THREE.TextureLoader();
        return new Promise((resolve, reject) => {
            loader.load(texturePath, resolve, () => {}, reject)
        })
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
