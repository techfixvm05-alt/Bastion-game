import { TOWERS, RELICS, HEROES } from './config.js';
import { evoHtml } from './systems/evolution.js';
import { S } from './state.js';
import { towerCost, blueprintCost, buyBlueprint, upgradeSelectedTower, setFireMode } from './systems/combat.js';
import { startWave } from './systems/waves.js';
import { objectiveStatus } from './systems/objectives.js';
import { getChallenge, getChapter, renderCampaignMenu } from './systems/campaign.js';
import { renderRelicCards } from './menu.js';
import { MAPS } from './maps.js';

let uiCallbacks = {};
const byId = id => document.getElementById(id);

function percent(value, max) { return `${Math.max(0, Math.min(100, value / max * 100))}%`; }

export function bindUI(callbacks = {}) {
  uiCallbacks = callbacks;
  const list = byId('tower-list');
  list.innerHTML = Object.entries(TOWERS).map(([id, tower]) => `<div class="tower-option" data-tower="${id}"><button class="tower-select" data-select-tower="${id}" type="button" aria-label="Elegir ${tower.name}"><span class="tower-icon" style="--tower-color:${tower.color}">${tower.icon}</span><span class="tower-name"><b>${tower.name}</b><small>${tower.role}</small></span><span class="tower-cost">${tower.cost} <small>◆</small></span></button><button class="blueprint-button" data-plan="${id}" type="button" title="Comprar plano por ${tower.planCost} de chatarra">⌑ PLANO · ${tower.planCost}</button></div>`).join('');
  list.addEventListener('click', event => {
    const planButton = event.target.closest('[data-plan]');
    if (planButton) {
      const result = buyBlueprint(planButton.dataset.plan);
      if (!result.ok) S.banner = result.message;
      callbacks.onBuild?.(result); renderUI(); return;
    }
    const button = event.target.closest('[data-select-tower]'); if (!button) return;
    const type = button.dataset.selectTower;
    if (!S.blueprints.has(type)) { S.buildType = null; S.selectedTower = null; S.banner = `COMPRÁ EL PLANO DE ${TOWERS[type].name.toUpperCase()} PARA CONSTRUIRLA`; renderUI(); return; }
    S.buildType = type; S.selectedTower = null; renderUI();
  });
  byId('wave-button').addEventListener('click', startWave);
  byId('mode-button').addEventListener('click', () => { setFireMode(); renderUI(); });
  byId('command-toggle').addEventListener('click', () => {
    const panel = byId('command-panel'), open = !panel.classList.contains('open');
    panel.classList.toggle('open', open); byId('command-toggle').setAttribute('aria-expanded', String(open));
  });
  byId('back-button').addEventListener('click', () => {
    S.phase = 'menu';
    byId('game-screen').hidden = true;
    byId('menu-screen').hidden = false;
    renderCampaignMenu();
    renderRelicCards();
    callbacks.onBack?.();
  });
  byId('next-chapter-button').addEventListener('click', () => {
    if (!S.won) return;
    const nextIndex = S.mapIndex + 1;
    renderCampaignMenu();
    const mapSelect = byId('map-select');
    const option = mapSelect?.querySelector(`option[value="${nextIndex}"]`);
    if (!option || option.disabled) return;
    mapSelect.value = String(nextIndex);
    byId('start-button').click();
  });
  byId('result-menu-button').addEventListener('click', () => {
    S.phase = 'menu';
    byId('game-screen').hidden = true;
    byId('menu-screen').hidden = false;
    renderCampaignMenu();
    renderRelicCards();
    callbacks.onBack?.();
  });
  byId('tower-info').addEventListener('click', event => {
    if (!event.target.closest('#upgrade-button')) return;
    const result = upgradeSelectedTower(); if (!result.ok) S.banner = result.message; renderUI();
  });
}

export function showGame() {
  byId('menu-screen').hidden = true; byId('result-screen').hidden = true; byId('game-screen').hidden = false;
  byId('hero2-hud').hidden = !S.coop; byId('coop-help').hidden = !S.coop;
  byId('command-panel').classList.remove('open'); byId('command-toggle').setAttribute('aria-expanded', 'false');
}

