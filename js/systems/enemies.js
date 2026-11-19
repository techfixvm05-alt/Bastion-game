import { comboBonus, onKill } from './drops.js';
import { ENEMIES, CORE, TOWERS, WORLD } from '../config.js';
import { S, finishRun } from '../state.js';
import { clamp, dist, nearest, rand } from '../utils.js';
import { cue } from '../audio.js';

function sampleRoute(route) {
  const samples = [];
  for (let i = 1; i < route.points.length; i++) {
    const a = route.points[i - 1], b = route.points[i], length = dist(a, b);
    const steps = Math.max(1, Math.ceil(length / 130));
    for (let step = 0; step < steps; step++) {
      const t = step / steps;
      samples.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  samples.push(route.points.at(-1));
  return samples;
}

function routeTactics(route) {
  const samples = sampleRoute(route), towers = S.towers.filter(t => !t.destroyed);
  const objective = S.objective;
  const targets = objective?.kind === 'stabilize'
    ? [objective.sites?.[objective.current]].filter(Boolean)
    : objective?.sites ? objective.sites.filter(site => (site.hp == null || site.hp > 0) && !site.complete)
    : objective && Number.isFinite(objective.x) ? [objective] : [];
  let defense = 0, generators = 0, objectiveReach = 0, length = 0;
  for (let i = 1; i < route.points.length; i++) length += dist(route.points[i - 1], route.points[i]);
  for (const point of samples) {
    for (const tower of towers) {
      const distance = dist(point, tower);
      if (tower.type === 'generator') generators += Math.max(0, 1 - distance / 260);
      else {
        const range = TOWERS[tower.type]?.range || 280;
        defense += Math.max(0, 1 - distance / (range + 90));
      }
    }
    if (targets.length) {
      const distance = Math.min(...targets.map(target => dist(point, target)));
      objectiveReach += Math.max(0, 1 - distance / 330);
    }
  }
  const scale = 1 / Math.max(1, samples.length);
  return { defense: defense * scale, generators: generators * scale, objective: objectiveReach * scale, length };
}

function chooseEnemyRoute(type) {
  const routes = S.map.routes;
  if (routes.length < 2 || !['runner', 'tank', 'flanker', 'saboteur', 'raider'].includes(type)) return routes[Math.floor(Math.random() * routes.length)];
  const scored = routes.map(route => {
    const metrics = routeTactics(route);
    let score = 0;
    if (type === 'runner') score = -metrics.length / WORLD.width;
    else if (type === 'tank') score = metrics.defense * 1.25;
    else if (type === 'flanker') score = -metrics.defense + metrics.length / (WORLD.width * 12);
    else if (type === 'saboteur') score = metrics.generators * 1.6 + metrics.defense * .18;
    else score = metrics.objective * 1.5 + metrics.length / (WORLD.width * 16);
    return { route, score };
  }).sort((a, b) => b.score - a.score || a.route.id - b.route.id);
  const best = scored[0].score;
  const ties = scored.filter(entry => Math.abs(entry.score - best) < .025);
  return ties[S.id % ties.length].route;
}

function nearbySabotageTarget(enemy) {
  const towers = S.towers.filter(t => !t.destroyed);
  return nearest(towers.filter(t => t.type === 'generator'), enemy, 88)
    || nearest(towers.filter(t => t.type !== 'generator'), enemy, 66);
}

export function spawnEnemy(type, routeIndex = null, bossData = null) {
  const base = bossData || ENEMIES[type];
  if (!base || !S.map?.routes.length) return null;
  const route = routeIndex == null ? chooseEnemyRoute(type) : S.map.routes[routeIndex % S.map.routes.length];
  const towerPressure = S.towers.length;
  const challenge = S.challenge?.mods || {};
  const coopScale = S.coop ? 1.18 : 1;
  const waveHp = (1 + S.wave * .115 + towerPressure * .055) * coopScale * (challenge.enemyHp || 1);
  const e = {
    id: ++S.id, type, route, routeAt: 0, x: route.points[0].x, y: route.points[0].y,
    hp: base.hp * waveHp, maxHp: base.hp * waveHp, speed: base.speed * (type === 'flanker' ? 1.16 : 1) * (1 + Math.min(.48, S.wave * .008)) * (challenge.enemySpeed || 1),
    damage: (base.damage || 15) * (1 + S.wave * .045 + towerPressure * .025) * (S.coop ? 1.1 : 1) * (challenge.enemyDamage || 1), radius: base.radius || 15,
    reward: base.reward || 12, armor: base.armor || 0, color: base.color, bossKind: bossData?.bossKind || null,
    boss: !!bossData, cooldown: rand(.6, 2.4), attackClock: rand(.7, 1.5), shield: 0, burn: 0,
    slow: 0, expose: 0, stun: 0, anim: rand(0, 6), phase: 0, routeAdded: false,
    attackTarget: null, hitFlash: 0, pulse: rand(0, 10),
    routeStrategy: ({ flanker: 'flanco débil', saboteur: 'red eléctrica', raider: 'objetivo del sector' })[type] || 'avance'
  };
  S.enemies.push(e);
  return e;
}

export function killEnemy(enemy) {
  if (enemy.dead) return;
  enemy.dead = true; S.kills++; S.credits += enemy.reward * (S.relicMods.killCredits || 1) * (S.challenge?.mods?.rewardCredits || 1) * (1 + comboBonus());
  onKill(enemy);
  if (enemy.manualHit) S.runStats.manualKills++;
  if (enemy.boss) S.runStats.bossKills++;
  S.effects.push({ type: 'burst', x: enemy.x, y: enemy.y, age: 0, life: .48, color: enemy.color, radius: enemy.radius * 1.5 });
  if (S.relicMods.droneKills) {
    S.relicKills++;
    if (S.relicKills >= S.relicMods.droneKills) {
      S.relicKills = 0;
      const owner = [S.hero, S.hero2].find(hero => hero && hero.hp > 0) || S.hero;
      S.supportDrones.push({ owner, life: 12, cooldown: .3, angle: Math.random() * Math.PI * 2, x: owner.x, y: owner.y });
      S.banner = 'DRON DE ESCOLTA DESPLEGADO'; S.bannerClock = 2.2;
    }
  }
  if (enemy.type === 'split' && !enemy.boss) {
    for (let n = 0; n < 2; n++) {
      const child = spawnEnemy('swarm', enemy.route.id);
      if (child) { child.x = enemy.x + rand(-18, 18); child.y = enemy.y + rand(-18, 18); child.routeAt = enemy.routeAt; }
    }
  }
}

function enemyAttack(e, dt) {
  if (e.attackClock > 0) return;
  const liveTowers = S.towers.filter(t => !t.destroyed);
  const shield = nearest(liveTowers.filter(t => t.type === 'shieldwall'), e, 82);
  const tower = e.type === 'saboteur' ? nearbySabotageTarget(e)
    : shield || nearest(liveTowers, e, e.boss ? 200 : e.type === 'tank' ? 105 : 62);
  if (tower) {
    tower.hp -= e.damage * dt * (e.boss ? 1.5 : e.type === 'tank' ? 1.9 : e.type === 'saboteur' ? 2.35 : 1);
    tower.hitFlash = .15;
    if (e.type === 'saboteur') S.effects.push({ type: 'jam', x: tower.x, y: tower.y, age: 0, life: .35, color: '#d8cf69', radius: 30 });
    if (tower.hp <= 0) {
      tower.destroyed = true;
      S.effects.push({ type: 'burst', x: tower.x, y: tower.y, age: 0, life: .7, color: '#ff795f', radius: 44 });
    }
    e.attackClock = e.boss ? .45 : e.type === 'saboteur' ? .95 : .75;
  } else if (e.type === 'ranged') {
    const heroes = [S.hero, S.hero2].filter(h => h && h.hp > 0);
    const target = nearest(S.towers.filter(t => !t.destroyed), e, 580) || nearest(heroes, e, 580) || heroes[0] || S.hero;
    S.enemyShots.push({ x: e.x, y: e.y, target, speed: 250, damage: e.damage * .62, radius: 6, color: '#d980d9', age: 0, life: 3 });
    e.attackClock = 2.5;
  } else if (e.type === 'healer') {
    const ally = nearest(S.enemies.filter(other => other !== e && !other.dead && other.hp < other.maxHp * .85), e, 220);
    if (ally) { ally.hp = Math.min(ally.maxHp, ally.hp + 90); S.effects.push({ type: 'heal', x: ally.x, y: ally.y, age: 0, life: .45, color: '#83d17e', radius: 35 }); }
    e.attackClock = 2.2;
  } else if (e.boss) {
    S.coreHp -= e.damage * .035;
    e.attackClock = .8;
  } else {
    S.coreHp -= e.damage;
    e.attackClock = 1;
  }
}

function moveOnRoute(e, dt) {
  let target = e.route.points[e.routeAt + 1];
  const shield = nearest(S.towers.filter(t => !t.destroyed && t.type === 'shieldwall'), e, 58);
  if (shield) { enemyAttack(e, dt); return; }
  if (!target) { enemyAttack(e, dt); return; }
  if (e.type === 'saboteur' && nearbySabotageTarget(e)) { enemyAttack(e, dt); return; }
  const slowed = e.slow > 0 ? .48 : 1;
  const dx = target.x - e.x, dy = target.y - e.y;
  const d = Math.hypot(dx, dy) || 1;
  const step = e.speed * slowed * (e.stun > 0 ? .12 : 1) * dt;
  if (d <= step + 5) {
    e.x = target.x; e.y = target.y; e.routeAt++;
    if (e.routeAt >= e.route.points.length - 1) { enemyAttack(e, dt); }
  } else {
    e.x += dx / d * step; e.y += dy / d * step;
  }
}

export function updateEnemies(dt) {
  for (const e of S.enemies) {
    if (e.dead) continue;
    e.anim += dt; e.attackClock -= dt; e.slow = Math.max(0, e.slow - dt); e.expose = Math.max(0, e.expose - dt);
    e.stun = Math.max(0, e.stun - dt); e.hitFlash = Math.max(0, e.hitFlash - dt);
    if (e.burn > 0) { e.burn -= dt; e.hp -= 16 * dt; }
    if (!e.dead) moveOnRoute(e, dt);
  }
  for (const e of S.enemies) if (!e.dead && e.hp <= 0) killEnemy(e);
  S.enemies = S.enemies.filter(e => !e.dead);
  for (const shot of S.enemyShots) {
    shot.age += dt;
    if (shot.target?.destroyed || shot.target?.hp <= 0) shot.target = nearest([S.hero, S.hero2].filter(h => h && h.hp > 0), shot, Infinity) || S.hero;
    const target = shot.target || S.hero, dx = target.x - shot.x, dy = target.y - shot.y, d = Math.hypot(dx, dy) || 1;
    shot.x += dx / d * shot.speed * dt; shot.y += dy / d * shot.speed * dt;
    if (d < shot.speed * dt + (target.radius || 14)) {
      target.hp -= shot.damage * (target.type === 'vanguard' && target.abilityActive > 0 ? .35 : 1);
      cue('hit');
      shot.dead = true;
    }
    if (shot.age > shot.life || shot.x < 0 || shot.x > WORLD.width || shot.y < 0 || shot.y > WORLD.height) shot.dead = true;
  }
  S.enemyShots = S.enemyShots.filter(s => !s.dead);
  if (S.coreHp <= 0) finishRun('El núcleo fue consumido.');
  if (S.hero.hp <= 0 && (!S.hero2 || S.hero2.hp <= 0)) finishRun('El operador cayó en combate.');
}
