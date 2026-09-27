/**
 * Conteúdo que vem de config.js: links de contato, planos, depoimentos, ano.
 */
import { SITE, PLANS, PAYMENT_NOTE, TESTIMONIALS } from './config.js';

const brl = new Intl.NumberFormat('pt-BR');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const ARROW = '<span class="btn__arrow" aria-hidden="true"><i>→</i><i>↗</i></span>';

/** Link do WhatsApp com mensagem pronta. Sem número configurado, cai no Instagram. */
function contactUrl(message = SITE.WHATSAPP_MESSAGE) {
  if (!SITE.WHATSAPP_NUMBER) return SITE.INSTAGRAM_URL;
  return `https://wa.me/${SITE.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function planMessage(plan) {
  return `Oi Vic! Vi seu site e queria saber mais sobre o plano "${plan.name}" :)`;
}

function planCard(plan, index) {
  const list = (items, cls, label) =>
    `<ul class="${cls}"${label ? ` aria-label="${label}"` : ''}>${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

  return `
    <article class="plan${plan.featured ? ' plan--featured' : ''}" aria-labelledby="plan-${plan.id}" data-reveal style="--i: ${index}">
      ${plan.featured ? '<p class="sticker plan__badge">recomendado ✦</p>' : ''}
      <h3 class="plan__name" id="plan-${plan.id}">${esc(plan.name)}</h3>
      <p class="plan__tagline">${esc(plan.tagline)}</p>
      <p class="plan__price">
        <span class="plan__currency">R$</span><span class="plan__amount">${brl.format(plan.price)}</span><span class="plan__period">${esc(plan.period)}</span>
      </p>
      <div class="plan__lists">
        ${list(plan.details, 'plan__details')}
        ${list(plan.perks, 'plan__perks', 'Inclui')}
      </div>
      <a class="btn btn--lg btn--block" href="#contato" data-cta data-plan="${plan.id}" data-cursor="LET'S TALK">
        <span class="btn__label">Quero começar</span>${ARROW}
      </a>
    </article>`;
}

function renderPlans() {
  const root = document.querySelector('[data-plans]');
  if (root) root.innerHTML = PLANS.map(planCard).join('');
  const note = document.querySelector('[data-payment-note]');
  if (note) note.textContent = PAYMENT_NOTE;
}

function renderTestimonials() {
  if (!TESTIMONIALS.length) return;
  const root = document.querySelector('[data-testimonials]');
  root.innerHTML = TESTIMONIALS.map((t) => `
    <figure class="voice">
      <blockquote><p>${esc(t.quote)}</p></blockquote>
      <figcaption>${esc(t.name)}${t.context ? `<span>${esc(t.context)}</span>` : ''}</figcaption>
    </figure>`).join('');
  document.querySelector('[data-testimonials-note]')?.remove();
}

function wireContactLinks() {
  const plans = new Map(PLANS.map((p) => [p.id, p]));
  document.querySelectorAll('[data-cta]').forEach((a) => {
    const plan = plans.get(a.dataset.plan);
    a.href = contactUrl(plan ? planMessage(plan) : undefined);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  document.querySelectorAll('[data-instagram]').forEach((a) => { a.href = SITE.INSTAGRAM_URL; });

  if (SITE.EMAIL) {
    const link = document.querySelector('[data-email]');
    link.href = `mailto:${SITE.EMAIL}`;
    link.textContent = SITE.EMAIL;
    document.querySelector('[data-email-item]').hidden = false;
  }
}

export function initContent() {
  renderPlans();
  renderTestimonials();
  wireContactLinks();
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}
