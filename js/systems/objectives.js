import { S } from '../state.js';
import { dist } from '../utils.js';

function operators() { return [S.hero, S.hero2].filter(h => h && h.hp > 0); }
function rewardObjective(objective) {
  if (S.objectiveClaimed) return;
  S.objectiveClaimed = true; S.credits += objective.reward || 0;
  S.banner = `OBJETIVO COMPLETADO · +${objective.reward || 0} CHATARRA`; S.bannerClock = 3.5;
}

export function updateObjectives(dt) {
  const o = S.objective; if (!o || o.complete || o.failed) return;
  const operator = operators().find(h => S.keys.has('e') && dist(h, o.kind === 'evacuate' ? o : o.sites?.[o.current || 0]) < (o.radius || 110));
  if (o.kind === 'evacuate') {
    const contested = S.enemies.some(e => !e.dead && dist(e, o) < 140);
    if (operator && !contested) o.progress = Math.min(o.duration, o.progress + dt);
    else o.progress = Math.max(0, o.progress - dt * .2);
    if (o.progress >= o.duration) { o.complete = true; rewardObjective(o); }
  } else if (o.kind === 'stabilize') {
    const site = o.sites[o.current];
    const raiderPressure = site && S.enemies.some(enemy => !enemy.dead && enemy.type === 'raider' && dist(enemy, site) < (site.radius || 110));
    if (site && operator && !raiderPressure) o.progress += dt;
    else o.progress = Math.max(0, o.progress - dt * (raiderPressure ? 1.1 : .35));
    if (site && o.progress >= o.duration) {
      site.complete = true; o.current++; o.progress = 0;
      S.credits += 70; S.banner = `${site.name.toUpperCase()} ESTABILIZADA · +70`; S.bannerClock = 2.6;
      if (o.current >= o.sites.length) { o.complete = true; S.credits += o.reward; S.objectiveClaimed = true; }
    }
  } else if (o.kind === 'relays') {
    for (const site of o.sites) {
      if (site.hp <= 0) { site.hp = 0; o.failed = true; S.banner = 'NÚCLEO AUXILIAR PERDIDO'; S.bannerClock = 4; break; }
      for (const enemy of S.enemies) {
        if (enemy.dead || dist(enemy, site) > site.radius) continue;
        enemy.objectiveClock = (enemy.objectiveClock || 0) - dt;
        if (enemy.objectiveClock <= 0) { site.hp -= enemy.damage * .85; enemy.objectiveClock = 1.15; }
      }
      const repairer = operators().find(h => S.keys.has('e') && dist(h, site) < site.radius);
      if (repairer) site.hp = Math.min(site.maxHp, site.hp + 24 * dt);
    }
    if (!o.failed && S.wave >= 8 && !S.waveActive && o.sites.every(site => site.hp > 0)) { o.complete = true; rewardObjective(o); }
  }
}

export function objectiveStatus() {
  const o = S.objective;
  if (!o) return { title: 'Sin objetivo', detail: '—', progress: 0 };
  if (o.complete) return { title: o.name, detail: 'COMPLETADO', progress: 100 };
  if (o.failed) return { title: o.name, detail: 'FALLIDO · sin recompensa', progress: 0 };
  if (o.kind === 'evacuate') return { title: o.name, detail: 'Mantené E en la estación', progress: o.progress / o.duration * 100 };
  if (o.kind === 'stabilize') return { title: o.name, detail: `${Math.min(o.current + 1, o.sites.length)} / ${o.sites.length} · E para activar`, progress: ((o.current + o.progress / o.duration) / o.sites.length) * 100 };
  const alive = o.sites.filter(site => site.hp > 0).length;
  const average = o.sites.reduce((sum, site) => sum + site.hp / site.maxHp, 0) / o.sites.length;
  return { title: o.name, detail: `${alive}/${o.sites.length} · resistí hasta oleada 8`, progress: average * 100 };
}
