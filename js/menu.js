import { RELICS } from './config.js';
import { exportRecordsText, importRecordsText, renderRecords } from './systems/records.js';
import { decodeMapCode, encodeMapCode, getDailyChallenge, renderCampaignMenu } from './systems/campaign.js';

export function bindMenu(onStart) {
  const start = () => {
    const mapSelect = document.querySelector('#map-select');
    const transferSeed = decodeMapCode(document.querySelector('#seed-input').value, Number(mapSelect.value) || 0);
    const mapIndex = transferSeed.isCode ? transferSeed.mapIndex : Number(mapSelect.value) || 0;
    const available = [...mapSelect.options].find(option => Number(option.value) === mapIndex);
    if (!available || available.disabled) {
      document.querySelector('#seed-status').textContent = 'Ese sector todavía está bloqueado en esta partida.';
      return;
    }
    let seedText = transferSeed.seedText || Math.random().toString(36).slice(2, 10).toUpperCase();
    document.querySelector('#seed-input').value = encodeMapCode(mapIndex, seedText);
    mapSelect.value = String(mapIndex);
    const challengeId = document.querySelector('#challenge-toggle').checked ? getDailyChallenge().id : 'none';
    onStart({
      mapIndex,
      heroType: document.querySelector('#hero-select').value || 'vanguard',
      hero2Type: document.querySelector('#hero2-select').value || 'ranger',
      coop: document.querySelector('#coop-toggle').checked,
      relicId: document.querySelector('#relic-select').value || 'stormglass',
      seedText, challengeId
    });
  };
  document.querySelector('#start-button').addEventListener('click', start);
  document.querySelector('#retry-button').addEventListener('click', start);
  const coopToggle = document.querySelector('#coop-toggle');
  coopToggle.addEventListener('change', () => { document.querySelector('#coop-config').hidden = !coopToggle.checked; });
  document.querySelector('#relic-select').addEventListener('change', event => {
    document.querySelector('#relic-description').textContent = RELICS[event.target.value]?.description || '';
  });
  document.querySelector('#copy-seed').addEventListener('click', async () => {
    const select = document.querySelector('#map-select'), field = document.querySelector('#seed-input');
    const parsed = decodeMapCode(field.value, Number(select.value) || 0);
    const seedText = parsed.seedText || Math.random().toString(36).slice(2, 10).toUpperCase();
    const code = encodeMapCode(parsed.isCode ? parsed.mapIndex : Number(select.value) || 0, seedText);
    field.value = code;
    try { await navigator.clipboard.writeText(code); document.querySelector('#seed-status').textContent = 'Código copiado. Compartilo para repetir este terreno.'; }
    catch { field.focus(); field.select(); document.querySelector('#seed-status').textContent = 'Código listo: copialo y compartilo.'; }
  });
  document.querySelector('#export-records').addEventListener('click', async () => {
    const text = exportRecordsText(), area = document.querySelector('#records-transfer'); area.value = text;
    try { await navigator.clipboard.writeText(text); document.querySelector('#transfer-status').textContent = 'Récords copiados. Ya podés compartirlos.'; }
    catch { area.focus(); area.select(); document.querySelector('#transfer-status').textContent = 'Datos listos: copialos para compartir.'; }
  });
  document.querySelector('#import-records').addEventListener('click', () => {
    try {
      const count = importRecordsText(document.querySelector('#records-transfer').value);
      renderCampaignMenu(); renderRecords();
      document.querySelector('#transfer-status').textContent = `Importación lista · ${count} récords guardados.`;
    } catch (error) { document.querySelector('#transfer-status').textContent = error.message || 'No se pudieron importar los datos.'; }
  });
  for (const selector of ['#map-select', '#hero-select']) document.querySelector(selector).addEventListener('change', renderRecords);
  renderCampaignMenu();
  renderRecords();
}
