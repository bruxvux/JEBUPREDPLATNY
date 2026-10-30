const { addonBuilder, getRouter: sdkGetRouter } = require('stremio-addon-sdk');
const axios = require('axios');

// ============================================================================
// 1. MANIFEST
//    No custom "meta" resource: Stremio uses Cinemeta for metadata/episodes
//    (we only serve catalogs + streams for real IMDb "tt" ids).
// ============================================================================
const manifest = {
  id: 'community.jebupredplatny.czsk',
  version: '2.0.0',
  name: 'JebuPředplatný (CZ/SK zdarma)',
  description: 'České a slovenské seriály a filmy zdarma (Comeback, Boží plán, Hospoda, Okresní přebor...). Streamy z Prehraj.to, bez předplatného. Funguje i v sekci Populární a ve vyhledávání Stremia.',
  resources: ['catalog', 'stream'],
  types: ['series', 'movie'],
  idPrefixes: ['tt'],
  catalogs: [
    { type: 'series', id: 'jbp_series', name: '🇨🇿 České a slovenské seriály', extra: [{ name: 'search', isRequired: false }] },
    { type: 'movie', id: 'jbp_movies', name: '🇨🇿 České a slovenské filmy', extra: [{ name: 'search', isRequired: false }] }
  ]
};

// ============================================================================
// 2. CURATED CATALOG (real IMDb ids, verified against Cinemeta)
//    cz = Czech title used for searching (Cinemeta often has English/ASCII names)
// ============================================================================
const SERIES = [
  { id: 'tt1321261', cz: 'Comeback' },
  { id: 'tt44752529', cz: 'Boží plán', alt: ['Bozi plan'] },
  { id: 'tt1067851', cz: 'Hospoda' },
  { id: 'tt1794286', cz: 'Okresní přebor' },
  { id: 'tt6350196', cz: 'Vyšehrad', alt: ['Vysehrad'] },
  { id: 'tt3450288', cz: 'Čtvrtá hvězda' },
  { id: 'tt5894518', cz: 'Kosmo' },
  { id: 'tt16532444', cz: 'Devadesátky' },
  { id: 'tt0319972', cz: 'Chalupáři', alt: ['Chalupari'] },
  { id: 'tt5459168', cz: 'Pustina' },
  { id: 'tt12691770', cz: 'Kukačky', alt: ['The Swap'] },
  { id: 'tt7067008', cz: 'Specialisté' },
  { id: 'tt0924182', cz: 'Ordinace v růžové zahradě' },
  { id: 'tt11775096', cz: 'Slunečná' },
  { id: 'tt3672936', cz: 'Případ pro exorcistu' },
  { id: 'tt5994826', cz: 'Svět pod hlavou' },
  { id: 'tt2385320', cz: 'Gympl s (r)učením omezeným', alt: ['Gympl'] },
  { id: 'tt6848378', cz: 'Dabing Street', alt: ['Dubbing Street'] },
  { id: 'tt5976538', cz: 'Rapl', alt: ['The Fury'] },
  { id: 'tt4460254', cz: 'Doktor Martin' },
  { id: 'tt3493946', cz: 'Mazalové' },
  { id: 'tt6853136', cz: 'Padesátka', alt: ['Fifty and Embarrassing'] }
];

// Movies are resolved via Cinemeta search (cz title -> first Czech/Slovak result)
const MOVIE_NAMES = [
  'Pelíšky', 'Samotáři', 'Dědictví aneb Kurvahošigutntag', 'S tebou mě baví svět', 'Vratné lahve',
  'Na samotě u lesa', 'Slunce, seno, jahody', 'Slunce, seno a pár facek', 'Vesničko má středisková',
  'Černí baroni', 'Kolja', 'Marečku, podejte mi pero', 'Pelíšky', 'Jak básníci přicházejí o iluze',
  'Tmavomodrý svět', 'Obecná škola', 'Jak vytrhnout velrybě stoličku', 'Ať žijí duchové', 'Rozpuštěný a vypuštěný',
  'Anděl Páně', 'Babovřesky', 'Účastníci zájezdu', 'Bobule', 'Snowboarďáci', 'Zdeňka', 'Mazaný Filip', 'Hodinový manžel'
];

