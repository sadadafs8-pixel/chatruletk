import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 3000);

const TIERS = {
  100: [
    { target: 15, chance: 54, rarity: 'common' },
    { target: 25, chance: 25, rarity: 'uncommon' },
    { target: 50, chance: 12, rarity: 'rare' },
    { target: 100, chance: 6, rarity: 'epic' },
    { target: 250, chance: 2.7, rarity: 'legendary' },
    { target: 500, chance: 0.3, rarity: 'mythic' }
  ],
  500: [
    { target: 100, chance: 52, rarity: 'common' },
    { target: 250, chance: 26, rarity: 'uncommon' },
    { target: 500, chance: 13, rarity: 'rare' },
    { target: 1000, chance: 6, rarity: 'epic' },
    { target: 2500, chance: 2.7, rarity: 'legendary' },
    { target: 5000, chance: 0.3, rarity: 'mythic' }
  ],
  1000: [
    { target: 150, chance: 52, rarity: 'common' },
    { target: 250, chance: 26, rarity: 'uncommon' },
    { target: 500, chance: 13, rarity: 'rare' },
    { target: 1000, chance: 6, rarity: 'epic' },
    { target: 5000, chance: 2.7, rarity: 'legendary' },
    { target: 10000, chance: 0.3, rarity: 'mythic' }
  ]
};

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store'
  });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function weightedPick(pool) {
  const total = pool.reduce((s, x) => s + x.chance, 0);
  let r = (crypto.randomInt(0, 1_000_000) / 1_000_000) * total;
  for (const item of pool) {
    r -= item.chance;
    if (r < 0) return item;
  }
  return pool.at(-1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, app: 'DUROV GIFS', mode: 'demo' });
    }
    if (url.pathname === '/api/config') {
      return sendJson(res, 200, { realMode: false, tiers: TIERS });
    }
    if (url.pathname === '/api/catalog') {
      return sendJson(res, 200, { live: false, gifts: [] });
    }
    if (url.pathname === '/api/create-spin' && req.method === 'POST') {
      const body = await readJson(req);
      const tier = Number(body.tier);
      if (!TIERS[tier]) return sendJson(res, 400, { error: 'Unsupported tier' });
      return sendJson(res, 200, { demo: true, tier, result: weightedPick(TIERS[tier]) });
    }

    let rel = decodeURIComponent(url.pathname);
    if (rel === '/') rel = '/index.html';
    const file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC)) return sendJson(res, 403, { error: 'Forbidden' });
    const data = await fs.readFile(file);
    res.writeHead(200, {
      'content-type': MIME[path.extname(file)] || 'application/octet-stream',
      'cache-control': path.extname(file) === '.html' ? 'no-store' : 'public, max-age=3600'
    });
    res.end(data);
  } catch (err) {
    if (err?.code === 'ENOENT') return sendJson(res, 404, { error: 'Not found' });
    console.error(err);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`DUROV GIFS listening on :${PORT} • DEMO mode`);
});
