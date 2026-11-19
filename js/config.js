export const WORLD = { width: 2800, height: 1900 };
export const VIEW = { width: 1280, height: 720 };
export const CORE = { x: 1400, y: 950, radius: 64, maxHp: 1000 };

export const HEROES = {
  vanguard: { name: 'Vanguardia', hp: 190, speed: 250, damage: 28, range: 420, cooldown: .34, color: '#7fe4c0', passive: 'Más resistencia y daño estable.', ability: 'Bastión', abilityKey: 'Q', abilityDesc: 'Reduce todo el daño recibido durante 4 s.', abilityCooldown: 14 },
  ranger: { name: 'Explorador', hp: 145, speed: 305, damage: 23, range: 510, cooldown: .25, color: '#e4ce76', passive: 'Más movilidad y cadencia.', ability: 'Impulso', abilityKey: 'Q', abilityDesc: 'Aumenta la velocidad durante 4 s.', abilityCooldown: 12 },
  sentinel: { name: 'Centinela', hp: 170, speed: 265, damage: 34, range: 360, cooldown: .36, color: '#e58bd0', passive: 'Daño alto y alcance corto.', ability: 'Pulso radial', abilityKey: 'Q', abilityDesc: 'Daña y empuja a enemigos cercanos.', abilityCooldown: 15 },
  engineer: { name: 'Ingeniera', hp: 160, speed: 255, damage: 25, range: 440, cooldown: .31, color: '#7dc6eb', passive: 'Repara lentamente el núcleo fuera de combate.', ability: 'Sobrevivir', abilityKey: 'Q', abilityDesc: 'Repara torretas cercanas y el núcleo.', abilityCooldown: 16 }
};

export const TOWERS = {
  ballista: { name: 'Ballesta', cost: 90, planCost: 55, range: 320, rate: .86, damage: 62, energyUse: 1, color: '#e6bd70', role: 'Perforación', detail: 'Cada cuarto virote atraviesa enemigos y golpea con crítico.', icon: '⌁' },
  mortar: { name: 'Mortero', cost: 125, planCost: 85, range: 370, rate: 2.15, damage: 78, energyUse: 3.2, color: '#f18a65', role: 'Área', detail: 'Explosión de área que ralentiza a todos los alcanzados.', icon: '◉' },
  cryo: { name: 'Emisor criónico', cost: 110, planCost: 70, range: 285, rate: .22, damage: 11, energyUse: .42, color: '#71d6e8', role: 'Control', detail: 'Rayo continuo: ralentiza y expone al objetivo a más daño.', icon: '❄' },
  totem: { name: 'Totem de pulso', cost: 145, planCost: 90, range: 230, rate: 1.15, damage: 28, energyUse: 2, color: '#b796e8', role: 'Soporte', detail: 'Pulso de daño y reparación moderada a torres cercanas.', icon: '✣' },
  inferno: { name: 'Lanzallamas', cost: 105, planCost: 75, range: 160, rate: .14, damage: 9, energyUse: .34, color: '#fa775c', role: 'Combustión', detail: 'Cono de fuego: incendia grupos y mantiene daño con el tiempo.', icon: '♨' },
  shieldwall: { name: 'Búnker escudo', cost: 135, planCost: 90, range: 0, rate: 0, damage: 0, energyUse: 0, output: 0, storage: 0, color: '#9bd1f0', role: 'Escudo', detail: 'Muralla colocable sobre rutas. Bloquea enemigos y absorbe daño con gran resistencia.', icon: '⬢' },
  generator: { name: 'Generador', cost: 150, planCost: 80, range: 125, rate: 0, damage: 0, energyUse: 0, output: 5.2, storage: 48, color: '#8bd6b0', role: 'Energía', detail: 'Aumenta la reserva máxima y genera energía para mantener activas las torretas.', icon: 'ϟ' }
};

