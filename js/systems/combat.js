import { CORE, HEROES, TOWERS, WORLD } from '../config.js';
import { S } from '../state.js';
import { clamp, dist, dist2, nearest, pointOnRoutes } from '../utils.js';
import { killEnemy } from './enemies.js';
import { consumeEnergy, updatePower } from './power.js';
import { shopMul } from './shop.js';
import { deflectShot, stormImpactOffset } from './worldEvents.js';
import { cue } from '../audio.js';

const liveEnemies = () => S.enemies.filter(e => !e.dead && e.hp > 0);

export function towerCost(type) {
  return Math.round(TOWERS[type].cost * (1 + S.towers.filter(t => !t.destroyed).length * .10) * (S.relicMods.towerCost || 1));
}

export function blueprintCost(type) {
  return Math.round((TOWERS[type]?.planCost || 0) * (S.relicMods.towerCost || 1));
}

export function buyBlueprint(type) {
  const cfg = TOWERS[type];
  if (!cfg || S.phase !== 'playing') return { ok: false, message: 'Plano no disponible.' };
  if (S.blueprints.has(type)) return { ok: true, alreadyOwned: true };
  const cost = blueprintCost(type);
  if (S.credits < cost) return { ok: false, message: `Plano: faltan ${cost - Math.floor(S.credits)} de chatarra.` };
  S.credits -= cost; S.blueprints.add(type); S.buildType = type; S.selectedTower = null;
  cue('plan');
  return { ok: true, type };
}

export function placeTower(type, x, y) {
  const cfg = TOWERS[type];
  if (!cfg || S.phase !== 'playing') return { ok: false, message: 'Selección inválida.' };
  if (!S.blueprints.has(type)) return { ok: false, message: 'Primero comprá el plano de esta estructura.' };
  const cost = towerCost(type);
  if (S.credits < cost) return { ok: false, message: 'Falta chatarra.' };
  if (x < 85 || x > WORLD.width - 85 || y < 85 || y > WORLD.height - 85) return { ok: false, message: 'Fuera del sector.' };
  if (type === 'shieldwall') {
    if (!pointOnRoutes({ x, y }, S.map.routes, 120)) return { ok: false, message: 'Colocá el escudo sobre una ruta.' };
  } else if (pointOnRoutes({ x, y }, S.map.routes, 104)) {
    return { ok: false, message: 'No bloquees una ruta.' };
  }
  if (dist({ x, y }, CORE) < 150) return { ok: false, message: 'Demasiado cerca del núcleo.' };
  if (S.map.obstacles.some(([ox, oy, w, h]) => x > ox - 35 && x < ox + w + 35 && y > oy - 35 && y < oy + h + 35)) return { ok: false, message: 'Terreno bloqueado.' };
  if (S.towers.some(t => !t.destroyed && dist({ x, y }, t) < 78)) return { ok: false, message: 'Dejá espacio entre torretas.' };
  S.credits -= cost;
  const shield = type === 'shieldwall';
  const tower = { id: ++S.id, type, x, y, level: 1, hp: shield ? 2400 : 560, maxHp: shield ? 2400 : 560, clock: .3, pulseClock: 1, shots: 0, disabled: 0, hitFlash: 0, charge: shield ? 1 : 30 * shopMul('battery'), maxCharge: shield ? 1 : 30 * shopMul('battery'), anim: Math.random() * 8, angle: -Math.PI / 2, selected: false, shieldwall: shield };
  S.towers.push(tower); S.selectedTower = tower.id;
  S.runStats.towersBuilt++;
  if (type === 'generator') S.runStats.generatorsBuilt++;
  cue('build');
  return { ok: true, tower };
}

