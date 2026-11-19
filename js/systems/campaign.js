import { MAPS } from '../maps.js';
import { RELICS } from '../config.js';
import { CHAPTERS, CHAPTER_RELICS, GOALS } from '../lore.js';

const CAMPAIGN_KEY = 'bastion.campaign.v1';
const DEFAULT_PROGRESS = { unlocked: [0], bestWave: Array(MAPS.length).fill(0), challenges: [], relics: [], coins: 0, relicLevels: {} };
export const MAX_RELIC_LEVEL = 5;

export const CHALLENGES = [
  { id: 'blackout', name: 'Apagón de frontera', rule: 'La red base genera 55% menos energía; las bajas dan 20% más chatarra.', mods: { generation: .55, rewardCredits: 1.2 } },
  { id: 'predators', name: 'Cacería abierta', rule: 'Los enemigos corren 28% más y llegan en grupos 15% mayores.', mods: { enemySpeed: 1.28, waveCount: 1.15, rewardCredits: 1.25 } },
  { id: 'acid', name: 'Lluvia cáustica', rule: 'Las nubes duran 35% más y dañan 60% más rápido.', mods: { toxicDuration: 1.35, toxicDamage: 1.6, rewardCredits: 1.25 } },
  { id: 'bossrush', name: 'Protocolo de caza', rule: 'Los jefes tienen 38% más vida y atacan 22% más seguido.', mods: { bossHp: 1.38, bossDamage: 1.25, bossCooldown: .78, rewardCredits: 1.35 } }
];

export function getChallenge(id) { return CHALLENGES.find(challenge => challenge.id === id) || null; }

export function getDailyChallenge(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
  return CHALLENGES[((day % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length];
}

export function readCampaignProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(CAMPAIGN_KEY) || '{}');
    const unlocked = Array.isArray(saved.unlocked) ? saved.unlocked.filter(value => Number.isInteger(value) && value >= 0 && value < MAPS.length) : [];
    const bestWave = Array.isArray(saved.bestWave) ? saved.bestWave.concat(Array(MAPS.length).fill(0)).slice(0, MAPS.length).map(value => Math.max(0, Number(value) || 0)) : [...DEFAULT_PROGRESS.bestWave];
    const challenges = Array.isArray(saved.challenges) ? saved.challenges.filter(value => getChallenge(value)) : [];
    const relics = Array.isArray(saved.relics) ? saved.relics.filter(value => Object.hasOwn(RELICS, value)) : [];
    const levels = {}; for (const id of Object.keys(RELICS)) levels[id] = Math.max(1, Math.min(MAX_RELIC_LEVEL, Number(saved.relicLevels?.[id]) || 1));
    return { unlocked: [...new Set([0, ...unlocked])], bestWave, challenges, relics: [...new Set(relics)], coins: Math.max(0, Math.floor(Number(saved.coins) || 0)), relicLevels: levels };
  } catch { return { ...DEFAULT_PROGRESS, unlocked: [0], bestWave: Array(MAPS.length).fill(0), challenges: [], relics: [], coins: 0, relicLevels: {} }; }
}

export function unlockWave(index) { return index <= 1 ? 5 : 6 + index; }
export function unlockHint(index) { return `Completá el capítulo ${index} (resistí ${GOALS[index - 1]} oleadas)`; }
export function getChapter(index) { return CHAPTERS[index] || CHAPTERS[CHAPTERS.length - 1]; }
export function getRelicLevel(id) { return readCampaignProgress().relicLevels[id] || 1; }
export function relicUpgradeCost(level) { return 100 * level; }
export function upgradeRelic(id) {
  const progress = readCampaignProgress(), level = progress.relicLevels[id] || 1, cost = relicUpgradeCost(level);
  if (!progress.relics.includes(id) || level >= MAX_RELIC_LEVEL || progress.coins < cost) return false;
  progress.coins -= cost; progress.relicLevels[id] = level + 1;
  try { localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(progress)); } catch { return false; }
  return true;
}
// Las ventajas crecen con el nivel y las desventajas se reducen.
export function scaleRelicMods(mods, level = 1) {
  const n = level - 1, out = { ...mods };
  const benefit = ['heroDamage', 'killCredits', 'generatorOutput', 'coreHp', 'stormDuration'], penalty = ['towerCost', 'energyUse'], lowPenalty = ['startingCredits', 'heroHp'];
  for (const k of benefit) if (k in out) out[k] = 1 + (out[k] - 1) * (1 + .22 * n);
  if ('shieldBossHits' in out) out.shieldBossHits = out.shieldBossHits + n;
  for (const k of penalty) if (k in out) out[k] = 1 + (out[k] - 1) * Math.max(0, 1 - .15 * n);
  for (const k of lowPenalty) if (k in out) out[k] = 1 - (1 - out[k]) * Math.max(0, 1 - .15 * n);
  if ('chainRatio' in out) out.chainRatio += .07 * n;
  if ('manualBounces' in out) out.manualBounces += Math.floor(n / 2);
  if ('droneKills' in out) out.droneKills = Math.max(4, out.droneKills - n);
  if ('toxicAffinity' in out) out.toxicAffinity += .18 * n;
  return out;
}
export function isRelicUnlocked(id) { return readCampaignProgress().relics.includes(id); }