export function renderUI() {
  if (!S.hero || !S.map) return;
  byId('sector-label').textContent = S.map.name;
  byId('wave-label').textContent = S.modeId === 'daily' ? String(S.wave) : `${S.wave} / ${S.goalWave}`;
  byId('kills-label').textContent = String(S.kills).padStart(3, '0');
  byId('credits-label').textContent = String(Math.floor(S.credits));
  byId('challenge-label').textContent = S.coop ? 'CO-OP LOCAL' : getChallenge(S.challengeId)?.name || 'FRONTERA';
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
  const phenomenon = byId('phenomenon-card');
  if (S.environment.phase !== 'idle') {
    const cardCopy = S.environment.type === 'storm'
      ? 'Tormenta de iones: desvía proyectiles dentro del área azul.'
      : S.environment.type === 'fissure'
        ? 'Falla tectónica: cambia permanentemente una ruta; abrí paso antes del impacto.'
        : 'Nube tóxica: daña operadores y estructuras, pero cura y perjudica según reliquias.';
    phenomenon.hidden = false;
    phenomenon.innerHTML = `<b>${S.environment.label}</b><span>${cardCopy}</span><small>${S.environment.phase === 'warning' ? 'IMPACTO INMINENTE' : `${Math.ceil(S.environment.timer)} s`}</small>`;
  } else {
    phenomenon.hidden = true;
  }
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
  const ability = byId('ability-hud');
  if (ability && S.hero) {
    const heroCfg = HEROES[S.hero.type];
    const cd = Math.ceil(S.hero.abilityCooldown || 0);
    ability.innerHTML = `<b>${heroCfg.abilityKey} · ${heroCfg.ability}</b><span>${heroCfg.abilityDesc}</span><small>${cd ? `RECARGA ${cd}s` : 'LISTA'}</small>`;
  }
  byId('wave-button').disabled = S.waveActive;
  byId('wave-button').innerHTML = S.waveActive ? 'OLEADA EN CURSO <span>...</span>' : `${S.wave ? 'ACELERAR SIGUIENTE OLEADA' : 'INICIAR OLEADA'} <span>SPACE</span>`;
  document.querySelectorAll('.shop-btn').forEach(button => {
    button.disabled = S.waveActive;
    button.title = S.waveActive ? 'La tienda está bloqueada durante la oleada' : 'Abrir tienda (B)';
  });
  document.querySelectorAll('.tower-option').forEach(button => {
    const type = button.dataset.tower;
    button.title = `${TOWERS[type].name}: ${TOWERS[type].detail}`;
    button.classList.toggle('active', S.buildType === type);
    button.querySelector('.tower-cost').innerHTML = `${towerCost(type)} <small>◆</small>`;
    const plan = button.querySelector('.blueprint-button'), owned = S.blueprints.has(type), cost = blueprintCost(type);
    plan.classList.toggle('blueprint-owned', owned);
    plan.disabled = owned || S.credits < cost;
    plan.textContent = owned ? 'PLANO LISTO' : `⌑ PLANO · ${cost}`;
    plan.title = owned ? 'Plano comprado para esta partida' : `Comprar plano por ${cost} de chatarra`;
  });
  const selected = S.towers.find(t => t.id === S.selectedTower && !t.destroyed);
  const info = byId('tower-info');
  if (selected) {
    const spec = TOWERS[selected.type], nextCost = Math.round(spec.cost * (1.25 + selected.level * .85) * (S.relicMods.towerCost || 1));
    const powerInfo = selected.type === 'generator' ? `Producción: ${spec.output * (1 + (selected.level - 1) * .32) * (S.relicMods.generatorOutput || 1)} energía/s` : `Consumo: ${spec.energyUse} energía por acción`;
    info.innerHTML = `<span class="eyebrow">ESTRUCTURA · NIVEL ${selected.level}${selected.evo ? ' · ' + selected.evo.name.toUpperCase() : ''}</span><h3>${spec.name}</h3><p>${spec.detail}</p><div class="tower-health">Integridad <b>${Math.ceil(selected.hp)} / ${selected.maxHp}</b></div><small>${powerInfo}</small>${evoHtml(selected)}<button id="upgrade-button" ${selected.level >= (selected.evo ? 5 : 3) || S.credits < nextCost ? 'disabled' : ''}>${selected.level >= (selected.evo ? 5 : 3) ? 'NIVEL MÁXIMO' : `MEJORAR · ${nextCost} ◆`}</button>`;
  } else if (S.buildType) {
    const spec = TOWERS[S.buildType];
    info.innerHTML = `<span class="eyebrow">COLOCACIÓN · ${spec.role.toUpperCase()}</span><h3>${spec.name}</h3><p>${spec.detail}</p><div class="tower-health">Costo actual <b>${towerCost(S.buildType)} ◆</b></div><small>Click en una zona libre para construir · Esc cancela</small>`;
  } else {
    info.innerHTML = '<span class="eyebrow">SIN SELECCIÓN</span><p>Seleccioná una torreta para ver su función y costo.</p>';
  }
  const threat = Math.min(100, S.wave * 5.2 + S.towers.filter(t => !t.destroyed).length * 6.4);
  byId('threat-bar').style.width = `${threat}%`;
  byId('threat-value').textContent = threat < 25 ? 'BAJO' : threat < 55 ? 'ELEVADO' : threat < 82 ? 'SEVERO' : 'CRÍTICO';
  byId('tip-text').textContent = S.enemies.some(e => !e.dead && e.type === 'ranged') ? 'Aguijón: dispara desde lejos. Usá cobertura y priorizálo con daño rápido.'
    : S.enemies.some(e => !e.dead && e.type === 'gunner') ? 'Artillero: dispara ráfagas rápidas a torres y operadores. Atacalo antes de que te acorralen.'
    : S.enemies.some(e => !e.dead && e.type === 'healer') ? 'Nódulo: cura aliados cercanos. Priorizalo antes que cure al grupo.'
    : S.enemies.some(e => !e.dead && e.type === 'shield') ? 'Baluarte: resistente y lento. La perforación y el control lo neutralizan.'
    : S.energy < 8 && S.towers.some(t => !t.destroyed && t.type !== 'generator') ? 'Reserva crítica: colocá generadores o las torretas dejarán de disparar.'
    : S.routeMutationWave === S.wave && S.wave ? 'Las rutas nuevas siguen activas. Cubrí los flancos.'
    : S.towers.length > 4 ? 'Cada torre sube la presión de los refuerzos y los jefes.' : 'Los jefes registran cada estructura que construís.';
  const notice = byId('wave-notice');
  notice.hidden = !S.banner || S.bannerClock <= 0;
  if (!notice.hidden) notice.textContent = S.banner;
  if (S.phase === 'over') {
    byId('result-screen').hidden = false;
    byId('result-title').textContent = S.won ? 'CAPÍTULO COMPLETADO' : S.coreHp <= 0 ? 'NÚCLEO PERDIDO' : 'OPERADOR CAÍDO';
    byId('result-copy').textContent = S.won ? `${getChapter(S.mapIndex).victory} +${S.coinsEarned || 0} monedas.${S.relicGranted ? ' Reliquia recuperada: ' + RELICS[S.relicGranted].name + '.' : ''}` : `${S.banner || 'La defensa terminó.'} Llegaste a la oleada ${S.wave} de ${S.goalWave} y eliminaste ${S.kills} enemigos. +${S.coinsEarned || 0} monedas para mejorar reliquias.`;
    const nextButton = byId('next-chapter-button');
    const hasNext = S.won && S.mapIndex + 1 < MAPS.length;
    nextButton.hidden = !hasNext;
    byId('retry-button').textContent = S.won ? 'REPETIR CAPÍTULO ↻' : 'VOLVER A DESPLEGAR ↻';
  }
}