// ============================================================================
// 3. HELPERS
// ============================================================================
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const CINEMETA = 'https://v3-cinemeta.strem.io';
const PREHRAJ = 'https://prehraj.to';
const PREHRAJ_HEADERS = { 'User-Agent': UA, Cookie: 'AC=C', 'Accept-Language': 'cs-CZ,cs;q=0.9,en;q=0.8', Referer: PREHRAJ + '/' };
const HOUR = 60 * 60 * 1000;

let currentOrigin = process.env.ADDON_ORIGIN || '';

const cache = new Map();
function cacheGet(key) {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.val;
  cache.delete(key);
  return undefined;
}
function cacheSet(key, val, ttl) {
  cache.set(key, { val, exp: Date.now() + ttl });
  if (cache.size > 800) cache.delete(cache.keys().next().value);
  return val;
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const isCzSk = country => /czech|slovak|česk|sloven/i.test(country || '');

async function getJson(url, timeout = 6000) {
  const r = await axios.get(url, { timeout, headers: { 'User-Agent': UA } });
  return r.data;
}

async function cinemetaMeta(type, id) {
  const key = `meta:${type}:${id}`;
  const c = cacheGet(key);
  if (c !== undefined) return c;
  try {
    const j = await getJson(`${CINEMETA}/meta/${type}/${id}.json`);
    return cacheSet(key, j.meta || null, 6 * HOUR);
  } catch (e) {
    return null;
  }
}

async function cinemetaSearch(type, query) {
  const key = `search:${type}:${query}`;
  const c = cacheGet(key);
  if (c !== undefined) return c;
  try {
    const j = await getJson(`${CINEMETA}/catalog/${type}/top/search=${encodeURIComponent(query)}.json`);
    return cacheSet(key, j.metas || [], 6 * HOUR);
  } catch (e) {
    return [];
  }
}

function toCatalogMeta(meta, type, nameOverride) {
  return {
    id: meta.imdb_id || meta.id,
    type,
    name: nameOverride || meta.name,
    poster: meta.poster,
    background: meta.background,
    description: meta.description,
    releaseInfo: meta.releaseInfo || meta.year,
    imdbRating: meta.imdbRating,
    genres: meta.genres
  };
}

// ============================================================================
// 4. CATALOG HANDLER
// ============================================================================
async function seriesCatalog(search) {
  const q = norm(search);
  let list = SERIES;
  if (q) list = SERIES.filter(s => [s.cz, ...(s.alt || [])].some(n => norm(n).includes(q)));
  const metas = (await Promise.all(list.map(async s => {
    const m = await cinemetaMeta('series', s.id);
    return m ? toCatalogMeta(m, 'series', s.cz) : { id: s.id, type: 'series', name: s.cz };
  })));
  if (q && metas.length === 0) return czSkSearch('series', search);
  return metas;
}

async function movieCatalog(search) {
  const q = norm(search);
  const names = [...new Set(MOVIE_NAMES)].filter(n => !q || norm(n).includes(q));
  const metas = (await Promise.all(names.map(async n => {
    const key = `movieresolve:${n}`;
    let resolved = cacheGet(key);
    if (resolved === undefined) {
      const found = await cinemetaSearch('movie', n);
      resolved = null;
      for (const f of found.slice(0, 4)) {
        const m = await cinemetaMeta('movie', f.id);
        if (m && isCzSk(m.country)) { resolved = toCatalogMeta(m, 'movie', n); break; }
      }
      cacheSet(key, resolved, 6 * HOUR);
    }
    return resolved;
  }))).filter(Boolean);
  const seen = new Set();
  const out = metas.filter(m => !seen.has(m.id) && seen.add(m.id));
  if (q && out.length === 0) return czSkSearch('movie', search);
  return out;
}

// Free text search: any Czech/Slovak title Cinemeta knows
async function czSkSearch(type, search) {
  const found = (await cinemetaSearch(type, search)).slice(0, 10);
  const metas = await Promise.all(found.map(async f => {
    const m = await cinemetaMeta(type, f.id);
    return m && isCzSk(m.country) ? toCatalogMeta(m, type) : null;
  }));
  return metas.filter(Boolean);
}

// ============================================================================
// 5. PREHRAJ.TO SCRAPING + STRICT MATCHING
// ============================================================================
const JUNK = /\b(trailer|upoutavka|ukazka|zajimavosti|hlasky|best of|kompilace|sestrih|scenky|making of|bloopers|recenze|reakce|rozhovor|podcast)\b/;

function parseDuration(s) {
  const p = String(s || '').trim().split(':').map(Number);
  if (p.some(isNaN) || p.length < 2) return 0;
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
}

async function prehrajSearch(query) {
  const key = `ph:${norm(query)}`;
  const c = cacheGet(key);
  if (c !== undefined) return c;

  let html = null;
  for (let attempt = 0; attempt < 2 && html === null; attempt++) {
    try {
      const r = await axios.get(`${PREHRAJ}/hledej/${encodeURIComponent(query)}`, { headers: PREHRAJ_HEADERS, timeout: 5000 });
      html = typeof r.data === 'string' ? r.data : '';
    } catch (e) {
      if (e.response && e.response.status === 429 && attempt === 0) await sleep(900);
      else break;
    }
  }
  if (html === null) return []; // do not cache failures

  const results = [];
  const re = /<a\b[^>]*class="[^"]*video--link[^"]*"[^>]*>[\s\S]*?<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const block = m[0];
    const href = (block.match(/href="(\/[^"]+\/[a-f0-9]{16})"/) || [])[1];
    const title = (block.match(/title="([^"]+)"/) || [])[1];
    if (!href || !title) continue;
    const time = (block.match(/video__tag--time[^>]*>\s*([\d:]+)\s*</) || [])[1];
    const size = (block.match(/video__tag--size[^>]*>\s*([^<]+?)\s*</) || [])[1];
    results.push({
      path: href,
      title: title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'"),
      seconds: parseDuration(time),
      size: size || ''
    });
  }
  return cacheSet(key, results, HOUR);
}

