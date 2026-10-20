// Client behaviour. Runs once; per-page set-up happens on `astro:page-load`.
//
// - Mode: light is "spec" (the drawing), dark is "runtime" (the drawing, running).
// - Map: arrows are drawn from the boxes' positions, so any layout works.
// - Transitions: while the next page loads, a box opens from what was clicked and plays the page's
//   scene (src/scripts/scenes/). Back to the map is a plain crossfade.
// - Status bar, command palette (⌘K or /), the About card, copy email.

import { navigate, type TransitionBeforePreparationEvent } from 'astro:transitions/client';
import type { RouteInfo } from '../lib/types';
import { scenes } from './scenes';
import { ease, clamp, type SceneContext } from './scenes/util';

const root = document.documentElement;
const NS = 'http://www.w3.org/2000/svg';
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
const T0 = performance.now();

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
/** A location's path as the routes know it: without the site's folder, '.html', '/index' or a trailing slash. */
function norm(p: string) {
  const b = data().base;
  if (b && (p === b || p.startsWith(b + '/'))) p = p.slice(b.length);
  return p.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '') || '/';
}

/** Routes, email and the site's folder, written into each page by the layout. */
function data(): { routes: Record<string, RouteInfo>; email: string; base: string } {
  try { return JSON.parse($('#sf-data')?.textContent ?? '{}'); } catch { return { routes: {}, email: '', base: '' }; }
}
const routeFor = (path: string): RouteInfo => data().routes[path] ?? { n: 0, t: 'page', label: path, tag: path };

/* ---------- status bar log ---------- */
function log(kind: string, msg: string) {
  const con = $('#con');
  if (!con) return;
  const li = document.createElement('li');
  li.innerHTML = '<span class="ts"></span><span class="kd"></span><span class="msg"></span>';
  (li.children[0] as HTMLElement).textContent = `+${((performance.now() - T0) / 1000).toFixed(3)}s`;
  (li.children[1] as HTMLElement).textContent = kind;
  (li.children[2] as HTMLElement).textContent = msg;
  con.appendChild(li);
  while (con.children.length > 8) con.firstChild?.remove();
  const last = $('#con-last');
  if (last) last.textContent = `${kind}  ${msg}`;
}

/* ---------- mode ---------- */
let themeChoice: string | null = root.dataset.theme ?? null;
const isDark = () => themeChoice === 'dark' || (themeChoice !== 'light' && darkMQ.matches);
function syncMode() {
  if (themeChoice) root.dataset.theme = themeChoice;
  const m = isDark() ? 'runtime' : 'spec';
  root.dataset.mode = m;
  $$('#mode span').forEach((s) => s.classList.toggle('on', s.dataset.m === m));
  $('#mode')?.setAttribute('aria-pressed', String(m === 'runtime'));
  layoutEdges();
}
function toggleMode() {
  themeChoice = isDark() ? 'light' : 'dark';
  try { localStorage.setItem('sf-theme', themeChoice); } catch { /* storage blocked: the choice lasts this visit */ }
  syncMode();
  log('mode', themeChoice === 'dark' ? 'runtime: edges live, log on' : 'spec');
}
darkMQ.addEventListener('change', syncMode);

/* ---------- map arrows ---------- */
let mapObserver: ResizeObserver | null = null;
function layoutEdges() {
  const map = $('#map'), svg = $<SVGSVGElement>('#edges'), eg = $<SVGGElement>('#edge-g');
  if (!map || !svg || !eg) return;
  const box = map.getBoundingClientRect();
  svg.setAttribute('width', String(box.width));
  svg.setAttribute('height', String(box.height));
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  eg.textContent = '';
  const wide = getComputedStyle(map).display === 'grid'; // the diagram; otherwise the indented tree
  const r = (v: number) => Math.round(v) + 0.5;
  $$('.node[data-parent]', map).forEach((n) => {
    const p = $(`.node[data-id="${n.dataset.parent}"]`, map);
    if (!p) return;
    const a = p.getBoundingClientRect(), b = n.getBoundingClientRect();
    let d: string;
    if (wide) {
      const x1 = a.right - box.left, y1 = a.top + a.height / 2 - box.top;
      const x2 = b.left - box.left - 2, y2 = b.top + b.height / 2 - box.top;
      const mx = x1 + (x2 - x1) / 2;
      d = `M${r(x1)} ${r(y1)} H${r(mx)} V${r(y2)} H${r(x2)}`;
    } else {
      const x1 = a.left - box.left + 12, y1 = a.bottom - box.top;
      const x2 = b.left - box.left - 2, y2 = b.top + Math.min(24, b.height / 2) - box.top;
      d = `M${r(x1)} ${r(y1)} V${r(y2)} H${r(x2)}`;
    }
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'edge' + (n.classList.contains('planned') ? ' planned' : ''));
    path.dataset.to = n.dataset.id;
    eg.appendChild(path);
  });
}

