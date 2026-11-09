/*
 * The shaders of Synthèse de réunions' thumbnail (journal n° 103), in GLSL
 * ES 3.00 for WebGL 2. The glass follows the main shader of liquid-glass-studio
 * by Charles Yin (MIT, github.com/iyinchao/liquid-glass-studio): the
 * superellipse shape, Snell's refraction on the bevel (index 1.4), the prism,
 * the Fresnel rim, the two-lobed glare and the shadow. Added here:
 * - the paper is read where the glass shows it, from a still texture twice as
 *   fine as the screen, with its mipmaps and anisotropic filtering: magnified
 *   cleanly under the loupe, averaged without streaks on the bevel;
 * - a ×1.25 loupe, with no blur or tint: the glass is as clear as can be;
 * - a slight absorption where the glass is thick;
 * - one light for the glass, the embossed paper and the shadow, with a caustic
 *   at the shadow's edge.
 * Lengths are given for a 518 px wide card (the Vitrine's) and scale with the
 * picture; only the grain stays at the screen's scale. Coordinates are in px,
 * y up, as in GL.
 */

export const SOMMET = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// The glass's shape, as the studio's roundedRectSDF: a rectangle with superellipse corners.
const FORME = `
uniform vec2 u_centre;
uniform vec2 u_demi;
uniform float u_rayon;
uniform float u_rondeur;
float sdfVitre(vec2 p) {
  p -= u_centre;
  vec2 d = abs(p) - u_demi;
  if (d.x > -u_rayon && d.y > -u_rayon) {
    vec2 c = max(abs(p) - (u_demi - u_rayon), vec2(0.0));
    return pow(pow(c.x, u_rondeur) + pow(c.y, u_rondeur), 1.0 / u_rondeur) - u_rayon;
  }
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}`;

// Noise: Dave Hoskins' hash, value noise and its fractal sum.
const BRUIT = `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.1;
    a *= 0.5;
  }
  return s / 0.9375;
}`;

// sRGB ↔ LCH (CIELAB, D65), as the studio's lib/color.glsl.
const COULEUR = `
const vec3 BLANC_D65 = vec3(0.95045592705, 1.0, 1.08905775076);
const mat3 RGB_XYZ = mat3(0.4124, 0.3576, 0.1805, 0.2126, 0.7152, 0.0722, 0.0193, 0.1192, 0.9505);
const mat3 XYZ_RGB = mat3(3.2406255, -1.537208, -0.4986286, -0.9689307, 1.8757561, 0.0415175, 0.0557101, -0.2040211, 1.0569959);
float lin(float a) { return a > 0.04045 ? pow((a + 0.055) / 1.055, 2.4) : a / 12.92; }
float gam(float a) { return a <= 0.0031308 ? 12.92 * a : 1.055 * pow(a, 1.0 / 2.4) - 0.055; }
float fLab(float x) { return x > 0.00885645167 ? pow(x, 1.0 / 3.0) : 7.78703703704 * x + 0.13793103448; }
float fInv(float x) { return x > 0.206897 ? x * x * x : 0.12841854934 * (x - 0.137931034); }
vec3 versLch(vec3 s) {
  vec3 xyz = (vec3(lin(s.r), lin(s.g), lin(s.b)) * RGB_XYZ) / BLANC_D65;
  vec3 f = vec3(fLab(xyz.x), fLab(xyz.y), fLab(xyz.z));
  vec3 lab = vec3(116.0 * f.y - 16.0, 500.0 * (f.x - f.y), 200.0 * (f.y - f.z));
  return vec3(lab.x, length(lab.yz), atan(lab.z, lab.y));
}
vec3 depuisLch(vec3 l) {
  vec2 ab = l.y * vec2(cos(l.z), sin(l.z));
  float w = (l.x + 16.0) / 116.0;
  vec3 xyz = BLANC_D65 * vec3(fInv(w + ab.x / 500.0), fInv(w), fInv(w - ab.y / 200.0));
  vec3 rgb = max(xyz * XYZ_RGB, vec3(0.0));
  return vec3(gam(rgb.r), gam(rgb.g), gam(rgb.b));
}`;

