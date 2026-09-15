import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 3000);
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const API = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : '';
const FILE_API = BOT_TOKEN ? `https://api.telegram.org/file/bot${BOT_TOKEN}` : '';
const TIERS = [100, 500, 1000];
const imageCache = new Map();
let catalogCache = { at: 0, data: null };

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    'access-control-allow-origin': '*'
  });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function tg(method, payload) {
  if (!BOT_TOKEN) throw new Error('BOT_TOKEN_NOT_CONFIGURED');
  const r = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload || {})
  });
  const d = await r.json();
  if (!d.ok) throw new Error(d.description || `Telegram ${method} failed`);
  return d.result;
}

function normalizeRegularGift(g) {
  const fileId = g?.sticker?.thumbnail?.file_id || g?.sticker?.file_id || '';
  return {
    id: String(g.id),
    type: 'regular',
    name: g?.sticker?.emoji ? `Telegram Gift ${g.sticker.emoji}` : `Telegram Gift`,
    emoji: g?.sticker?.emoji || '🎁',
    starCount: Number(g.star_count),
    upgradeStarCount: Number.isFinite(g.upgrade_star_count) ? Number(g.upgrade_star_count) : null,
    isPremium: !!g.is_premium,
    limited: Number.isFinite(g.total_count),
    totalCount: Number.isFinite(g.total_count) ? Number(g.total_count) : null,
    remainingCount: Number.isFinite(g.remaining_count) ? Number(g.remaining_count) : null,
    uniqueVariantCount: Number.isFinite(g.unique_gift_variant_count) ? Number(g.unique_gift_variant_count) : null,
    imageUrl: fileId ? `/api/gift-image?file_id=${encodeURIComponent(fileId)}` : null
  };
}

function normalizeOwnedGift(x) {
  if (x?.type === 'unique' && x.gift) {
    const g = x.gift;
    let price = null;
    let currency = null;
    if (Number.isFinite(x.last_resale_amount) && x.last_resale_currency) {
      price = Number(x.last_resale_amount);
      currency = x.last_resale_currency;
    }
    return {
      type: 'unique',
      id: x.owned_gift_id || g.name,
      name: g.base_name || g.name,
      uniqueName: g.name,
      number: g.number,
      model: g.model?.name || null,
      symbol: g.symbol?.name || null,
      backdrop: g.backdrop?.name || null,
      isPremium: !!g.is_premium,
      fromBlockchain: !!g.is_from_blockchain,
      lastResaleAmount: price,
      lastResaleCurrency: currency,
      transferStarCount: Number.isFinite(x.transfer_star_count) ? Number(x.transfer_star_count) : null,
      nftUrl: g.name ? `https://t.me/nft/${encodeURIComponent(g.name)}` : null
    };
  }
  if (x?.type === 'regular' && x.gift) {
    return { ...normalizeRegularGift(x.gift), ownedGiftId: x.owned_gift_id || null };
  }
  return null;
}

async function getCatalog() {
  const now = Date.now();
  if (catalogCache.data && now - catalogCache.at < 30_000) return catalogCache.data;
  if (!BOT_TOKEN) return { live: false, reason: 'BOT_TOKEN_NOT_CONFIGURED', gifts: [] };
  const result = await tg('getAvailableGifts', {});
  const gifts = (result?.gifts || []).map(normalizeRegularGift).filter(g => Number.isFinite(g.starCount));
  const data = { live: true, fetchedAt: new Date().toISOString(), gifts };
  catalogCache = { at: now, data };
  return data;
}

