import { S } from './state.js';
import { STORY, SPEAKERS } from './lore.js';
import { getChapter } from './systems/campaign.js';

let box, radio, queue = [], done = null, timer = null, full = '', node = null, radioTimer = null;
function ensure() {
  if (box) return;
  box = document.createElement('div'); box.className = 'story-overlay'; box.hidden = true; document.body.appendChild(box);
  radio = document.createElement('div'); radio.className = 'story-radio'; radio.hidden = true; document.body.appendChild(radio);
  box.addEventListener('click', e => { if (e.target.closest('[data-skip]')) { queue = []; finish(); } else next(); });
  window.addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); next(); }
    else if (e.key === 'Escape') { e.stopImmediatePropagation(); queue = []; finish(); }
  }, true);
}
function finish() { clearInterval(timer); timer = null; box.hidden = true; S.storyOpen = false; const cb = done; done = null; cb?.(); }
function next() {
  if (timer) { clearInterval(timer); timer = null; node.textContent = full; return; }
  if (!queue.length) return finish();
  const line = queue.shift(), color = SPEAKERS[line.who] || '#e8f1ea';
  full = line.text; box.innerHTML = `<div class="story-card" style="--who:${color}"><span class="story-who">${line.who}</span><p class="story-text"></p><div class="story-foot"><small>CLICK / ESPACIO · continuar</small><button type="button" data-skip>SALTAR</button></div></div>`;
  node = box.querySelector('.story-text'); let i = 0; node.textContent = '';
  timer = setInterval(() => { node.textContent = full.slice(0, ++i); if (i >= full.length) { clearInterval(timer); timer = null; } }, 18);
}
export function showDialogue(lines, cb) {
  ensure(); if (!lines?.length) { cb?.(); return; }
  queue = [...lines]; done = cb || null; S.storyOpen = true; box.hidden = false; next();
}
export function showRadio(line) {
  ensure(); radio.hidden = false; radio.style.setProperty('--who', SPEAKERS[line.who] || '#e8f1ea'); radio.innerHTML = `<b>${line.who}</b> ${line.text}`;
  clearTimeout(radioTimer); radioTimer = setTimeout(() => { radio.hidden = true; }, 7500);
}
export function beginChapter() {
  if (S.modeId === 'daily') return;
  const ch = getChapter(S.mapIndex), st = STORY[S.mapIndex];
  showDialogue([{ who: 'TRANSMISIÓN', text: `${ch.act} · ${ch.title}. Objetivo: resistir ${S.goalWave} oleadas.` }, ...(st?.intro || [])]);
}
export function endChapter() { if (S.won) showDialogue([{ who: 'TRANSMISIÓN', text: getChapter(S.mapIndex).victory }, ...(STORY[S.mapIndex]?.outro || [])]); }
export function updateStory() {
  if (S.phase !== 'playing' || S.modeId === 'daily' || S.storyWave === S.wave) return;
  S.storyWave = S.wave; const beat = STORY[S.mapIndex]?.beats?.[S.wave]; if (beat) showRadio(beat);
}
