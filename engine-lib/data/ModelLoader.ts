import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
import {GLTFLoader, GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {AcceptedModelExtensions, getExtension, isAcceptedModelExtension} from "../utilities";
import {Group} from 'three';


export class ModelLoader {
    static get instance(): ModelLoader {
        if (!this._instance) {
            this._instance = new ModelLoader()
        }

        return this._instance;
    }

    private static _instance: ModelLoader;

    cachedModels = new Map<string, any>()


    static loadModel(path: string): Promise<Group> {
        const ext = getExtension(path)
        if (ext === null || !isAcceptedModelExtension(ext)) {
            throw new Error(`path to model ${path} does not have a supported extension`);
        }

        if (ModelLoader.instance.cachedModels.has(path)) {
            return ModelLoader.instance.cachedModels.get(path);
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
            }, (xhr) => {
                if (xhr.lengthComputable) {
                    const percentComplete = xhr.loaded / xhr.total * 100;
                    console.log('model ' + Math.round(percentComplete) + '% downloaded');
                }
            }, reject)
        })

    }
}
