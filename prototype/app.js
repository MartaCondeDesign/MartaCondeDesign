/* ==========================================================================
   NovaFit — lógica del prototipo (estructura y flujo principal)
   Sin frameworks ni dependencias externas. Datos y estado 100% locales.
   ========================================================================== */

var STORAGE_KEY = "novafit_prototype_v1";
var LEVEL_ORDER = ["Principiante", "Intermedio", "Avanzado", "Todos los niveles"];

var state = {
  route: { name: "home", params: {} },
  historyStack: [],
  search: "",
  filters: { discipline: "todas", time: "todas", level: "todos" },
  bookings: [],
  seats: {},
  sheet: null
};

var toastTimer = null;

/* ---- Utilidades ---------------------------------------------------------*/
function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, function (ch) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
  });
}
function attr(obj) {
  return JSON.stringify(obj || {}).replace(/"/g, "&quot;");
}
function normalize(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/* ---- Persistencia local (simulada, sin backend) -------------------------*/
function loadPersisted() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ seats: state.seats, bookings: state.bookings }));
  } catch (e) {
    /* localStorage no disponible: el prototipo sigue funcionando en memoria */
  }
}

function initState() {
  CLASSES.forEach(function (c) {
    state.seats[c.id] = c.available;
  });
  var persisted = loadPersisted();
  if (persisted) {
    if (persisted.seats) {
      Object.keys(persisted.seats).forEach(function (id) {
        if (state.seats.hasOwnProperty(id)) state.seats[id] = persisted.seats[id];
      });
    }
    if (persisted.bookings) state.bookings = persisted.bookings;
  }
}

/* ---- Reglas de negocio (reserva / cancelación) ---------------------------*/
function hasActiveBooking(classId) {
  for (var i = 0; i < state.bookings.length; i++) {
    var b = state.bookings[i];
    if (b.classId === classId && b.status === "confirmed") return b;
  }
  return null;
}

function bookClass(classId) {
  var seats = state.seats[classId];
  if (seats <= 0 || hasActiveBooking(classId)) return null;
  state.seats[classId] = seats - 1;
  var booking = { id: "bk_" + Date.now(), classId: classId, status: "confirmed", createdAt: Date.now() };
  state.bookings.unshift(booking);
  persist();
  return booking;
}

function cancelBooking(bookingId) {
  var booking = null;
  for (var i = 0; i < state.bookings.length; i++) {
    if (state.bookings[i].id === bookingId) { booking = state.bookings[i]; break; }
  }
  if (!booking || booking.status !== "confirmed") return null;
  booking.status = "cancelled";
  var cls = getClassById(booking.classId);
  var cap = cls ? cls.capacity : Infinity;
  state.seats[booking.classId] = Math.min(cap, (state.seats[booking.classId] || 0) + 1);
  persist();
  return booking;
}

/* ---- Filtro de clases ------------------------------------------------- */
function hasActiveFilters() {
  return (
    state.search.trim() !== "" ||
    state.filters.discipline !== "todas" ||
    state.filters.time !== "todas" ||
    state.filters.level !== "todos"
  );
}

function filteredClasses() {
  var q = normalize(state.search.trim());
  return CLASSES.filter(function (c) {
    if (state.filters.discipline !== "todas" && c.discipline !== state.filters.discipline) return false;
    if (state.filters.time !== "todas" && c.timeOfDay !== state.filters.time) return false;
    if (state.filters.level !== "todos" && c.level !== state.filters.level) return false;
    if (q && normalize(c.name).indexOf(q) === -1) return false;
    return true;
  });
}

/* ---- Navegación --------------------------------------------------------*/
function navigate(name, params, opts) {
  opts = opts || {};
  if (!opts.replace) state.historyStack.push(state.route);
  state.route = { name: name, params: params || {} };
  render({});
}
function navigateTab(name) {
  state.historyStack = [];
  state.route = { name: name, params: {} };
  render({});
}
function goBack() {
  var prev = state.historyStack.pop();
  state.route = prev || { name: "home", params: {} };
  render({});
}

function setFilter(group, value) {
  state.filters[group] = value;
  render({ preserveFocus: true });
}
function clearFilters() {
  state.search = "";
  state.filters = { discipline: "todas", time: "todas", level: "todos" };
  render({ silent: true });
  var input = document.getElementById("search-input");
  if (input) input.focus();
}

