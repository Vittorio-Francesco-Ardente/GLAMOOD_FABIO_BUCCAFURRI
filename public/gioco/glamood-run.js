/* Glamood Run v3 — engine. Vanilla JS + canvas 2D, no dependencies.
   One input: tap / click / Space = jump (hold = higher). Arrow down, or hold the lower third on touch = duck.
   Art: sprites and layered backgrounds from the asset kit (passed in opts.assets as {name: url}).        */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;
const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

const KEY = 'glamood-run-v3';
const LVLEN = 1000;                      // points per level

/* Levels. Layers: n image, par parallax, h height (units), b bottom offset from floor top (units, + = lower).
   sky: opaque, covers top..floor. ground: opaque strip at the bottom. fg: foreground strip (faster than ground). */
const FH = 80;                                  // ground strip height
const LEVELS = [
  { id: 'L1', name: 'Il Salone', sub: 'Dove tutto comincia', sky: 'L1_01', 
    layers: [{ n: 'L1_02', par: .12, h: 280, b: 0, cover: true }, { n: 'L1_03', par: .36, h: 192, b: 3, hang: true }],
    ground: 'L1_ground', fg: null, light: 'L1_06', mon: { h: 175, par: .36, b: 2 },
    ob: [40, 42, 50, 46, 62, 56, 22, 60],
    en: [{ i: 0, kind: 'fly', h: 26, fps: 12 }, { i: 1, kind: 'fly', h: 30, fps: 10 }, { i: 2, kind: 'fly', h: 32, fps: 10 }, { i: 3, kind: 'hang', h: 70, fps: 5 }] },
  { id: 'L2', name: 'Lungomare Falcomatà', sub: 'Il chilometro più bello d’Italia', sky: 'L2_01', 
    layers: [{ n: 'L2_02', par: 0.1, h: 81, b: -57 }, { n: 'L2_03', par: 0.24, h: 173, b: 0 }, { n: 'L2_04', par: 0.42, h: 158, b: 3 }],
    ground: 'L2_ground', fg: null, mon: { h: 165, par: .3, b: 0 },
    ob: [34, 50, 28, 52, 24, 64],
    en: [{ i: 0, kind: 'fly', h: 30, fps: 9 }, { i: 1, kind: 'roll', h: 30, fps: 12 }, { i: 2, kind: 'fly', h: 26, fps: 10 }] },
  { id: 'L3', name: 'Centro e Castello', sub: 'Corso Garibaldi e il Castello Aragonese', sky: 'L3_01', skyNight: 'L3_01n', night: [.35, .65], 
    layers: [{ n: 'L3_02', par: 0.1, h: 111, b: -52 }, { n: 'L3_03', par: 0.24, h: 208, b: 0 }, { n: 'L3_04', par: 0.42, h: 123, b: 3 }],
    ground: 'L3_ground', fg: null, mon: { h: 190, par: .22, b: -4 },
    ob: [36, 40, 44, 50, 32, 58],
    en: [{ i: 0, kind: 'fly', h: 26, fps: 10 }, { i: 1, kind: 'hang', h: 60, fps: 5 }, { i: 2, kind: 'fly', h: 28, fps: 12 }] },
  { id: 'L4', name: 'Museo Archeologico', sub: 'I Bronzi e la Magna Grecia', sky: 'L4_01', 
    layers: [{ n: 'L4_02', par: 0.1, h: 201, b: -33 }, { n: 'L4_03', par: 0.24, h: 158, b: -28 }, { n: 'L4_04', par: 0.42, h: 104, b: 3 }],
    ground: 'L4_ground', fg: null, mon: { h: 190, par: .26, b: -2 },
    ob: [30, 50, 56, 34, 56, 40],
    en: [{ i: 0, kind: 'fly', h: 30, fps: 10 }, { i: 1, kind: 'roll', h: 28, fps: 10 }, { i: 2, kind: 'hang', h: 62, fps: 5 }] },
  { id: 'L5', name: 'Scilla', sub: 'Chianalea e il Castello Ruffo', sky: 'L5_01', 
    layers: [{ n: 'L5_02', par: 0.1, h: 133, b: -30 }, { n: 'L5_03', par: 0.24, h: 167, b: 0 }, { n: 'L5_04', par: 0.42, h: 118, b: 3 }],
    ground: 'L5_ground', fg: null, mon: { h: 190, par: .22, b: -2 },
    ob: [20, 38, 40, 56, 40, 44],
    en: [{ i: 0, kind: 'fly', h: 30, fps: 9 }, { i: 1, kind: 'fly', h: 30, fps: 10 }, { i: 2, kind: 'roll', h: 34, fps: 10 }] },
  { id: 'L6', name: 'Pentedattilo', sub: 'Il borgo sotto la mano di pietra', sky: 'L6_01', 
    layers: [{ n: 'L6_02', par: 0.1, h: 136, b: 0 }, { n: 'L6_03', par: 0.24, h: 185, b: -13 }, { n: 'L6_04', par: 0.42, h: 145, b: 3 }],
    ground: 'L6_ground', fg: null, mon: { h: 200, par: .22, b: -2 },
    ob: [56, 44, 24, 46, 34, 50],
    en: [{ i: 0, kind: 'fly', h: 30, fps: 10 }, { i: 1, kind: 'roll', h: 30, fps: 12 }, { i: 2, kind: 'roll', h: 44, fps: 10 }] },
  { id: 'L7', name: 'Bergamotteto', sub: 'Il profumo di Reggio', sky: 'L7_01', 
    layers: [{ n: 'L7_02', par: 0.1, h: 198, b: -4 }, { n: 'L7_03', par: 0.24, h: 194, b: -9 }, { n: 'L7_04', par: 0.42, h: 128, b: 3 }],
    ground: 'L7_ground', fg: null, mon: { h: 185, par: .24, b: -2 },
    ob: [36, 64, 40, 40, 30, 44],
    en: [{ i: 0, kind: 'fly', h: 30, fps: 12 }, { i: 1, kind: 'fall', h: 30, fps: 8 }, { i: 2, kind: 'fly', h: 26, fps: 10 }] },
];
const BADGES = {
  b0: { label: 'Il Salone', img: 'badge_0', test: s => s.score >= 400 },
  b1: { label: 'Lungomare', img: 'badge_1', test: s => s.maxLv >= 1 },
  b2: { label: 'Castello Aragonese', img: 'badge_2', test: s => s.maxLv >= 2 },
  b3: { label: 'Museo Archeologico', img: 'badge_3', test: s => s.maxLv >= 3 },
};
const BADGE_IMG = { b0: 'badge_0', b1: 'badge_1', b2: 'badge_2', b3: 'badge_3' };
const POWER = {
  corno: { img: 'pw_corno', label: 'Cornetto: ti salva una volta', dur: 0 },
  asciugamano: { img: 'pw_asciugamano', label: 'Asciugamano caldo: tutto rallenta', dur: 5 },
  flacone: { img: 'pw_flacone', label: 'Profumo: le gocce ti inseguono', dur: 7 },
  forbici: { img: 'pw_forbici', label: 'Forbici d’oro: taglia tutto', dur: 0 },
  moneta: { img: 'pw_moneta', label: 'Moneta: +50', dur: 0 },
  doppio: { img: 'pw_doppio', label: 'Pettine d’oro: punti doppi', dur: 10 },
};
const HERO_H = 80;                               // run height in units

