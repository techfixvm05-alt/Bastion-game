import { S } from '../state.js';
import { HEROES, RELICS } from '../config.js';
import { CHALLENGES, getChallenge, recordCampaignProgress, normalizeSeed } from './campaign.js';

const KEY = 'bastion.records.v2';

export function readRecords() {
  try { return (JSON.parse(localStorage.getItem(KEY) || '[]') || []).map(normalizeRecord).filter(Boolean); }
  catch { return []; }
}

function normalizeRecord(row) {
  if (!row || !Number.isInteger(Number(row.mapIndex)) || Number(row.mapIndex) < 0 || Number(row.mapIndex) > 2) return null;
  const heroType = Object.hasOwn(HEROES, row.heroType) ? row.heroType : 'vanguard';
  const hero2Type = Object.hasOwn(HEROES, row.hero2Type) ? row.hero2Type : 'ranger';
  const challengeId = row.challengeId && getChallenge(row.challengeId) ? row.challengeId : 'none';
  const modeId = ['solo', 'coop', 'daily'].includes(row.modeId) ? row.modeId : row.coop ? 'coop' : challengeId !== 'none' ? 'daily' : 'solo';
  const dateText = String(row.date || '');
  return {
    mapIndex: Number(row.mapIndex), modeId, heroType, hero2Type, coop: !!row.coop,
    wave: Math.max(0, Math.min(9999, Math.floor(Number(row.wave) || 0))),
    kills: Math.max(0, Math.min(999999, Math.floor(Number(row.kills) || 0))),
    relic: row.relic === 'none' ? 'none' : Object.hasOwn(RELICS, row.relic) ? row.relic : 'none',
    challengeId, seedText: normalizeSeed(row.seedText),
    seconds: Math.max(0, Math.min(999999, Math.floor(Number(row.seconds) || 0))),
    date: /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateText) ? dateText : 'Importado',
    objectiveComplete: !!row.objectiveComplete
  };
}

export function saveCurrentRecord() {
  const run = {
    mapIndex: S.mapIndex, mapName: S.map.name, modeId: S.modeId, heroType: S.heroType, hero2Type: S.hero2Type, coop: S.coop,
    wave: S.wave, kills: S.kills, relic: S.relicId, challengeId: S.challengeId, seedText: S.seedText,
    towersBuilt: S.runStats.towersBuilt, generatorsBuilt: S.runStats.generatorsBuilt,
    manualKills: S.runStats.manualKills, bossKills: S.runStats.bossKills,
    objectiveComplete: !!S.objective?.complete, won: !!S.won,
    seconds: Math.max(0, Math.round((performance.now() - S.runStart) / 1000)),
    date: new Date().toLocaleDateString('es-AR')
  };
  recordCampaignProgress(run);
  const records = mergeRecords([...readRecords(), run]);
  try { localStorage.setItem(KEY, JSON.stringify(records)); } catch { /* Storage may be disabled; the run still ends normally. */ }
  return run;
}

function recordKey(record) { return [record.mapIndex, record.modeId, record.heroType, record.hero2Type, record.coop, record.wave, record.kills, record.seconds, record.seedText, record.challengeId].join('|'); }

function mergeRecords(records) {
  const unique = new Map();
  for (const input of records) { const record = normalizeRecord(input); if (record) unique.set(recordKey(record), record); }
  return [...unique.values()].sort((a, b) => b.wave - a.wave || b.kills - a.kills || a.seconds - b.seconds).slice(0, 100);
}

export function exportRecordsText() {
  return JSON.stringify({ app: 'Bastion', version: 1, exportedAt: new Date().toISOString(), records: readRecords() }, null, 2);
}

export function importRecordsText(text) {
  if (String(text).length > 1_000_000) throw new Error('El archivo supera el límite de 1 MB.');
  const parsed = JSON.parse(text);
  const incoming = Array.isArray(parsed) ? parsed : parsed?.app === 'Bastion' && Array.isArray(parsed.records) ? parsed.records : null;
  if (!incoming) throw new Error('No reconozco este archivo de récords de Bastión.');
  // Imported records are shareable history; only a completed local run unlocks campaign content.
  const records = mergeRecords([...readRecords(), ...incoming]);
  try { localStorage.setItem(KEY, JSON.stringify(records)); } catch { throw new Error('El navegador no permite guardar los récords importados.'); }
  return records.length;
}

export function renderRecords() {
  const holder = document.getElementById('record-list');
  if (!holder) return;
  const mapIndex = Number(document.getElementById('map-select')?.value || 0);
  const heroType = document.getElementById('hero-select')?.value || 'vanguard';
  const records = readRecords().filter(r => r.mapIndex === mapIndex && r.heroType === heroType).slice(0, 5);
  if (!records.length) {
    holder.innerHTML = '<div class="record-empty">Todavía no hay registros para este sector y operador.</div>';
    return;
  }
  holder.innerHTML = records.map((record, i) => {
    const crew = record.coop ? `${HEROES[record.heroType]?.name || 'Operador'} + ${HEROES[record.hero2Type]?.name || 'Operador 2'} · CO-OP` : `${HEROES[record.heroType]?.name || 'Operador'} · SOLO`;
    const challenge = CHALLENGES.find(item => item.id === record.challengeId)?.name || 'Normal';
    const code = record.seedText ? ` · BASTION:${record.mapIndex}:${record.seedText}` : '';
    return `<div class="record-row"><span class="record-rank">${String(i + 1).padStart(2, '0')}</span><b>OLEADA ${record.wave}</b><span>${record.kills} bajas</span><small>${crew} · ${challenge} · ${record.date}${code}</small></div>`;
  }).join('');
}
