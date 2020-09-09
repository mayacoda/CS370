import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {ServiceLocator} from "../ServiceLocator";
import {Scene, Camera, WebGLRenderer, Vector2, ShaderMaterial} from 'three';

// language=GLSL
const vertexShader = `
varying vec2 vUv;

void main() {

    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
`

// language=GLSL
const fragmentShader = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;

void main() { 

    gl_FragColor = (texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv));

 }
`

export function UnrealBloom({bloomThreshold = 0, bloomStrength = 5, bloomRadius = 0, exposure = 1}) {
    const scene = ServiceLocator.getService<Scene>('scene');
    const camera = ServiceLocator.getService<Camera>('camera');
    const renderer = ServiceLocator.getService<WebGLRenderer>('renderer');

    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = bloomThreshold;
    bloomPass.strength = bloomStrength;
    bloomPass.radius = bloomRadius;

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    const finalPass = new ShaderPass(
        new ShaderMaterial({
            uniforms: {
                baseTexture: {value: null},
                bloomTexture: {value: bloomComposer.renderTarget2.texture}
            },
            vertexShader,
            fragmentShader,
            defines: {}
        }), "baseTexture"
    );
    finalPass.needsSwap = true;

    const finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(finalPass);

    return bloomComposer;
}
