# GLITCH LOOP

Jeu arcade mobile — HTML/CSS/JS vanilla, aucune dépendance.

## Lancer en local
```bash
python3 -m http.server 8000
# http://localhost:8000
```

## GitHub Pages
1. Push sur `main`
2. Settings → Pages → Deploy from branch → `main` / root
3. URL : `https://<user>.github.io/glitch-loop/`
4. Sur Android : ajouter à l'écran d'accueil → plein écran

## Contrôles
- Tap / clic / Espace : saut

## Glitchs
| Glitch | Effet |
|---|---|
| INVERTED INPUT | Saut inversé |
| OVERCLOCK | Obstacles x1.9 |
| GRAVITY FLIP | Gravité inversée |
| VISUAL NOISE | 45% des obstacles sont des leurres |

## Ajouter un glitch
Dans `js/glitches.js`, ajouter dans `GLITCH_DEFS` :
```js
MON_GLITCH: { label: 'MON LABEL', duration: 3.0, color: '#ff0000' }
```
Puis brancher l'effet dans `_onGlitchStart / _onGlitchEnd` dans `game.js`.
