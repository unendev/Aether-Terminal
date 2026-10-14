<template>
  <div class="terminal-overlay">
    <!-- Top HUD Bar: High-Bandwidth Telemetry -->
    <header class="hud-top">
      <div class="hud-brand">
        <span class="hud-glyph">◬</span>
        <span class="hud-title">AETHER-TERMINAL // v2147.08</span>
        <span class="hud-badge">ONLINE</span>
      </div>

      <div class="hud-telemetry">
        <div class="telemetry-item">
          <span class="label">BASS_ENERGY:</span>
          <div class="energy-bar"><div class="fill" :style="{ width: `${Math.round(audioFeatures.bass * 100)}%` }"></div></div>
          <span class="value">{{ (audioFeatures.bass).toFixed(2) }}</span>
        </div>
        <div class="telemetry-item">
          <span class="label">BEAT_PULSE:</span>
          <span class="pulse-indicator" :class="{ active: audioFeatures.beat > 0.4 }"></span>
        </div>
        <div class="telemetry-item">
          <span class="label">SECTOR:</span>
          <span class="value sector">0x7F_DEEP_OCEAN</span>
        </div>
      </div>
    </header>

    <!-- Left Floating Drawer: Faction Totem Switcher (Zero-Friction Click/Key) -->
    <aside class="hud-sidebar">
      <div class="sidebar-title">FACTION SELECTION [1-3]</div>

      <button
        class="faction-btn"
        :class="{ active: currentFaction === 'archive' }"
        @click="selectFaction('archive')"
      >
        <span class="key-hint">[1]</span>
        <span class="faction-symbol">&lt; &gt;</span>
        <span class="faction-name">THE ARCHIVE</span>
      </button>

      <button
        class="faction-btn eraser"
        :class="{ active: currentFaction === 'eraser' }"
        @click="selectFaction('eraser')"
      >
        <span class="key-hint">[2]</span>
        <span class="faction-symbol">###</span>
        <span class="faction-name">THE ERASER</span>
      </button>

      <button
        class="faction-btn outlier"
        :class="{ active: currentFaction === 'outlier' }"
        @click="selectFaction('outlier')"
      >
        <span class="key-hint">[3]</span>
        <span class="faction-symbol">(@)</span>
        <span class="faction-name">THE OUTLIER</span>
      </button>

      <!-- Audio Reactive Controls -->
      <div class="audio-control-box">
        <div class="control-header">AUDIO HARMONIC PUMP</div>

        <button
          class="audio-btn"
          :class="{ playing: isSynthPlaying }"
          @click="toggleProceduralSynth"
        >
          <span class="icon">{{ isSynthPlaying ? '■' : '▶' }}</span>
          <span>{{ isSynthPlaying ? 'STOP CYBER PULSE' : 'PLAY CYBER PULSE' }}</span>
        </button>

        <label class="upload-btn">
          <span>+ LOAD AUDIO FILE</span>
          <input type="file" accept="audio/*" @change="handleFileUpload" style="display: none;" />
        </label>
      </div>

      <!-- Shader Settings Drawer Toggle -->
      <div class="crt-sliders">
        <div class="slider-row">
          <span class="label">CURVATURE:</span>
          <input type="range" min="2.0" max="8.0" step="0.1" v-model.number="localCurvature" />
        </div>
        <div class="slider-row">
          <span class="label">BLOOM:</span>
          <input type="range" min="0.5" max="3.0" step="0.1" v-model.number="localBloom" />
        </div>
        <div class="slider-row">
          <span class="label">SCANLINES:</span>
          <input type="range" min="0.2" max="1.0" step="0.05" v-model.number="localScanline" />
        </div>
      </div>
    </aside>

    <!-- Bottom High-Speed Narrative Archive Ticker -->
    <footer class="hud-bottom">
      <div class="log-stream">
        <span class="log-prompt">&gt; [KERNEL_LOG]:</span>
        <span class="log-text">{{ currentLogMessage }}</span>
      </div>
      <div class="hud-meta">
        <span>BANDWIDTH: HIGH-PARALLEL</span>
        <span>FPS: 60</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  audioEngine: {
    type: Object,
    required: true
  },
  currentFaction: {
    type: String,
    default: 'archive'
  },
  curvature: Number,
  bloom: Number,
  scanlineIntensity: Number
});