// His gradient: Willow Mist, Young Willow, Clear Bamboo, Forest Tea.
const RAMPE = `
const vec3 C0 = vec3(0.949, 0.992, 0.976);
const vec3 C1 = vec3(0.659, 0.941, 0.863);
const vec3 C2 = vec3(0.322, 0.796, 0.690);
const vec3 C3 = vec3(0.078, 0.478, 0.373);
vec3 rampe(float s) {
  s = clamp(s, 0.0, 1.0) * 3.0;
  if (s < 1.0) return mix(C0, C1, smoothstep(0.0, 1.0, s));
  if (s < 2.0) return mix(C1, C2, smoothstep(0.0, 1.0, s - 1.0));
  return mix(C2, C3, smoothstep(0.0, 1.0, s - 2.0));
}`;

/** 1. The current, at a quarter of the resolution, every frame: the place in the gradient. */
export const FS_FLUX = `#version 300 es
precision highp float;
uniform vec2 u_taille;
uniform float u_temps;
${BRUIT}
in vec2 v_uv;
out vec4 o;
void main() {
  float aspect = u_taille.x / u_taille.y;
  vec2 p = v_uv * vec2(aspect, 1.0) * 1.6;
  float t = u_temps;
  // a domain warp (Inigo Quilez): noise bends noise, and the colours flow
  vec2 q = vec2(fbm(p + vec2(0.0, 0.07 * t)), fbm(p + vec2(5.2, 1.3) - 0.06 * t));
  vec2 r = vec2(fbm(p + 2.6 * q + vec2(1.7, 9.2) + 0.05 * t), fbm(p + 2.6 * q + vec2(8.3, 2.8) - 0.045 * t));
  float f = fbm(p + 2.4 * r);
  float s = (1.0 - v_uv.y) * 0.8 + (f - 0.5) * 1.1 + 0.08;
  o = vec4(clamp(s, 0.0, 1.0), 0.0, 0.0, 1.0);
}`;

/** How the relief's slope is stored in the paper's b and a channels. */
const PENTE = '1.5';

/**
 * 2. The paper, once, twice as fine as the screen: r = its tone (marbling,
 * vignette), g = the grain, b and a = the slope of its relief (the fibres and
 * the embossed fingerprint), lit every frame by the light of the moment.
 */
export const FS_PAPIER = `#version 300 es
precision highp float;
uniform vec2 u_taille;
uniform float u_texel; // texels per px
uniform float u_echelle; // the picture's width over a Vitrine card's
uniform vec2 u_coeur;
${BRUIT}
in vec2 v_uv;
out vec4 o;
// the paper's fibres and tooth, at the screen's scale
float papier(vec2 p) {
  return fbm(p * 0.05) * 0.5 + vnoise(p * vec2(0.07, 0.6) + 2.0) * 0.3 + vnoise(p * 0.8 + 9.0) * 0.2;
}
// the fingerprint, at the picture's scale: rounded ridges around a core, which
// wander, rarely break, and whose outline frays as it fades
float empreinte(vec2 p) {
  vec2 v = (p - u_coeur) / u_echelle;
  vec2 pe = p / u_echelle;
  float a = -0.22;
  v = mat2(cos(a), sin(a), -sin(a), cos(a)) * v;
  v *= vec2(0.8, 1.0);
  v += (vec2(fbm(pe * 0.01 + 3.0), fbm(pe * 0.01 + 9.0)) - 0.5) * 24.0;
  float r = length(v);
  float th = atan(v.y, v.x);
  float tour = smoothstep(0.0, 50.0, r);
  float phi = r + tour * (4.5 * sin(2.0 * th + 0.6) + 2.5 * sin(th + 1.7));
  float sillon = 0.5 + 0.5 * cos(6.2831853 * phi / 6.6);
  float pression = vnoise(pe * 0.03 + 1.0);
  float crete = smoothstep(0.2 + 0.25 * pression, 0.97, sillon);
  float casse = smoothstep(0.15, 0.28, vnoise(pe * 0.055 + 5.0));
  float contour = r + (fbm(pe * 0.02 + 4.0) - 0.5) * 60.0;
  float masque = 1.0 - smoothstep(125.0, 225.0, contour);
  return crete * casse * masque;
}
void main() {
  vec2 p = v_uv * u_taille;
  float e = 0.35;
  vec2 pente = vec2(papier(p + vec2(e, 0.0)) - papier(p - vec2(e, 0.0)), papier(p + vec2(0.0, e)) - papier(p - vec2(0.0, e))) / (2.0 * e) * 0.45;
  // the fingerprint's slope is per px of a card, so it reads the same at every size
  float ee = 0.35 * u_echelle;
  float h0 = empreinte(p);
  pente += vec2(empreinte(p + vec2(ee, 0.0)) - h0, empreinte(p + vec2(0.0, ee)) - h0) / ee * 0.2 * u_echelle;

  float ton = 1.0 + (fbm(p * 0.03 + 11.0) - 0.5) * 0.08;
  vec2 vc = (v_uv - 0.5) * vec2(1.3, 1.0);
  ton -= dot(vc, vc) * 0.14;

  float grain = (vnoise(p * 1.4) - 0.5) * 0.6 + (vnoise(p * 3.1 + 7.0) - 0.5) * 0.3 + (hash12(floor(p * u_texel)) - 0.5) * 0.25;

  o = vec4(clamp((ton - 0.7) / 0.6, 0.0, 1.0), clamp(0.5 + grain * 0.5, 0.0, 1.0), clamp(0.5 + pente * ${PENTE}, 0.0, 1.0));
}`;