export function upgradeSelectedTower() {
  const tower = S.towers.find(t => t.id === S.selectedTower && !t.destroyed);
  if (!tower || tower.level >= (tower.evo ? 5 : 3)) return { ok: false, message: 'No hay mejora disponible.' };
  const cost = Math.round(TOWERS[tower.type].cost * (1.25 + tower.level * .85) * (S.relicMods.towerCost || 1));
  if (S.credits < cost) return { ok: false, message: `Mejora: ${cost} de chatarra.` };
  S.credits -= cost; tower.level++;
  tower.maxHp += 165; tower.hp = Math.min(tower.maxHp, tower.hp + 165);
  tower.damageMultiplier = (tower.damageMultiplier || 1) * 1.28;
  tower.rangeMultiplier = (tower.rangeMultiplier || 1) * 1.08;
  return { ok: true, tower };
}

export function setFireMode(mode = null) {
  S.fireMode = mode || (S.fireMode === 'auto' ? 'manual' : 'auto');
}

function spawnPlayerShot(x, y, targetX, targetY, damage, color, options = {}) {
  const dx = targetX - x, dy = targetY - y, length = Math.hypot(dx, dy) || 1;
  S.shots.push({ x, y, vx: dx / length * (options.speed || 760), vy: dy / length * (options.speed || 760), target: options.target || null,
    damage, color, radius: options.radius || 5, age: 0, life: options.life || 1.5, splash: options.splash || 0,
    slow: options.slow || 0, expose: options.expose || 0, burn: options.burn || 0, pierce: options.pierce || 0,
    bounces: options.bounces || 0, bouncedHit: false, chained: false,
    source: options.source || 'hero', hits: new Set(), xEnd: targetX, yEnd: targetY });
}

function heroShoot(dt) {
  heroShootFor(S.hero, S.pointer, dt);
  if (S.hero2) heroShootFor(S.hero2, S.pointer2, dt);
}

function heroShootFor(hero, pointer, dt) {
  if (!hero || hero.hp <= 0) return;
  hero.fireClock -= dt;
  if (S.fireMode === 'auto') {
    const target = nearest(liveEnemies(), hero, hero.range);
    if (target && hero.fireClock <= 0) {
      hero.aim = Math.atan2(target.y - hero.y, target.x - hero.x);
      spawnPlayerShot(hero.x, hero.y, target.x, target.y, hero.damage, hero.color, { target, source: 'hero', speed: 850, radius: 5 });
      cue('shot');
      hero.fireClock = hero.cooldown;
    }
  } else if (pointer.down && hero.fireClock <= 0) {
    const tx = pointer.x + S.camera.x, ty = pointer.y + S.camera.y;
    const a = Math.atan2(ty - hero.y, tx - hero.x); hero.aim = a;
    const endX = hero.x + Math.cos(a) * hero.range, endY = hero.y + Math.sin(a) * hero.range;
    spawnPlayerShot(hero.x, hero.y, endX, endY, hero.damage * 1.12, hero.color, { source: 'manual', speed: 1100, radius: 4, life: hero.range / 1100, bounces: S.relicMods.manualBounces || 0 });
    cue('shot');
    hero.fireClock = hero.cooldown * .72;
  }
}