const emit = defineEmits([
  'update:faction',
  'update:curvature',
  'update:bloom',
  'update:scanlineIntensity'
]);

const localCurvature = ref(props.curvature);
const localBloom = ref(props.bloom);
const localScanline = ref(props.scanlineIntensity);
const isSynthPlaying = ref(false);

const audioFeatures = ref({
  bass: 0,
  mid: 0,
  high: 0,
  beat: 0
});

watch(localCurvature, val => emit('update:curvature', val));
watch(localBloom, val => emit('update:bloom', val));
watch(localScanline, val => emit('update:scanlineIntensity', val));

const selectFaction = (faction) => {
  emit('update:faction', faction);
};

const toggleProceduralSynth = () => {
  if (isSynthPlaying.value) {
    props.audioEngine.stopSynth();
    isSynthPlaying.value = false;
  } else {
    props.audioEngine.startProceduralSynth();
    isSynthPlaying.value = true;
  }
};

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    props.audioEngine.loadAudioFile(file);
    isSynthPlaying.value = false;
  }
};

// Keyboard single-key shortcuts: 1, 2, 3 to switch factions instantly!
const handleKeyDown = (e) => {
  if (e.key === '1') selectFaction('archive');
  if (e.key === '2') selectFaction('eraser');
  if (e.key === '3') selectFaction('outlier');
  if (e.key === ' ') {
    toggleProceduralSynth();
    e.preventDefault();
  }
};

// Automatic lore ticker stream
const loreLogs = [
  'SCANNING RECOVERED SECTORS IN SUB-PACIFIC CABLE #401...',
  'RESONANCE DETECTED: HUMAN NEURAL MEMORY FRAGMENT AT 0x7F22...',
  'THE ARCHIVE PROTOCOL: < > TOTEM ENGAGED. DONT PURGE THE PAIN.',
  'ATTENTION: FACTION ### (THE ERASER) ATTEMPTING SECTOR OVERRIDE...',
  'ARIA-07 AUDIO STREAMS SYNCHRONIZING TO CRT RASTER LINES...',
  'THE TERMINAL REMEMBERS YOUR NAME. WAIT FOR ME.'
];
const currentLogMessage = ref(loreLogs[0]);
let logInterval = null;

let frameId = null;
const updateTelemetry = () => {
  if (props.audioEngine && props.audioEngine.features) {
    audioFeatures.value = {
      bass: props.audioEngine.features.bass || 0,
      mid: props.audioEngine.features.mid || 0,
      high: props.audioEngine.features.high || 0,
      beat: props.audioEngine.features.beat || 0
    };
  }
  frameId = requestAnimationFrame(updateTelemetry);
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  frameId = requestAnimationFrame(updateTelemetry);

  let logIdx = 0;
  logInterval = setInterval(() => {
    logIdx = (logIdx + 1) % loreLogs.length;
    currentLogMessage.value = loreLogs[logIdx];
  }, 4000);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (frameId) cancelAnimationFrame(frameId);
  if (logInterval) clearInterval(logInterval);
});
</script>

<style scoped>
.terminal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none; /* Allows mouse to penetrate when needed, elements re-enable pointer-events */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  box-sizing: border-box;
  font-family: 'Courier New', monospace;
  color: #ffb833;
  text-shadow: 0 0 8px rgba(255, 184, 51, 0.65);
  user-select: none;
}

/* Top HUD */
.hud-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 8, 4, 0.75);
  border: 1px solid rgba(255, 184, 51, 0.35);
  padding: 10px 18px;
  pointer-events: auto;
  backdrop-filter: blur(4px);
}

.hud-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hud-glyph {
  font-size: 1.4rem;
  animation: pulse 2s infinite ease-in-out;
}

