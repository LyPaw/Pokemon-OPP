// THEME
function toggleTheme() {
  const html   = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeToggle').textContent = isDark ? '◐ TEMA' : '◑ TEMA';
  localStorage.setItem('pk-theme', isDark ? 'light' : 'dark');
}
const savedTheme = localStorage.getItem('pk-theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (savedTheme === 'dark') document.getElementById('themeToggle').textContent = '◑ TEMA';
}

// SPRITES
function toShowdownName(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/♀/g, 'f')
    .replace(/♂/g, 'm')
    .replace(/[^a-z0-9]/g, '');
}
const SPRITE_SHOWDOWN  = nombre => `https://play.pokemonshowdown.com/sprites/ani/${toShowdownName(nombre)}.gif`;
const SPRITE_BW        = id     => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
const SPRITE_PNG       = id     => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
const SPRITE_SHINY_SD  = nombre => `https://play.pokemonshowdown.com/sprites/ani-shiny/${toShowdownName(nombre)}.gif`;
const SPRITE_SHINY_BW  = id     => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${id}.gif`;
const SPRITE_SHINY_PNG = id     => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
const POKEBALL_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="white" stroke="%23333" stroke-width="3"/>
    <path d="M 2 50 A 48 48 0 0 1 98 50" fill="%23CC0000" stroke="%23333" stroke-width="3"/>
    <circle cx="50" cy="50" r="16" fill="white" stroke="%23333" stroke-width="3"/>
    <circle cx="50" cy="50" r="8" fill="white" stroke="%23333" stroke-width="2"/>
  </svg>
`)}`;

function setSpriteWithFallback(imgEl, id, nombre, loaderEl) {
  const pokeName = nombre || imgEl.alt || String(id);
  if (loaderEl) loaderEl.classList.add('visible');
  imgEl.classList.add('loading');
  imgEl.onload = () => {
    imgEl.classList.remove('loading');
    if (loaderEl) loaderEl.classList.remove('visible');
    imgEl.onload = null;
  };
  imgEl.src = SPRITE_SHOWDOWN(pokeName);
  imgEl.onerror = function () {
    this.onerror = null;
    this.src = SPRITE_BW(id);
    this.onerror = function () {
      this.onerror = null;
      this.src = SPRITE_PNG(id);
      this.onerror = function () {
        this.onerror = null;
        this.src = POKEBALL_SVG;
      };
    };
  };
}
function setShinyWithFallback(imgEl, id, nombre, loaderEl) {
  const pokeName = nombre || imgEl.alt || String(id);
  if (loaderEl) loaderEl.classList.add('visible');
  imgEl.classList.add('loading');
  imgEl.onload = () => {
    imgEl.classList.remove('loading');
    if (loaderEl) loaderEl.classList.remove('visible');
    imgEl.onload = null;
  };
  imgEl.src = SPRITE_SHINY_SD(pokeName);
  imgEl.onerror = function () {
    this.onerror = null;
    this.src = SPRITE_SHINY_BW(id);
    this.onerror = function () {
      this.onerror = null;
      this.src = SPRITE_SHINY_PNG(id);
      this.onerror = function () {
        this.onerror = null;
        this.src = POKEBALL_SVG;
      };
    };
  };
}
function toggleShiny(btn, id, nombre) {
  const card    = btn.closest('.gc-card');
  const img     = card.querySelector('img[data-id]');
  const isShiny = btn.classList.contains('active');
  if (isShiny) {
    btn.classList.remove('active');
    card.classList.remove('shiny');
    btn.title = 'Ver shiny';
    setSpriteWithFallback(img, id, nombre);
  } else {
    btn.classList.add('active');
    card.classList.add('shiny');
    btn.title = 'Ver normal';
    setShinyWithFallback(img, id, nombre);
  }
}

// SOUND
const CRY_URL = id => `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
let currentAudio = null;
function playSound(id, cardEl) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    document.querySelectorAll('.gc-card.playing').forEach(c => c.classList.remove('playing'));
  }
  const audio = new Audio(CRY_URL(id));
  currentAudio = audio;
  if (cardEl) cardEl.classList.add('playing');
  audio.play().catch(() => {});
  audio.onended = () => { if (cardEl) cardEl.classList.remove('playing'); };
}

