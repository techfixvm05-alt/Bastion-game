import { TOWERS } from './config.js';
import { S } from './state.js';
import { towerCost, upgradeSelectedTower, setFireMode } from './systems/combat.js';
import { startWave } from './systems/waves.js';
import { objectiveStatus } from './systems/objectives.js';
import { getChallenge } from './systems/campaign.js';

let uiCallbacks = {};
const byId = id => document.getElementById(id);

function percent(value, max) { return `${Math.max(0, Math.min(100, value / max * 100))}%`; }

export function bindUI(callbacks = {}) {
  uiCallbacks = callbacks;
  const list = byId('tower-list');
  list.innerHTML = Object.entries(TOWERS).map(([id, tower]) => `<button class="tower-option" data-tower="${id}" type="button"><span class="tower-icon" style="--tower-color:${tower.color}">${tower.icon}</span><span class="tower-name"><b>${tower.name}</b><small>${tower.role}</small></span><span class="tower-cost">${tower.cost} <small>◆</small></span></button>`).join('');
  list.addEventListener('click', event => {
    const button = event.target.closest('[data-tower]'); if (!button) return;
    S.buildType = button.dataset.tower; S.selectedTower = null; renderUI();
  });
  byId('wave-button').addEventListener('click', startWave);
  byId('mode-button').addEventListener('click', () => { setFireMode(); renderUI(); });
  byId('back-button').addEventListener('click', () => { S.phase = 'menu'; byId('game-screen').hidden = true; byId('menu-screen').hidden = false; callbacks.onBack?.(); });
  byId('tower-info').addEventListener('click', event => {
    if (!event.target.closest('#upgrade-button')) return;
    const result = upgradeSelectedTower(); if (!result.ok) S.banner = result.message; renderUI();
  });
}

export function showGame() {
  byId('menu-screen').hidden = true; byId('result-screen').hidden = true; byId('game-screen').hidden = false;
  byId('hero2-hud').hidden = !S.coop; byId('coop-help').hidden = !S.coop;
}

