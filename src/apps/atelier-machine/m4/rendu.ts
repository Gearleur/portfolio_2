import type { Bloc } from './nombre';
import type { Image } from './passage';

/*
 * The bubble, drawn (step M4): one fragment shader, on a canvas laid above the human page and
 * under the terminal. Nothing under it is masked, blurred or repainted: the page stays as it is,
 * the canvas alone changes from frame to frame. And of the canvas, the shader only runs where it
 * has something to work out, the rim and the number; the plain black is filled, the rest left
 * clear (decouper).
 *
 * What it draws, after Alexandre's reference: a black whose edge is not sharp. Inside the edge
 * the black warms into a tint, which burns to white where the black ends and bleeds a little
 * light over the page; the tints change along the arc. The number is written on the black: near
 * the edge it goes out of focus, is drawn towards the rim, and its colours come apart.
 */

const SOMMETS = `#version 300 es
layout(location = 0) in vec2 a_coin;
void main() {
  gl_Position = vec4(a_coin, 0.0, 1.0);
}`;

const FRAGMENTS = `#version 300 es
precision highp float;

uniform vec2 u_toile;      // the canvas, px
uniform vec2 u_centre;     // the bubble's centre, px, y down
uniform float u_rayon;
uniform float u_lisere;    // the rim's width, px
uniform vec3 u_axe;        // xy: the axis the tints follow; z: its length, px
uniform vec2 u_milieu;     // where the middle tint is, px
uniform vec3 u_teintes[5];
uniform float u_saturation;
uniform float u_intensite;
uniform vec3 u_fond;       // the black side's colour
uniform float u_force;     // how strong the number is
uniform float u_lettre;    // 0 the drawing the bubble uncovers, 1 the one that stays under the terminal
uniform float u_flou;      // the number's blur under the rim, px
uniform float u_graine;
uniform sampler2D u_avant;
uniform sampler2D u_apres;
uniform vec4 u_boiteAvant; // where each drawing of the number goes: x, y, width, height, px
uniform vec4 u_boiteApres;

out vec4 couleur;

float grain(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

vec3 teinte(float x) {
  float f = clamp(x, 0.0, 1.0) * 4.0;
  int i = int(min(floor(f), 3.0));
  vec3 c = mix(u_teintes[i], u_teintes[i + 1], smoothstep(0.0, 1.0, f - float(i)));
  return mix(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))), c, u_saturation);
}

// A blurred reading: a coarser level of the drawing, five taps of it.
vec4 lire(sampler2D t, vec2 uv, float niveau) {
  vec2 pas = 0.8 * exp2(niveau) / vec2(textureSize(t, 0));
  return 0.28 * textureLod(t, uv, niveau)
    + 0.18 * (textureLod(t, uv + pas * vec2(0.92, 0.38), niveau) + textureLod(t, uv + pas * vec2(-0.38, 0.92), niveau)
      + textureLod(t, uv + pas * vec2(-0.92, -0.38), niveau) + textureLod(t, uv + pas * vec2(0.38, -0.92), niveau));
}

// The number at a point: sharp, or blurred, pushed aside, its red and its blue a little apart.
vec4 ecrit(sampler2D t, vec4 boite, vec2 p, vec2 pousse, float niveau) {
  if (boite.z < 1.0) return vec4(0.0);
  vec2 uv = (p - boite.xy) / boite.zw;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  if (niveau < 0.02) return textureLod(t, uv, 0.0);
  vec2 d = pousse / boite.zw;
  vec4 r = lire(t, uv - d * 1.22, niveau);
  vec4 v = lire(t, uv - d, niveau);
  vec4 b = lire(t, uv - d * 0.78, niveau);
  return vec4(r.r, v.g, b.b, max(v.a, max(r.a, b.a)));
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_toile.y - gl_FragCoord.y);
  vec2 q = p - u_centre;
  float loin = length(q);
  // how far outside the black, px, and in widths of the rim; n points out of it
  float dehors = loin - u_rayon;
  vec2 n = q / max(loin, 0.001);
  float s = dehors / u_lisere;
  if (s > 4.0) {
    couleur = vec4(0.0);
    return;
  }

  float corps = 1.0 - smoothstep(-0.34, 0.2, s);

  // The rim: a tint that rises in the black, burns to white where the black ends, and spills
  // outside, where it veils the page.
  vec3 vive = teinte(0.5 + dot(p - u_milieu, u_axe.xy) / u_axe.z);
  float braise = smoothstep(-1.0, -0.06, s);
  braise *= braise;
  float halo = exp(-max(s, 0.0) * 1.9);
  float blanc = smoothstep(-0.32, 0.3, s);
  float fil = exp(-s * s * 70.0);
  float g = grain(p + u_graine) - 0.5;
  vec3 lueur = mix(vive, mix(vive, vec3(1.0), 0.74), blanc);
  lueur = mix(lueur, vec3(1.0), fil * 0.5) * (1.0 + 0.05 * g);
  float aLueur = clamp(braise * halo * u_intensite, 0.0, 1.0);

  // The number, on the black only: out of focus and drawn towards the rim as it comes near.
  float dedans = smoothstep(0.1, 0.95, -s) * u_force;
  vec4 texte = vec4(0.0);
  if (dedans > 0.003) {
    float net = smoothstep(0.0, 1.0, (-dehors - 0.25 * u_lisere) / (1.3 * u_lisere + 2.5 * u_flou + 1.0));
    float trouble = 1.0 - net;
    float niveau = log2(1.0 + trouble * u_flou * 0.5);
    vec2 pousse = n * trouble * trouble * u_flou * 1.8;
    if (u_lettre < 0.999) texte += (1.0 - u_lettre) * ecrit(u_avant, u_boiteAvant, p, pousse, niveau);
    if (u_lettre > 0.001) texte += u_lettre * ecrit(u_apres, u_boiteApres, p, pousse, niveau);
    texte *= dedans * mix(0.55, 1.0, net);
  }

  // The black, the number over it, the rim's light over both; all premultiplied.
  vec3 rvb = texte.rgb + u_fond * corps * (1.0 - texte.a);
  float a = texte.a + corps * (1.0 - texte.a);
  rvb = lueur * aLueur + rvb * (1.0 - aLueur);
  a = aLueur + a * (1.0 - aLueur);
  // a little noise, so that the gradients do not band
  float bruit = g * (1.5 / 255.0) * step(0.002, a) * step(a, 0.998);
  couleur = vec4(max(rvb + bruit, 0.0), clamp(a + bruit, 0.0, 1.0));
}`;

