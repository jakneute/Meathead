// THE CLEARING'S LOOP ON THE GPU (orbit.ts: the walk round the temple and Artie's fight): its Mode 7 floor and the far
// bands round the loop (the peaks, the hills, the near ridge, the jungle's canopy) drawn with WebGL 2, the look kept.
//
// Two passes, each one full-screen draw at the canvas's own pixels, put down with one drawImage where the 2D layers
// went: the peaks and the hills (under the park out past them, far.ts, still 2D), then the near ridge, the floor over
// it and the canopy over that. Everything else out there (the sky, the sun, the clouds, the trees, the temple) stays 2D.
//
//   - The bands: the CPU still puts each band's crest and foot through the loop's camera (proj), 720 points round it,
//     sorted across the screen exactly as the 2D shape's outline goes, and hands the shader that outline's top and foot
//     at every pixel column (a little float texture); the shader stacks the band's layers down from the crest (the lit
//     crest, each step a row of dither then solid, on the 2D pattern's own 2-unit checker), the edges smoothed by how
//     much of the pixel each covers (as the canvas's antialiasing has it).
//   - The floor: the 2D floor's per-cell rule (the quarter-size grid, blown up chunky) worked out per cell in the
//     shader, its random rolls tabled from the software path's own hash, the haze in the same distance steps.
//
// Not there (no WebGL 2, ?nogl, a shader that won't build yet or at all, a lost context, a skewed transform): the
// software path, unchanged.

import { makeGl, startProgram, pollProgram, texture, uploadFloats, fullTri, fit, FULL_VS, type Glx, type Prog, type ProgJob } from '../../gl/core';

type Ctx = CanvasRenderingContext2D;

/** A band's outline (orbit.ts bandShape): its points sorted across the screen (x, crest y, foot y in user units), and
 *  its layers going down from the crest (dy under it, the fill, dithered or solid). */
export interface BandShape { n: number; xs: Float64Array; tops: Float64Array; bases: Float64Array; L: { dy: number; col: string; dither: boolean }[] }
/** The floor's camera (orbit.ts drawFloor): the horizon row, the eye on the ground, its right and forward, the haze. */
export interface FloorEye { hy: number; cx: number; cz: number; rx: number; rz: number; fx: number; fz: number; haze: number[] }
/** The loop's fixed numbers the floor's rule uses. */
export interface FloorConsts {
  W: number; H: number; F: number; HC: number; PR: number; BASE: number; TD: number; WDx: number; WDz: number; WEx: number; WEz: number;
  WING_U0: number; WING_W: number; A_START: number; WING_A: number;
  GRASS0: number[]; GRASS1: number[]; GRASS_DOT: number[]; GRASS_DK: number[]; DIRT: number[]; DIRT_DK: number[]; FOOT: number[]; JUNGLE: number[];
  hash2: (a: number, b: number) => number;
}

const MAXL = 10;
/** The hash table's reach: cells -HS..HS-1 each way (the floor's non-jungle part stays within +-35). */
const HS = 40;

const g = (n: number) => { const s = String(n); return /[.e]/.test(s) ? s : `${s}.0`; };
const v3 = (c: number[]) => `vec3(${g(c[0])}, ${g(c[1])}, ${g(c[2])})`;

