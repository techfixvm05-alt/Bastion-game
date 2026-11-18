import { BOSSES, CORE, WORLD } from '../config.js';
import { S } from '../state.js';
import { makeBossRoutes } from '../maps.js';
import { spawnEnemy } from './enemies.js';
import { clamp, dist, nearest, rand } from '../utils.js';
import { cue } from '../audio.js';

export function bossForWave(wave) {
  if (wave % 5 !== 0) return null;
  return ['colossus', 'cartographer', 'matriarch'][(Math.floor(wave / 5) - 1) % 3];
}

const TOWER_LABELS = { ballista: 'ballestas', mortar: 'morteros', cryo: 'emisores criónicos', totem: 'totems', inferno: 'lanzallamas' };

function inspectBossCounters(boss, initial = false) {
  const towers = S.towers.filter(t => !t.destroyed);
  const counts = {};
  for (const tower of towers) if (tower.type !== 'generator') counts[tower.type] = (counts[tower.type] || 0) + 1;
  const dominantEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const dominant = dominantEntry?.[0] || null, count = dominantEntry?.[1] || 0;
  const generators = towers.filter(t => t.type === 'generator').length;
  const objectiveKind = S.objective?.kind || 'none';
  const signature = `${dominant || 'none'}:${count}:${generators}:${objectiveKind}`;
  if (boss.adaptationSignature === signature) return;
  boss.adaptationSignature = signature; boss.adaptiveType = count ? dominant : null;
  boss.adaptiveArmor = count ? Math.min(.3, .08 + .22 * count / Math.max(1, towers.length - generators)) : 0;
  boss.gridCount = generators; boss.objectiveKind = objectiveKind;
  const weaponText = dominant ? `blindaje contra ${TOWER_LABELS[dominant]}` : 'sin contramedida de torretas';
  const gridText = generators ? `EMP para ${generators} generador${generators > 1 ? 'es' : ''}` : 'sin EMP de red';
  boss.adaptationLabel = `${weaponText} · ${gridText} · objetivo ${objectiveKind}`;
  if (!initial) { S.banner = `EL JEFE SE ADAPTA · ${boss.adaptationLabel.toUpperCase()}`; S.bannerClock = 3.5; }
}

function counterObjective(boss) {
  const objective = S.objective;
  if (!objective || objective.complete || objective.failed || boss.objectiveCounterClock > 0) return;
  const strength = 34 + S.wave * 4 + boss.gridCount * 7;
  if (objective.kind === 'relays') {
    const target = objective.sites.filter(site => site.hp > 0).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (target) target.hp = Math.max(0, target.hp - strength);
  } else if (objective.kind === 'evacuate') objective.progress = Math.max(0, objective.progress - 1.4);
  else if (objective.kind === 'stabilize') objective.progress = Math.max(0, objective.progress - 1.1);
  boss.objectiveCounterClock = 5.5;
  S.effects.push({ type: 'jam', x: boss.x, y: boss.y, age: 0, life: .65, color: '#ff9a70', radius: 82 });
  S.banner = `EL JEFE ATACA EL OBJETIVO · ${objective.name.toUpperCase()}`; S.bannerClock = 3;
}

export function spawnBoss(kind) {
  const cfg = BOSSES[kind];
  const towers = S.towers.filter(t => !t.destroyed).length;
  const challenge = S.challenge?.mods || {};
  const hp = cfg.baseHp * (1 + S.wave * .17 + towers * .15) * (S.coop ? 1.22 : 1) * (challenge.bossHp || 1);
  const boss = spawnEnemy('boss', null, { ...cfg, hp, bossKind: kind, color: cfg.color, radius: cfg.radius, speed: cfg.speed, damage: cfg.damage * (1 + S.wave * .075 + towers * .055) * (S.coop ? 1.12 : 1) * (challenge.bossDamage || 1), reward: cfg.reward + S.wave * 18 });
  if (!boss) return;
  cue('boss');
  boss.maxHp = boss.hp = hp; boss.bossKind = kind; boss.phase = 1; boss.attackClock = 4; boss.specialClock = 5;
  boss.routeAt = 0; S.bossSpawned = true;
  inspectBossCounters(boss, true);
  S.banner = `${cfg.name} · ${boss.adaptationLabel.toUpperCase()}`; S.bannerClock = 4.5;
}

function telegraph(boss, radius, duration, kind = 'blast') {
  S.effects.push({ type: 'warning', x: boss.x, y: boss.y, age: 0, life: duration, color: boss.color, radius, warningKind: kind });
}

function colossus(boss, dt, pressure) {
  boss.specialClock -= dt;
  if (boss.specialClock <= 0) {
    boss.specialClock = Math.max(3.3, 8 - pressure * .48) * (S.challenge?.mods?.bossCooldown || 1);
    const radius = 215 + pressure * 15;
    telegraph(boss, radius, 1.2, 'slam');
    S.effects.push({ type: 'impact', x: boss.x, y: boss.y, delay: 1.2, radius, damage: 95 + S.wave * 7 + S.towers.length * 12, energyDrain: 10 + boss.gridCount * 6, age: 0, life: 1.2, color: '#ea7755', source: boss });
    counterObjective(boss);
  }
}

