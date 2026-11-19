import { VIEW, TOWERS, ZOOM, CORE, BOSSES } from '../config.js';
import { drawDrops, DROPS } from '../systems/drops.js';
import { S } from '../state.js';
import { drawTerrain, isOnscreen } from './terrain.js';
import { drawEnemy, drawTower, drawHero, drawCore } from './textures.js';
import { pointOnRoutes, dist } from '../utils.js';
import { towerCost } from '../systems/combat.js';
import { drawWorldHazards } from './worldHazards.js';
import { drawObjectives } from './objectives.js';

function drawEffects(ctx) {
  for (const e of S.effects) {
    const t = Math.max(0, Math.min(1, e.age / (e.life || 1)));
    ctx.save(); ctx.globalAlpha = 1 - t;
    if (e.type === 'warning') {
      const pulse = .9 + Math.sin(e.age * 18) * .1;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.radius * pulse, 0, Math.PI * 2); ctx.fillStyle = `${e.color}16`; ctx.fill();
      ctx.strokeStyle = e.color; ctx.lineWidth = 4; ctx.setLineDash([12, 8]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(e.x, e.y, 13 + Math.sin(e.age * 18) * 3, 0, Math.PI * 2); ctx.strokeStyle = '#fff1cb'; ctx.lineWidth = 2; ctx.stroke();
    } else if (e.type === 'impact') {
      ctx.beginPath(); ctx.arc(e.x, e.y, e.radius * (1 - e.delay / e.life), 0, Math.PI * 2); ctx.fillStyle = `${e.color}12`; ctx.fill();
    } else if (e.type === 'shockwave' || e.type === 'pulse' || e.type === 'blast' || e.type === 'burst' || e.type === 'route-birth') {
      const radius = e.type === 'route-birth' ? 85 + t * 110 : e.radius * (e.type === 'shockwave' ? .28 + t * 1.2 : .25 + t * .75);
      ctx.beginPath(); ctx.arc(e.x ?? e.route?.points?.[0]?.x ?? 0, e.y ?? e.route?.points?.[0]?.y ?? 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = e.color; ctx.lineWidth = e.type === 'pulse' ? 7 : 4; ctx.stroke();
      if (e.type === 'blast' || e.type === 'burst') { ctx.fillStyle = `${e.color}35`; ctx.fill(); }
      if (e.type === 'route-birth') {
        ctx.globalAlpha = 1 - t; ctx.beginPath();e.route.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=e.color;ctx.lineWidth=7;ctx.setLineDash([14,10]);ctx.stroke();ctx.setLineDash([]);
      }
    } else if (e.type === 'beam') {
      ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.tx, e.ty); ctx.strokeStyle = e.color; ctx.lineWidth = 4; ctx.stroke();
    } else if (e.type === 'flame') {
      ctx.translate(e.x, e.y); ctx.rotate(e.angle);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, e.radius, -.4, .4); ctx.closePath(); ctx.fillStyle = `${e.color}55`; ctx.fill();
      ctx.strokeStyle = e.color; ctx.lineWidth = 2; ctx.stroke();
    } else if (e.type === 'jam') {
      ctx.beginPath(); ctx.arc(e.x, e.y, e.radius * (.7 + t * .4), 0, Math.PI * 2); ctx.strokeStyle = e.color; ctx.lineWidth = 2; ctx.setLineDash([4, 5]); ctx.stroke(); ctx.setLineDash([]);
    } else if (e.type === 'heal') {
      ctx.beginPath(); ctx.moveTo(e.x, e.y - 15); ctx.lineTo(e.x, e.y + 15); ctx.moveTo(e.x - 15, e.y); ctx.lineTo(e.x + 15, e.y); ctx.strokeStyle = e.color; ctx.lineWidth = 4; ctx.stroke();
    }
    ctx.restore();
  }
}