function buildPool(gifts, tier) {
  if (!gifts.length) return [];
  const sorted = [...gifts].sort((a,b)=>a.starCount-b.starCount);
  const targets = [0.15, 0.25, 0.5, 1, 2.5, 5].map(x => tier * x);
  const chances = [55, 26, 12, 5, 1.7, 0.3];
  const picked = targets.map((target, i) => {
    let best = sorted[0];
    let score = Infinity;
    for (const g of sorted) {
      const s = Math.abs(Math.log((g.starCount || 1) / target));
      if (s < score) { score = s; best = g; }
    }
    return { gift: best, chance: chances[i] };
  });
  const merged = new Map();
  for (const p of picked) {
    const prev = merged.get(p.gift.id);
    if (prev) prev.chance += p.chance;
    else merged.set(p.gift.id, { gift: p.gift, chance: p.chance });
  }
  return [...merged.values()];
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
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp'
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type' });
      return res.end();
    }

    if (url.pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, app: 'DUROV GIFS', telegramCatalog: !!BOT_TOKEN });
    }
    if (url.pathname === '/api/catalog') {
      try { return sendJson(res, 200, await getCatalog()); }
      catch (e) { return sendJson(res, 502, { live: false, reason: e.message, gifts: [] }); }
    }
    if (url.pathname === '/api/pools') {
      try {
        const c = await getCatalog();
        if (!c.live) return sendJson(res, 200, { live: false, pools: {} });
        const pools = Object.fromEntries(TIERS.map(t => [t, buildPool(c.gifts, t)]));
        return sendJson(res, 200, { live: true, pools });
      } catch (e) { return sendJson(res, 502, { live: false, reason: e.message, pools: {} }); }
    }
    if (url.pathname === '/api/create-spin' && req.method === 'POST') {
      const body = await readJson(req);
      const tier = Number(body.tier);
      if (!TIERS.includes(tier)) return sendJson(res, 400, { error: 'Unsupported tier' });
      const c = await getCatalog();
      if (!c.live) return sendJson(res, 503, { error: 'LIVE_CATALOG_REQUIRED', reason: c.reason });
      const pool = buildPool(c.gifts, tier);
      if (!pool.length) return sendJson(res, 503, { error: 'NO_GIFTS_AVAILABLE' });
      const hit = weightedPick(pool);
      return sendJson(res, 200, { demo: true, tier, gift: hit.gift, chance: hit.chance });
    }
    if (url.pathname === '/api/user-gifts') {
      if (!BOT_TOKEN) return sendJson(res, 200, { live: false, gifts: [] });
      const userId = Number(url.searchParams.get('user_id'));
      if (!Number.isFinite(userId)) return sendJson(res, 400, { error: 'user_id required' });
      const result = await tg('getUserGifts', { user_id: userId, exclude_unique: false, sort_by_price: true, limit: 100 });
      const gifts = (result?.gifts || []).map(normalizeOwnedGift).filter(Boolean);
      return sendJson(res, 200, { live: true, totalCount: result?.total_count || gifts.length, gifts });
    }
    if (url.pathname === '/api/gift-image') {
      if (!BOT_TOKEN) return sendJson(res, 404, { error: 'No bot token' });
      const fileId = url.searchParams.get('file_id');
      if (!fileId) return sendJson(res, 400, { error: 'file_id required' });
      let filePath = imageCache.get(fileId);
      if (!filePath) {
        const f = await tg('getFile', { file_id: fileId });
        filePath = f.file_path;
        imageCache.set(fileId, filePath);
      }
      const r = await fetch(`${FILE_API}/${filePath}`);
      if (!r.ok) return sendJson(res, 502, { error: 'Image fetch failed' });
      const ab = await r.arrayBuffer();
      res.writeHead(200, { 'content-type': r.headers.get('content-type') || 'image/webp', 'cache-control': 'public, max-age=86400' });
      return res.end(Buffer.from(ab));
    }

    let rel = decodeURIComponent(url.pathname);
    if (rel === '/') rel = '/index.html';
    const file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC)) return sendJson(res, 403, { error: 'Forbidden' });
    const data = await fs.readFile(file);
    res.writeHead(200, {
      'content-type': MIME[path.extname(file)] || 'application/octet-stream',
      'cache-control': path.extname(file) === '.html' ? 'no-store' : 'public, max-age=300'
    });
    res.end(data);
  } catch (err) {
    if (err?.code === 'ENOENT') return sendJson(res, 404, { error: 'Not found' });
    console.error(err);
    return sendJson(res, 500, { error: err?.message || 'Internal server error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`DUROV GIFS listening on :${PORT} • ${BOT_TOKEN ? 'LIVE Telegram catalog' : 'PREVIEW mode'}`);
});