/** 3. The glass, on screen: the background worked out where the glass shows it. */
export const FS_VERRE = `#version 300 es
precision highp float;
uniform sampler2D u_flux;
uniform sampler2D u_papier;
uniform vec2 u_taille;
uniform float u_dpr;
uniform float u_echelle;
uniform vec2 u_lumiere; // the light's direction
uniform float u_texel; // the paper's texels per px
uniform float u_flouBord;
uniform vec3 u_ombre; // offset, spread, strength
uniform float u_caustique;
uniform float u_loupe;
uniform float u_epaisseur;
uniform float u_indice;
uniform float u_deviation;
uniform float u_prisme;
uniform float u_absorption;
uniform float u_normale;
uniform vec3 u_fresnel; // reach, hardness, strength
uniform vec4 u_eclat; // reach, hardness, strength, convergence
uniform float u_oppose;
${FORME}
${COULEUR}
${RAMPE}
in vec2 v_uv;
out vec4 o;

// The paper, sharp, or softened by flou px on the bevel (the studio's blurEdge):
// stretched hard by the edge, its grain would make fine stripes there.
vec4 lirePapier(vec2 uv, vec2 gx, vec2 gy, float flou) {
  if (flou <= 0.0) return textureGrad(u_papier, uv, gx, gy);
  vec2 ts = vec2(textureSize(u_papier, 0));
  float f = max(max(length(gx * ts), length(gy * ts)), flou * u_texel);
  return textureLod(u_papier, uv, log2(max(f, 1.0)));
}

// The background at q (px); gx and gy say how much the glass stretches or squeezes the paper.
vec3 fondEn(vec2 q, vec2 gx, vec2 gy, float flou) {
  vec2 uv = q / u_taille;
  vec3 c = rampe(textureLod(u_flux, uv, 0.0).r);
  vec4 m = lirePapier(uv, gx, gy, flou);
  vec2 pente = (m.ba - 0.5) / ${PENTE};
  c *= (0.7 + 0.6 * m.r) * (1.0 - dot(pente, u_lumiere));
  c += (m.g - 0.5) * 0.16;
  // the glass's shadow, away from the light, and the caustic at its edge
  float d = sdfVitre(q + u_lumiere * u_ombre.x) / u_echelle;
  c -= exp(-abs(d) / u_ombre.y) * 0.6 * u_ombre.z;
  c += exp(-pow((d + 3.0) / 1.6, 2.0)) * u_caustique * vec3(0.9, 1.0, 0.96);
  return clamp(c, 0.0, 1.0);
}

float bord(float nm, float portee, float durete) {
  return clamp(pow(max(0.0, 1.0 + durete - nm * pow(500.0 / portee, 2.0) / 1500.0), 5.0), 0.0, 1.0);
}

void main() {
  vec2 p = gl_FragCoord.xy / u_dpr;
  float d = sdfVitre(p);
  float nm = max(0.0, -d) / u_echelle; // the distance to the edge, in px of a card

  // the normal, by finite differences
  float e = 0.5;
  vec2 g = vec2(sdfVitre(p + vec2(e, 0.0)) - sdfVitre(p - vec2(e, 0.0)), sdfVitre(p + vec2(0.0, e)) - sdfVitre(p - vec2(0.0, e)));
  vec2 n = length(g) > 1e-6 ? normalize(g) : vec2(0.0);

  // Snell on the bevel
  float ef = 0.0;
  if (nm < u_epaisseur) {
    float r = 1.0 - nm / u_epaisseur;
    float ti = asin(clamp(r * r, -1.0, 1.0));
    float tt = asin(clamp(sin(ti) / u_indice, -1.0, 1.0));
    ef = -tan(tt - ti);
  }

  // the loupe, then the bevel's deviation, inwards; derivatives are taken everywhere,
  // before knowing whether the pixel is under the glass
  vec2 base = u_centre + (p - u_centre) / u_loupe;
  vec2 dev = -n * ef * u_deviation * u_echelle;
  vec2 q = base + dev;
  vec2 gxq = dFdx(q) / u_taille;
  vec2 gyq = dFdy(q) / u_taille;

  vec2 gxp = vec2(1.0 / (u_dpr * u_taille.x), 0.0);
  vec2 gyp = vec2(0.0, 1.0 / (u_dpr * u_taille.y));
  vec3 dehors = fondEn(p, gxp, gyp, 0.0);
  float aa = 1.0 / u_dpr;
  if (d > aa) {
    o = vec4(dehors, 1.0);
    return;
  }

  // the prism, only where the glass bends the light, and the paper softened on the bevel
  float epais = 1.0 - smoothstep(0.0, u_epaisseur, nm);
  float flou = u_flouBord * u_echelle * epais * epais;
  vec3 vu;
  if (ef > 1e-4) {
    vu = vec3(
      fondEn(base + dev * (1.0 + 0.02 * u_prisme), gxq, gyq, flou).r,
      fondEn(q, gxq, gyq, flou).g,
      fondEn(base + dev * (1.0 - 0.02 * u_prisme), gxq, gyq, flou).b
    );
  } else {
    vu = fondEn(q, gxq, gyq, 0.0);
  }
  vec3 c = vu;

  // where the glass is thick it absorbs a little, and its edge draws itself
  c = mix(c, c * vec3(0.82, 0.93, 0.9), u_absorption * epais * epais);

  // the Fresnel rim
  c = mix(c, vec3(1.0), bord(nm, u_fresnel.x, u_fresnel.y) * u_fresnel.z * 0.7 * u_normale);

  // the glare: two lobes, facing the light and opposite it
  float geo = bord(nm, u_eclat.x, u_eclat.y);
  if (geo > 1e-3) {
    float cosA = dot(n, u_lumiere);
    float cos2 = 2.0 * cosA * cosA - 1.0;
    float fa = (0.5 + 0.5 * cos2) * (cosA < 0.0 ? 1.2 * u_oppose : 1.2) * u_eclat.z;
    fa = clamp(pow(max(fa, 0.0), 0.1 + u_eclat.w * 2.0), 0.0, 1.0);
    float gl = fa * geo;
    if (gl > 1e-3) {
      vec3 lch = versLch(vu);
      lch.x = min(120.0, lch.x + 150.0 * gl);
      lch.y += 30.0 * gl;
      c = mix(c, clamp(depuisLch(lch), 0.0, 1.0), gl * u_normale);
    }
  }

  // the glass's edge, over one screen pixel
  o = vec4(mix(c, dehors, smoothstep(-aa, aa, d)), 1.0);
}`;
