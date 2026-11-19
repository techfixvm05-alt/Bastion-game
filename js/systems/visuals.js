const RELIC_SHAPES = {
  none: '<circle cx="12" cy="12" r="8"/><path d="M7 7l10 10"/>',
  storm: '<path d="M13 3 7 13h5l-1 8 7-11h-5l1-7Z"/><path d="M4 7h2M18 17h2M5 18l1.5-1.5"/>',
  salvage: '<path d="M5 4 19 18M19 4 5 18"/><circle cx="12" cy="11" r="4"/><path d="M12 2v3M12 17v5M2 11h4M18 11h4"/>',
  capacitor: '<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 2v3M15 2v3M10 17l3-5h-3l2-3"/><path d="M8 19h8"/>',
  bulwark: '<path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  ricochet: '<path d="M4 7h9a4 4 0 0 1 0 8H8"/><path d="m7 11-4 4 4 4"/><path d="m14 4 4 3-4 3"/>',
  drone: '<circle cx="12" cy="12" r="3"/><path d="M12 9V4M15 12h5M12 15v5M9 12H4"/><circle cx="12" cy="3" r="2"/><circle cx="21" cy="12" r="2"/><circle cx="12" cy="21" r="2"/><circle cx="3" cy="12" r="2"/>',
  plasma: '<circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 8 4M22 12a10 10 0 0 1-6 9M8 21a10 10 0 0 1-6-9M3 7l3-3M17 4l3 3M6 18l-3 3"/>',
  symbiosis: '<path d="M19 4c-8 0-13 4-13 11 0 3 2 5 5 5 7 0 11-5 8-16Z"/><path d="M5 20c3-5 6-8 11-11"/><path d="M5 11H2M10 6l-1-3"/>'
};

export function relicGlyph(id) {
  const shape = RELIC_SHAPES[id] || RELIC_SHAPES.storm;
  return `<svg class="relic-glyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${shape}</svg>`;
}

export function operatorGlyph(type) {
  if (type === 'ranger') return '<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M18 60 26 38 17 26l12-15 24 5 7 13-8 12 7 19H18Z"/><path d="m27 39 9 7 11-7M26 25l10-6 10 4M36 47v13M18 32l-7 9M53 30l9 8"/></svg>';
  if (type === 'engineer') return '<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M15 61 22 37 16 24l7-14h26l8 14-7 13 8 24H15Z"/><path d="M24 24h25M28 40l8 6 9-6M36 46v15M17 29l-9 8M55 29l9 8M25 12l11 8 12-8"/><circle cx="36" cy="29" r="3"/></svg>';
  return '<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M16 61 21 37 14 25l9-15h27l9 15-7 12 6 24H16Z"/><path d="M22 27h28M26 40l10 7 10-7M36 47v14M23 14l13 8 13-8M15 31 7 39M57 31l8 8"/><path d="M31 29h10"/></svg>';
}

export function heroPortrait(type, color) {
  const face = type === 'ranger' ? '<path d="m94 122 36-25 47 10 25 31-12 39-31 17-45-11-24-27 4-34Z"/><path d="m88 120-25 20 34 6M197 133l28 11-23 10"/><path d="m132 149 37 5" stroke="#f6e7c1" stroke-width="5"/>'
    : type === 'engineer' ? '<path d="m96 128 24-29h57l27 27-9 44-31 24-45-9-25-28 2-29Z"/><path d="M93 121h110M102 112l19-23h51l16 22M128 151l22 10 20-10M150 162v34"/><circle cx="150" cy="137" r="10"/>'
    : '<path d="m96 126 30-27h50l29 29-10 44-28 22h-44l-28-29 1-39Z"/><path d="m101 120 15-28h67l18 29M116 145l28 13 29-13M144 158v39M112 111l32 17 32-17"/><path d="M132 139h25" stroke="#f6e7c1" stroke-width="5"/>';
  return `<svg class="hero-portrait-art" viewBox="0 0 300 340" role="img" aria-label="Retrato táctico del operador" style="--hero-accent:${color}"><defs><linearGradient id="armor-${type}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e4eee0"/><stop offset=".45" stop-color="#738784"/><stop offset="1" stop-color="#1d2b31"/></linearGradient><radialGradient id="halo-${type}"><stop stop-color="${color}" stop-opacity=".42"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><ellipse class="portrait-halo" cx="150" cy="170" rx="137" ry="145" fill="url(#halo-${type})"/><ellipse class="portrait-ring ring-one" cx="150" cy="170" rx="110" ry="124"/><ellipse class="portrait-ring ring-two" cx="150" cy="170" rx="128" ry="88"/><path class="portrait-suit" d="M50 324q7-70 47-96l53-18 54 18q39 26 46 96Z"/><path class="portrait-suit" d="M99 230 88 188l7-65q10-52 55-54 47 4 55 54l7 65-13 43-49-21-51 20Z"/><g class="portrait-armor" fill="url(#armor-${type})" stroke="${color}" stroke-width="2.2">${face}</g><path class="portrait-visor" d="M116 131q34-24 68 0l-4 17q-29 17-59 0Z"/><path d="M123 139h52" stroke="${color}" stroke-width="4" stroke-linecap="round"/><path class="portrait-stripe" d="m80 306 36-54 34 14 34-14 36 54" fill="none" stroke="${color}" stroke-width="5" opacity=".8"/><path class="portrait-suit" d="M84 249 51 271l-16 54h43l22-64M216 249l33 22 16 54h-43l-22-64Z"/><circle cx="150" cy="207" r="7" fill="${color}" class="portrait-core"/></svg>`;
}