const fragment = (K: FloorConsts) => `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform sampler2D u_cols;  // W x 6: each slot's crest y (row 2s) and foot y (row 2s+1), user units; none: 1e9
uniform sampler2D u_hash;  // ${HS * 2} x ${HS * 2}: hash2(a, b) at (a + ${HS}, b + ${HS})
uniform vec4 u_v;          // device W, H, x scale, y scale
uniform vec4 u_L[${3 * MAXL}];   // layer: dy, dithered
uniform vec4 u_C[${3 * MAXL}];   // layer color (premultiplied)
uniform ivec4 u_n;         // layers in slots 0, 1, 2; the floor on
uniform vec4 u_f0;         // hy, eye x, eye z
uniform vec4 u_f1;         // rx, rz, fx, fz
uniform vec3 u_haze;
out vec4 o;

vec4 band(int s, int n, int gx, float py, bool cell) {
  vec4 acc = vec4(0.0);
  if (n == 0) return acc;
  float top = texelFetch(u_cols, ivec2(gx, 2 * s), 0).r;
  if (top > 1e8) return acc;
  float base = texelFetch(u_cols, ivec2(gx, 2 * s + 1), 0).r + 3.0;
  float bc = clamp(base * u_v.w - py, 0.0, 1.0);
  if (bc <= 0.0) return acc;
  for (int j = 0; j < ${MAXL}; j++) {
    if (j >= n) break;
    vec4 L = u_L[s * ${MAXL} + j];
    float cv = clamp(py + 1.0 - (top + L.x) * u_v.w, 0.0, 1.0);
    if (L.y > 0.5 && !cell) cv = 0.0;
    if (cv <= 0.0) continue;
    vec4 C = u_C[s * ${MAXL} + j] * (cv * bc);
    acc = C + acc * (1.0 - C.a);
  }
  return acc;
}

vec3 floorAt(int rxi, float sy) {
  float Z = ${g(K.F * K.HC)} / sy;
  float fog = Z > 5200.0 ? 0.75 : Z > 3800.0 ? 0.5 : Z > 2900.0 ? 0.25 : 0.0;
  float X = ((float(rxi) * 4.0 + 2.0 - ${g(K.W / 2)}) * Z) / ${g(K.F)};
  float px = u_f0.y + u_f1.x * X + u_f1.z * Z, pz = u_f0.z + u_f1.y * X + u_f1.w * Z;
  float r = sqrt(px * px + pz * pz);
  vec3 col;
  if (r > ${g(K.PR + 470)}) col = ${v3(K.JUNGLE)};
  else if (abs(px) < ${g(K.BASE + 12)} && abs(pz + ${g(K.TD)}) < ${g(K.BASE + 12)}) col = ${v3(K.FOOT)};
  else {
    float wu = px * ${g(K.WDx)} + pz * ${g(K.WDz)}, ws = px * ${g(K.WEx)} + pz * ${g(K.WEz)};
    if (wu > ${g(K.WING_U0 - 12)} && wu < ${g(K.PR + 252)} && abs(ws) < ${g(K.WING_W / 2 + 12)}) col = ${v3(K.FOOT)};
    else {
      float off = abs(r - ${g(K.PR)});
      float a = atan(px, pz);
      bool path = a > ${g(K.A_START - 0.15)} && a < ${g(K.WING_A + 0.1)};
      if (off < 70.0 && path) col = off > 44.0 && off < 52.0 ? ${v3(K.DIRT_DK)} : ${v3(K.DIRT)};
      else {
        col = ((int(floor(px / 90.0)) + int(floor(pz / 90.0))) & 1) == 1 ? ${v3(K.GRASS1)} : ${v3(K.GRASS0)};
        ivec2 hc = clamp(ivec2(int(floor(px / 30.0)), int(floor(pz / 30.0))) + ${HS}, 0, ${HS * 2 - 1});
        float hh = texelFetch(u_hash, hc, 0).r;
        if (hh > 0.86) col = ${v3(K.GRASS_DOT)};
        else if (hh < 0.1) col = ${v3(K.GRASS_DK)};
        else if (off < 84.0 && path && hh < 0.5) col = ${v3(K.GRASS_DK)};
      }
    }
  }
  return floor(col + (u_haze - col) * fog + 0.5) / 255.0;
}

void main() {
  int gx = int(gl_FragCoord.x);
  float py = u_v.y - 1.0 - floor(gl_FragCoord.y);
  float ux = (float(gx) + 0.5) / u_v.z, uy = (py + 0.5) / u_v.w;
  bool cell = ((int(floor(ux * 0.5)) + int(floor(uy * 0.5))) & 1) == 0;
  vec4 acc = band(0, u_n.x, gx, py, cell);
  vec4 b1 = band(1, u_n.y, gx, py, cell);
  acc = b1 + acc * (1.0 - b1.a);
  if (u_n.w == 1) {
    int ry = int(floor(uy / 4.0));
    int row0 = max(0, int(floor(u_f0.x / 4.0)) + 1);
    float sy = float(ry) * 4.0 + 2.0 - u_f0.x;
    if (ry >= row0 && ry < ${Math.floor(K.H / 4)} && sy > 0.0) acc = vec4(floorAt(int(floor(ux / 4.0)), sy), 1.0);
  }
  vec4 b2 = band(2, u_n.z, gx, py, cell);
  o = b2 + acc * (1.0 - b2.a);
}`;