/* ---- Bottom sheet (confirmación de reserva / cancelación) ---------------*/
function openSheet(sheetState) {
  state.sheet = sheetState;
  renderSheetRoot();
  var sheetEl = document.querySelector(".sheet");
  var btn = sheetEl && sheetEl.querySelector(".btn");
  if (btn) btn.focus();
}
function closeSheetSilent() {
  state.sheet = null;
  renderSheetRoot();
}
function closeSheet() {
  closeSheetSilent();
}

function handleConfirmBook(classId) {
  var booking = bookClass(classId);
  closeSheetSilent();
  if (booking) {
    navigate("confirm", { bookingId: booking.id });
  } else {
    showToast("Ya no quedan plazas para esta clase.", Icon.xCircle("icon--sm"));
    render({ silent: true });
  }
}
function handleConfirmCancel(bookingId) {
  var booking = cancelBooking(bookingId);
  closeSheetSilent();
  if (booking) showToast("Reserva cancelada", Icon.checkCircle("icon--sm"));
  render({ silent: true });
}

function sheetHtml(sheet) {
  if (sheet.type === "book") {
    var cls = getClassById(sheet.classId);
    if (!cls) return "";
    return (
      '<div class="backdrop" data-sheet-backdrop="true">' +
        '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">' +
          '<div class="sheet__handle"></div>' +
          '<h2 class="sheet__title" id="sheet-title">Confirmar reserva</h2>' +
          '<p class="screen-subtitle">Vas a reservar una plaza para esta clase.</p>' +
          '<div class="sheet__summary">' +
            '<div class="class-card__name">' + escapeHtml(cls.name) + "</div>" +
            '<div class="class-card__meta">' +
              '<span class="meta-item">' + Icon.calendar("icon--sm") + " " + escapeHtml(cls.day) + " " + escapeHtml(cls.date) + " · " + escapeHtml(cls.time) + "</span>" +
              '<span class="meta-item">' + Icon.user("icon--sm") + " " + escapeHtml(cls.instructor) + "</span>" +
            "</div>" +
          "</div>" +
          '<div class="sheet__actions">' +
            '<button type="button" class="btn btn--primary" data-action="confirm-book" data-id="' + cls.id + '">' + Icon.checkCircle("icon--sm") + " Confirmar reserva</button>" +
            '<button type="button" class="btn btn--text" data-action="close-sheet">Cancelar</button>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }
  if (sheet.type === "cancel") {
    var booking = null;
    for (var i = 0; i < state.bookings.length; i++) {
      if (state.bookings[i].id === sheet.bookingId) { booking = state.bookings[i]; break; }
    }
    if (!booking) return "";
    var bcls = getClassById(booking.classId);
    return (
      '<div class="backdrop" data-sheet-backdrop="true">' +
        '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">' +
          '<div class="sheet__handle"></div>' +
          '<h2 class="sheet__title" id="sheet-title">Cancelar reserva</h2>' +
          '<p class="screen-subtitle">Se liberará tu plaza. Esta acción no se puede deshacer.</p>' +
          '<div class="sheet__summary">' +
            '<div class="class-card__name">' + escapeHtml(bcls ? bcls.name : "") + "</div>" +
            '<div class="class-card__meta">' +
              '<span class="meta-item">' + Icon.calendar("icon--sm") + " " + escapeHtml(bcls ? bcls.day + " " + bcls.date : "") + " · " + escapeHtml(bcls ? bcls.time : "") + "</span>" +
            "</div>" +
          "</div>" +
          '<div class="sheet__actions">' +
            '<button type="button" class="btn btn--danger" data-action="confirm-cancel" data-booking-id="' + booking.id + '">' + Icon.xCircle("icon--sm") + " Cancelar reserva</button>" +
            '<button type="button" class="btn btn--text" data-action="close-sheet">Volver</button>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }
  return "";
}

function renderSheetRoot() {
  var root = document.getElementById("sheet-root");
  root.innerHTML = state.sheet ? sheetHtml(state.sheet) : "";
}

/* ---- Toast --------------------------------------------------------------*/
function showToast(message, iconHtml) {
  var root = document.getElementById("toast-root");
  root.innerHTML = '<div class="toast" role="status">' + (iconHtml || "") + "<span>" + escapeHtml(message) + "</span></div>";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    root.innerHTML = "";
  }, 2600);
}

/* ---- Fragmentos reutilizables --------------------------------------------*/
function detailRow(iconHtml, label, value) {
  return (
    '<div class="detail-row">' + iconHtml +
      '<div><div class="detail-row__label">' + escapeHtml(label) + '</div>' +
      '<div class="detail-row__value">' + escapeHtml(value) + "</div></div>" +
    "</div>"
  );
}

function seatsInfo(cls) {
  var seats = state.seats[cls.id];
  if (seats <= 0) return { label: "Completa", cls: "badge--full", icon: Icon.lock("icon--sm") };
  if (seats <= 2) return { label: seats + " plazas", cls: "badge--low", icon: Icon.users("icon--sm") };
  return { label: seats + " plazas", cls: "badge--available", icon: Icon.users("icon--sm") };
}

function classCardHtml(cls) {
  var info = seatsInfo(cls);
  var booked = hasActiveBooking(cls.id);
  return (
    '<button type="button" class="class-card" data-action="open-class" data-id="' + cls.id + '">' +
      '<div class="class-card__top">' +
        "<div>" +
          '<span class="class-card__discipline">' + Icon.compass("icon--sm") + " " + escapeHtml(cls.discipline) + "</span>" +
          '<div class="class-card__name">' + escapeHtml(cls.name) + "</div>" +
        "</div>" +
        (booked ? '<span class="badge badge--success">' + Icon.checkCircle("icon--sm") + " Reservada</span>" : "") +
      "</div>" +
      '<div class="class-card__meta">' +
        '<span class="meta-item">' + Icon.calendar("icon--sm") + " " + escapeHtml(cls.day) + " " + escapeHtml(cls.date) + " · " + escapeHtml(cls.time) + "</span>" +
        '<span class="meta-item">' + Icon.clock("icon--sm") + " " + cls.duration + " min</span>" +
        '<span class="meta-item">' + Icon.user("icon--sm") + " " + escapeHtml(cls.instructor) + "</span>" +
      "</div>" +
      '<div class="class-card__footer">' +
        '<span class="badge ' + info.cls + '">' + info.icon + " " + info.label + "</span>" +
        '<span class="badge badge--neutral">' + escapeHtml(cls.level) + "</span>" +
      "</div>" +
    "</button>"
  );
}

function bookingCardHtml(booking) {
  var cls = getClassById(booking.classId);
  if (!cls) return "";
  var isCancelled = booking.status === "cancelled";
  return (
    '<div class="card booking-card' + (isCancelled ? " booking-card--cancelled" : "") + '">' +
      '<div class="class-card__top">' +
        "<div>" +
          '<span class="class-card__discipline">' + Icon.compass("icon--sm") + " " + escapeHtml(cls.discipline) + "</span>" +
          '<div class="class-card__name">' + escapeHtml(cls.name) + "</div>" +
        "</div>" +
        (isCancelled
          ? '<span class="badge badge--cancelled">' + Icon.xCircle("icon--sm") + " Cancelada</span>"
          : '<span class="badge badge--success">' + Icon.checkCircle("icon--sm") + " Confirmada</span>") +
      "</div>" +
      '<div class="class-card__meta">' +
        '<span class="meta-item">' + Icon.calendar("icon--sm") + " " + escapeHtml(cls.day) + " " + escapeHtml(cls.date) + " · " + escapeHtml(cls.time) + "</span>" +
        '<span class="meta-item">' + Icon.user("icon--sm") + " " + escapeHtml(cls.instructor) + "</span>" +
      "</div>" +
      '<div class="class-card__footer">' +
        '<button type="button" class="btn btn--secondary btn--auto" data-action="open-class" data-id="' + cls.id + '">Ver detalle</button>' +
        (isCancelled ? "" : '<button type="button" class="btn btn--danger btn--auto" data-action="request-cancel" data-booking-id="' + booking.id + '">Cancelar</button>') +
      "</div>" +
    "</div>"
  );
}

function notFoundHtml(title, text, route, cta) {
  return (
    '<div class="empty-state">' + Icon.info("icon--xl") +
      '<div class="empty-state__title">' + escapeHtml(title) + "</div>" +
      '<p class="empty-state__text">' + escapeHtml(text) + "</p>" +
      '<button type="button" class="btn btn--primary btn--auto" data-action="nav-tab" data-route="' + route + '">' + escapeHtml(cta) + "</button>" +
    "</div>"
  );
}

function chipGroup(label, group, options, current) {
  var html = '<div class="field" role="group" aria-label="' + escapeHtml(label) + '">' +
    '<span class="field__label">' + escapeHtml(label) + "</span>" +
    '<div class="chip-group">';
  options.forEach(function (opt) {
    var pressed = opt.value === current;
    html += '<button type="button" class="chip" data-action="set-filter" data-group="' + group + '" data-value="' + escapeHtml(opt.value) + '" aria-pressed="' + pressed + '">' + escapeHtml(opt.text) + "</button>";
  });
  html += "</div></div>";
  return html;
}

/* ---- Pantallas ------------------------------------------------------------*/
function renderHome() {
  var upcomingCount = state.bookings.filter(function (b) { return b.status === "confirmed"; }).length;
  var preview = CLASSES.slice(0, 3);

  var html =
    '<h1 class="screen-title">¡Hola!</h1>' +
    '<p class="screen-subtitle">Encuentra tu próxima clase y resérvala en menos de dos minutos.</p>' +
    '<div class="section">' +
      '<div class="hero-cta">' +
        '<div class="hero-cta__title">Explora las clases de esta semana</div>' +
        '<p class="hero-cta__text">Filtra por disciplina, horario o nivel para encontrar tu hueco perfecto.</p>' +
        '<button type="button" class="btn btn--primary" data-action="navigate" data-route="explore" data-params="' + attr({}) + '">Ver todas las clases ' + Icon.arrowRight("icon--sm") + "</button>" +
      "</div>" +
    "</div>";

  if (upcomingCount > 0) {
    html +=
      '<div class="section">' +
        '<button type="button" class="bookings-banner" data-action="nav-tab" data-route="bookings">' +
          '<span class="bookings-banner__icon">' + Icon.ticket("icon") + "</span>" +
          '<span class="bookings-banner__body">' +
            '<span class="bookings-banner__title">Tienes ' + upcomingCount + (upcomingCount === 1 ? " reserva próxima" : " reservas próximas") + "</span><br>" +
            '<span class="bookings-banner__text">Consulta el día, la hora y cancela si lo necesitas.</span>' +
          "</span>" +
          '<span class="bookings-banner__chevron">' + Icon.chevronRight("icon--sm") + "</span>" +
        "</button>" +
      "</div>";
  }

  html +=
    '<div class="section">' +
      '<div class="section__row">' +
        '<span class="section__heading">Buscar por horario</span>' +
      "</div>" +
      '<div class="chip-group">' +
        Object.keys(TIME_OF_DAY_LABELS).map(function (key) {
          return '<button type="button" class="chip" data-action="navigate" data-route="explore" data-params="' + attr({ presetTime: key }) + '">' + escapeHtml(TIME_OF_DAY_LABELS[key]) + "</button>";
        }).join("") +
      "</div>" +
    "</div>";

  html +=
    '<div class="section">' +
      '<div class="section__row">' +
        '<span class="section__heading">Próximas clases</span>' +
        '<button type="button" class="btn btn--text" data-action="navigate" data-route="explore" data-params="' + attr({}) + '">Ver todas</button>' +
      "</div>" +
      preview.map(classCardHtml).join("") +
    "</div>";

  return html;
}

function renderExplore() {
  var results = filteredClasses();
  var disciplineOptions = [{ value: "todas", text: "Todas" }].concat(getDisciplines().map(function (d) { return { value: d, text: d }; }));
  var timeOptions = [{ value: "todas", text: "Todas" }].concat(Object.keys(TIME_OF_DAY_LABELS).map(function (k) { return { value: k, text: TIME_OF_DAY_LABELS[k] }; }));
  var levelOptions = [{ value: "todos", text: "Todos" }].concat(LEVEL_ORDER.map(function (l) { return { value: l, text: l }; }));

  var html =
    '<h1 class="screen-title">Explorar clases</h1>' +
    '<p class="screen-subtitle">Busca por nombre o usa los filtros para encontrar tu clase.</p>' +
    '<div class="section">' +
      '<div class="field">' +
        '<label class="field__label" for="search-input">Buscar clase</label>' +
        '<div class="field__control">' +
          Icon.search("") +
          '<input type="search" id="search-input" class="field__input" placeholder="Ej. Yoga, HIIT, Zumba…" value="' + escapeHtml(state.search) + '" autocomplete="off">' +
        "</div>" +
      "</div>" +
    "</div>" +
    '<div class="section">' +
      '<div class="section__heading">' + Icon.filter("icon--sm") + " Filtros</div>" +
      '<div class="filter-groups">' +
        chipGroup("Disciplina", "discipline", disciplineOptions, state.filters.discipline) +
        chipGroup("Horario", "time", timeOptions, state.filters.time) +
        chipGroup("Nivel", "level", levelOptions, state.filters.level) +
      "</div>" +
      (hasActiveFilters()
        ? '<div class="active-filters-bar"><span class="active-filters-bar__text">Filtros aplicados</span><button type="button" class="btn btn--text" data-action="clear-filters">Limpiar filtros</button></div>'
        : "") +
    "</div>" +
    '<div class="section">' +
      '<p class="result-count" aria-live="polite">' + results.length + (results.length === 1 ? " clase encontrada" : " clases encontradas") + "</p>" +
      (results.length
        ? '<div class="result-list">' + results.map(classCardHtml).join("") + "</div>"
        : '<div class="result-empty">' +
            '<div class="empty-state">' + Icon.search("icon--xl") +
              '<div class="empty-state__title">Sin resultados</div>' +
              '<p class="empty-state__text">No hay clases que coincidan' + (state.search.trim() ? ' con &quot;' + escapeHtml(state.search) + '&quot;' : "") + ". Prueba a cambiar la búsqueda o restablece los filtros." + "</p>" +
              '<button type="button" class="btn btn--secondary btn--auto" data-action="clear-filters">Restablecer filtros</button>' +
            "</div>" +
          "</div>") +
    "</div>";

  return html;
}

function renderDetail(id) {
  var cls = getClassById(id);
  if (!cls) return '<h1 class="screen-title visually-hidden">Clase no encontrada</h1>' + notFoundHtml("Clase no encontrada", "Vuelve al listado para elegir otra clase.", "explore", "Ver clases");

  var seats = state.seats[cls.id];
  var full = seats <= 0;
  var booking = hasActiveBooking(cls.id);
  var fillPercent = Math.round(((cls.capacity - seats) / cls.capacity) * 100);

  var html =
    '<h1 class="screen-title visually-hidden">' + escapeHtml(cls.name) + "</h1>" +
    '<div class="detail-header-card">' +
      '<span class="class-card__discipline">' + Icon.compass("icon--sm") + " " + escapeHtml(cls.discipline) + "</span>" +
      '<div class="detail-title">' + escapeHtml(cls.name) + "</div>" +
      (booking ? '<div class="detail-header-card__badge"><span class="badge badge--success">' + Icon.checkCircle("icon--sm") + " Ya tienes esta clase reservada</span></div>" : "") +
    "</div>" +
    '<div class="detail-list">' +
      detailRow(Icon.calendar("icon"), "Día y hora", cls.day + " " + cls.date + " · " + cls.time) +
      detailRow(Icon.clock("icon"), "Duración", cls.duration + " min") +
      detailRow(Icon.user("icon"), "Instructor/a", cls.instructor) +
      detailRow(Icon.users("icon"), "Nivel", cls.level) +
    "</div>" +
    '<div class="capacity-block">' +
      '<span class="field__label">Disponibilidad</span>' +
      '<div class="capacity-bar"><div class="capacity-bar__fill' + (full ? " capacity-bar__fill--full" : "") + '" style="width:' + fillPercent + '%"></div></div>' +
      '<p class="capacity-text">' + (full ? "Clase completa · 0 plazas disponibles" : seats + " de " + cls.capacity + " plazas disponibles") + "</p>" +
    "</div>" +
    '<div class="description-block">' +
      '<span class="field__label">Sobre la clase</span>' +
      "<p>" + escapeHtml(cls.description) + "</p>" +
    "</div>";

  if (booking) {
    html += '<div class="detail-action-bar"><button type="button" class="btn btn--danger" data-action="request-cancel" data-booking-id="' + booking.id + '">' + Icon.xCircle("icon--sm") + " Cancelar reserva</button></div>";
  } else if (full) {
    html += '<div class="detail-action-bar"><button type="button" class="btn" aria-disabled="true" disabled>' + Icon.lock("icon--sm") + " Clase completa</button></div>";
  } else {
    html += '<div class="detail-action-bar"><button type="button" class="btn btn--primary" data-action="request-book" data-id="' + cls.id + '">' + Icon.checkCircle("icon--sm") + " Reservar plaza</button></div>";
  }

  return html;
}

function renderConfirmation(bookingId) {
  var booking = null;
  for (var i = 0; i < state.bookings.length; i++) {
    if (state.bookings[i].id === bookingId) { booking = state.bookings[i]; break; }
  }
  if (!booking) return '<h1 class="screen-title visually-hidden">Reserva no encontrada</h1>' + notFoundHtml("No se encontró la reserva", "Vuelve al inicio para explorar las clases disponibles.", "home", "Ir al inicio");

  var cls = getClassById(booking.classId);

  return (
    '<h1 class="screen-title visually-hidden">Reserva confirmada</h1>' +
    '<div class="confirmation-hero">' +
      '<div class="confirmation-hero__icon">' + Icon.checkCircle("icon--xl") + "</div>" +
      '<div class="confirmation-hero__title">¡Plaza reservada!</div>' +
      '<p class="confirmation-hero__text">Te esperamos. Llega 5 minutos antes de que empiece la clase.</p>' +
    "</div>" +
    '<div class="card">' +
      '<span class="class-card__discipline">' + Icon.compass("icon--sm") + " " + escapeHtml(cls.discipline) + "</span>" +
      '<div class="detail-title">' + escapeHtml(cls.name) + "</div>" +
      '<div class="detail-list">' +
        detailRow(Icon.calendar("icon"), "Día y hora", cls.day + " " + cls.date + " · " + cls.time) +
        detailRow(Icon.clock("icon"), "Duración", cls.duration + " min") +
        detailRow(Icon.user("icon"), "Instructor/a", cls.instructor) +
      "</div>" +
    "</div>" +
    '<div class="confirmation-actions">' +
      '<button type="button" class="btn btn--primary" data-action="nav-tab" data-route="bookings">' + Icon.ticket("icon--sm") + " Ver mis reservas</button>" +
      '<button type="button" class="btn btn--secondary" data-action="nav-tab" data-route="home">Volver al inicio</button>' +
    "</div>"
  );
}

function renderBookings() {
  var confirmed = state.bookings.filter(function (b) { return b.status === "confirmed"; }).sort(function (a, b) { return b.createdAt - a.createdAt; });
  var cancelled = state.bookings.filter(function (b) { return b.status === "cancelled"; }).sort(function (a, b) { return b.createdAt - a.createdAt; });

  var html = '<h1 class="screen-title">Mis reservas</h1>';

  if (state.bookings.length === 0) {
    html += '<p class="screen-subtitle">Todavía no has reservado ninguna clase.</p>' +
      '<div class="section">' +
        '<div class="empty-state">' + Icon.ticket("icon--xl") +
          '<div class="empty-state__title">Todavía no tienes reservas</div>' +
          '<p class="empty-state__text">Cuando reserves una clase, aparecerá aquí para que puedas consultarla o cancelarla.</p>' +
          '<button type="button" class="btn btn--primary btn--auto" data-action="nav-tab" data-route="explore">Explorar clases</button>' +
        "</div>" +
      "</div>";
    return html;
  }

  html += '<p class="screen-subtitle">Gestiona tus próximas clases y consulta tu historial.</p>';

  html += '<div class="section"><div class="section__heading">Próximas (' + confirmed.length + ")</div>";
  html += confirmed.length ? confirmed.map(bookingCardHtml).join("") : '<p class="screen-subtitle">No tienes reservas próximas.</p>';
  html += "</div>";

  if (cancelled.length) {
    html += '<div class="section"><div class="section__heading">Canceladas (' + cancelled.length + ")</div>";
    html += cancelled.map(bookingCardHtml).join("");
    html += "</div>";
  }

  return html;
}

/* ---- Cabecera y render principal -----------------------------------------*/
function headerHtml() {
  switch (state.route.name) {
    case "home":
      return '<span class="app-header__brand">' + APP_NAME + "</span>";
    case "explore":
      return backButtonHtml() + '<span class="app-header__title">Explorar clases</span>';
    case "detail": {
      var cls = getClassById(state.route.params.id);
      return backButtonHtml() + '<span class="app-header__title">' + (cls ? escapeHtml(cls.name) : "Detalle de clase") + "</span>";
    }
    case "confirm":
      return '<span class="app-header__title">Reserva confirmada</span>';
    case "bookings":
      return backButtonHtml() + '<span class="app-header__title">Mis reservas</span>';
    default:
      return '<span class="app-header__brand">' + APP_NAME + "</span>";
  }
}
function backButtonHtml() {
  return '<button type="button" class="app-header__back" data-action="go-back" aria-label="Volver">' + Icon.chevronLeft("") + "</button>";
}

function mainHtml() {
  switch (state.route.name) {
    case "home": return renderHome();
    case "explore": return renderExplore();
    case "detail": return renderDetail(state.route.params.id);
    case "confirm": return renderConfirmation(state.route.params.bookingId);
    case "bookings": return renderBookings();
    default: return renderHome();
  }
}

function updateNavActive() {
  var section = state.route.name === "home" ? "home" : state.route.name === "bookings" ? "bookings" : "explore";
  ["home", "explore", "bookings"].forEach(function (name) {
    var el = document.getElementById("nav-" + name);
    if (!el) return;
    if (name === section) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  });
  var badge = document.getElementById("nav-bookings-badge");
  if (badge) {
    var count = state.bookings.filter(function (b) { return b.status === "confirmed"; }).length;
    badge.textContent = count > 0 ? String(count) : "";
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

function captureFocus() {
  var el = document.activeElement;
  if (!el || el === document.body) return null;
  if (el.id) return { byId: el.id, selStart: el.selectionStart, selEnd: el.selectionEnd };
  if (el.dataset && el.dataset.action) {
    return { byData: { action: el.dataset.action, group: el.dataset.group, value: el.dataset.value } };
  }
  return null;
}
function restoreFocus(info) {
  if (!info) return;
  if (info.byId) {
    var el = document.getElementById(info.byId);
    if (el) {
      el.focus();
      if (typeof info.selStart === "number" && el.setSelectionRange) {
        try { el.setSelectionRange(info.selStart, info.selEnd); } catch (e) { /* no-op */ }
      }
    }
    return;
  }
  if (info.byData) {
    var sel = '[data-action="' + info.byData.action + '"]';
    if (info.byData.group) sel += '[data-group="' + info.byData.group + '"]';
    if (info.byData.value) sel += '[data-value="' + CSS.escape(info.byData.value) + '"]';
    var target = document.querySelector(sel);
    if (target) target.focus();
  }
}

function render(opts) {
  opts = opts || {};
  var focusInfo = opts.preserveFocus ? captureFocus() : null;

  document.getElementById("app-header").innerHTML = headerHtml();
  var main = document.getElementById("app");
  main.innerHTML = mainHtml();

  updateNavActive();

  if (focusInfo) {
    restoreFocus(focusInfo);
  } else if (!opts.silent) {
    main.scrollTop = 0;
    var heading = main.querySelector(".screen-title");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }
}

/* ---- Delegación de eventos -------------------------------------------- */
function attachEvents() {
  document.addEventListener("click", function (e) {
    if (e.target && e.target.dataset && e.target.dataset.sheetBackdrop) {
      closeSheet();
      return;
    }
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var action = el.dataset.action;

    switch (action) {
      case "navigate": {
        var route = el.dataset.route;
        var params = el.dataset.params ? JSON.parse(el.dataset.params) : {};
        if (params.presetTime) { state.filters.time = params.presetTime; delete params.presetTime; }
        if (params.presetLevel) { state.filters.level = params.presetLevel; delete params.presetLevel; }
        navigate(route, params);
        break;
      }
      case "nav-tab":
        navigateTab(el.dataset.route);
        break;
      case "go-back":
        goBack();
        break;
      case "open-class":
        navigate("detail", { id: el.dataset.id });
        break;
      case "set-filter":
        setFilter(el.dataset.group, el.dataset.value);
        break;
      case "clear-filters":
        clearFilters();
        break;
      case "request-book":
        openSheet({ type: "book", classId: el.dataset.id });
        break;
      case "request-cancel":
        openSheet({ type: "cancel", bookingId: el.dataset.bookingId });
        break;
      case "confirm-book":
        handleConfirmBook(el.dataset.id);
        break;
      case "confirm-cancel":
        handleConfirmCancel(el.dataset.bookingId);
        break;
      case "close-sheet":
        closeSheet();
        break;
    }
  });

  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "search-input") {
      state.search = e.target.value;
      render({ preserveFocus: true });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.sheet) closeSheet();
  });
}

/* ---- Arranque ------------------------------------------------------------*/
document.addEventListener("DOMContentLoaded", function () {
  initState();
  attachEvents();
  render({ silent: true });
});