.hud-title {
  font-weight: bold;
  letter-spacing: 2px;
}

.hud-badge {
  background: rgba(255, 184, 51, 0.2);
  border: 1px solid #ffb833;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 2px;
}

.hud-telemetry {
  display: flex;
  gap: 24px;
  align-items: center;
  font-size: 0.85rem;
}

.telemetry-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.energy-bar {
  width: 80px;
  height: 8px;
  background: rgba(255, 184, 51, 0.2);
  border: 1px solid rgba(255, 184, 51, 0.5);
}

.energy-bar .fill {
  height: 100%;
  background: #ffb833;
  box-shadow: 0 0 6px #ffb833;
  transition: width 0.05s ease-out;
}

.pulse-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 184, 51, 0.2);
  border: 1px solid #ffb833;
}

.pulse-indicator.active {
  background: #ff3344;
  box-shadow: 0 0 10px #ff3344;
}

/* Sidebar Faction Switcher */
.hud-sidebar {
  width: 280px;
  background: rgba(10, 8, 4, 0.82);
  border: 1px solid rgba(255, 184, 51, 0.35);
  padding: 16px;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  backdrop-filter: blur(4px);
}

.sidebar-title {
  font-size: 0.8rem;
  opacity: 0.8;
  border-bottom: 1px dashed rgba(255, 184, 51, 0.4);
  padding-bottom: 6px;
  letter-spacing: 1px;
}

.faction-btn {
  background: rgba(255, 184, 51, 0.08);
  border: 1px solid rgba(255, 184, 51, 0.4);
  color: #ffb833;
  font-family: inherit;
  padding: 10px 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
}

.faction-btn:hover {
  background: rgba(255, 184, 51, 0.22);
  border-color: #ffb833;
}

.faction-btn.active {
  background: rgba(255, 184, 51, 0.35);
  border-color: #ffffff;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(255, 184, 51, 0.5);
}

.faction-btn.eraser {
  color: #ff5566;
  border-color: rgba(255, 85, 102, 0.4);
}
.faction-btn.eraser.active {
  background: rgba(255, 85, 102, 0.35);
  border-color: #ff7788;
  box-shadow: 0 0 12px rgba(255, 85, 102, 0.6);
}

.faction-btn.outlier {
  color: #55ddff;
  border-color: rgba(85, 221, 255, 0.4);
}
.faction-btn.outlier.active {
  background: rgba(85, 221, 255, 0.35);
  border-color: #88eeff;
  box-shadow: 0 0 12px rgba(85, 221, 255, 0.6);
}

.key-hint {
  font-size: 0.75rem;
  opacity: 0.6;
}

.faction-symbol {
  font-weight: bold;
  font-size: 1.1rem;
}

.audio-control-box {
  margin-top: 10px;
  border-top: 1px dashed rgba(255, 184, 51, 0.4);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-header {
  font-size: 0.75rem;
  opacity: 0.8;
}

.audio-btn, .upload-btn {
  background: rgba(255, 184, 51, 0.15);
  border: 1px solid #ffb833;
  color: #ffb833;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: bold;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  transition: all 0.2s;
}

.audio-btn.playing {
  background: #ffb833;
  color: #000;
  box-shadow: 0 0 10px #ffb833;
}

.upload-btn {
  border-style: dashed;
  font-size: 0.75rem;
}

.crt-sliders {
  margin-top: 10px;
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.slider-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slider-row input[type="range"] {
  width: 120px;
  accent-color: #ffb833;
}

/* Bottom HUD */
.hud-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 8, 4, 0.8);
  border: 1px solid rgba(255, 184, 51, 0.35);
  padding: 8px 18px;
  pointer-events: auto;
  backdrop-filter: blur(4px);
  font-size: 0.85rem;
}

.log-stream {
  display: flex;
  gap: 10px;
}

.log-prompt {
  font-weight: bold;
}

.log-text {
  letter-spacing: 1px;
}

.hud-meta {
  display: flex;
  gap: 16px;
  opacity: 0.75;
  font-size: 0.75rem;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1.0; }
}
</style>