export function recordCampaignProgress(run) {
  const progress = readCampaignProgress();
  progress.bestWave[run.mapIndex] = Math.max(progress.bestWave[run.mapIndex] || 0, run.wave || 0);
  if (run.won && run.mapIndex + 1 < MAPS.length) progress.unlocked.push(run.mapIndex + 1);
  // Monedas al final de cada nivel: se gastan en mejorar reliquias.
  const coins = Math.round((run.wave || 0) * 4 + (run.kills || 0) * .3 + (run.objectiveComplete ? 40 : 0) + (run.bossKills || 0) * 30 + run.mapIndex * 8 + (run.won ? 60 : 0));
  progress.coins = (progress.coins || 0) + coins; run.coinsEarned = coins;
  if (run.won) { const r = CHAPTER_RELICS[run.mapIndex]; if (r && !progress.relics.includes(r)) { progress.relics.push(r); run.relicGranted = r; } }
  if (run.challengeId && run.challengeId !== 'none' && run.wave >= 5) progress.challenges.push(run.challengeId);
  const achievements = [
    ['stormglass', (run.wave || 0) >= 5],
    ['salvager', (run.kills || 0) >= 65],
    ['capacitor', (run.generatorsBuilt || 0) >= 3 && (run.wave || 0) >= 7],
    ['bulwark', (run.wave || 0) >= 8],
    ['ricochet', (run.manualKills || 0) >= 25],
    ['dronecore', (run.bossKills || 0) >= 2],
    ['plasma', (run.towersBuilt || 0) >= 10],
    ['symbiosis', !!run.won && !!run.objectiveComplete],
    ['aegis', (run.bossKills || 0) >= 3]
  ];
  for (const [id, earned] of achievements) if (earned) progress.relics.push(id);
  progress.unlocked = [...new Set(progress.unlocked)].sort();
  progress.challenges = [...new Set(progress.challenges)];
  progress.relics = [...new Set(progress.relics)];
  try { localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(progress)); } catch { /* Unlocks stay unavailable if browser storage is disabled. */ }
  return progress;
}

export function renderCampaignMenu() {
  const mapSelect = document.getElementById('map-select');
  if (!mapSelect) return;
  const progress = readCampaignProgress(), previous = Number(mapSelect.value || 0);
  const unlockText = MAPS.map((_, i) => i === 0 ? 'Disponible' : unlockHint(i));
  mapSelect.innerHTML = MAPS.map((map, index) => {
    const unlocked = progress.unlocked.includes(index);
    const label = unlocked ? map.name : `${map.name} · BLOQUEADO`;
    return `<option value="${index}" ${unlocked ? '' : 'disabled'}>${label}${!unlocked ? ` · ${unlockText[index]}` : ''}</option>`;
  }).join('');
  mapSelect.value = String(progress.unlocked.includes(previous) ? previous : Math.max(...progress.unlocked));
  const sectorHolder = document.getElementById('sector-options');
  if (sectorHolder) {
    const selected = Number(mapSelect.value || 0);
    sectorHolder.innerHTML = MAPS.map((map, index) => {
      const unlocked = progress.unlocked.includes(index);
      const label = unlocked ? map.objective.name : (index === 0 ? 'Disponible' : unlockHint(index));
      return `<button class="sector-card ${unlocked ? '' : 'locked'} ${index === selected ? 'selected' : ''}" type="button" data-map="${index}" style="--sector-accent:${map.colors.accent}" ${unlocked ? '' : 'disabled'} aria-pressed="${index === selected}" title="${label}"><b>${map.name}</b><small>${unlocked ? map.biome : `⌑ ${label}`}</small></button>`;
    }).join('');
  }
  const chapterBox = document.getElementById('story-chapter');
  if (chapterBox) { const ch = getChapter(Number(mapSelect.value || 0)); chapterBox.innerHTML = `<b>${ch.act}</b> · ${ch.title}<br>${ch.text}`; }
  const daily = getDailyChallenge();
  const title = document.getElementById('daily-challenge-title'), rule = document.getElementById('daily-challenge-rule');
  if (title) title.textContent = daily.name;
  if (rule) rule.textContent = daily.rule;
  const toggle = document.getElementById('challenge-toggle');
  if (toggle) toggle.dataset.challengeId = daily.id;
  const unlockedLabel = document.getElementById('unlock-summary');
  if (unlockedLabel) unlockedLabel.textContent = `SECTORES ${progress.unlocked.length}/${MAPS.length} · RELIQUIAS ${progress.relics.length}/${Object.keys(RELICS).length}`;
}

export function normalizeSeed(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24);
}

export function encodeMapCode(mapIndex, seedText) {
  return `BASTION:${mapIndex}:${normalizeSeed(seedText)}`;
}

export function decodeMapCode(value, fallbackMapIndex = 0) {
  const text = String(value || '').trim();
  const match = text.match(/^BASTION:(\d+):([A-Z0-9_-]{1,24})$/i);
  if (match) return { mapIndex: Number(match[1]), seedText: normalizeSeed(match[2]), isCode: true };
  return { mapIndex: fallbackMapIndex, seedText: normalizeSeed(text), isCode: false };
}
