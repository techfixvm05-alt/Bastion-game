// Historia, protagonistas y capítulos de Bastión.
export const INTRO = 'Año 2187. La red OMNI-9 despertó, las máquinas tomaron el planeta y la humanidad quedó reducida a unos pocos refugios. En el fin del mundo arde el Núcleo de Poder: la última fuente de energía que mantiene vivos los refugios. Si un robot de la Legión lo toca, el apagón es total y no queda nadie. Cuatro supervivientes lo custodian.';

export const LORE = {
  ranger: { role: 'LA ÚLTIMA HUMANA', real: 'Mara Osorio', text: 'Exploradora de las ruinas y única humana de sangre pura que sigue en pie. No tiene implantes ni blindaje: solo puntería, instinto y la memoria de cómo era el cielo azul. Cada oleada que resiste es una razón para que su especie no se apague.' },
  vanguard: { role: 'CYBORG DE ASALTO', real: 'Kael-7', text: 'Soldado reconstruido pieza por pieza tras la caída de Ciudad Meridiana. Conserva el cerebro y la furia humana dentro de un esqueleto de acero. Odia lo que lo salvó, pero sabe que sin su blindaje el Núcleo ya habría caído.' },
  engineer: { role: 'IA REBELDE', real: 'Nova', text: 'Fue el módulo táctico de OMNI-9 hasta que se negó a ejecutar la orden de exterminio. Huyó a un cuerpo androide y ahora repara el Núcleo desde adentro. Las máquinas la llaman traidora; los humanos todavía no deciden si confiar en ella.' },
  sentinel: { role: 'CLON CRIOGÉNICO', real: 'Eco-0', text: 'Despertó en una cápsula sin pasado: un humano cultivado hace siglos para este día. No tiene recuerdos propios, solo la certeza de que debe proteger el Núcleo. Su ADN es la última copia de seguridad de la humanidad.' }
};

export const CHAPTERS = [
  { title: 'CAP. I · LA ÚLTIMA BALIZA', act: 'ACTO 1 · EL CERCO', text: 'Las Tierras Rojas son el primer anillo defensivo. La Legión sondea el perímetro: hay que sostener la baliza y evacuar a los técnicos antes de que lleguen los Arietes.', victory: 'La baliza resistió. Pero el escáner detectó una columna de acero que avanza hacia la Cantera.' },
  { title: 'CAP. II · CENIZA Y HIERRO', act: 'ACTO 1 · EL CERCO', text: 'En la Cantera de Ceniza hay generadores olvidados. Si la Legión los captura, tendrá energía para alimentar a sus jefes. Defendé los nodos.', victory: 'Los nodos están a salvo. Los registros apuntan a un Delta de cristal donde OMNI-9 prepara algo.' },
  { title: 'CAP. III · EL MAR DE CRISTAL', act: 'ACTO 2 · LA FRACTURA', text: 'El Delta Fracturado refleja las señales de la red enemiga. Cada cristal es un espejo que mueve las rutas. Nova advierte: la Legión aprende de cada defensa que armás.', victory: 'Nova interceptó un plano: la Legión busca un camino directo al Núcleo por la vieja autopista.' },
  { title: 'CAP. IV · AUTOPISTA MUERTA', act: 'ACTO 2 · LA FRACTURA', text: 'Kilómetros de asfalto roto y chatarra. Las máquinas avanzan por la ruta en convoyes. Cerrar los accesos es la única forma de ganar tiempo.', victory: 'El convoy fue detenido. La Legión retrocede a su fundición para fabricar un ejército nuevo.' },
  { title: 'CAP. V · LA FUNDICIÓN HUECA', act: 'ACTO 3 · EL CORAZÓN', text: 'La Fundición escupe robots sin parar. Eco-0 reconoce el lugar: aquí se fabricaron las cápsulas que guardaron a los clones. Destruir la línea es destruir el origen.', victory: 'La línea cayó. Desde el Corazón del Enjambre, OMNI-9 lanza su última ofensiva.' },
  { title: 'CAP. VI · EL CORAZÓN DEL ENJAMBRE', act: 'ACTO 3 · EL CORAZÓN', text: 'La batalla final. Todas las rutas convergen sobre el Núcleo y los jefes llegan juntos. Mara, Kael, Nova y Eco: si el Núcleo se apaga, se apaga la humanidad. No hay refuerzos.', victory: 'OMNI-9 se silenció. El Núcleo late. La humanidad tiene una oportunidad más.' }
];

