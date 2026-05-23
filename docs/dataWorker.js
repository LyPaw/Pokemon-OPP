self.addEventListener('message', async (e) => {
  const { type, payload } = e.data;
  switch (type) {
    case 'LOAD_ALL':
      await loadAllData(payload);
      break;
    case 'FILTER':
      filterData(payload);
      break;
  }
});

async function loadAllData({ urls }) {
  try {
    const [pokemonsRes, perfilesRes, curiosidadesRes] = await Promise.all([
      fetch(urls[0]),
      fetch(urls[1]),
      fetch(urls[2]),
    ]);
    if (!pokemonsRes.ok) throw new Error('Error al cargar ' + urls[0]);

    let pokemonsData = await pokemonsRes.json();
    const perfilesData = await perfilesRes.json();
    const curiosidadesData = await curiosidadesRes.json();

    let pokemons = Array.isArray(pokemonsData)
      ? pokemonsData
      : Object.values(pokemonsData).flat();

    if (pokemons.length > 0 && Array.isArray(pokemons[0])) {
      pokemons = convertFromTuples(pokemons);
    }

    let spriteSizes = {};
    try {
      const sizesRes = await fetch(urls[3]);
      if (sizesRes.ok) spriteSizes = await sizesRes.json();
    } catch (_) {}

    self.postMessage({
      type: 'DATA_READY',
      payload: { pokemons, perfiles: perfilesData, curiosidades: curiosidadesData, sprite_sizes: spriteSizes },
    });
  } catch (err) {
    self.postMessage({ type: 'ERROR', error: err.message });
  }
}

const KEYS = ['id', 'nombre', 'tipo', 'generacion', 'region', 'ataques', 'stats'];
const STAT_KEYS = ['ps', 'ataque', 'defensa', 'atesp', 'defesp', 'velocidad'];

function convertFromTuples(tuples) {
  return tuples.map(t => {
    const obj = {};
    for (let i = 0; i < KEYS.length; i++) {
      if (KEYS[i] === 'stats') {
        obj.stats = {};
        for (let j = 0; j < STAT_KEYS.length; j++) {
          obj.stats[STAT_KEYS[j]] = t[i][j];
        }
      } else {
        obj[KEYS[i]] = t[i];
      }
    }
    return obj;
  });
}

function filterData({ data, filters }) {
  const { search, searchId, gens, tipos } = filters;
  const q = (search || '').toLowerCase();
  const result = data.filter(p => {
    if (q && !p.nombre.toLowerCase().includes(q)) return false;
    if (searchId && p.id !== parseInt(searchId)) return false;
    if (gens && gens.size > 0 && !gens.has(p.generacion)) return false;
    if (tipos && tipos.size > 0 && !p.tipo.some(t => tipos.has(t))) return false;
    return true;
  });
  self.postMessage({ type: 'FILTER_RESULT', payload: result }, [result]);
}
