import { HEROES, RELICS } from './config.js';
import { LORE, RELIC_LORE } from './lore.js';
import { getChapter } from './systems/campaign.js';
import { readCampaignProgress as _rp, getRelicLevel, relicUpgradeCost, upgradeRelic, MAX_RELIC_LEVEL } from './systems/campaign.js';
import { MAPS } from './maps.js';
import { exportRecordsText, importRecordsText, renderRecords } from './systems/records.js';
import { decodeMapCode, encodeMapCode, getDailyChallenge, isRelicUnlocked, readCampaignProgress, renderCampaignMenu } from './systems/campaign.js';
import { heroPortrait, operatorGlyph, relicGlyph } from './visuals.js';
import { cue, isSoundEnabled, setSoundEnabled } from './audio.js';

let selectedMode = 'solo';
const relicColors = { none: '#99aaa0', stormglass: '#8ce3d0', salvager: '#e8bc78', capacitor: '#89d5ef', bulwark: '#d9aa83', ricochet: '#e9d777', dronecore: '#a4e1b4', plasma: '#ce9af0', symbiosis: '#a6d18c' };
const byId = id => document.getElementById(id);

function updateHero(type) {
  const hero = HEROES[type] || HEROES.vanguard;
  byId('hero-select').value = type;
  document.querySelectorAll('.hero-option').forEach(card => {
    const active = card.dataset.hero === type;
    card.classList.toggle('selected', active);
    card.setAttribute('aria-pressed', String(active));
  });
  byId('hero-portrait').innerHTML = heroPortrait(type, hero.color);
  byId('hero-name').textContent = hero.name;
  byId('hero-passive').textContent = hero.passive;
  const lore = LORE[type]; byId('hero-lore').innerHTML = lore ? `<b>${lore.role} · ${lore.real}</b><br>${lore.text}` : '';
  byId('hero-hp-stat').textContent = hero.hp;
  byId('hero-speed-stat').textContent = hero.speed;
  byId('hero-range-stat').textContent = hero.range;
  const fill = (id, value, max) => byId(id).parentElement.querySelector('em').style.width = `${Math.max(12, Math.min(100, value / max * 100))}%`;
  fill('hero-hp-stat', hero.hp, 210); fill('hero-speed-stat', hero.speed, 340); fill('hero-range-stat', hero.range, 600);
  renderRecords();
}

function renderHeroes() {
  const colors = { vanguard: '#83e2bf', ranger: '#e4ce76', engineer: '#7dc6eb', sentinel: '#e58bd0' };
  byId('hero-select').innerHTML = Object.entries(HEROES).map(([id, hero]) => `<option value="${id}">${hero.name}</option>`).join('');
  byId('hero-options').innerHTML = Object.entries(HEROES).map(([id, hero]) => `
    <button class="hero-option" type="button" data-hero="${id}" style="--hero-color:${colors[id]}" aria-pressed="false">
      ${operatorGlyph(id)}<span><b>${hero.name}</b><small>${hero.passive}</small></span><em>${id === 'vanguard' ? 'B-01' : id === 'ranger' ? 'R-02' : 'E-03'}</em>
    </button>`).join('');
  updateHero(byId('hero-select').value || 'vanguard');
}

function updateSector(mapIndex) {
  const map = MAPS[mapIndex] || MAPS[0];
  byId('map-select').value = String(mapIndex);
  { const ch = getChapter(mapIndex), box = byId('story-chapter'); if (box) box.innerHTML = `<b>${ch.act}</b> · ${ch.title}<br>${ch.text}`; }
  document.querySelectorAll('.sector-card').forEach(card => {
    const active = Number(card.dataset.map) === mapIndex;
    card.classList.toggle('selected', active);
    card.setAttribute('aria-pressed', String(active));
  });
  byId('sector-biome').textContent = map.biome;
  const stage = document.querySelector('.operator-stage');
  stage.style.setProperty('--sector-accent', map.colors.accent);
  renderCampaignMenu(); renderRecords();
}