function towerFire(tower, dt) {
  const cfg = TOWERS[tower.type], levelScale = (tower.damageMultiplier || 1) * shopMul('towerDmg') * (S.buffs.power > 0 ? 1.4 : 1) * (tower.evo?.dmg || 1);
  if (tower.type === 'shieldwall') {
    tower.disabled = 0;
    tower.charge = 1;
    tower.maxCharge = 1;
    tower.hp = Math.min(tower.maxHp, tower.hp + 5 * dt * tower.level * (tower.evo?.regen || 1));
    tower.clock = .45;
    return;
  }
  tower.clock -= dt * shopMul('towerRate') * (tower.evo?.rate || 1) * (S.buffs.haste > 0 ? 1.6 : 1); tower.pulseClock -= dt; tower.disabled = Math.max(0, (tower.disabled || 0) - dt);
  tower.fireFlash = Math.max(0, (tower.fireFlash || 0) - dt);
  tower.hitFlash = Math.max(0, tower.hitFlash - dt); tower.anim += dt;
  if (tower.type === 'generator') { tower.clock = .45; return; }
  if (tower.disabled || tower.clock > 0) return;
  const range = cfg.range * (tower.rangeMultiplier || 1) * (tower.evo?.range || 1);
  const target = nearest(liveEnemies(), tower, range, (enemy, d2) => d2 / (enemy.boss ? .72 : 1));
  if (target) tower.fireFlash = .11;
  if (tower.type === 'totem') {
    if (tower.pulseClock <= 0) {
      if (!consumeEnergy(tower, cfg.energyUse)) { tower.clock = .2; return; }
      tower.pulseClock = Math.max(.7, cfg.rate - tower.level * .13);
      for (const enemy of liveEnemies()) if (dist(enemy, tower) < range) enemy.hp -= adaptedDamage(enemy, cfg.damage * levelScale, 'totem');
      for (const ally of S.towers) if (ally !== tower && !ally.destroyed && dist(ally, tower) < range) ally.hp = Math.min(ally.maxHp, ally.hp + 25 + tower.level * 10);
      S.effects.push({ type: 'pulse', x: tower.x, y: tower.y, age: 0, life: .55, radius: range * .72, color: cfg.color });
    }
    tower.clock = .2; return;
  }
  if (!target) { tower.clock = .12; return; }
  tower.angle = Math.atan2(target.y - tower.y, target.x - tower.x);
  if (tower.type === 'cryo') {
    if (!consumeEnergy(tower, cfg.energyUse * dt)) { tower.clock = .1; return; }
    target.hp -= adaptedDamage(target, cfg.damage * levelScale * dt * 2.8, 'cryo');
    target.slow = Math.max(target.slow, .22 + tower.level * .07);
    target.expose = Math.max(target.expose, .35 + tower.level * .12);
    S.effects.push({ type: 'beam', x: tower.x, y: tower.y, tx: target.x, ty: target.y, age: 0, life: .08, color: cfg.color });
    tower.clock = .05; return;
  }
  if (tower.type === 'inferno') {
    if (!consumeEnergy(tower, cfg.energyUse)) { tower.clock = .2; return; }
    const cone = Math.PI * .68, angle = tower.angle;
    for (const enemy of liveEnemies()) {
      const d = dist(enemy, tower), a = Math.atan2(enemy.y - tower.y, enemy.x - tower.x);
      let delta = Math.atan2(Math.sin(a - angle), Math.cos(a - angle));
      if (d < range && Math.abs(delta) < cone / 2) { enemy.hp -= adaptedDamage(enemy, cfg.damage * levelScale, 'inferno'); enemy.burn = Math.max(enemy.burn, 1.3 + tower.level * .35); }
    }
    S.effects.push({ type: 'flame', x: tower.x, y: tower.y, angle, age: 0, life: .16, radius: range, color: cfg.color });
    tower.clock = Math.max(.08, cfg.rate - tower.level * .015); return;
  }
  if (tower.type === 'ballista') {
    if (!consumeEnergy(tower, cfg.energyUse)) { tower.clock = .2; return; }
    tower.shots++;
    const crit = tower.shots % 4 === 0;
    spawnPlayerShot(tower.x, tower.y, target.x, target.y, cfg.damage * levelScale * (crit ? 1.75 : 1), cfg.color, { target, source: 'ballista', speed: 680, radius: crit ? 9 : 6, pierce: crit ? 3 : 0 });
    cue('shot');
  } else if (tower.type === 'mortar') {
    if (!consumeEnergy(tower, cfg.energyUse)) { tower.clock = .2; return; }
    S.shots.push({ x: tower.x, y: tower.y, targetX: target.x, targetY: target.y, travel: Math.max(.35, dist(target, tower) / 460), age: 0,
      damage: cfg.damage * levelScale, splash: 112 + tower.level * 18, slow: 1.6, color: cfg.color, radius: 9, source: 'mortar', arc: true, hits: new Set(), chained: false });
    cue('shot');
  }
  tower.clock = Math.max(.22, cfg.rate * (1 - (tower.level - 1) * .08));
}

