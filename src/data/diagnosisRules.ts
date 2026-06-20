import type { DiagnosisRule } from '@/types/guide';

export const diagnosisRules: DiagnosisRule[] = [
  {
    id: 'outside-kanagi-gift',
    condition: {
      recipient: 'outside_prefecture',
      preference: 'kanagi',
    },
    recommended_product_ids: ['kanro-ume', 'nitabo-soba'],
    reason_ja: '県外の方には、金木町らしさを説明しやすい組み合わせが向いています。',
    reason_en: 'For someone outside Aomori, items with a clear Kanagi story are easier to introduce.',
  },
  {
    id: 'international-story',
    condition: {
      recipient: 'international',
    },
    recommended_product_ids: ['kanro-ume', 'nitabo-soba', 'seasonal-gift'],
    reason_ja: '外国人観光客には、味だけでなく土地の説明がしやすい商品を優先します。',
    reason_en: 'For international visitors, items with cultural context are easier to understand and remember.',
  },
  {
    id: 'coffee-break',
    condition: {
      preference: 'coffee_pairing',
    },
    recommended_product_ids: ['hakkoda-coffee', 'madeleine', 'blueberry-muffin'],
    reason_ja: 'コーヒーに合うものを探している場合は、焼き菓子との組み合わせが選びやすいです。',
    reason_en: 'For a coffee pairing, baked sweets make a simple and familiar match.',
  },
  {
    id: 'eat-now',
    condition: {
      scene: 'eat_now',
    },
    recommended_product_ids: ['blueberry-muffin', 'madeleine', 'hakkoda-coffee'],
    reason_ja: 'その場で楽しむなら、すぐ食べやすい焼き菓子や飲み物を優先します。',
    reason_en: 'For eating right away, easy snacks and drinks are the most practical.',
  },
  {
    id: 'formal-gift',
    condition: {
      budget: 'gift',
      scene: 'gift',
    },
    recommended_product_ids: ['seasonal-gift', 'kanro-ume', 'nitabo-soba'],
    reason_ja: 'しっかり贈りたい場合は、複数商品を組み合わせる提案が向いています。',
    reason_en: 'For a more formal gift, a combined set feels more complete.',
  },
];

