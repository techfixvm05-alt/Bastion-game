import { S } from '../state.js';
import { dist } from '../utils.js';
import { shopMul } from './shop.js';

export const DROPS = {
  haste: { name: 'SOBRECARGA', color: '#5ee7ff', icon: '⚡', text: 'Torretas +60% cadencia' },
  power: { name: 'FURIA', color: '#ff6b5a', icon: '✦', text: '+40% daño' },
  battery: { name: 'BATERÍA', color: '#ffe066', icon: '▮', text: 'Torretas recargadas' },
  repair: { name: 'NANOBOTS', color: '#7dffb0', icon: '+', text: 'Núcleo +10%' },
  scrap: { name: 'CHATARRA', color: '#e8bc78', icon: '◆', text: '+chatarra' }
};
const COMBO_STEP = 5;
export const comboBonus = () => Math.min(1, Math.floor((S.combo?.n || 0) / COMBO_STEP) * .1);

export function spawnDrop(x, y, type) {
  const keys = Object.keys(DROPS);
  S.drops.push({ x, y, type: type || keys[Math.floor(Math.random() * keys.length)], life: 16, age: 0 });
}
export function onKill(enemy) {
  S.combo.n++; S.combo.t = 3.5;
  const chance = enemy.boss ? 1 : enemy.reward >= 24 ? .15 : .06;
  if (Math.random() < chance) spawnDrop(enemy.x, enemy.y);
  if (enemy.boss) { spawnDrop(enemy.x + 30, enemy.y, 'battery'); spawnDrop(enemy.x - 30, enemy.y, 'scrap'); }
  if (S.combo.n % 25 === 0) spawnDrop(enemy.x, enemy.y, 'power');
}
function collect(drop) {
  const b = S.buffs;
  if (drop.type === 'haste') b.haste = 12;
  else if (drop.type === 'power') b.power = 12;
  else if (drop.type === 'battery') { for (const t of S.towers) if (!t.destroyed && t.maxCharge) t.charge = t.maxCharge; S.energy = Math.min(S.maxEnergy, S.energy + 30); }
  else if (drop.type === 'repair') S.coreHp = Math.min(S.coreMax, S.coreHp + S.coreMax * .1);
  else S.credits += 60 + S.wave * 6;
  S.banner = `${DROPS[drop.type].name} · ${DROPS[drop.type].text}`; S.bannerClock = 2;
}
export function updateDrops(dt) {
  for (const k of ['haste', 'power']) S.buffs[k] = Math.max(0, S.buffs[k] - dt);
  S.combo.t -= dt; if (S.combo.t <= 0) S.combo.n = 0;
  for (const h of [S.hero, S.coop ? S.hero2 : null]) if (h && h.hp > 0) {
    h.baseDamage ??= h.damage; h.baseSpeed ??= h.speed;
    h.damage = h.baseDamage * shopMul('heroDmg') * (S.buffs.power > 0 ? 1.4 : 1); h.speed = h.baseSpeed * shopMul('heroSpeed');
  }
  for (const d of S.drops) {
    d.age += dt; d.life -= dt;
    for (const h of [S.hero, S.coop ? S.hero2 : null]) if (h && h.hp > 0 && !d.taken && dist(h, d) < 60) { d.taken = true; collect(d); }
  }
  S.drops = S.drops.filter(d => d.life > 0 && !d.taken);
}
export function drawDrops(ctx) {
  for (const d of S.drops) {
    const c = DROPS[d.type], y = d.y + Math.sin(d.age * 4) * 4, fade = Math.min(1, d.life / 3);
    ctx.save(); ctx.globalAlpha = fade;
    const g = ctx.createRadialGradient(d.x, y, 0, d.x, y, 46); g.addColorStop(0, c.color + 'aa'); g.addColorStop(1, c.color + '00'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, y, 46, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(d.x, y, 16, 0, Math.PI * 2); ctx.fillStyle = '#0c1519'; ctx.fill(); ctx.strokeStyle = c.color; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = c.color; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c.icon, d.x, y + 1); ctx.restore();
  }
}
