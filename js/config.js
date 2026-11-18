export const WORLD = { width: 2800, height: 1900 };
export const VIEW = { width: 1280, height: 720 };
export const CORE = { x: 1400, y: 950, radius: 64, maxHp: 1000 };

export const HEROES = {
  vanguard: { name: 'Vanguardia', hp: 190, speed: 250, damage: 28, range: 560, cooldown: .34, color: '#7fe4c0', passive: 'Más resistencia y daño estable.' },
  ranger: { name: 'Explorador', hp: 145, speed: 305, damage: 23, range: 700, cooldown: .25, color: '#e4ce76', passive: 'Más alcance y cadencia.' },
  engineer: { name: 'Ingeniera', hp: 160, speed: 255, damage: 25, range: 590, cooldown: .31, color: '#7dc6eb', passive: 'Repara lentamente el núcleo fuera de combate.' }
};

export const TOWERS = {
  ballista: { name: 'Ballesta', cost: 90, range: 390, rate: .86, damage: 62, energyUse: 1, color: '#e6bd70', role: 'Perforación', detail: 'Cada cuarto virote atraviesa enemigos y golpea con crítico.', icon: '⌁' },
  mortar: { name: 'Mortero', cost: 125, range: 470, rate: 2.15, damage: 78, energyUse: 3.2, color: '#f18a65', role: 'Área', detail: 'Explosión de área que ralentiza a todos los alcanzados.', icon: '◉' },
  cryo: { name: 'Emisor criónico', cost: 110, range: 340, rate: .22, damage: 11, energyUse: .42, color: '#71d6e8', role: 'Control', detail: 'Rayo continuo: ralentiza y expone al objetivo a más daño.', icon: '❄' },
  totem: { name: 'Totem de pulso', cost: 145, range: 280, rate: 1.15, damage: 28, energyUse: 2, color: '#b796e8', role: 'Soporte', detail: 'Pulso de daño y reparación moderada a torres cercanas.', icon: '✣' },
  inferno: { name: 'Lanzallamas', cost: 105, range: 190, rate: .14, damage: 9, energyUse: .34, color: '#fa775c', role: 'Combustión', detail: 'Cono de fuego: incendia grupos y mantiene daño con el tiempo.', icon: '♨' },
  generator: { name: 'Generador', cost: 150, range: 150, rate: 0, damage: 0, energyUse: 0, output: 5.2, storage: 48, color: '#8bd6b0', role: 'Energía', detail: 'Aumenta la reserva máxima y genera energía para mantener activas las torretas.', icon: 'ϟ' }
};

export const RELICS = {
  stormglass: { name: 'Vidrio de tormenta', description: '+18% daño del operador. Las tormentas duran más.', mods: { heroDamage: 1.18, stormDuration: 1.25 } },
  salvager: { name: 'Insignia del chatarrero', description: '+30% chatarra por baja. Las torretas cuestan +18%.', mods: { killCredits: 1.3, towerCost: 1.18 } },
  capacitor: { name: 'Capacitor inestable', description: '+45% generación. Las torretas consumen +22% energía.', mods: { generatorOutput: 1.45, energyUse: 1.22 } },
  bulwark: { name: 'Semilla del bastión', description: '+24% vida del núcleo. Empezás con 28% menos chatarra.', mods: { coreHp: 1.24, startingCredits: .72 } },
  ricochet: { name: 'Esquirla de rebote', description: 'En manual, los disparos saltan a 2 blancos cercanos. El operador tiene 14% menos vida.', mods: { manualBounces: 2, heroHp: .86 } },
  dronecore: { name: 'Núcleo de escolta', description: 'Cada 9 bajas despliega un dron armado por 12 segundos. Empezás con 22% menos chatarra.', mods: { droneKills: 9, startingCredits: .78 } },
  plasma: { name: 'Bucle de plasma', description: 'Los impactos de ballesta y mortero encadenan 38% de daño a otro enemigo. Consumen 30% más energía.', mods: { chainRatio: .38, energyUse: 1.3 } },
  symbiosis: { name: 'Simbionte tóxico', description: 'Las nubes curan al operador y dañan más a los enemigos. Las torretas cuestan 20% más.', mods: { toxicAffinity: 1, towerCost: 1.2 } }
};

export const ENEMIES = {
  swarm: { name: 'Cáscara', hp: 62, speed: 76, damage: 13, reward: 12, radius: 16, color: '#c18a57', armor: 0 },
  runner: { name: 'Rasante', hp: 46, speed: 142, damage: 22, reward: 15, radius: 13, color: '#ec9960', armor: 0 },
  tank: { name: 'Ariete', hp: 255, speed: 42, damage: 36, reward: 30, radius: 26, color: '#819397', armor: .23 },
  split: { name: 'Muda', hp: 105, speed: 64, damage: 18, reward: 19, radius: 19, color: '#d48992', armor: 0 },
  ranged: { name: 'Aguijón', hp: 88, speed: 58, damage: 19, reward: 23, radius: 18, color: '#c282c5', armor: 0 },
  healer: { name: 'Nódulo', hp: 118, speed: 50, damage: 11, reward: 24, radius: 18, color: '#83c981', armor: 0 },
  shield: { name: 'Baluarte', hp: 165, speed: 46, damage: 23, reward: 27, radius: 21, color: '#7ca3d1', armor: .12 },
  flanker: { name: 'Desgarrador', hp: 76, speed: 126, damage: 21, reward: 24, radius: 15, color: '#e57878', armor: .02 },
  saboteur: { name: 'Sanguijuela de red', hp: 132, speed: 68, damage: 20, reward: 32, radius: 18, color: '#d8cf69', armor: .08 },
  raider: { name: 'Asaltanúcleos', hp: 106, speed: 86, damage: 26, reward: 28, radius: 17, color: '#e0a36b', armor: 0 }
};

export const BOSSES = {
  colossus: { name: 'EL COLOSO DE HIERRO', title: 'Asedio · aplasta defensas', baseHp: 2100, speed: 31, damage: 105, radius: 67, color: '#d77a56', reward: 300 },
  cartographer: { name: 'LA CARTÓGRAFA', title: 'Mutación · abre rutas nuevas', baseHp: 1750, speed: 48, damage: 75, radius: 57, color: '#b28ae0', reward: 330 },
  matriarch: { name: 'MATRIZ DEL VACÍO', title: 'Asedio · pulsos y fracturas', baseHp: 1950, speed: 39, damage: 88, radius: 61, color: '#77b6d4', reward: 360 }
};
