# Bastión

Sitio 100% estático (sin build).

## Estructura
```
index.html      <- tu juego (con el <head> de HEAD-Y-PARCHES.md)
favicon.svg
robots.txt
vercel.json
package.json
```

## Desplegar
**Opción A – Dashboard:** subí la carpeta a GitHub → vercel.com/new → importá el repo → Framework Preset: *Other* → Deploy.

**Opción B – CLI:**
```bash
npm i -g vercel
cd bastion
vercel        # preview
vercel --prod # producción
```
