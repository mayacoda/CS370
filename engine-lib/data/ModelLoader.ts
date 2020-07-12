import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader'
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {AcceptedModelExtensions, getExtension, isAcceptedModelExtension} from "../utilities";
import {Group, Cache} from 'three';

Cache.enabled = true

function onProgress(xhr: ProgressEvent) {
    if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log('model ' + Math.round(percentComplete) + '% downloaded');
    }
}

type SupportedLoader = OBJLoader | MTLLoader | FBXLoader;

export class ModelLoader {

    static loadModel(path: string): Promise<Group> {
        const ext = getExtension(path)
        if (ext === null || !isAcceptedModelExtension(ext)) {
            throw new Error(`path to model ${path} does not have a supported extension`);
        }

        let loader: FBXLoader | OBJLoader | GLTFLoader | null = null;

        switch (ext) {
            case AcceptedModelExtensions.Obj:
                loader = new OBJLoader();
                break;
            case AcceptedModelExtensions.Gltf:
                loader = new GLTFLoader();
                break;
            case AcceptedModelExtensions.Fbx:
                loader = new FBXLoader();
                break;

        }

        return new Promise((resolve, reject) => {
            if (loader === null) throw new Error('could not create correct loader for model');

            loader.load(path, (obj: Group | GLTF) => {
                if ('scenes' in obj) {
                    reject('GLTF is not supported')
                    return
                }
                resolve(obj)
            }, onProgress, reject)
        })
    }

    static async loadObj(modelPath: string, materialPath: string) {
        const modelExt = getExtension(modelPath)
        const materialExt = getExtension(materialPath)
        if (modelExt !== '.obj' || materialExt !== '.mtl') {
            throw new Error(`to load OBJ, model must have '.obj' extension and material '.mtl' extension`);
        }

        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        const material = await this.loadResource(mtlLoader, materialPath) as MTLLoader.MaterialCreator;
        material.preload();
        return await this.loadResource(objLoader.setMaterials(material), modelPath) as Group;
    }

    private static async loadResource(loader: SupportedLoader , resource: string) {
        return new Promise((resolve, reject) => {
            loader.load(resource, (result: Group | MTLLoader.MaterialCreator) => {
                resolve(result)
            }, onProgress, reject)
        })
    }
}
