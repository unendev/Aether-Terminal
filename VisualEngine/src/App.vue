<template>
  <div id="aether-cinema" @click="handleScreenClick">
    <!-- Pure 3D Kinetic Symbol Universe + Cool-Retro-Term CRT Shader Pass -->
    <CrtViewport
      ref="viewportRef"
      :audio-engine="audioEngine"
      :faction="currentFaction"
      :curvature="4.5"
      :bloom="1.55"
      :scanline-intensity="0.75"
      @update:faction="onFactionUpdate"
    />

    <!-- Ultra-Minimal Cinematic Letterbox Stamp (Zero Website Clutter) -->
    <div class="cinema-stamp" :class="{ 'fade-out': hasInteracted }">
      <div class="stamp-title">AETHER-TERMINAL // EP001: GENESIS PROTOCOL</div>
      <div class="stamp-hints">
        <span>[ CLICK / SPACE: PLAY MASTER TRACK ]</span>
        <span>[ R: 60FPS VIDEO CAPTURE ]</span>
        <span>[ 1-3: FACTION OVERRIDE ]</span>
      </div>
    </div>

    <!-- Active Audio Status Pill (Subtle top right indicator) -->
    <div class="audio-status-pill" :class="{ active: isAudioRunning }">
      <span class="dot"></span>
      <span>{{ audioStatusText }}</span>
    </div>

    <!-- Recording Indicator Pill (Top Left) -->
    <div v-if="isRecording" class="recording-pill">
      <span class="rec-dot"></span>
      <span>RECORDING MASTER // 60FPS</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import CrtViewport from './components/CrtViewport.vue';
import { AudioReactiveEngine } from './engine/audioEngine.js';
import { CanvasVideoRecorder } from './engine/recorder.js';

const viewportRef = ref(null);
const audioEngine = new AudioReactiveEngine();
if (typeof window !== 'undefined') window.__audioEngine = audioEngine;
const currentFaction = ref('archive');
const isAudioRunning = ref(false);
const hasInteracted = ref(false);
const audioStatusText = ref('EP001: GENESIS PROTOCOL [CLICK TO ENGAGE]');
const isRecording = ref(false);

let videoRecorder = null;
let progressTimer = null;

const onFactionUpdate = (newFaction) => {
  currentFaction.value = newFaction;
};

const handleScreenClick = (e) => {
  // Prevent click on interactive elements if any
  hasInteracted.value = true;
  toggleAudio();
};

const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const toggleAudio = async () => {
  if (isAudioRunning.value) {
    if (audioEngine.audioElement) {
      audioEngine.audioElement.pause();
    }
    isAudioRunning.value = false;
    audioStatusText.value = 'EP001: PAUSED [CLICK TO RESUME]';
  } else {
    try {
      await audioEngine.loadAudioUrl('/audio/ep001.mp3');
      isAudioRunning.value = true;
    } catch (err) {
      console.warn('Audio play failed, falling back to synth:', err);
      audioEngine.startProceduralSynth();
      isAudioRunning.value = true;
    }
  }
};

const toggleRecording = async () => {
  if (!viewportRef.value || !viewportRef.value.$el) return;
  const canvas = viewportRef.value.$el.querySelector('canvas');
  if (!canvas) return;

  if (isRecording.value) {
    if (videoRecorder) {
      const blob = await videoRecorder.stop();
      if (blob) {
        videoRecorder.download(blob, 'Aether_EP001_Genesis_Protocol_Master.webm');
      }
    }
    isRecording.value = false;
  } else {
    videoRecorder = new CanvasVideoRecorder(canvas, audioEngine.ctx, audioEngine.sourceNode);
    videoRecorder.start(60, 16000000); // 60 FPS, 16 Mbps broadcast quality
    isRecording.value = true;
  }
};

const handleKeyDown = (e) => {
  hasInteracted.value = true;
  if (e.key === '1') currentFaction.value = 'archive';
  if (e.key === '2') currentFaction.value = 'eraser';
  if (e.key === '3') currentFaction.value = 'outlier';
  if (e.key === ' ') {
    toggleAudio();
    e.preventDefault();
  }
  if (e.key === 'r' || e.key === 'R') {
    toggleRecording();
    e.preventDefault();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);

  progressTimer = setInterval(() => {
    if (audioEngine && audioEngine.audioElement && !audioEngine.audioElement.paused) {
      hasInteracted.value = true;
      const cur = audioEngine.audioElement.currentTime || 0;
      const dur = audioEngine.audioElement.duration || 248.4;
      audioStatusText.value = `EP001: GENESIS PROTOCOL // [${formatTime(cur)} / ${formatTime(dur)}] // 120 BPM`;
    }
  }, 250);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (progressTimer) clearInterval(progressTimer);
  if (audioEngine.audioElement) audioEngine.audioElement.pause();
  audioEngine.stopSynth();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html, #app, #aether-cinema {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #040302;
  cursor: crosshair;
  user-select: none;
}

/* Elegant minimal filmic stamp */
.cinema-stamp {
  position: absolute;
  bottom: 24px;
  right: 28px;
  font-family: 'Courier New', monospace;
  color: rgba(255, 184, 51, 0.7);
  text-shadow: 0 0 6px rgba(255, 184, 51, 0.5);
  font-size: 0.75rem;
  text-align: right;
  pointer-events: none;
  transition: opacity 1.8s ease;
  z-index: 10;
}

.cinema-stamp.fade-out {
  opacity: 0;
  pointer-events: none;
}

.cinema-stamp:hover {
  opacity: 0.9 !important;
}

.stamp-title {
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.stamp-hints {
  display: flex;
  gap: 12px;
  opacity: 0.85;
}

/* Subtle top right resonance pill */
.audio-status-pill {
  position: absolute;
  top: 20px;
  right: 28px;
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  color: rgba(255, 184, 51, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  z-index: 10;
  transition: all 0.3s;
}

.audio-status-pill .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 184, 51, 0.4);
}

.audio-status-pill.active {
  color: #ffb833;
  text-shadow: 0 0 8px #ffb833;
}

.audio-status-pill.active .dot {
  background: #ff3344;
  box-shadow: 0 0 8px #ff3344;
  animation: blink 0.8s infinite;
}

/* Recording Pill */
.recording-pill {
  position: absolute;
  top: 20px;
  left: 28px;
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  color: #ff3344;
  text-shadow: 0 0 8px #ff3344;
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  z-index: 10;
}

.recording-pill .rec-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff3344;
  box-shadow: 0 0 10px #ff3344;
  animation: blink 0.6s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1.0; }
}
</style>
