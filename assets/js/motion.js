/**
 * Movimento: um único loop de requestAnimationFrame + IntersectionObserver.
 * Só transform/opacity/variáveis CSS. Medidas de layout são feitas em
 * onMeasure (load/resize), nunca a cada frame.
 */

export const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
const $ = (sel) => document.querySelector(sel);
const pageTop = (el) => el.getBoundingClientRect().top + window.scrollY;

/* ---------- Ticker ---------- */
const scrollFns = [];
const frameFns = [];
const measureFns = [];
let lastY = -1;
let lastT = performance.now();
let vh = innerHeight;

export const onScroll = (fn) => scrollFns.push(fn);
const onFrame = (fn) => frameFns.push(fn);
const onMeasure = (fn) => measureFns.push(fn);

function measureAll() {
  vh = innerHeight;
  measureFns.forEach((fn) => fn(vh));
  lastY = -1; // força um update de scroll no próximo frame
}

function tick(now) {
  const dt = Math.min(64, now - lastT);
  lastT = now;
  const y = window.scrollY;
  if (y !== lastY) {
    for (const fn of scrollFns) fn(y, vh);
    lastY = y;
  }
  for (const fn of frameFns) fn(dt);
  requestAnimationFrame(tick);
}

/* ---------- Reveal ao entrar na tela ---------- */
function initReveals() {
  const targets = document.querySelectorAll('[data-reveal], [data-finale]');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
  targets.forEach((t) => io.observe(t));
}

/* ---------- Barra de progresso ---------- */
function initProgress() {
  const bar = $('.progress span');
  let max = 1;
  onMeasure(() => { max = Math.max(1, document.documentElement.scrollHeight - innerHeight); });
  onScroll((y) => { bar.style.transform = `scaleX(${clamp(y / max).toFixed(4)})`; });
}

/* ---------- Hero: speak it → say it → own it → live it ---------- */
function initRotator() {
  const root = $('[data-rotator]');
  if (!root || prefersReduced) return;
  const items = [...root.children];
  let i = 0;
  let timer;

  const step = () => {
    const current = items[i];
    i = (i + 1) % items.length;
    current.classList.replace('is-active', 'is-leaving');
    items[i].classList.remove('is-leaving');
    items[i].classList.add('is-active');
    setTimeout(() => current.classList.remove('is-leaving'), 700);
  };

  const io = new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting) timer = setInterval(step, 2600);
  });
  setTimeout(() => io.observe(root), 1600); // começa depois da entrada do hero
}

/* ---------- O problema: passos avançam com o scroll nativo ---------- */
function initStory() {
  const track = $('[data-story]');
  if (!track || prefersReduced) return;
  const steps = [...track.querySelectorAll('.story__step')];
  const meter = track.querySelector('.story__meter');
  let top = 0;
  let distance = 1;
  let current = -1;

  onMeasure((h) => {
    top = pageTop(track);
    distance = Math.max(1, track.offsetHeight - h);
  });
  onScroll((y) => {
    const p = clamp((y - top) / distance);
    meter.style.setProperty('--p', p.toFixed(4));
    const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
    if (idx === current) return;
    steps.forEach((s, k) => {
      s.classList.toggle('is-active', k === idx);
      s.classList.toggle('is-past', k < idx);
    });
    current = idx;
  });
}

/* ---------- Transcrição: uma fala por vez conforme o scroll ---------- */
function initScript() {
  const el = $('[data-script]');
  if (!el || prefersReduced) return;
  const lines = [...el.querySelectorAll('.script__line')];
  let top = 0;
  onMeasure(() => { top = pageTop(el); });
  onScroll((y, h) => {
    const p = (y + h * 0.85 - top) / (h * 0.5);
    lines.forEach((line, i) => line.classList.toggle('is-on', p > i / lines.length));
  });
}

/* ---------- Before/After: risca o "before", marca o "after" ---------- */
function initBeforeAfter() {
  const el = $('[data-ba]');
  if (!el || prefersReduced) return;
  const pair = el.querySelector('.ba__pair');
  let top = 0;
  onMeasure(() => { top = pageTop(pair); });
  onScroll((y, h) => {
    el.style.setProperty('--ba', clamp((y + h * 0.8 - top) / (h * 0.4)).toFixed(3));
  });
}

/* ---------- Parallax sutil (desktop) ---------- */
function initParallax() {
  if (prefersReduced || !finePointer) return;
  const items = [...document.querySelectorAll('[data-parallax]')].map((el) => ({
    el, factor: parseFloat(el.dataset.parallax), center: 0,
  }));
  onMeasure(() => items.forEach((it) => {
    const r = it.el.parentElement.getBoundingClientRect();
    it.center = r.top + window.scrollY + r.height / 2;
  }));
  onScroll((y, h) => {
    const mid = y + h / 2;
    for (const it of items) {
      const d = it.center - mid;
      if (Math.abs(d) > h * 1.5) continue;
      it.el.style.translate = `0 ${clamp(d * it.factor, -90, 90).toFixed(1)}px`;
    }
  });
}