/** A CSS color as premultiplied RGBA 0..1 (worked out once each, through a canvas: whatever form it's in). */
const colMemo = new Map<string, number[]>();
let colCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;
const rgbaOf = (col: string): number[] => {
  let v = colMemo.get(col);
  if (v) return v;
  let r = 0, gg = 0, b = 0, a = 1;
  const hex = /^#([0-9a-f]{6})$/i.exec(col);
  if (hex) { const n = parseInt(hex[1], 16); r = n >> 16; gg = (n >> 8) & 255; b = n & 255; }
  else {
    if (!colCtx) colCtx = document.createElement('canvas').getContext('2d');
    const c = colCtx!;
    c.fillStyle = '#000'; c.fillStyle = col;
    const s = String(c.fillStyle), h2 = /^#([0-9a-f]{6})$/i.exec(s), m = /rgba?\(([^)]+)\)/.exec(s);
    if (h2) { const n = parseInt(h2[1], 16); r = n >> 16; gg = (n >> 8) & 255; b = n & 255; }
    else if (m) { const p = m[1].split(',').map(t => parseFloat(t)); [r, gg, b] = p; a = p.length > 3 ? p[3] : 1; }
  }
  v = [(r / 255) * a, (gg / 255) * a, (b / 255) * a, a];
  if (colMemo.size > 4096) colMemo.clear();
  colMemo.set(col, v);
  return v;
};

export class OrbitGl {
  private x: Glx | null = null; private P: Prog | null = null; private job: ProgJob | null = null; private failed = false;
  private vao: WebGLVertexArrayObject | null = null; private tCols: WebGLTexture | null = null; private tHash: WebGLTexture | null = null;
  private cols = new Float32Array(0); private colsW = 0;
  private L = new Float32Array(3 * MAXL * 4); private C = new Float32Array(3 * MAXL * 4);
  constructor(private K: FloorConsts) {}

  /** Whether it can draw (made on first ask; its shader built in the background, the software path meanwhile). */
  ok() {
    if (this.failed) return false;
    if (this.x && (this.x.dead || this.x.gl.isContextLost())) { this.failed = true; this.x = null; return false; }
    if (this.P) return true;
    try {
      if (!this.x) {
        const x = makeGl(this.K.W * 2, this.K.H * 2, false, true);
        if (!x) { this.failed = true; return false; }
        this.x = x; this.job = startProgram(x.gl, FULL_VS, fragment(this.K));
        return false;
      }
      const P = pollProgram(this.job!);
      if (P === false) { this.failed = true; return false; }
      if (!P) return false;
      const gl = this.x.gl, N = HS * 2, hs = new Float32Array(N * N);
      for (let b = 0; b < N; b++) for (let a = 0; a < N; a++) hs[b * N + a] = this.K.hash2(a - HS, b - HS);
      this.tHash = texture(gl); uploadFloats(gl, this.tHash, hs, N, N);
      this.tCols = texture(gl);
      this.vao = fullTri(gl); this.P = P;
      return true;
    } catch (e) {
      console.warn('[gl] clearing:', e);
      this.failed = true; return false;
    }
  }

