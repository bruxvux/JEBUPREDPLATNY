const { addonBuilder, getRouter: sdkGetRouter } = require('stremio-addon-sdk');
const axios = require('axios');

// ============================================================================
// 1. MANIFEST CONFIGURATION (v3.0.0 - UNIVERSAL CINEMETA STREAM PROVIDER)
//    No custom catalogs: Stremio uses Cinemeta's complete catalog for all titles.
//    Our addon resolves streams for ANY Czech/Slovak series or movie in Stremio.
// ============================================================================
const manifest = {
  id: 'community.jebupredplatny.czsk',
  version: '3.0.0',
  name: 'JebuPředplatný (CZ/SK All-in-One Stream)',
  description: 'Přehrávání českých a slovenských seriálů a filmů (Comeback, Boží plán, Hospoda, Most!, iVysílání, TV Nova, Prima, Hellspy 1080p, Prehraj.to, YouTube). Funguje pro jakýkoliv český titul v Cinemeta / Stremio.',
  resources: ['stream'],
  types: ['series', 'movie'],
  idPrefixes: ['tt'],
  catalogs: []
};

// ============================================================================
// 2. BROADCASTER DICTIONARY & DIRECT CHANNELS MAPPING
// ============================================================================
const BROADCASTER_SHOWS = {
  // TV Nova shows (Oneplay / Voyo / Nova)
  tt1321261: {
    broadcaster: 'nova',
    name: 'Comeback',
    url: 'https://www.oneplay.cz/porad/33-comeback',
    playerLabel: 'TV Nova / Oneplay'
  },
  tt44752529: {
    broadcaster: 'nova',
    name: 'Boží plán',
    url: 'https://www.oneplay.cz/porad/365143-bozi-plan',
    playerLabel: 'TV Nova / Oneplay'
  },
  tt1067851: {
    broadcaster: 'nova',
    name: 'Hospoda',
    url: 'https://www.oneplay.cz/porad/23-hospoda',
    playerLabel: 'TV Nova / Oneplay'
  },
  tt1794286: {
    broadcaster: 'nova',
    name: 'Okresní přebor',
    url: 'https://tv.nova.cz/porad/okresni-prebor',
    playerLabel: 'TV Nova'
  },
  tt7067008: {
    broadcaster: 'nova',
    name: 'Specialisté',
    url: 'https://tv.nova.cz/porad/specialiste',
    playerLabel: 'TV Nova'
  },
  tt0924182: {
    broadcaster: 'nova',
    name: 'Ordinace v růžové zahradě',
    url: 'https://tv.nova.cz/porad/ordinace-v-ruzove-zahrade-2',
    playerLabel: 'TV Nova'
  },
  tt13210838: {
    broadcaster: 'nova',
    name: 'Ulice',
    url: 'https://tv.nova.cz/porad/ulice',
    playerLabel: 'TV Nova'
  },

  // Česká televize (iVysílání) shows
  tt9205566: {
    broadcaster: 'ct',
    name: 'Most!',
    url: 'https://www.ceskatelevize.cz/porady/10995220806-most/',
    playerLabel: 'ČT iVysílání HD'
  },
  tt10580064: {
    broadcaster: 'ct',
    name: 'Most!',
    url: 'https://www.ceskatelevize.cz/porady/10995220806-most/',
    playerLabel: 'ČT iVysílání HD'
  },
  tt3450288: {
    broadcaster: 'ct',
    name: 'Čtvrtá hvězda',
    url: 'https://www.ceskatelevize.cz/porady/10586940003-ctvrta-hvezda/',
    playerLabel: 'ČT iVysílání HD'
  },
  tt5894518: {
    broadcaster: 'ct',
    name: 'Kosmo',
    url: 'https://www.ceskatelevize.cz/porady/10795550604-kosmo/',
    playerLabel: 'ČT iVysílání HD'
  },
  tt16532444: {
    broadcaster: 'ct',
    name: 'Devadesátky',
    url: 'https://www.ceskatelevize.cz/porady/16532444-devadesatky/',
    playerLabel: 'ČT iVysílání HD'
  },
  tt12691770: {
    broadcaster: 'ct',
    name: 'Kukačky',
    url: 'https://www.ceskatelevize.cz/porady/12691770-kukacky/',
    playerLabel: 'ČT iVysílání HD'
  },
  tt0319972: {
    broadcaster: 'ct',
    name: 'Chalupáři',
    url: 'https://www.ceskatelevize.cz/porady/874591-chalupari/dily/',
    playerLabel: 'ČT iVysílání HD'
  },
  tt5976538: {
    broadcaster: 'ct',
    name: 'Rapl',
    url: 'https://www.ceskatelevize.cz/porady/10903348000-rapl/',
    playerLabel: 'ČT iVysílání HD'
  },
  tt5994826: {
    broadcaster: 'ct',
    name: 'Svět pod hlavou',
    url: 'https://www.ceskatelevize.cz/porady/10898748000-svet-pod-hlavou/',
    playerLabel: 'ČT iVysílání HD'
  },
  tt6848378: {
    broadcaster: 'ct',
    name: 'Dabing Street',
    url: 'https://www.ceskatelevize.cz/porady/10972350000-dabing-street/',
    playerLabel: 'ČT iVysílání HD'
  },
  tt4460254: {
    broadcaster: 'ct',
    name: 'Doktor Martin',
    url: 'https://www.ceskatelevize.cz/porady/10695024000-doktor-martin/',
    playerLabel: 'ČT iVysílání HD'
  },
  tt1741649: {
    broadcaster: 'ct',
    name: 'Vyprávěj',
    url: 'https://www.ceskatelevize.cz/porady/10195164000-vypravej/',
    playerLabel: 'ČT iVysílání HD'
  },

  // TV Prima (Prima+) shows
  tt11775096: {
    broadcaster: 'prima',
    name: 'Slunečná',
    url: 'https://prima.iprima.cz/porady/slunecna',
    playerLabel: 'TV Prima / Prima+'
  },
  tt6350196: {
    broadcaster: 'obbod',
    name: 'Vyšehrad',
    url: 'https://www.youtube.com/results?search_query=vysehrad+lavi+serial',
    playerLabel: 'Vyšehrad (Obbod / YouTube)'
  }
};

