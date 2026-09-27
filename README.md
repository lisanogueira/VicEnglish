# Let's Talk with Vic

Landing page das aulas de conversação em inglês da Vic Medrado.
Site estático: HTML + CSS + JavaScript (módulos ES), sem build e sem dependências.

## Rodar localmente

```sh
python -m http.server 5180
# abra http://127.0.0.1:5180
```

(Os módulos JS precisam de um servidor; abrir o `index.html` direto do disco não funciona.)

## Estrutura

```
index.html              conteúdo e estrutura (SEO, JSON-LD, todas as seções)
assets/css/tokens.css   design tokens: cores, fontes, escala tipográfica, espaço, easing
assets/css/main.css     componentes e seções, movimento, reduced motion
assets/js/config.js     ← EDITE AQUI: WhatsApp, Instagram, e-mail, planos, depoimentos
assets/js/content.js    monta links de contato, planos e depoimentos a partir do config
assets/js/ui.js         navbar, menu mobile, FAQ, CTA flutuante, easter eggs
assets/js/motion.js     um loop rAF + IntersectionObserver: reveals, story, marquee, parallax, cursor
assets/fonts/           Archivo, Instrument Sans, Instrument Serif (self-hosted, subset latin)
assets/img/             fotos otimizadas (AVIF/WebP/JPEG) + og-image.jpg
assets/img/source/      foto original (não é servida)
scripts/optimize-images.py   regenera as imagens a partir da foto original
```

## Editar conteúdo

- **WhatsApp, Instagram, e-mail, planos e preços:** `assets/js/config.js`.
  Todos os botões de contato abrem o WhatsApp com mensagem pronta (os dos planos citam o plano).
- **Depoimentos:** adicione em `TESTIMONIALS` no `config.js`. Com a lista vazia, o site mostra espaços "em breve".
- **Trocar a foto:** substitua `assets/img/source/vic-original.png`, ajuste os recortes em
  `scripts/optimize-images.py` e rode `python scripts/optimize-images.py` (requer Pillow ≥ 11).

## Pendências (precisam da Vic)

- [ ] Domínio definitivo — hoje `https://lisanogueira.github.io/VicEnglish/` em `index.html`
      (canonical, og:url, og:image, JSON-LD), `robots.txt` e `sitemap.xml`.
- [ ] E-mail de contato (`SITE.EMAIL`).
- [ ] Depoimentos reais de alunos.
- [ ] Plataforma de videochamada usada nas aulas (FAQ "Como são feitas as aulas?").
- [ ] Revisar o texto da seção "Meet Vic" (escrito a partir do site anterior).
- [ ] Uma segunda foto, mais casual, para a seção "Meet Vic" (hoje é um recorte da foto do hero).
- [x] Preços: primeira aula R$50, 4 aulas R$180, 8 aulas R$340.
- [ ] Confirmar se os benefícios de cada plano (vindos do site anterior) continuam valendo, e se os pacotes têm validade.

## Acessibilidade e movimento

- Todo movimento respeita `prefers-reduced-motion`: sem parallax, sem cursor, sem marquee,
  e a seção "o problema" vira uma lista estática.
- Efeitos de mouse (cursor com rótulo, botões magnéticos, tilt, parallax) só em dispositivos com ponteiro fino.
- Sem JavaScript, todo o conteúdo continua visível (os estados iniciais das animações dependem da classe `.js`).
