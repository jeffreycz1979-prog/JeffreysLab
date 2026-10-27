// ═══════════════════════════════════════════════════════
//  英文島 3D 地圖（由 index.html 在選 3D 時才載入）
//  Three.js 0.160.1；低多邊形地形、地塊、景物全部用程式產生
//  與 index.html 的溝通都透過 host（進度、角色圖、點地塊、開單元面板）
// ═══════════════════════════════════════════════════════
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const W = (sx, sy) => [(sx - 195) / 10, (sy - 230) / 10];   // 2D 座標（390×460）→ 3D，每 10px＝1 單位
const ISLAND = [[44, 432], [4, 372, 6, 262, 30, 196], [50, 132, 16, 70, 84, 34], [150, 2, 270, -4, 330, 34], [386, 72, 380, 160, 370, 228], [360, 300, 386, 382, 326, 430], [262, 470, 104, 474, 44, 432]];
const GRASS = [[58, 418], [28, 366, 28, 270, 48, 206], [66, 144, 40, 86, 96, 52], [154, 22, 262, 18, 316, 50], [362, 82, 358, 160, 350, 226], [342, 296, 364, 372, 314, 414], [258, 450, 112, 452, 58, 418]];
const C = {
  ink: 0x1a3a1a, lime: 0xCCFF00, limeD: 0x9FCC00, mint: 0x4ECDC4, mintD: 0x2A8E86, sand: 0xF1E3BE, grass: 0x9BD06E,
  white: 0xffffff, cream: 0xEFE8D8, locked: 0xC9C5BC, lockedD: 0xB0ABA0, road: 0xE6D7B5, water: 0x5FC8DA, waterL: 0x8FDDEA,
  trunk: 0x8B5A2B, leaf: 0x5FB35A, leafL: 0x86CF6E, pine: 0x3E9150, rock: 0xB7B2A6, mount: 0x8FB58C, coral: 0xFF6B57, faded: 0xDDE6B0,
};
// 景物位置：沿用 2D 版的安排（6 格與 9 格版面各一套）
const DECOR = {
  6: {
    lake: [84, 284, 4, 2.1], river: [[354, 224], [366, 238], [382, 246]],
    mountains: [[300, 222, 2.6, 4.2, false], [334, 214, 4, 7.5, true], [362, 222, 2, 3.4, false]],
    trees: [['t', 108, 82, 1], ['p', 130, 70, .9], ['t', 156, 56, .8], ['p', 180, 50, .75], ['p', 318, 86, .85], ['t', 342, 108, .8],
      ['t', 270, 406, 1], ['p', 296, 398, 1.1], ['t', 322, 414, .95], ['p', 312, 382, .8], ['t', 344, 394, .8], ['t', 136, 314, .75], ['t', 40, 330, .7]],
    rocks: [[364, 346, .9], [352, 356, .6], [136, 214, .7]],
    flowers: [[124, 428, 0xFF9AC1], [134, 436, 0xFFD84D], [116, 440, 0xffffff], [252, 354, 0xFF6B57], [262, 362, 0xFFD84D], [58, 340, 0xFF9AC1], [226, 440, 0xffffff], [124, 238, 0xFFD84D], [134, 246, 0xFF9AC1], [182, 188, 0xffffff]],
  },
  9: {
    lake: [190, 218, 4.4, 1.9], river: null,
    mountains: [[312, 226, 2.2, 3.6, false], [342, 220, 3, 5.6, true], [366, 226, 1.6, 2.8, false]],
    trees: [['t', 92, 98, .9], ['p', 118, 84, .85], ['t', 150, 74, .8], ['p', 184, 66, .75], ['p', 246, 64, .8], ['t', 272, 56, .75], ['t', 128, 330, .8], ['t', 112, 300, .6]],
    rocks: [[248, 450, .7]],
    flowers: [[248, 214, 0xFF9AC1], [258, 222, 0xFFD84D], [118, 226, 0xffffff], [262, 448, 0xFF6B57], [270, 440, 0xFFD84D], [108, 432, 0xFF9AC1]],
  },
};
const GROUND = 1.0, PLAT = 4.3, PLAT_R = PLAT / Math.SQRT2;
const ease = (k) => (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
// 走路：前後 15% 加速／減速，中間等速（看起來像在走，不像在滑）
const walkEase = (k, r = 0.15) => { const v = 1 / (1 - r); return k < r ? 0.5 * v * k * k / r : k < 1 - r ? v * (k - r / 2) : 1 - 0.5 * v * (1 - k) * (1 - k) / r; };

export async function createIsland3D(el, host) {
  // ── 繪圖器 ──
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('WebGL 無法使用');
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'none';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xC9EEEA);
  scene.fog = new THREE.Fog(0xC9EEEA, 90, 170);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 400);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8fbf8f, 1.25));
  const sun = new THREE.DirectionalLight(0xfff2d6, 2.1);
  sun.position.set(-30, 45, 20);
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
  sun.shadow.bias = -0.0015;
  scene.add(sun);

  // 畫質：high＝有陰影；low＝關陰影。解析度另外依 fps 隨時微調（見 adaptQuality）
  let quality = host.quality();   // 'high' | 'low'
  const prMax = () => Math.min(devicePixelRatio, quality === 'high' ? 2 : 1.25);
  let pr = prMax();
  function applyQuality() {
    const hi = quality === 'high';
    pr = Math.min(pr, prMax()); renderer.setPixelRatio(pr);
    renderer.shadowMap.enabled = hi; sun.castShadow = hi;
    scene.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => (m.needsUpdate = true)); });
  }
  function setPR(v) { if (Math.abs(v - pr) < 0.01) return; pr = v; renderer.setPixelRatio(pr); }

  const mats = {};
  const M = (color, opts = {}) => { const k = color + JSON.stringify(opts); return mats[k] || (mats[k] = new THREE.MeshLambertMaterial({ color, flatShading: true, ...opts })); };
  const mesh = (geo, mat, x = 0, y = 0, z = 0, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; return m; };
  const flat = (geo) => { geo.rotateX(-Math.PI / 2); return geo; };
  function shapeFrom(pts, k = 1) {
    const s = new THREE.Shape(), P = (x, y) => { const [a, b] = W(x, y); return [a * k, -b * k]; };
    s.moveTo(...P(pts[0][0], pts[0][1]));
    for (let i = 1; i < pts.length; i++) { const p = pts[i]; s.bezierCurveTo(...P(p[0], p[1]), ...P(p[2], p[3]), ...P(p[4], p[5])); }
    return s;
  }

  // ── 島與海（固定，不隨進度改變）──
  scene.add(mesh(flat(new THREE.ShapeGeometry(shapeFrom(ISLAND, 1.12), 24)), M(C.waterL), 0, -0.35, 0, false));
  const sandGeo = new THREE.ExtrudeGeometry(shapeFrom(ISLAND), { depth: 1.2, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.8, bevelSegments: 1, curveSegments: 18 });
  sandGeo.rotateX(-Math.PI / 2); scene.add(mesh(sandGeo, M(C.sand), 0, -1.2, 0, false));
  const grassGeo = new THREE.ExtrudeGeometry(shapeFrom(GRASS), { depth: 0.5, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.5, bevelSegments: 1, curveSegments: 18 });
  grassGeo.rotateX(-Math.PI / 2); scene.add(mesh(grassGeo, M(C.grass), 0, 0.3, 0, false));
  const seaGeo = flat(new THREE.PlaneGeometry(260, 260, 40, 40));
  const seaBase = seaGeo.attributes.position.array.slice();
  scene.add(mesh(seaGeo, M(C.water, { transparent: true, opacity: 0.94 }), 0, -0.6, 0, false));

  function ribbon(pts, width, y) {
    const pos = [], idx = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b.x - a.x, dz = b.y - a.y, L = Math.hypot(dx, dz) || 1, nx = -dz / L * width / 2, nz = dx / L * width / 2;
      pos.push(p.x + nx, y, p.y + nz, p.x - nx, y, p.y - nz);
      if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }

  // ── 會隨版面（6／9 格）重建的部分：小路、景物 ──
  const layoutG = new THREE.Group(); scene.add(layoutG);
  const sway = [], drifters = [], bobbers = [];
  let ROAD_PTS = [], ROAD_LEN = [], curLay = null, posList = [];
  function roadAt(l) {
    let i = ROAD_LEN.findIndex((v) => v >= l); if (i < 1) i = 1;
    const t = (l - ROAD_LEN[i - 1]) / ((ROAD_LEN[i] - ROAD_LEN[i - 1]) || 1), a = ROAD_PTS[i - 1], b = ROAD_PTS[i];
    return { x: a.x + (b.x - a.x) * t, z: a.y + (b.y - a.y) * t };
  }
  function buildLayout(L) {
    curLay = L.lay; posList = L.pos;
    layoutG.clear(); sway.length = 0; bobbers.length = 0;
    // 小路：解析 2D 的 'M x y Q cx cy x y …'
    const n = L.road.match(/-?\d+(\.\d+)?/g).map(Number), path = new THREE.Path();
    path.moveTo(...W(n[0], n[1]));
    for (let i = 2; i + 3 < n.length; i += 4) { const a = W(n[i], n[i + 1]), b = W(n[i + 2], n[i + 3]); path.quadraticCurveTo(a[0], a[1], b[0], b[1]); }
    ROAD_PTS = path.getSpacedPoints(240); ROAD_LEN = [0];
    for (let i = 1; i < ROAD_PTS.length; i++) ROAD_LEN.push(ROAD_LEN[i - 1] + ROAD_PTS[i].distanceTo(ROAD_PTS[i - 1]));
    layoutG.add(mesh(ribbon(ROAD_PTS, 1.5, GROUND + 0.04), M(C.road, { side: THREE.DoubleSide }), 0, 0, 0, false));
    for (let i = 4; i < ROAD_PTS.length - 2; i += 6) {
      const p = ROAD_PTS[i], q = ROAD_PTS[i + 1], d = mesh(new THREE.BoxGeometry(0.42, 0.04, 0.16), M(C.white), p.x, GROUND + 0.08, p.y, false);
      d.rotation.y = -Math.atan2(q.y - p.y, q.x - p.x); layoutG.add(d);
    }
    const D = DECOR[L.lay];
    const at = (sx, sy) => W(sx, sy);
    D.trees.forEach(([kind, sx, sy, s]) => {
      const [x, z] = at(sx, sy), g = new THREE.Group(); g.position.set(x, GROUND, z); g.scale.setScalar(s);
      if (kind === 't') {
        g.add(mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.4, 6), M(C.trunk), 0, 0.7, 0));
        g.add(mesh(new THREE.IcosahedronGeometry(1.25, 0), M(C.leaf), 0, 2.2, 0));
        g.add(mesh(new THREE.IcosahedronGeometry(0.7, 0), M(C.leafL), -0.5, 2.7, 0.4));
      } else {
        g.add(mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.9, 6), M(C.trunk), 0, 0.45, 0));
        g.add(mesh(new THREE.ConeGeometry(1.2, 1.8, 7), M(C.pine), 0, 1.6, 0));
        g.add(mesh(new THREE.ConeGeometry(0.85, 1.5, 7), M(C.pine), 0, 2.5, 0));
      }
      g.rotation.y = sx * 0.37; layoutG.add(g); sway.push({ g, p: sx * 0.1 });
    });
    D.mountains.forEach(([sx, sy, r, h, snow]) => {
      const [x, z] = at(sx, sy);
      layoutG.add(mesh(new THREE.ConeGeometry(r, h, 6), M(C.mount), x, GROUND + h / 2 - 0.1, z));
      if (snow) layoutG.add(mesh(new THREE.ConeGeometry(r * 0.36, h * 0.36, 6), M(C.white), x, GROUND + h - h * 0.18 - 0.05, z));
    });
    if (D.river) layoutG.add(mesh(ribbon(D.river.map(([a, b]) => new THREE.Vector2(...at(a, b))), 0.6, GROUND + 0.06), M(C.waterL, { side: THREE.DoubleSide }), 0, 0, 0, false));
    D.rocks.forEach(([sx, sy, s]) => { const [x, z] = at(sx, sy), r = mesh(new THREE.DodecahedronGeometry(0.55 * s, 0), M(C.rock), x, GROUND + 0.25 * s, z); r.rotation.set(sx, sy, 0); layoutG.add(r); });
    D.flowers.forEach(([sx, sy, c]) => { const [x, z] = at(sx, sy); layoutG.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 4), M(0x3F8F43), x, GROUND + 0.2, z, false)); layoutG.add(mesh(new THREE.IcosahedronGeometry(0.16, 0), M(c), x, GROUND + 0.45, z, false)); });
    { // 湖
      const [sx, sy, rx, rz] = D.lake, [x, z] = at(sx, sy);
      const shore = mesh(flat(new THREE.CircleGeometry(1, 20)), M(0xC9E9A8), x, GROUND + 0.02, z, false); shore.scale.set(rx + 0.6, 1, rz + 0.5); layoutG.add(shore);
      const w = mesh(flat(new THREE.CircleGeometry(1, 20)), M(C.waterL), x, GROUND + 0.05, z, false); w.scale.set(rx, 1, rz); layoutG.add(w);
      [[-0.5, 0.3, 0.5], [0.55, -0.3, 0.4]].forEach(([a, b, r]) => layoutG.add(mesh(new THREE.CylinderGeometry(r, r, 0.06, 8), M(C.leaf), x + a * rx, GROUND + 0.09, z + b * rz, false)));
      const duck = new THREE.Group(); duck.position.set(x, GROUND + 0.15, z);
      duck.add(mesh(new THREE.SphereGeometry(0.32, 6, 5), M(C.white), 0, 0.1, 0)); duck.add(mesh(new THREE.SphereGeometry(0.2, 6, 5), M(C.white), 0.25, 0.42, 0));
      const beak = mesh(new THREE.ConeGeometry(0.08, 0.2, 4), M(0xFFB547), 0.48, 0.4, 0); beak.rotation.z = -Math.PI / 2; duck.add(beak);
      layoutG.add(duck); bobbers.push({ g: duck, y: duck.position.y, p: 1, swim: { cx: x, cz: z, rx: rx * 0.35, rz: rz * 0.3 } });
    }
  }
  // 雲與船（固定）
  [[-14, 13, -18, 1], [9, 15, -26, 1.2], [17, 12, 2, 0.8], [-20, 14, 14, 0.9]].forEach(([x, y, z, s]) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s);
    [[0, 0, 0, 1.4], [1.3, -0.2, 0.2, 1], [-1.3, -0.25, -0.1, 1.05], [0.4, 0.55, 0.1, 0.9]].forEach(([a, b, c, r]) => g.add(mesh(new THREE.IcosahedronGeometry(r, 1), M(C.white), a, b, c)));
    scene.add(g); drifters.push({ g, x0: x, p: x, sp: 0.15 + Math.abs(z) * 0.003 });
  });
  const boat = new THREE.Group(); { const [x, z] = W(380, 452); boat.position.set(x, -0.3, z); }
  boat.add(mesh(new THREE.BoxGeometry(2.2, 0.5, 0.9), M(C.coral), 0, 0, 0));
  boat.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 5), M(C.ink), 0, 1.2, 0));
  boat.add(mesh(new THREE.ConeGeometry(0.75, 1.6, 3), M(C.white), 0.35, 1.2, 0));
  scene.add(boat); const boatX = boat.position.x;

  // ── 地塊（隨進度重建）──
  const tilesG = new THREE.Group(); scene.add(tilesG);
  let tiles = [], pickables = [];
  const labelCache = {};
  function labelTex(text, dark) {
    const k = text + dark; if (labelCache[k]) return labelCache[k];
    const cv = document.createElement('canvas'); cv.width = 160; cv.height = 72;
    const g = cv.getContext('2d');
    g.fillStyle = dark ? '#1a3a1a' : '#ffffff'; g.strokeStyle = '#1a3a1a'; g.lineWidth = 7;
    g.beginPath(); g.roundRect(6, 6, 148, 60, 30); g.fill(); g.stroke();
    g.fillStyle = dark ? '#CCFF00' : '#1a3a1a'; g.font = '800 38px Syne, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 80, 38);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; return (labelCache[k] = tex);
  }
  const edgeMat = new THREE.LineBasicMaterial({ color: C.ink });
  function buildTiles(units) {
    tilesG.clear(); tiles = []; pickables = [];
    units.forEach((u, i) => {
      const p = posList[i]; if (!p) return;
      const [x, z] = W(p[0] + 48, p[1] + 66);
      const g = new THREE.Group(); g.position.set(x, GROUND, z); tilesG.add(g);
      const state = u.locked ? 'locked' : u.full ? 'full' : u.started ? 'started' : 'fresh';
      const top = { full: u.faded ? C.faded : C.lime, started: C.mint, fresh: C.white, locked: C.locked }[state];
      const side = { full: C.limeD, started: C.mintD, fresh: C.cream, locked: C.lockedD }[state];
      const plat = new THREE.Group(); g.add(plat);
      const base = mesh(new THREE.BoxGeometry(PLAT, 1.0, PLAT), [M(side), M(side), M(top), M(side), M(side), M(side)], 0, 0.5, 0);
      base.rotation.y = Math.PI / 4; base.userData.unit = u.code; plat.add(base); pickables.push(base);
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(base.geometry), edgeMat); edge.rotation.y = Math.PI / 4; edge.position.y = 0.5; plat.add(edge);
      for (let f = 0; f < u.floors; f++) {   // 每完成一站蓋一層樓
        const fl = mesh(new THREE.BoxGeometry(1.5, 0.7, 1.5), M(state === 'full' && !u.faded ? C.lime : C.white), 0, 1.35 + f * 0.74, 0);
        fl.rotation.y = Math.PI / 4; plat.add(fl);
        const fe = new THREE.LineSegments(new THREE.EdgesGeometry(fl.geometry), edgeMat); fe.rotation.y = Math.PI / 4; fe.position.copy(fl.position); plat.add(fe);
        [-1, 1].forEach((s) => { const w = mesh(new THREE.BoxGeometry(0.26, 0.24, 0.06), M(C.ink), s * 0.32, fl.position.y, 0.76, false); w.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4); w.rotation.y = Math.PI / 4; plat.add(w); });
      }
      if (state === 'full') {
        const topY = 1.0 + u.floors * 0.74;
        plat.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 6), M(C.ink), 0, topY + 1.1, 0));
        const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1.3, -0.3, 0, 0, -0.6, 0], 3)); fg.computeVertexNormals();
        const flag = mesh(fg, M(u.faded ? C.locked : C.lime, { side: THREE.DoubleSide }), 0.05, topY + 2.15, 0); flag.userData.flag = true; plat.add(flag);
      }
      if (state === 'locked') {
        const lock = new THREE.Group(); lock.position.y = 1.7; lock.userData.spin = true; plat.add(lock);
        lock.add(mesh(new THREE.BoxGeometry(1.1, 0.85, 0.5), M(C.white), 0, 0, 0));
        lock.add(mesh(new THREE.TorusGeometry(0.36, 0.11, 6, 12, Math.PI), M(C.ink), 0, 0.42, 0));
      }
      const lb = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex(u.code, u.sel), depthTest: false }));
      lb.scale.set(2.4, 1.08, 1); lb.center.set(0.5, 1.7); lb.renderOrder = 5; g.add(lb);
      tiles.push({ u, g, plat, x, z, sel: u.sel });
      plat.position.y = u.sel ? 0.45 : 0;
    });
  }
  function tileByCode(code) { return tiles.find((t) => t.u.code === code); }
  function groundAt(x, z) {
    for (const t of tiles) if (Math.abs(x - t.x) + Math.abs(z - t.z) < PLAT_R) return GROUND + 1.0 + t.plat.position.y;
    return GROUND + 0.05;
  }
  // 角色停的位置：小路上離地塊中心最近的點，退到距中心約 1.9（站在房子旁邊）
  function standLen(t) {
    const d = (i) => Math.hypot(ROAD_PTS[i].x - t.x, ROAD_PTS[i].y - t.z);
    let near = 0; ROAD_PTS.forEach((_, i) => { if (d(i) < d(near)) near = i; });
    let i = near; while (i > 0 && d(i) < 1.9) i--;
    if (d(i) < 1.9) { i = near; while (i < ROAD_PTS.length - 1 && d(i) < 1.9) i++; }
    return ROAD_LEN[i];
  }

  // ── 角色：學生捏的造型，做成永遠面向鏡頭的看板（含寵物）──
  const heroMat = new THREE.SpriteMaterial({ transparent: true, depthWrite: false });
  const hero = new THREE.Sprite(heroMat); hero.renderOrder = 4; scene.add(hero);
  const HERO_H = 5.4, HERO_CX = 0.424, HERO_CY = 0.021;
  hero.scale.set(HERO_H * 264 / 384, HERO_H, 1); hero.center.set(HERO_CX, HERO_CY);
  let heroKey = '', heroLen = 0, heroFlip = false, walking = null;
  async function refreshHero() {
    const k = host.heroKey(); if (k === heroKey) return; heroKey = k;
    const cv = await host.heroCanvas(); if (!cv) return;
    if (heroMat.map) heroMat.map.dispose();
    heroMat.map = new THREE.CanvasTexture(cv); heroMat.map.colorSpace = THREE.SRGBColorSpace; heroMat.needsUpdate = true;
    setFlip(heroFlip, true);
  }
  function setFlip(f, force) {
    if (!heroMat.map || (f === heroFlip && !force)) return; heroFlip = f;
    heroMat.map.repeat.x = f ? -1 : 1; heroMat.map.offset.x = f ? 1 : 0; hero.center.x = f ? 1 - HERO_CX : HERO_CX;
  }
  function placeHero(l) { const r = roadAt(l); hero.position.x = r.x; hero.position.z = r.z; }

  // ── 視角 ──
  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.08, enablePan: false, minDistance: 16, maxDistance: 85, maxPolarAngle: 1.32, minPolarAngle: 0.02, rotateSpeed: 0.7, zoomSpeed: 0.9 });
  // eye＝平視：鏡頭降到角色身後、看著角色（像在島上散步）
  const VIEWS = { bird: { polar: 0.9, az: 0.18, dist: 60 }, top: { polar: 0.03, az: 0, dist: 60 }, low: { polar: 1.22, az: 0.6, dist: 44 }, eye: { polar: 1.18, dist: 20, hero: true } };
  const FOLLOW = { polar: 1.02, dist: 26 };   // 走路時的跟隨鏡頭
  const fitK = () => Math.max(1, 1.05 / camera.aspect);
  const heroTarget = () => new THREE.Vector3(hero.position.x, hero.position.y + 2.2, hero.position.z);
  let fly = null, follow = false, view = 'bird';
  function setView(name, instant) {
    const v = VIEWS[name] || VIEWS.bird; view = VIEWS[name] ? name : 'bird';
    const toT = v.hero ? heroTarget() : new THREE.Vector3();
    const az = v.az != null ? v.az : new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)).theta;   // 平視：保留目前的方向
    const to = toT.clone().add(new THREE.Vector3().setFromSpherical(new THREE.Spherical(v.dist * (v.hero ? 1 : fitK()), v.polar, az)));
    follow = false;
    if (instant) { camera.position.copy(to); controls.target.copy(toT); fly = null; return; }
    fly = { t0: performance.now(), dur: 900, fromP: camera.position.clone(), toP: to, fromT: controls.target.clone(), toT };
  }
  function focus(t) {
    const off = camera.position.clone().sub(controls.target); off.setLength(Math.min(off.length(), 40 * fitK()));
    const target = new THREE.Vector3(t.x, GROUND, t.z);
    fly = { t0: performance.now(), dur: 800, fromP: camera.position.clone(), toP: target.clone().add(off), fromT: controls.target.clone(), toT: target };
  }
  function resize() {
    const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px';
    camera.aspect = w / h; camera.updateProjectionMatrix();
    controls.maxDistance = 85 * fitK(); scene.fog.near = 90 * fitK(); scene.fog.far = 170 * fitK();
  }
  const ro = new ResizeObserver(resize); ro.observe(el);
  controls.addEventListener('start', () => { fly = null; });

  // ── 走路路線：黃色圓點沿小路排到目的地，走過的點消失；終點一支倒立的旗標上下浮動 ──
  const routeG = new THREE.Group(); scene.add(routeG);
  const dotGeo = new THREE.SphereGeometry(0.2, 8, 6), dotMat = new THREE.MeshBasicMaterial({ color: 0xFFC93D });
  const pinMat = new THREE.MeshLambertMaterial({ color: 0xFFC93D, emissive: 0xFFA800, emissiveIntensity: 0.5 });
  let routeEnd = null;
  function drawRoute(from, to) {
    clearRoute();
    const dir = Math.sign(to - from), n = Math.floor(Math.abs(to - from) / 0.9);
    for (let k = 1; k < n; k++) {
      const l = from + dir * k * 0.9, r = roadAt(l), d = new THREE.Mesh(dotGeo, dotMat);
      d.position.set(r.x, GROUND + 0.22, r.z); d.userData.l = l; routeG.add(d);
    }
    const e = roadAt(to);
    routeEnd = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.0, 12), pinMat);
    routeEnd.rotation.x = Math.PI; routeEnd.position.set(e.x, groundAt(e.x, e.z) + 5.6, e.z); routeEnd.userData.y = routeEnd.position.y;
    routeG.add(routeEnd);
  }
  function clearRoute() { routeG.clear(); routeEnd = null; }

  // ── 走路提示（點一下直接抵達）──
  const pill = document.createElement('button');
  pill.type = 'button'; pill.className = 'i3d-pill'; pill.hidden = true;
  pill.style.cssText = 'position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:3;border:0;border-radius:999px;padding:8px 14px;'
    + 'background:#1a3a1a;color:#fff;font:700 13px "Noto Sans TC",system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.18);white-space:nowrap';
  pill.addEventListener('click', (e) => { e.stopPropagation(); if (walking) walking.skip = true; });
  el.appendChild(pill);

  // ── 點選：地塊、角色 ──
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let down = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8 || performance.now() - down.t > 500) return;
    if (walking) { walking.skip = true; return; }
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    if (ray.intersectObject(hero, false).length) return host.heroTap();
    const hit = ray.intersectObjects(pickables, false)[0]; if (!hit) return;
    const t = tileByCode(hit.object.userData.unit); if (!t) return;
    if (t.u.locked) { t.bounce = performance.now(); return host.tileTap(t.u.code); }
    const to = standLen(t), dist = Math.abs(to - heroLen);
    if (dist < 0.3) { focus(t); return host.arrive(t.u.code); }
    if (host.reduce) { focus(t); walking = { from: heroLen, to, t0: performance.now(), dur: 0, t, skip: false }; return; }
    // 等速走路（每秒約 8 單位），最短 1 秒、最長 4.5 秒；鏡頭跟著角色走，點一下可以跳過
    walking = { from: heroLen, to, t0: performance.now(), dur: Math.min(4500, Math.max(1000, dist / 8 * 1000)), t, skip: false };
    drawRoute(heroLen, to);
    fly = null; follow = true;
    const en = host.lang && host.lang() === 'en';
    pill.textContent = en ? `🚶 Walking to ${t.u.code} · tap to skip ›` : `🚶 前往 ${t.u.code}・點一下直接抵達 ›`;
    pill.hidden = false;
  });

  // ── 更新（進度或造型改變時由 index.html 呼叫）──
  async function update() {
    const L = host.layout();
    if (L.lay !== curLay) buildLayout(L);
    buildTiles(host.units());
    const at = tileByCode(host.heroAt()) || tiles.find((t) => !t.u.locked);
    if (at && !walking) { heroLen = standLen(at); placeHero(heroLen); hero.position.y = groundAt(hero.position.x, hero.position.z); }
    if (view === 'eye' && !walking && !follow) controls.target.copy(heroTarget());
    await refreshHero();
  }

  // ── 動畫迴圈：首頁看不到時暫停，省電 ──
  let frames = 0, fpsT = performance.now(), checks = 0, raf = 0;
  const clock = new THREE.Clock(), proj = new THREE.Vector3();
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (!host.active()) return;
    const dt = Math.min(0.1, clock.getDelta()), t = clock.elapsedTime, motion = !host.reduce;
    if (fly) { const k = Math.min(1, (now - fly.t0) / fly.dur), e = ease(k); camera.position.lerpVectors(fly.fromP, fly.toP, e); controls.target.lerpVectors(fly.fromT, fly.toT, e); if (k >= 1) fly = null; }
    if (walking) {
      let k = Math.min(1, (now - walking.t0) / (walking.dur || 1)); if (walking.skip || !walking.dur) k = 1;
      const before = proj.copy(hero.position).project(camera).x;
      heroLen = walking.from + (walking.to - walking.from) * walkEase(k); placeHero(heroLen);
      const after = proj.copy(hero.position).project(camera).x;
      if (Math.abs(after - before) > 0.0005) setFlip(after < before);
      heroMat.rotation = Math.sin(now / 70) * 0.07;
      const dir = Math.sign(walking.to - walking.from);
      routeG.children.forEach((d) => { if (d.userData.l != null) d.visible = dir * (d.userData.l - heroLen) > 0.3; });
      if (k >= 1) {
        const code = walking.t.u.code; walking = null; heroMat.rotation = 0; follow = false; pill.hidden = true; clearRoute();
        hero.position.y = groundAt(hero.position.x, hero.position.z);
        const toT = heroTarget(), s = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
        s.radius = FOLLOW.dist; s.phi = FOLLOW.polar;   // 抵達：鏡頭停在角色身邊
        fly = { t0: now, dur: 450, fromP: camera.position.clone(), toP: toT.clone().add(new THREE.Vector3().setFromSpherical(s)), fromT: controls.target.clone(), toT };
        host.arrive(code);
      }
    }
    if (follow) {   // 跟隨鏡頭：看著角色，慢慢拉到斜看的距離；學生自己轉的方向保留
      const s = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      const fz = 1 - Math.pow(0.05, dt), ft = 1 - Math.pow(0.0005, dt);   // 依時間計算：約 1 秒拉近 95%，目標幾乎緊跟角色（不受 fps 影響）
      s.radius += (FOLLOW.dist - s.radius) * fz; s.phi += (FOLLOW.polar - s.phi) * fz;
      controls.target.lerp(heroTarget(), ft);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));
    }
    if (routeEnd && motion) routeEnd.position.y = routeEnd.userData.y + Math.sin(t * 4) * 0.25;
    const gy = groundAt(hero.position.x, hero.position.z) + (walking ? Math.abs(Math.sin(now / 70)) * 0.18 : motion ? Math.sin(t * 2.2) * 0.04 : 0);
    hero.position.y += (gy - hero.position.y) * 0.35;
    if (motion) {
      const a = seaGeo.attributes.position, arr = a.array;
      for (let i = 0; i < arr.length; i += 3) arr[i + 1] = seaBase[i + 1] + Math.sin(seaBase[i] * 0.25 + t * 1.2) * 0.18 + Math.cos(seaBase[i + 2] * 0.3 + t) * 0.15;
      a.needsUpdate = true;
      sway.forEach((s) => (s.g.rotation.z = Math.sin(t * 1.4 + s.p) * 0.035));
      drifters.forEach((d) => (d.g.position.x = d.x0 + Math.sin(t * d.sp + d.p) * 4));
      bobbers.forEach((b) => { b.g.position.y = b.y + Math.sin(t * 1.8 + b.p) * 0.08; if (b.swim) { b.g.position.x = b.swim.cx + Math.cos(t * 0.4) * b.swim.rx; b.g.position.z = b.swim.cz + Math.sin(t * 0.4) * b.swim.rz; b.g.rotation.y = -t * 0.4; } });
      boat.position.y = -0.3 + Math.sin(t * 1.8) * 0.12; boat.rotation.z = Math.sin(t * 1.3) * 0.08; boat.position.x = boatX + Math.sin(t * 0.15) * 3;
      tiles.forEach((x) => x.plat.children.forEach((c) => { if (c.userData.flag) c.rotation.y = Math.sin(t * 3) * 0.25; if (c.userData.spin) c.rotation.y = t * 0.8; }));
    }
    tiles.forEach((x) => {
      let y = x.sel ? 0.45 : 0;
      if (x.bounce) { const k = (now - x.bounce) / 450; if (k < 1) y += Math.sin(k * Math.PI) * 0.6; else x.bounce = 0; }
      x.plat.position.y += (y - x.plat.position.y) * 0.18;
    });
    controls.update();
    renderer.render(scene, camera);
    adaptQuality(now);
  }

  // 每 2 秒量一次 fps：慢了先降解析度，降到 1 還是慢就關陰影（記住）；順了再慢慢升回來，連續夠順也會把陰影開回來
  let smooth = 0, upgraded = false;   // 陰影每次開啟最多自動開回一次，避免來回切換
  function adaptQuality(now) {
    frames++;
    if (now - fpsT > 2500) { frames = 0; fpsT = now; return; }   // 剛從背景回來或暫停過，重新計時
    if (now - fpsT < 2000) return;
    const fps = frames * 1000 / (now - fpsT); frames = 0; fpsT = now; checks++;
    if (checks < 2) return;   // 開場第一段載入中，不算
    if (fps < 40) {
      smooth = 0;
      if (pr > 1) setPR(Math.max(1, pr - 0.25));
      else if (quality === 'high' && fps < 30) { quality = 'low'; applyQuality(); host.setQuality('low'); }
    } else if (fps > 57) {
      if (pr < prMax()) setPR(Math.min(prMax(), pr + 0.25));
      else if (quality === 'low' && !upgraded && ++smooth >= 5) { quality = 'high'; smooth = 0; upgraded = true; applyQuality(); host.setQuality('high'); }
    } else smooth = 0;
  }

  applyQuality(); resize();
  await update();
  setView('bird', true);
  camera.position.multiplyScalar(1.6); setView('bird');   // 開場：從遠處飛進來
  raf = requestAnimationFrame(loop);

  return {
    update, setView,
    _debug: { camera, tiles: () => tiles, hero, renderer },   // 測試用
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); renderer.domElement.remove(); },
  };
}
