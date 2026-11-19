import { S } from './state.js';

const STORAGE_KEY = 'bastion-tutorial-seen-v1';
const STEPS = [
  {
    label: '01 · LEÉ EL SECTOR',
    title: 'Ubicá las rutas y el objetivo',
    text: 'Las líneas del terreno muestran por dónde avanzan los enemigos hacia el núcleo. Pulsá M o MAPA para abrir la vista completa: vas a ver los accesos, las rutas, el objetivo y tu posición.',
    tip: 'La vista del mapa pausa el combate mientras está abierta.'
  },
  {
    label: '02 · MOVETE',
    title: 'Explorá y recogé recursos',
    text: 'Mové al operador con WASD o las flechas. Pasá sobre los objetos que dejan los enemigos para recogerlos. En cooperativo, el segundo jugador usa las flechas.',
    tip: 'Mantenete en movimiento cuando un enemigo prepare un disparo.'
  },
  {
    label: '03 · PREPARÁ LA DEFENSA',
    title: 'Comprá planos y colocá torretas',
    text: 'En la barra inferior, comprá un plano y después elegí esa estructura. Hacé click en un espacio libre para colocarla; las rutas, las rocas y el núcleo no sirven como terreno de construcción.',
    tip: 'Los generadores recargan las torretas y amplían la energía disponible.'
  },
  {
    label: '04 · ÓRDENES Y MEJORAS',
    title: 'Usá Órdenes para mejorar tus defensas',
    text: 'Pulsá ÓRDENES para abrir el panel. Hacé click en una torreta colocada para ver su nivel, integridad y el botón MEJORAR. Subirla de nivel aumenta sus atributos; al nivel 3 podés elegir una evolución.',
    tip: 'B abre la tienda de mejoras globales y reparación del núcleo cuando no hay una oleada activa. ÓRDENES también muestra energía, clima, amenaza y objetivo.',
    visual: 'orders'
  },
  {
    label: '05 · COMBATÍ',
    title: 'Elegí cómo disparar',
    text: 'El operador ataca automáticamente al enemigo cercano. Pulsá F para cambiar a modo manual y mantené el click para apuntar y disparar. Q activa la habilidad; en cooperativo, Shift activa la del jugador 2.',
    tip: 'Los artilleros y otros enemigos a distancia apuntan al operador: la línea de aviso te deja tiempo para esquivar.'
  },
  {
    label: '06 · INICIÁ LA OLEADA',
    title: 'Protegé el núcleo y completá el objetivo',
    text: 'Cuando estés listo, iniciá la oleada con ESPACIO o el botón naranja. El panel de órdenes muestra el estado del núcleo, la energía y el objetivo secundario. Acercate al marcador y mantené E cuando el sector lo pida.',
    tip: 'Un búnker escudo colocado sobre una ruta puede interceptar disparos y frenar el avance.'
  }
];

let overlay = null;
let stepIndex = 0;

function wasSeen() {
  try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
}

function markSeen() {
  try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* el tutorial sigue disponible durante esta sesión */ }
}

function renderStep() {
  const step = STEPS[stepIndex];
  const last = stepIndex === STEPS.length - 1;
  const preview = step.visual === 'orders' ? `
    <div class="tutorial-orders-preview" aria-hidden="true">
      <div class="tutorial-orders-head"><b>☷ ÓRDENES</b><span>PREPARACIÓN</span></div>
      <div class="tutorial-orders-card"><small>ESTRUCTURA · NIVEL 1</small><b>BALLESTA</b><p>Daño · alcance · integridad</p><span>MEJORAR · costo en chatarra</span></div>
      <small class="tutorial-orders-caption">Seleccioná una torre en el campo para ver sus opciones</small>
    </div>` : '';
  overlay.innerHTML = `
    <section class="tutorial-card" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
      <div class="tutorial-top"><span class="eyebrow">PROTOCOLO DE ENTRENAMIENTO</span><button class="tutorial-close" type="button" data-tutorial-close aria-label="Cerrar tutorial">×</button></div>
      <div class="tutorial-progress" aria-label="Paso ${stepIndex + 1} de ${STEPS.length}"><i style="width:${(stepIndex + 1) / STEPS.length * 100}%"></i></div>
      <span class="tutorial-step">${step.label}</span>
      <h2 id="tutorial-title">${step.title}</h2>
      <p class="tutorial-copy">${step.text}</p>
      ${preview}
      <p class="tutorial-tip"><b>CONSEJO</b>${step.tip}</p>
      <div class="tutorial-footer"><button class="tutorial-skip" type="button" data-tutorial-close>SALTAR TUTORIAL</button><div class="tutorial-actions">${stepIndex ? '<button class="tutorial-back" type="button" data-tutorial-back>ANTERIOR</button>' : ''}<button class="tutorial-next" type="button" data-tutorial-next>${last ? 'EMPEZAR DEFENSA' : 'SIGUIENTE'} <span>${last ? '↗' : `${stepIndex + 1}/${STEPS.length}`}</span></button></div></div>
    </section>`;
  overlay.querySelector('[data-tutorial-next]')?.focus();
}

function closeTutorial() {
  if (!overlay) return;
  overlay.hidden = true;
  S.tutorialOpen = false;
  markSeen();
  document.getElementById('tutorial-button')?.focus();
}

export function openTutorial(force = true) {
  if (!force && wasSeen()) return;
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.hidden = true;
    overlay.addEventListener('click', event => {
      if (event.target.closest('[data-tutorial-close]')) { closeTutorial(); return; }
      if (event.target.closest('[data-tutorial-back]')) { stepIndex = Math.max(0, stepIndex - 1); renderStep(); return; }
      if (event.target.closest('[data-tutorial-next]')) {
        if (stepIndex === STEPS.length - 1) closeTutorial();
        else { stepIndex++; renderStep(); }
      }
    });
    document.body.appendChild(overlay);
  }
  stepIndex = 0;
  overlay.hidden = false;
  S.tutorialOpen = true;
  renderStep();
}

export function showTutorialForNewPlayer() {
  openTutorial(false);
}

export function bindTutorial() {
  document.getElementById('tutorial-button')?.addEventListener('click', () => openTutorial());
  window.addEventListener('keydown', event => {
    if (!S.tutorialOpen) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); closeTutorial(); }
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); event.stopImmediatePropagation();
      if (stepIndex === STEPS.length - 1) closeTutorial();
      else { stepIndex++; renderStep(); }
    } else if (event.key === 'ArrowLeft' && stepIndex > 0) {
      event.preventDefault(); event.stopImmediatePropagation(); stepIndex--; renderStep();
    } else if (event.key === 'Tab') {
      const buttons = [...overlay.querySelectorAll('button:not(:disabled)')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    } else {
      event.preventDefault(); event.stopImmediatePropagation();
    }
  }, true);
}