function adaptedDamage(target, damage, source) {
  return target.boss && target.adaptiveType === source ? damage * (1 - (target.adaptiveArmor || 0)) : damage;
}

function chainArc(shot, target) {
  const ratio = S.relicMods.chainRatio;
  if (!ratio || shot.chained || !['ballista', 'mortar', 'cryo', 'totem', 'inferno'].includes(shot.source)) return;
  const next = nearest(liveEnemies().filter(enemy => !shot.hits.has(enemy.id)), target, 245);
  if (!next) return;
  const damage = adaptedDamage(next, shot.damage * ratio, shot.source);
  next.hp -= damage; next.hitFlash = .16; shot.hits.add(next.id); shot.chained = true;
  S.effects.push({ type: 'beam', x: target.x, y: target.y, tx: next.x, ty: next.y, age: 0, life: .18, color: '#a7f6e0' });
}

function resolveShot(shot, target) {
  if (!target || target.dead) return false;
  const scale = target.expose > 0 ? 1.34 : 1;
  target.hp -= adaptedDamage(target, shot.damage * scale, shot.source);
  if (shot.source === 'manual') target.manualHit = true;
  cue('hit');
  target.hitFlash = .13;
  if (shot.slow) target.slow = Math.max(target.slow, shot.slow);
  if (shot.expose) target.expose = Math.max(target.expose, shot.expose);
  if (shot.burn) target.burn = Math.max(target.burn, shot.burn);
  shot.hits.add(target.id);
  chainArc(shot, target);
  if (shot.pierce > 0) { shot.pierce--; return false; }
  if (shot.bounces > 0) {
    const next = nearest(liveEnemies().filter(enemy => !shot.hits.has(enemy.id)), target, 260);
    if (next) {
      shot.bounces--; shot.target = next; shot.life += .35; shot.age = Math.max(0, shot.age - .18); shot.bouncedHit = true;
      return false;
    }
  }
  return true;
}

function explode(shot) {
  if (shot.exploded) return;
  shot.exploded = true;
  if (!shot.hits) shot.hits = new Set();
  for (const enemy of liveEnemies()) if (dist(enemy, { x: shot.x, y: shot.y }) <= shot.splash) {
    const falloff = Math.max(.38, 1 - dist(enemy, shot) / (shot.splash * 1.25));
    enemy.hp -= adaptedDamage(enemy, shot.damage * falloff, shot.source); enemy.slow = Math.max(enemy.slow, shot.slow);
  }
  if (S.relicMods.chainRatio && !shot.chained) {
    const next = nearest(liveEnemies().filter(enemy => dist(enemy, shot) > shot.splash && !shot.hits.has(enemy.id)), shot, shot.splash + 245);
    if (next) { next.hp -= adaptedDamage(next, shot.damage * S.relicMods.chainRatio, shot.source); shot.chained = true; S.effects.push({ type: 'beam', x: shot.x, y: shot.y, tx: next.x, ty: next.y, age: 0, life: .18, color: '#a7f6e0' }); }
  }
  S.effects.push({ type: 'blast', x: shot.x, y: shot.y, age: 0, life: .55, radius: shot.splash, color: shot.color });
}

