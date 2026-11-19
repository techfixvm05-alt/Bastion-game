import { S } from '../state.js';

export function drawWorldHazards(ctx) {
  for (const zone of S.toxicZones) {
    const fade = Math.min(1, zone.life / 2.5);
    ctx.save(); ctx.globalAlpha = .23 * fade;
    const g = ctx.createRadialGradient(zone.x, zone.y, zone.radius * .18, zone.x, zone.y, zone.radius);
    g.addColorStop(0, '#7ee06d'); g.addColorStop(1, '#388f6380');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .65 * fade; ctx.strokeStyle = '#9ce87b'; ctx.lineWidth = 2; ctx.setLineDash([8, 9]); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + zone.life * .3; ctx.beginPath(); ctx.arc(zone.x + Math.cos(a) * zone.radius * .5, zone.y + Math.sin(a) * zone.radius * .5, 5, 0, Math.PI * 2); ctx.fillStyle = '#d1ff8a'; ctx.fill(); }
    ctx.restore();
  }
  for (const mark of S.fissureMarks) {
    ctx.save(); ctx.translate(mark.x, mark.y); ctx.rotate(mark.angle); ctx.globalAlpha = Math.min(1, mark.life / 1.3);
    ctx.beginPath(); ctx.moveTo(-100, 0); ctx.lineTo(-55, -15); ctx.lineTo(-25, 12); ctx.lineTo(8, -20); ctx.lineTo(42, 11); ctx.lineTo(100, -4);
    ctx.strokeStyle = '#ff9c62'; ctx.lineWidth = 5; ctx.shadowColor = '#ff653f'; ctx.shadowBlur = 15; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-80, 3); ctx.lineTo(-39, -8); ctx.lineTo(-12, 18); ctx.lineTo(22, -10); ctx.lineTo(64, 7); ctx.strokeStyle = '#2a1719'; ctx.lineWidth = 2; ctx.shadowBlur = 0; ctx.stroke(); ctx.restore();
  }
  const env = S.environment;
  if (env.type === 'storm' && env.phase === 'active') {
    ctx.save();
    const g = ctx.createRadialGradient(env.x, env.y, 20, env.x, env.y, env.radius);
    g.addColorStop(0, 'rgba(106,176,226,.10)'); g.addColorStop(.7, 'rgba(91,155,207,.09)'); g.addColorStop(1, 'rgba(59,107,166,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(env.x, env.y, env.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(154,202,236,.24)'; ctx.lineWidth = 3; ctx.setLineDash([18, 12]); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(188,224,255,.25)'; ctx.lineWidth = 2;
    for (let i = 0; i < 22; i++) { const x = env.x - 560 + ((i * 173 + env.timer * 110) % 1120), y = env.y - 440 + ((i * 97 + env.timer * 160) % 880); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(env.wind) * 34, y - Math.sin(env.wind) * 34); ctx.stroke(); }
    if (Math.floor(env.timer * 4) % 11 === 0) { ctx.beginPath(); ctx.moveTo(env.x + 180, env.y - 350); ctx.lineTo(env.x + 150, env.y - 250); ctx.lineTo(env.x + 205, env.y - 190); ctx.lineTo(env.x + 160, env.y - 95); ctx.strokeStyle = 'rgba(223,246,255,.8)'; ctx.lineWidth = 3; ctx.stroke(); }
    ctx.restore();
  }
  if (env.type === 'fissure' && env.phase === 'warning' && env.eventRoute) {
    const point = env.eventRoute.points[Math.floor(env.eventRoute.points.length / 2)];
    ctx.beginPath(); ctx.arc(point.x, point.y, 145 + Math.sin(env.timer * 20) * 8, 0, Math.PI * 2); ctx.strokeStyle = '#ffb16e'; ctx.lineWidth = 5; ctx.setLineDash([12, 8]); ctx.stroke(); ctx.setLineDash([]);
  }
}
