// THE MESH PEN: the helicopter's 3D landmarks and pavilions (foreign/heli/mesh3d.ts) painted on the GPU, the look kept.
//
// mesh3d's paint() fills each face flat (or in a 2x2 dither), edges it, paints its decals and cracks on it, back to
// front, over the whole silhouette inked thick: thousands of little canvas paths a frame. Here the same paint() code
// draws into a stand-in for the 2D context (the few calls it makes: paths, fills, strokes, fillRect), which turns every
// fill and stroke into triangles instead, in the same order (the painter's order IS the look: which face wins where two
// overlap), and the lot goes to the GPU in one draw. The ink under it all: each face filled in ink, and each of its edges
// a round-capped line inkW either side (a stroke with round joins, exactly), unioned. Multisampled edges, like the 2D
// canvas's own antialiasing; the dithers on the same pixel grid the canvas pattern would have had.
//
// The result's put onto the real canvas with one drawImage, at that point in its draw order (everything 2D under and
// over it layers as before). Anything wrong (no WebGL 2, the context lost) and paint() goes on the 2D way.

import { makeGl, startProgram, pollProgram, fit, type Glx, type Prog, type ProgJob } from './core';

type Ctx = CanvasRenderingContext2D;

/** The 2x2 dither patterns' two colors (mesh3d.ts ditherOf registers each it makes): the one at (0,0) and (1,1)
 *  `[1]`, the rest `[0]`. */
export const patternColors = new WeakMap<object, [string, string]>();

// ---------------------------------------------------------------------------------------------------------------
// Colors: the CSS strings paint() uses, packed RGBA (r in the low byte)

const cols = new Map<string, number>();
let scratch: CanvasRenderingContext2D | null = null;
const packRgba = (r: number, g: number, b: number, a: number) => ((r & 255) | ((g & 255) << 8) | ((b & 255) << 16) | ((Math.round(a * 255) & 255) << 24)) >>> 0;
const colorOf = (s: string): number => {
  let v = cols.get(s);
  if (v !== undefined) return v;
  let m: RegExpMatchArray | null;
  if (s[0] === '#' && s.length === 7) v = packRgba(parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), 1);
  else if ((m = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/))) v = packRgba(Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3]), m[4] === undefined ? 1 : Math.max(0, Math.min(1, +m[4])));
  else {
    // (anything else (a named color, #rgb): the canvas's own reading of it, then the above)
    scratch ??= document.createElement('canvas').getContext('2d')!;
    scratch.fillStyle = '#000000'; scratch.fillStyle = s;
    const n = String(scratch.fillStyle);
    v = n === s ? 0xff000000 : colorOf(n);
  }
  if (cols.size > 8000) cols.clear();
  cols.set(s, v);
  return v;
};

// ---------------------------------------------------------------------------------------------------------------
// The GPU side

const VS = `#version 300 es
layout(location = 0) in vec2 a_p;
layout(location = 1) in vec4 a_c;
layout(location = 2) in vec4 a_d;
uniform vec2 u_size;
flat out vec4 v_c;
flat out vec4 v_d;
void main() { v_c = a_c; v_d = a_d; gl_Position = vec4(a_p.x / u_size.x * 2.0 - 1.0, 1.0 - a_p.y / u_size.y * 2.0, 0.0, 1.0); }`;
const FS = `#version 300 es
precision highp float;
flat in vec4 v_c;
flat in vec4 v_d;
uniform float u_hc;
uniform vec4 u_pat;
out vec4 o;
void main() {
  vec4 c = v_c;
  if (v_d.a > 0.0) {
    vec2 q = floor((vec2(gl_FragCoord.x, u_hc - gl_FragCoord.y) - u_pat.xy) * u_pat.zw);
    if (mod(q.x + q.y, 2.0) < 0.5) c = v_d;
  }
  o = vec4(c.rgb * c.a, c.a);
}`;
/** The ink's edges: a round-capped line each, its coverage worked out per pixel (the stroke's own antialiasing). */
const CAP_VS = `#version 300 es
layout(location = 0) in vec2 a_k;
layout(location = 1) in vec4 a_s;
uniform vec2 u_size;
uniform float u_r;
flat out vec4 v_s;
void main() {
  vec2 d = a_s.zw - a_s.xy;
  float L = length(d);
  vec2 u = L > 1e-6 ? d / L : vec2(1.0, 0.0), n = vec2(-u.y, u.x);
  float R = u_r + 1.0;
  vec2 p = a_s.xy + u * (-R + a_k.x * (L + 2.0 * R)) + n * (a_k.y * R);
  v_s = a_s;
  gl_Position = vec4(p.x / u_size.x * 2.0 - 1.0, 1.0 - p.y / u_size.y * 2.0, 0.0, 1.0);
}`;
const CAP_FS = `#version 300 es
precision highp float;
flat in vec4 v_s;
uniform float u_hc;
uniform float u_r;
uniform vec4 u_ink;
out vec4 o;
void main() {
  vec2 p = vec2(gl_FragCoord.x, u_hc - gl_FragCoord.y), a = v_s.xy, d = v_s.zw - a;
  float l2 = dot(d, d), k = l2 > 1e-9 ? clamp(dot(p - a, d) / l2, 0.0, 1.0) : 0.0;
  float cov = clamp(u_r + 0.5 - length(p - a - d * k), 0.0, 1.0);
  o = vec4(u_ink.rgb, 1.0) * u_ink.a * cov;
}`;