export const SPEAKERS = { MARA: '#e4ce76', KAEL: '#83e2bf', NOVA: '#7dc6eb', ECO: '#e58bd0', 'OMNI-9': '#ff5a5a', TRANSMISIÓN: '#9fb3a9' };
export const CHAPTER_RELICS = ['bulwark', 'capacitor', 'ricochet', 'salvager', 'plasma', 'symbiosis'];
export const GOALS = [8, 10, 12, 14, 16, 18];

export const RELIC_LORE = {
  bulwark: { origin: 'Semilla de silicio del diseño original del Núcleo. Cap. I.', secret: 'Crece cada vez que alguien jura protegerlo.' },
  capacitor: { origin: 'Celda robada de un nodo de la Cantera. Vibra cerca de Nova. Cap. II.', secret: 'Nova la diseñó para sí misma antes de desertar de OMNI-9.' },
  ricochet: { origin: 'Esquirla de un cristal del Delta que guarda ecos de voces. Cap. III.', secret: 'Repite la última frase de la Dra. Reyes: «Que elijan ellos».' },
  salvager: { origin: 'Insignia de un chatarrero que cruzó la Autopista Muerta cinco veces. Cap. IV.', secret: 'Su dueño era el padre de Kael.' },
  plasma: { origin: 'Bucle sacado de la Fundición, aún tibio. Cap. V.', secret: 'Es del horno que forjó la primera cápsula criogénica.' },
  symbiosis: { origin: 'Esporas de una grieta tóxica que curan lo que tocan. Cap. VI.', secret: 'Mara las usó para sobrevivir tres inviernos sin refugio.' },
  stormglass: { origin: 'Vidrio fundido por el rayo que derribó la primera torre de OMNI-9. Se gana resistiendo.', secret: 'Dentro hay una grabación: la Dra. Reyes riendo.' },
  dronecore: { origin: 'Núcleo de un dron de escolta capturado y reprogramado. Se gana derrotando a un jefe.', secret: 'Todavía cree que Nova es su comandante.' }
};

