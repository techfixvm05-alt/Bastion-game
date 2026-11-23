import { S, startRun } from './state.js';
import { bindMenu, renderRelicCards } from './menu.js';
import { bindUI, renderUI, showGame } from './ui.js';
import { bindInput } from './input.js';
import { updateSimulation } from './systems/simulation.js';
import { render } from './render/renderer.js';
import { startWave } from './systems/waves.js';
import { saveCurrentRecord, renderRecords } from './systems/records.js';
import { renderCampaignMenu } from './systems/campaign.js';

const canvas = document.getElementById('game-canvas');
let lastUi = 0;

function launch(settings) {
  startRun(settings); showGame(); renderUI();
}

bindMenu(launch);
bindUI({ onBack: renderRecords, onMode: renderUI });
bindInput(canvas, { onMode: renderUI, onWave: startWave, onBuild: renderUI, onSelection: renderUI });

function frame(time) {
  const dt = Math.min(.04, (time - (S.lastTime || time)) / 1000 || 0);
  S.lastTime = time;
  updateSimulation(dt);
  if (S.phase === 'over' && !S.recordSaved) { saveCurrentRecord(); S.recordSaved = true; renderCampaignMenu(); renderRelicCards(); renderRecords(); renderUI(); }
  render(canvas);
  if (time - lastUi > 110) { renderUI(); lastUi = time; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
