/**
 * Interface: navbar, menu mobile, FAQ, CTA flutuante, toast e easter eggs.
 */
import { onScroll, prefersReduced } from './motion.js';

const $ = (sel) => document.querySelector(sel);

/* ---------- Navbar ganha fundo ao rolar ---------- */
function initNav() {
  const nav = $('[data-nav]');
  let scrolled = null;
  onScroll((y) => {
    const next = y > 24;
    if (next === scrolled) return;
    nav.classList.toggle('is-scrolled', next);
    scrolled = next;
  });
}

/* ---------- Menu mobile: foco preso, Esc fecha, resto da página inerte ---------- */
function initMenu() {
  const toggle = $('.nav__toggle');
  const menu = $('#menu');
  const root = document.documentElement;
  const outside = [$('main'), $('footer'), $('[data-float-cta]')];
  let closeTimer;

  const focusables = () => [...document.querySelectorAll('.nav a, .nav button, .menu a')]
    .filter((el) => el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden');

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const open = () => {
    clearTimeout(closeTimer);
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    root.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    outside.forEach((el) => { el.inert = true; });
    menu.querySelector('a').focus({ preventScroll: true });
  };

  const close = ({ restoreFocus = true } = {}) => {
    menu.classList.remove('is-open');
    root.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    outside.forEach((el) => { el.inert = false; });
    closeTimer = setTimeout(() => { menu.hidden = true; }, prefersReduced ? 0 : 420);
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => (isOpen() ? close() : open()));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) close({ restoreFocus: false }); });

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches && isOpen()) close({ restoreFocus: false });
  });
}

/* ---------- FAQ ---------- */
function initFaq() {
  $('[data-faq]').addEventListener('click', (e) => {
    const button = e.target.closest('.faq__q');
    if (!button) return;
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    button.closest('.faq__item').classList.toggle('is-open', !expanded);
  });
}

/* ---------- CTA flutuante (mobile): some no hero, nos planos, no CTA final e no rodapé ---------- */
function initFloatingCta() {
  const cta = $('[data-float-cta]');
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    cta.classList.toggle('is-visible', visible.size === 0);
  });
  [$('.hero'), $('#aulas'), $('[data-finale]'), $('footer')].forEach((el) => io.observe(el));
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(message) {
  const el = $('.toast');
  clearTimeout(toastTimer);
  el.textContent = message;
  requestAnimationFrame(() => el.classList.add('is-visible'));
  toastTimer = setTimeout(() => {
    el.classList.remove('is-visible');
    toastTimer = setTimeout(() => { el.textContent = ''; }, 450);
  }, 3200);
}

/* ---------- Easter eggs ---------- */
function initEggs() {
  // 1. Clicar num ✦
  document.querySelectorAll('[data-egg]').forEach((btn) => {
    btn.addEventListener('click', () => toast('your English is better than you think :)'));
  });

  // 2. Selecionar um trecho em inglês (quem ia traduzir descobre que já entende)
  let shown = false;
  const onSelect = () => {
    if (shown) return;
    const selection = getSelection();
    const text = selection.toString().trim();
    if (text.length < 3 || text.length > 80) return;
    const lang = selection.anchorNode?.parentElement?.closest('[lang]')?.getAttribute('lang');
    if (lang === 'en') {
      shown = true;
      toast("hey, that's already English.");
    }
  };
  document.addEventListener('mouseup', onSelect);
  document.addEventListener('keyup', (e) => { if (e.shiftKey) onSelect(); });

  // O TALK do rodapé acena quando aparece; no touch, segue balançando só enquanto visível
  const talk = $('[data-talk]');
  if (talk && !prefersReduced) {
    let waved = false;
    new IntersectionObserver(([e]) => {
      talk.classList.toggle('is-live', e.isIntersecting);
      if (!e.isIntersecting || waved) return;
      waved = true;
      talk.classList.add('is-waving');
      talk.lastElementChild.addEventListener('animationend', () => talk.classList.remove('is-waving'), { once: true });
    }, { threshold: 0.6 }).observe(talk);
  }

  console.log(
    "%cLet's talk. %cYou just read a whole website in English. See? You already speak it. ✦",
    'font: 800 16px sans-serif; color: #e0007a',
    'font: 14px sans-serif',
  );
}

export function initUI() {
  initNav();
  initMenu();
  initFaq();
  initFloatingCta();
  initEggs();
}
