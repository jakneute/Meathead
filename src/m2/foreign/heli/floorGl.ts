// THE PARK'S FLOOR ON THE GPU (park.ts drawFloor, the helicopter's Mode 7 ground), the look exactly: the same quarter-
// size grid (each floor pixel a ray to the ground through its middle), every surface worked out per pixel by the same
// rules (groundAt, ruinOver: the lagoon's depth steps and glints, the plazas' pavings, the hedge, the plinths and their
// scorch, the lawn's stripes, the road, the lot and its cars, the fields), the same 2x2 dither where steps meet, the
// same stepped haze, the hour's light; blown up 4x onto the screen, crisp.
//
// The CPU worked each pixel out afresh whenever the camera moved (the whole tour, every frame). Here the GPU does it,
// every frame, and the CPU only sends up the camera's rows (worked out in double precision, as before) and the random
// rolls: the software path's own hash (a sine's fraction), tabled by the CPU so each tile, paver and parked car rolls
// exactly what it did (the GPU's single-precision sine couldn't). The rolls that move with time (the lagoon's glints
// drifting, the embers on a wrecked plinth, the scorched trails) are re-tabled as they change (every 6 frames), just
// where they're used.

import { makeGl, startProgram, pollProgram, texture, uploadFloats, fullTri, FULL_VS, type Glx, type Prog, type ProgJob } from '../../gl/core';

type RGB = number[];
/** Everything the floor's made of (park.ts hands its own palettes and plan over, so the two can't drift apart). */
export interface FloorSpec {
  FS: number; FW: number; FH: number; DC: number;
  LAGOON_R: number; PROM_R0: number; PROM_R1: number; HEDGE_R0: number; HEDGE_R1: number; PAD_R: number; ROAD_R: number; ROAD_HALF: number; LOT_R0: number; LOT_R1: number;
  LAGOON_STEPS: number[]; FOG_AT: number[]; FOG_K: number[]; HELIPAD: { x: number; z: number }; MECH_AT: { x: number; z: number }[]; A0: number;
  WATER: RGB[]; GLINT: RGB; GLINT2: RGB; FOAM: RGB; COPING: RGB[]; PAVER: RGB[]; HEDGE: RGB[]; LAWN: RGB[]; FLOWERS: RGB[]; GRAVEL: RGB[]; PLINTH: RGB[];
  SCORCH: RGB[]; EMBER: RGB; EMBER2: RGB; ROADC: RGB[]; ROAD_LINE: RGB; ROAD_EDGE: RGB; CURB: RGB[]; LOT: RGB[]; LOT_LINE: RGB; CAR: RGB[][]; CAR_GLASS: RGB; CAR_GLINT: RGB;
  FIELD: RGB[][]; CLUMP: RGB[]; PAD: RGB[]; PAD_LINE: RGB;
  /** The ten plazas' pavings (shade, itself, lit, accent), in PAV_IDS order: france mexico norway italy china germany uk japan morocco canada. */
  PLAZA: RGB[][]; UK_FLAG: RGB[];
  hash2: (a: number, b: number) => number;
}
/** The camera (park.ts Cam). */
export interface FloorCam { phi: number; cos: number; sin: number; hc: number; fy: number; fz: number; uy: number; uz: number; F: number; ppx: number; ppy: number }
/** A trail a landmark tramped in (ground). */
export interface FloorSeg { ax: number; az: number; bx: number; bz: number }

const f = (v: number) => (Number.isInteger(v) ? v.toFixed(1) : String(v));
const v3 = (c: RGB) => `vec3(${f(c[0])}, ${f(c[1])}, ${f(c[2])})`;
const arr = (name: string, a: RGB[]) => `const vec3 ${name}[${a.length}] = vec3[${a.length}](${a.map(v3).join(', ')});`;
const one = (name: string, c: RGB) => `const vec3 ${name} = ${v3(c)};`;
const flts = (name: string, a: number[]) => `const float ${name}[${a.length}] = float[${a.length}](${a.map(f).join(', ')});`;