function hasName(normTitle, normName) {
  return normName && (` ${normTitle} `).includes(` ${normName} `);
}

// Word right after the show name must look like an episode marker, otherwise it is a different show
// (e.g. "Hospoda Jamajka" must not match "Hospoda").
function nameThenMarker(normTitle, normName) {
  const idx = (` ${normTitle} `).indexOf(` ${normName} `);
  if (idx < 0) return false;
  const rest = (` ${normTitle} `).slice(idx + normName.length + 2).trim();
  if (!rest) return true;
  return /^(\d|s ?\d|e ?\d|dil\b|epizoda\b|serial\b|cz\b|sk\b|cesky\b|serie\b|rada\b|ep\b)/.test(rest);
}

// ============================================================================
// HELLSPY (second source, public JSON API, direct MP4 conversions, no login)
// ============================================================================
const HELLSPY = 'https://api.hellspy.to/gw';

async function hellspySearch(query) {
  const key = `hs:${norm(query)}`;
  const c = cacheGet(key);
  if (c !== undefined) return c;
  try {
    const r = await axios.get(`${HELLSPY}/search`, {
      params: { query, offset: 0, limit: 30 }, headers: { 'User-Agent': UA }, timeout: 5000
    });
    const items = (r.data && r.data.items) || [];
    const out = items.filter(x => x.id && x.fileHash && x.title).map(x => ({
      src: 'hellspy',
      path: `${x.id}/${x.fileHash}`,
      title: String(x.title),
      seconds: x.duration || 0,
      size: x.size ? (x.size > 1e9 ? (x.size / 1e9).toFixed(2) + ' GB' : Math.round(x.size / 1e6) + ' MB') : ''
    }));
    return cacheSet(key, out, HOUR);
  } catch (e) {
    return [];
  }
}

async function resolveHellspy(id, hash) {
  const key = `resolveh:${id}/${hash}`;
  const c = cacheGet(key);
  if (c) return c;
  const r = await axios.get(`${HELLSPY}/video/${id}/${hash}`, { headers: { 'User-Agent': UA }, timeout: 8000 });
  const conv = (r.data && r.data.conversions) || {};
  const best = Object.keys(conv).map(Number).filter(n => !isNaN(n)).sort((a, b) => b - a)[0];
  const url = best ? conv[String(best)] : null;
  if (!url) return null;
  return cacheSet(key, url, 10 * 60 * 1000);
}

// Query both sources in parallel (different hosts, so no shared rate limit)
async function searchAll(q) {
  const [a, b] = await Promise.all([prehrajSearch(q).catch(() => []), hellspySearch(q).catch(() => [])]);
  return [...b, ...a.map(x => ({ src: 'prehraj', ...x }))];
}

