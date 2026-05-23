const fs = require('fs');
const path = require('path');

const RAW = path.join(__dirname, '..', 'docs', 'pokemons.json');
const OUT = path.join(__dirname, '..', 'docs', 'optimized');

const STAT_KEYS = ['ps', 'ataque', 'defensa', 'atesp', 'defesp', 'velocidad'];
const OBJ_KEYS = ['id', 'nombre', 'tipo', 'generacion', 'region', 'ataques', 'stats'];

const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));
const all = Array.isArray(raw) ? raw : Object.values(raw).flat();

const tuples = all.map(p => [
  p.id,
  p.nombre,
  p.tipo,
  p.generacion,
  p.region || '',
  p.ataques || [],
  STAT_KEYS.map(k => (p.stats || {})[k] || 0),
]);

fs.mkdirSync(OUT, { recursive: true });

fs.writeFileSync(path.join(OUT, 'pokemons_all.json'), JSON.stringify(tuples));

const byGen = {};
tuples.forEach(t => {
  const gen = t[3];
  if (!byGen[gen]) byGen[gen] = [];
  byGen[gen].push(t);
});
Object.entries(byGen).forEach(([gen, data]) => {
  fs.writeFileSync(path.join(OUT, `pokemons_gen${gen}.json`), JSON.stringify(data));
});

const origSize = Buffer.byteLength(JSON.stringify(raw), 'utf8');
const newSize = Buffer.byteLength(JSON.stringify(tuples), 'utf8');
console.log(`Optimizados ${tuples.length} Pokémon`);
console.log(`Original: ${(origSize / 1024).toFixed(1)} KB`);
console.log(`Tuplas:   ${(newSize / 1024).toFixed(1)} KB`);
console.log(`Ahorro:   ${((1 - newSize / origSize) * 100).toFixed(1)}%`);