export function renderRelicCards() {
  const holder = byId('relic-options');
  if (!holder) return;
  const relicSelect = byId('relic-select'), previous = relicSelect.value || 'none';
  relicSelect.innerHTML = '<option value="none">Sin reliquia</option>' + Object.entries(RELICS).map(([id, relic]) => `<option value="${id}">${relic.name}</option>`).join('');
  relicSelect.value = previous === 'none' || Object.hasOwn(RELICS, previous) ? previous : 'none';
  const progress = readCampaignProgress();
  const chosen = relicSelect.value || 'none';
  const unlocked = Object.keys(RELICS).filter(id => isRelicUnlocked(id)).length;
  byId('relic-progress').textContent = `${String(unlocked).padStart(2, '0')} / ${Object.keys(RELICS).length} RECUPERADAS`;
  const summary = byId('unlock-summary');
  if (summary) summary.textContent = `SECTORES ${progress.unlocked.length}/${MAPS.length} · RELIQUIAS ${unlocked}/${Object.keys(RELICS).length}`;
  const choices = [['none', { name: 'Sin reliquia', icon: 'none', description: 'Sin modificadores. Las reliquias se desbloquean al superar objetivos jugando.', unlock: '' }], ...Object.entries(RELICS)];
  holder.innerHTML = choices.map(([id, relic]) => {
    const earned = id === 'none' || isRelicUnlocked(id), active = earned && id === chosen;
    return `<button class="relic-card ${active ? 'selected' : ''}" type="button" data-relic="${id}" style="--relic-color:${relicColors[id]}" ${earned ? '' : 'disabled'} aria-pressed="${active}" title="${earned ? relic.description : relic.unlock}">
      ${relicGlyph(relic.icon)}<b>${relic.name}</b><small>${earned ? relic.description : relic.unlock}</small>${earned || id === 'none' ? '' : `<span class="relic-lock">⌑ POR GANAR</span>`}
    </button>`;
  }).join('');
  const selected = RELICS[chosen] || { name: 'Sin reliquia', description: 'Sin modificadores. Ganá reliquias al superar desafíos en el campo.' };
  const lvl = getRelicLevel(chosen);
  byId('relic-description').textContent = `${selected.name}${chosen !== 'none' ? ` · NV ${lvl}/${MAX_RELIC_LEVEL}` : ''} · ${selected.description}${RELIC_LORE[chosen] ? ` — ${RELIC_LORE[chosen].origin}${lvl >= 3 ? ' ' + RELIC_LORE[chosen].secret : ' (Nv 3 revela su secreto)'}` : ''}`;
  const up = byId('relic-upgrade');
  if (up) {
    const cost = relicUpgradeCost(lvl), can = chosen !== 'none' && isRelicUnlocked(chosen) && lvl < MAX_RELIC_LEVEL;
    up.innerHTML = `<span>MONEDAS: <b>${progress.coins} ◈</b></span>` + (can ? `<button type="button" class="utility-button" id="relic-upgrade-btn" ${progress.coins < cost ? 'disabled' : ''}>MEJORAR · ${cost} ◈</button>` : (chosen !== 'none' && lvl >= MAX_RELIC_LEVEL ? '<span>NIVEL MÁXIMO</span>' : ''));
    const btn = byId('relic-upgrade-btn'); if (btn) btn.onclick = () => { if (upgradeRelic(chosen)) { cue('select'); renderRelicCards(); } };
  }
  byId('starting-credits').textContent = String(Math.round(180 * (selected.mods?.startingCredits || 1)));
}

function setMode(mode) {
  selectedMode = ['solo', 'coop', 'daily'].includes(mode) ? mode : 'solo';
  document.querySelectorAll('.mode-card').forEach(card => {
    const active = card.dataset.mode === selectedMode;
    card.classList.toggle('selected', active);
    card.setAttribute('aria-pressed', String(active));
  });
  const coop = selectedMode === 'coop', daily = selectedMode === 'daily';
  byId('coop-toggle').checked = coop;
  byId('challenge-toggle').checked = daily;
  byId('coop-config').hidden = !coop;
  const challenge = getDailyChallenge();
  byId('daily-challenge-title').textContent = daily ? challenge.name : 'Regla rotativa · selección diaria';
  byId('daily-challenge-rule').textContent = challenge.rule;
  byId('daily-challenge-rule').hidden = !daily;
}

function syncSoundButton() {
  const enabled = isSoundEnabled(), button = byId('sound-toggle');
  button.innerHTML = `<span class="sound-wave">${enabled ? '♫' : '×'}</span>`;
  button.title = enabled ? 'Sonido activado' : 'Sonido silenciado';
  button.setAttribute('aria-label', enabled ? 'Silenciar sonido' : 'Activar sonido');
  button.setAttribute('aria-pressed', String(enabled));
}