/* ---------- Marquee: lento, desacelera no hover, segue a direção do scroll ---------- */
function initMarquee() {
  const root = $('[data-marquee]');
  if (!root) return;
  const track = root.querySelector('.marquee__track');
  const set = track.querySelector('.marquee__set');
  let setWidth = 0;

  onMeasure(() => {
    track.querySelectorAll('.marquee__set + .marquee__set').forEach((n) => n.remove());
    setWidth = set.offsetWidth;
    const copies = Math.ceil((innerWidth * 1.5) / setWidth) + 1;
    for (let i = 0; i < copies; i++) track.append(set.cloneNode(true));
  });
  if (prefersReduced) return;

  const base = finePointer ? 55 : 30; // px/s
  let x = 0;
  let speed = 0;
  let dir = 1;
  let prevY = window.scrollY;
  let visible = false;
  let hovering = false;

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);
  root.addEventListener('pointerenter', () => { hovering = true; });
  root.addEventListener('pointerleave', () => { hovering = false; });
  onScroll((y) => {
    if (y !== prevY) dir = y > prevY ? 1 : -1;
    prevY = y;
  });
  onFrame((dt) => {
    if (!visible || !setWidth) return;
    speed = lerp(speed, (hovering ? base * 0.2 : base) * dir, 0.05);
    x -= (speed * dt) / 1000;
    if (x <= -setWidth) x += setWidth;
    if (x > 0) x -= setWidth;
    track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
  });
}

/* ---------- Pointer: cursor com rótulo, botões magnéticos, tilt, nuvem ---------- */
function initPointer() {
  if (!finePointer || prefersReduced) return;
  const pointer = { x: -100, y: -100, moved: false };
  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.moved = true;
  }, { passive: true });

  // Cursor: o nativo continua; só um rótulo discreto aparece sobre alvos.
  const cursor = $('.cursor');
  const label = cursor.firstElementChild;
  document.documentElement.classList.add('has-cursor');
  let cx = -100;
  let cy = -100;
  document.addEventListener('pointerover', (e) => {
    const target = e.target.closest('[data-cursor]');
    if (target) label.textContent = target.dataset.cursor;
    cursor.classList.toggle('is-active', Boolean(target));
  });
  document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));

  // Magnético: acompanha o cursor quando ele chega perto (até 60px da borda).
  const magnets = [...document.querySelectorAll('[data-magnetic]')].map((el) => ({
    el, label: el.querySelector('.btn__label'), on: false,
  }));

  onFrame(() => {
    if (Math.abs(cx - pointer.x) > 0.1 || Math.abs(cy - pointer.y) > 0.1) {
      cx = lerp(cx, pointer.x, 0.25);
      cy = lerp(cy, pointer.y, 0.25);
      cursor.style.translate = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
    }
    if (!pointer.moved) return;
    pointer.moved = false;

    const rects = magnets.map((m) => m.el.getBoundingClientRect()); // leitura em lote
    magnets.forEach((m, i) => {
      const r = rects[i];
      const near = pointer.x > r.left - 60 && pointer.x < r.right + 60
        && pointer.y > r.top - 60 && pointer.y < r.bottom + 60;
      if (near) {
        const dx = pointer.x - (r.left + r.width / 2);
        const dy = pointer.y - (r.top + r.height / 2);
        m.el.style.setProperty('--mx', `${clamp(dx * 0.22, -14, 14).toFixed(1)}px`);
        m.el.style.setProperty('--my', `${clamp(dy * 0.3, -10, 10).toFixed(1)}px`);
        m.label.style.setProperty('--lx', `${clamp(dx * 0.08, -6, 6).toFixed(1)}px`);
        m.label.style.setProperty('--ly', `${clamp(dy * 0.1, -4, 4).toFixed(1)}px`);
        m.on = true;
      } else if (m.on) {
        ['--mx', '--my'].forEach((p) => m.el.style.removeProperty(p));
        ['--lx', '--ly'].forEach((p) => m.label.style.removeProperty(p));
        m.on = false;
      }
    });
  });

  // Tilt da foto do hero
  const hero = $('.hero');
  const photo = $('.hero__photo');
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    photo.style.setProperty('--ry', `${(px * 7).toFixed(2)}deg`);
    photo.style.setProperty('--rx', `${(-py * 5).toFixed(2)}deg`);
  });
  hero.addEventListener('pointerleave', () => {
    photo.style.removeProperty('--rx');
    photo.style.removeProperty('--ry');
  });

  // Nuvem de assuntos: palavras se afastam do cursor em profundidades diferentes
  const cloud = $('[data-cloud]');
  cloud.addEventListener('pointermove', (e) => {
    const r = cloud.getBoundingClientRect();
    cloud.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * -28).toFixed(1));
    cloud.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * -18).toFixed(1));
  });
  cloud.addEventListener('pointerleave', () => {
    cloud.style.removeProperty('--px');
    cloud.style.removeProperty('--py');
  });
}

export function initMotion() {
  initReveals();
  initProgress();
  initRotator();
  initStory();
  initScript();
  initBeforeAfter();
  initParallax();
  initMarquee();
  initPointer();

  // Primeira medição depois do primeiro paint, para não alongar o carregamento
  requestAnimationFrame(() => setTimeout(measureAll, 0));
  document.fonts?.ready.then(measureAll);
  addEventListener('load', measureAll);
  let resizeTimer;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measureAll, 120);
  }).observe(document.body);

  requestAnimationFrame(tick);
}
