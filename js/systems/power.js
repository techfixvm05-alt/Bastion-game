import { TOWERS } from '../config.js';
import { S } from '../state.js';

export function updatePower(dt) {
  const generators = S.towers.filter(t => t.type === 'generator' && !t.destroyed && !t.disabled);
  const mods = S.relicMods || {};
  const challenge = S.challenge?.mods || {};
  S.maxEnergy = 80 + generators.reduce((sum, tower) => sum + TOWERS.generator.storage * (1 + (tower.level - 1) * .28), 0);
  S.energyGeneration = (1.25 * (challenge.generation || 1) + generators.reduce((sum, tower) => sum + TOWERS.generator.output * (1 + (tower.level - 1) * .32), 0) * (challenge.generatorOutput || 1)) * (mods.generatorOutput || 1);
  S.energy = Math.min(S.maxEnergy, S.energy + S.energyGeneration * dt);
  S.energyUse = 0;
}

export function consumeEnergy(amount) {
  const cost = amount * (S.relicMods.energyUse || 1) * (S.challenge?.mods?.energyUse || 1);
  if (S.energy + 1e-6 < cost) return false;
  S.energy -= cost;
  S.energyUse += cost;
  return true;
}
