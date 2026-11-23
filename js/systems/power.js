import { TOWERS } from '../config.js';
import { S } from '../state.js';
import { dist } from '../utils.js';
import { shopMul } from './shop.js';

export function updatePower(dt) {
  const generators = S.towers.filter(t => t.type === 'generator' && !t.destroyed && !t.disabled);
  const mods = S.relicMods || {};
  const challenge = S.challenge?.mods || {};
  S.maxEnergy = 80 + generators.reduce((sum, tower) => sum + TOWERS.generator.storage * (1 + (tower.level - 1) * .28) * (tower.evo?.store || 1), 0);
  S.energyGeneration = (1.25 * (challenge.generation || 1) + generators.reduce((sum, tower) => sum + TOWERS.generator.output * (1 + (tower.level - 1) * .32) * (tower.evo?.gen || 1), 0) * (challenge.generatorOutput || 1)) * (mods.generatorOutput || 1);
  S.energyGeneration *= shopMul('gen');
  S.energy = Math.min(S.maxEnergy, S.energy + S.energyGeneration * dt);
  S.energyUse = 0;
  const bossActive = S.enemies.some(enemy => enemy.boss && !enemy.dead);
  S.manualRechargeClock = Math.max(0, (S.manualRechargeClock || 0) - dt);
  // Cada torreta tiene su batería: los generadores cercanos la recargan y el operador también (mantené R cerca).
  const heroes = [S.hero, S.coop ? S.hero2 : null].filter(h => h && h.hp > 0);
  for (const t of S.towers) {
    if (t.destroyed || t.type === 'generator' || t.type === 'shieldwall') {
      if (t.type === 'shieldwall' && !t.destroyed) { t.charge = 1; t.maxCharge = 1; t.disabled = 0; }
      continue;
    }
    t.maxCharge = 30 * shopMul('battery') * (1 + (t.level - 1) * .25) * (t.evo?.charge || 1); if (t.evo?.regen) t.charge = Math.min(t.maxCharge, (t.charge ?? 0) + t.evo.regen * dt); if (t.charge == null) t.charge = t.maxCharge;
    t.charge = Math.min(t.charge, t.maxCharge); t.recharging = Math.max(0, (t.recharging || 0) - dt);
    const feed = (rate) => { const amt = Math.min(rate * dt, S.energy, t.maxCharge - t.charge); if (amt > 0) { t.charge += amt; S.energy -= amt; return true; } return false; };
    if (bossActive && t.charge < t.maxCharge) {
      t.charge = Math.min(t.maxCharge, t.charge + 3.8 * dt * (1 + (t.level - 1) * .18));
    }
    for (const g of generators) if (dist(g, t) < 260 && t.charge < t.maxCharge) feed(TOWERS.generator.output * .45);
    const nearby = heroes.some(h => dist(h, t) < 190);
    if (nearby && (S.keys.has('r') || S.manualRechargeClock > 0)) {
      t.charge = Math.min(t.maxCharge, t.charge + 58 * dt);
      t.recharging = .35;
    }
  }
}

export function consumeEnergy(tower, amount) {
  const cost = amount * 2.2 * (S.relicMods.energyUse || 1) * (S.challenge?.mods?.energyUse || 1);
  if (tower.charge == null || tower.charge + 1e-6 < cost) return false;
  tower.charge -= cost;
  S.energyUse += cost;
  return true;
}