/** What the bubble is made of, besides where it is: the rim's tints, the black's colour (0–255), the number's blur. */
export type Matiere = { teintes: readonly string[]; saturation: number; intensite: number; flou: number; fond: readonly number[] };

/** The two drawings of the number: the one the bubble uncovers, the one that stays under the terminal. */
export type Calque = 'avant' | 'apres';

export type Rendu = {
  /** The stage's size, CSS px, and how many px of the canvas each takes. */
  dimensionner(l: number, h: number, dpr: number): void;
  /** One of the two drawings of the number, or none. */
  ecrire(calque: Calque, bloc: Bloc | null): void;
  dessiner(image: Image, matiere: Matiere, graine?: number): void;
  effacer(): void;
  /**
   * The context is gone, or the shader could not be built: nothing more will be drawn. The
   * shader is built aside from the page; unless told not to wait, this waits for it to be known.
   */
  perdu(attendre?: boolean): boolean;
  liberer(): void;
};

const rvb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/** A strip of the canvas, px from its top left corner, and whether the shader runs there (else it is plain black). */
export type Bande = { x: number; y: number; l: number; h: number; calcul: boolean };

/** How many tiles across the canvas's longer side. */
const CARREAUX = 24;

/**
 * Cuts the canvas into what has to be worked out and what has not. A tile wholly in the black
 * and clear of the number is plain black; one wholly beyond the rim's glow is left clear; the
 * others, where the rim passes or the number is written, are for the shader. Tiles of a row that
 * are filled alike come back as one strip. All in px of the canvas; `boites` are the number's
 * drawings in use: x, y, width, height.
 */
