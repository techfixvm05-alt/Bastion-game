import { S } from '../state.js';
import { nearest } from '../utils.js';

export function updateRelics(dt) {
  for (const drone of S.supportDrones) {
    drone.life -= dt; drone.cooldown -= dt; drone.angle += dt * 1.8;
    if (!drone.owner || drone.owner.hp <= 0) drone.owner = [S.hero, S.hero2].find(hero => hero && hero.hp > 0) || null;
    if (!drone.owner) continue;
    drone.x = drone.owner.x + Math.cos(drone.angle) * 48;
    drone.y = drone.owner.y + Math.sin(drone.angle) * 48;
    if (drone.cooldown > 0) continue;
    const target = nearest(S.enemies.filter(enemy => !enemy.dead && enemy.hp > 0), drone, 650);
    if (!target) continue;
    const dx = target.x - drone.x, dy = target.y - drone.y, length = Math.hypot(dx, dy) || 1;
    S.shots.push({ x: drone.x, y: drone.y, vx: dx / length * 790, vy: dy / length * 790, target, damage: drone.owner.damage * .48,
      color: '#a4f2d3', radius: 5, age: 0, life: 1.4, source: 'drone', hits: new Set(), bounces: 0, pierce: 0, chained: false });
    drone.cooldown = .82;
  }
  S.supportDrones = S.supportDrones.filter(drone => drone.life > 0);
}