let lastHover = '';
document.addEventListener('pointerover', (e) => {
  const n = (e.target as Element).closest?.('.node') as HTMLElement | null;
  if (n && n.dataset.id !== lastHover) { lastHover = n.dataset.id ?? ''; log('hover', `node ${lastHover}`); }
});

/* ---------- transitions ---------- */
let busy = false;
let navStart = 0;
let pendingRect: DOMRect | null = null; // set by the palette, which navigates without a clicked link
let lastFrom = '';
const played = new Set<string>();

document.addEventListener('astro:before-preparation', (ev) => {
  const e = ev as TransitionBeforePreparationEvent;
  const from = norm(e.from.pathname), to = norm(e.to.pathname);
  navStart = performance.now();
  lastFrom = from;
  const rect = pendingRect;
  pendingRect = null;
  if (from === to) return;
  log('route', to);
  if (reduce.matches || busy || e.navigationType === 'traverse') return;
  const src = e.sourceElement as HTMLElement | undefined;
  if (to === '/' || src?.classList.contains('back')) return; // the default crossfade
  const route = routeFor(to);
  if (!route.transition || !scenes[route.transition.scene]) return;
  const startRect = src?.getBoundingClientRect() ?? rect ?? new DOMRect(innerWidth / 2 - 40, innerHeight / 2 - 30, 80, 60);
  const node = from === '/' && src?.classList.contains('node') ? src : undefined;
  const load = e.loader;
  e.loader = async () => {
    busy = true;
    try {
      await Promise.all([play(route, to, startRect, node), load()]);
    } catch (err) {
      closePortal(); // the router falls back to a full page load
      throw err;
    } finally {
      busy = false;
    }
  };
});

async function play(route: RouteInfo, path: string, rect: DOMRect, node?: HTMLElement) {
  if (node?.dataset.id) await packet(node.dataset.id);
  const portal = await expand(rect, route, path);
  const t = route.transition!;
  const canvas = $<HTMLCanvasElement>('canvas', portal)!;
  const dpr = Math.min(2, devicePixelRatio || 1);
  const width = canvas.clientWidth, height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  const key = `${t.scene}:${path}`;
  const c: SceneContext = {
    portal, canvas, ctx, width, height,
    heading: $('.ph', portal)!, caption: $('.stage .s', portal)!,
    path, route, params: t, replay: played.has(key), log, onSkip,
  };
  played.add(key);
  await scenes[t.scene](c);
}

function packet(id: string): Promise<void> {
  const map = $('#map'), eg = $<SVGGElement>('#edge-g');
  if (!map || !eg) return Promise.resolve();
  const chain: string[] = [];
  let n = $(`.node[data-id="${id}"]`, map);
  while (n?.dataset.parent) { chain.unshift(n.dataset.id ?? ''); n = $(`.node[data-id="${n.dataset.parent}"]`, map); }
  const paths = chain.map((c) => $<SVGPathElement>(`path[data-to="${c}"]`, eg)).filter((p): p is SVGPathElement => !!p);
  if (!paths.length) return Promise.resolve();
  const lens = paths.map((p) => p.getTotalLength());
  const total = lens.reduce((a, b) => a + b, 0);
  const dur = Math.min(720, 240 + total * 0.4);
  const dot = document.createElementNS(NS, 'rect');
  dot.setAttribute('class', 'packet'); dot.setAttribute('width', '9'); dot.setAttribute('height', '9');
  eg.appendChild(dot);
  paths.forEach((p) => p.classList.add('hot'));
  log('send', chain.join(' → '));
  return new Promise((res) => {
    const s = performance.now();
    const f = (now: number) => {
      const k = clamp((now - s) / dur);
      let d = ease(k) * total, i = 0;
      while (i < paths.length - 1 && d > lens[i]) { d -= lens[i]; i++; }
      const pt = paths[i].getPointAtLength(Math.min(d, lens[i]));
      dot.setAttribute('x', String(pt.x - 4.5)); dot.setAttribute('y', String(pt.y - 4.5));
      if (k < 1) requestAnimationFrame(f);
      else { dot.remove(); $(`.node[data-id="${id}"]`, map)?.classList.add('hit'); res(); }
    };
    requestAnimationFrame(f);
  });
}

