import { ShaderMaterial } from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float scanline = 0.5 + 0.5 * sin((vUv.y + uTime * 0.06) * 620.0);
    float drift = 0.5 + 0.5 * sin(uTime * 0.5);
    vec3 phosphor = mix(vec3(0.42, 0.72, 0.64), vec3(0.30, 0.52, 0.74), drift);
    float vignette = smoothstep(1.05, 0.24, distance(vUv, vec2(0.5)));
    vec3 color = phosphor * (0.78 + 0.22 * scanline) * vignette;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function createScreenMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader,
    fragmentShader,
    toneMapped: false,
  });
}