// STATIC DATA
const TIPO_COLORS = {
  fuego:'#e05010',     agua:'#2288CC',       planta:'#338833',
  veneno:'#8844AA',    normal:'#888860',      electrico:'#BB9900',
  'eléctrico':'#BB9900', tierra:'#AA7740',    roca:'#887720',
  bicho:'#667700',     fantasma:'#553377',    acero:'#7788AA',
  hielo:'#5599AA',     lucha:'#993322',       psiquico:'#CC3366',
  'psíquico':'#CC3366', 'dragón':'#5522CC',  siniestro:'#554433',
  hada:'#BB5577',
};
const MAX_STAT = 255;
const STAT_LABELS = {
  ps:'PS', ataque:'ATAQUE', defensa:'DEFENSA',
  atesp:'AT.ESP', defesp:'DEF.ESP', velocidad:'VELOCIDAD',
};

// STATE
let allPokemons    = [];
let PERFILES       = {};
let CURIOSIDADES   = {};
let SPRITE_SIZES   = {};
let currentSearch   = '';
let currentSearchId = '';
let activeGens      = new Set();
let activeTipos     = new Set();
let dataLoaded      = false;

// INDEXEDDB
const DB_NAME = 'PomeBall';
const DB_VER  = 2;
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('data')) {
        db.createObjectStore('data');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function saveToCache(key, data) {
  try {
    const db = await openDB();
    const tx = db.transaction('data', 'readwrite');
    tx.objectStore('data').put(data, key);
    tx.objectStore('data').put(Date.now(), key + '_ts');
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
    db.close();
  } catch (_) {}
}
async function loadFromCache(key) {
  try {
    const db = await openDB();
    const tx = db.transaction('data', 'readonly');
    const store = tx.objectStore('data');
    const [data, ts] = await Promise.all([
      new Promise(r => { const q = store.get(key); q.onsuccess = () => r(q.result); }),
      new Promise(r => { const q = store.get(key + '_ts'); q.onsuccess = () => r(q.result); }),
    ]);
    db.close();
    if (data && ts && (Date.now() - ts < 86400000)) return data;
    return null;
  } catch (_) {
    return null;
  }
}

// WEB WORKER
const dataWorker = new Worker('dataWorker.js');
dataWorker.addEventListener('message', (e) => {
  const { type, payload, error } = e.data;
  if (type === 'DATA_READY') {
    allPokemons  = payload.pokemons;
    PERFILES     = payload.perfiles;
    CURIOSIDADES = payload.curiosidades;
    SPRITE_SIZES = payload.sprite_sizes || {};
    dataLoaded   = true;
    saveToCache('pokemons', allPokemons);
    saveToCache('perfiles', PERFILES);
    saveToCache('curiosidades', CURIOSIDADES);
    saveToCache('sprite_sizes', SPRITE_SIZES);
    initScroller();
  } else if (type === 'FILTER_RESULT') {
    if (scroller) scroller.updateItems(payload);
    document.getElementById('count').textContent = payload.length;
  } else if (type === 'ERROR') {
    document.getElementById('grid').innerHTML =
      `<div class="gc-empty">ERROR: ${error}<br>NO SE PUDIERON CARGAR LOS DATOS</div>`;
  }
});

// INTERSECTION OBSERVER — Lazy sprites
const spriteObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      spriteObserver.unobserve(img);
      const rawId   = parseInt(img.dataset.id);
      const poke    = allPokemons.find(x => x.id === rawId) || {};
      const spriteId = poke.base_id || rawId;
      const nombre  = poke.nombre_forma || poke.nombre || img.dataset.nombre || img.alt;
      const sizes   = SPRITE_SIZES[String(rawId)] || SPRITE_SIZES[String(spriteId)];
      if (sizes && sizes.card) {
        img.style.width  = sizes.card + 'px';
        img.style.height = sizes.card + 'px';
      }
      setSpriteWithFallback(img, spriteId, nombre);
    }
  });
}, { rootMargin: '300px 0px' });