function expand(r: DOMRect, route: RouteInfo, path: string): Promise<HTMLElement> {
  const fx = $('#fx')!;
  fx.textContent = '';
  const portal = document.createElement('div');
  portal.className = 'portal';
  portal.innerHTML = '<div class="ph"><span class="tag"></span><span class="nm"></span><pre class="script" aria-hidden="true"></pre></div>'
    + '<canvas></canvas><p class="stage" aria-live="polite"><span class="s"></span><span class="skip">click or Esc to skip</span></p>';
  $('.ph .tag', portal)!.textContent = route.tag;
  $('.ph .nm', portal)!.textContent = route.label;
  $('.stage .s', portal)!.textContent = `GET ${path}`;
  $('.ph', portal)!.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
    { duration: 260, delay: 160, easing: 'ease-out', fill: 'backwards' });
  fx.appendChild(portal);
  fx.hidden = false;
  const top = $('.bar')?.getBoundingClientRect().bottom ?? 0;
  const W = root.clientWidth, H = innerHeight;
  return portal.animate([
    { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` },
    { left: '0px', top: `${top}px`, width: `${W}px`, height: `${H - top}px` },
  ], { duration: 420, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }).finished.then(() => portal);
}

function closePortal() {
  const fx = $('#fx'), portal = fx ? $('.portal', fx) : null;
  if (!fx || !portal) return;
  portal.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-out', fill: 'forwards' }).finished
    .then(() => { fx.hidden = true; fx.textContent = ''; });
}

/** Click, Esc, Enter or Space ends the running scene early. */
function onSkip(cb: () => void) {
  const fx = $('#fx')!;
  const key = (e: KeyboardEvent) => { if (['Escape', 'Enter', ' '].includes(e.key)) cb(); };
  fx.addEventListener('click', cb);
  addEventListener('keydown', key);
  return () => { fx.removeEventListener('click', cb); removeEventListener('keydown', key); };
}

/* ---------- copy email, toast ---------- */
let toastTimer = 0;
function toast(msg: string) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { t.hidden = true; }, 2200);
}
function copyEmail(onOk: () => void, onFail: () => void) {
  try { navigator.clipboard.writeText(data().email).then(onOk, onFail); } catch { onFail(); }
}

/* ---------- command palette ---------- */
interface Action { id: string; label: string; hint: string; href?: string; run?: () => void }
function actions(): Action[] {
  const { routes, email } = data();
  const pages = Object.entries(routes).map(([path, r]) => ({ id: path, label: r.label, hint: path, href: path }));
  return [
    ...pages,
    { id: 'email', label: 'Copy email address', hint: email,
      run: () => copyEmail(() => toast(`Copied ${email}`), () => toast(`Couldn't copy. The address is ${email}`)) },
    { id: 'mode', label: 'Switch spec / runtime', hint: 'light / dark', run: toggleMode },
  ];
}
let palSel = 0, palItems: Action[] = [];
const palOpen = () => !$('#pal')?.hidden;
function openPal() {
  const pal = $('#pal'), q = $<HTMLInputElement>('#pal-q');
  if (busy || !pal || !q) return;
  pal.hidden = false; q.value = ''; palSel = 0; renderPal(); q.focus();
  log('open', 'command palette');
}
function closePal() { const pal = $('#pal'); if (pal) pal.hidden = true; }
function renderPal() {
  const list = $('#pal-list')!, q = $<HTMLInputElement>('#pal-q')!;
  const term = q.value.trim().toLowerCase();
  palItems = actions().filter((a) => !term || `${a.label} ${a.hint} ${a.id}`.toLowerCase().includes(term));
  palSel = Math.max(0, Math.min(palSel, palItems.length - 1));
  list.textContent = '';
  palItems.forEach((a, i) => {
    const li = document.createElement('li');
    li.id = `pal-${i}`; li.setAttribute('role', 'option'); li.setAttribute('aria-selected', String(i === palSel));
    li.innerHTML = '<span></span><small></small>';
    (li.children[0] as HTMLElement).textContent = a.label;
    (li.children[1] as HTMLElement).textContent = a.hint;
    li.addEventListener('click', () => { palSel = i; runPal(); });
    list.appendChild(li);
  });
  if (!palItems.length) list.innerHTML = '<li class="none">No match. Try work, about or email.</li>';
  q.setAttribute('aria-activedescendant', palItems.length ? `pal-${palSel}` : '');
  $(`#pal-${palSel}`)?.scrollIntoView({ block: 'nearest' });
}
function runPal() {
  const a = palItems[palSel];
  if (!a) return;
  const rect = $(`#pal-${palSel}`)?.getBoundingClientRect() ?? null;
  closePal();
  if (a.run) { a.run(); return; }
  if (!a.href || norm(location.pathname) === a.href) return;
  pendingRect = rect;
  navigate(`${data().base}${a.href}` || '/');
}

/* ---------- About: the card that opens over the photo ---------- */
function setWho(open: boolean) {
  const who = $('#who'), btn = $('#who-btn');
  if (!who || !btn) return;
  who.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', String(open));
  if (open) log('lookup', 'about card open');
}

/* ---------- one set of listeners for every page ---------- */
document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('#mode')) toggleMode();
  else if (t.closest('#open-pal')) openPal();
  else if (t.closest('#con-toggle')) {
    const open = $('#console')!.classList.toggle('open');
    $('#con-toggle')!.setAttribute('aria-expanded', String(open));
  } else if (t.closest('#who-btn')) setWho(!$('#who')?.classList.contains('open'));
  else if (t.closest('#copy')) {
    const btn = $('#copy')!;
    copyEmail(
      () => { btn.textContent = 'copied'; setTimeout(() => { btn.textContent = 'copy'; }, 1400); log('copy', data().email); },
      () => { const r = document.createRange(); r.selectNodeContents($('#email')!); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); },
    );
  } else if (t === $('#pal')) closePal();
});
document.addEventListener('input', (e) => { if ((e.target as Element).id === 'pal-q') { palSel = 0; renderPal(); } });
document.addEventListener('keydown', (e) => {
  const target = e.target as HTMLElement;
  if (target.id === 'pal-q') {
    if (e.key === 'ArrowDown') { e.preventDefault(); palSel = Math.min(palSel + 1, palItems.length - 1); renderPal(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); palSel = Math.max(palSel - 1, 0); renderPal(); }
    else if (e.key === 'Enter') { e.preventDefault(); runPal(); }
    else if (e.key === 'Escape') { e.preventDefault(); closePal(); }
    return;
  }
  if (e.key === 'Escape' && $('#who')?.classList.contains('open')) { setWho(false); $('#who-btn')?.focus(); return; }
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palOpen() ? closePal() : openPal(); }
  else if (e.key === '/' && !typing && !palOpen()) { e.preventDefault(); openPal(); }
});

