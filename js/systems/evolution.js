import { S } from '../state.js';
import { TOWERS } from '../config.js';

export const EVOS = {
  ballista: [{ id: 'rail', name: 'Cañón de riel', text: 'Daño ×1.7, alcance +25%, cadencia menor', dmg: 1.7, rate: .8, range: 1.25, color: '#ffd27a' }, { id: 'repeater', name: 'Repetidora', text: 'Cadencia ×1.9, daño menor', dmg: .75, rate: 1.9, range: 1, color: '#ffb347' }],
  mortar: [{ id: 'siege', name: 'Obús de asedio', text: 'Daño ×1.8, alcance +30%', dmg: 1.8, rate: .75, range: 1.3, color: '#ff9a6a' }, { id: 'cluster', name: 'Racimo', text: 'Cadencia ×1.5, alcance +5%', dmg: 1, rate: 1.5, range: 1.05, color: '#ff7f50' }],
  cryo: [{ id: 'absolute', name: 'Cero absoluto', text: 'Daño ×1.8, alcance +20%', dmg: 1.8, rate: 1, range: 1.2, color: '#9be8ff' }, { id: 'efficient', name: 'Criogenia eficiente', text: 'Batería ×2.2 y cadencia ×1.3', dmg: 1, rate: 1.3, range: 1, charge: 2.2, color: '#6fd0e6' }],
  totem: [{ id: 'major', name: 'Pulso mayor', text: 'Daño ×2, alcance +30%', dmg: 2, rate: 1, range: 1.3, color: '#c7a8ff' }, { id: 'medic', name: 'Reparador', text: 'Vida ×1.6, alcance +15%, se autorrecarga', dmg: 1.2, rate: 1, range: 1.15, hp: 1.6, regen: 1.2, color: '#a6f0c0' }],
  inferno: [{ id: 'dragon', name: 'Aliento de dragón', text: 'Daño ×1.8, alcance +25%', dmg: 1.8, rate: 1, range: 1.25, color: '#ff8a5c' }, { id: 'plasma', name: 'Plasma', text: 'Cadencia ×1.5, daño ×1.2', dmg: 1.2, rate: 1.5, range: 1, color: '#ff5fd2' }],
  generator: [{ id: 'fusion', name: 'Reactor de fusión', text: 'Producción ×1.8', gen: 1.8, store: 1, hp: 1.3, color: '#8bffc0' }, { id: 'bank', name: 'Banco de energía', text: 'Reserva ×2.2, producción ×1.25', gen: 1.25, store: 2.2, hp: 1.3, color: '#ffe066' }]
};
export const evoCost = type => Math.round(TOWERS[type].cost * 2.6 * (S.relicMods.towerCost || 1));

export function evoHtml(t) {
  if (t.level < 3 || t.evo) return t.evo ? `<div class="evo-box"><span class="eyebrow">EVOLUCIÓN · ${t.evo.name.toUpperCase()}</span><small>${t.evo.text}</small></div>` : '';
  const c = evoCost(t.type);
  return `<div class="evo-box"><span class="eyebrow">EVOLUCIÓN DISPONIBLE · ${c} ◆</span>${EVOS[t.type].map(e => `<button type="button" data-evo="${e.id}" ${S.credits < c ? 'disabled' : ''}><b>${e.name}</b><small>${e.text}</small></button>`).join('')}</div>`;
}
export function evolve(id) {
  const t = S.towers.find(x => x.id === S.selectedTower && !x.destroyed); if (!t || t.level < 3 || t.evo) return false;
  const e = EVOS[t.type]?.find(x => x.id === id), c = evoCost(t.type); if (!e || S.credits < c) return false;
  S.credits -= c; t.evo = { ...e }; t.maxHp = Math.round(t.maxHp * (e.hp || 1.3)); t.hp = t.maxHp;
  S.banner = `${e.name} · EVOLUCIÓN`; S.bannerClock = 2.5; S.effects.push({ type: 'pulse', x: t.x, y: t.y, age: 0, life: .7, color: e.color, radius: 130 });
  return true;
}
export function bindEvolution() { document.getElementById('tower-info')?.addEventListener('click', ev => { const b = ev.target.closest('[data-evo]'); if (b) evolve(b.dataset.evo); }); }