/** The tables' sizes: the still rolls (a, b each -HS..HS-1), the parked cars' (n -1024..1023), the lagoon's, a wrecked
 *  plinth's block, the trails' (a, b each -RS..RS-1). */
const HS = 256, LA = 16, LB = 32, PB = 24, RS = 112;

const fragment = (S: FloorSpec) => `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform sampler2D u_hs;
uniform sampler2D u_hcar;
uniform sampler2D u_hlag;
uniform sampler2D u_hpad;
uniform sampler2D u_hruin;
uniform sampler2D u_rows;
uniform vec4 u_cam;
uniform float u_lagC;
uniform int u_lagB0;
uniform vec4 u_mech[9];
uniform int u_dead;
uniform vec4 u_seg[9];
uniform float u_segL2[9];
uniform int u_nseg;
uniform vec3 u_mul;
uniform vec3 u_haze;
out vec4 o;
const int FS = ${S.FS}, FH = ${S.FH};
const float DC = ${f(S.DC)};
const float LAGOON_R = ${f(S.LAGOON_R)}, PROM_R0 = ${f(S.PROM_R0)}, PROM_R1 = ${f(S.PROM_R1)}, HEDGE_R0 = ${f(S.HEDGE_R0)}, HEDGE_R1 = ${f(S.HEDGE_R1)};
const float PAD_R = ${f(S.PAD_R)}, ROAD_R = ${f(S.ROAD_R)}, ROAD_HALF = ${f(S.ROAD_HALF)}, LOT_R0 = ${f(S.LOT_R0)}, LOT_R1 = ${f(S.LOT_R1)};
const float NEAR_PAD2 = ${f((S.PAD_R + 9) * (S.PAD_R + 9))}, A0 = ${f(S.A0)};
const vec2 HELIPAD = vec2(${f(S.HELIPAD.x)}, ${f(S.HELIPAD.z)});
${flts('LST', S.LAGOON_STEPS)}
${flts('FOG_AT', S.FOG_AT)}
${flts('FOG_K', S.FOG_K)}
${arr('WATER', S.WATER)}
${one('GLINT', S.GLINT)} ${one('GLINT2', S.GLINT2)} ${one('FOAM', S.FOAM)}
${arr('COPING', S.COPING)}
${arr('PAVER', S.PAVER)}
${arr('HEDGE', S.HEDGE)}
${arr('LAWN', S.LAWN)}
${arr('FLOWERS', S.FLOWERS)}
${arr('GRAVEL', S.GRAVEL)}
${arr('PLINTH', S.PLINTH)}
${arr('SCORCH', S.SCORCH)}
${one('EMBER', S.EMBER)} ${one('EMBER2', S.EMBER2)}
${arr('ROADC', S.ROADC)}
${one('ROAD_LINE', S.ROAD_LINE)} ${one('ROAD_EDGE', S.ROAD_EDGE)}
${arr('CURB', S.CURB)}
${arr('LOT', S.LOT)}
${one('LOT_LINE', S.LOT_LINE)}
${arr('CAR', S.CAR.flat())}
${one('CAR_GLASS', S.CAR_GLASS)} ${one('CAR_GLINT', S.CAR_GLINT)}
${arr('FIELD', S.FIELD.flat())}
${arr('CLUMP', S.CLUMP)}
${arr('PAD', S.PAD)}
${one('PAD_LINE', S.PAD_LINE)}
${arr('PLAZA', S.PLAZA.flat())}
${arr('UK_FLAG', S.UK_FLAG)}

int fl(float v) { return int(floor(v)); }
// (a roll the tables don't reach (the fields out toward the horizon, deep in the haze): its own hash, as random)
float hfb(int a, int b) { uint h = uint(a) * 374761393u + uint(b) * 668265263u; h = (h ^ (h >> 13)) * 1274126177u; h ^= h >> 16; return float(h) / 4294967296.0; }
float hs(int a, int b) { int ia = a + ${HS}, ib = b + ${HS}; if (ia < 0 || ib < 0 || ia >= ${HS * 2} || ib >= ${HS * 2}) return hfb(a, b); return texelFetch(u_hs, ivec2(ia, ib), 0).r; }
float hcar(int n, int row) { int i = n + 1024; if (i < 0 || i >= 2048) return hfb(n, row * 4 + 3); return texelFetch(u_hcar, ivec2(i, row), 0).r; }
float hlag(int a, int b) { int ia = a + ${LA}, ib = b - u_lagB0 + ${LB}; if (ia < 0 || ib < 0 || ia >= ${LA * 2} || ib >= ${LB * 2}) return hfb(a, b); return texelFetch(u_hlag, ivec2(ia, ib), 0).r; }
float hpad(int i, int a, int b) { int ia = a - int(u_mech[i].z), ib = b - int(u_mech[i].w); if (ia < 0 || ib < 0 || ia >= ${PB} || ib >= ${PB}) return 0.0; return texelFetch(u_hpad, ivec2(i * ${PB} + ia, ib), 0).r; }
float hruin(int a, int b) { int ia = a + ${RS}, ib = b + ${RS}; if (ia < 0 || ib < 0 || ia >= ${RS * 2} || ib >= ${RS * 2}) return 0.0; return texelFetch(u_hruin, ivec2(ia, ib), 0).r; }

vec3 plazaAt(int j, float x, float z, float r, int par) {
  int b = j * 4;
  if (j == 1) { int tx = fl(x / 24.0), tz = fl(z / 24.0); float h = hs(tx, tz); return h > 0.86 ? PLAZA[b] : ((tx + tz) & 1) != 0 ? PLAZA[b + 1] : PLAZA[b + 2]; }
  if (j == 4 || j == 6) {
    int row = fl(z / 14.0), tx = fl((x + float(row & 1) * 16.0) / 32.0); float h = hs(tx, row);
    if (j == 6 && hs(fl(x / 60.0), fl(z / 60.0)) > 0.7) return UK_FLAG[h > 0.5 ? 0 : 1];
    return h > 0.8 ? PLAZA[b] : h > 0.35 ? PLAZA[b + 1] : PLAZA[b + 2];
  }
  if (j == 2 || j == 5) { float h = hs(fl(x / 14.0), fl(z / 14.0)); return h > 0.9 ? PLAZA[b + 3] : h > 0.6 ? PLAZA[b] : h > 0.25 ? PLAZA[b + 1] : PLAZA[b + 2]; }
  if (j == 3) { float d = mod(x + z, 56.0), e = mod(x - z, 56.0); if (d < 7.0 || e < 7.0) return PLAZA[b + 3]; return hs(fl(x / 40.0), fl(z / 40.0)) > 0.5 ? PLAZA[b + 1] : PLAZA[b + 2]; }
  if (j == 7) {
    if (hs(fl(x / 30.0), fl(z / 30.0)) > 0.9) return PLAZA[b + 3];
    float ring = mod(r, 12.0); return ring < 3.0 ? PLAZA[b] : ring < 4.5 && par == 1 ? PLAZA[b] : ring > 9.0 ? PLAZA[b + 2] : PLAZA[b + 1];
  }
  if (j == 8) { int tx = fl(x / 16.0), tz = fl(z / 16.0); if (((tx + tz) & 3) == 0 && hs(fl(x / 64.0), fl(z / 64.0)) > 0.3) return PLAZA[b + 3]; return ((tx + tz) & 1) != 0 ? PLAZA[b + 1] : PLAZA[b + 2]; }
  if (j == 0) { int tx = fl(x / 36.0), tz = fl((z + float(tx & 1) * 18.0) / 36.0); float h = hs(tx, tz); return h > 0.7 ? PLAZA[b + 2] : h > 0.2 ? PLAZA[b + 1] : PLAZA[b]; }
  float h = hs(fl(x / 26.0), fl(z / 26.0)); return h > 0.86 ? PLAZA[b + 3] : h > 0.5 ? PLAZA[b + 1] : h > 0.2 ? PLAZA[b + 2] : PLAZA[b];
}

vec3 ruinOver(float x, float z, int par, vec3 col) {
  for (int k = 0; k < 9; k++) {
    if (k >= u_nseg) break;
    vec4 s = u_seg[k];
    float kk = clamp(((x - s.x) * s.z + (z - s.y) * s.w) / u_segL2[k], 0.0, 1.0), ex = x - s.x - kk * s.z, ez = z - s.y - kk * s.w, d2 = ex * ex + ez * ez;
    if (d2 > 3600.0) continue;
    float e = hruin(fl(x / 14.0), fl(z / 14.0));
    if (d2 < 1600.0) return e > 0.97 ? EMBER : e > 0.6 ? SCORCH[2] : e > 0.25 ? SCORCH[1] : SCORCH[0];
    return par == 1 ? SCORCH[3] : col;
  }
  return col;
}

vec3 groundAt(float x, float z, int par) {
  float r = sqrt(x * x + z * z);
  if (r < LAGOON_R) {
    float g = hlag(fl(x / 26.0), fl(z / 9.0 + u_lagC));
    if (g > 0.955) return GLINT;
    if (g > 0.925) return GLINT2;
    if (r > LAGOON_R - 6.0) return par == 1 ? FOAM : WATER[4];
    int i = 0; while (i < 4 && r > LST[i]) i++;
    for (int e = 0; e < 4; e++) if (abs(r - LST[e]) < 6.0) return WATER[par == 1 ? e : e + 1];
    return WATER[i];
  }
  if (r < PROM_R0) return r < LAGOON_R + 4.0 ? COPING[3] : r < LAGOON_R + 8.0 ? COPING[2] : COPING[1];
  if (r < PROM_R1) {
    float h = hs(fl(x / 22.0), fl(z / 22.0));
    if (r > PROM_R1 - 4.0) return COPING[0];
    return h > 0.85 ? PAVER[3] : h > 0.45 ? PAVER[2] : h > 0.12 ? PAVER[1] : PAVER[0];
  }
  vec3 col;
  if (r < HEDGE_R0) {
    float a = atan(x, z);
    float sec = mod(mod((a - A0) / ${f((Math.PI * 2) / 10)}, 10.0) + 10.5, 10.0);
    int j = fl(sec); if (j >= 10) j -= 10;
    float off = abs(sec - floor(sec) - 0.5);
    if (off > 0.43) {
      float fb = hs(fl(x / 20.0), fl(z / 20.0));
      col = off > 0.445 && fb > 0.78 ? FLOWERS[min(4, fl(hs(fl(x / 10.0), fl(z / 10.0)) * 5.0))] : LAWN[((fl(x / 40.0) + fl(z / 40.0)) & 1) != 0 ? 1 : 2];
    } else if (off < 0.035 && r < 300.0) col = PAVER[(fl(r / 18.0) & 1) + 2];
    else col = plazaAt(j, x, z, r, par);
  } else if (r < HEDGE_R1) {
    float hh = hs(fl(x / 14.0), fl(z / 14.0));
    col = r < HEDGE_R0 + 4.0 ? HEDGE[3] : r > HEDGE_R1 - 5.0 ? HEDGE[0] : hh > 0.6 ? HEDGE[2] : HEDGE[1];
  } else if (r < ROAD_R - ROAD_HALF - 6.0) {
    col = LAWN[0];
    bool done = false;
    for (int i = 0; i < 9; i++) {
      float ox = x - u_mech[i].x, oz = z - u_mech[i].y, d2 = ox * ox + oz * oz;
      if (d2 >= NEAR_PAD2) continue;
      float d = sqrt(d2);
      if (d < PAD_R) {
        if (((u_dead >> i) & 1) != 0) {
          float e = hpad(i, fl(x / 12.0), fl(z / 12.0));
          col = d < PAD_R - 26.0 ? (e > 0.975 ? EMBER2 : e > 0.94 ? EMBER : e > 0.5 ? SCORCH[1] : SCORCH[0]) : d < PAD_R - 18.0 ? (par == 1 ? SCORCH[1] : SCORCH[2]) : par == 1 ? SCORCH[3] : PLINTH[1];
        } else col = d > PAD_R - 6.0 ? PLINTH[0] : d > PAD_R - 11.0 ? PLINTH[3] : hs(fl(x / 30.0), fl(z / 30.0)) > 0.5 ? PLINTH[2] : PLINTH[1];
        done = true; break;
      }
      if (d < PAD_R + 9.0) { col = d > PAD_R + 6.0 ? GRAVEL[0] : par == 1 ? GRAVEL[1] : GRAVEL[2]; done = true; break; }
    }
    if (!done) {
      float hx = x - HELIPAD.x, hz = z - HELIPAD.y, hp = sqrt(hx * hx + hz * hz);
      if (hp < 60.0) col = (hp > 50.0 && hp < 56.0) || (abs(hx) < 18.0 && abs(hz) < 5.0) || (abs(hz) < 22.0 && abs(abs(hx) - 15.0) < 4.0) ? PAD_LINE : hp > 56.0 ? PAD[0] : ((fl(hx / 20.0) + fl(hz / 20.0)) & 1) != 0 ? PAD[1] : PAD[2];
      else {
        float s = r / 34.0, fr = s - floor(s); int band = fl(s) & 1;
        col = fr < 0.12 ? LAWN[par == 1 ? band + 1 : 2 - band] : LAWN[band + 1];
        if (hs(fl(x / 30.0), fl(z / 30.0)) > 0.93) col = LAWN[3];
      }
    }
  } else if (r < ROAD_R - ROAD_HALF) col = r < ROAD_R - ROAD_HALF - 3.0 ? CURB[2] : CURB[0];
  else if (r < ROAD_R + ROAD_HALF) {
    float a = atan(x, z);
    if (abs(r - ROAD_R) < 1.6 && (fl((a * ROAD_R) / 22.0) & 1) != 0) col = ROAD_LINE;
    else if (abs(abs(r - ROAD_R) - (ROAD_HALF - 2.5)) < 1.0) col = ROAD_EDGE;
    else { float h = hs(fl(x / 34.0), fl(z / 34.0)); col = h > 0.8 ? ROADC[2] : h > 0.3 ? ROADC[1] : ROADC[0]; }
  } else if (r < LOT_R0) col = r < LOT_R0 - 3.0 ? CURB[1] : CURB[0];
  else if (r < LOT_R1) {
    float a = atan(x, z), row = mod(r - LOT_R0, 120.0), al = mod(a * r, 34.0);
    col = hs(fl(x / 50.0), fl(z / 50.0)) > 0.7 ? LOT[2] : par == 1 && hs(fl(x / 12.0), fl(z / 12.0)) > 0.8 ? LOT[0] : LOT[1];
    if (row < 3.0 || ((row < 46.0 || row > 74.0) && al < 1.6)) col = LOT_LINE;
    else if ((row > 8.0 && row < 40.0) || (row > 80.0 && row < 112.0)) {
      int n = fl((a * r) / 34.0) * 7 + fl((r - LOT_R0) / 60.0);
      if (hcar(n, 0) > 0.45 && abs(al - 17.0) < 10.0) {
        int ci = min(${S.CAR.length - 1}, fl(hcar(n, 1) * ${f(S.CAR.length)})) * 3;
        float oo = row > 80.0 ? row - 80.0 : row - 8.0, ac = abs(al - 17.0);
        col = ac > 8.0 ? CAR[ci] : (oo > 7.0 && oo < 10.0) || (oo > 22.0 && oo < 25.0) ? (ac < 3.0 ? CAR_GLINT : CAR_GLASS) : oo >= 10.0 && oo <= 22.0 ? CAR[ci + 2] : CAR[ci + 1];
      }
    }
  } else {
    float t = hs(fl(x / 120.0), fl(z / 120.0));
    if (t > 0.82) col = CLUMP[t > 0.95 ? 2 : par == 1 ? 1 : 0];
    else { int fi = min(2, fl(hs(fl(x / 260.0), fl(z / 260.0)) * 3.0)) * 3; float rows = mod(x + z * 0.3, 24.0); col = rows < 8.0 ? FIELD[fi] : rows < 16.0 ? FIELD[fi + 1] : FIELD[fi + 2]; }
  }
  return u_nseg > 0 && r < LOT_R1 + 100.0 ? ruinOver(x, z, par, col) : col;
}

float fogOf(float dist, int par) {
  int i = 0; while (i < 4 && dist > FOG_AT[i]) i++;
  for (int e = 0; e < 4; e++) if (abs(dist - FOG_AT[e]) < 140.0) return FOG_K[par == 1 ? e : e + 1];
  return FOG_K[i];
}

void main() {
  int rx = int(gl_FragCoord.x), ry = FH - 1 - int(gl_FragCoord.y);
  vec4 R = texelFetch(u_rows, ivec2(ry, 0), 0);
  if (R.w < 0.5) { o = vec4(0.0); return; }
  float t = R.x, dz = R.y, dz2 = R.z;
  float xr = (float(rx * FS) + float(FS) * 0.5 - u_cam.w) / u_cam.z;
  float X = t * xr, Zp = DC + t * dz;
  float x = X * u_cam.x + Zp * u_cam.y, z = -X * u_cam.y + Zp * u_cam.x;
  float dist = t * sqrt(xr * xr + dz2);
  int par = (rx + ry) & 1;
  vec3 v = groundAt(x, z, par) * u_mul / 255.0;
  o = vec4((v + (u_haze - v) * fogOf(dist, par)) / 255.0, 1.0);
}`;