function episodeMatchStrength(normTitle, season, ep, absEp, epTitle) {
  const S = String(season), E = String(ep);
  // S01E02 / s1e2
  if (new RegExp(`\\bs0*${S} ?e0*${E}\\b`).test(normTitle)) return 3;
  // 1x02
  if (new RegExp(`\\b0*${S} ?x ?0*${E}\\b`).test(normTitle)) return 3;
  if (epTitle && epTitle.length >= 4 && (` ${normTitle} `).includes(` ${epTitle} `)) return 2;
  // "2. dil" / "2 dil" / "dil 2"
  const nums = [E];
  if (absEp && String(absEp) !== E) nums.push(String(absEp));
  for (const n of nums) {
    if (new RegExp(`\\b0*${n} ?dil\\b`).test(normTitle) || new RegExp(`\\bdil 0*${n}\\b`).test(normTitle)) {
      return (n === E && season === 1) || n !== E ? 1 : 0.5;
    }
  }
  return 0;
}

function qualityOf(title) {
  const t = title.toLowerCase();
  if (/2160|4k|uhd/.test(t)) return '2160p';
  if (/1080/.test(t)) return '1080p';
  if (/720/.test(t)) return '720p';
  if (/480|dvd/.test(t)) return '480p';
  return '';
}

function toStream(r) {
  const q = qualityOf(r.title);
  const mins = r.seconds ? Math.round(r.seconds / 60) + ' min' : '';
  const dab = /\b(cz|cesky|dabing|dab|cs)\b/.test(norm(r.title)) ? ' • CZ' : '';
  const label = r.src === 'hellspy' ? 'Hellspy' : 'Prehraj.to';
  const resolvePath = r.src === 'hellspy' ? `/resolve/hs/${r.path}` : `/resolve${r.path}`;
  return {
    name: `${label}${q ? '\n' + q : ''}`,
    title: `${r.title}\n${[mins, r.size].filter(Boolean).join(' • ')}${dab}`,
    url: `${currentOrigin}${resolvePath}`,
    behaviorHints: { notWebReady: false, bingeGroup: 'jbp-' + (r.src || 'prehraj') }
  };
}

function restAfterName(normTitle, normName) {
  const t = ` ${normTitle} `;
  const idx = t.indexOf(` ${normName} `);
  return idx < 0 ? '' : t.slice(idx + normName.length + 2).trim();
}

async function findEpisodeStreams(names, season, ep, absEp, epTitleRaw) {
  const epTitle = norm(epTitleRaw);
  const s2 = String(season).padStart(2, '0'), e2 = String(ep).padStart(2, '0');
  const matched = new Map();
  for (const name of names) {
    const normName = norm(name);
    const queries = [`${name} S${s2}E${e2}`, `${name} ${ep}`, `${name} ${ep}. díl`];
    if (absEp && absEp !== ep) queries.push(`${name} ${absEp}`);
    if (epTitle.length >= 4) queries.push(`${name} ${epTitleRaw}`);
    for (const q of queries) {
      const res = await searchAll(q);
      for (const r of res) {
        const nt = norm(r.title);
        if (!hasName(nt, normName) || !nameThenMarker(nt, normName) || JUNK.test(nt)) continue;
        if (r.seconds && (r.seconds < 8 * 60 || r.seconds > 4 * 3600)) continue;
        let strength = episodeMatchStrength(nt, season, ep, absEp, epTitle);
        if (strength <= 0) {
          // weak: "Name 3 - Title" / "Name (3) ..."
          const rest = restAfterName(nt, normName);
          const n = (rest.match(/^0*(\d+)\b/) || [])[1];
          if (n && ((Number(n) === ep && season === 1) || (absEp && Number(n) === absEp))) strength = 0.8;
        }
        if (strength <= 0) continue;
        const k = `${r.src}:${r.path}`;
        const prev = matched.get(k);
        if (!prev || prev.strength < strength) matched.set(k, { ...r, strength });
      }
      if ([...matched.values()].filter(x => x.strength >= 2).length >= 3) break;
    }
    if (matched.size >= 3) break;
  }
  return [...matched.values()]
    .sort((a, b) => b.strength - a.strength || b.seconds - a.seconds)
    .slice(0, 8);
}

