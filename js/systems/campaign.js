import { MAPS } from '../maps.js';
import { RELICS } from '../config.js';

const CAMPAIGN_KEY = 'bastion.campaign.v1';
const DEFAULT_PROGRESS = { unlocked: [0], bestWave: [0, 0, 0], challenges: [], relics: [] };

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
    const bestWave = Array.isArray(saved.bestWave) ? saved.bestWave.slice(0, MAPS.length).map(value => Math.max(0, Number(value) || 0)) : [...DEFAULT_PROGRESS.bestWave];
    const challenges = Array.isArray(saved.challenges) ? saved.challenges.filter(value => getChallenge(value)) : [];
    const relics = Array.isArray(saved.relics) ? saved.relics.filter(value => Object.hasOwn(RELICS, value)) : [];
    return { unlocked: [...new Set([0, ...unlocked])], bestWave, challenges, relics: [...new Set(relics)] };
  } catch { return { ...DEFAULT_PROGRESS, unlocked: [0], bestWave: [0, 0, 0], challenges: [], relics: [] }; }
}

export function isRelicUnlocked(id) { return readCampaignProgress().relics.includes(id); }

export function recordCampaignProgress(run) {
  const progress = readCampaignProgress();
  progress.bestWave[run.mapIndex] = Math.max(progress.bestWave[run.mapIndex] || 0, run.wave || 0);
  if (run.mapIndex === 0 && run.wave >= 5) progress.unlocked.push(1);
  if (run.mapIndex === 1 && (run.wave >= 8 || run.objectiveComplete)) progress.unlocked.push(2);
  if (run.challengeId && run.challengeId !== 'none' && run.wave >= 5) progress.challenges.push(run.challengeId);
  const achievements = [
    ['stormglass', (run.wave || 0) >= 2],
    ['salvager', (run.kills || 0) >= 35],
    ['capacitor', (run.generatorsBuilt || 0) >= 2 && (run.wave || 0) >= 3],
    ['bulwark', (run.wave || 0) >= 6],
    ['ricochet', (run.manualKills || 0) >= 15],
    ['dronecore', (run.bossKills || 0) >= 1],
    ['plasma', (run.towersBuilt || 0) >= 8],
    ['symbiosis', !!run.objectiveComplete]
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
  const unlockText = ['Disponible', 'Superá la oleada 5 en Tierras Rojas', 'Completá el objetivo o alcanzá oleada 8 en Cantera'];
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
      const label = unlocked ? map.objective.name : ['Disponible', 'Superá la oleada 5 en Tierras Rojas', 'Completá el objetivo o alcanzá oleada 8 en Cantera'][index];
      return `<button class="sector-card ${unlocked ? '' : 'locked'} ${index === selected ? 'selected' : ''}" type="button" data-map="${index}" style="--sector-accent:${map.colors.accent}" ${unlocked ? '' : 'disabled'} aria-pressed="${index === selected}" title="${label}"><b>${map.name}</b><small>${unlocked ? map.biome : `⌑ ${label}`}</small></button>`;
    }).join('');
  }
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
