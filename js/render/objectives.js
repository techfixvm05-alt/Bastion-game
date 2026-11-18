import { S } from '../state.js';
import { CORE } from '../config.js';

function marker(ctx, x, y, color, label, completed = false) {
  ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.arc(0, 0, 47 + Math.sin(performance.now() / 360) * 4, 0, Math.PI * 2);
  ctx.fillStyle = `${color}18`; ctx.fill(); ctx.strokeStyle = completed ? '#83e2bf' : color; ctx.lineWidth = 3; ctx.setLineDash([6, 7]); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = '#101c20'; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = color; ctx.font = 'bold 17px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(completed ? '✓' : '+', 0, 1);
  ctx.fillStyle = '#e2e9dc'; ctx.font = '700 11px monospace'; ctx.textBaseline = 'alphabetic'; ctx.fillText(label.toUpperCase(), 0, -59); ctx.restore();
}

function drawRelay(ctx, site) {
  const ratio = Math.max(0, site.hp / site.maxHp); ctx.save(); ctx.translate(site.x, site.y);
  ctx.beginPath(); ctx.arc(0, 0, site.radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(100,223,185,.045)'; ctx.fill(); ctx.strokeStyle = '#83dcb9'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(0, 0, 43, 0, Math.PI * 2); ctx.fillStyle = '#172729'; ctx.fill(); ctx.strokeStyle = '#83e2bf'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(24, -12); ctx.lineTo(20, 23); ctx.lineTo(0, 33); ctx.lineTo(-20, 23); ctx.lineTo(-24, -12); ctx.closePath(); ctx.fillStyle = '#405d59'; ctx.fill(); ctx.strokeStyle = '#b8f3d4'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#111a1d'; ctx.fillRect(-45, 54, 90, 7); ctx.fillStyle = ratio > .35 ? '#83e2bf' : '#f27965'; ctx.fillRect(-45, 54, 90 * ratio, 7);
  ctx.fillStyle = '#e4ebdf'; ctx.font = '700 10px monospace'; ctx.textAlign = 'center'; ctx.fillText(site.name.toUpperCase(), 0, -57); ctx.restore();
}

export function drawObjectives(ctx) {
  const o = S.objective; if (!o) return;
  if (o.kind === 'evacuate') {
    ctx.save(); ctx.translate(o.x, o.y); ctx.fillStyle = '#18272d'; ctx.fillRect(-42, -30, 84, 60); ctx.strokeStyle = '#eac27b'; ctx.lineWidth = 3; ctx.strokeRect(-42, -30, 84, 60);
    ctx.fillStyle = '#eac27b'; ctx.fillRect(-25, -15, 50, 5); ctx.fillRect(-25, 0, 34, 5); ctx.fillStyle = '#77d9b4'; ctx.fillRect(17, 8, 8, 20);
    ctx.restore(); marker(ctx, o.x, o.y, '#eac27b', 'EVAC · E', o.complete);
  } else if (o.kind === 'relays') {
    for (const site of o.sites) drawRelay(ctx, site);
  } else if (o.kind === 'stabilize') {
    o.sites.forEach((site, i) => marker(ctx, site.x, site.y, i < o.current ? '#83e2bf' : '#72cce0', i < o.current ? `BALIZA ${i + 1} ✓` : `BALIZA ${i + 1}`, i < o.current));
  }
}
