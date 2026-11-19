import { CORE, SEE, WORLD } from '../config.js';
import { S } from '../state.js';

function pathStroke(ctx, route, width, color, dash = []) {
  ctx.beginPath(); route.points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = width; ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
}

function drawRouteArrows(ctx, route, color) {
  const spacing = 420, size = 19;
  let walked = 0, nextArrow = spacing;
  for (let i = 1; i < route.points.length; i++) {
    const a = route.points[i - 1], b = route.points[i], dx = b.x - a.x, dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    while (length > 0 && nextArrow <= walked + length) {
      const t = (nextArrow - walked) / length, x = a.x + dx * t, y = a.y + dy * t;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(dy, dx));
      ctx.beginPath(); ctx.moveTo(size, 0); ctx.lineTo(-size * .72, -size * .72); ctx.lineTo(-size * .35, 0); ctx.lineTo(-size * .72, size * .72); ctx.closePath();
      ctx.fillStyle = color; ctx.globalAlpha = .88; ctx.fill(); ctx.restore();
      nextArrow += spacing;
    }
    walked += length;
  }
}

let groundCache = null, groundKey = '';
function buildGround() {
  const key = `${S.mapIndex}:${S.map.seed}`; if (groundKey === key && groundCache) return groundCache;
  const c = document.createElement('canvas'); c.width = WORLD.width; c.height = WORLD.height; const g = c.getContext('2d'); if (!g) return null;
  let r = 1; for (const ch of key) r = (r * 31 + ch.charCodeAt(0)) >>> 0; const rnd = () => (r = (r * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 9000; i++) { g.fillStyle = rnd() > .5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.09)'; g.fillRect(rnd() * WORLD.width, rnd() * WORLD.height, 2 + rnd() * 5, 1 + rnd() * 3); }
  g.lineWidth = 2; g.strokeStyle = S.map.colors.accent + '26';
  for (let i = 0; i < 70; i++) { let x = Math.round(rnd() * 35) * 80, y = Math.round(rnd() * 24) * 80; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { if (rnd() > .5) x += (rnd() > .5 ? 1 : -1) * 80 * (1 + Math.floor(rnd() * 2)); else y += (rnd() > .5 ? 1 : -1) * 80 * (1 + Math.floor(rnd() * 2)); g.lineTo(x, y); } g.stroke(); g.fillStyle = S.map.colors.accent + '55'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
  groundCache = c; groundKey = key; return c;
}

export function drawTerrain(ctx) {
  const { colors, biome } = S.map;
  const seedSalt = [...(S.map.seed || '')].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  ctx.fillStyle = colors.ground; ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  const shade = ctx.createRadialGradient(CORE.x, CORE.y, 120, CORE.x, CORE.y, 1730);
  shade.addColorStop(0, 'rgba(255,255,255,.035)'); shade.addColorStop(1, 'rgba(0,0,0,.34)');
  ctx.fillStyle = shade; ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.strokeStyle = colors.grid; ctx.lineWidth = 1;
  for (let x = 0; x <= WORLD.width; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.height); ctx.stroke(); }
  for (let y = 0; y <= WORLD.height; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.width, y); ctx.stroke(); }
  try { const gc = buildGround(); if (gc) ctx.drawImage(gc, S.camera.x, S.camera.y, SEE.width, SEE.height, S.camera.x, S.camera.y, SEE.width, SEE.height); } catch { /* sin capa extra */ }
  // Basalt plates and mineral seams give each sector a layered ground texture.
  for (let x = 45; x < WORLD.width; x += 190) for (let y = 60; y < WORLD.height; y += 175) {
    const seed = ((x * 13 + y * 7 + S.mapIndex * 31 + seedSalt) % 19) / 19;
    ctx.strokeStyle = `rgba(${seed > .5 ? '196,177,143' : '8,15,19'},${.035 + seed * .05})`;
    ctx.lineWidth = seed > .65 ? 2 : 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 42 + seed * 45, y + 13 + seed * 25); ctx.lineTo(x + 65 + seed * 48, y + 32 + seed * 17); ctx.stroke();
    if (seed > .78) { ctx.fillStyle = `rgba(${colors.accent.slice(1).match(/../g).map(v => parseInt(v,16)).join(',')},.14)`; ctx.beginPath(); ctx.arc(x + 32, y + 26, 3 + seed * 3, 0, Math.PI * 2); ctx.fill(); }
  }
  // Route shadow, packed-earth bed, edge marks and center guide.
  for (const route of S.map.routes) {
    pathStroke(ctx, route, 82, 'rgba(0,0,0,.34)');
    pathStroke(ctx, route, 68, colors.path);
    pathStroke(ctx, route, 57, 'rgba(190,166,126,.12)');
    pathStroke(ctx, route, 2, 'rgba(231,207,160,.21)', [8, 15]);
    if (route.bossAdded) { pathStroke(ctx, route, 5, 'rgba(215,131,232,.48)', [13, 12]); pathStroke(ctx, route, 1.5, 'rgba(245,203,255,.75)', [3, 11]); }
    if (route.fissures) { pathStroke(ctx, route, 4, 'rgba(255,146,91,.54)', [5, 14]); }
  }
  for (const route of S.map.routes) {
    pathStroke(ctx, route, 74, `${colors.accent}22`); pathStroke(ctx, route, 3, `${colors.accent}aa`, [2, 22]);
    drawRouteArrows(ctx, route, colors.accent);
  }
  // Diferencias visuales por capítulo: estas estructuras no bloquean terreno, pero hacen cada sector reconocible.
  ctx.save();
  const landmarks = S.mapIndex % 6;
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5 + S.mapIndex * .63;
    const x = CORE.x + Math.cos(angle) * (430 + i * 85);
    const y = CORE.y + Math.sin(angle) * (330 + i * 70);
    if (landmarks === 0 || landmarks === 3) {
      ctx.fillStyle = i % 2 ? '#76624d' : '#a28b67';
      ctx.beginPath(); ctx.moveTo(x - 24, y + 28); ctx.lineTo(x - 8, y - 55); ctx.lineTo(x + 22, y - 18); ctx.lineTo(x + 34, y + 28); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `${colors.accent}88`; ctx.lineWidth = 2; ctx.stroke();
    } else if (landmarks === 1 || landmarks === 4) {
      ctx.fillStyle = '#303335'; ctx.fillRect(x - 28, y - 24, 56, 48);
      ctx.strokeStyle = colors.accent; ctx.lineWidth = 3; ctx.strokeRect(x - 28, y - 24, 56, 48);
      ctx.fillStyle = '#b1a26f'; ctx.fillRect(x - 18, y - 17, 36, 5);
      ctx.fillStyle = colors.accent; ctx.fillRect(x - 4, y - 38, 8, 14);
    } else {
      ctx.fillStyle = 'rgba(92,181,190,.18)';
      ctx.beginPath(); ctx.moveTo(x, y - 46); ctx.lineTo(x + 31, y + 18); ctx.lineTo(x + 8, y + 38); ctx.lineTo(x - 28, y + 12); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `${colors.accent}cc`; ctx.lineWidth = 2; ctx.stroke();
    }
  }
  ctx.restore();
  for (const [index, [x, y, w, h]] of S.map.obstacles.entries()) {
    const generated = index >= (S.map.patternObstacleStart ?? Infinity), style = S.map.terrainPattern?.style;
    ctx.fillStyle = 'rgba(5,9,12,.38)'; ctx.fillRect(x + 10, y + 14, w, h);
    if (generated && style === 'crystals') {
      const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#829d9b'); g.addColorStop(.42, colors.accent); g.addColorStop(1, '#202d31');
      ctx.beginPath(); ctx.moveTo(x + w * .5, y); ctx.lineTo(x + w * .86, y + h * .22); ctx.lineTo(x + w * .78, y + h * .78); ctx.lineTo(x + w * .5, y + h); ctx.lineTo(x + w * .18, y + h * .69); ctx.lineTo(x + w * .12, y + h * .24); ctx.closePath();
      ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(218,255,247,.48)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w * .5, y + 2); ctx.lineTo(x + w * .48, y + h * .56); ctx.lineTo(x + w * .18, y + h * .69); ctx.moveTo(x + w * .48, y + h * .56); ctx.lineTo(x + w * .78, y + h * .78); ctx.moveTo(x + w * .86, y + h * .22); ctx.lineTo(x + w * .48, y + h * .56); ctx.strokeStyle = 'rgba(235,255,249,.34)'; ctx.lineWidth = 1.5; ctx.stroke();
    } else if (generated && style === 'craters') {
      const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#4b5556'); g.addColorStop(1, '#1d2428');
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w * .49, h * .48, -.08, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(204,190,162,.32)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2 + 2, w * .27, h * .22, -.08, 0, Math.PI * 2); ctx.fillStyle = 'rgba(8,13,16,.46)'; ctx.fill(); ctx.strokeStyle = 'rgba(12,18,20,.58)'; ctx.lineWidth = 2; ctx.stroke();
    } else if (generated && style === 'ridges') {
      const g = ctx.createLinearGradient(x, y, x + w * .2, y + h); g.addColorStop(0, '#626663'); g.addColorStop(1, '#242b2d');
      ctx.beginPath(); ctx.moveTo(x, y + h * .82); ctx.lineTo(x + w * .14, y + h * .48); ctx.lineTo(x + w * .31, y + h * .64); ctx.lineTo(x + w * .53, y + h * .12); ctx.lineTo(x + w * .69, y + h * .45); ctx.lineTo(x + w * .86, y + h * .28); ctx.lineTo(x + w, y + h * .76); ctx.lineTo(x + w * .84, y + h); ctx.lineTo(x + w * .16, y + h); ctx.closePath();
      ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(210,202,176,.28)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w * .14, y + h * .72); ctx.lineTo(x + w * .32, y + h * .8); ctx.moveTo(x + w * .53, y + h * .32); ctx.lineTo(x + w * .68, y + h * .65); ctx.strokeStyle = 'rgba(218,214,194,.2)'; ctx.lineWidth = 2; ctx.stroke();
    } else {
      const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#475052'); g.addColorStop(1, '#242c2e');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(211,220,202,.18)'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      ctx.beginPath(); ctx.moveTo(x + 10, y + 14); ctx.lineTo(x + w * .44, y + 8); ctx.lineTo(x + w * .62, y + h * .54); ctx.lineTo(x + w * .24, y + h - 8); ctx.closePath();
      ctx.fillStyle = 'rgba(149,164,157,.13)'; ctx.fill();
    }
  }
  // Map boundary, sector labels and reactor approach markings.
  ctx.strokeStyle = 'rgba(218,226,207,.13)'; ctx.lineWidth = 3; ctx.strokeRect(20, 20, WORLD.width - 40, WORLD.height - 40);
  ctx.fillStyle = 'rgba(226,232,215,.30)'; ctx.font = '700 13px monospace'; ctx.fillText(biome, 58, 55);
  ctx.font = '11px monospace'; ctx.fillText(`PATRÓN · ${S.map.terrainPattern?.name || 'Terreno base'}`, 58, 75);
  ctx.fillText('PERÍMETRO DE CONTENCIÓN', 58, 94);
  ctx.save(); ctx.translate(CORE.x, CORE.y);
  ctx.strokeStyle = 'rgba(112,225,191,.24)'; ctx.lineWidth = 3;
  for (let a = 0; a < 8; a++) { ctx.save(); ctx.rotate(a * Math.PI / 4); ctx.beginPath(); ctx.moveTo(70, -5); ctx.lineTo(110, -5); ctx.lineTo(124, 0); ctx.lineTo(110, 5); ctx.lineTo(70, 5); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}

export function isOnscreen(x, y, pad = 100) {
  return x > S.camera.x - pad && x < S.camera.x + SEE.width + pad && y > S.camera.y - pad && y < S.camera.y + SEE.height + pad;
}