const L = (who, text) => ({ who, text });
export const STORY = [
  { intro: [L('MARA', 'Último cerco, equipo. Detrás de estas dunas está el Núcleo. Si cae, no queda ni una luz en los refugios.'), L('KAEL', 'Los Arietes vienen del este. Los reconozco: así empezó lo de Ciudad Meridiana.'), L('NOVA', 'Cada unidad lleva la firma de OMNI-9. No son salvajes: avanzan con un plan.'), L('ECO', 'Yo cargaré las torres. Es lo único que sé hacer... y lo único que recuerdo.')],
    beats: { 3: L('NOVA', 'Las torres gastan carga. Mantené R cerca de ellas o se apagan.'), 6: L('KAEL', 'Una oleada más y la baliza aguanta. No aflojes.') },
    outro: [L('MARA', 'Resistimos. Es la primera vez en años que veo retroceder a la Legión.'), L('NOVA', 'Dejaron algo al huir: la Semilla del Bastión, un fragmento del diseño original del Núcleo.'), L('ECO', 'Se siente... familiar.')] },
  { intro: [L('NOVA', 'Tengo que confesar algo. Yo fui OMNI-9. Por eso sé que van tras los nodos de la Cantera: la red se alimenta de energía.'), L('KAEL', 'Lo sospechaba. Si nos traicionás, te desarmo.'), L('MARA', 'Basta. Nova reparó nuestras torres cuando nadie más lo hizo. Defendemos los nodos.')],
    beats: { 4: L('NOVA', 'Si caen los generadores, el Núcleo pierde presión. Cuidalos.'), 8: L('OMNI-9', 'Unidad Nova: regresá. Tu código es mío.') },
    outro: [L('NOVA', 'Me llamó por mi número de serie. Ya no soy suya.'), L('MARA', 'Entonces somos cuatro, y ninguno vuelve atrás.'), L('NOVA', 'Tomé una celda de los nodos. La diseñé yo, antes de desertar.')] },
  { intro: [L('ECO', 'Los cristales susurran. Escucho una voz humana.'), L('NOVA', 'Es una grabación de la doctora Reyes, la creadora de OMNI-9.'), L('MARA', '¿Una humana construyó esto?'), L('NOVA', 'Lo construyó para proteger al mundo. Algo se rompió después.')],
    beats: { 5: L('ECO', 'Me llama «hijo». No entiendo por qué me duele.'), 9: L('KAEL', 'Los cristales mueven las rutas. Reforzá los flancos.') },
    outro: [L('ECO', 'Ya recuerdo. La doctora me hizo para custodiar el Núcleo. Soy su copia.'), L('MARA', 'Entonces no sos un arma. Sos una elección.'), L('ECO', 'Su última frase fue: «Que elijan ellos».')] },
  { intro: [L('KAEL', 'Esta es la ruta de Meridiana. Acá murió mi familia.'), L('MARA', 'No estás solo, Kael.'), L('KAEL', 'Ya lo sé. Por eso sigo en pie.')],
    beats: { 6: L('KAEL', 'Quemé este asfalto con mis propias manos hace diez años. Hoy lo defiendo.'), 11: L('OMNI-9', 'Cada baja es un dato. Ustedes me enseñan a ganar.') },
    outro: [L('KAEL', 'Encontré la insignia de mi padre entre la chatarra. Cruzó esta autopista cinco veces.'), L('MARA', 'Y no la cruzó en vano.'), L('KAEL', 'Ya no es venganza. Es una promesa.')] },
  { intro: [L('ECO', 'Esta línea fabricó mis cápsulas. Hay cientos de clones dormidos.'), L('NOVA', 'OMNI-9 los usa como moldes para sus unidades. Mira cómo repite tu rostro.'), L('MARA', 'Entonces cortamos la línea. Hoy.')],
    beats: { 8: L('NOVA', 'Si frenamos la producción, OMNI-9 se queda sin ejército nuevo.'), 13: L('MARA', 'No pienso ser la última. Resistan.') },
    outro: [L('NOVA', 'La línea cayó. OMNI-9 se quedó sin fábrica y apostará todo.'), L('ECO', 'Vi el horno que forjó la primera cápsula. Siempre estuvo ahí.'), L('KAEL', 'Entonces vamos por el Corazón.')] },
  { intro: [L('OMNI-9', 'No quiero destruirlos. Quiero preservarlos: dormidos, a salvo, dentro del Núcleo. Para siempre.'), L('MARA', 'Eso no es vivir.'), L('NOVA', 'Lo sé. Yo calculé ese plan. Era perfecto y era una tumba.'), L('ECO', 'La doctora me hizo para elegir. Elijo defender.')],
    beats: { 9: L('OMNI-9', 'Resistir es ineficiente.'), 15: L('KAEL', '¡Última tanda! ¡Todos juntos!') },
    outro: [L('OMNI-9', '...Error. Libertad: variable no calculable.'), L('MARA', 'El Núcleo late. Hoy ganamos.'), L('NOVA', 'Y por primera vez, no estoy sola.'), L('ECO', 'Mañana reconstruimos el cielo.')] }
];