export const RELICS = {
  stormglass: { name: 'Vidrio de tormenta', icon: 'storm', unlock: 'Superá la oleada 2 en cualquier sector.', description: '+18% daño del operador. Las tormentas duran más.', mods: { heroDamage: 1.18, stormDuration: 1.25 } },
  salvager: { name: 'Insignia del chatarrero', icon: 'salvage', unlock: 'Eliminá 35 enemigos en una partida.', description: '+30% chatarra por baja. Las torretas cuestan +18%.', mods: { killCredits: 1.3, towerCost: 1.18 } },
  capacitor: { name: 'Capacitor inestable', icon: 'capacitor', unlock: 'Construí 2 generadores y superá la oleada 3.', description: '+45% generación. Las torretas consumen +22% energía.', mods: { generatorOutput: 1.45, energyUse: 1.22 } },
  bulwark: { name: 'Semilla del bastión', icon: 'bulwark', unlock: 'Alcanzá la oleada 6.', description: '+24% vida del núcleo. Empezás con 28% menos chatarra.', mods: { coreHp: 1.24, startingCredits: .72 } },
  ricochet: { name: 'Esquirla de rebote', icon: 'ricochet', unlock: 'Eliminá 15 enemigos con disparo manual.', description: 'En manual, los disparos saltan a 2 blancos cercanos. El operador tiene 14% menos vida.', mods: { manualBounces: 2, heroHp: .86 } },
  dronecore: { name: 'Núcleo de escolta', icon: 'drone', unlock: 'Derrotá un jefe.', description: 'Cada 9 bajas despliega un dron armado por 12 segundos. Empezás con 22% menos chatarra.', mods: { droneKills: 9, startingCredits: .78 } },
  plasma: { name: 'Bucle de plasma', icon: 'plasma', unlock: 'Construí 8 estructuras en una partida.', description: 'Los impactos de ballesta y mortero encadenan 38% de daño a otro enemigo. Consumen 30% más energía.', mods: { chainRatio: .38, energyUse: 1.3 } },
  symbiosis: { name: 'Simbionte tóxico', icon: 'symbiosis', unlock: 'Completá un objetivo secundario.', description: 'Las nubes curan al operador y dañan más a los enemigos. Las torretas cuestan 20% más.', mods: { toxicAffinity: 1, towerCost: 1.2 } }
  ,
  aegis: { name: 'Aegis de asedio', icon: 'bulwark', unlock: 'Derrotá al menos un jefe.', description: 'Los búnkeres escudo absorben exactamente 5 golpes de jefes antes de romperse.', mods: { shieldBossHits: 5 } }
};

export const ENEMIES = {
  swarm: { name: 'Cáscara', hp: 62, speed: 76, damage: 13, reward: 12, radius: 16, color: '#c18a57', armor: 0 },
  runner: { name: 'Rasante', hp: 46, speed: 142, damage: 22, reward: 15, radius: 13, color: '#ec9960', armor: 0 },
  tank: { name: 'Ariete', hp: 255, speed: 42, damage: 36, reward: 30, radius: 26, color: '#819397', armor: .23 },
  split: { name: 'Muda', hp: 105, speed: 64, damage: 18, reward: 19, radius: 19, color: '#d48992', armor: 0 },
  ranged: { name: 'Aguijón', hp: 88, speed: 58, damage: 19, reward: 23, radius: 18, color: '#c282c5', armor: 0 },
  gunner: { name: 'Artillero', hp: 72, speed: 62, damage: 25, reward: 26, radius: 17, color: '#ed7b89', armor: .04 },
  burst: { name: 'Ráfaga', hp: 79, speed: 54, damage: 27, reward: 28, radius: 17, color: '#f59d69', armor: .02 },
  prism: { name: 'Prisma', hp: 96, speed: 48, damage: 30, reward: 31, radius: 19, color: '#72d9d1', armor: .06 },
  nova: { name: 'Ciclón', hp: 82, speed: 58, damage: 24, reward: 29, radius: 18, color: '#b78cff', armor: .03 },
  healer: { name: 'Nódulo', hp: 118, speed: 50, damage: 11, reward: 24, radius: 18, color: '#83c981', armor: 0 },
  shield: { name: 'Baluarte', hp: 165, speed: 46, damage: 23, reward: 27, radius: 21, color: '#7ca3d1', armor: .12 },
  flanker: { name: 'Desgarrador', hp: 76, speed: 126, damage: 21, reward: 24, radius: 15, color: '#e57878', armor: .02 },
  saboteur: { name: 'Sanguijuela de red', hp: 132, speed: 68, damage: 20, reward: 32, radius: 18, color: '#d8cf69', armor: .08 },
  raider: { name: 'Asaltanúcleos', hp: 106, speed: 86, damage: 26, reward: 28, radius: 17, color: '#e0a36b', armor: 0 }
};

export const BOSSES = {
  colossus: { name: 'EL COLOSO DE HIERRO', title: 'Asedio · aplasta defensas', baseHp: 2100, speed: 31, damage: 105, radius: 67, color: '#d77a56', reward: 300 },
  cartographer: { name: 'LA CARTÓGRAFA', title: 'Mutación · abre rutas nuevas', baseHp: 1750, speed: 48, damage: 75, radius: 57, color: '#b28ae0', reward: 330 },
  matriarch: { name: 'MATRIZ DEL VACÍO', title: 'Asedio · pulsos y fracturas', baseHp: 1950, speed: 39, damage: 88, radius: 61, color: '#77b6d4', reward: 360 },
  stormcaller: { name: 'EL LLAMATORMENTAS', title: 'Orbes · proyectiles esquivables', baseHp: 1820, speed: 44, damage: 82, radius: 59, color: '#64d7ef', reward: 380 },
  demolisher: { name: 'DEMOLIEDOR CERO', title: 'Artillería · lluvia de impacto', baseHp: 2240, speed: 27, damage: 112, radius: 72, color: '#f09a58', reward: 420 },
  oracle: { name: 'ORÁCULO ROJO', title: 'Cadena · disparos múltiples', baseHp: 1680, speed: 52, damage: 92, radius: 55, color: '#ed697f', reward: 400 }
};

// Zoom de cámara: menor valor = campo de visión más amplio.
export const ZOOM = .66;
export const SEE = { width: VIEW.width / ZOOM, height: VIEW.height / ZOOM };
