import { S } from '../state.js';
import { dist, rand } from '../utils.js';

function announce(text) { S.banner = text; S.bannerClock = 3.2; }

function openFissure() {
  const route = S.environment.eventRoute;
  if (!route || route.points.length < 4) return;
  const insertAt = Math.max(2, Math.min(route.points.length - 2, Math.floor(route.points.length / 2)));
  const a = route.points[insertAt - 1], b = route.points[insertAt];
  const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy) || 1;
  const offset = (Math.random() < .5 ? -1 : 1) * 185;
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const p1 = { x: mid.x + dx / length * 65 - dy / length * offset, y: mid.y + dy / length * 65 + dx / length * offset };
  const p2 = { x: mid.x - dx / length * 65 - dy / length * offset, y: mid.y - dy / length * 65 + dx / length * offset };
  route.points.splice(insertAt, 0, p1, p2); route.fissures = (route.fissures || 0) + 1;
  for (const enemy of S.enemies) if (enemy.route === route && enemy.routeAt >= insertAt) enemy.routeAt += 2;
  S.fissureMarks.push({ x: mid.x, y: mid.y, angle: Math.atan2(dy, dx), age: 0, life: 5 });
  announce('FALLA TECTÓNICA · RUTA DESVIADA');
}

function startEvent() {
  const env = S.environment;
  const type = ['storm', 'fissure', 'toxic'][env.sequence % 3]; env.sequence++;
  env.type = type; env.phase = type === 'fissure' ? 'warning' : 'active';
  if (type === 'storm') {
    env.label = 'Tormenta de iones'; env.duration = 11 * (S.relicMods.stormDuration || 1); env.timer = env.duration;
    env.x = Math.max(500, Math.min(2300, 1400 + rand(-430, 430))); env.y = Math.max(360, Math.min(1540, 950 + rand(-380, 380)));
    env.radius = 730; env.wind = rand(-Math.PI, Math.PI);
    announce('TORMENTA DE IONES · LOS DISPAROS SE DESVÍAN');
  } else if (type === 'fissure') {
    env.label = 'Falla tectónica'; env.timer = 2.8;
    const routes = S.map.routes.filter(route => (route.fissures || 0) < 2);
    env.eventRoute = routes.length ? routes[Math.floor(Math.random() * routes.length)] : S.map.routes[Math.floor(Math.random() * S.map.routes.length)];
    announce('ALERTA SÍSMICA · RUTA INESTABLE');
  } else {
    env.label = 'Nube tóxica'; env.duration = 14 * (S.challenge?.mods?.toxicDuration || 1); env.timer = env.duration;
    const route = S.map.routes[Math.floor(Math.random() * S.map.routes.length)];
    const point = route.points[Math.min(route.points.length - 2, Math.max(1, Math.floor(route.points.length / 2)))];
    const life = 18 * (S.challenge?.mods?.toxicDuration || 1);
    S.toxicZones.push({ x: point.x + rand(-150, 150), y: point.y + rand(-150, 150), radius: 190, life, maxLife: life });
    if (S.toxicZones.length > 4) S.toxicZones.shift();
    announce('NUBE TÓXICA · EVITÁ LAS ZONAS VERDES');
  }
}

export function updateWorldEvents(dt) {
  const env = S.environment;
  if (env.phase === 'idle') {
    env.timer -= dt;
    if (env.timer <= 0) startEvent();
  } else {
    env.timer -= dt;
    if (env.phase === 'warning' && env.timer <= 0) {
      openFissure(); env.phase = 'active'; env.timer = 5.5;
    } else if (env.phase === 'active' && env.timer <= 0) {
      env.phase = 'idle'; env.type = 'clear'; env.label = 'Calma'; env.timer = rand(12, 18); env.eventRoute = null;
    }
  }
  for (const zone of S.toxicZones) {
    zone.life -= dt;
    const damage = S.challenge?.mods?.toxicDamage || 1;
    for (const hero of [S.hero, S.hero2]) if (hero?.hp > 0 && dist(hero, zone) < zone.radius) {
      if (S.relicMods.toxicAffinity) hero.hp = Math.min(hero.maxHp, hero.hp + 8 * S.relicMods.toxicAffinity * dt);
      else hero.hp -= 8 * damage * dt;
    }
    for (const tower of S.towers) if (!tower.destroyed && dist(tower, zone) < zone.radius) {
      tower.hp -= 5.5 * dt; if (tower.hp <= 0) tower.destroyed = true;
    }
    for (const enemy of S.enemies) if (!enemy.dead && dist(enemy, zone) < zone.radius) enemy.hp -= 7 * damage * (1 + (S.relicMods.toxicAffinity || 0)) * dt;
  }
  S.toxicZones = S.toxicZones.filter(zone => zone.life > 0);
  for (const mark of S.fissureMarks) mark.life -= dt;
  S.fissureMarks = S.fissureMarks.filter(mark => mark.life > 0);
}

export function deflectShot(shot, dt) {
  const env = S.environment;
  if (env.type !== 'storm' || env.phase !== 'active') return;
  if (dist(shot, env) > env.radius) return;
  const strength = 1 - dist(shot, env) / env.radius;
  const gust = 310 * strength * dt;
  shot.vx += Math.cos(env.wind) * gust;
  shot.vy += Math.sin(env.wind) * gust;
}

export function stormImpactOffset(point) {
  const env = S.environment;
  if (env.type !== 'storm' || env.phase !== 'active') return { x: 0, y: 0 };
  const strength = point ? Math.max(0, 1 - dist(point, env) / env.radius) : 1;
  return { x: Math.cos(env.wind) * 82 * strength, y: Math.sin(env.wind) * 82 * strength };
}