// ============================================================================
// 3. UTILITIES & CINEMETA BRIDGE
// ============================================================================
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const CINEMETA = 'https://v3-cinemeta.strem.io';
const PREHRAJ = 'https://prehraj.to';
const HELLSPY = 'https://api.hellspy.to/gw';
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
  if (cache.size > 1000) cache.delete(cache.keys().next().value);
  return val;
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseDuration(s) {
  const p = String(s || '').trim().split(':').map(Number);
  if (p.some(isNaN) || p.length < 2) return 0;
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
}

const isCzSk = country => /czech|slovak|česk|sloven/i.test(country || '');

async function cinemetaMeta(type, id) {
  const key = `meta:${type}:${id}`;
  const c = cacheGet(key);
  if (c !== undefined) return c;
  try {
    const res = await axios.get(`${CINEMETA}/meta/${type}/${id}.json`, {
      headers: { 'User-Agent': UA },
      timeout: 5000
    });
    return cacheSet(key, res.data?.meta || null, 6 * HOUR);
  } catch (e) {
    return null;
  }
}

// ============================================================================
// 4. STREAM SOURCES: HELLSPY, PREHRAJ.TO, YOUTUBE, AND BROADCASTER PLAYERS
// ============================================================================

// --- Source A: Hellspy (Direct 1080p/720p MP4) ---
async function searchHellspy(query) {
  const key = `hs:${norm(query)}`;
  const c = cacheGet(key);
  if (c !== undefined) return c;
  try {
    const r = await axios.get(`${HELLSPY}/search`, {
      params: { query, offset: 0, limit: 25 },
      headers: { 'User-Agent': UA },
      timeout: 4500
    });
    const items = r.data?.items || [];
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
  try {
    const r = await axios.get(`${HELLSPY}/video/${id}/${hash}`, { headers: { 'User-Agent': UA }, timeout: 7000 });
    const conv = r.data?.conversions || {};
    const best = Object.keys(conv).map(Number).filter(n => !isNaN(n)).sort((a, b) => b - a)[0];
    const url = best ? conv[String(best)] : null;
    if (!url) return null;
    return cacheSet(key, url, 15 * 60 * 1000);
  } catch (e) {
    return null;
  }
}

// --- Source B: Prehraj.to (Direct MP4) ---
async function searchPrehraj(query) {
  const key = `ph:${norm(query)}`;
  const c = cacheGet(key);
  if (c !== undefined) return c;
  try {
    const r = await axios.get(`${PREHRAJ}/hledej/${encodeURIComponent(query)}`, {
      headers: PREHRAJ_HEADERS,
      timeout: 4500
    });
    const html = typeof r.data === 'string' ? r.data : '';
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
        src: 'prehraj',
        path: href,
        title: title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'"),
        seconds: parseDuration(time),
        size: size || ''
      });
    }
    return cacheSet(key, results, HOUR);
  } catch (e) {
    return [];
  }
}