export function decouper(bulle: { cx: number; cy: number; rayon: number; lisere: number }, largeur: number, hauteur: number, boites: readonly (readonly number[])[]): Bande[] {
  const bandes: Bande[] = [];
  const cote = Math.max(8, Math.ceil(Math.max(largeur, hauteur) / CARREAUX));
  const lisere = Math.max(0.5, bulle.lisere);
  for (let y = 0; y < hauteur; y += cote) {
    const h = Math.min(cote, hauteur - y);
    let bande: Bande | null = null;
    for (let x = 0; x < largeur; x += cote) {
      const l = Math.min(cote, largeur - x);
      // how far outside the black the tile's centre is; no point of the tile is further from that than `demi`
      const dehors = Math.hypot(x + l / 2 - bulle.cx, y + h / 2 - bulle.cy) - bulle.rayon;
      const demi = Math.hypot(l, h) / 2;
      const noir = dehors + demi < -lisere;
      const calcul = noir ? boites.some(([bx, by, bl, bh]) => bl >= 1 && x < bx + bl && x + l > bx && y < by + bh && y + h > by) : dehors - demi <= 4 * lisere;
      if (!noir && !calcul) {
        bande = null;
        continue;
      }
      if (bande && bande.calcul === calcul) bande.l += l;
      else bandes.push((bande = { x, y, l, h, calcul }));
    }
  }
  return bandes;
}

