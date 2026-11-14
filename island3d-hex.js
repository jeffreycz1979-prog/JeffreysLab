// ═══════════════════════════════════════════════════════
//  英文島 3D 地圖・六角群島版（各島共用：/JeffreysLab/island3d-hex.js）
//  靈感：卡坦島式六角地塊。中間是廣場島，每個單元一座六角小島＋一棟房子，木橋相連；
//  外圈是風景小島；天空依手機時間變化（清晨→白天→黃昏→夜晚）
//  與 index.html 的溝通方式跟 island3d.js 一樣（host）；host.hexTheme 選主題：
//    'meadow'（預設：森林、雪山、麥田、牧場）、'tropical'（火山椰林島：椰林、火山、草屋村、珊瑚海灘）
//  host.chests() 有回傳就顯示每週神秘寶箱（放在風景小島的沙灘上）
// ═══════════════════════════════════════════════════════
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const R = 5, GAP = 0.2, HX = Math.sqrt(3) * R;            // 六角形外接圓半徑、間隙、橫向間距
const GROUND = 1.0, TILE_H = 1.9;
const SPREAD = 1.42;   // 島與島之間拉開的比例（1＝地塊貼在一起；越大海峽越寬）
const hexXZ = (q, r) => [HX * (q + r / 2) * SPREAD, 1.5 * R * r * SPREAD];  // 軸座標 → 3D（尖頂朝前後）
// 單元地塊順序：內圈 6 格從左前方順時針，第 7～9 單元接在外圈正前方
const UNIT_CELLS = [[-1, 1], [-1, 0], [0, -1], [1, -1], [1, 0], [0, 1], [0, 2], [-1, 2], [-2, 2]];
// 外圈 12 格的風景（被單元用掉的就不放）
const DECOR_CELLS = [
  [[0, 2], 'wheat'], [[-1, 2], 'harbor'], [[-2, 2], 'meadow'], [[-2, 1], 'forest'], [[-2, 0], 'lake'], [[-1, -1], 'forest'],
  [[0, -2], 'mountain'], [[1, -2], 'peak'], [[2, -2], 'forest'], [[2, -1], 'wheat'], [[2, 0], 'lighthouse'], [[1, 1], 'meadow'],
];
const C = {
  ink: 0x1a3a1a, lime: 0xCCFF00, limeD: 0x9FCC00, mint: 0x4ECDC4, mintD: 0x2A8E86, sand: 0xF1E3BE, grass: 0x9BD06E, grassD: 0x86BF5C,
  white: 0xffffff, cream: 0xF4EEDF, locked: 0xC9C5BC, lockedD: 0xB0ABA0, road: 0xE6D7B5, water: 0x5FC8DA, waterL: 0x8FDDEA,
  trunk: 0x8B5A2B, leaf: 0x5FB35A, leafL: 0x86CF6E, pine: 0x3E9150, rock: 0xB7B2A6, mount: 0x8FB58C, coral: 0xFF6B57, faded: 0xDDE6B0,
  earth: 0xC9A877, earthD: 0xA9875A, stone: 0xE4DCCB, wheat: 0xF2CF5B, wheatD: 0xE0B53E, wood: 0xB07A45,
};
// 天空：依時間插值（小時, 天頂, 地平線, 太陽色, 太陽強度, 環境光, 海, 星星, 窗戶燈）
const SKY_KEYS = [
  [0, 0x0B1636, 0x2A3766, 0x9DB4FF, 0.5, 0.75, 0x2C5A7A, 1, 1],
  [5, 0x0B1636, 0x2A3766, 0x9DB4FF, 0.5, 0.75, 0x2C5A7A, 1, 1],
  [6.5, 0x7FA8D8, 0xFFC9A0, 0xFFD2A0, 1.5, 0.95, 0x5FB8D0, 0, 0.3],
  [9, 0x5FC1F0, 0xD8F3F0, 0xFFF2D6, 2.1, 1.25, 0x5FC8DA, 0, 0],
  [15.5, 0x5FC1F0, 0xD8F3F0, 0xFFF2D6, 2.1, 1.25, 0x5FC8DA, 0, 0],
  [17.5, 0x4F6BB5, 0xFF9F6B, 0xFFA060, 1.5, 1.0, 0x4F94C8, 0.15, 0.85],
  [19, 0x0B1636, 0x2A3766, 0x9DB4FF, 0.5, 0.75, 0x2C5A7A, 1, 1],
  [24, 0x0B1636, 0x2A3766, 0x9DB4FF, 0.5, 0.75, 0x2C5A7A, 1, 1],
];
const SKY_NAMES = [['現在', 'Now', null], ['清晨', 'Dawn', 6.5], ['白天', 'Day', 12], ['黃昏', 'Dusk', 17.4], ['夜晚', 'Night', 21]];
const ease = (k) => (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const walkEase = (k, r = 0.15) => { const v = 1 / (1 - r); return k < r ? 0.5 * v * k * k / r : k < 1 - r ? v * (k - r / 2) : 1 - 0.5 * v * (1 - k) * (1 - k) / r; };
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };   // 固定亂數（每次排一樣）

