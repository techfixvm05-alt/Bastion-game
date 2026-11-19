import { WORLD, CORE } from './config.js';

const edge = (side, offset) => side === 'left' ? { x: 0, y: offset } : side === 'right' ? { x: WORLD.width, y: offset } : side === 'top' ? { x: offset, y: 0 } : { x: offset, y: WORLD.height };
const route = (start, bends) => [start, ...bends, { x: CORE.x, y: CORE.y }];

export const MAPS = [
  { name: 'Las Tierras Rojas', biome: 'FALLA BASÁLTICA', colors: { ground: '#202522', grid: '#39423a', path: '#887353', accent: '#d59a5a' }, routes: [route(edge('left', 560), [{ x: 420, y: 620 }, { x: 710, y: 490 }]), route(edge('right', 1360), [{ x: 2320, y: 1280 }, { x: 2090, y: 1190 }]), route(edge('top', 2060), [{ x: 1980, y: 370 }, { x: 1710, y: 650 }]), route(edge('bottom', 650), [{ x: 700, y: 1460 }, { x: 970, y: 1240 }])], obstacles: [[490,1020,170,82],[2200,610,210,90],[980,280,190,80],[1780,1550,220,100],[2360,990,130,110],[380,1510,160,120]], objective: { kind: 'evacuate', name: 'Evacuación de estación', text: 'Llegá a la estación y mantené E para evacuar al equipo.', x: 640, y: 1640, radius: 120, duration: 7, progress: 0, complete: false, reward: 280 } },
  { name: 'Cantera de Ceniza', biome: 'CUENCA DE ESCORIA', colors: { ground: '#222124', grid: '#413b42', path: '#766c65', accent: '#e27861' }, routes: [route(edge('top', 540), [{ x: 630, y: 380 }, { x: 820, y: 630 }]), route(edge('right', 480), [{ x: 2340, y: 500 }, { x: 2080, y: 690 }]), route(edge('bottom', 2180), [{ x: 2100, y: 1470 }, { x: 1840, y: 1270 }]), route(edge('left', 1450), [{ x: 410, y: 1380 }, { x: 710, y: 1190 }])], obstacles: [[1020,430,170,200],[1640,1200,220,120],[450,790,160,90],[2280,1510,150,80],[2260,900,110,170],[790,1570,160,80]], objective: { kind: 'relays', name: 'Núcleos auxiliares', text: 'Defendé ambos núcleos hasta superar la oleada 8.', sites: [{ name: 'Núcleo de extracción A', x: 820, y: 630, hp: 620, maxHp: 620, radius: 96 }, { name: 'Núcleo de extracción B', x: 2080, y: 690, hp: 620, maxHp: 620, radius: 96 }], complete: false, failed: false, reward: 420 } },
  { name: 'Delta Fracturado', biome: 'MAR DE CRISTALES', colors: { ground: '#1c2629', grid: '#34454a', path: '#637a73', accent: '#76cfbf' }, routes: [route(edge('left', 350), [{ x: 520, y: 450 }, { x: 760, y: 660 }]), route(edge('top', 2280), [{ x: 2190, y: 350 }, { x: 1920, y: 630 }]), route(edge('right', 1550), [{ x: 2360, y: 1460 }, { x: 2070, y: 1300 }]), route(edge('bottom', 460), [{ x: 490, y: 1500 }, { x: 800, y: 1260 }])], obstacles: [[1160,320,260,82],[540,1110,110,220],[2120,900,190,110],[1560,1560,230,100],[1760,280,120,140],[900,1550,110,120]], objective: { kind: 'stabilize', name: 'Estabilizar balizas', text: 'Activá las tres balizas manteniendo E cerca de cada una.', sites: [{ name: 'Baliza del oeste', x: 520, y: 450 }, { name: 'Baliza del norte', x: 2190, y: 350 }, { name: 'Baliza del delta', x: 2360, y: 1460 }], current: 0, progress: 0, duration: 2.5, complete: false, reward: 360 } }
];

export const TERRAIN_PATTERNS = [
  { id: 'scatter', name: 'Campo de esquirlas', style: 'scatter' },
  { id: 'ridges', name: 'Espolones de escoria', style: 'ridges' },
  { id: 'craters', name: 'Anillo de impacto', style: 'craters' },
  { id: 'crystals', name: 'Bancos de cristales', style: 'crystals' }
];

