const BG_LINE_COUNT = 14;
const BG_LINE_SPEED = 220;

class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui;
    this.width = 0; this.height = 0;
    this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    this.state = 'IDLE';
    this.lastTime = 0;
    this.score = 0;
    this.highScore = this._loadHS();
    this.speedMultiplier = 1.0;
    this.glitches = new GlitchManager();
    this.glitches.onStart = (k, d) => this._onGlitchStart(k, d);
    this.glitches.onEnd = (k, d) => this._onGlitchEnd(k, d);
    this.player = new Player(this);
    this.spawner = new ObstacleSpawner(this);
    this.obstacles = [];
    this.screenShake = 0;
    this.scoreAcc = 0;
    this.bgLines = [];
    this._initBg();
    this._bindResize();
    this._bindInput();
    this.resize();
    requestAnimationFrame(t => this._loop(t));
  }

  start() {
    this.score = 0; this.speedMultiplier = 1.0;
    this.obstacles = []; this.screenShake = 0; this.scoreAcc = 0;
    this.player.reset(); this.spawner.reset();
    this.glitches.start();
    this.state = 'PLAYING';
    this.ui.updateScore(0);
    this.ui.hideGlitchBanner();
  }

  onPlayerDeath() {
    if (this.state !== 'PLAYING') return;
    this.state = 'GAMEOVER';
    this.glitches.stop();
    this.screenShake = 20;
    if (this.score > this.highScore) { this.highScore = this.score; this._saveHS(); }
    this.ui.showGameOver(this.score, this.highScore);
  }

  _initBg() {
    this.bgLines = Array.from({length: BG_LINE_COUNT}, () => ({
      x: Math.random(), y: Math.random(),
      len: 30 + Math.random() * 90,
      spd: 0.5 + Math.random() * 1.5,
    }));
  }

  _updateBg(dt) {
    for (const l of this.bgLines) {
      l.y += (BG_LINE_SPEED * l.spd * this.speedMultiplier * dt) / this.height;
      if (l.y > 1.1) { l.y = -0.1; l.x = Math.random(); l.len = 30 + Math.random()*90; }
    }
  }

  _drawBg() {
    const ctx = this.ctx;
    ctx.save();
    for (const l of this.bgLines) {
      ctx.strokeStyle = 'rgba(0,240,255,0.12)'; ctx.lineWidth = 1;
      const x = l.x * this.width, y = l.y * this.height;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + l.len); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,43,214,0.18)';
    ctx.setLineDash([6,10]);
    const gy = this.height * 0.75 + PLAYER_SIZE / 2 + 4;
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(this.width, gy); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
  }

  _loop(ts) {
    const t = ts / 1000;
    let dt = this.lastTime ? t - this.lastTime : 1/60;
    this.lastTime = t;
    if (dt > 0.05) dt = 0.05;
    if (this.state === 'PLAYING') this._update(dt);
    this._updateBg(dt);
    this._render();
    requestAnimationFrame(ts2 => this._loop(ts2));
  }

  _update(dt) {
    this.speedMultiplier = Math.min(2.6, 1.0 + this.score * 0.0007);
    this.scoreAcc += dt;
    while (this.scoreAcc >= 0.1) { this.scoreAcc -= 0.1; this.score++; this.ui.updateScore(this.score); }
    this.glitches.update(dt);
    this.player.update(dt);
    this.spawner.update(dt);
    const pr = this.player.getRect();
    for (const o of this.obstacles) {
      o.update(dt, this);
      if (!this.player.dead && o.collides(pr)) this.player.die();
    }
    this.obstacles = this.obstacles.filter(o => !o.dead);
    this.screenShake = Math.max(0, this.screenShake - dt * 60);
  }

  _render() {
    const ctx = this.ctx;
    ctx.save();
    if (this.screenShake > 0) {
      ctx.translate((Math.random()-.5)*this.screenShake, (Math.random()-.5)*this.screenShake);
    }
    ctx.fillStyle = 'rgba(10,0,20,0.35)';
    ctx.fillRect(-50,-50,this.width+100,this.height+100);
    this._drawBg();
    if (this.state !== 'IDLE') {
      for (const o of this.obstacles) o.draw(ctx);
      this.player.draw(ctx);
    }
    ctx.restore();
  }

  _onGlitchStart(key, def) {
    this.ui.showGlitchBanner(def.label, def.duration, def.color);
    this.screenShake = Math.max(this.screenShake, 12);
    if (key === 'INVERTED_GRAVITY') this.player.setGravityInverted(true);
  }

  _onGlitchEnd(key) {
    if (key === 'INVERTED_GRAVITY') this.player.setGravityInverted(false);
    if (this.glitches.active.size === 0) this.ui.hideGlitchBanner();
  }

  _bindInput() {
    const tap = e => { if (this.state === 'PLAYING') { e.preventDefault(); this.player.jump(); } };
    this.canvas.addEventListener('touchstart', tap, { passive: false });
    this.canvas.addEventListener('mousedown', tap);
    window.addEventListener('keydown', e => { if (e.code === 'Space' && this.state === 'PLAYING') { e.preventDefault(); this.player.jump(); } });
  }

  _bindResize() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 200));
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.width = r.width; this.height = r.height;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.state !== 'PLAYING') this.player.reset();
  }

  _loadHS() { try { return parseInt(localStorage.getItem('gl_best') || '0', 10) || 0; } catch { return 0; } }
  _saveHS() { try { localStorage.setItem('gl_best', String(this.highScore)); } catch {} }
}
