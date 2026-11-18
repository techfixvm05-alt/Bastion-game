import { ENEMIES } from '../config.js';
import { S } from '../state.js';
import { spawnEnemy } from './enemies.js';
import { bossForWave, spawnBoss } from './bosses.js';
import { choose, rand } from '../utils.js';

export function startWave() {
  if (S.phase !== 'playing' || S.waveActive) return;
  S.wave++; S.waveActive = true; S.restClock = 0; S.bossSpawned = false;
  const boss = bossForWave(S.wave);
  const count = Math.min(82, Math.ceil((5 + S.wave * 2 + Math.floor(S.towers.length * 1.15) + (S.coop ? 4 : 0)) * (S.challenge?.mods?.waveCount || 1)));
  const pool = ['swarm'];
  if (S.wave >= 2) pool.push('runner');
  if (S.wave >= 3) pool.push('tank', 'split');
  if (S.wave >= 4) pool.push('ranged');
  if (S.wave >= 6) pool.push('healer');
  if (S.wave >= 8) pool.push('shield');
  if (S.wave >= 5) pool.push('flanker');
  if (S.wave >= 7) pool.push('saboteur', 'raider');
  S.queue = Array.from({ length: count }, (_, i) => ({ type: choose(pool), delay: i === 0 ? .6 : rand(.28, .72) }));
  if (boss) S.queue.splice(Math.max(2, Math.floor(count * .58)), 0, { type: 'boss', kind: boss, delay: 2.5 });
  S.spawnClock = .45;
  S.banner = boss ? `OLEADA ${S.wave} · AMENAZA DE JEFE` : `OLEADA ${S.wave}`; S.bannerClock = 2.7;
}

export function updateWaves(dt) {
  if (!S.waveActive && S.wave === 0) return;
  if (S.waveActive && S.queue.length) {
    S.spawnClock -= dt;
    if (S.spawnClock <= 0) {
      const item = S.queue.shift();
      if (item.type === 'boss') spawnBoss(item.kind);
      else spawnEnemy(item.type);
      S.spawnClock = item.delay;
    }
  }
  if (S.waveActive && S.queue.length === 0 && S.enemies.length === 0) {
    S.waveActive = false; S.restClock = 12;
    S.banner = `OLEADA ${S.wave} ELIMINADA`; S.bannerClock = 2.8;
    S.credits += (60 + S.wave * 10) * (S.challenge?.mods?.rewardCredits || 1);
  }
  if (!S.waveActive && S.wave > 0 && S.restClock > 0) {
    S.restClock -= dt;
    if (S.restClock <= 0) startWave();
  }
}