let godMode = false;

export function createGame(root, opts = {}) {
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const canvas = $('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const emit = (type, data) => opts.onEvent && opts.onEvent(type, data);
  const URLS = opts.assets || {};

  /* ---------------- storage ---------------- */
  let store = { best: 0, runs: 0, name: '', board: [], badges: {} };
  try { store = Object.assign(store, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* private mode */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ } };
  const board = () => store.board.slice().sort((a, b) => b.s - a.s).slice(0, 5);

  /* ---------------- assets ---------------- */
  const IMG = {};
  let ready = false;
  const FADE = {}, FILL = {};
  function loadAll() {
    const names = Object.keys(URLS);
    return Promise.all(names.map(n => new Promise(res => {
      const im = new Image(); im.decoding = 'async';
      im.onload = () => { IMG[n] = im; res(); }; im.onerror = () => res();
      im.src = URLS[n];
    })));
  }
  const sp = n => IMG[n];
  const HAIR = opts.hair || {};
  const hk = k => HAIR.run && HAIR[k] ? HAIR.run / HAIR[k] : 1;
  function prep() { return;
    // bottom colour (for fills) and faded copies, per band image
    LEVELS.forEach(L => {
      const keys = L.id === 'L3' ? [L.id, 'L3n'] : [L.id];
      keys.forEach(pre => L.layers.forEach(ly => {
        if (ly.k === 'E') return;
        const im = IMG['bands/' + pre + ly.k]; if (!im) return;
        const id = pre + ly.k;
        if (ly.fill) {
          const c = document.createElement('canvas'); c.width = 8; c.height = im.height;
          const x = c.getContext('2d'); x.drawImage(im, 0, 0, 8, im.height);
          const d = x.getImageData(0, im.height - 6, 8, 3).data; let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
          FILL[id] = n ? [r / n | 0, g / n | 0, b / n | 0] : null;
        }
        if (ly.fade) {
          const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
          const x = c.getContext('2d'); x.drawImage(im, 0, 0);
          const g = x.createLinearGradient(0, 0, 0, im.height * ly.fade);
          g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
          x.globalCompositeOperation = 'destination-out'; x.fillStyle = g; x.fillRect(0, 0, im.width, im.height * ly.fade);
          FADE[id] = c;
        }
      }));
    });
  }

  /* ---------------- layout ---------------- */
  let VWMIN = 560; const VHMIN = 280, GROUND_H = 58;
  let S = 1, VW = VWMIN, VH = 360, GY = 300, DPR = 1, cssW = 0, cssH = 0;
  let oc = null, octx = null;
  function layout() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    cssW = r.width; cssH = r.height;
    DPR = Math.min(cssW < 700 ? 1.5 : 2, window.devicePixelRatio || 1); // phones: 1.5x is sharp enough and ~45% fewer pixels to paint
    canvas.width = Math.round(cssW * DPR); canvas.height = Math.round(cssH * DPR);
    VWMIN = cssW / cssH < 1.5 ? 380 : 560;
    S = Math.min(cssW / VWMIN, cssH / VHMIN);
    VW = cssW / S; VH = cssH / S;
    GY = Math.round(VH - GROUND_H);
    oc = document.createElement('canvas'); oc.width = canvas.width; oc.height = canvas.height; octx = oc.getContext('2d', { alpha: false });
  }

  /* ---------------- state ---------------- */
  const PX = 104, G = 2700, JUMP = 810;
  let state = 'idle';
  let t = 0, scroll = 0, speed = 190, score = 0, drops = 0, nightSeen = false;
  let lv = 0, prevLv = -1, lvFade = 1, maxLv = 0, startLv = 0, night = 0;
  let obstacles = [], pickups = [], powers = [], parts = [], texts = [], fx = [];
  let gapLeft = 0, grace = 0, shake = 0, flash = 0, deadAt = 0, duckHold = false, jumpHeld = false, landT = 0, powerLeft = 14;
  let entryId = 0, lastScore = -1;
  const buff = { shield: false, slow: 0, magnet: 0, double: 0 };
  const p = { h: 0, vy: 0, phase: 0, duck: false, dead: false, was: 0 };
  

  /* ---------------- scenery ---------------- */
  const tile = (c, im, par, y, h, gapK = 1, hang = false) => {
    const w = im.width * h / im.height, step = w * gapK, off = -((scroll * par) % step);
    for (let x = off - step; x < VW; x += step) if (x + w > 0) {
      c.drawImage(im, x, y, w + (gapK === 1 ? 1 : 0), h);
      if (hang && y > 0) c.drawImage(im, 0, 0, im.width, 1, x, 0, w + 1, y + 1); // pendant cords reach the ceiling
    }
  };
  let mon = null;                                 // set piece of the current level
  function scene(c, L, nightK) {
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    const floorTop = VH - FH;
    c.fillStyle = '#0A4A50'; c.fillRect(0, 0, VW, VH);
    const sky = sp(L.sky);
    if (sky) { tile(c, sky, .03, 0, floorTop + 4); if (L.skyNight && nightK > .01) { c.globalAlpha = nightK; tile(c, sp(L.skyNight), .03, 0, floorTop + 4); c.globalAlpha = 1; } }
    const nl = L.layers.length;
    L.layers.forEach((ly, i) => {
      const im = sp(ly.n); if (!im) return;
      let h = ly.h; if (ly.cover) h = floorTop + 2;
      tile(c, im, ly.par, floorTop + ly.b - h, h, 1, ly.hang);
      if (i === nl - 2 || nl === 1 || (nl === 2 && i === 0 && false)) drawMon(c, L, floorTop);
    });
    if (nl === 2) { /* salon & seafront: monument after the first strip */ }
    if (nightK > .01) { c.fillStyle = `rgba(6,22,40,${.38 * nightK})`; c.fillRect(0, 0, VW, floorTop + 2); }
    c.fillStyle = 'rgba(6,34,38,.22)'; c.fillRect(0, 0, VW, floorTop + 2); // backdrop steps back so the run lane reads
    const gr = sp(L.ground); if (gr) tile(c, gr, 1, floorTop, FH + 1);
    if (nightK > .01) { c.fillStyle = `rgba(6,22,40,${.3 * nightK})`; c.fillRect(0, floorTop, VW, FH + 2); }
    if (L.light && sp(L.light)) { c.globalAlpha = .55; tile(c, sp(L.light), .2, 0, floorTop); c.globalAlpha = 1; }
  }
  function drawMon(c, L, floorTop) {
    if (!mon || mon.L !== L.id) return;
    const im = sp(L.id + '_mon'); if (!im) return;
    const h = L.mon.h, w = im.width * h / im.height;
    if (mon.x + w < -10) return;
    c.drawImage(im, mon.x, floorTop + L.mon.b - h, w, h);
  }
  function drawFg(c, L) {
    const f = L.fg, im = f && sp(f.n); if (!im) return;
    tile(c, im, f.par, VH + f.b - f.h, f.h, f.gap);
  }

  /* ---------------- sprites ---------------- */
  let haloOn = false; const haloCache = new Map();
  function halo(name, im) {             // cream glow + soft dark rim, rendered once per sprite
    let hc = haloCache.get(name); if (hc) return hc;
    const k = Math.min(1, 220 / im.height), w = Math.round(im.width * k), h = Math.round(im.height * k), pad = 18;
    hc = document.createElement('canvas'); hc.width = w + pad * 2; hc.height = h + pad * 2; const g = hc.getContext('2d');
    g.shadowColor = 'rgba(255,246,222,1)'; g.shadowBlur = 14; g.drawImage(im, pad, pad, w, h); g.shadowBlur = 6; g.drawImage(im, pad, pad, w, h);
    g.shadowColor = 'rgba(4,30,34,.55)'; g.shadowBlur = 3; g.shadowOffsetY = 2; g.drawImage(im, pad, pad, w, h);
    hc._k = k; hc._pad = pad; haloCache.set(name, hc); return hc;
  }
  function spr(c, name, x, yBottom, h, flip = false, rot = 0, alpha = 1) {
    if (haloOn) { const im0 = sp(name); if (im0 && im0.complete !== false && im0.width) { const hc = halo(name, im0), sc = h / (im0.height * hc._k), pw = hc._pad * sc;
      c.save(); c.globalAlpha = alpha; c.translate(x, yBottom - h / 2); if (rot) c.rotate(rot); if (flip) c.scale(-1, 1);
      c.drawImage(hc, -hc.width * sc / 2, -h / 2 - pw, hc.width * sc, hc.height * sc); c.restore(); return; } }
    const im = sp(name); if (!im) return;
    const w = im.width * h / im.height;
    c.save(); if (alpha < 1) c.globalAlpha = alpha;
    c.translate(x, yBottom);
    if (rot) { c.translate(0, -h / 2); c.rotate(rot); c.translate(0, h / 2); }
    if (flip) c.scale(-1, 1);
    c.drawImage(im, -w / 2, -h, w, h); c.restore();
  }
  let deadT = 0;
  function heroFrame() {
    if (p.dead) return ['h_hit_' + Math.min(5, Math.floor(deadT * 9)), 'hit'];
    if (p.h > .5) { const v = p.vy; return ['h_jump_' + (v > 520 ? 1 : v > 120 ? 2 : v > -200 ? 3 : 4), 'jump']; }
    if (landT > 0) return ['h_jump_5', 'jump'];
    if (p.duck) return ['h_slide_' + (Math.floor(t * 8) % 2 ? 2 : 1), 'slide'];
    return ['h_run_' + (Math.floor(p.phase / TAU * 8) % 8), 'run'];
  }
  function drawHero(c) {
    const [name, k] = heroFrame(); const im = sp(name); if (!im) return;
    const h = HERO_H * hk(k) * (sp(name).height / (sp('h_' + k + '_0') || im).height), sy = GY - p.h;
    if (!p.dead) { c.fillStyle = `rgba(2,24,28,${.28 - Math.min(p.h, 120) / 120 * .18})`; c.beginPath(); c.ellipse(PX + 2, GY + 2, 20 - Math.min(p.h, 120) / 10, 3.6, 0, 0, TAU); c.fill(); }
    const aura = buff.shield ? 'fx_shield_' : buff.magnet > 0 ? 'fx_magnet_' : null;
    if (aura) { const f = sp(aura + (Math.floor(t * 10) % 6)); if (f) { c.save(); c.globalAlpha = .7; const s = 112, fh = s * f.height / f.width; c.drawImage(f, PX - s / 2, sy - 40 - fh / 2, s, fh); c.restore(); } }
    spr(c, name, PX + (p.duck ? 8 : 0), sy + (p.dead ? 4 : 2), h);
  }

  /* obstacle sprites */
  function obSprite(o) { return o.spr; }
  function drawObstacle(c, o) {   // obstacles get a cream halo + soft dark rim so they read over any background
    haloOn = true; drawObstacle0(c, o); haloOn = false;
  }
  function drawObstacle0(c, o) {
    if (o.type === 'ground') { spr(c, o.name, o.x + o.w / 2, GY - o.y, o.h); return; }
    const E = o.E;
    const fr = o.kind === 'fall' ? 0 : Math.floor(o.anim * E.fps) % 4;
    const name = `${o.L}_e${o.which}_${fr}`;
    if (o.kind === 'roll') { spr(c, name, o.x + o.w / 2, GY - o.y + 2, o.h); return; }
    if (o.kind === 'hang') {
      c.strokeStyle = 'rgba(5,27,30,.9)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(o.x + o.w / 2, 0); c.lineTo(o.x + o.w / 2, GY - o.y - o.h + 3); c.stroke();
      spr(c, name, o.x + o.w / 2, GY - o.y, o.h);
    } else if (o.kind === 'fall') {
      if (o.falling || o.y > 4) { c.fillStyle = 'rgba(2,24,28,.28)'; const s = clamp(1 - o.y / 240, .3, 1); c.beginPath(); c.ellipse(o.x + o.w / 2, GY + 2, 16 * s, 3.2 * s, 0, 0, TAU); c.fill(); }
      spr(c, name, o.x + o.w / 2, GY - o.y, o.h, false, o.y > 2 ? o.anim * 5 : 0);
    } else spr(c, name, o.x + o.w / 2, GY - o.y, o.h);
  }

  /* ---------------- world ---------------- */
  function resetRun() {
    obstacles = []; pickups = []; powers = []; parts = []; texts = []; fx = [];
    score = startLv * LVLEN; drops = 0; speed = 235; scroll = 0; grace = 2.4; gapLeft = 380; shake = 0; flash = 0; night = 0; nightSeen = false;
    lv = startLv; prevLv = -1; lvFade = 1; maxLv = startLv; powerLeft = 12; landT = 0;
    buff.shield = false; buff.slow = 0; buff.magnet = 0; buff.double = 0; mon = { L: LEVELS[startLv].id, x: VW * .55 };
    Object.assign(p, { h: 0, vy: 0, phase: 0, duck: false, dead: false, was: 0 });
  }
  const curL = () => LEVELS[lv];

  function spawn() {
    const L = curL(), sc = score, v = speed;
    const gmin = Math.max(.9, 1.25 - sc / 2600), gap = v * rnd(gmin, gmin + .8);
    const x = VW + 50; let o;
    const roll = Math.random();
    if (roll < (sc > 150 ? .32 : 0)) {
      const pool = sc % LVLEN > 380 || sc > LVLEN ? L.en : L.en.slice(0, 2), E = pool[Math.floor(Math.random() * pool.length)], which = E.i, im = sp(`${L.id}_e${which}_0`);
      const w = im ? im.width * E.h / im.height : 40;
      o = { type: 'fly', kind: E.kind, E, which, L: L.id, x, w, h: E.h, y: 0, vx: 0, anim: rnd(0, 3), ph: 0, falling: false };
      if (E.kind === 'fly') { const lvY = [18, 40, 88][Math.floor(Math.random() * 3)]; o.y = lvY; o.vx = 40; o.box = [w * .2, E.h * .2, w * .6, E.h * .6]; }
      else if (E.kind === 'hang') { o.y = 40; o.box = [w * .15, 0, w * .7, E.h * .45]; }
      else if (E.kind === 'roll') { o.y = 0; o.vx = 110; o.box = [w * .15, 2, w * .7, E.h * .8]; }
      else if (E.kind === 'leap') { o.y = 20; o.vx = 90; o.box = [w * .2, E.h * .2, w * .6, E.h * .6]; }
      else if (E.kind === 'fall') { o.y = 260; o.vx = 0; o.box = [w * .22, E.h * .15, w * .56, E.h * .7]; }
    } else {
      const pool = L.ob.map((h, i) => ({ i, h })).filter(e => e.h <= Math.min(66, 44 + (sc % LVLEN) * .03 + (sc > LVLEN ? 20 : 0)));
      const pick = pool[Math.floor(Math.random() * pool.length)] || { i: 0, h: L.ob[0] };
      const im = sp(`${L.id}_ob${pick.i}`);
      const h = pick.h, w = im ? im.width * h / im.height : 30;
      o = { type: 'ground', name: `${L.id}_ob${pick.i}`, x, y: 0, w, h, vx: 0, box: [w * .16, 2, w * .68, h * .88] };
    }
    obstacles.push(o);
    const dropsKind = 'drop';
    if (o.type === 'ground' && Math.random() < .6) {
      const nD = 4, y0 = o.h + 20, amp = Math.min(46, 112 - y0);
      for (let i = 0; i < nD; i++) pickups.push({ x: o.x - 10 + (o.w + 20) * i / (nD - 1), y: y0 + Math.sin(Math.PI * i / (nD - 1)) * amp, ph: rnd(0, TAU), kind: dropsKind });
    } else if (o.kind === 'hang' || (o.kind === 'fly' && o.y === 40)) {
      for (let i = 0; i < 3; i++) pickups.push({ x: o.x + 4 + i * 20, y: 14, ph: rnd(0, TAU), kind: dropsKind });
    } else if (Math.random() < .35) {
      const cx = o.x + o.w + gap * .5;
      for (let i = 0; i < 3; i++) pickups.push({ x: cx + (i - 1) * 28, y: 16 + (i === 1 ? 6 : 0), ph: rnd(0, TAU), kind: dropsKind });
    }
    gapLeft = gap + o.w;
  }

  function spawnPower() {
    const kinds = Object.keys(POWER); const k = kinds[Math.floor(Math.random() * kinds.length)];
    powers.push({ kind: k, x: VW + 40, y: rnd(46, 84), ph: rnd(0, TAU) });
  }
  function addFx(pre, n, x, y, size, fps, o = {}) { if (reducedMotion) return; fx.push(Object.assign({ pre, n, x, y, size, fps, t: 0 }, o)); }
  function burst(x, y, n, col, sp2 = 90) {
    if (reducedMotion) return;
    for (let i = 0; i < n; i++) { const a = rnd(0, TAU), s = rnd(.3, 1) * sp2; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: rnd(.35, .7), max: .7, col, r: rnd(1, 2.3) }); }
  }
  function hurt() {
    state = 'dead'; p.dead = true; deadAt = performance.now(); deadT = 0;
    shake = reducedMotion ? 0 : .32; flash = reducedMotion ? 0 : .5;
    addFx('fx_hit_', 6, PX, GY - p.h - 36, 96, 14);
    burst(PX, GY - p.h - 30, 14, 'rgba(244,239,232,1)', 160);
    if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) { /* ignore */ } }
    store.runs++; const pts = Math.floor(score);
    if (pts > store.best) store.best = pts;
    entryId = Date.now();
    if (pts > 0) store.board.push({ id: entryId, n: store.name || 'Tu', s: pts });
    store.board = board();
    persist(); emit('board', board()); emit('over', { score: pts, drops, best: store.best });
    setTimeout(showEnd, reducedMotion ? 200 : 800);
  }
  function checkBadges() {
    for (const k in BADGES) {
      if (!store.badges[k] && BADGES[k].test({ score, nightSeen, lv, maxLv, drops })) {
        store.badges[k] = 1; persist(); toast('Traguardo: ' + BADGES[k].label); emit('badge', { key: k, label: BADGES[k].label });
      }
    }
  }
  function hits(o) {
    const bx = o.x + o.box[0], by = o.y + o.box[1], bw = o.box[2], bh = o.box[3];
    const px0 = PX - 9, px1 = PX + 9 + (p.duck ? 10 : 0), py0 = p.h + 2, py1 = p.h + (p.duck ? 32 : 62);
    return px1 > bx && px0 < bx + bw && py1 > by && py0 < by + bh;
  }

  /* level change: crossfade + postcard */
  const popEl = $('[data-pop]');
  function enterLevel(n, first) {
    prevLv = lv; lv = n; lvFade = first ? 1 : 0; if (n > maxLv) maxLv = n;
    mon = { L: LEVELS[n].id, x: VW + 80 };
    if (first) return;
    grace = Math.max(grace, .9); gapLeft = Math.max(gapLeft, 300);
    const L = curL();
    if (popEl) {
      const im = $('[data-pop-img]'); const tt = $('[data-pop-t]'); const ss = $('[data-pop-s]');
      if (im && URLS[L.id + '_card']) im.src = URLS[L.id + '_card'];
      if (tt) tt.textContent = L.name; if (ss) ss.textContent = L.sub;
      popEl.classList.remove('on'); void popEl.offsetWidth; popEl.classList.add('on');
      clearTimeout(popEl._t); popEl._t = setTimeout(() => popEl.classList.remove('on'), 1700);
    }
    emit('level', { index: n, name: L.name });
    if (hud.lv) hud.lv.textContent = L.name;
  }

  /* ---------------- update ---------------- */
  function update(dt) {
    t += dt;
    if (state === 'pause') return;
    const living = state === 'play';
    const L = curL();
    // night (only levels with a night range)
    let nTarget = 0;
    if (L.night && state !== 'idle') { const pr = (score % LVLEN) / LVLEN; nTarget = smooth((pr - L.night[0]) / (L.night[1] - L.night[0])); }
    night = nTarget;
    if (L.night && night > .6) nightSeen = true;
    if (lvFade < 1) lvFade = Math.min(1, lvFade + dt / .7);

    const slowK = buff.slow > 0 ? .7 : 1;
    const target = state === 'idle' ? 200 : state === 'play' ? Math.min(520, 235 + score * .22) * slowK : 0;
    speed += (target - speed) * (1 - Math.exp(-dt * (state === 'dead' ? 7 : 3)));
    scroll += speed * dt;
    if (mon) mon.x -= speed * dt * (LEVELS.find(l => l.id === mon.L) || L).mon.par;

    if (living) {
      p.duck = duckHold && p.h <= .5;
      let g = G;
      if (duckHold && p.h > .5) g *= 2.4;
      if (!jumpHeld && p.vy > 330) p.vy = 330;
      const was = p.h;
      p.vy -= g * dt; p.h += p.vy * dt;
      if (p.h <= 0) {
        if (was > 6) { landT = .12; addFx('fx_dust_', 6, PX, GY - 6, 70, 16); addFx('fx_dust_', 6, PX - 14, GY - 10, 36, 14); }
        p.h = 0; p.vy = 0;
      }
      landT = Math.max(0, landT - dt);
      p.phase += dt * (9 + speed * .012);
      score += speed * dt * .04 * (buff.double > 0 ? 2 : 1);
      if (grace > 0) grace -= dt;
      gapLeft -= speed * dt;
      if (grace <= 0 && gapLeft <= 0) spawn();
      powerLeft -= dt; if (powerLeft <= 0 && grace <= 0) { spawnPower(); powerLeft = rnd(14, 22); }
      
      const nl = Math.floor(score / LVLEN) % LEVELS.length;
      if (nl !== lv) enterLevel(nl);
      const sc = Math.floor(score);
      buff.slow = Math.max(0, buff.slow - dt); buff.magnet = Math.max(0, buff.magnet - dt); buff.double = Math.max(0, buff.double - dt);
      checkBadges();
      if (sc !== lastScore) { lastScore = sc; setHud(); emit('score', sc); }
    } else if (state === 'idle') {
      p.phase += dt * (9 + speed * .012); p.h = 0; p.duck = false;
      if (obstacles.length) obstacles = [];
    } else if (state === 'dead') {
      deadT += dt;
      p.vy -= G * .6 * dt; p.h = Math.max(0, p.h + p.vy * dt); if (p.h === 0) p.vy = 0;
    }

    for (const o of obstacles) {
      o.anim = (o.anim || 0) + dt;
      if (o.type === 'ground') o.x -= speed * dt;
      else {
        o.x -= (speed + (o.vx || 0)) * dt;
        if (o.kind === 'leap') { o.ph += dt * 3.6; o.y = 8 + Math.abs(Math.sin(o.ph)) * 86; }
        if (o.kind === 'fall') {
          if (!o.falling && o.x < PX + 300) o.falling = true;
          if (o.falling && o.y > 0) { o.y -= 340 * dt; if (o.y <= 0) { o.y = 0; o.vx = 0; addFx('fx_dust_', 6, o.x + o.w / 2, GY - 6, 44, 14); shake = Math.max(shake, reducedMotion ? 0 : .12); } }
          if (o.y <= 0) o.vx = 0;
          if (o.falling) o.vx = 0;
        }
      }
      if (living && !godMode && hits(o)) {
        if (buff.shield) { buff.shield = false; o.dead = true; burst(o.x + o.w / 2, GY - o.y - o.h / 2, 12, 'rgba(240,204,116,1)', 140); addFx('fx_hit_', 6, o.x + o.w / 2, GY - o.y - o.h / 2, 70, 16); toast('Cornetto: salvo!'); shake = reducedMotion ? 0 : .12; }
        else hurt();
      }
    }
    obstacles = obstacles.filter(o => !o.dead && o.x + o.w > -90);

    for (const k of pickups) {
      k.x -= speed * dt;
      if (living && !k.got) {
        const cy = p.h + (p.duck ? 14 : 30);
        if (buff.magnet > 0 && Math.hypot(k.x - PX, GY - k.y - (GY - cy)) < 170) { k.x += (PX - k.x) * Math.min(1, dt * 7); k.y += (cy - k.y) * Math.min(1, dt * 7); }
        if (Math.hypot(k.x - PX, k.y - cy) < 24) {
          k.got = true; drops++; const val = k.kind === 'berg' ? 25 : 10; score += val;
          addFx('fx_spark_', 6, k.x, GY - k.y, 34, 18);
          texts.push({ x: k.x, y: GY - k.y, life: .7, s: '+' + val });
          setHud(); emit('drops', drops);
        }
      }
    }
    pickups = pickups.filter(k => k.x > -40 && !k.got);

    for (const k of powers) {
      k.x -= speed * dt;
      if (living && !k.got) {
        const cy = p.h + (p.duck ? 14 : 30);
        if (Math.hypot(k.x - PX, k.y - cy) < 28) { k.got = true; takePower(k.kind); }
      }
    }
    powers = powers.filter(k => k.x > -40 && !k.got);

    for (const q of parts) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 240 * dt; }
    parts = parts.filter(q => q.life > 0);
    for (const q of fx) { q.t += dt; if (q.vx) q.x += q.vx * dt; if (q.vy) q.y += q.vy * dt; if (q.pre === 'fx_dust_') q.x -= speed * dt; }
    fx = fx.filter(q => q.t * q.fps < q.n);
    for (const q of texts) { q.life -= dt; q.y -= 34 * dt; }
    texts = texts.filter(q => q.life > 0);
    shake = Math.max(0, shake - dt); flash = Math.max(0, flash - dt * 2.2);

    if (living && p.h <= .5 && !p.duck && Math.random() < dt * 5 && !reducedMotion) addFx('fx_dust_', 6, PX - 22, GY - 8, 22, 14, { follow: true });
    if (living && p.duck && Math.random() < dt * 8 && !reducedMotion) addFx('fx_dust_', 6, PX - 26, GY - 8, 26, 16, { follow: true });
  }

  function takePower(kind) {
    const P = POWER[kind];
    toast(P.label); addFx('fx_spark_', 6, PX, GY - p.h - 36, 60, 16);
    if (kind === 'corno') buff.shield = true;
    else if (kind === 'asciugamano') buff.slow = P.dur;
    else if (kind === 'flacone') buff.magnet = P.dur;
    else if (kind === 'doppio') buff.double = P.dur;
    else if (kind === 'moneta') { score += 50; texts.push({ x: PX, y: GY - p.h - 70, life: .9, s: '+50' }); }
    else if (kind === 'forbici') {
      let n = 0;
      for (const o of obstacles) if (o.x < VW + 20) { o.dead = true; n++; burst(o.x + o.w / 2, GY - o.y - o.h / 2, 8, 'rgba(244,239,232,1)', 110); addFx('fx_hit_', 6, o.x + o.w / 2, GY - o.y - o.h / 2, 56, 18); }
      score += n * 5; if (n) texts.push({ x: PX + 40, y: GY - 80, life: .9, s: '+' + n * 5 });
    }
    setHud();
  }

  /* ---------------- render ---------------- */
  function drawFx(c) {
    for (const q of fx) {
      const f = sp(q.pre + Math.min(q.n - 1, Math.floor(q.t * q.fps))); if (!f) continue;
      const w = q.size, h = w * f.height / f.width;
      if (q.pre === 'fx_dust_') { c.drawImage(f, q.x - w / 2, GY + 1 - h * .95, w, h); continue; } // sprite has ~5% empty margin below: sit on the floor
      c.drawImage(f, q.x - w / 2, q.y - h * .5, w, h);
    }
  }
  function render() {
    if (!cssW || !ready) return;
    ctx.setTransform(S * DPR, 0, 0, S * DPR, 0, 0);
    if (shake > 0) { const m = shake * 18; ctx.translate(rnd(-m, m), rnd(-m, m)); }
    const L = curL();
    const nk = L.night ? night : 0;
    if (lvFade < 1 && prevLv >= 0) {
      scene(ctx, LEVELS[prevLv], LEVELS[prevLv].night ? 1 : 0);
      octx.setTransform(S * DPR, 0, 0, S * DPR, 0, 0); scene(octx, L, nk);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = smooth(lvFade); ctx.drawImage(oc, 0, 0); ctx.restore();
    } else scene(ctx, L, nk);
    for (const k of pickups) { const bob = Math.sin(t * 4 + k.ph) * 2.5; spr(ctx, 'drop_' + (Math.floor(t * 10 + k.ph * 3) % 6), k.x, GY - k.y + bob + 9, 18); }
    for (const k of powers) { const bob = Math.sin(t * 3 + k.ph) * 3; spr(ctx, POWER[k.kind].img, k.x, GY - k.y + bob + 14, 28); }
    for (const o of obstacles) drawObstacle(ctx, o);
    drawHero(ctx);
    drawFx(ctx);
    if (lvFade < 1 && prevLv >= 0) { ctx.globalAlpha = 1 - smooth(lvFade); drawFg(ctx, LEVELS[prevLv]); ctx.globalAlpha = smooth(lvFade); drawFg(ctx, L); ctx.globalAlpha = 1; } else drawFg(ctx, L);
    for (const q of parts) { ctx.globalAlpha = clamp(q.life / q.max, 0, 1); ctx.fillStyle = q.col; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.font = '800 15px Archivo, system-ui, sans-serif'; ctx.textAlign = 'center';
    for (const q of texts) { ctx.fillStyle = `rgba(244,220,150,${clamp(q.life * 2, 0, 1)})`; ctx.strokeStyle = 'rgba(5,27,30,.7)'; ctx.lineWidth = 3; ctx.strokeText(q.s, q.x, q.y - 8); ctx.fillText(q.s, q.x, q.y - 8); }
    // power-up timers
    let bx = VW / 2 - 40; const by = 10;
    const chip = (img, frac) => { spr(ctx, img, bx, by + 22, 22); if (frac < 1) { ctx.fillStyle = 'rgba(244,239,232,.9)'; ctx.fillRect(bx - 11, by + 26, 22 * frac, 2.5); } bx += 30; };
    if (buff.shield) chip('pw_corno', 1); if (buff.slow > 0) chip('pw_asciugamano', buff.slow / POWER.asciugamano.dur); if (buff.magnet > 0) chip('pw_flacone', buff.magnet / POWER.flacone.dur); if (buff.double > 0) chip('pw_doppio', buff.double / POWER.doppio.dur);
    const vg = ctx.createRadialGradient(VW / 2, VH * .55, VH * .5, VW / 2, VH * .55, VW * .78);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(2,20,23,${.16 + nk * .14})`);
    ctx.fillStyle = vg; ctx.fillRect(-20, -20, VW + 40, VH + 40);
    if (flash > 0) { ctx.fillStyle = `rgba(244,239,232,${flash * .5})`; ctx.fillRect(-20, -20, VW + 40, VH + 40); }
  }

  /* ---------------- loop ---------------- */
  let raf = 0, last = 0, inView = true;
  const frame = ts => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
    update(dt); render();
  };
  const startLoop = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stopLoop = () => { cancelAnimationFrame(raf); raf = 0; };
  const sync = () => { if (inView && !document.hidden) startLoop(); else { stopLoop(); if (state === 'play') pause(); } };

  /* ---------------- DOM: overlays + HUD ---------------- */
  const pad = n => String(Math.max(0, n | 0)).padStart(5, '0');
  const hud = { score: $('[data-score]'), best: $('[data-best]'), drops: $('[data-drops]'), lv: $('[data-level]') };
  const ov = { start: $('[data-ov="start"]'), end: $('[data-ov="end"]') };
  const toastEl = $('[data-toast]');
  let toastT = 0;
  function toast(msg) { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 2400); }
  const hudLast = {};
  const put = (el, k, v) => { if (el && hudLast[k] !== v) { hudLast[k] = v; el.textContent = v; } }; // touch the DOM only when a value changes
  function setHud() {
    put(hud.score, 's', pad(score)); put(hud.best, 'b', pad(store.best)); put(hud.drops, 'd', String(drops));
  }
  function show(el, on) { if (!el) return; el.hidden = !on; }
  function setState(s) { state = s; root.dataset.state = s; emit('state', s); }

  function showEnd() {
    if (state !== 'dead') return;
    const pts = Math.floor(score);
    $('[data-end-score]').textContent = pad(pts);
    $('[data-end-drops]').textContent = drops; const dl = $('[data-end-dl]'); if (dl) dl.textContent = drops === 1 ? 'goccia d’oro' : 'gocce d’oro';
    $('[data-end-best]').textContent = pad(store.best);
    const lvl = $('[data-end-level]'); if (lvl) lvl.textContent = curL().name;
    const isBest = pts >= store.best && pts > 0;
    $('[data-end-kicker]').textContent = isBest ? 'Nuovo record! Riprova a batterlo' : 'Peccato! Riprova';
    const inTop = board().some(e => e.id === entryId);
    const nameWrap = $('[data-name-wrap]'); const input = nameWrap && nameWrap.querySelector('input');
    if (nameWrap) { nameWrap.hidden = !inTop; if (input && inTop) input.value = store.name || ''; }
    show(ov.end, true); root.classList.remove('run-playing');
    const again = $('[data-again]'); if (again && !coarse) again.focus({ preventScroll: true });
  }
  function saveName() {
    const input = $('[data-name-wrap] input'); if (!input) return;
    const v = input.value.trim().slice(0, 12);
    if (v) { store.name = v; const e = store.board.find(x => x.id === entryId); if (e) e.n = v; persist(); emit('board', board()); }
  }
  function start() {
    if (state === 'play' || !ready) return;
    saveName(); show(ov.end, false); show(ov.start, false);
    resetRun(); setState('play'); root.classList.add('run-playing'); setHud(); emit('start');
    if (hud.lv) hud.lv.textContent = curL().name;
    if (store.runs >= 3) root.classList.add('zone-off');
  }
  function menu() {                       // back to the start screen from the end screen
    show(ov.end, false); resetRun(); setState('idle'); root.classList.remove('run-playing');
    if (ov.start) { ov.start.dataset.mode = ''; show(ov.start, true); } setHud();
  }
  function pause() { if (state !== 'play') return; setState('pause'); root.classList.remove('run-playing'); const s = ov.start; if (s) { s.dataset.mode = 'pause'; show(s, true); } }
  function resume() { if (state !== 'pause') return; show(ov.start, false); ov.start.dataset.mode = ''; setState('play'); root.classList.add('run-playing'); last = performance.now(); }
  function jump() {
    if (state === 'idle' || state === 'dead') { if (state === 'dead' && performance.now() - deadAt < 800) return; return start(); }
    if (state === 'pause') return resume();
    if (state !== 'play') return;
    jumpHeld = true;
    if (p.h <= .5) { p.vy = JUMP; p.duck = false; addFx('fx_dust_', 6, PX - 6, GY - 8, 30, 16); }
  }

  /* ---------------- input ---------------- */
  const typing = () => { const a = document.activeElement; return a && /^(input|textarea|select)$/i.test(a.tagName); };
  let hovering = true;
  root.addEventListener('pointerenter', () => hovering = true);
  root.addEventListener('pointerleave', () => hovering = false);
  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || typing()) return;
    const active = state === 'play' || hovering || root.contains(document.activeElement);
    if (!active || !inView) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (e.target.closest && e.target.closest('a,button') && state !== 'play') return;
      e.preventDefault(); if (!e.repeat) jump();
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); duckHold = true; }
    else if (e.code === 'Enter' && state === 'dead' && !e.target.closest('a,button')) { e.preventDefault(); jump(); }
  });
  window.addEventListener('keyup', e => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') jumpHeld = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') duckHold = false;
  });
  const arena = $('.run-stage') || root;
  arena.addEventListener('pointerdown', e => {
    if (e.target.closest('a,button,input,label')) return;
    if (state === 'play') {
      const r = canvas.getBoundingClientRect();
      if (e.pointerType !== 'mouse' && (e.clientY - r.top) / r.height > .68) { duckHold = true; return; }
      e.preventDefault(); jump();
    } else if (state === 'idle' || state === 'pause') jump();
  });
  const release = () => { jumpHeld = false; duckHold = false; };
  window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release);
  $$('[data-start]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); if (state === 'pause') resume(); else start(); }));
  $$('[data-menu]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); menu(); }));
  $$('[data-again]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); start(); }));
  const nameInput = $('[data-name-wrap] input');
  if (nameInput) { nameInput.addEventListener('change', saveName); nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveName(); start(); } }); }

  new IntersectionObserver(es => { inView = es[0].intersectionRatio > .25; sync(); }, { threshold: [0, .25, .6] }).observe(root);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(layout).observe(canvas);

  /* ---------------- boot ---------------- */
  root.dataset.state = 'loading'; root.classList.add('is-loading');
  layout(); resetRun(); state = 'idle'; speed = 200; grace = 99;
  setHud(); emit('board', board()); emit('badges', store.badges);
  loadAll().then(() => {
    prep(); ready = true; root.classList.remove('is-loading'); root.dataset.state = 'idle';
    if (hud.lv) hud.lv.textContent = '';
    (document.fonts && document.fonts.load ? document.fonts.load('800 15px Archivo') : Promise.resolve()).finally(() => { layout(); startLoop(); emit('ready'); });
  });

  return {
    start, pause, resume, menu, board, badges: () => ({ ...store.badges }), labels: BADGES, badgeImg: BADGE_IMG, levels: LEVELS,
    debug: {
      get state() { return state; }, get score() { return score; }, get night() { return night; }, get drops() { return drops; }, get speed() { return speed; }, get level() { return lv; }, get ready() { return ready; },
      player: () => ({ ...p, x: PX }), obstacles: () => obstacles.map(o => ({ type: o.type, kind: o.kind, x: o.x, y: o.y, w: o.w, h: o.h })),
      setScore: n => { score = n; }, godMode: v => { godMode = v; }, reset: () => { store = { best: 0, runs: 0, name: '', board: [], badges: {} }; persist(); },
      setLevel: n => { startLv = n; }, power: k => takePower(k), jumpAxes: () => ({ JUMP, G, GY, VW, VH, S }),
    },
  };
}