function updateShots(dt) {
  for (const shot of S.shots) {
    shot.age += dt;
    if (shot.arc) {
      shot.travel -= dt;
      const t = clamp(1 - shot.travel / Math.max(.01, shot.age + shot.travel), 0, 1);
      shot.x = shot.x + (shot.targetX - shot.x) * Math.min(1, dt * 1.8);
      shot.y = shot.y + (shot.targetY - shot.y) * Math.min(1, dt * 1.8);
      if (shot.travel <= 0) { const drift = stormImpactOffset({ x: shot.targetX, y: shot.targetY }); shot.x = shot.targetX + drift.x; shot.y = shot.targetY + drift.y; explode(shot); shot.dead = true; }
      continue;
    }
    const storm = S.environment.type === 'storm' && S.environment.phase === 'active' && dist(shot, S.environment) < S.environment.radius;
    if (shot.target && !storm && !shot.target.dead && shot.target.hp > 0 && shot.age < shot.life * .84) {
      const dx = shot.target.x - shot.x, dy = shot.target.y - shot.y, d = Math.hypot(dx, dy) || 1;
      shot.vx = dx / d * 850; shot.vy = dy / d * 850;
    }
    deflectShot(shot, dt);
    shot.x += shot.vx * dt; shot.y += shot.vy * dt;
    for (const enemy of liveEnemies()) {
      if (shot.hits?.has(enemy.id) || dist(shot, enemy) > enemy.radius + shot.radius) continue;
      const finished = resolveShot(shot, enemy);
      if (shot.bouncedHit) { shot.bouncedHit = false; break; }
      if (finished) { shot.dead = true; break; }
    }
    if (shot.age > shot.life || shot.x < 0 || shot.x > WORLD.width || shot.y < 0 || shot.y > WORLD.height) shot.dead = true;
  }
  S.shots = S.shots.filter(s => !s.dead);
  for (const enemy of S.enemies) if (!enemy.dead && enemy.hp <= 0) killEnemy(enemy);
}

export function triggerHeroAbility(hero) {
  if (!hero || hero.hp <= 0 || hero.abilityCooldown > 0) return { ok: false, message: 'Habilidad recargándose.' };
  const cfg = HEROES[hero.type];
  hero.abilityCooldown = cfg?.abilityCooldown || 14;
  hero.abilityActive = 0;
  if (hero.type === 'vanguard') hero.abilityActive = 4;
  else if (hero.type === 'ranger') hero.abilityActive = 4;
  else if (hero.type === 'sentinel') {
    for (const enemy of liveEnemies()) if (dist(enemy, hero) < 280) {
      enemy.hp -= 90 + S.wave * 7;
      enemy.stun = 2;
      const dx = enemy.x - hero.x, dy = enemy.y - hero.y, d = Math.hypot(dx, dy) || 1;
      enemy.x += dx / d * 55; enemy.y += dy / d * 55;
    }
  } else if (hero.type === 'engineer') {
    S.coreHp = Math.min(S.coreMax, S.coreHp + S.coreMax * .18);
    for (const tower of S.towers) if (!tower.destroyed && dist(tower, hero) < 420) tower.hp = Math.min(tower.maxHp, tower.hp + tower.maxHp * .35);
  }
  S.effects.push({ type: 'pulse', x: hero.x, y: hero.y, age: 0, life: .55, radius: 280, color: hero.color });
  cue('unlock');
  return { ok: true, message: `${cfg.ability} activada.` };
}

export function updateCombat(dt) {
  if (S.phase !== 'playing') return;
  for (const hero of [S.hero, S.hero2]) {
    if (!hero) continue;
    hero.abilityCooldown = Math.max(0, (hero.abilityCooldown || 0) - dt);
    hero.abilityActive = Math.max(0, (hero.abilityActive || 0) - dt);
  }
  updatePower(dt);
  heroShoot(dt);
  for (const tower of S.towers) if (!tower.destroyed) towerFire(tower, dt);
  updateShots(dt);
  S.towers = S.towers.filter(t => !t.destroyed || t.hp > -300);
  if ((S.heroType === 'engineer' || S.hero2Type === 'engineer') && !S.waveActive && S.enemies.length === 0) {
    S.repairClock += dt;
    if (S.repairClock >= 1.1) { S.repairClock = 0; S.coreHp = Math.min(CORE.maxHp, S.coreHp + 3); }
  }
}