export function hashSeed(value) {
  let hash = 2166136261;
  for (const char of String(value || 'bastion')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}

function segmentDistance(point, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(point.x - (a.x + dx * t), point.y - (a.y + dy * t));
}

function terrainCandidate(pattern, random, anchor) {
  if (pattern.style === 'ridges') {
    const lane = Math.floor(random() * 5);
    return { x: 150 + random() * (WORLD.width - 380), y: 150 + lane * 350 + random() * 95 };
  }
  if (pattern.style === 'craters') {
    const angle = random() * Math.PI * 2, radius = 390 + random() * 690;
    return { x: CORE.x + Math.cos(angle) * radius, y: CORE.y + Math.sin(angle) * radius };
  }
  if (pattern.style === 'crystals') {
    const x = anchor.x + (random() - .5) * 570, y = anchor.y + (random() - .5) * 430;
    return { x, y };
  }
  return { x: 150 + random() * (WORLD.width - 300), y: 150 + random() * (WORLD.height - 300) };
}

export function createMap(index, seedText = 'bastion') {
  const source = MAPS[index] ?? MAPS[0];
  const seed = String(seedText || 'bastion');
  const patternIndex = hashSeed(`${index}:${seed}:pattern`) % TERRAIN_PATTERNS.length;
  const pattern = TERRAIN_PATTERNS[patternIndex];
  const anchors = [[360, 330], [1420, 300], [2440, 360], [420, 1510], [1420, 1580], [2390, 1500]];
  const anchor = anchors[hashSeed(`${index}:${seed}:cluster`) % anchors.length];
  const map = { ...source, seed, terrainPattern: pattern, patternObstacleStart: source.obstacles.length, objective: JSON.parse(JSON.stringify(source.objective)), routes: source.routes.map((points, id) => ({ id, points: points.map(p => ({ ...p })), bossAdded: false, fissures: 0 })), obstacles: source.obstacles.map(v => [...v]) };
  const random = seededRandom(hashSeed(`${index}:${seed}:layout-v2`));
  let placed = 0;
  for (let attempts = 0; placed < 7 && attempts < 800; attempts++) {
    const candidate = terrainCandidate(pattern, random, anchor);
    const x = candidate.x, y = candidate.y;
    const wide = pattern.style === 'ridges' || (pattern.style === 'scatter' && random() > .55);
    const w = wide ? 145 + random() * 155 : 75 + random() * 85;
    const h = wide ? 48 + random() * 48 : 66 + random() * 90;
    if (x < 80 || x + w > WORLD.width - 80 || y < 80 || y + h > WORLD.height - 80) continue;
    const center = { x: x + w / 2, y: y + h / 2 };
    const nearPath = map.routes.some(r => r.points.slice(1).some((p, i) => segmentDistance(center, r.points[i], p) < 175));
    const nearCore = Math.hypot(center.x - CORE.x, center.y - CORE.y) < 260;
    const nearObjective = map.objective.sites?.some(site => Math.hypot(center.x - site.x, center.y - site.y) < 240)
      || (map.objective.x && Math.hypot(center.x - map.objective.x, center.y - map.objective.y) < 240);
    const overlaps = map.obstacles.some(([ox, oy, ow, oh]) => x < ox + ow + 55 && x + w + 55 > ox && y < oy + oh + 55 && y + h + 55 > oy);
    if (nearPath || nearCore || nearObjective || overlaps) continue;
    map.obstacles.push([Math.round(x), Math.round(y), Math.round(w), Math.round(h)]); placed++;
  }
  return map;
}

export function makeBossRoutes(map, wave) {
  if (map.routes.some(r => r.bossAdded)) return [];
  const side = wave % 2 ? 'top' : 'bottom';
  const a = edge(side, 330 + (wave * 91) % 470);
  const b = edge(side, 2040 + (wave * 67) % 490);
  const routes = [
    [a, { x: 300, y: 260 + (wave % 3) * 240 }, { x: 920, y: 520 }, { x: 1180, y: 800 }, { x: CORE.x, y: CORE.y }],
    [b, { x: 2480, y: 1520 - (wave % 3) * 190 }, { x: 1930, y: 1380 }, { x: 1670, y: 1110 }, { x: CORE.x, y: CORE.y }]
  ];
  const result = routes.map((points, i) => ({ id: map.routes.length + i, points, bossAdded: true }));
  map.routes.push(...result);
  return result;
}

// Sectores 4-6: variantes espejadas de los originales con bioma y objetivo propios.
(function addExtraSectors() {
  const defs = [
    [0, 'Autopista Muerta', 'ASFALTO FRACTURADO', { ground: '#1f2127', grid: '#383c4a', path: '#5d6275', accent: '#ff4fa3' }, true, false],
    [1, 'Fundición Hueca', 'FORJA DE LA LEGIÓN', { ground: '#241c1b', grid: '#47342f', path: '#7a5a48', accent: '#ff8a3d' }, false, true],
    [2, 'Corazón del Enjambre', 'NÚCLEO DE OMNI-9', { ground: '#191a2b', grid: '#2f3157', path: '#4d5390', accent: '#4fd8ff' }, true, true]
  ];
  for (const [from, name, biome, colors, fx, fy] of defs) {
    const m = JSON.parse(JSON.stringify(MAPS[from]));
    const X = x => fx ? WORLD.width - x : x, Y = y => fy ? WORLD.height - y : y;
    m.name = name; m.biome = biome; m.colors = colors;
    m.routes = m.routes.map(r => r.map(p => ({ x: X(p.x), y: Y(p.y) })));
    m.obstacles = m.obstacles.map(([x, y, w, h]) => [fx ? WORLD.width - x - w : x, fy ? WORLD.height - y - h : y, w, h]);
    const o = m.objective; if (o.x != null) { o.x = X(o.x); o.y = Y(o.y); }
    if (o.sites) o.sites = o.sites.map(s => ({ ...s, x: X(s.x), y: Y(s.y) }));
    o.reward = Math.round((o.reward || 250) * 1.25);
    MAPS.push(m);
  }
})();