export async function createIsland3D(el, host) {
  const TROPIC = host.hexTheme === 'tropical';
  if (TROPIC) Object.assign(C, { sand: 0xFFEFC8, grass: 0x9FD27C, grassD: 0x8CC86A, water: 0x3FBFCB, waterL: 0x8EE3E6, road: 0xEAD6A8, leaf: 0x4FAE5C, leafL: 0x7ACB6A, earth: 0xC79A6A });
  // 同一組外圈位置，換成各主題的風景
  const TYPE_MAP = TROPIC ? { forest: 'palms', mountain: 'volcano', peak: 'volcanoBig', meadow: 'huts', wheat: 'reef' } : {};
  // ── 繪圖器 ──
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('WebGL 無法使用');
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'none';

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xD8F3F0, 90, 170);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 400);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8fbf8f, 1.25); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2d6, 2.1);
  sun.position.set(-30, 45, 20);
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 120 });
  sun.shadow.bias = -0.0015;
  scene.add(sun);

  let quality = host.quality();
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
  // 晚上會亮的東西（窗戶、路燈、燈塔）共用材質，依時間調亮度
  const winMat = new THREE.MeshLambertMaterial({ color: 0x2E4A3A, emissive: 0xFFD27A, emissiveIntensity: 0 });
  const lampMat = new THREE.MeshLambertMaterial({ color: 0xFFF4D0, emissive: 0xFFC94D, emissiveIntensity: 0 });

  // ── 天空、星星、月亮 ──
  const skyCv = document.createElement('canvas'); skyCv.width = 2; skyCv.height = 256;
  const skyTex = new THREE.CanvasTexture(skyCv); skyTex.colorSpace = THREE.SRGBColorSpace; scene.background = skyTex;
  const starGeo = new THREE.BufferGeometry(), sp = [];
  for (let i = 0; i < 260; i++) { const th = rnd(i) * Math.PI * 2, ph = rnd(i + 99) * 1.2, rr = 180; sp.push(Math.sin(ph) * Math.cos(th) * rr, Math.cos(ph) * rr * 0.6 + 20, Math.sin(ph) * Math.sin(th) * rr); }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  scene.add(new THREE.Points(starGeo, starMat));
  const moon = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 12), new THREE.MeshBasicMaterial({ color: 0xFFF6D8, fog: false, transparent: true, opacity: 0 }));
  moon.position.set(60, 70, -120); scene.add(moon);
  const hexC = (h) => new THREE.Color(h);
  let skyHour = null, skyNow = null;   // null＝跟著手機時間
  const urlHour = parseFloat(new URLSearchParams(location.search).get('hour'));
  if (!isNaN(urlHour)) skyHour = urlHour;
  function hourNow() { if (skyHour != null) return skyHour; const d = new Date(); return d.getHours() + d.getMinutes() / 60; }
  function applySky() {
    const h = hourNow(); let i = 0; while (i < SKY_KEYS.length - 2 && SKY_KEYS[i + 1][0] <= h) i++;
    const a = SKY_KEYS[i], b = SKY_KEYS[i + 1], k = Math.min(1, Math.max(0, (h - a[0]) / ((b[0] - a[0]) || 1)));
    const mix = (j) => hexC(a[j]).lerp(hexC(b[j]), k), num = (j) => a[j] + (b[j] - a[j]) * k;
    const top = mix(1), bot = mix(2);
    const g = skyCv.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#' + top.getHexString()); gr.addColorStop(0.62, '#' + bot.getHexString()); gr.addColorStop(1, '#' + bot.getHexString());
    g.fillStyle = gr; g.fillRect(0, 0, 2, 256); skyTex.needsUpdate = true;
    scene.fog.color.copy(bot);
    sun.color.copy(mix(3)); sun.intensity = num(4);
    hemi.intensity = num(5); hemi.color.copy(hexC(0xffffff).lerp(top, 0.25)); hemi.groundColor.copy(hexC(0x8fbf8f).lerp(hexC(0x334455), num(7) * 0.6));
    seaMat.color.copy(mix(6)); seaLMat.color.copy(mix(6).lerp(hexC(0xffffff), 0.28)); shallowMat.color.copy(seaLMat.color);
    starMat.opacity = num(7); moon.material.opacity = num(7);
    winMat.emissiveIntensity = num(8) * 1.1; lampMat.emissiveIntensity = num(8) * 1.4;
    // 太陽白天從左（東）爬到右（西）；晚上換成月光，從右上方照
    const day = h > 5.5 && h < 18.5, ang = day ? (h - 6) / 12 * Math.PI : 0.7 * Math.PI;
    sun.position.set(-Math.cos(ang) * 40, 18 + Math.sin(ang) * 32, 22);
    skyNow = h;
  }

  // ── 海 ──
  const seaMat = M(C.water, { transparent: true, opacity: 0.94 }), seaLMat = M(C.waterL), shallowMat = M(C.waterL, { transparent: true, opacity: 0.55, depthWrite: false });
  scene.add(mesh(flat(new THREE.CircleGeometry(36, 48)), shallowMat, 0, -0.2, 0, false));   // 淺水圈（在海浪最高點之上，不會被切成鋸齒）
  const seaGeo = flat(new THREE.PlaneGeometry(260, 260, 40, 40));
  const seaBase = seaGeo.attributes.position.array.slice();
  scene.add(mesh(seaGeo, seaMat, 0, -0.6, 0, false));
  const foams = [];   // 每塊地四周一圈白浪，呼吸般忽大忽小

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

  // ── 六角地塊本體（底座＋草皮）──
  const baseGeo = new THREE.CylinderGeometry(R - GAP, R - GAP + 0.35, TILE_H, 6);
  const capGeo = new THREE.CylinderGeometry(R - GAP - 0.12, R - GAP, 0.4, 6);
  const beachGeo = new THREE.CylinderGeometry(R - GAP + 1.0, R - GAP + 1.5, 0.5, 6);
  function hexTile(parent, top, side = C.earth) {
    const b = mesh(baseGeo, M(side), 0, GROUND - 0.4 - TILE_H / 2, 0, false); parent.add(b);
    const c = mesh(capGeo, M(top), 0, GROUND - 0.2, 0, false); parent.add(c);
    parent.add(mesh(beachGeo, M(C.sand), 0, -0.32, 0, false));   // 每座小島一圈沙灘
    return c;
  }
  function addFoam(x, z) {
    const f = mesh(flat(new THREE.CircleGeometry(R + 1.6, 6)), M(0xffffff, { transparent: true, opacity: 0.55, depthWrite: false }), x, -0.12, z, false);
    f.rotation.y = Math.PI / 2; scene.add(f); foams.push({ f, p: x * 0.3 + z * 0.2 });
  }

  // ── 小東西：樹、石頭、花、羊 ──
  const sway = [], drifters = [], bobbers = [], spinners = [], tileSway = [];
  let swayList = sway;   // 單元地塊上的樹另外記（每次更新進度會重建）
  function tree(g, kind, x, z, s) {
    const t = new THREE.Group(); t.position.set(x, GROUND, z); t.scale.setScalar(s); t.rotation.y = x * 0.37;
    if (TROPIC) kind = 'palm';   // 火山椰林島：所有樹都是椰子樹
    if (kind === 'palm') {   // 椰子樹：彎彎的樹幹＋扁平葉子＋椰子
      const tr = mesh(new THREE.CylinderGeometry(0.14, 0.24, 2.6, 6), M(0xA0703C), 0.25, 1.3, 0); tr.rotation.z = -0.18; t.add(tr);
      for (let i = 0; i < 6; i++) { const lf = mesh(new THREE.BoxGeometry(1.6, 0.06, 0.42), M(i % 2 ? C.leaf : C.leafL), 0, 0, 0); lf.position.set(0.5 + Math.cos(i) * 0.7, 2.62, Math.sin(i) * 0.7); lf.rotation.set(0, -i, -0.35); t.add(lf); }
      [[0.4, 0.15], [0.6, -0.1], [0.45, -0.25]].forEach(([a, b]) => t.add(mesh(new THREE.SphereGeometry(0.13, 6, 5), M(0x7A4A26), a, 2.45, b)));
    } else if (kind === 'p') {
      t.add(mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.9, 6), M(C.trunk), 0, 0.45, 0));
      t.add(mesh(new THREE.ConeGeometry(1.2, 1.8, 7), M(C.pine), 0, 1.6, 0));
      t.add(mesh(new THREE.ConeGeometry(0.85, 1.5, 7), M(C.pine), 0, 2.5, 0));
    } else {
      t.add(mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.4, 6), M(C.trunk), 0, 0.7, 0));
      t.add(mesh(new THREE.IcosahedronGeometry(1.25, 0), M(C.leaf), 0, 2.2, 0));
      t.add(mesh(new THREE.IcosahedronGeometry(0.7, 0), M(C.leafL), -0.5, 2.7, 0.4));
    }
    g.add(t); swayList.push({ g: t, p: x * 0.1 + z });
  }
  const rock = (g, x, z, s) => { const r = mesh(new THREE.DodecahedronGeometry(0.55 * s, 0), M(C.rock), x, GROUND + 0.2 * s, z); r.rotation.set(x, z, 0); g.add(r); };
  const flower = (g, x, z, c) => { g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 4), M(0x3F8F43), x, GROUND + 0.2, z, false)); g.add(mesh(new THREE.IcosahedronGeometry(0.16, 0), M(c), x, GROUND + 0.45, z, false)); };
  function sheep(g, x, z, ry) {
    const s = new THREE.Group(); s.position.set(x, GROUND, z); s.rotation.y = ry;
    s.add(mesh(new THREE.IcosahedronGeometry(0.55, 1), M(0xffffff), 0, 0.6, 0));
    s.add(mesh(new THREE.BoxGeometry(0.32, 0.34, 0.3), M(0x3A3A3A), 0.55, 0.72, 0));
    [[-0.25, -0.2], [-0.25, 0.2], [0.25, -0.2], [0.25, 0.2]].forEach(([a, b]) => s.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 4), M(0x3A3A3A), a, 0.2, b, false)));
    g.add(s); bobbers.push({ g: s, y: GROUND, p: x, graze: true });
  }
  // 一塊地上的隨機點（不要太靠邊）
  const spot = (seed, rMin = 1.2, rMax = R - 1.3) => { const a = rnd(seed) * Math.PI * 2, r = rMin + rnd(seed + 7) * (rMax - rMin); return [Math.cos(a) * r, Math.sin(a) * r]; };

  // ── 風景地塊 ──
  function buildDecor(type, x, z, seed) {
    type = TYPE_MAP[type] || type;
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const top = { wheat: C.wheat, harbor: C.sand, lighthouse: C.sand, mountain: C.mount, peak: C.mount, lake: C.grass, forest: C.grassD, meadow: C.grass,
      palms: C.grass, volcano: 0xA8886C, volcanoBig: 0xA8886C, huts: C.sand, reef: C.sand }[type];
    hexTile(g, top);
    if (type === 'palms') { for (let i = 0; i < 7; i++) { const [a, b] = spot(seed * 10 + i, 0.4); tree(g, 'palm', a, b, 0.8 + rnd(i + seed) * 0.35); } rock(g, 2.6, 1.8, 0.8); }
    if (type === 'volcano' || type === 'volcanoBig') {   // 火山：岩石＋岩漿口＋冒煙
      const sc = type === 'volcanoBig' ? 1.15 : 0.8, v = new THREE.Group(); v.position.set(0, GROUND, -0.3); v.scale.setScalar(sc); g.add(v);
      v.add(mesh(new THREE.CylinderGeometry(1.2, 3.9, 5.2, 8), M(0x8A6A58), 0, 2.6, 0));
      v.add(mesh(new THREE.CylinderGeometry(1.15, 1.3, 0.5, 8), M(0xFF6B2C, { emissive: 0xFF4A00, emissiveIntensity: 0.6 }), 0, 5.1, 0, false));
      [[0.9, 1.6], [0.2, 0.9], [-0.7, 1.3]].forEach(([a, r], i) => { const lv = mesh(new THREE.BoxGeometry(0.35, 2.2, 0.2), M(0xFF8A3D, { emissive: 0xFF5A00, emissiveIntensity: 0.4 }), a * 1.6, 3.9 - i * 0.2, 1.0 + r * 0.5, false); lv.rotation.x = -0.45; v.add(lv); });
      [0, 1, 2].forEach((i) => { const sm = mesh(new THREE.IcosahedronGeometry(0.7 + i * 0.25, 0), M(0xE8E4DE, { transparent: true, opacity: 0.85 }), i * 0.4, 6.2 + i * 1.0, -i * 0.2, false); v.add(sm); bobbers.push({ g: sm, y: sm.position.y, p: i * 1.7 + seed }); });
      rock(g, 3.0, 1.6, 0.9); rock(g, -3.0, 1.2, 0.7); tree(g, 'palm', 2.6, 2.6, 0.7);
    }
    if (type === 'huts') {   // 草屋村：三間草屋＋營火
      [[-1.8, -1.2, 1], [1.6, -1.6, 0.9], [0.2, 1.9, 0.85]].forEach(([a, b, sc]) => {
        const h = new THREE.Group(); h.position.set(a, GROUND, b); h.scale.setScalar(sc); h.rotation.y = Math.atan2(-a, -b); g.add(h);
        h.add(mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.1, 8), M(0xD9B07A), 0, 0.55, 0));
        h.add(mesh(new THREE.ConeGeometry(1.4, 1.2, 8), M(0xC8963E), 0, 1.7, 0));
        h.add(mesh(new THREE.BoxGeometry(0.42, 0.42, 0.06), winMat, 0, 0.62, 0.9, false));
      });
      g.add(mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.15, 8), M(C.rock), 0, GROUND + 0.07, -0.1, false));
      const fire = mesh(new THREE.ConeGeometry(0.28, 0.6, 6), lampMat, 0, GROUND + 0.45, -0.1, false); g.add(fire); bobbers.push({ g: fire, y: fire.position.y, p: 0, pulse: true });
      tree(g, 'palm', 3.0, 0.4, 0.8); tree(g, 'palm', -3.0, 1.4, 0.75);
    }
    if (type === 'reef') {   // 珊瑚海灘：海龜、貝殼、海星、陽傘
      const turtle = (a, b, ry) => { const tt = new THREE.Group(); tt.position.set(a, GROUND, b); tt.rotation.y = ry; g.add(tt);
        const sh = mesh(new THREE.SphereGeometry(0.6, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M(0x4F8F4A), 0, 0.05, 0); sh.scale.y = 0.7; tt.add(sh);
        tt.add(mesh(new THREE.SphereGeometry(0.2, 6, 5), M(0x8BC47A), 0.7, 0.15, 0));
        bobbers.push({ g: tt, y: GROUND, p: a, graze: true }); };
      turtle(-1.6, 0.8, 0.5); turtle(1.2, 1.8, 2.2);
      [[0.8, -0.6, 0xFF9AC1], [-0.4, -2.2, 0xFFD84D], [2.4, -0.4, 0xFF6B57], [-2.6, -0.8, 0xffffff]].forEach(([a, b, c]) => { const sh = mesh(new THREE.ConeGeometry(0.22, 0.3, 5), M(c), a, GROUND + 0.12, b, false); sh.rotation.z = 1.2; g.add(sh); });
      const um = new THREE.Group(); um.position.set(1.8, GROUND, -2.0); g.add(um);
      um.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 5), M(C.white), 0, 1.1, 0));
      for (let i = 0; i < 8; i++) { const sl = mesh(new THREE.ConeGeometry(1.5, 0.6, 8, 1, true, i * Math.PI / 4, Math.PI / 4), M(i % 2 ? C.coral : C.white, { side: THREE.DoubleSide }), 0, 2.3, 0, false); um.add(sl); }
      um.add(mesh(new THREE.BoxGeometry(1.4, 0.12, 0.7), M(0x5FC8DA), -0.6, 0.25, 0.9));
      tree(g, 'palm', -2.8, -1.8, 0.8);
    }
    if (type === 'forest') for (let i = 0; i < 8; i++) { const [a, b] = spot(seed * 10 + i, 0.4); tree(g, rnd(seed + i) > 0.5 ? 'p' : 't', a, b, 0.75 + rnd(i + seed) * 0.4); }
    if (type === 'mountain' || type === 'peak') {
      const big = type === 'peak';
      [[0, -0.3, big ? 3.2 : 2.6, big ? 7.5 : 4.6], [-2.2, 1.2, 1.8, 3.2], [2.1, 1.4, 1.6, 2.8]].forEach(([a, b, r, h], i) => {
        g.add(mesh(new THREE.ConeGeometry(r, h, 6), M(i ? C.mount : 0x7FA67C), a, GROUND + h / 2 - 0.1, b));
        if (big && !i) g.add(mesh(new THREE.ConeGeometry(r * 0.38, h * 0.36, 6), M(C.white), a, GROUND + h - h * 0.18 - 0.05, b));
      });
      rock(g, 2.6, -1.8, 1); rock(g, -2.8, -1.4, 0.8);
    }
    if (type === 'lake') {
      g.add(mesh(new THREE.CylinderGeometry(3.1, 3.1, 0.1, 6), M(0xC9E9A8), 0, GROUND + 0.02, 0, false));
      g.add(mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.12, 6), seaLMat, 0, GROUND + 0.05, 0, false));
      [[-1, 0.8, 0.45], [1.1, -0.6, 0.35]].forEach(([a, b, r]) => g.add(mesh(new THREE.CylinderGeometry(r, r, 0.06, 8), M(C.leaf), a, GROUND + 0.13, b, false)));
      const duck = new THREE.Group(); duck.position.set(0, GROUND + 0.2, 0);
      duck.add(mesh(new THREE.SphereGeometry(0.32, 6, 5), M(C.white), 0, 0.1, 0)); duck.add(mesh(new THREE.SphereGeometry(0.2, 6, 5), M(C.white), 0.25, 0.42, 0));
      const beak = mesh(new THREE.ConeGeometry(0.08, 0.2, 4), M(0xFFB547), 0.48, 0.4, 0); beak.rotation.z = -Math.PI / 2; duck.add(beak);
      g.add(duck); bobbers.push({ g: duck, y: duck.position.y, p: 1, swim: { cx: 0, cz: 0, rx: 1.4, rz: 1.1 } });
      tree(g, 't', 3.2, 1.6, 0.8); tree(g, 'p', -3.2, -1.5, 0.8);
    }
    if (type === 'wheat') {
      for (let i = -3; i <= 3; i++) { const len = (R - 1.2) * 2 * Math.sqrt(1 - (i / 4.2) ** 2); const row = mesh(new THREE.BoxGeometry(len, 0.45, 0.55), M(i % 2 ? C.wheat : C.wheatD), 0.3, GROUND + 0.22, i * 0.95); g.add(row); }
      // 風車（葉片會轉）
      const wm = new THREE.Group(); wm.position.set(-1.6, GROUND, -1.2); g.add(wm);
      wm.add(mesh(new THREE.CylinderGeometry(0.7, 1.0, 3.6, 8), M(C.cream), 0, 1.8, 0));
      wm.add(mesh(new THREE.ConeGeometry(0.95, 1.1, 8), M(C.coral), 0, 4.15, 0));
      wm.add(mesh(new THREE.BoxGeometry(0.5, 0.7, 0.1), M(C.wood), 0, 0.35, 1.0, false));
      const blades = new THREE.Group(); blades.position.set(0, 3.3, 0.95); wm.add(blades);
      for (let i = 0; i < 4; i++) { const bl = mesh(new THREE.BoxGeometry(0.4, 2.4, 0.06), M(C.white), 0, 1.2, 0); const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2; arm.add(bl); blades.add(arm); }
      blades.add(mesh(new THREE.SphereGeometry(0.2, 8, 6), M(C.ink), 0, 0, 0.05, false));
      spinners.push({ g: blades, axis: 'z', sp: 1.2 });
    }
    if (type === 'meadow') {
      for (let i = 0; i < 9; i++) { const [a, b] = spot(seed * 20 + i, 0.5); flower(g, a, b, [0xFF9AC1, 0xFFD84D, 0xffffff, 0xFF6B57][i % 4]); }
      sheep(g, -1.2, 0.6, 0.6); sheep(g, 1.4, -0.8, 2.4); sheep(g, 0.6, 1.9, -1);
      // 小柵欄
      for (let i = 0; i < 5; i++) g.add(mesh(new THREE.BoxGeometry(0.12, 0.7, 0.12), M(C.wood), -3 + i * 0.75, GROUND + 0.35, -2.6));
      g.add(mesh(new THREE.BoxGeometry(3.2, 0.1, 0.08), M(C.wood), -1.5, GROUND + 0.55, -2.6));
      rock(g, 2.8, 1.2, 0.8);
    }
    if (type === 'harbor' || type === 'lighthouse') {
      const out = Math.atan2(z, x);   // 碼頭朝外海
      if (type === 'lighthouse') {
        const lh = new THREE.Group(); lh.position.set(Math.cos(out) * 1.6, GROUND, Math.sin(out) * 1.6); g.add(lh);
        for (let i = 0; i < 4; i++) lh.add(mesh(new THREE.CylinderGeometry(0.62 - i * 0.07, 0.68 - i * 0.07, 0.9, 10), M(i % 2 ? C.white : C.coral), 0, 0.45 + i * 0.9, 0));
        lh.add(mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.6, 10), lampMat, 0, 3.9, 0, false));
        lh.add(mesh(new THREE.ConeGeometry(0.6, 0.7, 10), M(C.coral), 0, 4.55, 0));
        rock(g, -1.5, 1.5, 1.1); rock(g, -0.6, 2.4, 0.7); tree(g, 'p', -2.2, -1.6, 0.8);
      } else {
        // 小木屋＋碼頭＋停著的小船
        const hut = new THREE.Group(); hut.position.set(-Math.cos(out) * 1.4, GROUND, -Math.sin(out) * 1.4); g.add(hut);
        hut.add(mesh(new THREE.BoxGeometry(1.8, 1.3, 1.5), M(0xD9B07A), 0, 0.65, 0));
        const rf = mesh(new THREE.ConeGeometry(1.5, 0.9, 4), M(C.mintD), 0, 1.75, 0); rf.rotation.y = Math.PI / 4; hut.add(rf);
        hut.add(mesh(new THREE.BoxGeometry(0.4, 0.4, 0.06), winMat, 0.4, 0.75, 0.76, false));
        const pier = new THREE.Group(); pier.position.set(Math.cos(out) * 2.4, 0, Math.sin(out) * 2.4); pier.rotation.y = -out; g.add(pier);
        pier.add(mesh(new THREE.BoxGeometry(5, 0.18, 1.3), M(C.wood), 2.2, GROUND - 0.15, 0));
        [0.6, 2.2, 3.8].forEach((a) => [-0.6, 0.6].forEach((b) => pier.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 5), M(0x8A5A30), a, GROUND - 1.1, b, false))));
        const bt = new THREE.Group(); bt.position.set(3.2, -0.25, 1.6); pier.add(bt);
        bt.add(mesh(new THREE.BoxGeometry(2, 0.5, 0.8), M(0xFFD84D), 0, 0, 0));
        bt.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 5), M(C.ink), 0, 0.9, 0));
        bt.add(mesh(new THREE.ConeGeometry(0.6, 1.2, 3), M(C.white), 0.3, 0.9, 0));
        bobbers.push({ g: bt, y: -0.25, p: 2 });
        // 碼頭的燈
        pier.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 5), M(C.ink), 4.4, GROUND + 0.5, -0.55, false));
        pier.add(mesh(new THREE.SphereGeometry(0.17, 8, 6), lampMat, 4.4, GROUND + 1.2, -0.55, false));
      }
    }
  }

  // ── 中央廣場（固定）──
  {
    const g = new THREE.Group(); scene.add(g);
    hexTile(g, C.stone, C.earthD);
    g.add(mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.08, 6), M(0xD6CCB6), 0, GROUND + 0.02, 0, false));
    g.add(mesh(new THREE.CylinderGeometry(1.3, 1.45, 0.55, 12), M(C.white), 0, GROUND + 0.28, 0));
    g.add(mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.08, 12), seaLMat, 0, GROUND + 0.52, 0, false));
    g.add(mesh(new THREE.CylinderGeometry(0.18, 0.25, 1.4, 8), M(C.white), 0, GROUND + 1.1, 0));
    const spray = mesh(new THREE.IcosahedronGeometry(0.42, 1), M(0xBDEFF5, { transparent: true, opacity: 0.85 }), 0, GROUND + 1.95, 0, false);
    g.add(spray); bobbers.push({ g: spray, y: spray.position.y, p: 0, pulse: true });
    // 旗桿：Jeffrey Lab 螢光黃旗
    g.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.2, 6), M(C.ink), -2.4, GROUND + 2.1, -1.6));
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1.5, -0.35, 0, 0, -0.7, 0], 3)); fg.computeVertexNormals();
    const flag = mesh(fg, M(C.lime, { side: THREE.DoubleSide }), -2.35, GROUND + 4.15, -1.6); g.add(flag); spinners.push({ g: flag, axis: 'flag' });
    [[2.4, -1.4], [-2.6, 1.2], [1.8, 2.2]].forEach(([a, b]) => { const bench = mesh(new THREE.BoxGeometry(1.1, 0.12, 0.4), M(C.wood), a, GROUND + 0.4, b); bench.rotation.y = Math.atan2(a, b); g.add(bench); });
    [[-1.2, -3.2], [3.1, 0.6], [-3.3, -0.4]].forEach(([a, b], i) => flower(g, a, b, [0xFF9AC1, 0xFFD84D, 0xFF6B57][i]));
    addFoam(0, 0);
  }

  // ── 雲、繞島的帆船、海鷗 ──
  const cloudMat = M(C.white);
  [[-14, 15, -18, 1], [9, 17, -26, 1.2], [19, 13, 2, 0.8], [-22, 14, 14, 0.9]].forEach(([x, y, z, s]) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s);
    [[0, 0, 0, 1.4], [1.3, -0.2, 0.2, 1], [-1.3, -0.25, -0.1, 1.05], [0.4, 0.55, 0.1, 0.9]].forEach(([a, b, c, r]) => g.add(mesh(new THREE.IcosahedronGeometry(r, 1), cloudMat, a, b, c)));
    scene.add(g); drifters.push({ g, x0: x, p: x, sp: 0.15 + Math.abs(z) * 0.003 });
  });
  const boat = new THREE.Group(); scene.add(boat);
  boat.add(mesh(new THREE.BoxGeometry(2.2, 0.5, 0.9), M(C.coral), 0, 0, 0));
  boat.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 5), M(C.ink), 0, 1.2, 0));
  boat.add(mesh(new THREE.ConeGeometry(0.75, 1.6, 3), M(C.white), 0.35, 1.2, 0));
  const birds = [];
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Group(); scene.add(b);
    [-1, 1].forEach((s) => { const w = mesh(new THREE.BoxGeometry(0.9, 0.05, 0.3), M(C.white), s * 0.45, 0, 0, false); w.userData.side = s; b.add(w); });
    birds.push({ b, r: 18 + i * 5, h: 11 + i * 1.5, sp: 0.18 + i * 0.05, p: i * 2.1 });
  }

  // ── 路燈（沿小路，晚上會亮）──
  const lampsG = new THREE.Group(); scene.add(lampsG);

  // ── 會隨單元數重建：小路、單元地塊、外圈風景 ──
  const layoutG = new THREE.Group(); scene.add(layoutG);
  const tilesG = new THREE.Group(); scene.add(tilesG);
  let ROAD_PTS = [], ROAD_LEN = [], curN = -1, cells = [], decorSpots = [];
  function roadAt(l) {
    let i = ROAD_LEN.findIndex((v) => v >= l); if (i < 1) i = 1;
    const t = (l - ROAD_LEN[i - 1]) / ((ROAD_LEN[i] - ROAD_LEN[i - 1]) || 1), a = ROAD_PTS[i - 1], b = ROAD_PTS[i];
    return { x: a.x + (b.x - a.x) * t, z: a.y + (b.y - a.y) * t };
  }
  let BASE = null;   // 固定景物（廣場）動畫清單的長度；重建外圈時砍回這裡
  function buildLayout(n) {
    curN = n;
    if (!BASE) BASE = [sway.length, bobbers.length, spinners.length, foams.length];
    sway.length = BASE[0]; bobbers.length = BASE[1]; spinners.length = BASE[2]; foams.length = BASE[3];
    // 清掉舊的外圈風景（重建）
    scene.children.filter((o) => o.userData.decor).forEach((o) => scene.remove(o));
    layoutG.clear(); lampsG.clear();
    cells = UNIT_CELLS.slice(0, n).map(([q, r]) => { const [x, z] = hexXZ(q, r); return { q, r, x, z }; });
    // 小路：廣場 → U1 → U2 …；每塊地的「門口」在靠島中心那一側；內外圈之間經過兩塊地的交界
    const way = [new THREE.Vector3(-1.2, 0, 2.2)];
    cells.forEach((c, i) => {
      const d = Math.hypot(c.x, c.z), ux = c.x / d, uz = c.z / d;
      if (i && Math.hypot(c.x - cells[i - 1].x, c.z - cells[i - 1].z) < HX * 1.1 && (Math.abs(c.q) + Math.abs(c.r) + Math.abs(c.q + c.r)) / 2 > 1) {
        const p = cells[i - 1]; way.push(new THREE.Vector3((c.x + p.x) / 2, 0, (c.z + p.z) / 2));
      }
      c.door = { x: c.x - ux * 2.3, z: c.z - uz * 2.3 };
      way.push(new THREE.Vector3(c.door.x, 0, c.door.z));
    });
    const curve = new THREE.CatmullRomCurve3(way, false, 'centripetal');
    ROAD_PTS = curve.getSpacedPoints(320).map((v) => new THREE.Vector2(v.x, v.z)); ROAD_LEN = [0];
    for (let i = 1; i < ROAD_PTS.length; i++) ROAD_LEN.push(ROAD_LEN[i - 1] + ROAD_PTS[i].distanceTo(ROAD_PTS[i - 1]));
    layoutG.add(mesh(ribbon(ROAD_PTS, 1.4, GROUND + 0.04), M(C.road, { side: THREE.DoubleSide }), 0, 0, 0, false));
    // 跨海的地方：木橋（橋板＋兩側欄杆＋橋墩）
    const step = ROAD_LEN[ROAD_LEN.length - 1] / (ROAD_PTS.length - 1);
    for (let i = 1, n = 0; i < ROAD_PTS.length - 1; i++) {
      const p = ROAD_PTS[i]; if (inHex(p.x, p.y, R - GAP - 0.2)) { n = 0; continue; }
      const q = ROAD_PTS[i + 1], ang = -Math.atan2(q.y - p.y, q.x - p.x);
      const pl = mesh(new THREE.BoxGeometry(step * 1.08, 0.14, 1.9), M(n % 2 ? C.wood : 0xA06C3A), p.x, GROUND + 0.06, p.y, false); pl.rotation.y = ang; layoutG.add(pl);
      const nx = Math.sin(ang), nz = Math.cos(ang);   // 橋的側邊方向
      if (n % 3 === 0) [-1, 1].forEach((sd) => {
        layoutG.add(mesh(new THREE.BoxGeometry(0.1, 0.6, 0.1), M(0x8A5A30), p.x + nx * sd * 0.92, GROUND + 0.4, p.y + nz * sd * 0.92, false));
        if (n % 9 === 0) layoutG.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.8, 6), M(0x7A4A26), p.x + nx * sd * 0.8, GROUND - 0.85, p.y + nz * sd * 0.8, false));
      });
      [-1, 1].forEach((sd) => { const rl = mesh(new THREE.BoxGeometry(step * 1.08, 0.07, 0.07), M(0x8A5A30), p.x + nx * sd * 0.92, GROUND + 0.68, p.y + nz * sd * 0.92, false); rl.rotation.y = ang; layoutG.add(rl); });
      n++;
    }
    // 路燈：每隔約 9 單位一支，放在路邊
    for (let l = 5; l < ROAD_LEN[ROAD_LEN.length - 1] - 2; l += 9) {
      const i = ROAD_LEN.findIndex((v) => v >= l), p = ROAD_PTS[i], q = ROAD_PTS[Math.min(i + 1, ROAD_PTS.length - 1)];
      const dx = q.x - p.x, dz = q.y - p.y, L = Math.hypot(dx, dz) || 1, x = p.x - dz / L * 1.1, z = p.y + dx / L * 1.1;
      if (!inHex(x, z, R - GAP - 0.5)) continue;
      lampsG.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.6, 5), M(C.ink), x, GROUND + 0.8, z, false));
      lampsG.add(mesh(new THREE.SphereGeometry(0.2, 8, 6), lampMat, x, GROUND + 1.7, z, false));
    }
    // 外圈風景
    decorSpots = []; chestSig = '';
    DECOR_CELLS.forEach(([[q, r], type], i) => {
      if (UNIT_CELLS.slice(0, n).some(([a, b]) => a === q && b === r)) return;
      const [x, z] = hexXZ(q, r), before = scene.children.length;
      decorSpots.push({ x, z });
      buildDecor(type, x, z, i + 1); addFoam(x, z);
      scene.children.slice(before).forEach((o) => (o.userData.decor = true));
    });
    cells.forEach((c) => { const before = scene.children.length; addFoam(c.x, c.z); scene.children.slice(before).forEach((o) => (o.userData.decor = true)); });
  }
  // 這一點在不在某塊地上（含中央廣場）
  function inHex(x, z, rad = R - GAP) {
    const all = [{ x: 0, z: 0 }, ...cells, ...DECOR_CELLS.map(([[q, r]]) => { const [a, b] = hexXZ(q, r); return { x: a, z: b }; })];
    return all.some((c) => Math.hypot(x - c.x, z - c.z) < rad * 0.87);
  }

  // ── 單元地塊（隨進度重建）──
  let tiles = [], pickables = [];
  const tileAnim = [];
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
  const ringGeo = new THREE.CylinderGeometry(R - GAP - 0.25, R - GAP - 0.25, 0.06, 6, 1, true);
  function buildTiles(units) {
    tilesG.clear(); tiles = []; pickables = []; tileSway.length = 0; tileAnim.length = 0; swayList = tileSway;
    units.forEach((u, i) => {
      const c = cells[i]; if (!c) return;
      const g = new THREE.Group(); g.position.set(c.x, 0, c.z); tilesG.add(g);
      const plat = new THREE.Group(); g.add(plat);
      const state = u.locked ? 'locked' : u.full ? 'full' : u.started ? 'started' : 'fresh';
      const stateC = { full: u.faded ? C.faded : C.lime, started: C.mint, fresh: C.white, locked: C.locked }[state];
      const cap = hexTile(plat, u.locked ? C.locked : C.grass, u.locked ? C.lockedD : C.earth);
      cap.userData.unit = u.code; pickables.push(cap);
      // 地塊邊緣一圈進度色（白＝還沒開始、薄荷綠＝學習中、螢光黃＝完成）
      const ring = mesh(ringGeo, M(stateC, { side: THREE.DoubleSide }), 0, GROUND + 0.02, 0, false); ring.scale.y = 3; plat.add(ring);
      const rimE = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(R - GAP - 0.12, R - GAP - 0.12, 0.01, 6)), edgeMat); rimE.position.y = GROUND + 0.01; plat.add(rimE);
      // 房子放在離小路最遠的方位（不要擋路）
      let best = [0, 0], bestD = -1;
      for (let k = 0; k < 6; k++) {
        const a = k * Math.PI / 3 + Math.PI / 6, bx = c.x + Math.cos(a) * 1.5, bz = c.z + Math.sin(a) * 1.5;
        const d = Math.min(...ROAD_PTS.map((p) => Math.hypot(p.x - bx, p.y - bz)));
        if (d > bestD) { bestD = d; best = [bx - c.x, bz - c.z]; }
      }
      const house = new THREE.Group(); house.position.set(best[0], GROUND, best[1]); house.rotation.y = Math.atan2(-best[0], -best[1]) + Math.PI; plat.add(house);
      if (state === 'locked') {
        // 霧＋鎖：還沒開放
        [[0, 1.2, 0, 1.4], [1.2, 1.0, 0.6, 1], [-1.1, 1.0, -0.5, 1.1]].forEach(([a, b, d, r]) => plat.add(mesh(new THREE.IcosahedronGeometry(r, 1), M(0xF2F0EA, { transparent: true, opacity: 0.85 }), a, GROUND + b, d, false)));
        const lock = new THREE.Group(); lock.position.y = GROUND + 2.8; lock.userData.spin = true; plat.add(lock); tileAnim.push(lock);
        lock.add(mesh(new THREE.BoxGeometry(1.1, 0.85, 0.5), M(C.white), 0, 0, 0));
        lock.add(mesh(new THREE.TorusGeometry(0.36, 0.11, 6, 12, Math.PI), M(C.ink), 0, 0.42, 0));
      } else {
        // 地基＋每完成一站蓋一層樓＋屋頂（屋頂顏色＝進度色）
        house.add(mesh(new THREE.BoxGeometry(2.7, 0.3, 2.7), M(C.stone), 0, 0.15, 0));
        const FH = 0.85;
        for (let f = 0; f < u.floors; f++) {
          const y = 0.3 + f * FH + FH / 2;
          const wall = mesh(new THREE.BoxGeometry(2.2, FH, 2.2), M(f % 2 ? 0xFBF7EC : C.cream), 0, y, 0); wall.userData.unit = u.code; house.add(wall); pickables.push(wall);
          [[0, 1.11, 0], [0, -1.11, Math.PI], [1.11, 0, Math.PI / 2], [-1.11, 0, -Math.PI / 2]].forEach(([a, b, ry]) => [-0.45, 0.45].forEach((s) => {
            const w = mesh(new THREE.BoxGeometry(0.34, 0.36, 0.05), winMat, a + Math.cos(ry) * s, y + 0.04, b - Math.sin(ry) * s, false); w.rotation.y = ry; house.add(w);
          }));
          house.add(mesh(new THREE.BoxGeometry(2.3, 0.06, 2.3), M(C.ink), 0, 0.3 + (f + 1) * FH, 0, false));
        }
        const topY = 0.3 + u.floors * FH;
        if (u.floors === 0) {   // 空地：工地告示牌
          house.add(mesh(new THREE.BoxGeometry(0.1, 1.2, 0.1), M(C.wood), 0, 0.9, 0));
          house.add(mesh(new THREE.BoxGeometry(1.2, 0.7, 0.08), M(0xFFD84D), 0, 1.4, 0.06));
        } else {
          const roofC = { full: u.faded ? C.faded : C.lime, started: C.mint, fresh: C.coral }[state];
          const roof = mesh(new THREE.ConeGeometry(2.0, 1.3, 4), M(roofC), 0, topY + 0.65, 0); roof.rotation.y = Math.PI / 4; roof.userData.unit = u.code; house.add(roof); pickables.push(roof);
          house.add(mesh(new THREE.BoxGeometry(0.6, 0.75, 0.06), M(C.wood), 0, 0.68, 1.12, false));   // 門
          house.add(mesh(new THREE.BoxGeometry(0.32, 0.9, 0.32), M(0xC9A877), 0.65, topY + 0.7, -0.3));   // 煙囪
        }
        if (state === 'full') {
          house.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6), M(C.ink), 0, topY + 2.0, 0));
          const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1.3, -0.3, 0, 0, -0.6, 0], 3)); fg.computeVertexNormals();
          const flag = mesh(fg, M(u.faded ? C.locked : C.lime, { side: THREE.DoubleSide }), 0.04, topY + 2.85, 0); flag.userData.flag = true; house.add(flag); tileAnim.push(flag);
        }
        // 地塊上幾棵樹、花（避開房子和路）
        for (let k = 0; k < 7; k++) {
          const [a, b] = spot(i * 31 + k, 2.2, R - 1.1), wx = c.x + a, wz = c.z + b;
          if (Math.hypot(a - best[0], b - best[1]) < 2.2 || Math.min(...ROAD_PTS.map((p) => Math.hypot(p.x - wx, p.y - wz))) < 1.4) continue;
          if (k < 3) tree(plat, TROPIC ? 'palm' : k % 2 ? 'p' : 't', a, b, 0.6 + rnd(k + i) * 0.25); else flower(plat, a, b, [0xFF9AC1, 0xFFD84D, 0xffffff, 0xFF6B57][k % 4]);
        }
      }
      const lb = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex(u.code, u.sel), depthTest: false }));
      lb.scale.set(3.2, 1.44, 1); lb.center.set(0.5, 0); lb.renderOrder = 5;
      lb.position.set(best[0], GROUND + (u.locked ? 4.2 : 0.3 + u.floors * 0.85 + (u.full ? 3.6 : 1.8)), best[1]); plat.add(lb);
      tiles.push({ u, g, plat, x: c.x, z: c.z, door: c.door, sel: u.sel });
      plat.position.y = u.sel ? 0.45 : 0;
    });
    swayList = sway;
  }
  function tileByCode(code) { return tiles.find((t) => t.u.code === code); }
  function groundAt(x, z) {
    for (const t of tiles) if (Math.hypot(x - t.x, z - t.z) < (R - GAP) * 0.87) return GROUND + 0.04 + t.plat.position.y;
    return GROUND + 0.05;
  }
  // 角色停的位置：小路上離這塊地門口最近的點
  function standLen(t) {
    let near = 0, nd = 1e9;
    ROAD_PTS.forEach((p, i) => { const d = Math.hypot(p.x - t.door.x, p.y - t.door.z); if (d < nd) { nd = d; near = i; } });
    return ROAD_LEN[near];
  }

  // ── 天空切換鈕（試作用：現在／清晨／白天／黃昏／夜晚）──
  let skyIdx = 0;
  const skyBtn = document.createElement('button');
  skyBtn.type = 'button';
  skyBtn.style.cssText = 'position:absolute;left:10px;bottom:10px;z-index:3;border:0;border-radius:999px;padding:7px 12px;'
    + 'background:rgba(255,255,255,.9);color:#1a3a1a;font:700 12px "Noto Sans TC",system-ui,sans-serif;box-shadow:0 3px 10px rgba(0,0,0,.15)';
  const skyLabel = () => { const n = SKY_NAMES[skyIdx], en = host.lang && host.lang() === 'en'; skyBtn.textContent = '🌗 ' + (en ? n[1] : n[0]); };
  skyBtn.addEventListener('click', (e) => { e.stopPropagation(); skyIdx = (skyIdx + 1) % SKY_NAMES.length; skyHour = SKY_NAMES[skyIdx][2]; skyLabel(); applySky(); });
  if (!isNaN(urlHour)) skyIdx = -1;
  if (skyIdx >= 0) skyLabel(); else skyBtn.textContent = '🌗 ' + Math.floor(urlHour) + ':' + String(Math.round(urlHour % 1 * 60)).padStart(2, '0');
  el.appendChild(skyBtn);

  // ── 角色：學生捏的造型，做成永遠面向鏡頭的看板（含寵物）──
  const heroMat = new THREE.SpriteMaterial({ transparent: true, depthWrite: false });
  const hero = new THREE.Sprite(heroMat); hero.renderOrder = 4; scene.add(hero);
  const STRIDE = 3.4;   // 走一個完整步伐（左右各一步）的距離，約 0.42 秒
  const HERO_H = 5.4, HERO_CX = 0.424, HERO_CY = 0.021;
  hero.scale.set(HERO_H * 264 / 384, HERO_H, 1); hero.center.set(HERO_CX, HERO_CY);
  let heroKey = '', heroLen = 0, heroFlip = false, walking = null;
  // 貼圖：[面右, 面左] 各一組；站著一張、走路一步切成幾格（手腳真的前後擺）。面左的圖另外畫，泡泡的字才不會反過來
  let idleTex = [null, null], walkTex = [[], []], step = -1;
  // 立體紙偶：角色圖外面加一圈白邊（像剪下來的貼紙），下方再墊一層米色當紙板厚度
  function sticker(cv) {
    const w = cv.width, h = cv.height, k = w / 264;
    const sil = (color) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(cv, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, w, h); return c; };
    const edge = sil('#B9AE98'), white = sil('#ffffff');
    const out = document.createElement('canvas'); out.width = w; out.height = h; const g = out.getContext('2d');
    const ring = (img, r, dx, dy) => { for (let a = 0; a < 16; a++) g.drawImage(img, Math.cos(a * Math.PI / 8) * r + dx, Math.sin(a * Math.PI / 8) * r + dy); };
    ring(edge, 5 * k, 1.5 * k, 4.5 * k);   // 紙板厚度（往右下偏一點）
    ring(white, 5 * k, 0, 0);              // 白邊
    g.drawImage(cv, 0, 0);
    return out;
  }
  const toTex = (cv) => { const t = new THREE.CanvasTexture(sticker(cv)); t.colorSpace = THREE.SRGBColorSpace; return t; };
  // 腳下的圓形影子（自己的角色、同學分身共用一張漸層貼圖）
  const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(20,40,20,.55)'); gr.addColorStop(1, 'rgba(20,40,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const shadowGeo = flat(new THREE.PlaneGeometry(1, 1));
  function makeShadow(size) { const m = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); m.scale.set(size, 1, size * 0.6); m.renderOrder = 2; scene.add(m); return m; }
  function placeShadow(sh, sp, size) {   // 跳起來時影子變小、變淡
    const gy = groundAt(sp.position.x, sp.position.z), lift = Math.max(0, sp.position.y - gy), s = size * (1 - Math.min(0.35, lift * 0.8));
    sh.position.set(sp.position.x, gy + 0.08, sp.position.z); sh.scale.set(s, 1, s * 0.6); sh.material.opacity = 1 - Math.min(0.5, lift);
  }
  const heroShadow = makeShadow(2.6);
  // 轉身：紙偶像翻牌一樣從窄變寬（約 0.16 秒）
  const FLIP_MS = 160;
  const flipScale = (t0, now) => (t0 ? Math.min(1, 0.08 + (now - t0) / FLIP_MS) : 1);
  let heroFlipT = 0;
  async function refreshHero() {
    const k = host.heroKey(); if (k === heroKey) return; heroKey = k;
    const cv = await host.heroCanvas(); if (!cv) return;
    const old = [...idleTex, ...walkTex[0], ...walkTex[1]];
    idleTex = [toTex(cv), null]; walkTex = [[], []];
    showHero(); old.forEach((t) => t && t.dispose());
    const cvL = host.heroFlipCanvas ? await host.heroFlipCanvas() : null;
    if (k !== heroKey) return;
    if (cvL) { idleTex[1] = toTex(cvL); showHero(); }
    if (host.heroWalkFrames && !host.reduce) {
      const [r, l] = await Promise.all([host.heroWalkFrames(false), host.heroWalkFrames(true)]);
      if (k === heroKey && r.every(Boolean) && l.every(Boolean)) walkTex = [r.map(toTex), l.map(toTex)];
    }
  }
  // 依「面向、站或走、第幾格」選貼圖；沒有面左的圖時退回把面右的圖鏡像
  function showHero() {
    const side = heroFlip ? 1 : 0, w = walkTex[side];
    let t = step >= 0 && w.length ? w[step % w.length] : idleTex[side], mirror = false;
    if (!t) { t = step >= 0 && walkTex[0].length ? walkTex[0][step % walkTex[0].length] : idleTex[0]; mirror = heroFlip; }
    if (!t) return;
    t.repeat.x = mirror ? -1 : 1; t.offset.x = mirror ? 1 : 0;
    if (heroMat.map !== t) { heroMat.map = t; heroMat.needsUpdate = true; }
  }
  function setFlip(f, force) {
    if (f === heroFlip && !force) return; heroFlip = f;
    hero.center.x = f ? 1 - HERO_CX : HERO_CX; showHero();
    if (!force && !host.reduce) heroFlipT = performance.now();
  }
  function placeHero(l) { const r = roadAt(l); hero.position.x = r.x; hero.position.z = r.z; }

  // ── 同學分身：在他最後去的單元附近沿小路散步（走一段、停一下）；手腳一樣會擺 ──
  const MATE_STEPS = 4, MATE_H = HERO_H * 0.82;
  const matesG = new THREE.Group(); scene.add(matesG);
  let mateList = [], matesKey = '';
  async function refreshMates() {
    const list = host.mates ? host.mates() : [];
    const k = JSON.stringify(list.map((m) => [m.key, m.at, m.look, m.tags])); if (k === matesKey) { placeMateHomes(); return; } matesKey = k;
    mateList.forEach((m) => { m.tex.forEach((side) => side.forEach((t) => t && t.dispose())); m.sp.material.dispose(); matesG.remove(m.sp); scene.remove(m.sh); m.sh.material.dispose(); });
    mateList = [];
    for (const [i, m] of list.entries()) {
      const mat = new THREE.SpriteMaterial({ transparent: true, depthWrite: false });
      const sp = new THREE.Sprite(mat); sp.renderOrder = 3; sp.userData.mate = m.key;
      sp.scale.set(MATE_H * 264 / 384, MATE_H, 1); sp.center.set(HERO_CX, HERO_CY);
      const sh = makeShadow(2.1);
      matesG.add(sp);
      const w = { key: m.key, at: m.at, i, sp, sh, ft: 0, tex: [[], []], home: 0, l: 0, to: 0, pause: 800 + i * 900, left: i % 2 === 0, moving: false, dist: 0 };
      mateList.push(w);
      // 先畫站著的兩張（面右、面左），走路的格子之後再補
      const [r0, l0] = await Promise.all([host.mateCanvas(m, null, false), host.mateCanvas(m, null, true)]);
      if (k !== matesKey) return;
      w.tex[0][0] = r0 && toTex(r0); w.tex[1][0] = l0 && toTex(l0);
      if (!host.reduce) {
        const fr = await Promise.all([false, true].flatMap((f) => Array.from({ length: MATE_STEPS }, (_, j) => host.mateCanvas(m, j / MATE_STEPS, f))));
        if (k !== matesKey) return;
        for (let j = 0; j < MATE_STEPS; j++) { w.tex[0][1 + j] = fr[j] && toTex(fr[j]); w.tex[1][1 + j] = fr[MATE_STEPS + j] && toTex(fr[MATE_STEPS + j]); }
      }
      showMate(w);
    }
    placeMateHomes();
  }
  function placeMateHomes() {
    mateList.forEach((w) => {
      const t = tileByCode(w.at) || tiles.find((x) => !x.u.locked); if (!t) return;
      const base = standLen(t), total = ROAD_LEN[ROAD_LEN.length - 1] || 1;
      const home = Math.max(0.5, Math.min(total - 0.5, base + (w.i % 2 ? 1 : -1) * (2.2 + (w.i % 3) * 1.3)));
      if (Math.abs(home - w.home) > 0.01) { w.home = home; w.l = home; w.to = home; placeMate(w); }
    });
  }
  function placeMate(w) { const r = roadAt(w.l); w.sp.position.set(r.x, groundAt(r.x, r.z), r.z); }
  function showMate(w) {
    const side = w.left ? 1 : 0, set = w.tex[side];
    const t = (w.moving && set[1 + (Math.floor(w.dist / (STRIDE * 0.8) * MATE_STEPS) % MATE_STEPS)]) || set[0] || w.tex[0][0];
    if (t && w.sp.material.map !== t) { w.sp.material.map = t; w.sp.material.needsUpdate = true; }
  }
  function tickMates(dtMs) {
    mateList.forEach((w) => {
      if (!w.sp.material.map) return;
      if (w.pause > 0) { w.pause -= dtMs; if (w.moving) { w.moving = false; showMate(w); } return; }
      if (Math.abs(w.to - w.l) < 0.05) { w.to = w.home + (Math.random() * 2 - 1) * 2.6; w.pause = 1200 + Math.random() * 2800; w.moving = false; showMate(w); return; }
      const dir = Math.sign(w.to - w.l), d = Math.min(Math.abs(w.to - w.l), dtMs / 1000 * 2.2);   // 慢慢散步（主角的 1/4 速度）
      const before = proj.copy(w.sp.position).project(camera).x;
      w.l += dir * d; w.dist += d; w.moving = true; placeMate(w);
      const after = proj.copy(w.sp.position).project(camera).x;
      if (Math.abs(after - before) > 0.0002) { const lf = after < before; if (lf !== w.left) { w.left = lf; w.sp.center.x = lf ? 1 - HERO_CX : HERO_CX; w.ft = performance.now(); } }
      showMate(w);
    });
  }

  // ── 視角 ──
  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.08, enablePan: false, minDistance: 16, maxDistance: 115, maxPolarAngle: 1.32, minPolarAngle: 0.02, rotateSpeed: 0.7, zoomSpeed: 0.9 });
  // eye＝平視：鏡頭降到角色身後、看著角色（像在島上散步）
  const VIEWS = { bird: { polar: 0.9, az: 0.18, dist: 80 }, top: { polar: 0.03, az: 0, dist: 82 }, low: { polar: 1.22, az: 0.6, dist: 60 }, eye: { polar: 1.18, dist: 20, hero: true } };
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
    controls.maxDistance = 115 * fitK(); scene.fog.near = 120 * fitK(); scene.fog.far = 220 * fitK();
  }
  const ro = new ResizeObserver(resize); ro.observe(el);
  controls.addEventListener('start', () => { fly = null; });

  // ── 走路路線：黃色圓點沿小路排到目的地，走過的點消失；終點一支倒立的旗標上下浮動 ──
  const routeG = new THREE.Group(); scene.add(routeG);

  // ── 每週神秘寶箱：放在風景小島朝外的沙灘上；點了交給 host.chestTap ──
  const chestG = new THREE.Group(); scene.add(chestG);
  let chestPick = [], chestSig = '';
  function buildChests(list) {
    const sig = JSON.stringify(list.map((c) => [c.i, c.x, c.y, c.tried])) + decorSpots.length; if (sig === chestSig) return; chestSig = sig;
    chestG.clear(); chestPick = [];
    const used = new Set();
    list.forEach((c) => {
      if (!decorSpots.length) return;
      let k = Math.abs(Math.round(c.x * 0.37 + c.y * 0.11 + c.i * 5)) % decorSpots.length;   // 同一週、同一個學生位置固定（2D 座標本來就依週＋學生 ID 挑）
      while (used.has(k) && used.size < decorSpots.length) k = (k + 1) % decorSpots.length; used.add(k);
      const d = decorSpots[k], a = Math.atan2(d.z, d.x) + (rnd(c.i + c.x) - 0.5) * 0.8;
      const g = new THREE.Group(); g.position.set(d.x + Math.cos(a) * (R - GAP + 0.6), -0.05, d.z + Math.sin(a) * (R - GAP + 0.6)); g.rotation.y = -a + Math.PI / 2;
      const box = new THREE.Group(); box.scale.setScalar(1.4); g.add(box);
      box.add(mesh(new THREE.BoxGeometry(1.5, 0.9, 1.0), M(0xB9773A), 0, 0.45, 0));
      box.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8, 1, false, 0, Math.PI), M(0xE09A4A), 0, 0.9, 0).rotateZ(Math.PI / 2));
      box.add(mesh(new THREE.BoxGeometry(0.34, 0.42, 0.08), M(0xFFD84D), 0, 0.7, 0.52, false));
      [-0.55, 0.55].forEach((bx) => box.add(mesh(new THREE.BoxGeometry(0.12, 0.92, 1.04), M(0x6B4423), bx, 0.46, 0, false)));
      if (!c.tried) {
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 7, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFD84D, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }));
        beam.position.y = 3.5; g.add(beam); beam.userData.chest = c.i; chestPick.push(beam);
      }
      box.children.forEach((m) => { m.userData.chest = c.i; chestPick.push(m); });
      g.userData = { box, tried: c.tried, p: c.i * 1.7 };
      if (c.tried) box.scale.setScalar(1.2);
      chestG.add(g);
    });
  }
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
    const mh = ray.intersectObjects(matesG.children, false)[0]; if (mh && host.mateTap) return host.mateTap(mh.object.userData.mate);
    const ch = chestPick.length && ray.intersectObjects(chestPick, false)[0];
    if (ch && host.chestTap) return host.chestTap(ch.object.userData.chest);
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
    const units = host.units();
    if (units.length !== curN) buildLayout(units.length);
    buildTiles(units);
    const at = tileByCode(host.heroAt()) || tiles.find((t) => !t.u.locked);
    if (at && !walking) { heroLen = standLen(at); placeHero(heroLen); hero.position.y = groundAt(hero.position.x, hero.position.z); }
    if (view === 'eye' && !walking && !follow) controls.target.copy(heroTarget());
    await refreshHero();
    refreshMates();
    if (host.chests) buildChests(host.chests());
  }

  // ── 動畫迴圈：首頁看不到時暫停，省電 ──
  let frames = 0, fpsT = performance.now(), checks = 0, raf = 0, skyT = 0;
  const clock = new THREE.Clock(), proj = new THREE.Vector3();
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (!host.active()) return;
    const dt = Math.min(0.1, clock.getDelta()), t = clock.elapsedTime, motion = !host.reduce;
    if (now - skyT > 30000) { skyT = now; applySky(); }   // 每 30 秒跟著時間更新天色
    if (fly) { const k = Math.min(1, (now - fly.t0) / fly.dur), e = ease(k); camera.position.lerpVectors(fly.fromP, fly.toP, e); controls.target.lerpVectors(fly.fromT, fly.toT, e); if (k >= 1) fly = null; }
    if (walking) {
      let k = Math.min(1, (now - walking.t0) / (walking.dur || 1)); if (walking.skip || !walking.dur) k = 1;
      const before = proj.copy(hero.position).project(camera).x;
      heroLen = walking.from + (walking.to - walking.from) * walkEase(k); placeHero(heroLen);
      const after = proj.copy(hero.position).project(camera).x;
      if (Math.abs(after - before) > 0.0005) setFlip(after < before);
      if (walkTex[0].length) { step = Math.floor(Math.abs(heroLen - walking.from) / STRIDE * walkTex[0].length); showHero(); heroMat.rotation = Math.sin(now / 70) * 0.02; }
      else heroMat.rotation = Math.sin(now / 70) * 0.07;
      const dir = Math.sign(walking.to - walking.from);
      routeG.children.forEach((d) => { if (d.userData.l != null) d.visible = dir * (d.userData.l - heroLen) > 0.3; });
      if (k >= 1) {
        const code = walking.t.u.code; walking = null; heroMat.rotation = 0; step = -1; showHero(); follow = false; pill.hidden = true; clearRoute();
        hero.position.y = groundAt(hero.position.x, hero.position.z);
        const toT = heroTarget(), s = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
        s.radius = FOLLOW.dist; s.phi = FOLLOW.polar;
        fly = { t0: now, dur: 450, fromP: camera.position.clone(), toP: toT.clone().add(new THREE.Vector3().setFromSpherical(s)), fromT: controls.target.clone(), toT };
        host.arrive(code);
      }
    }
    if (follow) {
      const s = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      const fz = 1 - Math.pow(0.05, dt), ft = 1 - Math.pow(0.0005, dt);
      s.radius += (FOLLOW.dist - s.radius) * fz; s.phi += (FOLLOW.polar - s.phi) * fz;
      controls.target.lerp(heroTarget(), ft);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));
    }
    if (motion) tickMates(dt * 1000);
    if (routeEnd && motion) routeEnd.position.y = routeEnd.userData.y + Math.sin(t * 4) * 0.25;
    const gy = groundAt(hero.position.x, hero.position.z) + (walking ? Math.abs(Math.sin(now / 70)) * 0.18 : motion ? Math.sin(t * 2.2) * 0.04 : 0);
    hero.position.y += (gy - hero.position.y) * 0.35;
    hero.scale.x = HERO_H * 264 / 384 * flipScale(heroFlipT, now); if (heroFlipT && now - heroFlipT > FLIP_MS) heroFlipT = 0;
    placeShadow(heroShadow, hero, 2.6);
    mateList.forEach((w) => { w.sp.scale.x = MATE_H * 264 / 384 * flipScale(w.ft, now); if (w.ft && now - w.ft > FLIP_MS) w.ft = 0; w.sh.visible = !!w.sp.material.map; placeShadow(w.sh, w.sp, 2.1); });
    if (motion) {
      const a = seaGeo.attributes.position, arr = a.array;
      for (let i = 0; i < arr.length; i += 3) arr[i + 1] = seaBase[i + 1] + Math.sin(seaBase[i] * 0.25 + t * 1.2) * 0.18 + Math.cos(seaBase[i + 2] * 0.3 + t) * 0.15;
      a.needsUpdate = true;
      foams.forEach((f) => { const s = 1 + Math.sin(t * 1.3 + f.p) * 0.035; f.f.scale.set(s, s, 1); f.f.material.opacity = 0.42 + Math.sin(t * 1.3 + f.p) * 0.12; });
      sway.forEach((s) => (s.g.rotation.z = Math.sin(t * 1.4 + s.p) * 0.035));
      tileSway.forEach((s) => (s.g.rotation.z = Math.sin(t * 1.4 + s.p) * 0.035));
      drifters.forEach((d) => (d.g.position.x = d.x0 + Math.sin(t * d.sp + d.p) * 4));
      bobbers.forEach((b) => {
        if (b.pulse) { const s = 1 + Math.sin(t * 5) * 0.12; b.g.scale.set(s, 1 + Math.sin(t * 5 + 1) * 0.2, s); return; }
        if (b.graze) { b.g.rotation.z = Math.max(0, Math.sin(t * 0.9 + b.p)) * 0.25; return; }   // 羊低頭吃草
        b.g.position.y = b.y + Math.sin(t * 1.8 + b.p) * 0.08;
        if (b.swim) { b.g.position.x = b.swim.cx + Math.cos(t * 0.4) * b.swim.rx; b.g.position.z = b.swim.cz + Math.sin(t * 0.4) * b.swim.rz; b.g.rotation.y = -t * 0.4; }
      });
      spinners.forEach((s) => { if (s.axis === 'z') s.g.rotation.z = t * s.sp; else s.g.rotation.y = Math.sin(t * 3) * 0.25; });
      // 帆船繞島、海鷗盤旋
      const ba = t * 0.035; boat.position.set(Math.cos(ba) * 40, -0.3 + Math.sin(t * 1.8) * 0.12, Math.sin(ba) * 40); boat.rotation.set(0, -ba - Math.PI / 2, Math.sin(t * 1.3) * 0.08);
      birds.forEach((b) => { const a = t * b.sp + b.p; b.b.position.set(Math.cos(a) * b.r, b.h + Math.sin(t * 0.7 + b.p) * 0.6, Math.sin(a) * b.r); b.b.rotation.y = -a; b.b.children.forEach((w) => (w.rotation.x = 0, w.rotation.z = w.userData.side * Math.sin(t * 6 + b.p) * 0.45)); });
      chestG.children.forEach((g) => { if (g.userData.tried) return; g.userData.box.position.y = Math.abs(Math.sin(t * 2.4 + g.userData.p)) * 0.35; g.userData.box.rotation.y = Math.sin(t * 0.9 + g.userData.p) * 0.5; });
      tileAnim.forEach((c) => { if (c.userData.flag) c.rotation.y = Math.sin(t * 3) * 0.25; if (c.userData.spin) c.rotation.y = t * 0.8; });
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

  applyQuality(); resize(); applySky();
  await update();
  setView('bird', true);
  camera.position.multiplyScalar(1.6); setView('bird');   // 開場：從遠處飛進來
  raf = requestAnimationFrame(loop);

  return {
    update, setView,
    _debug: { camera, tiles: () => tiles, hero, renderer },   // 測試用
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); skyBtn.remove(); controls.dispose(); renderer.dispose(); renderer.domElement.remove(); },
  };
}