interface Gpu {
  x: Glx; tri: Prog; cap: Prog; vao: WebGLVertexArrayObject; buf: WebGLBuffer; capVao: WebGLVertexArrayObject; capBuf: WebGLBuffer; inkVao: WebGLVertexArrayObject; inkBuf: WebGLBuffer;
  /** The multisampled layer it's drawn into (its size), resolved region by region into the canvas: the canvas itself
   *  isn't multisampled, so putting it on the 2D canvas never resolves (or copies) more than it has to. */
  fbo: WebGLFramebuffer; rb: WebGLRenderbuffer; rw: number; rh: number; samples: number;
}
let gpu: Gpu | null = null, failed = false;
/** Under way: the context, its two shaders building in the background (paint() goes the 2D way till they're done). */
let pending: { x: Glx; tri: ProgJob; cap: ProgJob } | null = null;
const gpuOf = (): Gpu | null => {
  if (failed) return null;
  if (gpu) { if (gpu.x.dead || gpu.x.gl.isContextLost()) { failed = true; gpu = null; } return gpu; }
  if (!pending) {
    const x0 = makeGl(800, 600, false, true);
    if (!x0) { failed = true; return null; }
    pending = { x: x0, tri: startProgram(x0.gl, VS, FS), cap: startProgram(x0.gl, CAP_VS, CAP_FS) };
    return null;
  }
  const x = pending.x;
  if (x.dead || x.gl.isContextLost()) { failed = true; return null; }
  const tri = pollProgram(pending.tri), cap = pollProgram(pending.cap);
  if (tri === false || cap === false) { failed = true; return null; }
  if (!tri || !cap) return null;
  pending = null;
  const gl = x.gl;
  const triVao = (): [WebGLVertexArrayObject, WebGLBuffer] => {
    const vao = gl.createVertexArray()!, buf = gl.createBuffer()!;
    gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 16, 8);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.UNSIGNED_BYTE, true, 16, 12);
    return [vao, buf];
  };
  const [vao, buf] = triVao(), [inkVao, inkBuf] = triVao();
  const capVao = gl.createVertexArray()!, corners = gl.createBuffer()!, capBuf = gl.createBuffer()!;
  gl.bindVertexArray(capVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, corners);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, -1, 1, -1, 1, 1, 0, -1, 1, 1, 0, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, capBuf);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 16, 0); gl.vertexAttribDivisor(1, 1);
  gl.bindVertexArray(null);
  const fbo = gl.createFramebuffer()!, rb = gl.createRenderbuffer()!;
  gpu = { x, tri, cap, vao, buf, capVao, capBuf, inkVao, inkBuf, fbo, rb, rw: 0, rh: 0, samples: Math.max(0, Math.min(4, gl.getParameter(gl.MAX_SAMPLES) as number)) };
  return gpu;
};

// ---------------------------------------------------------------------------------------------------------------
// The stand-in context: records paths, turns fills and strokes into triangles (region pixels, y down)

/** A growable list of vertices (x, y, color, dither color: 4 words each) or of ink edges (x0, y0, x1, y1). */
class Verts {
  ab = new ArrayBuffer(1 << 16); f = new Float32Array(this.ab); u = new Uint32Array(this.ab); n = 0;
  room(words: number) {
    if (this.n + words <= this.f.length) return;
    let len = this.f.length * 2; while (len < this.n + words) len *= 2;
    const ab = new ArrayBuffer(len * 4), f = new Float32Array(ab); f.set(this.f.subarray(0, this.n));
    this.ab = ab; this.f = f; this.u = new Uint32Array(ab);
  }
  v(x: number, y: number, c: number, d: number) { const i = this.n; this.f[i] = x; this.f[i + 1] = y; this.u[i + 2] = c; this.u[i + 3] = d; this.n = i + 4; }
}

