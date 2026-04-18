const OBSTACLE_BASE_SPEED = 480;
const OBS_W_MIN = 70, OBS_W_MAX = 140, OBS_H = 26;

class Obstacle {
  constructor(x, y, w, fake = false) {
    this.x = x; this.y = y; this.w = w; this.h = OBS_H;
    this.fake = fake; this.dead = false;
    this.born = performance.now() / 1000;
  }

  update(dt, game) {
    let speed = OBSTACLE_BASE_SPEED * game.speedMultiplier;
    if (game.glitches.isActive('SPEED_BURST')) speed *= 1.9;
    this.y += speed * dt;
    if (this.y > game.height + 80) this.dead = true;
  }

  collides(r) {
    if (this.fake) return false;
    return !(this.x > r.x + r.w || this.x + this.w < r.x || this.y > r.y + r.h || this.y + this.h < r.y);
  }

  draw(ctx) {
    if (this.fake) {
      const t = performance.now()/1000 - this.born;
      const a = 0.45 + 0.35 * Math.sin(t * 14);
      ctx.globalAlpha = a;
      ctx.shadowBlur = 12; ctx.shadowColor = '#00f0ff';
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.globalAlpha = a * 0.6; ctx.fillStyle = '#ff2bd6';
      for (let i = 0; i < 3; i++) {
        const oy = ((t * 80 + i * 9) % this.h);
        ctx.fillRect(this.x, this.y + oy, this.w, 1);
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    } else {
      ctx.shadowBlur = 18; ctx.shadowColor = '#ff2bd6';
      ctx.fillStyle = '#ff2bd6';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x, this.y, this.w, 2);
    }
  }
}

class ObstacleSpawner {
  constructor(game) { this.game = game; this.timer = 1.0; }

  reset() { this.timer = 1.0; }

  update(dt) {
    this.timer -= dt;
    if (this.timer <= 0) { this._spawn(); this._next(); }
  }

  _next() {
    const base = 1.1 + Math.random() * 0.7;
    this.timer = base / this.game.speedMultiplier;
  }

  _spawn() {
    const vw = this.game.width, margin = 30;
    const w = OBS_W_MIN + Math.random() * (OBS_W_MAX - OBS_W_MIN);
    const x = margin + Math.random() * (vw - w - margin * 2);
    const fake = this.game.glitches.isActive('FAKE_OBSTACLES') && Math.random() < 0.45;
    this.game.obstacles.push(new Obstacle(x, -OBS_H - 10, w, fake));
    if (this.game.score > 50 && Math.random() < 0.18) {
      const w2 = OBS_W_MIN + Math.random() * (OBS_W_MAX - OBS_W_MIN);
      let x2 = margin + Math.random() * (vw - w2 - margin * 2);
      if (Math.abs(x2 - x) < w) x2 = (x + w + 20) % (vw - w2);
      this.game.obstacles.push(new Obstacle(x2, -OBS_H - 70, w2, false));
    }
  }
}