function drawShots(ctx) {
  for (const s of S.shots) {
    ctx.save();
    if (s.arc) {
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 25); g.addColorStop(0, `${s.color}99`); g.addColorStop(1, `${s.color}00`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, 25, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(s.x, s.y, 7, 0, Math.PI * 2); ctx.fillStyle = '#ffe0a8'; ctx.fill();
    } else {
      const a = Math.atan2(s.vy, s.vx); ctx.translate(s.x, s.y); ctx.rotate(a);
      ctx.strokeStyle = s.color; ctx.lineWidth = s.radius * 1.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(2, 0); ctx.stroke();
      ctx.fillStyle = '#f9edc8'; ctx.beginPath(); ctx.arc(3, 0, s.radius * .7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  for (const s of S.enemyShots) { ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.fill(); ctx.strokeStyle = '#f3cbf3'; ctx.lineWidth = 2; ctx.stroke(); }
}

function drawSupportDrones(ctx) {
  for (const drone of S.supportDrones) {
    ctx.save(); ctx.translate(drone.x, drone.y); ctx.rotate(drone.angle * 2);
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fillStyle = '#1a3431'; ctx.fill(); ctx.strokeStyle = '#a4f2d3'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-8, 0); ctx.moveTo(8, 0); ctx.lineTo(18, 0); ctx.moveTo(0, -18); ctx.lineTo(0, -8); ctx.moveTo(0, 8); ctx.lineTo(0, 18); ctx.strokeStyle = '#72caaa'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fillStyle = '#e4fff2'; ctx.fill(); ctx.restore();
  }
}

function drawPlacement(ctx) {
  if (!S.buildType) return;
  const x = S.pointer.x + S.camera.x, y = S.pointer.y + S.camera.y, cfg = TOWERS[S.buildType];
  const onRoute = pointOnRoutes({ x, y }, S.map.routes, 120);
  const blocked = S.buildType === 'shieldwall'
    ? !onRoute || S.map.obstacles.some(([ox, oy, w, h]) => x > ox - 35 && x < ox + w + 35 && y > oy - 35 && y < oy + h + 35) || S.credits < towerCost(S.buildType)
    : pointOnRoutes({ x, y }, S.map.routes, 104) || S.map.obstacles.some(([ox, oy, w, h]) => x > ox - 35 && x < ox + w + 35 && y > oy - 35 && y < oy + h + 35) || S.credits < towerCost(S.buildType);
  ctx.save(); ctx.globalAlpha = .38; ctx.beginPath(); ctx.arc(x, y, cfg.range, 0, Math.PI * 2); ctx.fillStyle = cfg.color; ctx.fill(); ctx.globalAlpha = .8; ctx.strokeStyle = blocked ? '#ff6b68' : cfg.color; ctx.lineWidth = 2; ctx.setLineDash([8, 7]); ctx.stroke(); ctx.setLineDash([]);
  ctx.globalAlpha = .72; ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fillStyle = blocked ? '#e56a66' : cfg.color; ctx.fill(); ctx.restore();
}

function safe(ctx, fn) { try { ctx.save(); fn(); } catch (error) { if (!safe.reported) { safe.reported = true; console.error('Bastión render:', error); } } finally { ctx.restore(); } }

let dark = null;
function drawDarkness(ctx) {
  if (!dark) { dark = document.createElement('canvas'); dark.width = VIEW.width; dark.height = VIEW.height; }
  const g = dark.getContext('2d'); if (!g) return;
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, VIEW.width, VIEW.height);
  const night = .5 + .5 * Math.sin(S.lastTime / 1000 / 38);
  g.fillStyle = `rgba(3,6,16,${(.5 + .2 * night + Math.min(.1, S.wave * .006)).toFixed(3)})`; g.fillRect(0, 0, VIEW.width, VIEW.height);
  g.globalCompositeOperation = 'destination-out';
  const light = (x, y, r, k = 1) => {
    const sx = (x - S.camera.x) * ZOOM, sy = (y - S.camera.y) * ZOOM, rr = r * ZOOM;
    if (sx < -rr || sy < -rr || sx > VIEW.width + rr || sy > VIEW.height + rr) return;
    const gr = g.createRadialGradient(sx, sy, rr * .12, sx, sy, rr); gr.addColorStop(0, `rgba(0,0,0,${k})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(sx - rr, sy - rr, rr * 2, rr * 2);
  };
  light(CORE.x, CORE.y, 430);
  for (const h of [S.hero, S.coop ? S.hero2 : null]) if (h && h.hp > 0) light(h.x, h.y, 320);
  for (const t of S.towers) if (!t.destroyed) light(t.x, t.y, t.type === 'generator' ? 230 : t.charge > 0 ? 190 : 60, t.type !== 'generator' && t.charge <= 0 ? .5 : 1);
  for (const d of S.drops) light(d.x, d.y, 130);
  for (const s of S.shots) light(s.x, s.y, 90, .8);
  for (const e of S.effects) if (e.x != null && (e.type === 'burst' || e.type === 'blast' || e.type === 'flame')) light(e.x, e.y, 120, .8);
  ctx.drawImage(dark, 0, 0);
}

function drawOverlay(ctx) {
  ctx.save(); ctx.textAlign = 'center';
  if (S.bossIncoming && S.bossIncomingClock > 0) {
    const sx = (S.bossIncoming.x - S.camera.x) * ZOOM;
    const sy = (S.bossIncoming.y - S.camera.y) * ZOOM;
    const x = Math.max(32, Math.min(VIEW.width - 32, sx));
    const y = Math.max(70, Math.min(VIEW.height - 32, sy));
    ctx.fillStyle = 'rgba(8,12,18,.92)';
    ctx.strokeStyle = '#d58c72';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f0b394';
    ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x - 7, y + 7); ctx.lineTo(x + 7, y + 7); ctx.closePath(); ctx.fill();
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`JEFE · ${BOSSES[S.bossIncoming.kind]?.name || 'INCOMING'}`, x, y - 30);
  }
  for (const t of S.towers) {
    if (t.destroyed || t.type === 'generator' || t.maxCharge == null) continue;
    const sx = (t.x - S.camera.x) * ZOOM, sy = (t.y - S.camera.y) * ZOOM; if (sx < -40 || sy < -40 || sx > VIEW.width + 40 || sy > VIEW.height + 40) continue;
    const p = Math.max(0, Math.min(1, t.charge / t.maxCharge)), w = 34, y = sy - 34 * ZOOM * 1.4 - 6;
    ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(sx - w / 2 - 1, y - 1, w + 2, 7);
    ctx.fillStyle = t.recharging > 0 ? '#9dffd8' : p > .5 ? '#ffe066' : p > .2 ? '#ff9a3d' : '#ff4b4b'; ctx.fillRect(sx - w / 2, y, w * p, 5);
    if (p <= .02 && Math.floor(S.lastTime / 300) % 2) { ctx.fillStyle = '#ff6b68'; ctx.font = 'bold 11px monospace'; ctx.fillText('SIN ENERGÍA · R', sx, y - 5); }
  }
  let y = 78; ctx.font = 'bold 13px monospace';
  if (S.combo.n >= 3) { ctx.fillStyle = '#ffe066'; ctx.fillText(`COMBO ×${S.combo.n} · +${Math.round((Math.min(1, Math.floor(S.combo.n / 5) * .1)) * 100)}% CHATARRA`, VIEW.width / 2, y); ctx.fillStyle = 'rgba(255,224,102,.35)'; ctx.fillRect(VIEW.width / 2 - 70, y + 5, 140 * Math.max(0, S.combo.t / 3.5), 3); y += 24; }
  for (const [k, label, color] of [['haste', 'SOBRECARGA', DROPS.haste.color], ['power', 'FURIA', DROPS.power.color]]) if (S.buffs[k] > 0) { ctx.fillStyle = color; ctx.fillText(`${label} ${S.buffs[k].toFixed(0)}s`, VIEW.width / 2, y); y += 20; }
  ctx.restore();
}

export function render(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  if (!S.map || !S.hero) { ctx.fillStyle = '#0b131b'; ctx.fillRect(0, 0, VIEW.width, VIEW.height); return; }
  ctx.save(); ctx.scale(ZOOM, ZOOM); ctx.translate(-S.camera.x, -S.camera.y);
  safe(ctx, () => drawTerrain(ctx));
  safe(ctx, () => drawWorldHazards(ctx));
  safe(ctx, () => drawObjectives(ctx));
  safe(ctx, () => drawCore(ctx));
  for (const tower of S.towers) if (!tower.destroyed && isOnscreen(tower.x, tower.y, 100)) safe(ctx, () => drawTower(ctx, tower));
  safe(ctx, () => drawDrops(ctx));
  safe(ctx, () => drawEffects(ctx));
  for (const enemy of S.enemies) if (isOnscreen(enemy.x, enemy.y, 140)) safe(ctx, () => drawEnemy(ctx, enemy));
  safe(ctx, () => drawShots(ctx));
  safe(ctx, () => drawSupportDrones(ctx));
  safe(ctx, () => drawHero(ctx, S.hero, 1));
  if (S.coop) safe(ctx, () => drawHero(ctx, S.hero2, 2));
  safe(ctx, () => drawPlacement(ctx));
  ctx.restore();
  safe(ctx, () => drawDarkness(ctx));
  safe(ctx, () => drawOverlay(ctx));
}
