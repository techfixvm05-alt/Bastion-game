import { SEE, WORLD } from '../config.js';
import { updateDrops } from './drops.js';
import { S, finishRun } from '../state.js';
import { clamp, dist } from '../utils.js';
import { updateWaves } from './waves.js';
import { updateCombat } from './combat.js';
import { updateEnemies } from './enemies.js';
import { updateBosses } from './bosses.js';
import { updateWorldEvents } from './worldEvents.js';
import { updateObjectives } from './objectives.js';
import { updateRelics } from './relics.js';

function moveOperator(h, dt, p2 = false) {
  if (!h || h.hp <= 0) return;
  const k = S.keys;
  let dx = p2 ? (k.has('arrowright') ? 1 : 0) - (k.has('arrowleft') ? 1 : 0) : (k.has('d') ? 1 : 0) - (k.has('a') ? 1 : 0);
  let dy = p2 ? (k.has('arrowdown') ? 1 : 0) - (k.has('arrowup') ? 1 : 0) : (k.has('s') ? 1 : 0) - (k.has('w') ? 1 : 0);
  if (!S.coop && !p2) {
    dx += (k.has('arrowright') ? 1 : 0) - (k.has('arrowleft') ? 1 : 0);
    dy += (k.has('arrowdown') ? 1 : 0) - (k.has('arrowup') ? 1 : 0);
  }
  if (dx !== 0 || dy !== 0) h.aim = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy) || 1;
  const speed = h.speed * (h.abilityActive > 0 && h.type === 'ranger' ? 1.8 : 1);
  h.x = clamp(h.x + dx / length * speed * dt, 28, WORLD.width - 28);
  h.y = clamp(h.y + dy / length * speed * dt, 28, WORLD.height - 28);
  for (const [x, y, w, height] of S.map.obstacles) {
    if (h.x > x - 20 && h.x < x + w + 20 && h.y > y - 20 && h.y < y + height + 20) {
      if (Math.abs(dx) > Math.abs(dy)) h.x = dx > 0 ? x - 21 : x + w + 21;
      else h.y = dy > 0 ? y - 21 : y + height + 21;
    }
  }
}

function updateHero(dt) { moveOperator(S.hero, dt); if (S.coop) moveOperator(S.hero2, dt, true); }

function updateCamera() {
  const targetX = S.coop && S.hero2 ? (S.hero.x + S.hero2.x) / 2 : S.hero.x;
  const targetY = S.coop && S.hero2 ? (S.hero.y + S.hero2.y) / 2 : S.hero.y;
  S.camera.x = clamp(targetX - SEE.width / 2, 0, WORLD.width - SEE.width);
  S.camera.y = clamp(targetY - SEE.height / 2, 0, WORLD.height - SEE.height);
}

export function updateSimulation(dt) {
  if (S.phase !== 'playing' || S.shopOpen || S.storyOpen || S.mapOpen || S.tutorialOpen) return;
  updateHero(dt); updateDrops(dt); updateCamera();
  updateWorldEvents(dt);
  updateRelics(dt);
  updateCombat(dt);
  updateEnemies(dt);
  updateBosses(dt);
  updateObjectives(dt);
  updateWaves(dt);
  S.bannerClock = Math.max(0, S.bannerClock - dt);
  for (const effect of S.effects) { effect.age += dt; }
  S.effects = S.effects.filter(e => e.age < (e.life || 1));
  if (!S.won && S.modeId !== 'daily' && S.wave >= S.goalWave && !S.waveActive && !S.enemies.some(e => !e.dead && e.hp > 0)) { S.won = true; finishRun('Capítulo completado.'); return; }
  S.threat = S.wave + S.towers.filter(t => !t.destroyed).length * .4;
  if ((S.hero.hp <= 0 && (!S.hero2 || S.hero2.hp <= 0)) || S.coreHp <= 0) finishRun(S.coreHp <= 0 ? 'El núcleo fue consumido.' : 'El equipo cayó en combate.');
}
