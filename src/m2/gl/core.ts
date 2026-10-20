// THE GPU HELPER: the few software-3D spots (the helicopter's Mode 7 park floor and its 3D landmarks and pavilions,
// the broomstick deathmatch's Mode 7 floor) drawn with WebGL 2 instead of pixel by pixel on the CPU, the look kept.
//
// Each user gets a small WebGL canvas of its own (offscreen: never in the page), renders into it, and the result goes
// onto the game's 2D canvas with one drawImage at its place in the draw order (so the 2D sprites, the HUD, the effects
// all layer as they did). Nothing here is required: no WebGL 2 (an old card, a blocklisted driver), a shader that won't
// build, or the context lost (a driver reset) and the caller's own software path draws it, unchanged.
//
// (?nogl on a dev/perf start turns it all off: the software path, for comparing the two.)

export type GL = WebGL2RenderingContext;

/** Off for the session: no WebGL 2, or `?nogl`. */
let off: boolean | null = null;
const allowed = () => {
  if (off === null) {
    off = typeof document === 'undefined' || typeof WebGL2RenderingContext === 'undefined';
    try { if (!off && import.meta.env.DEV && new URLSearchParams(location.search).has('nogl')) off = true; } catch { /* no location */ }
  }
  return !off;
};

/** One user's WebGL canvas: `dead` once its context is lost (or anything in it failed): the caller goes back to software
 *  for good. */
export interface Glx { cv: HTMLCanvasElement | OffscreenCanvas; gl: GL; dead: boolean }

/** A WebGL 2 canvas (w x h to start), or null (the software path then). `aa`: multisampled edges (the meshes: the 2D
 *  canvas's own antialiasing matched); off for the floors (each pixel its own color, crisp). */
export const makeGl = (w: number, h: number, aa: boolean, offscreen = false): Glx | null => {
  if (!allowed()) return null;
  try {
    // (offscreen: its frames handed over as ImageBitmaps (transferToImageBitmap), no copy made to put one down)
    const cv: HTMLCanvasElement | OffscreenCanvas = offscreen && typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
    cv.width = Math.max(1, w); cv.height = Math.max(1, h);
    const gl = cv.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: aa, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' }) as GL | null;
    if (!gl) return null;
    const x: Glx = { cv, gl, dead: false };
    (cv as HTMLCanvasElement).addEventListener('webglcontextlost', e => { e.preventDefault(); x.dead = true; });
    return x;
  } catch {
    return null;
  }
};

/** A shader program from its two sources (GLSL ES 3.00), its uniforms' locations looked up as asked for; null if it
 *  won't build (logged once: the software path takes over). */
export interface Prog { p: WebGLProgram; u: (name: string) => WebGLUniformLocation | null }
export const program = (gl: GL, vs: string, fs: string): Prog | null => {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) { console.warn('[gl] shader:', gl.getShaderInfoLog(s)); gl.deleteShader(s); return null; }
    return s;
  };
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) { console.warn('[gl] link:', gl.getProgramInfoLog(p)); return null; }
  const locs = new Map<string, WebGLUniformLocation | null>();
  return { p, u: name => { let l = locs.get(name); if (l === undefined) { l = gl.getUniformLocation(p, name); locs.set(name, l); } return l; } };
};

/** A shader program being built in the background: asking whether one's built blocks until it is (a big shader
 *  takes the GPU's compiler most of a second), so it's started, the software path draws meanwhile, and it's asked
 *  after only once it says it's done (KHR_parallel_shader_compile), or failing that a second on. */
export interface ProgJob { gl: GL; vs: string; fs: string; p: WebGLProgram | null; ext: boolean; t0: number; out: Prog | null | false }
export const startProgram = (gl: GL, vs: string, fs: string): ProgJob => {
  const ext = !!gl.getExtension('KHR_parallel_shader_compile');
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const p = gl.createProgram()!;
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  return { gl, vs, fs, p, ext, t0: performance.now(), out: null };
};
/** The program once it's built (null: not yet; false: it won't build). */
export const pollProgram = (j: ProgJob): Prog | null | false => {
  if (j.out !== null) return j.out;
  const gl = j.gl;
  // (0x91B1: COMPLETION_STATUS_KHR)
  if (j.ext ? !gl.getProgramParameter(j.p!, 0x91b1) : performance.now() - j.t0 < 1000) return null;
  if (!gl.getProgramParameter(j.p!, gl.LINK_STATUS)) {
    // (built again the plain way, for its error in the log)
    if (!gl.isContextLost()) program(gl, j.vs, j.fs);
    return (j.out = false);
  }
  const p = j.p!, locs = new Map<string, WebGLUniformLocation | null>();
  return (j.out = { p, u: name => { let l = locs.get(name); if (l === undefined) { l = gl.getUniformLocation(p, name); locs.set(name, l); } return l; } });
};

/** A texture sampled pixel for pixel (nearest, clamped), its levels as given (RGBA8 or R32F). */
export const texture = (gl: GL) => {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
};
/** A chain of square RGBA levels (each a Uint32Array of packed 0xAABBGGRR, `n` across the top one) into `t`'s mip
 *  levels (read with texelFetch: each level exactly as made, no filtering). */
export const uploadLevels = (gl: GL, t: WebGLTexture, levels: Uint32Array[], n: number) => {
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, levels.length - 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
  levels.forEach((m, l) => { const s = n >> l; gl.texImage2D(gl.TEXTURE_2D, l, gl.RGBA8, s, s, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(m.buffer, m.byteOffset, s * s * 4)); });
};
/** A patch of one level re-sent (x, y, w, h in that level's texels) from its whole array (`n` across that level). */
export const uploadPatch = (gl: GL, t: WebGLTexture, level: number, m: Uint32Array, n: number, x: number, y: number, w: number, h: number) => {
  if (w <= 0 || h <= 0) return;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_ROW_LENGTH, n);
  gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, x);
  gl.pixelStorei(gl.UNPACK_SKIP_ROWS, y);
  gl.texSubImage2D(gl.TEXTURE_2D, level, x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(m.buffer, m.byteOffset, m.length * 4));
  gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
  gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
  gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
};
/** A float table (one channel, w x h) into `t` (made or remade at that size). */
export const uploadFloats = (gl: GL, t: WebGLTexture, data: Float32Array, w: number, h: number, sub = false) => {
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
  if (sub) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, h, gl.RED, gl.FLOAT, data);
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, w, h, 0, gl.RED, gl.FLOAT, data);
};

/** A full-screen triangle's vertex shader (the floors: every pixel worked out in the fragment shader). */
export const FULL_VS = `#version 300 es
layout(location = 0) in vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }`;
/** The one big triangle covering the viewport, bound to attribute 0. */
export const fullTri = (gl: GL) => {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const b = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  return vao;
};

/** Makes sure the canvas is at least w x h (grown in steps, never shrunk: a resize throws its buffer away). */
export const fit = (x: Glx, w: number, h: number) => {
  if (x.cv.width >= w && x.cv.height >= h) return;
  x.cv.width = Math.max(x.cv.width, Math.ceil(w / 64) * 64);
  x.cv.height = Math.max(x.cv.height, Math.ceil(h / 64) * 64);
};
