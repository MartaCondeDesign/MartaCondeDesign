/* ==========================================================================
   NovaFit — datos locales simulados
   No hay backend ni APIs externas: todo vive en este archivo y en
   localStorage (ver app.js). Editar aquí para cambiar el catálogo de clases.
   ========================================================================== */

var APP_NAME = "NovaFit";

/**
 * Franjas horarias usadas por el filtro "Horario".
 * mañana: 06:00–11:59 · tarde: 12:00–18:59 · noche: 19:00–22:00
 */
var TIME_OF_DAY_LABELS = {
  manana: "Mañana",
  tarde: "Tarde",
  noche: "Noche"
};

var CLASSES = [
  {
    id: "hiit-extremo",
    name: "HIIT Extremo",
    discipline: "HIIT",
    day: "Lunes",
    date: "20 jul",
    time: "18:30",
    timeOfDay: "tarde",
    duration: 45,
    instructor: "Carlos Ruiz",
    level: "Avanzado",
    capacity: 12,
    available: 3,
    description: "Entrenamiento por intervalos de alta intensidad en grupo reducido. Trae toalla y botella de agua."
  },
  {
    id: "yoga-suave",
    name: "Yoga Suave",
    discipline: "Yoga",
    day: "Lunes",
    date: "20 jul",
    time: "19:30",
    timeOfDay: "noche",
    duration: 60,
    instructor: "Laura Gómez",
    level: "Principiante",
    capacity: 15,
    available: 6,
    description: "Sesión de yoga a ritmo suave enfocada en movilidad y respiración. Ideal para desconectar tras el trabajo."
  },
  {
    id: "spinning-power",
    name: "Spinning Power",
    discipline: "Spinning",
    day: "Martes",
    date: "21 jul",
    time: "19:00",
    timeOfDay: "noche",
    duration: 45,
    instructor: "Diego Fernández",
    level: "Intermedio",
    capacity: 10,
    available: 0,
    description: "Rodaje en bicicleta estática con cambios de ritmo e intensidad guiados por música."
  },
  {
    id: "pilates-reformer",
    name: "Pilates Reformer",
    discipline: "Pilates",
    day: "Miércoles",
    date: "22 jul",
    time: "09:00",
    timeOfDay: "manana",
    duration: 50,
    instructor: "Marina López",
    level: "Todos los niveles",
    capacity: 8,
    available: 5,
    description: "Trabajo de fuerza y control postural con máquina reformer. Grupos reducidos."
  },
  {
    id: "boxeo-fitness",
    name: "Boxeo Fitness",
    discipline: "Boxeo",
    day: "Miércoles",
    date: "22 jul",
    time: "20:00",
    timeOfDay: "noche",
    duration: 45,
    instructor: "Javier Torres",
    level: "Intermedio",
    capacity: 12,
    available: 2,
    description: "Combinaciones de boxeo sobre saco combinadas con ejercicios de suelo. No hace falta experiencia previa."
  },
  {
    id: "zumba-party",
    name: "Zumba Party",
    discipline: "Zumba",
    day: "Jueves",
    date: "23 jul",
    time: "18:00",
    timeOfDay: "tarde",
    duration: 55,
    instructor: "Sofía Martín",
    level: "Todos los niveles",
    capacity: 20,
    available: 10,
    description: "Coreografías sencillas con música latina. Una clase pensada para disfrutar en grupo."
  }
];

function getClassById(id) {
  for (var i = 0; i < CLASSES.length; i++) {
    if (CLASSES[i].id === id) return CLASSES[i];
  }
  return null;
}

function getDisciplines() {
  var seen = {};
  var list = [];
  CLASSES.forEach(function (c) {
    if (!seen[c.discipline]) {
      seen[c.discipline] = true;
      list.push(c.discipline);
    }
  });
  return list;
}

function getLevels() {
  var seen = {};
  var list = [];
  CLASSES.forEach(function (c) {
    if (!seen[c.level]) {
      seen[c.level] = true;
      list.push(c.level);
    }
  });
  return list;
}