async function resolvePrehraj(path) {
  const key = `resolvep:${path}`;
  const c = cacheGet(key);
  if (c) return c;
  try {
    const r = await axios.get(`${PREHRAJ}${path}`, { headers: PREHRAJ_HEADERS, timeout: 7000 });
    const html = String(r.data || '');
    const sources = (html.match(/sources\s*=\s*\[([\s\S]*?)\];/) || [])[1] || '';
    const files = [...sources.matchAll(/file:\s*["']([^"']+)["']/g)].map(x => x[1]);
    const url = files.length ? files[files.length - 1] : (html.match(/https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8)[^\s"'<>]*/i) || [])[0];
    if (!url) return null;
    return cacheSet(key, url.replace(/&amp;/g, '&'), 15 * 60 * 1000);
  } catch (e) {
    return null;
  }
}

const JUNK = /\b(trailer|upoutavka|ukazka|sample|promo)\b/;

// --- Source C: YouTube (HD Streams) ---
const JUNK_YT = /\b(trailer|upoutavka|ukazka|zajimavosti|hlasky|best of|kompilace|sestrih|scenky|making of|bloopers|recenze|reakce|rozhovor|podcast|policejni|dokument|fakta|faktu|nahoda|jak se natacel|2026|epizody 1~|epizody 20~)\b/;

async function searchYouTubeSeries(showName, season, ep, epTitle) {
  try {
    const q = epTitle ? `${showName} ${epTitle}` : `${showName} ${ep}. díl`;
    const r = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' celý díl')}&hl=cs`, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'cs-CZ,cs;q=0.9' },
      timeout: 4000
    });
    const m = String(r.data).match(/ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);
    if (!m) return [];
    const data = JSON.parse(m[1]);
    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const out = [];
    const normShow = norm(showName);
    const normEpTitle = epTitle ? norm(epTitle) : '';
    const epRegex = new RegExp(`\\b(s0?${season}e0?${ep}|${season}x0?${ep}|${ep}\\.\\s*dil|dil\\s*${ep}|epizoda\\s*${ep}|cast\\s*${ep})\\b`, 'i');

    for (const sec of sections) {
      for (const item of sec?.itemSectionRenderer?.contents || []) {
        const v = item.videoRenderer;
        if (!v || !v.videoId) continue;
        const title = (v.title?.runs || []).map(x => x.text).join('') || v.title?.simpleText || '';
        const nt = norm(title);
        const secs = parseDuration(v.lengthText?.simpleText);
        if (JUNK_YT.test(nt)) continue;
        if (secs < 15 * 60 || secs > 80 * 60) continue;
        if (!nt.includes(normShow)) continue;
        const matchesEp = (normEpTitle && normEpTitle.length > 3 && nt.includes(normEpTitle)) || epRegex.test(nt);
        if (!matchesEp) continue;

        out.push({
          name: '▶ YouTube HD',
          title: `[YOUTUBE] ${title}\n${v.lengthText?.simpleText || ''} • 1080p`,
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

async function searchYouTubeMovie(movieName, year) {
  try {
    const q = `${movieName} celý film`;
    const r = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&hl=cs`, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'cs-CZ,cs;q=0.9' },
      timeout: 4000
    });
    const m = String(r.data).match(/ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);
    if (!m) return [];
    const data = JSON.parse(m[1]);
    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const out = [];
    const normMovie = norm(movieName);

    for (const sec of sections) {
      for (const item of sec?.itemSectionRenderer?.contents || []) {
        const v = item.videoRenderer;
        if (!v || !v.videoId) continue;
        const title = (v.title?.runs || []).map(x => x.text).join('') || v.title?.simpleText || '';
        const nt = norm(title);
        const secs = parseDuration(v.lengthText?.simpleText);
        if (JUNK_YT.test(nt)) continue;
        if (secs < 50 * 60) continue;
        if (!nt.includes(normMovie)) continue;

        out.push({
          name: '▶ YouTube HD',
          title: `[YOUTUBE] ${title}\n${v.lengthText?.simpleText || ''} • 1080p`,
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
// 5. MATCHING LOGIC & RESOLVER
// ============================================================================
function qualityOf(title) {
  const t = title.toLowerCase();
  if (/2160|4k|uhd/.test(t)) return '2160p 4K';
  if (/1080/.test(t)) return '1080p FHD';
  if (/720/.test(t)) return '720p HD';
  if (/480|dvd/.test(t)) return '480p';
  return 'HD';
}

function toDirectStream(r) {
  const q = qualityOf(r.title);
  const mins = r.seconds ? Math.round(r.seconds / 60) + ' min' : '';
  const dab = /\b(cz|cesky|dabing|dab|cs)\b/.test(norm(r.title)) ? ' • CZ dabing' : '';
  const label = r.src === 'hellspy' ? '⚡ Hellspy' : '⚡ Prehraj.to';
  const resolvePath = r.src === 'hellspy' ? `/resolve/hs/${r.path}` : `/resolve${r.path}`;
  return {
    name: `${label} [${q}]`,
    title: `[PŘÍMÝ STREAM] ${r.title}\n${[mins, r.size].filter(Boolean).join(' • ')}${dab} • Přehrát ve Stremiu`,
    url: `${currentOrigin}${resolvePath}`,
    behaviorHints: { notWebReady: false, bingeGroup: 'jbp-direct' }
  };
}

function episodeMatchStrength(normTitle, season, ep, absEp, epTitle) {
  const S = String(season), E = String(ep);
  if (new RegExp(`\\bs0*${S} ?e0*${E}\\b`).test(normTitle)) return 3;
  if (new RegExp(`\\b0*${S} ?x ?0*${E}\\b`).test(normTitle)) return 3;
  if (epTitle && epTitle.length >= 4 && (` ${normTitle} `).includes(` ${epTitle} `)) return 2.5;
  const nums = [E];
  if (absEp && String(absEp) !== E) nums.push(String(absEp));
  for (const n of nums) {
    if (new RegExp(`\\b0*${n} ?dil\\b`).test(normTitle) || new RegExp(`\\bdil 0*${n}\\b`).test(normTitle)) {
      return (n === E && season === 1) || n !== E ? 1.5 : 0.8;
    }
  }
  return 0;
}

// Find direct files across Hellspy and Prehraj
async function findDirectFiles(titleNames, season, ep, absEp, epTitleRaw, isMovie = false, year = '') {
  const matched = new Map();
  const epTitle = norm(epTitleRaw);
  const s2 = String(season).padStart(2, '0'), e2 = String(ep).padStart(2, '0');

  for (const name of titleNames) {
    const normName = norm(name);
    let queries = [];
    if (isMovie) {
      queries = year ? [`${name} ${year}`, name] : [name];
    } else {
      queries = [`${name} S${s2}E${e2}`, `${name} ${ep}`, `${name} ${ep}. díl`];
      if (epTitle.length >= 4) queries.push(`${name} ${epTitleRaw}`);
    }

    for (const q of queries) {
      const [hsResults, phResults] = await Promise.all([
        searchHellspy(q).catch(() => []),
        searchPrehraj(q).catch(() => [])
      ]);
      const combined = [...hsResults, ...phResults];

      for (const r of combined) {
        const nt = norm(r.title);
        if (!(` ${nt} `).includes(` ${normName} `) || JUNK.test(nt)) continue;
        if (isMovie) {
          if (r.seconds && r.seconds < 50 * 60) continue;
          const yearBonus = year && nt.includes(String(year)) ? 1 : 0;
          const k = `${r.src}:${r.path}`;
          if (!matched.has(k)) matched.set(k, { ...r, strength: yearBonus });
        } else {
          if (r.seconds && (r.seconds < 8 * 60 || r.seconds > 4 * 3600)) continue;
          const strength = episodeMatchStrength(nt, season, ep, absEp, epTitle);
          if (strength <= 0) continue;
          const k = `${r.src}:${r.path}`;
          const prev = matched.get(k);
          if (!prev || prev.strength < strength) matched.set(k, { ...r, strength });
        }
      }
      if (matched.size >= 4) break;
    }
    if (matched.size >= 4) break;
  }

  return [...matched.values()]
    .sort((a, b) => b.strength - a.strength || b.seconds - a.seconds)
    .slice(0, 8)
    .map(toDirectStream);
}

// ============================================================================
// 6. MAIN STREAM HANDLER (WORKS FOR ANY CINEMETA SHOW/MOVIE)
// ============================================================================
async function resolveStreams(type, id) {
  const parts = id.split(':');
  const imdbId = parts[0];
  if (!/^tt\d+$/.test(imdbId)) return [];

  const cacheKey = `streams:${id}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  // 1. Get metadata from Cinemeta
  const meta = await cinemetaMeta(type, imdbId);
  if (!meta) return [];

  const curated = BROADCASTER_SHOWS[imdbId];
  const isCzechShow = curated || isCzSk(meta.country) || /\b(Czech|Slovakia|Česk|Sloven)\b/i.test(meta.description || '');

  // If completely foreign (e.g. Breaking Bad), ignore so other addons handle it
  if (!isCzechShow && !curated) return [];

  const showName = curated ? curated.name : meta.name;
  const allNames = [...new Set([showName, meta.name].filter(Boolean))];
  const streams = [];

  // 2. Add Broadcaster Official Online Players (Nova Oneplay, ČT iVysílání, Prima+)
  if (curated) {
    streams.push({
      name: `📺 [${curated.playerLabel}]`,
      title: `[OFICIÁLNÍ PŘEHRÁVAČ] ${curated.name}\nSledovat online zdarma na ${curated.playerLabel}`,
      externalUrl: curated.url
    });
  } else {
    // Dynamic Broadcaster Web Link based on genres/network
    if (/\b(česká televize|ceska televize|ct)\b/i.test(meta.description || '')) {
      streams.push({
        name: '📺 [ČT iVysílání]',
        title: `[iVYSÍLÁNÍ] ${showName}\nVyhledat a přehrát v oficiálním archivu České televize`,
        externalUrl: `https://www.ceskatelevize.cz/porady/?q=${encodeURIComponent(showName)}`
      });
    } else if (/\b(nova|voyo)\b/i.test(meta.description || '')) {
      streams.push({
        name: '📺 [TV Nova / Oneplay]',
        title: `[ONEPLAY] ${showName}\nVyhledat a přehrát v přehrávači Nova Oneplay`,
        externalUrl: `https://tv.nova.cz/hledani?q=${encodeURIComponent(showName)}`
      });
    } else if (/\b(prima)\b/i.test(meta.description || '')) {
      streams.push({
        name: '📺 [TV Prima / Prima+]',
        title: `[PRIMA+] ${showName}\nVyhledat a přehrát v přehrávači TV Prima`,
        externalUrl: `https://prima.iprima.cz/hledani?q=${encodeURIComponent(showName)}`
      });
    }
  }

  // 3. Add Direct MP4 Streams (from Hellspy and Prehraj.to)
  let season = null, ep = null, absEp = null, epTitle = '';
  if (type === 'series') {
    season = parseInt(parts[1], 10);
    ep = parseInt(parts[2], 10);
    const videos = (meta.videos || []).filter(v => v.season > 0).sort((a, b) => a.season - b.season || a.episode - b.episode);
    const idx = videos.findIndex(v => v.season === season && v.episode === ep);
    absEp = idx >= 0 ? idx + 1 : ep;
    if (idx >= 0) epTitle = videos[idx].name || videos[idx].title || '';

    const directStreams = await findDirectFiles(allNames, season, ep, absEp, epTitle, false);
    streams.push(...directStreams);

    // 4. Add YouTube HD (strictly verified matching episode/movie)
    const ytStreams = await searchYouTubeSeries(showName, season, ep, epTitle);
    streams.push(...ytStreams);
  } else {
    const year = parseInt(String(meta.year || meta.releaseInfo || '').slice(0, 4), 10) || '';
    const directStreams = await findDirectFiles(allNames, 0, 0, 0, '', true, year);
    streams.push(...directStreams);

    const ytStreams = await searchYouTubeMovie(showName, year);
    streams.push(...ytStreams);
  }

  // 5. Add Web Search Fallback (Sleduj.to)
  streams.push({
    name: '🌐 [Sleduj.to]',
    title: `[SLEDUJ.TO] ${showName} ${season ? `S${season}E${ep}` : ''}\nVyhledat a přehrát na Sleduj.to online`,
    externalUrl: `https://sleduj.online/hledej?q=${encodeURIComponent(showName)}`
  });

  cacheSet(cacheKey, streams, 30 * 60 * 1000);
  return streams;
}

