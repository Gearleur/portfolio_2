import { FS_FLUX, FS_PAPIER, FS_VERRE, SOMMET } from './shaders';
import { BASE, lumiere, placeVitre } from './vitre';

/*
 * The WebGL 2 side of Synthèse de réunions' thumbnail: the paper, made once
 * per size; then, every frame, the flowing gradient at a quarter of the
 * resolution and the glass on screen. Lengths are px of a 518 px card.
 */

const VERRE = {
  loupe: 1.25,
  epaisseur: 18, // the bevel
  indice: 1.4,
  deviation: 40, // the deviation at the very edge
  prisme: 4,
  absorption: 0.4,
  fresnel: [26, 0.2, 0.18] as const, // reach, hardness, strength
  eclat: [28, 0.2, 0.9, 0.5] as const, // reach, hardness, strength, convergence
  oppose: 0.8,
  normale: 0.85, // the weight the studio draws from its normal's length
  ombre: [6, 16, 0.13] as const, // offset, spread, strength
  caustique: 0.1,
  flouBord: 3, // the paper softened at the edge
  rayon: 0.4, // of the height
  rondeur: 5,
};

type Programme = {
  utilise: () => void;
  f: (nom: string, ...v: number[]) => void;
  i: (nom: string, v: number) => void;
};

type Cible = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };

export type Verre = {
  /** Sizes the canvas's work for a picture of W × H px at this pixel ratio (and makes the paper). */
  dimensionner: (W: number, H: number, dpr: number) => void;
  /** Draws the frame at t seconds. */
  rendre: (t: number) => void;
  liberer: () => void;
};

function programme(gl: WebGL2RenderingContext, fs: string): Programme {
  const p = gl.createProgram();
  for (const [type, src] of [
    [gl.VERTEX_SHADER, SOMMET],
    [gl.FRAGMENT_SHADER, fs],
  ] as const) {
    const s = gl.createShader(type);
    if (!s) throw new Error('shader');
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    gl.attachShader(p, s);
  }
  gl.bindAttribLocation(p, 0, 'a_pos');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'programme');
  const lieux = new Map<string, WebGLUniformLocation | null>();
  const lieu = (nom: string) => {
    if (!lieux.has(nom)) lieux.set(nom, gl.getUniformLocation(p, nom));
    return lieux.get(nom) ?? null;
  };
  return {
    utilise: () => gl.useProgram(p),
    f: (nom, ...v) => {
      const l = lieu(nom);
      if (v.length === 1) gl.uniform1f(l, v[0]);
      else if (v.length === 2) gl.uniform2f(l, v[0], v[1]);
      else if (v.length === 3) gl.uniform3f(l, v[0], v[1], v[2]);
      else gl.uniform4f(l, v[0], v[1], v[2], v[3]);
    },
    i: (nom, v) => gl.uniform1i(lieu(nom), v),
  };
}

function cible(gl: WebGL2RenderingContext, w: number, h: number, mip = false): Cible {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  if (mip) {
    const ani = gl.getExtension('EXT_texture_filter_anisotropic');
    if (ani) gl.texParameterf(gl.TEXTURE_2D, ani.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(ani.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  }
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return { tex, fbo, w, h };
}

/** The glass on this canvas, or null without WebGL 2 (the poster then stays). */
export function creerVerre(canvas: HTMLCanvasElement): Verre | null {
  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false, depth: false, stencil: false });
  if (!gl || gl.isContextLost()) return null;

  let flux: Programme;
  let papier: Programme;
  let verre: Programme;
  try {
    flux = programme(gl, FS_FLUX);
    papier = programme(gl, FS_PAPIER);
    verre = programme(gl, FS_VERRE);
  } catch {
    return null;
  }

  const tri = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tri);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  let W = 0;
  let H = 0;
  let dpr = 1;
  let echelle = 1;
  let texel = 2;
  let cFlux: Cible | null = null;
  let cPapier: Cible | null = null;

  const libere = (c: Cible | null) => {
    if (!c) return;
    gl.deleteFramebuffer(c.fbo);
    gl.deleteTexture(c.tex);
  };

  const forme = (prog: Programme) => {
    const v = placeVitre(W, H);
    prog.f('u_centre', W / 2, H / 2);
    prog.f('u_demi', v.w / 2, v.h / 2);
    prog.f('u_rayon', v.h * VERRE.rayon);
    prog.f('u_rondeur', VERRE.rondeur);
  };

  return {
    dimensionner(w, h, d) {
      libere(cFlux);
      libere(cPapier);
      W = w;
      H = h;
      dpr = d;
      echelle = W / BASE;
      cFlux = cible(gl, Math.ceil((W * dpr) / 4), Math.ceil((H * dpr) / 4));

      // the paper, once for this size, twice as fine as the screen (3,072 texels wide at most)
      texel = Math.min(dpr * 2, 3072 / W);
      cPapier = cible(gl, Math.round(W * texel), Math.round(H * texel), true);
      gl.bindFramebuffer(gl.FRAMEBUFFER, cPapier.fbo);
      gl.viewport(0, 0, cPapier.w, cPapier.h);
      papier.utilise();
      papier.f('u_taille', W, H);
      papier.f('u_texel', texel);
      papier.f('u_echelle', echelle);
      papier.f('u_coeur', W / 2, H / 2);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindTexture(gl.TEXTURE_2D, cPapier.tex);
      gl.generateMipmap(gl.TEXTURE_2D);
    },

    rendre(t) {
      if (!cFlux || !cPapier) return;

      // 1. the current
      gl.bindFramebuffer(gl.FRAMEBUFFER, cFlux.fbo);
      gl.viewport(0, 0, cFlux.w, cFlux.h);
      flux.utilise();
      flux.f('u_taille', W, H);
      flux.f('u_temps', t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // 2. the glass and the background, on screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, Math.round(W * dpr), Math.round(H * dpr));
      verre.utilise();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, cFlux.tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, cPapier.tex);
      verre.i('u_flux', 0);
      verre.i('u_papier', 1);
      verre.f('u_taille', W, H);
      verre.f('u_dpr', dpr);
      verre.f('u_echelle', echelle);
      const a = lumiere(t);
      verre.f('u_lumiere', Math.cos(a), Math.sin(a));
      verre.f('u_texel', texel);
      forme(verre);
      verre.f('u_ombre', VERRE.ombre[0] * echelle, VERRE.ombre[1], VERRE.ombre[2]);
      verre.f('u_caustique', VERRE.caustique);
      verre.f('u_flouBord', VERRE.flouBord);
      verre.f('u_loupe', VERRE.loupe);
      verre.f('u_epaisseur', VERRE.epaisseur);
      verre.f('u_indice', VERRE.indice);
      verre.f('u_deviation', VERRE.deviation);
      verre.f('u_prisme', VERRE.prisme);
      verre.f('u_absorption', VERRE.absorption);
      verre.f('u_normale', VERRE.normale);
      verre.f('u_fresnel', ...VERRE.fresnel);
      verre.f('u_eclat', ...VERRE.eclat);
      verre.f('u_oppose', VERRE.oppose);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    liberer() {
      libere(cFlux);
      libere(cPapier);
      cFlux = null;
      cPapier = null;
      gl.deleteBuffer(tri);
    },
  };
}
