import { CORE, HEROES, RELICS } from './config.js';
import { createMap } from './maps.js';
import { getChallenge } from './systems/campaign.js';

export const S = {
  phase: 'menu', map: null, mapIndex: 0, heroType: 'vanguard', hero: null, camera: { x: 0, y: 0 },
  towers: [], enemies: [], shots: [], enemyShots: [], effects: [], wave: 0, queue: [], spawnClock: 0,
  waveActive: false, restClock: 0, coreHp: CORE.maxHp, coreMax: CORE.maxHp, credits: 420, kills: 0, fireMode: 'auto',
  selectedTower: null, buildType: null, pointer: { x: 0, y: 0, down: false }, keys: new Set(), bossSpawned: false,
  routeMutationWave: 0, banner: '', bannerClock: 0, threat: 0, id: 0, lastTime: 0, repairClock: 0,
  difficulty: 1, runStart: 0, hero2: null, hero2Type: 'ranger', coop: false, pointer2: { x: 0, y: 0, down: false },
  relicId: 'stormglass', relic: null, relicMods: {}, recordSaved: false,
  energy: 72, maxEnergy: 100, energyGeneration: 1.8, energyUse: 0,
  environment: { phase: 'idle', type: 'clear', label: 'Calma', timer: 14, duration: 0, sequence: 0 }, toxicZones: [], fissureMarks: [],
  objective: null, objectiveClaimed: false,
  seedText: 'bastion', challengeId: 'none', challenge: null, relicKills: 0, supportDrones: []
};

export function startRun({ mapIndex = 0, heroType = 'vanguard', hero2Type = 'ranger', coop = false, relicId = 'stormglass', seedText = 'bastion', challengeId = 'none' } = {}) {
  S.mapIndex = mapIndex; S.seedText = String(seedText || 'bastion').slice(0, 24); S.map = createMap(mapIndex, S.seedText); S.heroType = heroType;
  S.hero2Type = hero2Type; S.coop = coop; S.relicId = relicId;
  const relic = RELICS[relicId] || RELICS.stormglass; S.relic = relic; S.relicMods = relic.mods;
  S.challengeId = challengeId; S.challenge = getChallenge(challengeId);
  const makeHero = (type, offset = 0) => {
    const h = HEROES[type] || HEROES.vanguard;
    const maxHp = h.hp * (S.relicMods.heroHp || 1);
    return { x: CORE.x + offset, y: CORE.y + 145, hp: maxHp, maxHp, speed: h.speed, damage: h.damage * (S.relicMods.heroDamage || 1), range: h.range, cooldown: h.cooldown, fireClock: 0, color: h.color, aim: 0, type };
  };
  S.hero = makeHero(heroType);
  S.hero2 = coop ? makeHero(hero2Type, 42) : null;
  S.camera = { x: 0, y: 0 }; S.towers = []; S.enemies = []; S.shots = []; S.enemyShots = []; S.effects = [];
  S.wave = 0; S.queue = []; S.spawnClock = 0; S.waveActive = false; S.restClock = 0;
  S.coreMax = CORE.maxHp * (S.relicMods.coreHp || 1); S.coreHp = S.coreMax;
  S.credits = Math.round(420 * (S.relicMods.startingCredits || 1)); S.kills = 0; S.fireMode = 'auto'; S.selectedTower = null; S.buildType = null;
  S.bossSpawned = false; S.routeMutationWave = 0; S.banner = 'SECTOR DESPLEGADO'; S.bannerClock = 2.4;
  S.threat = 0; S.id = 0; S.repairClock = 0; S.phase = 'playing'; S.runStart = performance.now(); S.recordSaved = false;
  S.energy = 72; S.maxEnergy = 100; S.energyGeneration = 1.8; S.energyUse = 0;
  S.environment = { phase: 'idle', type: 'clear', label: 'Calma', timer: 14, duration: 0, sequence: 0 };
  S.toxicZones = []; S.fissureMarks = []; S.objective = JSON.parse(JSON.stringify(S.map.objective)); S.objectiveClaimed = false;
  S.relicKills = 0; S.supportDrones = [];
}

export function finishRun(cause = 'El núcleo cayó.') {
  if (S.phase !== 'playing') return;
  S.phase = 'over'; S.waveActive = false; S.banner = cause; S.bannerClock = 99;
}
