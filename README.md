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
- **M**: abrir o cerrar el mapa táctico completo. La partida se pausa mientras está abierto.
- **Tutorial:** aparece en el primer despliegue y se puede volver a abrir desde el botón **?**.
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
- Los artilleros, aguijones, ráfagas, prismas y ciclones disparan mientras avanzan. Una línea de aviso marca al operador que tienen en la mira.
- El mapa táctico con **M** muestra todos los accesos, obstáculos, estructuras, enemigos, objetivo y campo visible de la cámara. Las flechas del terreno indican hacia dónde avanzan los enemigos.
- Los jefes inspeccionan la mezcla de torretas y generadores, adaptan resistencias y atacan el objetivo secundario del sector. Cada jefe conserva su propio patrón de combate.
- La campaña desbloquea Cantera al llegar a oleada 5 en Tierras Rojas y Delta al completar el objetivo de Cantera o llegar a oleada 8.
- Cada día rota un desafío opcional con reglas y recompensas propias.
- El código `BASTION:SECTOR:SEMILLA` reconstruye las variaciones de terreno. Exportá o importá los récords JSON desde el menú.

## Posibles ampliaciones futuras

- Añadir desafíos de equipo con variantes de objetivos que requieran cambiar operadores durante la partida.
- Añadir patrones de clima ligados al terreno y enemigos que preparen emboscadas antes de cambiar de ruta.

## Historia y campaña (v3)

- Historia en `js/lore.js`: 4 protagonistas (Mara, la última humana; Kael-7, cyborg; Nova, IA rebelde; Eco-0, clon criogénico) y 6 capítulos en 3 actos.
- 6 sectores encadenados; cada uno se desbloquea al superar cierta oleada o completar el objetivo del anterior.
- Al terminar cada nivel se ganan monedas ◈ para subir las reliquias hasta nivel 5 (más ventaja, menos desventaja).
- El index usa rutas relativas, por lo que funciona en Vercel y en subcarpetas. Abrilo con un servidor local (`npx serve .`), no con doble click, porque usa módulos ES.

## Novedades (v4)

- **Cámara más amplia:** `ZOOM` en `js/config.js` (0.66). Bajalo para ver más mapa, subilo para acercar.
- **Baterías por torreta:** cada torre gasta su propia carga al disparar. Los generadores cercanos la recargan; con **R** el operador recarga las torres que tenga cerca usando la reserva global.
- **Mejoras temporales:** los bichos sueltan objetos (sobrecarga, furia, batería, nanobots, chatarra) que se recogen caminando encima. Los jefes siempre sueltan.
- **Combo:** matar seguido sube el bonus de chatarra hasta +100%.
- **Tienda de partida (B):** 6 mejoras de hasta nivel 6 y reparación del núcleo, pagadas con chatarra; el juego se pausa mientras está abierta.
- **Oscuridad:** ciclo de noche; solo se ven las zonas iluminadas por el núcleo, el operador, las torres con carga y los objetos.

## Novedades (v5)

- **Torretas:** mejoran hasta nivel 3; en nivel 3 evolucionan a una de dos ramas (`js/systems/evolution.js`) y después suben hasta nivel 5.
- **Campaña:** cada capítulo tiene objetivo de oleadas (`GOALS` en `js/lore.js`). Ganar desbloquea el siguiente sector y entrega una reliquia.
- **Historia:** diálogos de inicio y cierre, mensajes de radio durante la partida (`STORY` en `js/lore.js`, motor en `js/story.js`). Click/Espacio avanza, Esc salta.
- **Reliquias:** cada una tiene origen y un secreto que se revela en nivel 3.
