import { VIEW, TOWERS } from '../config.js';
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
  const blocked = pointOnRoutes({ x, y }, S.map.routes, 104) || S.map.obstacles.some(([ox, oy, w, h]) => x > ox - 35 && x < ox + w + 35 && y > oy - 35 && y < oy + h + 35) || S.credits < towerCost(S.buildType);
  ctx.save(); ctx.globalAlpha = .38; ctx.beginPath(); ctx.arc(x, y, cfg.range, 0, Math.PI * 2); ctx.fillStyle = cfg.color; ctx.fill(); ctx.globalAlpha = .8; ctx.strokeStyle = blocked ? '#ff6b68' : cfg.color; ctx.lineWidth = 2; ctx.setLineDash([8, 7]); ctx.stroke(); ctx.setLineDash([]);
  ctx.globalAlpha = .72; ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fillStyle = blocked ? '#e56a66' : cfg.color; ctx.fill(); ctx.restore();
}

export function render(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  if (!S.map || !S.hero) { ctx.fillStyle = '#0b131b'; ctx.fillRect(0, 0, VIEW.width, VIEW.height); return; }
  ctx.save(); ctx.translate(-S.camera.x, -S.camera.y);
  drawTerrain(ctx);
  drawWorldHazards(ctx);
  drawObjectives(ctx);
  drawCore(ctx);
  for (const tower of S.towers) if (!tower.destroyed && isOnscreen(tower.x, tower.y, 100)) drawTower(ctx, tower);
  drawEffects(ctx);
  for (const enemy of S.enemies) if (isOnscreen(enemy.x, enemy.y, 140)) drawEnemy(ctx, enemy);
  drawShots(ctx);
  drawSupportDrones(ctx);
  drawHero(ctx, S.hero, 1);
  if (S.coop) drawHero(ctx, S.hero2, 2);
  drawPlacement(ctx);
  ctx.restore();
}
