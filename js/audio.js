const STORAGE_KEY = 'bastion.sound.v1';
let context = null;
let enabled = (() => { try { return localStorage.getItem(STORAGE_KEY) !== 'off'; } catch { return true; } })();
const lastPlayed = new Map();

function audioContext() {
  if (!enabled || typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  context ??= new AudioContextClass();
  if (context.state === 'suspended') context.resume().catch(() => {});
  return context;
}

export function isSoundEnabled() { return enabled; }

export function setSoundEnabled(value) {
  enabled = !!value;
  try { localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off'); } catch { /* Audio still works for this session. */ }
  if (enabled) cue('select', true);
  return enabled;
}

export function cue(name, force = false) {
  if (!enabled) return;
  const nowMs = performance.now(), minGap = name === 'shot' ? 100 : 65;
  if (!force && nowMs - (lastPlayed.get(name) || 0) < minGap) return;
  lastPlayed.set(name, nowMs);
  const audio = audioContext();
  if (!audio) return;

  const presets = {
    select: { wave: 'sine', from: 480, to: 690, duration: .085, gain: .045 },
    plan: { wave: 'triangle', from: 230, to: 620, duration: .2, gain: .075 },
    build: { wave: 'square', from: 130, to: 410, duration: .14, gain: .055 },
    shot: { wave: 'triangle', from: 730, to: 260, duration: .055, gain: .018 },
    hit: { wave: 'sawtooth', from: 180, to: 72, duration: .12, gain: .035 },
    wave: { wave: 'sawtooth', from: 125, to: 460, duration: .32, gain: .06 },
    boss: { wave: 'sawtooth', from: 82, to: 49, duration: .5, gain: .075 },
    unlock: { wave: 'sine', from: 380, to: 980, duration: .42, gain: .075 }
  };
  const preset = presets[name] || presets.select;
  const oscillator = audio.createOscillator(), volume = audio.createGain(), start = audio.currentTime;
  oscillator.type = preset.wave;
  oscillator.frequency.setValueAtTime(preset.from, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, preset.to), start + preset.duration);
  volume.gain.setValueAtTime(.0001, start);
  volume.gain.exponentialRampToValueAtTime(preset.gain, start + .012);
  volume.gain.exponentialRampToValueAtTime(.0001, start + preset.duration);
  oscillator.connect(volume); volume.connect(audio.destination);
  oscillator.start(start); oscillator.stop(start + preset.duration + .01);
}
