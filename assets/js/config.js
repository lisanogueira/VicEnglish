/**
 * Configuração do site — edite aqui, não no HTML.
 *
 * Tudo que é dado comercial ou de contato da Vic mora neste arquivo.
 * Campos vazios ('') escondem o elemento correspondente no site.
 */

export const SITE = {
  // Número com DDI + DDD, só dígitos. Veio do site anterior.
  WHATSAPP_NUMBER: '5524988710810',
  WHATSAPP_MESSAGE: 'Oi Vic! Vi seu site e queria saber mais sobre as aulas de inglês :)',

  INSTAGRAM_URL: 'https://www.instagram.com/vicmedradoo/',

  // PENDENTE: e-mail de contato da Vic. Vazio = link escondido no rodapé.
  EMAIL: '',
};

/**
 * Planos. Preços informados pela Vic; benefícios vieram do site anterior.
 */
export const PLANS = [
  {
    id: 'first',
    name: 'Primeira aula',
    tagline: 'Pra conhecer a Vic e ver se o jeito da aula combina com você.',
    price: 50,
    period: 'a primeira aula',
    featured: false,
    details: ['1 aula de 60 min', 'Individual · online', 'Sem compromisso'],
    perks: ['Feedback de pronúncia', 'Material pós-aula'],
  },
  {
    id: 'weekly',
    name: '4 aulas',
    tagline: 'O ritmo que faz o inglês virar hábito.',
    price: 180,
    period: 'as 4 aulas',
    featured: true,
    details: ['4 aulas de 60 min', 'Individual · online'],
    perks: ['Suporte pelo WhatsApp', 'Plano de estudos personalizado', 'Material pós-aula'],
  },
  {
    id: 'twice',
    name: '8 aulas',
    tagline: 'Pra quem tem prazo: viagem, intercâmbio, vaga nova.',
    price: 340,
    period: 'as 8 aulas',
    featured: false,
    details: ['8 aulas de 60 min', 'Individual · online'],
    perks: ['Simulação de entrevistas', 'Conversas sobre cultura americana', 'Material pós-aula'],
  },
];

export const PAYMENT_NOTE = 'Pagamento via PIX ou transferência, antes do início das aulas.';

/**
 * Depoimentos. PENDENTE: nenhum depoimento real foi fornecido ainda.
 * Enquanto a lista estiver vazia, o site mostra espaços reservados
 * sinalizados como "em breve". Formato:
 *
 *   { quote: 'Texto do aluno', name: 'Nome S.', context: 'Aluna desde 2025' }
 */
export const TESTIMONIALS = [];