// DEBOUNCE
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// VIRTUAL SCROLLER
const CARD_HEIGHT = 370;
const CARD_GAP    = 20;
const CARD_MIN_W  = 230;
const PADDING     = 24;

class VirtualScroller {
  constructor(container, createItem) {
    this.container = container;
    this.createItem = createItem;
    this.items = [];
    this._cardMap = new Map();
    this._visibleRange = { start: 0, end: 0 };
    this._columns = 1;
    this._cardWidth = CARD_MIN_W;
    this._isInitialRender = true;
    this._prevScrollTop = 0;

    container.style.position = 'relative';
    container.style.overflowY = 'auto';
    container.style.height = 'calc(100vh - 250px)';
    container.style.padding = '1.2rem 0.8rem 3rem';

    this._sentinel = document.createElement('div');
    this._sentinel.style.width = '100%';
    this.container.appendChild(this._sentinel);

    this._onScroll = this._onScroll.bind(this);
    this._onResize = this._onResize.bind(this);
    this.container.addEventListener('scroll', this._onScroll, { passive: true });

    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(this._onResize);
      this._ro.observe(this.container);
    }
    window.addEventListener('resize', this._onResize);

    this._updateDimensions();
  }

  _updateDimensions() {
    const w = this.container.clientWidth;
    const avail = w - PADDING;
    this._columns = Math.max(1, Math.floor((avail + CARD_GAP) / (CARD_MIN_W + CARD_GAP)));
    this._cardWidth = (avail - (this._columns - 1) * CARD_GAP) / this._columns;
    this._updateTotalHeight();
  }

  _updateTotalHeight() {
    const rows = Math.ceil(this.items.length / this._columns);
    const h = Math.max(rows * CARD_HEIGHT + (rows - 1) * CARD_GAP + PADDING, this.container.clientHeight);
    this._sentinel.style.height = h + 'px';
  }

  _getVisibleRange() {
    const st = this.container.scrollTop;
    const vh = this.container.clientHeight;
    const rowH = CARD_HEIGHT + CARD_GAP;
    const totalRows = Math.ceil(this.items.length / this._columns);
    const startRow = Math.max(0, Math.floor(st / rowH) - 3);
    const endRow   = Math.min(totalRows, Math.ceil((st + vh) / rowH) + 3);
    return {
      start: Math.max(0, startRow * this._columns),
      end: Math.min(this.items.length, endRow * this._columns),
    };
  }

  _onScroll() {
    this._prevScrollTop = this.container.scrollTop;
    this._isInitialRender = false;
    this._render();
  }

  _onResize() {
    this._updateDimensions();
    for (const el of this._cardMap.values()) el.remove();
    this._cardMap.clear();
    this._visibleRange = { start: 0, end: 0 };
    this._render();
  }

  _render() {
    if (this.items.length === 0) {
      for (const el of this._cardMap.values()) el.remove();
      this._cardMap.clear();
      if (!this.container.querySelector('.gc-empty')) {
        const empty = document.createElement('div');
        empty.className = 'gc-empty';
        empty.textContent = 'NO SE ENCONTRARON POKÉMON';
        this.container.appendChild(empty);
      }
      return;
    }

    const emptyEl = this.container.querySelector('.gc-empty');
    if (emptyEl) emptyEl.remove();

    const range = this._getVisibleRange();
    if (!this._isInitialRender && range.start === this._visibleRange.start && range.end === this._visibleRange.end) return;
    this._visibleRange = range;

    for (const [idx, el] of this._cardMap) {
      if (idx < range.start || idx >= range.end) {
        el.remove();
        this._cardMap.delete(idx);
      }
    }

    const fragment = document.createDocumentFragment();
    for (let i = range.start; i < range.end; i++) {
      if (this._cardMap.has(i)) continue;
      const el = this.createItem(this.items[i], i);
      const row = Math.floor(i / this._columns);
      const col = i % this._columns;
      const leftPad = (this.container.clientWidth - this._columns * this._cardWidth - (this._columns - 1) * CARD_GAP) / 2;
      el.style.position = 'absolute';
      el.style.top  = (row * (CARD_HEIGHT + CARD_GAP) + 19) + 'px';
      el.style.left = (col * (this._cardWidth + CARD_GAP) + leftPad) + 'px';
      el.style.width = this._cardWidth + 'px';
      el.style.height = CARD_HEIGHT + 'px';
      el.style.overflow = 'hidden';
      fragment.appendChild(el);
      this._cardMap.set(i, el);
    }
    this.container.appendChild(fragment);
    this._updateTotalHeight();
  }

  updateItems(items) {
    for (const el of this._cardMap.values()) el.remove();
    this._cardMap.clear();
    this.items = items;
    this._visibleRange = { start: 0, end: 0 };
    this._isInitialRender = true;
    this._updateTotalHeight();
    this._render();
  }

  destroy() {
    this.container.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('resize', this._onResize);
    if (this._ro) this._ro.disconnect();
    for (const el of this._cardMap.values()) el.remove();
    this._cardMap.clear();
    this.container.style.position = '';
    this.container.style.overflowY = '';
    this.container.style.height = '';
    this.container.style.padding = '';
  }
}

