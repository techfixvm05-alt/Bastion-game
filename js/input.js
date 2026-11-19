import { S } from './state.js';
import { TOWERS } from './config.js';
import { placeTower, setFireMode, triggerHeroAbility } from './systems/combat.js';
import { dist } from './utils.js';
import { ZOOM } from './config.js';
import { toggleShop } from './systems/shop.js';

function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * canvas.width / rect.width / ZOOM, y: (event.clientY - rect.top) * canvas.height / rect.height / ZOOM };
}

export function bindInput(canvas, callbacks = {}) {
  window.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if (['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright',' '].includes(key)) event.preventDefault();
    S.keys.add(key);
    if (key === 'f' && S.phase === 'playing') { setFireMode(); callbacks.onMode?.(); }
    if (key === ' ' && S.phase === 'playing') callbacks.onWave?.();
    if (key === 'q' && S.phase === 'playing') triggerHeroAbility(S.hero);
    if (key === 'shift' && S.coop && S.phase === 'playing') triggerHeroAbility(S.hero2);
    if (key === 'r' && S.phase === 'playing') S.manualRechargeClock = 1.0;
    if (key === 'b') toggleShop();
    if (key === 'escape' && S.shopOpen) toggleShop(false);
    if (key === 'escape') { S.buildType = null; S.selectedTower = null; }
  });
  window.addEventListener('keyup', event => S.keys.delete(event.key.toLowerCase()));
  canvas.addEventListener('pointermove', event => { const point = canvasPoint(canvas, event); S.pointer = { ...S.pointer, ...point }; S.pointer2 = { ...S.pointer2, ...point }; });
  canvas.addEventListener('pointerdown', event => {
    if (S.phase !== 'playing') return;
    const point = canvasPoint(canvas, event);
    if (event.button === 2) { if (S.coop) { S.pointer2 = { ...S.pointer2, ...point, down: true }; event.preventDefault(); } return; }
    if (event.button !== 0) return;
    S.pointer = { ...S.pointer, ...point, down: true };
    const world = { x: point.x + S.camera.x, y: point.y + S.camera.y };
    const tower = [...S.towers].reverse().find(t => !t.destroyed && dist(t, world) < 34);
    if (tower) { S.selectedTower = tower.id; S.buildType = null; S.pointer.down = false; callbacks.onSelection?.(); return; }
    if (S.buildType && TOWERS[S.buildType]) {
      const result = placeTower(S.buildType, world.x, world.y);
      callbacks.onBuild?.(result); S.pointer.down = false;
    }
  });
  window.addEventListener('pointerup', event => { if (event.button === 0) S.pointer.down = false; if (event.button === 2) S.pointer2.down = false; });
  canvas.addEventListener('contextmenu', event => { event.preventDefault(); });
}
