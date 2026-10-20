// A MODE 7 FLOOR on the GPU (the broomstick deathmatch's: fantasy/broom/arena.ts), the software one's look exactly:
// each row of the view its distance from the eye's height and the row's drop under the horizon, its own level of the
// texture's chain of smaller copies (the same rule picks it), every pixel one texel nearest (texelFetch: no filtering,
// the copies exactly the averaged ones the CPU made), past the texture's edge the outside tile repeating with its own
// copies, past FAR the one far color, nothing above the horizon. Drawn at the view's own size (the low-res view it
// always was, blown up with the rest of it), the 2D haze bands over it as before.
//
// The texture's uploaded once a build of it (the hour), and the splatters baked into it later go up as patches (just
// the rectangle each touched, every level of it).

import { makeGl, startProgram, pollProgram, texture, uploadLevels, uploadPatch, fullTri, FULL_VS, type Glx, type Prog, type ProgJob } from './core';

const FS = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform sampler2D u_tex;
uniform sampler2D u_out;
uniform vec4 u_c0;    // cx, cz, calt, F
uniform vec4 u_c1;    // fx, fz, rx, rz
uniform vec4 u_v;     // W, H, hy, FAR
uniform vec4 u_t;     // TEXEL, HALF, -, -
uniform ivec3 u_n;    // TS, OS, LEVELS
uniform vec4 u_far;
out vec4 o;
void main() {
  float W = u_v.x, H = u_v.y, hy = u_v.z;
  int x = int(gl_FragCoord.x), y = int(H) - 1 - int(gl_FragCoord.y);
  int y0 = clamp(int(floor(hy)) + 1, 0, int(H));
  if (y < y0) { o = vec4(0.0); return; }
  float dy = float(y) + 0.5 - hy, d = (u_c0.z * u_c0.w) / dy;
  if (d > u_v.w) { o = u_far; return; }
  float k = d / u_c0.w, TEXEL = u_t.x, HALF = u_t.y;
  int lvl = 0;
  while (lvl < u_n.z - 1 && k > TEXEL * 1.3 * float(1 << lvl)) lvl++;
  int ts = u_n.x >> lvl;
  float inv = 1.0 / (TEXEL * float(1 << lvl));
  float wx = u_c0.x + u_c1.x * d - u_c1.z * k * (W / 2.0), wz = u_c0.y + u_c1.y * d - u_c1.w * k * (W / 2.0);
  float u = (wx + HALF) * inv + u_c1.z * k * inv * float(x), v = (HALF - wz) * inv - u_c1.w * k * inv * float(x);
  if (u >= 0.0 && v >= 0.0 && u < float(ts) && v < float(ts)) o = texelFetch(u_tex, ivec2(int(u), int(v)), lvl);
  else { int om = (u_n.y >> lvl) - 1; o = texelFetch(u_out, ivec2(int(u) & om, int(v) & om), lvl); }
}`;

/** What the floor's drawn from: the texture's chain (`n` across the top), the outside tile's (`on`), the far color
 *  (packed 0xAABBGGRR), and the patches baked into the chain since it was uploaded (each texel rect at the top level,
 *  taken off as they go up). */
export interface Mode7Src { mips: Uint32Array[]; n: number; omips: Uint32Array[]; on: number; far: number; dirty: [number, number, number, number][] }
/** The eye: at (cx, cz) `calt` up, looking along (fx, fz), its right (rx, rz), the horizon at row hy, focal length F. */
export interface Mode7View { cx: number; cz: number; calt: number; fx: number; fz: number; rx: number; rz: number; hy: number; F: number }

export class Mode7 {
  private x: Glx | null = null; private prog: Prog | null = null; private vao: WebGLVertexArrayObject | null = null;
  private tex: WebGLTexture | null = null; private out: WebGLTexture | null = null; private src: Mode7Src | null = null;
  private failed = false; private job: ProgJob | null = null;
  constructor(private W: number, private H: number, private texel: number, private far: number) {}
  /** Whether it can draw (made on first ask, its shader built in the background: no till it's done, the software
   *  floor meanwhile). */
  ok() {
    if (this.failed) return false;
    if (this.x && (this.x.dead || this.x.gl.isContextLost())) { this.failed = true; this.x = null; return false; }
    if (this.prog) return true;
    if (!this.x) {
      const x = makeGl(this.W, this.H, false);
      if (!x) { this.failed = true; return false; }
      this.x = x; this.job = startProgram(x.gl, FULL_VS, FS);
      return false;
    }
    const prog = pollProgram(this.job!);
    if (prog === false) { this.failed = true; return false; }
    if (!prog) return false;
    const gl = this.x.gl;
    this.vao = fullTri(gl); this.tex = texture(gl); this.out = texture(gl); this.prog = prog;
    return true;
  }
  /** Sends the texture up (a new one: everything; the same one: just its new patches). */
  sync(s: Mode7Src) {
    if (!this.ok()) return false;
    const gl = this.x!.gl;
    try {
      if (s !== this.src) {
        uploadLevels(gl, this.tex!, s.mips, s.n);
        uploadLevels(gl, this.out!, s.omips, s.on);
        s.dirty.length = 0;
        this.src = s;
      } else if (s.dirty.length) {
        for (const [ax, ay, bx, by] of s.dirty) for (let l = 0; l < s.mips.length; l++) {
          const n = s.n >> l, x0 = ax >> l, y0 = ay >> l, x1 = Math.min(n, bx >> l), y1 = Math.min(n, by >> l);
          uploadPatch(gl, this.tex!, l, s.mips[l], n, x0, y0, x1 - x0, y1 - y0);
        }
        s.dirty.length = 0;
      }
      return true;
    } catch (e) {
      console.warn('[gl] mode 7 upload:', e);
      this.failed = true;
      return false;
    }
  }
  /** The floor for the eye, onto `g` at (0, 0) (the view's own size). False: not drawn (the software path then). */
  draw(g: CanvasRenderingContext2D, s: Mode7Src, v: Mode7View) {
    if (!this.sync(s)) return false;
    const x = this.x!, gl = x.gl, P = this.prog!;
    try {
      gl.viewport(0, 0, this.W, this.H);
      gl.disable(gl.BLEND);
      gl.useProgram(P.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.out);
      gl.uniform1i(P.u('u_tex'), 0); gl.uniform1i(P.u('u_out'), 1);
      gl.uniform4f(P.u('u_c0'), v.cx, v.cz, v.calt, v.F);
      gl.uniform4f(P.u('u_c1'), v.fx, v.fz, v.rx, v.rz);
      gl.uniform4f(P.u('u_v'), this.W, this.H, v.hy, this.far);
      gl.uniform4f(P.u('u_t'), this.texel, (s.n * this.texel) / 2, 0, 0);
      gl.uniform3i(P.u('u_n'), s.n, s.on, s.mips.length);
      const f = s.far;
      gl.uniform4f(P.u('u_far'), (f & 255) / 255, ((f >> 8) & 255) / 255, ((f >> 16) & 255) / 255, 1);
      gl.bindVertexArray(this.vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
      if (gl.isContextLost() || x.dead) { this.failed = true; return false; }
      g.drawImage(x.cv, 0, 0);
      return true;
    } catch (e) {
      console.warn('[gl] mode 7:', e);
      this.failed = true;
      return false;
    }
  }
}