function compiler(gl: WebGL2RenderingContext, sorte: number, source: string) {
  const shader = gl.createShader(sorte);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/** The bubble's renderer on this canvas, or null without WebGL 2: the passage is then a plain change of state. */
export function creerRendu(toile: HTMLCanvasElement): Rendu | null {
  const gl = toile.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
  if (!gl || gl.isContextLost()) return null;

  const sommets = compiler(gl, gl.VERTEX_SHADER, SOMMETS);
  const fragments = compiler(gl, gl.FRAGMENT_SHADER, FRAGMENTS);
  const programme = gl.createProgram();
  if (!sommets || !fragments || !programme) return null;
  gl.attachShader(programme, sommets);
  gl.attachShader(programme, fragments);
  gl.linkProgram(programme);
  // The shader is sent to be built now, and nothing is asked of it yet: asking holds the page
  // until it is built (some 10 ms here, far more on a phone or through Direct3D). It is built
  // aside while the stage mounts and the page goes on; its state is read a moment later, when
  // the page is idle (finir), or at the first need if that comes sooner.
  gl.flush();
  let pret = false;
  let mort = false;
  const finir = () => {
    if (pret || mort) return;
    if (!gl.getProgramParameter(programme, gl.LINK_STATUS)) {
      mort = true;
      return;
    }
    gl.useProgram(programme);
    gl.uniform1i(lieu('u_avant'), calques.avant.unite);
    gl.uniform1i(lieu('u_apres'), calques.apres.unite);
    pret = true;
  };
  const repos = window.setTimeout(() => (window.requestIdleCallback ? window.requestIdleCallback(finir, { timeout: 1500 }) : finir()), 300);

  // One triangle that covers the stage.
  const triangle = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.disable(gl.BLEND);

  const lieux = new Map<string, WebGLUniformLocation | null>();
  const lieu = (nom: string) => {
    if (!lieux.has(nom)) lieux.set(nom, gl.getUniformLocation(programme, nom));
    return lieux.get(nom) ?? null;
  };

  // The two drawings of the number, each with its coarser levels for the blur.
  const calques: Record<Calque, { texture: WebGLTexture | null; unite: number; boite: number[] }> = {
    avant: { texture: gl.createTexture(), unite: 0, boite: [0, 0, 0, 0] },
    apres: { texture: gl.createTexture(), unite: 1, boite: [0, 0, 0, 0] },
  };
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  for (const { texture, unite } of Object.values(calques)) {
    gl.activeTexture(gl.TEXTURE0 + unite);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  let dpr = 1;
  const perte = (event: Event) => {
    event.preventDefault();
    mort = true;
  };
  toile.addEventListener('webglcontextlost', perte);

  return {
    dimensionner(l, h, d) {
      dpr = d;
      const [largeur, hauteur] = [Math.max(1, Math.round(l * d)), Math.max(1, Math.round(h * d))];
      if (toile.width !== largeur) toile.width = largeur;
      if (toile.height !== hauteur) toile.height = hauteur;
      gl.viewport(0, 0, largeur, hauteur);
    },
    ecrire(calque, bloc) {
      const { texture, unite } = calques[calque];
      calques[calque].boite = bloc ? [bloc.x, bloc.y, bloc.l, bloc.h] : [0, 0, 0, 0];
      if (!bloc || mort) return;
      gl.activeTexture(gl.TEXTURE0 + unite);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bloc.toile);
      gl.generateMipmap(gl.TEXTURE_2D);
    },
    dessiner(image, matiere, graine = 0) {
      finir();
      if (mort) return;
      const d = dpr;
      const bulle = { cx: image.cx * d, cy: image.cy * d, rayon: image.rayon * d, lisere: Math.max(0.5, image.lisere * d) };
      const fond = matiere.fond.map((canal) => canal / 255);
      const avant = calques.avant.boite.map((v) => v * d);
      const apres = calques.apres.boite.map((v) => v * d);
      gl.uniform2f(lieu('u_toile'), toile.width, toile.height);
      gl.uniform2f(lieu('u_centre'), bulle.cx, bulle.cy);
      gl.uniform1f(lieu('u_rayon'), bulle.rayon);
      gl.uniform1f(lieu('u_lisere'), bulle.lisere);
      gl.uniform3f(lieu('u_axe'), image.axe[0], image.axe[1], Math.max(1, image.axe[2] * d));
      gl.uniform2f(lieu('u_milieu'), image.axe[3] * d, image.axe[4] * d);
      gl.uniform3fv(lieu('u_teintes'), matiere.teintes.flatMap(rvb));
      gl.uniform1f(lieu('u_saturation'), matiere.saturation);
      gl.uniform1f(lieu('u_intensite'), matiere.intensite);
      gl.uniform3fv(lieu('u_fond'), fond);
      gl.uniform1f(lieu('u_force'), image.nombre);
      gl.uniform1f(lieu('u_lettre'), image.lettre);
      gl.uniform1f(lieu('u_flou'), matiere.flou * d);
      gl.uniform1f(lieu('u_graine'), graine);
      gl.uniform4fv(lieu('u_boiteAvant'), avant);
      gl.uniform4fv(lieu('u_boiteApres'), apres);

      // Clear everywhere, plain black where the bubble is nothing else, the shader for the rest.
      const bandes = decouper(bulle, toile.width, toile.height, [...(image.lettre < 0.999 ? [avant] : []), ...(image.lettre > 0.001 ? [apres] : [])]);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.SCISSOR_TEST);
      gl.clearColor(fond[0], fond[1], fond[2], 1);
      for (const { x, y, l, h, calcul } of bandes) {
        gl.scissor(x, toile.height - y - h, l, h);
        if (calcul) gl.drawArrays(gl.TRIANGLES, 0, 3);
        else gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.disable(gl.SCISSOR_TEST);
    },
    effacer() {
      if (mort) return;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
    perdu(attendre = true) {
      if (attendre) finir();
      return mort;
    },
    liberer() {
      toile.removeEventListener('webglcontextlost', perte);
      window.clearTimeout(repos);
      mort = true;
      // The context is the canvas's: it is the same one if the bench mounts again on it. A canvas
      // that has left the page (the Vitrine changes page) will not be drawn on again: its context
      // is given back now, not when the canvas is collected; a browser only keeps so many.
      window.setTimeout(() => {
        if (!toile.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext();
      }, 0);
      for (const { texture } of Object.values(calques)) gl.deleteTexture(texture);
      gl.deleteBuffer(triangle);
      gl.deleteProgram(programme);
      gl.deleteShader(sommets);
      gl.deleteShader(fragments);
    },
  };
}
