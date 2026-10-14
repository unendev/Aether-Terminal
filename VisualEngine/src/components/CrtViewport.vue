<template>
  <div class="crt-container" ref="containerRef">
    <canvas ref="canvasRef" class="crt-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { SymbolScene } from '../engine/symbolScene.js';
import { CrtVertexShader, CrtFragmentShader } from '../engine/crtShader.js';

const props = defineProps({
  audioEngine: {
    type: Object,
    required: true
  },
  faction: {
    type: String,
    default: 'archive'
  },
  scanlineIntensity: {
    type: Number,
    default: 0.75
  },
  curvature: {
    type: Number,
    default: 4.8
  },
  bloom: {
    type: Number,
    default: 1.5
  }
});

const containerRef = ref(null);
const canvasRef = ref(null);

let renderer = null;
let symbolScene = null;
let renderTarget = null;
let postScene = null;
let postCamera = null;
let crtMaterial = null;
let animationFrameId = null;

const clock = new THREE.Clock();

const factionColors = {
  archive: new THREE.Vector3(1.0, 0.72, 0.14), // Amber CRT Phosphor
  eraser: new THREE.Vector3(1.0, 0.2, 0.28),   // Crimson Glitch
  outlier: new THREE.Vector3(0.25, 0.85, 1.0)  // Cyan Echo
};

const initEngine = () => {
  const container = containerRef.value;
  const canvas = canvasRef.value;
  if (!container || !canvas) return;

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // 1. Base Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. Offscreen RenderTarget
  renderTarget = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat
  });

  // 3. 3D Symbol Kinetic Scene
  symbolScene = new SymbolScene(width, height);
  symbolScene.setFaction(props.faction);

  // 4. CRT Post-Processing Scene
  postScene = new THREE.Scene();
  postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const initialColor = factionColors[props.faction] || factionColors.archive;

  crtMaterial = new THREE.ShaderMaterial({
    vertexShader: CrtVertexShader,
    fragmentShader: CrtFragmentShader,
    uniforms: {
      tDiffuse: { value: renderTarget.texture },
      uTime: { value: 0 },
      uCurvature: { value: props.curvature },
      uScanlineIntensity: { value: props.scanlineIntensity },
      uScanlineCount: { value: height * 0.45 },
      uBloomIntensity: { value: props.bloom },
      uChromaOffset: { value: 0.0022 },
      uFlicker: { value: 0.85 },
      uPhosphorColor: { value: initialColor },
      uAudioBeat: { value: 0 }
    }
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), crtMaterial);
  postScene.add(quad);

  // Handle Resize
  window.addEventListener('resize', handleResize);

  // Start Animation Loop
  animate();
};

const emit = defineEmits(['update:faction']);

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  const audioFeatures = props.audioEngine ? props.audioEngine.update() : {
    bass: 0, mid: 0, high: 0, energy: 0, beat: 0, waveform: []
  };

  const audioCurrentTime = props.audioEngine?.audioElement && !props.audioEngine.audioElement.paused
    ? props.audioEngine.audioElement.currentTime
    : (props.audioEngine?.isSynthRunning ? elapsedTime : 0);

  // 1. Update 3D Symbol Universe
  symbolScene.update(audioFeatures, elapsedTime, audioCurrentTime, (newFaction) => {
    emit('update:faction', newFaction);
    if (crtMaterial && factionColors[newFaction]) {
      crtMaterial.uniforms.uPhosphorColor.value = factionColors[newFaction];
    }
  });

  // 2. Update CRT Shader Uniforms
  if (crtMaterial) {
    crtMaterial.uniforms.uTime.value = elapsedTime;
    crtMaterial.uniforms.uAudioBeat.value = audioFeatures.beat;
    crtMaterial.uniforms.uCurvature.value = props.curvature;
    crtMaterial.uniforms.uScanlineIntensity.value = props.scanlineIntensity;
    crtMaterial.uniforms.uBloomIntensity.value = props.bloom;

    // Dynamic glitch chroma spike on eraser faction or audio transients
    const baseChroma = symbolScene.currentFaction === 'eraser' ? 0.007 : 0.0022;
    crtMaterial.uniforms.uChromaOffset.value = baseChroma + audioFeatures.beat * 0.004;
  }

  // 3. Render 3D Scene into RenderTarget
  renderer.setRenderTarget(renderTarget);
  renderer.render(symbolScene.scene, symbolScene.camera);

  // 4. Render CRT Post-Processing Quad to Screen
  renderer.setRenderTarget(null);
  renderer.render(postScene, postCamera);
};

const handleResize = () => {
  if (!containerRef.value || !renderer) return;
  const w = containerRef.value.clientWidth || window.innerWidth;
  const h = containerRef.value.clientHeight || window.innerHeight;

  renderer.setSize(w, h);
  renderTarget.setSize(w, h);
  symbolScene.resize(w, h);

  if (crtMaterial) {
    crtMaterial.uniforms.uScanlineCount.value = h * 0.45;
  }
};

watch(() => props.faction, (newFaction) => {
  if (symbolScene) {
    symbolScene.setFaction(newFaction);
  }
  if (crtMaterial && factionColors[newFaction]) {
    crtMaterial.uniforms.uPhosphorColor.value = factionColors[newFaction];
  }
});

onMounted(() => {
  initEngine();
});

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', handleResize);
  if (renderer) renderer.dispose();
  if (renderTarget) renderTarget.dispose();
});
</script>

<style scoped>
.crt-container {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  background-color: #060503;
}

.crt-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