let scroller = null;

function initScroller() {
  const grid = document.getElementById('grid');
  if (scroller) scroller.destroy();
  grid.innerHTML = '';
  scroller = new VirtualScroller(grid, createCard);
  applyFiltersAndRender();
}

function createCard(pokemon, index) {
  const tiposBadges = pokemon.tipo.map(t =>
    `<span class="gc-tipo" style="background:${TIPO_COLORS[t] || '#888'}">${t.toUpperCase()}</span>`
  ).join('');
  const ataquesTags = (pokemon.ataques || []).map(a =>
    `<span class="gc-ataque">${a}</span>`
  ).join('');

  const card = document.createElement('div');
  card.className = 'gc-card';
  card.dataset.pkid = pokemon.id;
  card.dataset.baseid = pokemon.base_id || '';
  card.dataset.idx = index;
  card.innerHTML = `
    <div class="gc-card-bar">
      <span class="gc-card-num">NO.${String(pokemon.id).padStart(3,'0')}</span>
      <span class="gc-card-gen">GEN ${pokemon.generacion}</span>
    </div>
    <div class="gc-card-img">
      <img data-id="${pokemon.id}" data-baseid="${pokemon.base_id || ''}" data-nombre="${(pokemon.nombre_forma || pokemon.nombre).replace(/'/g, "\\'")}" alt="${pokemon.nombre_forma || pokemon.nombre}"/>
      <button class="gc-shiny-btn" title="Ver shiny">✨</button>
      <div class="gc-sound">🔊</div>
    </div>
    <div class="gc-card-body">
      <div class="gc-card-name">${pokemon.nombre}</div>
      <div class="gc-tipos">${tiposBadges}</div>
      <div class="gc-ataques">${ataquesTags}</div>
    </div>
    <div class="gc-region">${pokemon.region || ''}</div>`;

  const img = card.querySelector('img');
  spriteObserver.observe(img);
  return card;
}

