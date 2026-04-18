const PLAYER_SIZE = 44;
const JUMP_VELOCITY = -820;
const GRAVITY = 2200;
const MAX_FALL_SPEED = 1600;
const JUMP_COOLDOWN = 0.08;

class Player {
  constructor(game) {
    this.game = game;
    this.reset();
  }

  reset() {
    this.x = this.game.width / 2;
    this.y = this.game.height * 0.75;
    this.vy = 0;
    this.size = PLAYER_SIZE;
    this.dead = false;
    this.gravitySign = 1;
    this.jumpCooldown = 0;
    this.flashTime = 0;
    this.flashColor = null;
    this.trail = [];
  }

  jump() {
    if (this.dead || this.jumpCooldown > 0) return;
    this.jumpCooldown = JUMP_COOLDOWN;
    let dir = this.game.glitches.isActive('INVERTED_CONTROLS') ? 1 : -1;
    this.vy = JUMP_VELOCITY * dir * this.gravitySign;
    this._flash('#00f0ff', 0.2);
  }

  update(dt) {
    if (this.dead) return;
    this.jumpCooldown = Math.max(0, this.jumpCooldown - dt);
    this.flashTime = Math.max(0, this.flashTime - dt);
    this.vy += GRAVITY * this.gravitySign * dt;
    this.vy = Math.max(-MAX_FALL_SPEED, Math.min(MAX_FALL_SPEED, this.vy));
    this.y += this.vy * dt;
    this.trail.push({ x: this.x, y: this.y, life: 0.25 });
    for (const t of this.trail) t.life -= dt;
    this.trail = this.trail.filter(t => t.life > 0);
    if (this.trail.length > 12) this.trail.shift();
    if (this.y < -60 || this.y > this.game.height + 60) this.die();
  }

  setGravityInverted(inv) {
    const newSign = inv ? -1 : 1;
    if (newSign !== this.gravitySign) { this.gravitySign = newSign; this.vy = 0; }
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this._flash('#ff3860', 0.4);
    this.game.onPlayerDeath();
  }

  _flash(color, dur) { this.flashColor = color; this.flashTime = dur; }

  getRect() {
    return { x: this.x - this.size/2, y: this.y - this.size/2, w: this.size, h: this.size };
  }

  draw(ctx) {
    for (const t of this.trail) {
      const a = t.life / 0.25;
      ctx.fillStyle = `rgba(0,240,255,${a * 0.3})`;
      const s = this.size * a;
      ctx.fillRect(t.x - s/2, t.y - s/2, s, s);
    }
    const color = this.flashTime > 0 ? this.flashColor
      : (this.game.glitches.isActive('INVERTED_CONTROLS') ? '#ff2bd6' : '#00f0ff');
    ctx.shadowBlur = 20; ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    const inner = this.size * 0.3;
    ctx.fillRect(this.x - inner/2, this.y - inner/2, inner, inner);
  }
}
