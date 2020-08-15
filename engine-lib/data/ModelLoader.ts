import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader'
import {GLTFLoader, GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
import {getExtension} from "../utilities";
import {Cache, Group, AnimationClip} from 'three';

Cache.enabled = true

function onProgress(xhr: ProgressEvent) {
    if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log('model ' + Math.round(percentComplete) + '% downloaded');
    }
}

export class ModelLoader {
    static async loadObj(modelPath: string, materialPath: string): Promise<Group> {
        const modelExt = getExtension(modelPath)
        const materialExt = getExtension(materialPath)
        if (modelExt !== '.obj' || materialExt !== '.mtl') {
            throw new Error(`to load OBJ, model must have '.obj' extension and material '.mtl' extension`);
        }

        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        const material = await mtlLoader.loadAsync(materialPath, onProgress) as MTLLoader.MaterialCreator;
        material.preload();
        objLoader.setMaterials(material)
        return await objLoader.loadAsync(modelPath, onProgress);
    }

    static async loadGltf(modelPath: string): Promise<GLTF> {
        const gltfLoader = new GLTFLoader()

        return await gltfLoader.loadAsync(modelPath, onProgress)
    }

    static async loadFbx(modelPath: string): Promise<Group & { animations: AnimationClip[] }> {
        const fbxLoader = new FBXLoader();

        return await fbxLoader.loadAsync(modelPath, onProgress);
    }
}
