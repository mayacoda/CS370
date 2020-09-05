import { Texture, CubeTextureLoader, TextureLoader as THREETextureLoader } from "three";

export class TextureLoader {
    static loadCubeTexture(texturePaths: string[]): Promise<Texture>  {
        const loader = new CubeTextureLoader();
        return new Promise((resolve, reject) => {
            loader.load(texturePaths, resolve, () => {}, reject);
        })
    }

    static loadTexture(texturePath: string): Promise<Texture> {
        const loader = new THREETextureLoader();
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
