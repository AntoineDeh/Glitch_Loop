const GLITCH_DEFS = {
  INVERTED_CONTROLS: { label: 'INVERTED INPUT', duration: 4.0, color: '#ff2bd6' },
  SPEED_BURST:       { label: 'OVERCLOCK',       duration: 3.0, color: '#ffcc00' },
  INVERTED_GRAVITY:  { label: 'GRAVITY FLIP',    duration: 4.0, color: '#00ff9d' },
  FAKE_OBSTACLES:    { label: 'VISUAL NOISE',    duration: 5.0, color: '#00f0ff' },
};

const GLITCH_MIN_INTERVAL = 6.0;
const GLITCH_MAX_INTERVAL = 12.0;

class GlitchManager {
  constructor() {
    this.active = new Map();
    this.enabled = false;
    this.nextTimer = 0;
    this.onStart = null;
    this.onEnd = null;
  }

  start() {
    this.enabled = true;
    this.active.clear();
    this._scheduleNext();
  }

  stop() {
    this.enabled = false;
    for (const [key] of this.active) {
      if (this.onEnd) this.onEnd(key, GLITCH_DEFS[key]);
    }
    this.active.clear();
  }

  isActive(key) { return this.active.has(key); }

  update(dt) {
    if (!this.enabled) return;
    this.nextTimer -= dt;
    if (this.nextTimer <= 0) {
      this._triggerRandom();
      this._scheduleNext();
    }
    const toRemove = [];
    for (const [key, remaining] of this.active) {
      const next = remaining - dt;
      if (next <= 0) toRemove.push(key);
      else this.active.set(key, next);
    }
    for (const key of toRemove) {
      this.active.delete(key);
      if (this.onEnd) this.onEnd(key, GLITCH_DEFS[key]);
    }
  }

  _scheduleNext() {
    this.nextTimer = GLITCH_MIN_INTERVAL + Math.random() * (GLITCH_MAX_INTERVAL - GLITCH_MIN_INTERVAL);
  }

  _triggerRandom() {
    const keys = Object.keys(GLITCH_DEFS).filter(k => !this.active.has(k));
    if (!keys.length) return;
    const chosen = keys[Math.floor(Math.random() * keys.length)];
    this.active.set(chosen, GLITCH_DEFS[chosen].duration);
    if (this.onStart) this.onStart(chosen, GLITCH_DEFS[chosen]);
  }
}