// FILTER + RENDER
function getFilteredPokemons() {
  const q = currentSearch.toLowerCase();
  return allPokemons.filter(p => {
    const matchSearch = !q || p.nombre.toLowerCase().includes(q);
    const matchId     = !currentSearchId || p.id === parseInt(currentSearchId);
    const matchGen    = activeGens.size  === 0 || activeGens.has(p.generacion);
    const matchTipo   = activeTipos.size === 0 || p.tipo.some(t => activeTipos.has(t));
    return matchSearch && matchId && matchGen && matchTipo;
  });
}

function applyFiltersAndRender() {
  if (!scroller || !dataLoaded) return;
  const filtered = getFilteredPokemons();
  document.getElementById('count').textContent = filtered.length;
  scroller.updateItems(filtered);
}

const debouncedRender = debounce(applyFiltersAndRender, 100);

// STATS
function getStatClass(v) {
  if (v < 50)  return 'stat-low';
  if (v < 80)  return 'stat-mid';
  if (v < 110) return 'stat-high';
  return 'stat-great';
}
function getStatNumColor(v) {
  if (v < 50)  return '#e05050';
  if (v < 80)  return '#d4a020';
  if (v < 110) return '#40a840';
  return '#2288CC';
}
function renderStats(stats) {
  const c = document.getElementById('modalStats');
  if (!stats) {
    c.innerHTML = '<div style="color:var(--muted);font-family:\'Press Start 2P\',monospace;font-size:0.38rem;padding:0.5rem 0">SIN DATOS</div>';
    return;
  }
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  c.innerHTML = Object.entries(stats).map(([k, v]) => `
    <div class="modal-stat">
      <div class="modal-stat-row">
        <span class="modal-stat-lbl">${STAT_LABELS[k] || k.toUpperCase()}</span>
        <div class="modal-stat-bar-wrap">
          <div class="modal-stat-bar-fill ${getStatClass(v)}" data-target="${Math.min((v / MAX_STAT) * 100, 100).toFixed(1)}%" style="width:0%"></div>
        </div>
        <span class="modal-stat-num" style="color:${getStatNumColor(v)}">${v}</span>
      </div>
    </div>`).join('') +
    `<div class="modal-stat-total">
      <span class="modal-stat-total-lbl">TOTAL</span>
      <span class="modal-stat-total-num">${total}</span>
    </div>`;
  setTimeout(() => {
    c.querySelectorAll('.modal-stat-bar-fill').forEach(b => b.style.width = b.dataset.target);
  }, 80);
}

// MODAL
let currentModalId   = null;
let currentModalName = null;
let currentModalBaseId = null;
let modalIsShiny     = false;

function openModalCard(el) {
  const pkid   = parseInt(el.dataset.pkid);
  const baseid = el.dataset.baseid ? parseInt(el.dataset.baseid) : null;
  const nombre = el.dataset.nombre;
  let p = allPokemons.find(x => x.id === pkid && ((baseid && x.base_id === baseid) || (x.nombre_forma && x.nombre_forma === nombre)));
  if (!p && baseid) p = allPokemons.find(x => x.id === pkid && x.base_id === baseid);
  if (!p) p = allPokemons.find(x => x.id === pkid);
  if (!p) return;
  openModal(p);
}