export function renderUI() {
  if (!S.hero || !S.map) return;
  byId('sector-label').textContent = S.map.name;
  byId('wave-label').textContent = String(S.wave).padStart(2, '0');
  byId('kills-label').textContent = String(S.kills).padStart(3, '0');
  byId('credits-label').textContent = String(Math.floor(S.credits));
  byId('challenge-label').textContent = getChallenge(S.challengeId)?.name || 'ESTÁNDAR';
  byId('core-bar').style.width = percent(S.coreHp, S.coreMax);
  byId('core-value').textContent = `${Math.max(0, Math.ceil(S.coreHp / S.coreMax * 100))}%`;
  byId('hero-bar').style.width = percent(S.hero.hp, S.hero.maxHp);
  byId('hero-value').textContent = `${Math.max(0, Math.ceil(S.hero.hp / S.hero.maxHp * 100))}%`;
  byId('hero2-hud').hidden = !S.coop;
  if (S.coop && S.hero2) {
    byId('hero2-bar').style.width = percent(S.hero2.hp, S.hero2.maxHp);
    byId('hero2-value').textContent = `${Math.max(0, Math.ceil(S.hero2.hp / S.hero2.maxHp * 100))}%`;
  }
  byId('energy-bar').style.width = percent(S.energy, S.maxEnergy);
  byId('energy-bar').classList.toggle('critical', S.energy < S.maxEnergy * .16);
  byId('energy-value').textContent = `${Math.floor(S.energy)} / ${Math.floor(S.maxEnergy)}`;
  byId('energy-rate').textContent = `${S.energyGeneration.toFixed(1)} energía / s · ${S.towers.filter(t => !t.destroyed && t.type === 'generator').length} generadores`;
  byId('weather-value').textContent = S.environment.label;
  const weatherCopy = S.environment.phase === 'active' && S.environment.type === 'storm' ? 'El viento desvía disparos dentro del frente azul.'
    : S.environment.phase === 'warning' ? 'La ruta marcada va a cambiar en segundos.'
    : S.environment.phase === 'active' && S.environment.type === 'toxic' ? 'Las nubes dañan operadores, torretas y enemigos.'
    : S.environment.phase === 'active' && S.environment.type === 'fissure' ? 'La nueva grieta dejó una ruta permanente.'
    : `Próximo evento en ${Math.ceil(S.environment.timer)} s.`;
  byId('weather-copy').textContent = weatherCopy;
  const objective = objectiveStatus();
  byId('objective-title').textContent = objective.title;
  byId('objective-copy').textContent = objective.detail;
  byId('objective-bar').style.width = `${Math.max(0, Math.min(100, objective.progress))}%`;
  byId('phase-chip').textContent = S.waveActive ? (S.enemies.some(e => e.boss) ? 'JEFE ACTIVO' : 'COMBATE') : S.wave ? `DESCANSO ${Math.ceil(S.restClock)}s` : 'PREPARACIÓN';
  const mode = S.fireMode === 'auto' ? 'DISPARO AUTOMÁTICO' : 'DISPARO MANUAL';
  byId('mode-label').textContent = mode;
  byId('mode-button').classList.toggle('manual', S.fireMode === 'manual');
  byId('wave-button').disabled = S.waveActive;
  byId('wave-button').innerHTML = S.waveActive ? 'OLEADA EN CURSO <span>...</span>' : `${S.wave ? 'ACELERAR SIGUIENTE OLEADA' : 'INICIAR OLEADA'} <span>SPACE</span>`;
  document.querySelectorAll('.tower-option').forEach(button => {
    const type = button.dataset.tower;
    button.classList.toggle('active', S.buildType === type);
    button.querySelector('.tower-cost').innerHTML = `${towerCost(type)} <small>◆</small>`;
  });
  const selected = S.towers.find(t => t.id === S.selectedTower && !t.destroyed);
  const info = byId('tower-info');
  if (selected) {
    const spec = TOWERS[selected.type], nextCost = Math.round(spec.cost * (1.25 + selected.level * .85) * (S.relicMods.towerCost || 1));
    const powerInfo = selected.type === 'generator' ? `Producción: ${spec.output * (1 + (selected.level - 1) * .32) * (S.relicMods.generatorOutput || 1)} energía/s` : `Consumo: ${spec.energyUse} energía por acción`;
    info.innerHTML = `<span class="eyebrow">ESTRUCTURA · NIVEL ${selected.level}</span><h3>${spec.name}</h3><p>${spec.detail}</p><div class="tower-health">Integridad <b>${Math.ceil(selected.hp)} / ${selected.maxHp}</b></div><small>${powerInfo}</small><button id="upgrade-button" ${selected.level >= 3 || S.credits < nextCost ? 'disabled' : ''}>${selected.level >= 3 ? 'NIVEL MÁXIMO' : `MEJORAR · ${nextCost} ◆`}</button>`;
  } else if (S.buildType) {
    const spec = TOWERS[S.buildType];
    info.innerHTML = `<span class="eyebrow">COLOCACIÓN · ${spec.role.toUpperCase()}</span><h3>${spec.name}</h3><p>${spec.detail}</p><div class="tower-health">Costo actual <b>${towerCost(S.buildType)} ◆</b></div><small>Click en una zona libre para construir · Esc cancela</small>`;
  } else {
    info.innerHTML = '<span class="eyebrow">SIN SELECCIÓN</span><p>Seleccioná una torreta para ver su función y costo.</p>';
  }
  const threat = Math.min(100, S.wave * 5.2 + S.towers.filter(t => !t.destroyed).length * 6.4);
  byId('threat-bar').style.width = `${threat}%`;
  byId('threat-value').textContent = threat < 25 ? 'BAJO' : threat < 55 ? 'ELEVADO' : threat < 82 ? 'SEVERO' : 'CRÍTICO';
  byId('tip-text').textContent = S.energy < 8 && S.towers.some(t => !t.destroyed && t.type !== 'generator') ? 'Reserva crítica: colocá generadores o las torretas dejarán de disparar.'
    : S.routeMutationWave === S.wave && S.wave ? 'Las rutas nuevas siguen activas. Cubrí los flancos.'
    : S.towers.length > 4 ? 'Cada torre sube la presión de los refuerzos y los jefes.' : 'Los jefes registran cada estructura que construís.';
  const notice = byId('wave-notice');
  notice.hidden = !S.banner || S.bannerClock <= 0;
  if (!notice.hidden) notice.textContent = S.banner;
  if (S.phase === 'over') {
    byId('result-screen').hidden = false;
    byId('result-title').textContent = S.coreHp <= 0 ? 'NÚCLEO PERDIDO' : 'OPERADOR CAÍDO';
    byId('result-copy').textContent = `${S.banner || 'La defensa terminó.'} Llegaste a la oleada ${S.wave} y eliminaste ${S.kills} enemigos. La frontera necesita otro intento.`;
  }
}