function cartographer(boss, dt, pressure) {
  boss.specialClock -= dt;
  if (boss.hp < boss.maxHp * .66 && !boss.routeAdded) {
    boss.routeAdded = true; S.routeMutationWave = S.wave;
    const routes = makeBossRoutes(S.map, S.wave);
    for (const route of routes) {
      S.effects.push({ type: 'route-birth', route, age: 0, life: 2.8, color: boss.color });
      const scout = spawnEnemy('runner', route.id);
      if (scout) { scout.x = route.points[0].x; scout.y = route.points[0].y; scout.hp *= 1.2; }
    }
    S.banner = 'RUTAS FRACTURADAS · NUEVOS FLANCOS'; S.bannerClock = 4.2;
  }
  if (boss.specialClock <= 0) {
    boss.specialClock = Math.max(4.1, 8.8 - pressure * .4) * (S.challenge?.mods?.bossCooldown || 1);
    for (const tower of S.towers.filter(t => !t.destroyed)) {
      const d = dist(tower, boss);
      if (d < 700) { tower.disabled = Math.max(tower.disabled || 0, tower.type === 'generator' ? 4 : 2.4); S.effects.push({ type: 'jam', x: tower.x, y: tower.y, age: 0, life: 2.4, color: boss.color, radius: 35 }); }
    }
    if (boss.gridCount) { S.energy = Math.max(0, S.energy - 12 - boss.gridCount * 8); S.banner = 'LA CARTÓGRAFA · PULSO EMP EN LA RED'; S.bannerClock = 3; }
    S.effects.push({ type: 'burst', x: boss.x, y: boss.y, age: 0, life: .8, color: boss.color, radius: 165 });
    counterObjective(boss);
  }
}

function matriarch(boss, dt, pressure) {
  boss.specialClock -= dt;
  if (boss.specialClock <= 0) {
    boss.specialClock = Math.max(3.7, 7.8 - pressure * .43) * (S.challenge?.mods?.bossCooldown || 1);
    const operators = [S.hero, S.hero2].filter(hero => hero && hero.hp > 0);
    const targets = [...S.towers.filter(t => !t.destroyed).sort((a, b) => dist(a, boss) - dist(b, boss)).slice(0, 3), ...operators];
    for (const target of targets) {
      const radius = target === S.hero ? 105 : 85;
      telegraph(target, radius, .9, 'void');
      S.effects.push({ type: 'impact', x: target.x, y: target.y, delay: .9, radius, damage: 68 + S.wave * 5 + S.towers.length * 10, energyDrain: 8 + boss.gridCount * 5, age: 0, life: .9, color: '#82bddd', source: boss, void: true });
    }
    if (boss.hp < boss.maxHp * .5) {
      const route = S.map.routes[Math.floor(Math.random() * S.map.routes.length)];
      for (let i = 0; i < 2; i++) spawnEnemy(i ? 'shield' : 'ranged', route.id);
    }
    counterObjective(boss);
  }
}

function resolveImpact(effect) {
  if (effect.resolved) return;
  effect.resolved = true;
  if (effect.type !== 'impact') return;
  if (dist(S.hero, effect) < effect.radius + 14) S.hero.hp -= effect.damage;
  if (S.hero2 && dist(S.hero2, effect) < effect.radius + 14) S.hero2.hp -= effect.damage;
  if (effect.energyDrain) S.energy = Math.max(0, S.energy - effect.energyDrain * (S.challenge?.mods?.energyDrain || 1));
  for (const tower of S.towers) {
    if (!tower.destroyed && dist(tower, effect) < effect.radius + 22) {
      tower.hp -= effect.damage * (effect.void ? .9 : .72);
      tower.disabled = Math.max(tower.disabled || 0, effect.void ? 2.8 : 0);
      if (tower.hp <= 0) tower.destroyed = true;
    }
  }
  if (dist(CORE, effect) < effect.radius + CORE.radius) S.coreHp -= effect.damage * .28;
  S.effects.push({ type: 'shockwave', x: effect.x, y: effect.y, age: 0, life: .7, color: effect.color, radius: effect.radius });
}

export function updateBosses(dt) {
  const alive = S.enemies.filter(e => e.boss && !e.dead);
  const towerPressure = S.towers.filter(t => !t.destroyed).length;
  const pressure = S.wave * .13 + towerPressure * .23;
  for (const boss of alive) {
    boss.objectiveCounterClock = Math.max(0, (boss.objectiveCounterClock || 0) - dt);
    boss.adaptClock = (boss.adaptClock || 0) - dt;
    if (boss.adaptClock <= 0) { inspectBossCounters(boss); boss.adaptClock = 1.5; }
    const ratio = boss.hp / boss.maxHp;
    boss.phase = ratio < .32 ? 3 : ratio < .68 ? 2 : 1;
    boss.pulse += dt;
    if (boss.bossKind === 'colossus') colossus(boss, dt, pressure);
    else if (boss.bossKind === 'cartographer') cartographer(boss, dt, pressure);
    else matriarch(boss, dt, pressure);
  }
  for (const effect of S.effects) {
    if (effect.type === 'impact') { effect.delay -= dt; if (effect.delay <= 0) resolveImpact(effect); }
  }
}