/* ---------- page lifecycle ---------- */
document.addEventListener('astro:after-swap', syncMode); // the new page's <html> arrives without the chosen theme
document.addEventListener('astro:before-swap', () => { mapObserver?.disconnect(); mapObserver = null; });

let firstLoad = true;
document.addEventListener('astro:page-load', () => {
  syncMode();
  const path = norm(location.pathname);
  const conPath = $('#con-path');
  if (conPath) conPath.textContent = path;
  if (!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) { const k = $('#open-pal'); if (k) k.textContent = 'Ctrl K'; }
  if (matchMedia('(hover: none)').matches) { const h = $('#who-hint'); if (h) h.textContent = 'tap'; }

  const map = $('#map');
  if (map) {
    mapObserver = new ResizeObserver(() => layoutEdges());
    mapObserver.observe(map);
    document.fonts?.ready.then(layoutEdges);
    const back = lastFrom && $(`.node[data-path="${lastFrom}"]`, map);
    if (back) { back.classList.add('hit'); setTimeout(() => back.classList.remove('hit'), 900); }
  }

  if (firstLoad) {
    firstLoad = false;
    const b = document.body.dataset;
    log('build', `${b.buildCommit ?? '?'} · ${b.buildTime ?? '?'}`);
    const measure = () => setTimeout(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const kb = Math.round(res.reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0) / 1024);
      if (nav) log('load', `DOM ready in ${Math.round(nav.domContentLoadedEventEnd)} ms · ${res.length} files fetched${kb ? ` · ${kb} KB` : ''}`);
    }, 0);
    if (document.readyState === 'complete') measure(); else addEventListener('load', measure, { once: true });
  } else {
    log('200', `${path} in ${Math.round(performance.now() - navStart)} ms`);
  }
  closePortal();
});