export class Pen {
  // (the bits of the 2D context paint() uses)
  fillStyle: string | CanvasPattern | CanvasGradient = '#000000';
  strokeStyle: string | CanvasPattern | CanvasGradient = '#000000';
  lineWidth = 1; lineJoin: CanvasLineJoin = 'miter'; lineCap: CanvasLineCap = 'butt'; globalAlpha = 1;
  tri = new Verts(); ink = new Verts(); caps = new Verts();
  // (the path: each subpath's points (region px), whether it was closed)
  private sp: number[][] = []; private closed: boolean[] = []; private cur: number[] | null = null;
  // (the real context's transform, less the region's corner)
  a = 1; b = 0; c = 0; d = 1; e = 0; f = 0; s = 1;
  reset(T: DOMMatrix, ox: number, oy: number) {
    this.a = T.a; this.b = T.b; this.c = T.c; this.d = T.d; this.e = T.e - ox; this.f = T.f - oy; this.s = Math.sqrt(Math.abs(T.a * T.d - T.b * T.c)) || 1;
    this.tri.n = 0; this.ink.n = 0; this.caps.n = 0; this.sp.length = 0; this.closed.length = 0; this.cur = null;
    this.lineWidth = 1; this.lineJoin = 'miter'; this.lineCap = 'butt'; this.globalAlpha = 1;
  }
  save() { /* (paint() keeps no state it needs back) */ }
  restore() { /* ditto */ }
  beginPath() { this.sp.length = 0; this.closed.length = 0; this.cur = null; }
  moveTo(x: number, y: number) { this.cur = [this.a * x + this.c * y + this.e, this.b * x + this.d * y + this.f]; this.sp.push(this.cur); this.closed.push(false); }
  lineTo(x: number, y: number) { if (!this.cur) { this.moveTo(x, y); return; } this.cur.push(this.a * x + this.c * y + this.e, this.b * x + this.d * y + this.f); }
  closePath() {
    if (!this.cur) return;
    this.closed[this.closed.length - 1] = true;
    // (a new subpath from where that one started)
    const x0 = this.cur[0], y0 = this.cur[1];
    this.cur = [x0, y0]; this.sp.push(this.cur); this.closed.push(false);
  }
  private style(s: string | CanvasPattern | CanvasGradient): [number, number] {
    if (typeof s === 'string') return [colorOf(s), 0];
    const pc = patternColors.get(s);
    return pc ? [colorOf(pc[0]), colorOf(pc[1])] : [0xff000000, 0];
  }
  fill() {
    const [c, d] = this.style(this.fillStyle), T = this.tri;
    for (const p of this.sp) {
      const n = p.length >> 1;
      if (n < 3) continue;
      T.room((n - 2) * 12);
      for (let i = 1; i + 1 < n; i++) { T.v(p[0], p[1], c, d); T.v(p[i * 2], p[i * 2 + 1], c, d); T.v(p[i * 2 + 2], p[i * 2 + 3], c, d); }
    }
  }
  stroke() {
    const [c, d] = this.style(this.strokeStyle), T = this.tri, hw = (this.lineWidth * this.s) / 2;
    const seg = (x0: number, y0: number, x1: number, y1: number) => {
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
      if (L < 1e-6) return;
      const nx = (-dy / L) * hw, ny = (dx / L) * hw;
      T.room(24);
      T.v(x0 + nx, y0 + ny, c, d); T.v(x1 + nx, y1 + ny, c, d); T.v(x1 - nx, y1 - ny, c, d);
      T.v(x0 + nx, y0 + ny, c, d); T.v(x1 - nx, y1 - ny, c, d); T.v(x0 - nx, y0 - ny, c, d);
    };
    // (a wide line's joins filled in: a square the line's width at each bend; a thin one's are lost under its neighbors)
    const join = (x: number, y: number) => { T.room(24); T.v(x - hw, y - hw, c, d); T.v(x + hw, y - hw, c, d); T.v(x + hw, y + hw, c, d); T.v(x - hw, y - hw, c, d); T.v(x + hw, y + hw, c, d); T.v(x - hw, y + hw, c, d); };
    for (let k = 0; k < this.sp.length; k++) {
      const p = this.sp[k], n = p.length >> 1;
      if (n < 2) continue;
      for (let i = 0; i + 1 < n; i++) seg(p[i * 2], p[i * 2 + 1], p[i * 2 + 2], p[i * 2 + 3]);
      if (this.closed[k]) seg(p[n * 2 - 2], p[n * 2 - 1], p[0], p[1]);
      if (hw >= 1.25) { for (let i = 1; i + 1 < n; i++) join(p[i * 2], p[i * 2 + 1]); if (this.closed[k]) { join(p[0], p[1]); join(p[n * 2 - 2], p[n * 2 - 1]); } }
    }
  }
  fillRect(x: number, y: number, w: number, h: number) {
    const [c, d] = this.style(this.fillStyle), T = this.tri;
    const P = (px: number, py: number): [number, number] => [this.a * px + this.c * py + this.e, this.b * px + this.d * py + this.f];
    const p0 = P(x, y), p1 = P(x + w, y), p2 = P(x + w, y + h), p3 = P(x, y + h);
    T.room(24);
    T.v(p0[0], p0[1], c, d); T.v(p1[0], p1[1], c, d); T.v(p2[0], p2[1], c, d);
    T.v(p0[0], p0[1], c, d); T.v(p2[0], p2[1], c, d); T.v(p3[0], p3[1], c, d);
  }
  /** A face inked (under everything): filled, and each edge a line inkW either side, round at the ends. */
  inkPoly(pts: { x: number; y: number }[]) {
    const n = pts.length;
    if (n < 2) return;
    const I = this.ink, C = this.caps, X = (q: { x: number; y: number }) => this.a * q.x + this.c * q.y + this.e, Y = (q: { x: number; y: number }) => this.b * q.x + this.d * q.y + this.f;
    if (n >= 3) { I.room((n - 2) * 12); for (let i = 1; i + 1 < n; i++) { I.v(X(pts[0]), Y(pts[0]), 0, 0); I.v(X(pts[i]), Y(pts[i]), 0, 0); I.v(X(pts[i + 1]), Y(pts[i + 1]), 0, 0); } }
    C.room(n * 4);
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; const k = C.n; C.f[k] = X(p); C.f[k + 1] = Y(p); C.f[k + 2] = X(q); C.f[k + 3] = Y(q); C.n = k + 4; }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// One paint() through it

const pen = new Pen();
let region = { ox: 0, oy: 0, w: 0, h: 0 }, target: Ctx | null = null, patOrg = [0, 0, 1, 1];

/** Starts a paint into `c` over the user-space box (x0, y0)-(x1, y1) (the faces' bounds, the ink's margin in): the pen
 *  to paint with, or null (the 2D way then). An empty region on the canvas: a pen that draws nothing. */
export const beginMesh = (c: Ctx, x0: number, y0: number, x1: number, y1: number): Pen | null => {
  if (!isFinite(x0) || !isFinite(y0) || !isFinite(x1) || !isFinite(y1)) return null;
  const G = gpuOf();
  if (!G) return null;
  const T = c.getTransform();
  const xs = [T.a * x0 + T.c * y0, T.a * x1 + T.c * y0, T.a * x1 + T.c * y1, T.a * x0 + T.c * y1].map(v => v + T.e);
  const ys = [T.b * x0 + T.d * y0, T.b * x1 + T.d * y0, T.b * x1 + T.d * y1, T.b * x0 + T.d * y1].map(v => v + T.f);
  const cw = c.canvas.width, ch = c.canvas.height;
  const ox = Math.max(0, Math.floor(Math.min(...xs))), oy = Math.max(0, Math.floor(Math.min(...ys)));
  const ex = Math.min(cw, Math.ceil(Math.max(...xs))), ey = Math.min(ch, Math.ceil(Math.max(...ys)));
  const w = Math.max(0, ex - ox), h = Math.max(0, ey - oy);
  if (w > 4096 || h > 4096) return null;
  region = { ox, oy, w, h }; target = c;
  pen.reset(T, ox, oy);
  // (the dither's grid: the canvas pattern's, which sits at the transform's origin, a pattern pixel its scale)
  patOrg = [T.e - ox, T.f - oy, 1 / (Math.abs(T.a) || 1), 1 / (Math.abs(T.d) || 1)];
  return pen;
};

/** Draws what's been painted (ink `ink`, its lines `inkW` (user units) either side) and puts it onto the canvas. False
 *  if the GPU let it down (nothing's been drawn: the caller paints it the 2D way). */
export const endMesh = (ink: string, inkW: number): boolean => {
  const c = target!, { ox, oy, w, h } = region;
  target = null;
  if (w <= 0 || h <= 0) return true;
  const G = gpuOf();
  if (!G) return false;
  try {
    const { x, tri, cap } = G, gl = x.gl;
    fit(x, w, h);
    if (G.rw < w || G.rh < h) {
      // (the multisampled layer grown to fit, in steps)
      G.rw = Math.max(G.rw, Math.ceil(w / 128) * 128); G.rh = Math.max(G.rh, Math.ceil(h / 128) * 128);
      gl.bindRenderbuffer(gl.RENDERBUFFER, G.rb);
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, G.samples, gl.RGBA8, G.rw, G.rh);
      gl.bindFramebuffer(gl.FRAMEBUFFER, G.fbo);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, G.rb);
    }
    // (drawn into the layer's bottom-left w x h, the region's top row its top)
    const hc = h;
    gl.bindFramebuffer(gl.FRAMEBUFFER, G.fbo);
    gl.viewport(0, 0, w, h);
    gl.enable(gl.SCISSOR_TEST); gl.scissor(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
    gl.enable(gl.BLEND);
    // (the ink first: a union (max), its edges' own soft rims never doubling up)
    if (pen.caps.n || pen.ink.n) {
      const ic = colorOf(ink), r = ((ic & 255) / 255), g = (((ic >> 8) & 255) / 255), b = (((ic >> 16) & 255) / 255), a = ((ic >>> 24) / 255);
      gl.blendEquation(gl.MAX); gl.blendFunc(gl.ONE, gl.ONE);
      if (pen.ink.n) {
        // (its faces filled: the color's in the ink's vertices)
        const I = pen.ink;
        for (let i = 0; i < I.n; i += 4) I.u[i + 2] = ic;
        gl.useProgram(tri.p);
        gl.uniform2f(tri.u('u_size'), w, h); gl.uniform1f(tri.u('u_hc'), hc); gl.uniform4f(tri.u('u_pat'), 0, 0, 1, 1);
        gl.bindVertexArray(G.inkVao); gl.bindBuffer(gl.ARRAY_BUFFER, G.inkBuf);
        gl.bufferData(gl.ARRAY_BUFFER, I.f.subarray(0, I.n), gl.STREAM_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, I.n >> 2);
      }
      if (pen.caps.n && inkW > 0) {
        gl.useProgram(cap.p);
        gl.uniform2f(cap.u('u_size'), w, h); gl.uniform1f(cap.u('u_hc'), hc); gl.uniform1f(cap.u('u_r'), inkW * pen.s); gl.uniform4f(cap.u('u_ink'), r, g, b, a);
        gl.bindVertexArray(G.capVao); gl.bindBuffer(gl.ARRAY_BUFFER, G.capBuf);
        gl.bufferData(gl.ARRAY_BUFFER, pen.caps.f.subarray(0, pen.caps.n), gl.STREAM_DRAW);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, pen.caps.n >> 2);
      }
    }
    // (then every face, edge, decal and crack, in the painter's order)
    if (pen.tri.n) {
      gl.blendEquation(gl.FUNC_ADD); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(tri.p);
      gl.uniform2f(tri.u('u_size'), w, h); gl.uniform1f(tri.u('u_hc'), hc); gl.uniform4f(tri.u('u_pat'), patOrg[0], patOrg[1], patOrg[2], patOrg[3]);
      gl.bindVertexArray(G.vao); gl.bindBuffer(gl.ARRAY_BUFFER, G.buf);
      gl.bufferData(gl.ARRAY_BUFFER, pen.tri.f.subarray(0, pen.tri.n), gl.STREAM_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, pen.tri.n >> 2);
    }
    gl.bindVertexArray(null);
    // (resolved into the canvas's bottom-left w x h: a multisample resolve has to land on the same rectangle; that's
    // the bottom strip of the canvas's picture)
    const sy = x.cv.height - h;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, G.fbo);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (gl.isContextLost() || x.dead) { failed = true; return false; }
    const T = c.getTransform();
    c.setTransform(1, 0, 0, 1, 0, 0);
    if ('transferToImageBitmap' in x.cv) { const bm = x.cv.transferToImageBitmap(); c.drawImage(bm, 0, sy, w, h, ox, oy, w, h); bm.close(); }
    else c.drawImage(x.cv, 0, sy, w, h, ox, oy, w, h);
    c.setTransform(T);
    return true;
  } catch (e) {
    console.warn('[gl] mesh:', e);
    failed = true;
    return false;
  }
};