function openModal(idOrP) {
  const p = (typeof idOrP === 'object') ? idOrP : allPokemons.find(x => x.id === idOrP);
  if (!p) return;
  currentModalId      = p.id;
  currentModalBaseId  = p.base_id || p.id;
  currentModalName    = p.nombre_forma || p.nombre;
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
  const audio = new Audio(CRY_URL(currentModalBaseId));
  currentAudio = audio;
  audio.play().catch(() => {});
  document.getElementById('modalBarTitle').textContent = `INFO. POKÉMON — ${(p.nombre_forma || p.nombre).toUpperCase()}`;
  modalIsShiny = false;
  document.getElementById('modalShinyBtn').classList.remove('active');
  document.getElementById('modalSprite').closest('.modal-sprite-wrap').classList.remove('shiny');
  document.getElementById('modalShinyBtn').title = 'Ver shiny';
  const spriteEl = document.getElementById('modalSprite');
  spriteEl.dataset.pkid = p.id;
  spriteEl.alt = p.nombre_forma || p.nombre;
  document.getElementById('modalLoader').classList.add('visible');
  const customSizes = SPRITE_SIZES[String(p.id)] || SPRITE_SIZES[String(currentModalBaseId)];
  if (customSizes && customSizes.modal) {
    spriteEl.style.width  = customSizes.modal + 'px';
    spriteEl.style.height = customSizes.modal + 'px';
  } else {
    spriteEl.style.width  = '170px';
    spriteEl.style.height = '170px';
  }
  setSpriteWithFallback(spriteEl, currentModalBaseId, currentModalName, document.getElementById('modalLoader'));
  document.getElementById('modalNum').textContent       = `NO.${String(p.id).padStart(3, '0')}`;
  document.getElementById('modalName').textContent      = p.nombre;
  document.getElementById('modalNameNum').textContent   = `NO.${String(p.id).padStart(3, '0')}`;
  document.getElementById('modalRegion').textContent    = p.region || '—';
  document.getElementById('modalGen').textContent       = `GEN ${p.generacion}`;
  renderStats(p.stats || null);
  const perf = PERFILES[String(p.id)] || {};
  const setField = (id, val, placeholder) => {
    const el = document.getElementById(id);
    if (val) { el.textContent = val; el.className = 'modal-perfil-value'; }
    else     { el.textContent = placeholder; el.className = 'modal-perfil-value placeholder'; }
  };
  setField('modalAltura',      perf.altura,      'Pendiente de añadir');
  setField('modalPeso',        perf.peso,        'Pendiente de añadir');
  setField('modalEspecie',     perf.especie,     'Pendiente de añadir');
  setField('modalDescripcion', perf.descripcion, 'Sin descripción registrada todavía.');
  document.getElementById('modalTipos').innerHTML = p.tipo.map(t =>
    `<span class="modal-tipo" style="background:${TIPO_COLORS[t] || '#888'}">${t.toUpperCase()}</span>`
  ).join('');
  document.getElementById('modalAtaques').innerHTML = (p.ataques || []).map(a =>
    `<span class="modal-ataque">${a}</span>`
  ).join('');
  const curiosidades = CURIOSIDADES[String(p.id)] || [];
  const container    = document.getElementById('modalCuriosidades');
  if (curiosidades.length === 0) {
    container.innerHTML = '<div class="modal-no-curiosidades">Sin datos curiosos registrados todavía.</div>';
  } else {
    container.innerHTML = curiosidades.map(c =>
      `<div class="modal-curiosidad-item">
        <span class="modal-curiosidad-icon">${c.icon || '▶'}</span>
        <span class="modal-curiosidad-text">${c.texto}</span>
      </div>`
    ).join('');
  }
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function toggleModalShiny() {
  const btn  = document.getElementById('modalShinyBtn');
  const img  = document.getElementById('modalSprite');
  const wrap = img.closest('.modal-sprite-wrap');
  modalIsShiny = !modalIsShiny;
  if (modalIsShiny) {
    btn.classList.add('active');
    wrap.classList.add('shiny');
    btn.title = 'Ver normal';
    setShinyWithFallback(img, currentModalId, currentModalName, document.getElementById('modalLoader'));
  } else {
    btn.classList.remove('active');
    wrap.classList.remove('shiny');
    btn.title = 'Ver shiny';
    setSpriteWithFallback(img, currentModalId, currentModalName, document.getElementById('modalLoader'));
  }
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  currentModalId   = null;
  currentModalName = null;
}
function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

// SPRITE VIEWER
function openSpriteViewer() {
  if (!currentModalId) return;
  const p  = allPokemons.find(x => x.id === currentModalId);
  const baseId = currentModalBaseId || currentModalId;
  document.getElementById('svPokeName').textContent = p ? (p.nombre_forma || p.nombre).toUpperCase() : `#${baseId}`;
  setSpriteWithFallback(document.getElementById('svFront'), baseId, p ? (p.nombre_forma || p.nombre) : '', document.getElementById('svFrontLoader'));
  setShinyWithFallback(document.getElementById('svShinyFront'), baseId, p ? (p.nombre_forma || p.nombre) : '', document.getElementById('svShinyLoader'));
  document.getElementById('svOverlay').classList.add('open');
}
function closeSpriteViewer() { document.getElementById('svOverlay').classList.remove('open'); }
function closeSVOutside(e) { if (e.target === document.getElementById('svOverlay')) closeSpriteViewer(); }

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSpriteViewer(); closeModal(); }
});

