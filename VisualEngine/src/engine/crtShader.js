/**
 * CRT Post-Processing Shader
 * Accurately replicates the cool-retro-term CRT physics:
 * - Barrel distortion (spherical curvature)
 * - Animated scanlines & raster lines
 * - Phosphor glow & bloom falloff
 * - RGB chromatic aberration / split
 * - High-voltage flicker & analog noise
 * - Vignette & curved glass bezel reflection
 */

export const CrtVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const CrtFragmentShader = `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uCurvature;
uniform float uScanlineIntensity;
uniform float uScanlineCount;
uniform float uBloomIntensity;
uniform float uChromaOffset;
uniform float uFlicker;
uniform vec3 uPhosphorColor;
uniform float uAudioBeat;

varying vec2 vUv;

// Barrel distortion algorithm
vec2 curveRemap(vec2 uv, float curve) {
  uv = uv * 2.0 - 1.0;
  vec2 offset = abs(uv.yx) / vec2(curve, curve);
  uv = uv + uv * offset * offset;
  uv = uv * 0.5 + 0.5;
  return uv;
}

// Pseudo random generator
float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  // Apply CRT glass spherical curve
  vec2 uv = curveRemap(vUv, uCurvature);

  // Black bezel outside curved CRT screen
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.02, 0.015, 0.01, 1.0);
    return;
  }

  // Chromatic aberration (RGB shift)
  float chroma = uChromaOffset * (1.0 + uAudioBeat * 2.0);
  float r = texture2D(tDiffuse, vec2(uv.x + chroma, uv.y)).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, vec2(uv.x - chroma, uv.y)).b;
  vec3 color = vec3(r, g, b);

  // Phosphor tint (amber or custom faction color)
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  vec3 phosphor = lum * uPhosphorColor * 1.35;

  // Bloom / Glow sampling
  vec3 bloom = vec3(0.0);
  float bloomSpread = 0.0035;
  bloom += texture2D(tDiffuse, uv + vec2(-bloomSpread, 0.0)).rgb;
  bloom += texture2D(tDiffuse, uv + vec2(bloomSpread, 0.0)).rgb;
  bloom += texture2D(tDiffuse, uv + vec2(0.0, -bloomSpread)).rgb;
  bloom += texture2D(tDiffuse, uv + vec2(0.0, bloomSpread)).rgb;
  bloom *= 0.25 * uBloomIntensity;

  vec3 finalColor = phosphor + bloom * uPhosphorColor;

  // Scanlines
  float scanline = sin((uv.y + uTime * 0.08) * uScanlineCount * 3.14159);
  scanline = (scanline + 1.0) * 0.5;
  scanline = pow(scanline, 1.8);
  finalColor *= mix(1.0, 0.65 + 0.35 * scanline, uScanlineIntensity);

  // Fine raster vertical mask
  float raster = sin(uv.x * uScanlineCount * 2.5 * 3.14159);
  finalColor *= 0.92 + 0.08 * raster;

  // Subtle analog jitter & noise
  float noise = (rand(uv + fract(uTime * 17.1)) - 0.5) * 0.045;
  finalColor += noise;

  // High voltage flicker
  float flicker = 1.0 + sin(uTime * 85.0) * 0.015 * uFlicker + (uAudioBeat * 0.08);
  finalColor *= flicker;

  // Vignette (edge darkness)
  vec2 vigUv = uv * (1.0 - uv.yx);
  float vig = vigUv.x * vigUv.y * 30.0;
  vig = clamp(pow(vig, 0.35), 0.0, 1.0);
  finalColor *= vig;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;