export class ParkFloor {
  private x: Glx | null = null; private P: Prog | null = null; private vao: WebGLVertexArrayObject | null = null;
  private t: Record<'hs' | 'hcar' | 'hlag' | 'hpad' | 'hruin' | 'rows', WebGLTexture> | null = null;
  private failed = false;
  private rows: Float32Array; private lag = new Float32Array(LA * 2 * LB * 2); private pad = new Float32Array(9 * PB * PB); private ruin = new Float32Array(RS * 2 * RS * 2);
  private padAt: Float32Array; private segL2 = new Float32Array(9); private segV = new Float32Array(36);
  // (what the moving tables were last made for)
  private rollKey = ''; private segKey = ''; private segsUsed: FloorSeg[] = []; private lastF6 = -1; private lastBase = '';
  constructor(private S: FloorSpec) {
    this.rows = new Float32Array(S.FH * 4);
    // (each wrecked plinth's block of embers: from its corner a cell short of its edge)
    this.padAt = new Float32Array(36);
    S.MECH_AT.forEach((p, i) => { this.padAt.set([p.x, p.z, Math.floor((p.x - S.PAD_R) / 12) - 1, Math.floor((p.z - S.PAD_R) / 12) - 1], i * 4); });
  }
  private job: ProgJob | null = null; private hs: Float32Array | null = null; private hsRow = 0;
  /** Whether it can draw: the first asks start it (the context, its shader building in the background, the still rolls
   *  tabled a slice a frame) and say no (the software floor, the same picture, meanwhile). */
  private ok() {
    if (this.failed) return false;
    if (this.x && (this.x.dead || this.x.gl.isContextLost())) { this.failed = true; this.x = null; return false; }
    if (this.P) return true;
    const S = this.S, h2 = S.hash2;
    try {
      if (!this.x) {
        const x = makeGl(S.FW, S.FH, false);
        if (!x) { this.failed = true; return false; }
        this.x = x; this.job = startProgram(x.gl, FULL_VS, fragment(S));
        this.hs = new Float32Array(HS * 2 * HS * 2);
        return false;
      }
      // (the still rolls, every (a, b) a floor cell can ask for near the park: 64 rows a frame)
      const N = HS * 2, hs = this.hs!;
      for (const end = Math.min(N, this.hsRow + 64); this.hsRow < end; this.hsRow++) { const b = this.hsRow; for (let a = 0; a < N; a++) hs[b * N + a] = h2(a - HS, b - HS); }
      const P = pollProgram(this.job!);
      if (P === false) { this.failed = true; return false; }
      if (!P || this.hsRow < N) return false;
      const gl = this.x.gl;
      const hcar = new Float32Array(2048 * 2);
      for (let n = 0; n < 2048; n++) { hcar[n] = h2(n - 1024, 3); hcar[2048 + n] = h2(n - 1024, 7); }
      const T = { hs: texture(gl), hcar: texture(gl), hlag: texture(gl), hpad: texture(gl), hruin: texture(gl), rows: texture(gl) };
      uploadFloats(gl, T.hs, hs, N, N);
      uploadFloats(gl, T.hcar, hcar, 2048, 2);
      uploadFloats(gl, T.hlag, this.lag, LA * 2, LB * 2);
      uploadFloats(gl, T.hpad, this.pad, 9 * PB, PB);
      uploadFloats(gl, T.hruin, this.ruin, RS * 2, RS * 2);
      gl.bindTexture(gl.TEXTURE_2D, T.rows);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, S.FH, 1, 0, gl.RGBA, gl.FLOAT, this.rows);
      this.t = T; this.vao = fullTri(gl); this.P = P; this.hs = null;
      // (the moving rolls made afresh for it)
      this.rollKey = '';
      return true;
    } catch (e) {
      console.warn('[gl] park floor:', e);
      this.failed = true; return false;
    }
  }

  /** The rolls that move with time, for frame-sixth f6 (the lagoon's glints, the wrecked plinths' embers, the trails'). */
  private reroll(f6: number, dead: boolean[], segs: FloorSeg[]) {
    const gl = this.x!.gl, T = this.t!, h2 = this.S.hash2, S = this.S;
    const key = `${f6}|${dead.map(d => (d ? 1 : 0)).join('')}|${this.segKey}`;
    if (key === this.rollKey) return;
    const f6Changed = !this.rollKey.startsWith(`${f6}|`);
    this.rollKey = key;
    if (f6Changed) {
      // (the lagoon: a (x / 26) -16..15, b (z / 9 + f6 * 0.07) round its whole part)
      const B0 = Math.floor(f6 * 0.07);
      for (let bb = 0; bb < LB * 2; bb++) for (let aa = 0; aa < LA * 2; aa++) this.lag[bb * LA * 2 + aa] = h2(aa - LA, B0 - LB + bb);
      uploadFloats(gl, T.hlag, this.lag, LA * 2, LB * 2, true);
    }
    // (each wrecked plinth's embers: hash2(x / 12, z / 12 + f6 * 0.3) over its block)
    let anyDead = false;
    for (let i = 0; i < 9; i++) {
      if (!dead[i]) continue;
      anyDead = true;
      const a0 = this.padAt[i * 4 + 2], b0 = this.padAt[i * 4 + 3];
      for (let bb = 0; bb < PB; bb++) for (let aa = 0; aa < PB; aa++) this.pad[bb * 9 * PB + i * PB + aa] = h2(a0 + aa, b0 + bb + f6 * 0.3);
    }
    if (anyDead) uploadFloats(gl, T.hpad, this.pad, 9 * PB, PB, true);
    // (the trails: hash2(x / 14, z / 14 + f6 * 0.21), just the cells near one)
    if (segs.length) {
      const N = RS * 2;
      for (const s of segs) {
        const dx = s.bx - s.ax, dz = s.bz - s.az, l2 = dx * dx + dz * dz || 1;
        const a0 = Math.max(-RS, Math.floor((Math.min(s.ax, s.bx) - 72) / 14)), a1 = Math.min(RS - 1, Math.floor((Math.max(s.ax, s.bx) + 72) / 14));
        const b0 = Math.max(-RS, Math.floor((Math.min(s.az, s.bz) - 72) / 14)), b1 = Math.min(RS - 1, Math.floor((Math.max(s.az, s.bz) + 72) / 14));
        for (let b = b0; b <= b1; b++) for (let a = a0; a <= a1; a++) {
          const cx = a * 14 + 7, cz = b * 14 + 7, k = Math.max(0, Math.min(1, ((cx - s.ax) * dx + (cz - s.az) * dz) / l2)), ex = cx - s.ax - k * dx, ez = cz - s.az - k * dz;
          if (ex * ex + ez * ez > 72 * 72) continue;
          this.ruin[(b + RS) * N + a + RS] = h2(a, b + f6 * 0.21);
        }
      }
      uploadFloats(gl, T.hruin, this.ruin, N, N, true);
    }
    void S;
  }

  /** The floor for the camera onto `c` (blown up to sw x sh). `baseKey`: what the software floor keys its still layer on
   *  (the camera, the hour, the wrecks): the trails are taken up when it or f6 changes, or they've grown (as it does).
   *  False: not drawn (the software path then). */
  draw(c: CanvasRenderingContext2D, cam: FloorCam, f: number, dead: boolean[], mul: number[], haze: number[], segs: FloorSeg[], baseKey: string, sw: number, sh: number) {
    if (!this.ok()) return false;
    const S = this.S, x = this.x!, gl = x.gl, P = this.P!, T = this.t!, f6 = Math.floor(f / 6);
    try {
      // (the trails as the software floor would have them: taken up whenever it repaints)
      const sk = segs.map(s => `${Math.round(s.bx / 24)},${Math.round(s.bz / 24)}`).join(';');
      if (sk !== this.segKey || f6 !== this.lastF6 || baseKey !== this.lastBase) { this.segKey = sk; this.segsUsed = segs.map(s => ({ ...s })); this.lastF6 = f6; this.lastBase = baseKey; }
      const used = this.segsUsed;
      this.reroll(f6, dead, used);
      // (each row's ray, in double precision: where it meets the ground, how far)
      const R = this.rows;
      for (let ry = 0; ry < S.FH; ry++) {
        const sy = ry * S.FS + S.FS / 2, yr = -(sy - cam.ppy) / cam.F, dy = yr * cam.uy + cam.fy;
        if (dy > -0.0008) { R[ry * 4 + 3] = 0; continue; }
        const dz = yr * cam.uz + cam.fz, t = -cam.hc / dy;
        R[ry * 4] = t; R[ry * 4 + 1] = dz; R[ry * 4 + 2] = dz * dz + dy * dy; R[ry * 4 + 3] = 1;
      }
      gl.bindTexture(gl.TEXTURE_2D, T.rows);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, S.FH, 1, gl.RGBA, gl.FLOAT, R);
      gl.viewport(0, 0, S.FW, S.FH);
      gl.disable(gl.BLEND);
      gl.useProgram(P.p);
      const bind = (name: string, t: WebGLTexture, unit: number) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(P.u(name), unit); };
      bind('u_hs', T.hs, 0); bind('u_hcar', T.hcar, 1); bind('u_hlag', T.hlag, 2); bind('u_hpad', T.hpad, 3); bind('u_hruin', T.hruin, 4); bind('u_rows', T.rows, 5);
      gl.uniform4f(P.u('u_cam'), cam.cos, cam.sin, cam.F, cam.ppx);
      gl.uniform1f(P.u('u_lagC'), f6 * 0.07);
      gl.uniform1i(P.u('u_lagB0'), Math.floor(f6 * 0.07));
      gl.uniform4fv(P.u('u_mech'), this.padAt);
      gl.uniform1i(P.u('u_dead'), dead.reduce((m, d, i) => (d ? m | (1 << i) : m), 0));
      const n = Math.min(9, used.length);
      this.segV.fill(0); this.segL2.fill(1);
      for (let i = 0; i < n; i++) { const s = used[i], dx = s.bx - s.ax, dz = s.bz - s.az; this.segV.set([s.ax, s.az, dx, dz], i * 4); this.segL2[i] = dx * dx + dz * dz || 1; }
      gl.uniform4fv(P.u('u_seg'), this.segV);
      gl.uniform1fv(P.u('u_segL2'), this.segL2);
      gl.uniform1i(P.u('u_nseg'), n);
      gl.uniform3f(P.u('u_mul'), mul[0], mul[1], mul[2]);
      gl.uniform3f(P.u('u_haze'), haze[0], haze[1], haze[2]);
      gl.bindVertexArray(this.vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
      if (gl.isContextLost() || x.dead) { this.failed = true; return false; }
      c.save(); c.imageSmoothingEnabled = false;
      c.drawImage(x.cv, 0, 0, S.FW, S.FH, 0, 0, sw, sh);
      c.restore();
      return true;
    } catch (e) {
      console.warn('[gl] park floor:', e);
      this.failed = true;
      return false;
    }
  }
}