// EVENT DELEGATION — Grid clicks (virtual scroller compatible)
document.getElementById('grid').addEventListener('click', (e) => {
  const shinyBtn = e.target.closest('.gc-shiny-btn');
  if (shinyBtn) {
    e.stopPropagation();
    const card  = shinyBtn.closest('.gc-card');
    const img   = card.querySelector('img[data-id]');
    const id    = parseInt(img.dataset.id);
    const poke  = allPokemons.find(x => x.id === id) || {};
    const sId   = poke.base_id || id;
    const nombre = poke.nombre_forma || poke.nombre;
    toggleShiny(shinyBtn, sId, nombre);
    return;
  }
  const soundBtn = e.target.closest('.gc-sound');
  if (soundBtn) {
    const card = soundBtn.closest('.gc-card');
    const id   = parseInt(card.dataset.pkid);
    playSound(id, card);
    return;
  }
  const card = e.target.closest('.gc-card');
  if (card) openModalCard(card);
});

// FILTERS (debounced)
document.querySelectorAll('.gc-btn[data-filter^="gen:"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const gen = parseInt(btn.dataset.filter.split(':')[1]);
    if (activeGens.has(gen)) {
      activeGens.clear();
      btn.classList.remove('active');
    } else {
      activeGens.clear();
      document.querySelectorAll('.gc-btn[data-filter^="gen:"]').forEach(b => b.classList.remove('active'));
      activeGens.add(gen);
      btn.classList.add('active');
    }
    debouncedRender();
  });
});

document.querySelectorAll('.gc-tipo-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tipo = btn.dataset.filter.split(':')[1];
    if (activeTipos.has(tipo)) {
      activeTipos.delete(tipo);
      btn.classList.remove('active');
    } else {
      if (activeTipos.size >= 2) {
        const primero = activeTipos.values().next().value;
        activeTipos.delete(primero);
        document.querySelector(`.gc-tipo-btn[data-filter="tipo:${primero}"]`)?.classList.remove('active');
      }
      activeTipos.add(tipo);
      btn.classList.add('active');
    }
    debouncedRender();
  });
});

document.getElementById('search').addEventListener('input', debounce(e => {
  currentSearch = e.target.value;
  applyFiltersAndRender();
}, 150));

document.getElementById('searchId').addEventListener('input', debounce(e => {
  currentSearchId = e.target.value.trim();
  applyFiltersAndRender();
}, 150));

// INIT
(async function init() {
  document.getElementById('count').textContent = '...';

  const cached = await loadFromCache('pokemons');
  if (cached) {
    allPokemons  = cached;
    PERFILES     = await loadFromCache('perfiles') || {};
    CURIOSIDADES = await loadFromCache('curiosidades') || {};
    SPRITE_SIZES = await loadFromCache('sprite_sizes') || {};
    dataLoaded   = true;
    initScroller();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  dataWorker.postMessage({
    type: 'LOAD_ALL',
    payload: {
      urls: ['pokemons.json', 'perfiles.json', 'curiosidades.json', 'sprite_sizes.json'],
    },
  });
})();