// ============================================================================
// 7. STREMIO ADDON BUILDER & HTTP ROUTER
// ============================================================================
const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async ({ type, id }) => {
  try {
    const streams = await resolveStreams(type, id);
    return { streams, cacheMaxAge: 600 };
  } catch (e) {
    return { streams: [] };
  }
});

const addonInterface = builder.getInterface();
const router = sdkGetRouter(addonInterface);

const landing = (host, proto) => `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>JebuPředplatný - Stremio Addon (CZ/SK All-in-One)</title>
<style>
:root { --bg: #0b0c10; --card: #14171f; --border: #232838; --red: #e50914; --text: #f3f4f6; --muted: #9ca3af; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 24px; text-align: center; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 40px 32px; max-width: 580px; width: 100%; box-shadow: 0 12px 32px rgba(0,0,0,0.6); }
.badge { display: inline-block; background: rgba(229,9,20,0.15); color: #ff4d4d; border: 1px solid rgba(229,9,20,0.4); padding: 4px 12px; border-radius: 9999px; font-size: 0.8rem; font-weight: 700; margin-bottom: 16px; text-transform: uppercase; }
h1 { margin: 0 0 12px; font-size: 2.1rem; } h1 span { color: var(--red); }
p.lead { color: var(--muted); line-height: 1.6; margin-bottom: 24px; font-size: 1.05rem; }
.btn { display: inline-block; background: var(--red); color: #fff; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-weight: 700; font-size: 1.1rem; margin-bottom: 24px; transition: transform 0.2s; }
.btn:hover { transform: translateY(-2px); }
code { background: #1f2433; padding: 6px 10px; border-radius: 6px; font-size: 0.85rem; color: #e2e8f0; word-break: break-all; }
.features { background: #0f1219; border: 1px solid #1e2330; border-radius: 12px; padding: 20px; text-align: left; font-size: 0.9rem; color: #cbd5e1; line-height: 1.7; margin-top: 24px; }
.features h3 { color: #fff; margin: 0 0 10px; font-size: 1rem; }
.features ul { margin: 0; padding-left: 20px; }
</style></head><body><div class="card">
<div class="badge">v3.0.0 • 100% Free • All-in-One Stream</div>
<h1>Jebu<span>Předplatný</span></h1>
<p class="lead">Univerzální český a slovenský streamovací addon pro Stremio. Funguje přímo s výchozím katalogem Cinemeta pro všechny české seriály a filmy.</p>
<a class="btn" href="stremio://${host}/manifest.json">🚀 Nainstalovat do Stremia</a>
<div>URL Manifestu:<br><br><code>${proto}://${host}/manifest.json</code></div>
<div class="features">
<h3>✨ Podporované zdroje a funkce:</h3>
<ul>
  <li><strong>Přímé MP4 streamy:</strong> Hellspy 1080p a Prehraj.to (přehrávání přímo ve Stremiu).</li>
  <li><strong>Oficiální přehrávače:</strong> TV Nova / Oneplay (Comeback, Boží plán...), ČT iVysílání, TV Prima.</li>
  <li><strong>YouTube HD:</strong> Ověřené celé epizody a české filmy.</li>
  <li><strong>Sleduj.to:</strong> 1-klikové vyhledání a spuštění.</li>
  <li><strong>Žádný omezený katalog:</strong> Hledejte a prohlížejte přímo v Cinemeta / Popular ve Stremiu!</li>
</ul>
</div>
</div></body></html>`;

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

  // Lazy /resolve redirect
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
