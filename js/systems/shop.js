import { S } from '../state.js';

export const SHOP = [
  { id: 'towerDmg', name: 'Munición reforzada', desc: '+15% daño de torretas', base: 110, per: .15 },
  { id: 'towerRate', name: 'Servos acelerados', desc: '+12% cadencia de torretas', base: 120, per: .12 },
  { id: 'battery', name: 'Baterías ampliadas', desc: '+25% carga máxima por torre', base: 90, per: .25 },
  { id: 'gen', name: 'Núcleos de fusión', desc: '+20% generación de energía', base: 100, per: .2 },
  { id: 'heroDmg', name: 'Rifle de pulso', desc: '+15% daño del operador', base: 100, per: .15 },
  { id: 'heroSpeed', name: 'Propulsores', desc: '+8% velocidad del operador', base: 80, per: .08 }
];
const MAX = 6;
export const shopLevel = id => S.shopLevels?.[id] || 0;
export const shopMul = id => 1 + shopLevel(id) * (SHOP.find(i => i.id === id)?.per || 0);
export const shopCost = item => Math.round(item.base * Math.pow(1.5, shopLevel(item.id)));
export const repairCost = () => 150;

export function refreshShop() {
  const ids = SHOP.map(item => item.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  S.shopOfferIds = ids.slice(0, 4);
  S.shopRerolls = 0;
}

export function rerollShop() {
  if (S.waveActive || S.credits < 35) return false;
  S.credits -= 35;
  refreshShop();
  S.shopRerolls++;
  S.shopMessage = 'Ofertas cambiadas';
  return true;
}

export function buy(id) {
  if (S.waveActive) return false;
  if (id === 'repair') { if (S.credits < repairCost() || S.coreHp >= S.coreMax) return false; S.credits -= repairCost(); S.coreHp = Math.min(S.coreMax, S.coreHp + S.coreMax * .2); S.shopMessage = 'Núcleo reparado'; return true; }
  if (!S.shopOfferIds.includes(id)) return false;
  const item = SHOP.find(i => i.id === id); if (!item || shopLevel(id) >= MAX || S.credits < shopCost(item)) return false;
  S.credits -= shopCost(item); S.shopLevels[id] = shopLevel(id) + 1;
  if (id === 'heroDmg') {
    for (const hero of [S.hero, S.hero2]) if (hero) hero.damage = hero.damage * (1 + item.per);
  } else if (id === 'heroSpeed') {
    for (const hero of [S.hero, S.hero2]) if (hero) hero.speed = hero.speed * (1 + item.per);
  } else if (id === 'battery') {
    for (const tower of S.towers) if (!tower.destroyed && tower.type !== 'generator') {
      tower.maxCharge = 30 * shopMul('battery') * (1 + (tower.level - 1) * .25);
      tower.charge = Math.min(tower.maxCharge, (tower.charge || 0) + 30 * item.per);
    }
  }
  S.shopMessage = `${item.name} adquirido`;
  return true;
}

let panel;
export function renderShop() {
  if (!panel) return;
  panel.hidden = !S.shopOpen; if (!S.shopOpen) return;
  if (!S.shopOfferIds.length) refreshShop();
  const offers = S.shopOfferIds.map(id => SHOP.find(i => i.id === id)).filter(Boolean);
  panel.innerHTML = `<div class="shop-card"><button type="button" class="shop-close" data-close aria-label="Cerrar tienda">×</button><div class="shop-head"><div><span class="eyebrow">MERCADO NEGRO</span><h2>Mejoras de partida</h2></div><b>${Math.floor(S.credits)} chatarra</b></div>
    <div class="shop-list">${offers.map(i => { const l = shopLevel(i.id), c = shopCost(i); return `<button type="button" data-buy="${i.id}" ${l >= MAX || S.credits < c ? 'disabled' : ''}><b>${i.name} <small>NV ${l}/${MAX}</small></b><span>${i.desc}</span><em>${l >= MAX ? 'MÁXIMO' : c + ' ◆'}</em></button>`; }).join('')}
    <button type="button" data-buy="repair" ${S.credits < repairCost() || S.coreHp >= S.coreMax ? 'disabled' : ''}><b>Reparar núcleo</b><span>+20% de vida del núcleo</span><em>${repairCost()} ◆</em></button></div>
    <button type="button" class="shop-reroll" data-reroll ${S.credits < 35 ? 'disabled' : ''}>CAMBIAR OFERTAS · 35 ◆</button>
    ${S.shopMessage ? `<p class="shop-message">${S.shopMessage}</p>` : ''}
    <p class="shop-hint">B o Esc para cerrar · el inventario cambia al terminar cada oleada</p></div>`;
}
export function toggleShop(force) {
  if (S.phase !== 'playing' || S.waveActive) return;
  S.shopOpen = force ?? !S.shopOpen;
  if (S.shopOpen) S.shopMessage = '';
  renderShop();
}
export function bindShop() {
  const wrap = document.querySelector('.battle-wrap'), bar = document.querySelector('.game-topbar'); if (!wrap || !bar) return;
  panel = document.createElement('div'); panel.className = 'shop-overlay'; panel.hidden = true; wrap.appendChild(panel);
  panel.addEventListener('pointerdown', e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.closest('[data-close]')) { toggleShop(false); return; }
    const reroll = e.target.closest('[data-reroll]');
    if (reroll) { if (rerollShop()) renderShop(); return; }
    const b = e.target.closest('[data-buy]');
    if (b) { if (buy(b.dataset.buy)) renderShop(); return; }
    if (e.target === panel) toggleShop(false);
  });
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'command-toggle shop-btn'; btn.innerHTML = '<span>◆</span> TIENDA <kbd>B</kbd>'; btn.onclick = () => toggleShop(); bar.appendChild(btn);
}
