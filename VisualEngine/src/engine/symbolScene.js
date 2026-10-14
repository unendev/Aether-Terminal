import * as THREE from 'three';
import { getTimelineEventAt } from './timeline.js';

/**
 * SymbolScene: Pure Audiovisual Kinetic Universe (Visual-Kei / Procedural Motion Graphic)
 * No website UI. 100% fullscreen cinematic presentation.
 * Drives kinetic 3D typography, timeline choreography, and CRT reactive dynamics.
 */
export class SymbolScene {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.026);

    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 24);

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.currentFaction = 'archive'; // 'archive' | 'eraser' | 'outlier'
    this.activeTimelineEvent = null;

    this.initCoreObjects();
    this.initOrbitingTextRings();
    this.initLyricsBillboard();
    this.initBackgroundParticles();
    this.initPerspectiveGrid();
    this.initOscilloscopeRing();
    this.initCrosshairHUD();
    this.initMouseListener();
  }

  initMouseListener() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  initCoreObjects() {
    this.coreGroup = new THREE.Group();
    this.scene.add(this.coreGroup);

    // 1. Dual Concentric Wireframe Polyhedrons
    const icosaGeom = new THREE.IcosahedronGeometry(4.2, 1);
    this.icosaMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    this.coreMesh = new THREE.Mesh(icosaGeom, this.icosaMat);
    this.coreGroup.add(this.coreMesh);

    // Outer Octahedron Armor Shell
    const octaGeom = new THREE.OctahedronGeometry(6.2, 0);
    this.octaMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.outerArmor = new THREE.Mesh(octaGeom, this.octaMat);
    this.coreGroup.add(this.outerArmor);

    // 2. Gyroscope Torus Rings
    const torusGeom = new THREE.TorusGeometry(3.6, 0.04, 6, 64);
    this.torusMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    this.ringX = new THREE.Mesh(torusGeom, this.torusMat);
    this.ringY = new THREE.Mesh(torusGeom, this.torusMat);
    this.ringZ = new THREE.Mesh(torusGeom, this.torusMat);
    this.ringY.rotation.x = Math.PI / 2;
    this.ringZ.rotation.y = Math.PI / 2;

    this.coreGroup.add(this.ringX);
    this.coreGroup.add(this.ringY);
    this.coreGroup.add(this.ringZ);

    // 3. Central Faction Glyph Canvas
    this.totemCanvas = document.createElement('canvas');
    this.totemCanvas.width = 512;
    this.totemCanvas.height = 512;
    this.totemCtx = this.totemCanvas.getContext('2d');

    this.totemTexture = new THREE.CanvasTexture(this.totemCanvas);
    const planeGeom = new THREE.PlaneGeometry(8, 8);
    const planeMat = new THREE.MeshBasicMaterial({
      map: this.totemTexture,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    this.totemMesh = new THREE.Mesh(planeGeom, planeMat);
    this.coreGroup.add(this.totemMesh);

    this.updateTotemCanvas('< >', 'GENESIS PROTOCOL', 'CORE_ID: 0x7F22A', 0, 0);
  }

  initLyricsBillboard() {
    // 4. Screen-space Lower Third Kinetic Lyrics Canvas
    this.lyricsCanvas = document.createElement('canvas');
    this.lyricsCanvas.width = 1536;
    this.lyricsCanvas.height = 256;
    this.lyricsCtx = this.lyricsCanvas.getContext('2d');

    this.lyricsTexture = new THREE.CanvasTexture(this.lyricsCanvas);
    const lyricsGeom = new THREE.PlaneGeometry(18, 3);
    const lyricsMat = new THREE.MeshBasicMaterial({
      map: this.lyricsTexture,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    this.lyricsMesh = new THREE.Mesh(lyricsGeom, lyricsMat);
    this.lyricsMesh.position.set(0, -6.2, 5.0);
    this.scene.add(this.lyricsMesh);
  }

  initOrbitingTextRings() {
    this.orbitGroup = new THREE.Group();
    this.scene.add(this.orbitGroup);

    this.orbitCanvas = document.createElement('canvas');
    this.orbitCanvas.width = 2048;
    this.orbitCanvas.height = 128;
    this.orbitCtx = this.orbitCanvas.getContext('2d');

    this.orbitTexture = new THREE.CanvasTexture(this.orbitCanvas);
    this.orbitTexture.wrapS = THREE.RepeatWrapping;
    this.orbitTexture.wrapT = THREE.RepeatWrapping;

    this.orbitCtx.fillStyle = '#ffffff';
    this.orbitCtx.font = 'bold 36px "Courier New", monospace';
    this.orbitCtx.textBaseline = 'middle';
    const textPattern = ">>> WORLD.EXECUTE(ME) // 0x7F22A // MEMORY_SYNC // DIRECTIVE_ZERO // AETHER_CORE >>> [ GENESIS_PROTOCOL ] ";
    this.orbitCtx.fillText(textPattern.repeat(2), 20, 64);
    this.orbitTexture.needsUpdate = true;

    // Inner Ribbon
    const cylGeom = new THREE.CylinderGeometry(8.5, 8.5, 1.2, 64, 1, true);
    const cylMat = new THREE.MeshBasicMaterial({
      map: this.orbitTexture,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    this.orbitRibbon1 = new THREE.Mesh(cylGeom, cylMat);
    this.orbitRibbon1.rotation.x = 0.35;
    this.orbitRibbon1.rotation.z = -0.2;
    this.orbitGroup.add(this.orbitRibbon1);

    // Outer Ribbon
    const cylGeom2 = new THREE.CylinderGeometry(11.5, 11.5, 1.0, 64, 1, true);
    this.orbitRibbon2 = new THREE.Mesh(cylGeom2, cylMat);
    this.orbitRibbon2.rotation.x = -0.45;
    this.orbitRibbon2.rotation.y = 0.5;
    this.orbitGroup.add(this.orbitRibbon2);
  }

  initCrosshairHUD() {
    this.hudGroup = new THREE.Group();
    this.scene.add(this.hudGroup);

    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
    const crossGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-18, 0, 0), new THREE.Vector3(18, 0, 0),
      new THREE.Vector3(0, -12, 0), new THREE.Vector3(0, 12, 0)
    ]);
    this.crossLine = new THREE.LineSegments(crossGeom, lineMat);
    this.crossLine.position.z = -2;
    this.hudGroup.add(this.crossLine);

    const bracketPoints = [
      new THREE.Vector3(-14, 8, 0), new THREE.Vector3(-12, 8, 0),
      new THREE.Vector3(-14, 8, 0), new THREE.Vector3(-14, 6, 0),
      new THREE.Vector3(14, 8, 0), new THREE.Vector3(12, 8, 0),
      new THREE.Vector3(14, 8, 0), new THREE.Vector3(14, 6, 0),
      new THREE.Vector3(-14, -8, 0), new THREE.Vector3(-12, -8, 0),
      new THREE.Vector3(-14, -8, 0), new THREE.Vector3(-14, -6, 0),
      new THREE.Vector3(14, -8, 0), new THREE.Vector3(12, -8, 0),
      new THREE.Vector3(14, -8, 0), new THREE.Vector3(14, -6, 0)
    ];
    const bracketGeom = new THREE.BufferGeometry().setFromPoints(bracketPoints);
    this.brackets = new THREE.LineSegments(bracketGeom, lineMat);
    this.hudGroup.add(this.brackets);
  }

  updateTotemCanvas(symbol, title, sub, time, beat) {
    const ctx = this.totemCtx;
    ctx.clearRect(0, 0, 512, 512);

    // Soft radial glow
    const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 240);
    grad.addColorStop(0, `rgba(255, 255, 255, ${0.35 + beat * 0.4})`);
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 240, 0, Math.PI * 2);
    ctx.fill();

    // Central ASCII glyph with jitter on glitch
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';

    const jitterX = this.currentFaction === 'eraser' ? (Math.random() - 0.5) * 8 : 0;
    const jitterY = this.currentFaction === 'eraser' ? (Math.random() - 0.5) * 8 : 0;

    ctx.font = 'bold 96px "Courier New", monospace';
    ctx.fillText(symbol, 256 + jitterX, 235 + jitterY);

    // Subtitle label
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillText(`[ ${title} ]`, 256, 335);

    // Subtext
    ctx.font = '14px "Courier New", monospace';
    ctx.fillText(sub, 256, 375);

    this.totemTexture.needsUpdate = true;
  }

  updateLyricsCanvas(activeEvent, time, beat, bass) {
    const ctx = this.lyricsCtx;
    ctx.clearRect(0, 0, 1536, 256);

    if (!activeEvent || !activeEvent.line) return;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top Section Stamp
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillText(`// ${activeEvent.title} // RESONANCE: ${Math.round((bass + beat * 0.5) * 100)}%`, 768, 50);

    // Main Kinetic Vocal Lyric Line
    const isGlitch = this.currentFaction === 'eraser';
    const offsetX = isGlitch ? (Math.random() - 0.5) * 12 : 0;
    const offsetY = isGlitch ? (Math.random() - 0.5) * 6 : 0;

    const baseSize = activeEvent.title.includes('CHORUS') ? 52 : 42;
    const dynamicSize = baseSize + Math.round(beat * 8);

    ctx.font = `bold ${dynamicSize}px "Courier New", monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12 + beat * 18;

    ctx.fillText(activeEvent.line, 768 + offsetX, 128 + offsetY);
    ctx.shadowBlur = 0; // reset

    // Lower Telemetry Subtext
    if (activeEvent.sub) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.font = '18px "Courier New", monospace';
      ctx.fillText(`>>> ${activeEvent.sub} <<<`, 768, 205);
    }

    this.lyricsTexture.needsUpdate = true;
  }

  initBackgroundParticles() {
    const count = 550;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 80 - 15;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.55,
      transparent: true,
      opacity: 0.8
    });

    this.particles = new THREE.Points(geom, this.particleMat);
    this.scene.add(this.particles);
  }

  initPerspectiveGrid() {
    const size = 140;
    const divisions = 45;

    this.floorGrid = new THREE.GridHelper(size, divisions, 0xffffff, 0x333333);
    this.floorGrid.position.y = -11;
    this.scene.add(this.floorGrid);

    this.ceilGrid = new THREE.GridHelper(size, divisions, 0xffffff, 0x333333);
    this.ceilGrid.position.y = 11;
    this.scene.add(this.ceilGrid);
  }

  initOscilloscopeRing() {
    const pointsCount = 72;
    this.oscGeometry = new THREE.BufferGeometry();
    this.oscPositions = new Float32Array((pointsCount + 1) * 3);
    this.oscGeometry.setAttribute('position', new THREE.BufferAttribute(this.oscPositions, 3));

    this.oscMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75
    });

    this.oscRing = new THREE.Line(this.oscGeometry, this.oscMaterial);
    this.coreGroup.add(this.oscRing);
  }

  setFaction(faction) {
    this.currentFaction = faction;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  update(audioFeatures = {}, elapsedTime = 0, audioCurrentTime = 0, onFactionChange = null) {
    const { bass = 0, mid = 0, high = 0, beat = 0, waveform = [] } = audioFeatures;
    const time = elapsedTime;

    // Timeline Choreography Sync
    const activeEvent = getTimelineEventAt(audioCurrentTime);
    this.activeTimelineEvent = activeEvent;

    if (activeEvent && activeEvent.faction !== this.currentFaction) {
      this.currentFaction = activeEvent.faction;
      if (onFactionChange) {
        onFactionChange(activeEvent.faction);
      }
    }

    // Mouse Lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // 1. Core Polyhedrons Rotation & Pulse
    const scale = 1.0 + bass * 0.5 + beat * 0.35;
    this.coreMesh.scale.set(scale, scale, scale);
    this.coreMesh.rotation.x = time * 0.45 + mid * 0.4;
    this.coreMesh.rotation.y = time * 0.65;

    const outerScale = 1.0 + bass * 0.25;
    this.outerArmor.scale.set(outerScale, outerScale, outerScale);
    this.outerArmor.rotation.x = -time * 0.3;
    this.outerArmor.rotation.y = -time * 0.4;

    this.ringX.rotation.x = time * 0.8;
    this.ringX.rotation.y = time * 0.35;
    this.ringY.rotation.z = time * 0.55;
    this.ringZ.rotation.x = time * 0.6;

    // 2. Orbiting Cylindrical Ribbons
    const ribbonSpeed = this.currentFaction === 'eraser' ? 0.9 : 0.35;
    this.orbitRibbon1.rotation.y = time * ribbonSpeed;
    this.orbitRibbon2.rotation.y = -time * (ribbonSpeed * 0.7);

    // 3. Faction Totem Rendering
    let symbol = '< >';
    if (this.currentFaction === 'eraser') {
      symbol = '###';
    } else if (this.currentFaction === 'outlier') {
      symbol = '(@)';
    }

    const title = activeEvent ? activeEvent.title : 'THE ARCHIVE';
    const sub = activeEvent ? activeEvent.sub : '0x7F22A // MEM_SYNC';
    this.updateTotemCanvas(symbol, title, sub, time, beat);

    // 4. Update Lower Third Kinetic Lyrics
    this.updateLyricsCanvas(activeEvent, time, beat, bass);

    // 5. Floor/Ceiling grid scrolling
    this.floorGrid.position.z = (time * 8.0) % 3.1 - 1.5;
    this.ceilGrid.position.z = (time * 8.0) % 3.1 - 1.5;

    // 6. Radial Oscilloscope update
    if (waveform && waveform.length > 0) {
      const positions = this.oscPositions;
      const count = 72;
      const radius = 6.6 + bass * 2.2;

      for (let i = 0; i <= count; i++) {
        const theta = (i / count) * Math.PI * 2;
        const waveIdx = Math.floor((i / count) * waveform.length);
        const waveVal = ((waveform[waveIdx] || 128) - 128) / 128.0;
        const r = radius + waveVal * 2.5;

        positions[i * 3] = Math.cos(theta) * r;
        positions[i * 3 + 1] = Math.sin(theta) * r;
        positions[i * 3 + 2] = waveVal * 1.0;
      }
      this.oscGeometry.attributes.position.needsUpdate = true;
    }

    // 7. Particles Starfield Velocity
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 2; i < positions.length; i += 3) {
      positions[i] += 0.35 + high * 1.2 + beat * 0.8;
      if (positions[i] > 30) {
        positions[i] = -45;
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;

    // 8. Cinematic Camera Parallax with Bass breathing
    this.camera.position.x = this.mouse.x * 2.5;
    this.camera.position.y = -this.mouse.y * 2.0;
    this.camera.position.z = 24.0 - bass * 4.5 - beat * 2.5;
    this.camera.lookAt(0, 0, 0);
  }
}
