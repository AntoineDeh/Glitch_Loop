(function () {
  const canvas = document.getElementById('game');
  const $ = id => document.getElementById(id);
  const screens = { title: $('screen-title'), hud: $('screen-hud'), gameover: $('screen-gameover') };

  const ui = {
    _bannerTimer: null,
    show(name) {
      Object.values(screens).forEach(s => s.classList.remove('visible'));
      if (screens[name]) screens[name].classList.add('visible');
      if (name === 'gameover') screens.hud.classList.add('visible');
    },
    updateScore(s) { $('score').textContent = s; },
    showGlitchBanner(label, duration, color) {
      const b = $('glitch-banner'), o = $('glitch-overlay');
      b.textContent = `\u26A0 ${label} \u26A0`;
      b.style.color = color; b.style.textShadow = `0 0 10px ${color}`;
      b.classList.add('active'); o.classList.add('active');
      clearTimeout(this._bannerTimer);
      this._bannerTimer = setTimeout(() => this.hideGlitchBanner(), duration * 1000);
    },
    hideGlitchBanner() {
      $('glitch-banner').classList.remove('active');
      $('glitch-overlay').classList.remove('active');
    },
    showGameOver(score, best) {
      $('final-score').textContent = score;
      $('final-best').textContent = best;
      screens.gameover.classList.add('visible');
    },
  };

  const game = new Game(canvas, ui);
  $('best-title').textContent = game.highScore;
  ui.show('title');

  $('btn-play').addEventListener('click', () => {
    screens.title.classList.remove('visible');
    screens.hud.classList.add('visible');
    game.start();
  });

  $('btn-restart').addEventListener('click', () => {
    screens.gameover.classList.remove('visible');
    ui.updateScore(0);
    game.start();
  });

  $('btn-menu').addEventListener('click', () => {
    screens.gameover.classList.remove('visible');
    screens.hud.classList.remove('visible');
    $('best-title').textContent = game.highScore;
    screens.title.classList.add('visible');
    game.state = 'IDLE';
    game.obstacles = [];
    game.player.reset();
    ui.hideGlitchBanner();
    game.glitches.stop();
  });

  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('dblclick', e => e.preventDefault());
})();
