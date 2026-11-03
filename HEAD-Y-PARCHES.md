# Cambios a aplicar en tu index.html

## 1) Reemplazá el <head> por este
```html
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Bastión · Tower defense</title>
<meta name="description" content="Bastión: defendé el núcleo, construí torres y sobreviví a 15 oleadas con jefes.">
<meta name="theme-color" content="#11151c">
<meta property="og:title" content="Bastión">
<meta property="og:description" content="Defensa, estrategia y supervivencia en el navegador.">
<meta property="og:type" content="website">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
  html,body{margin:0;height:100%;background:#11151c;overflow:hidden;overscroll-behavior:none}
  body{display:flex;align-items:center;justify-content:center;-webkit-user-select:none;user-select:none}
  canvas{width:100%;max-width:calc(100vh * 16 / 9);max-height:100vh;aspect-ratio:16/9;display:block;touch-action:none;outline:none}
  #mute{position:fixed;top:calc(8px + env(safe-area-inset-top,0px));right:8px;background:#11151c;color:#e8ecf1;
    border:2px solid #3a4558;font:14px Bahnschrift,"Arial Narrow",sans-serif;padding:6px 10px;cursor:pointer}
  #mute:focus-visible{outline:2px solid #f2c14e}
</style>
<noscript><style>body::after{content:"Bastión necesita JavaScript";color:#e8ecf1;font:20px sans-serif}</style></noscript>
</head>
```

## 2) Bug: Nanorreparación ignoraba la vida máxima del núcleo
En `buyTech`, cambiá:
```js
if(t.id==='repair')S.hp=Math.min(20,S.hp+2);
```
por:
```js
if(t.id==='repair')S.hp=Math.min(S.coreMax||20,S.hp+2);
```

## 3) Pausar al perder foco (evita que te maten mientras estás en otra pestaña)
Agregá antes de `/* ============ 7. BUCLE PRINCIPAL ============ */`:
```js
document.addEventListener('visibilitychange', () => { last = performance.now(); for (const k in keys) keys[k] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
```
(Así las teclas no quedan "pegadas" al cambiar de ventana.)

## 4) Opcional, recomendado: sacar el JS a game.js
1. Cortá todo lo que está dentro de `<script>...</script>` y pegalo en `game.js`.
2. Dejá en el HTML: `<script src="/game.js" defer></script>`
3. En `vercel.json` quitá `'unsafe-inline'` de `script-src`.
Ganás caché del navegador, un CSP más estricto y un HTML más liviano.