  /** One pass onto `c` over the whole view (0, 0 .. W, H in its user units): bands `under` (up to two), the floor if
   *  `eye`, the band `over` on top. False: not drawn (the software path then). */
  draw(c: Ctx, under: BandShape[], eye: FloorEye | null, over: BandShape | null) {
    const m = c.getTransform();
    if (Math.abs(m.b) > 1e-9 || Math.abs(m.c) > 1e-9 || m.a <= 0 || m.d <= 0) return false;
    if (!this.ok()) return false;
    const K = this.K, x = this.x!, gl = x.gl, P = this.P!;
    const Wd = Math.round(K.W * m.a), Hd = Math.round(K.H * m.d);
    try {
      // (each slot's outline at every pixel column)
      if (this.colsW !== Wd) { this.colsW = Wd; this.cols = new Float32Array(Wd * 6); gl.bindTexture(gl.TEXTURE_2D, this.tCols); gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, Wd, 6, 0, gl.RED, gl.FLOAT, null); }
      const slots: (BandShape | null)[] = [under[0] ?? null, under[1] ?? null, over];
      const n = [0, 0, 0];
      slots.forEach((s, k) => {
        const T = this.cols.subarray(Wd * 2 * k, Wd * 2 * k + Wd), B = this.cols.subarray(Wd * (2 * k + 1), Wd * (2 * k + 2));
        T.fill(1e9);
        if (!s || s.n < 2) return;
        n[k] = Math.min(MAXL, s.L.length);
        const { xs, tops, bases } = s;
        let j = 0;
        const x0 = xs[0], x1 = xs[s.n - 1];
        for (let gx = 0; gx < Wd; gx++) {
          const ux = (gx + 0.5) / m.a;
          if (ux < x0 || ux > x1) continue;
          while (j < s.n - 2 && xs[j + 1] < ux) j++;
          const dx = xs[j + 1] - xs[j], t = dx > 1e-9 ? (ux - xs[j]) / dx : 0;
          T[gx] = tops[j] + (tops[j + 1] - tops[j]) * t;
          B[gx] = bases[j] + (bases[j + 1] - bases[j]) * t;
        }
        s.L.slice(0, MAXL).forEach((ly, i) => {
          const o = (k * MAXL + i) * 4, cc = rgbaOf(ly.col);
          this.L[o] = ly.dy; this.L[o + 1] = ly.dither ? 1 : 0;
          this.C[o] = cc[0]; this.C[o + 1] = cc[1]; this.C[o + 2] = cc[2]; this.C[o + 3] = cc[3];
        });
      });
      uploadFloats(gl, this.tCols!, this.cols, Wd, 6, true);
      fit(x, Wd, Hd);
      gl.viewport(0, 0, Wd, Hd);
      gl.disable(gl.BLEND);
      gl.useProgram(P.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tCols); gl.uniform1i(P.u('u_cols'), 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.tHash); gl.uniform1i(P.u('u_hash'), 1);
      gl.uniform4f(P.u('u_v'), Wd, Hd, m.a, m.d);
      gl.uniform4fv(P.u('u_L'), this.L);
      gl.uniform4fv(P.u('u_C'), this.C);
      gl.uniform4i(P.u('u_n'), n[0], n[1], n[2], eye ? 1 : 0);
      if (eye) {
        gl.uniform4f(P.u('u_f0'), eye.hy, eye.cx, eye.cz, 0);
        gl.uniform4f(P.u('u_f1'), eye.rx, eye.rz, eye.fx, eye.fz);
        gl.uniform3f(P.u('u_haze'), eye.haze[0], eye.haze[1], eye.haze[2]);
      }
      gl.bindVertexArray(this.vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
      if (gl.isContextLost() || x.dead) { this.failed = true; return false; }
      // (drawn in the canvas's bottom-left Wd x Hd: its picture's bottom strip)
      const sy = x.cv.height - Hd;
      c.save(); c.imageSmoothingEnabled = false;
      if ('transferToImageBitmap' in x.cv) { const bm = x.cv.transferToImageBitmap(); c.drawImage(bm, 0, sy, Wd, Hd, 0, 0, K.W, K.H); bm.close(); }
      else c.drawImage(x.cv, 0, sy, Wd, Hd, 0, 0, K.W, K.H);
      c.restore();
      return true;
    } catch (e) {
      console.warn('[gl] clearing:', e);
      this.failed = true;
      return false;
    }
  }
}