export function bindMenu(onStart) {
  const start = () => {
    const mapSelect = byId('map-select');
    const transferSeed = decodeMapCode(byId('seed-input').value, Number(mapSelect.value) || 0);
    const mapIndex = transferSeed.isCode ? transferSeed.mapIndex : Number(mapSelect.value) || 0;
    const available = [...mapSelect.options].find(option => Number(option.value) === mapIndex);
    if (!available || available.disabled) {
      byId('seed-status').textContent = 'Ese sector todavía está bloqueado en esta partida.';
      cue('hit'); return;
    }
    const relicId = byId('relic-select').value || 'none';
    if (relicId !== 'none' && !isRelicUnlocked(relicId)) {
      byId('relic-description').textContent = `Reliquia bloqueada: ${RELICS[relicId]?.unlock || 'ganala durante una partida.'}`;
      cue('hit'); return;
    }
    const seedText = transferSeed.seedText || Math.random().toString(36).slice(2, 10).toUpperCase();
    byId('seed-input').value = encodeMapCode(mapIndex, seedText);
    mapSelect.value = String(mapIndex);
    const challengeId = selectedMode === 'daily' ? getDailyChallenge().id : 'none';
    cue('wave');
    onStart({ mapIndex, modeId: selectedMode, heroType: byId('hero-select').value || 'vanguard', hero2Type: byId('hero2-select').value || 'ranger',
      coop: selectedMode === 'coop', relicId, seedText, challengeId });
  };

  renderCampaignMenu(); renderHeroes(); renderRelicCards(); renderRecords();
  updateSector(Number(byId('map-select').value) || 0); setMode('solo'); syncSoundButton();
  byId('start-button').addEventListener('click', start);
  byId('retry-button').addEventListener('click', start);
  byId('hero-options').addEventListener('click', event => {
    const card = event.target.closest('[data-hero]'); if (!card) return;
    cue('select'); updateHero(card.dataset.hero);
  });
  byId('sector-options').addEventListener('click', event => {
    const card = event.target.closest('[data-map]'); if (!card || card.disabled) return;
    cue('select'); updateSector(Number(card.dataset.map));
  });
  byId('relic-options').addEventListener('click', event => {
    const card = event.target.closest('[data-relic]'); if (!card || card.disabled) return;
    cue('select'); byId('relic-select').value = card.dataset.relic; renderRelicCards();
  });
  document.querySelector('.mode-option-grid').addEventListener('click', event => {
    const card = event.target.closest('[data-mode]'); if (!card) return;
    cue('select'); setMode(card.dataset.mode);
  });
  byId('sound-toggle').addEventListener('click', () => { setSoundEnabled(!isSoundEnabled()); syncSoundButton(); });
  byId('copy-seed').addEventListener('click', async () => {
    const select = byId('map-select'), field = byId('seed-input');
    const parsed = decodeMapCode(field.value, Number(select.value) || 0);
    const seedText = parsed.seedText || Math.random().toString(36).slice(2, 10).toUpperCase();
    const code = encodeMapCode(parsed.isCode ? parsed.mapIndex : Number(select.value) || 0, seedText);
    field.value = code;
    try { await navigator.clipboard.writeText(code); byId('seed-status').textContent = 'Código copiado. Compartilo para repetir este terreno.'; }
    catch { field.focus(); field.select(); byId('seed-status').textContent = 'Código listo: copialo y compartilo.'; }
  });
  byId('export-records').addEventListener('click', async () => {
    const text = exportRecordsText(), area = byId('records-transfer'); area.value = text;
    try { await navigator.clipboard.writeText(text); byId('transfer-status').textContent = 'Récords copiados. Ya podés compartirlos.'; }
    catch { area.focus(); area.select(); byId('transfer-status').textContent = 'Datos listos: copialos para compartir.'; }
  });
  byId('import-records').addEventListener('click', () => {
    try {
      const count = importRecordsText(byId('records-transfer').value);
      renderCampaignMenu(); renderRelicCards(); renderRecords();
      byId('transfer-status').textContent = `Importación lista · ${count} récords guardados.`;
    } catch (error) { byId('transfer-status').textContent = error.message || 'No se pudieron importar los datos.'; }
  });
  byId('map-select').addEventListener('change', event => { updateSector(Number(event.target.value)); });
  byId('hero-select').addEventListener('change', event => updateHero(event.target.value));
}
