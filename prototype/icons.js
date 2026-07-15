/* ==========================================================================
   NovaFit — set de iconos
   Iconos de línea simples y consistentes (24x24, trazo currentColor).
   Sin librerías externas, sin degradados, sin ilustraciones 3D.
   ========================================================================== */

var Icon = {
  base: function (inner, extraClass) {
    return (
      '<svg class="icon ' + (extraClass || "") + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + inner + "</svg>"
    );
  },

  search: function (c) {
    return this.base('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', c);
  },
  filter: function (c) {
    return this.base(
      '<line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2" fill="var(--icon-fill,#fff)"/>' +
      '<line x1="4" y1="12" x2="20" y2="12"/><circle cx="16" cy="12" r="2" fill="var(--icon-fill,#fff)"/>' +
      '<line x1="4" y1="18" x2="20" y2="18"/><circle cx="10" cy="18" r="2" fill="var(--icon-fill,#fff)"/>',
      c
    );
  },
  chevronLeft: function (c) {
    return this.base('<polyline points="15 18 9 12 15 6"/>', c);
  },
  chevronRight: function (c) {
    return this.base('<polyline points="9 18 15 12 9 6"/>', c);
  },
  home: function (c) {
    return this.base('<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/>', c);
  },
  compass: function (c) {
    return this.base(
      '<circle cx="12" cy="12" r="9"/><polygon points="14.5 9.5 10 10 9.5 14.5 14 14 14.5 9.5"/>',
      c
    );
  },
  ticket: function (c) {
    return this.base(
      '<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V9Z"/>' +
      '<line x1="12" y1="7" x2="12" y2="17" stroke-dasharray="2 2.5"/>',
      c
    );
  },
  calendar: function (c) {
    return this.base(
      '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>' +
      '<line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
      c
    );
  },
  clock: function (c) {
    return this.base('<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>', c);
  },
  user: function (c) {
    return this.base('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>', c);
  },
  users: function (c) {
    return this.base(
      '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/>' +
      '<path d="M15.5 8.3a2.7 2.7 0 1 1 0 5.4"/><path d="M16 13.6c2.3.4 4 2.4 4 4.7v.7"/>',
      c
    );
  },
  checkCircle: function (c) {
    return this.base('<circle cx="12" cy="12" r="9"/><polyline points="8 12.5 11 15.5 16 9"/>', c);
  },
  xCircle: function (c) {
    return this.base('<circle cx="12" cy="12" r="9"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>', c);
  },
  lock: function (c) {
    return this.base(
      '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
      c
    );
  },
  close: function (c) {
    return this.base('<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>', c);
  },
  arrowRight: function (c) {
    return this.base('<line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/>', c);
  },
  info: function (c) {
    return this.base('<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="7.5" r="0.2" fill="currentColor" stroke-width="2.5"/>', c);
  }
};