async function findMovieStreams(names, year) {
  const matched = new Map();
  for (const name of names) {
    const normName = norm(name);
    const queries = year ? [`${name} ${year}`, name] : [name];
    for (const q of queries) {
      const res = await searchAll(q);
      for (const r of res) {
        const nt = norm(r.title);
        if (!hasName(nt, normName) || !nameThenMarker(nt, normName) || JUNK.test(nt)) continue;
        if (r.seconds && r.seconds < 55 * 60) continue; // full movies only
        const yearBonus = year && nt.includes(String(year)) ? 1 : 0;
        const k = `${r.src}:${r.path}`;
        if (!matched.has(k)) matched.set(k, { ...r, strength: yearBonus });
      }
      if (matched.size >= 3) break;
    }
    if (matched.size >= 3) break;
  }
  return [...matched.values()].sort((a, b) => b.strength - a.strength || b.seconds - a.seconds).slice(0, 8);
}

// Resolve a Prehraj detail page into a direct, tokenized MP4 URL (called when user presses play)
async function resolvePrehraj(path) {
  const key = `resolve:${path}`;
  const c = cacheGet(key);
  if (c) return c;
  const r = await axios.get(`${PREHRAJ}${path}`, { headers: PREHRAJ_HEADERS, timeout: 8000 });
  const html = String(r.data || '');
  const sources = (html.match(/sources\s*=\s*\[([\s\S]*?)\];/) || [])[1] || '';
  const files = [...sources.matchAll(/file:\s*["']([^"']+)["']/g)].map(x => x[1]);
  const url = files.length ? files[files.length - 1] : (html.match(/https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8)[^\s"'<>]*/i) || [])[0];
  if (!url) return null;
  return cacheSet(key, url.replace(/&amp;/g, '&'), 10 * 60 * 1000);
}

// ============================================================================
// 6. YOUTUBE FALLBACK (only used when Prehraj has nothing; strict matching)
// ============================================================================
async function youtubeFallback(names, season, ep, absEp, epTitleRaw, isMovie, year) {
  try {
    const name = names[0];
    const q = isMovie ? `${name} ${year || ''} celý film` : `${name} ${ep}. díl celý`;
    const r = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&hl=cs`, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'cs-CZ,cs;q=0.9' }, timeout: 4500
    });
    const m = String(r.data).match(/ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);
    if (!m) return [];
    const data = JSON.parse(m[1]);
    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const out = [];
    for (const sec of sections) {
      for (const item of sec?.itemSectionRenderer?.contents || []) {
        const v = item.videoRenderer;
        if (!v || !v.videoId) continue;
        const title = (v.title?.runs || []).map(x => x.text).join('');
        const nt = norm(title);
        const secs = parseDuration(v.lengthText?.simpleText);
        if (JUNK.test(nt) || !names.some(n => hasName(nt, norm(n)))) continue;
        if (/\b(epizody|epizoda|serie) \d+ ?\d* ?(\d+)?\b.*\b20\d\d\b/.test(nt)) continue;
        if (isMovie ? secs < 55 * 60 || secs > 3.5 * 3600 : secs < 15 * 60 || secs > 75 * 60) continue;
        if (!isMovie && episodeMatchStrength(nt, season, ep, absEp, norm(epTitleRaw)) <= 0) continue;
        out.push({
          name: '▶ YouTube',
          title: `${title}\n${v.lengthText?.simpleText || ''}`,
          ytId: v.videoId
        });
        if (out.length >= 2) return out;
      }
    }
    return out;
  } catch (e) {
    return [];
  }
}

// ============================================================================
// 7. STREAM HANDLER (works for ANY Czech/Slovak title Cinemeta knows)
// ============================================================================
async function streamsFor(type, id) {
  const parts = id.split(':');
  const imdb = parts[0];
  if (!/^tt\d+$/.test(imdb)) return [];

  const cached = cacheGet(`streams:${id}`);
  if (cached) return cached;

  const curated = SERIES.find(s => s.id === imdb);
  const meta = await cinemetaMeta(type, imdb);
  if (!meta) return [];
  if (!curated && !isCzSk(meta.country)) return []; // never hijack foreign titles

  const names = [...new Set([curated && curated.cz, ...((curated && curated.alt) || []), meta.name].filter(Boolean))];
  let found = [];
  let streams = [];

  if (type === 'series') {
    const season = parseInt(parts[1], 10), ep = parseInt(parts[2], 10);
    if (!season && season !== 0) return [];
    const videos = (meta.videos || []).filter(v => v.season > 0).sort((a, b) => a.season - b.season || a.episode - b.episode);
    const idx = videos.findIndex(v => v.season === season && v.episode === ep);
    const absEp = idx >= 0 ? idx + 1 : 0;
    const epTitleRaw = idx >= 0 ? (videos[idx].name || videos[idx].title || '') : '';
    found = await findEpisodeStreams(names, season, ep, absEp, epTitleRaw);
    streams = found.map(toStream);
    if (streams.length === 0) streams = await youtubeFallback(names, season, ep, absEp, epTitleRaw, false);
  } else {
    const year = parseInt(String(meta.year || meta.releaseInfo || '').slice(0, 4), 10) || '';
    found = await findMovieStreams(names, year);
    streams = found.map(toStream);
    if (streams.length === 0) streams = await youtubeFallback(names, 0, 0, 0, '', true, year);
  }

  if (streams.length) cacheSet(`streams:${id}`, streams, 30 * 60 * 1000);
  return streams;
}

// ============================================================================
// 8. ADDON BUILDER
// ============================================================================
const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id, extra }) => {
  const search = extra && extra.search ? String(extra.search).trim() : '';
  try {
    if (type === 'series' && id === 'jbp_series') return { metas: await seriesCatalog(search), cacheMaxAge: 3600 };
    if (type === 'movie' && id === 'jbp_movies') return { metas: await movieCatalog(search), cacheMaxAge: 3600 };
  } catch (e) { /* fallthrough */ }
  return { metas: [] };
});

builder.defineStreamHandler(async ({ type, id }) => {
  try {
    return { streams: await streamsFor(type, id), cacheMaxAge: 600 };
  } catch (e) {
    return { streams: [] };
  }
});

// ============================================================================
// 9. VERCEL ENTRY + /resolve REDIRECT + LANDING PAGE
// ============================================================================
const addonInterface = builder.getInterface();
const router = sdkGetRouter(addonInterface);

const landing = (host, proto) => `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>JebuPředplatný - Stremio addon</title>
<style>
body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0b0c10;color:#f3f4f6;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;padding:24px;text-align:center}
.card{background:#14171f;border:1px solid #232838;border-radius:16px;padding:36px 28px;max-width:560px;width:100%}
h1 span{color:#e50914}.btn{display:inline-block;background:#e50914;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;margin:18px 0}
code{background:#1f2433;padding:6px 10px;border-radius:6px;word-break:break-all;font-size:.85rem}p,li{color:#9ca3af;line-height:1.6}ul{text-align:left}
</style></head><body><div class="card">
<h1>Jebu<span>Předplatný</span></h1>
<p>České a slovenské seriály a filmy zdarma, přímo ve Stremiu. Žádné předplatné.</p>
<a class="btn" href="stremio://${host}/manifest.json">Nainstalovat do Stremia</a>
<p><code>${proto}://${host}/manifest.json</code></p>
<ul><li>Funguje u každého českého/slovenského titulu ve Stremiu (Populární, Hledání, Knihovna)</li>
<li>Epizody a metadata dodává Cinemeta, addon hledá streamy na Prehraj.to</li>
<li>Vlastní katalogy: české seriály a filmy</li></ul></div></body></html>`;

function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] || (String(host).startsWith('localhost') ? 'http' : 'https');
  currentOrigin = `${proto}://${host}`;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

  const path = (req.url || '/').split('?')[0];

  if (path === '/' || path === '/index.html') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(landing(host, proto));
  }

  if (path.startsWith('/resolve/')) {
    const redirect = url => {
      if (!url) { res.statusCode = 404; return res.end('Stream not found'); }
      res.statusCode = 302;
      res.setHeader('Location', url);
      res.setHeader('Cache-Control', 'no-store');
      res.end();
    };
    const fail = () => { res.statusCode = 502; res.end('Upstream error'); };
    const hs = path.match(/^\/resolve\/hs\/(\d+)\/([a-f0-9]+)$/);
    if (hs) { resolveHellspy(hs[1], hs[2]).then(redirect).catch(fail); return; }
    const p = path.slice('/resolve'.length);
    if (!/^\/[a-z0-9-]+\/[a-f0-9]{16}$/.test(p)) { res.statusCode = 400; return res.end('Bad request'); }
    resolvePrehraj(p).then(redirect).catch(fail);
    return;
  }

  router(req, res, () => { res.statusCode = 404; res.end('Not found'); });
}

module.exports = handler;
module.exports._internals = { norm, episodeMatchStrength, streamsFor, seriesCatalog, movieCatalog, resolvePrehraj, prehrajSearch, SERIES };
