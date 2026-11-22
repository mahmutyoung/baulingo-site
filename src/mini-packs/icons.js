const symbols = {
  book: 'M12 7c-3-3-6-3-9-2v13c3-1 6-1 9 2 3-3 6-3 9-2V5c-3-1-6-1-9 2zm0 0v13',
  chat: 'M4 5h16v11h-8l-5 4v-4H4zm4 5h8m-8 3h5',
  coffee: 'M4 8h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zm12 1h2a2 2 0 0 1 0 4h-2M3 21h16M8 3v2m4-2v2',
  calendar: 'M4 6h16v14H4zm0 4h16M8 4v4m8-4v4m-8 6h2m4 0h2m-8 3h2',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-15v5l3 2',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  angle: 'm9 6 6 6-6 6',
  check: 'm5 12 4 4L19 6',
  lab: 'M9 3h6m-5 0v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M8 15h8',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  layers: 'm12 3 9 5-9 5-9-5zm-9 9 9 5 9-5m-18 4 9 5 9-5',
  spark: 'M12 2v6m0 8v6M2 12h6m8 0h6M5 5l4 4m6 6 4 4m0-14-4 4m-6 6-4 4',
  refresh: 'M20 7v5h-5m5 0a8 8 0 1 0-2 6',
  code: 'm8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18',
  bag: 'M4 8h16l1 13H3zm4 0V6a4 4 0 0 1 8 0v2',
  signpost: 'M12 3v18M4 6h14l3 3-3 3H4zm16 9H6l-3 3 3 3h14',
  train: 'M7 3h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm-3 8h16M8 15h.01m8 0h.01m-7 3-3 3m9-3 3 3',
  key: 'M14 13a5 5 0 1 0-3-5L3 16v4h4v-3h3v-3l2-2',
};

export function icon(name, size = 19) {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="${symbols[name]}"/></svg>`;
}
