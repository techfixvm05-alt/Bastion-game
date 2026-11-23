# Bastión

Juego de defensa táctica escrito en JavaScript nativo. Se publica como sitio estático y usa módulos ES; no requiere compilación.

## Estructura

- `index.html` y `styles.css`: menú, interfaz y presentación.
- `js/main.js`, `state.js`, `input.js`, `ui.js`: inicio, estado, controles e interfaz.
- `js/config.js` y `js/maps.js`: operadores, estructuras, enemigos, jefes y sectores.
- `js/systems/`: oleadas, combate, energía, jefes, objetivos, clima, reliquias y récords.
- `js/render/`: terreno, efectos y dibujos detallados de unidades y estructuras.

## Controles

- **WASD** o flechas: mover al operador.
- **F** o el botón superior: alternar entre disparo automático y manual.
- **Automático:** el operador ataca al enemigo cercano.
- **Manual:** mantené click para apuntar y disparar.
- Elegí una estructura y hacé click en una zona libre para colocarla; **Esc** cancela.
- **Espacio**: iniciar o acelerar la siguiente oleada.
- **E**: evacuar, reparar núcleos auxiliares o estabilizar balizas según el sector.
- En cooperativo, jugador 1 usa **WASD** y click izquierdo; jugador 2 usa **flechas** y click derecho para disparar en modo manual.

## Sistemas de partida

- Las torretas gastan energía al disparar; los generadores amplían la reserva y la recargan. Si se agota, las defensas se detienen.
- Las tormentas desvían proyectiles, las fallas alteran rutas existentes y las nubes tóxicas dañan a todo lo que quede dentro.
- Cada sector tiene un objetivo secundario distinto. Completarlos da chatarra extra.
- Antes de desplegar, elegí una reliquia con una ventaja y una desventaja.
- El modo cooperativo local usa dos operadores y aumenta la presión enemiga. Los récords se guardan en el navegador por sector y operador.
- Las reliquias de rebote, escolta, plasma y simbiosis cambian los disparos, generan apoyo o convierten zonas peligrosas en oportunidades.
- Cada semilla elige de forma reproducible un patrón de terreno —esquirlas, espolones, cráteres o bancos de cristales— y genera sus obstáculos sin cerrar rutas, núcleo ni objetivos.
- Los enemigos eligen accesos según la defensa: los desgarradores buscan flancos débiles, las sanguijuelas de red siguen generadores y los asaltanúcleos presionan el objetivo del sector.
- Los jefes inspeccionan la mezcla de torretas y generadores, adaptan resistencias y atacan el objetivo secundario del sector. Cada jefe conserva su propio patrón de combate.
- La campaña desbloquea Cantera al llegar a oleada 5 en Tierras Rojas y Delta al completar el objetivo de Cantera o llegar a oleada 8.
- Cada día rota un desafío opcional con reglas y recompensas propias.
- El código `BASTION:SECTOR:SEMILLA` reconstruye las variaciones de terreno. Exportá o importá los récords JSON desde el menú.

## Posibles ampliaciones futuras

- Añadir desafíos de equipo con variantes de objetivos que requieran cambiar operadores durante la partida.
- Añadir patrones de clima ligados al terreno y enemigos que preparen emboscadas antes de cambiar de ruta.
