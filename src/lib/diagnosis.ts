import { diagnosisRules } from '@/data/diagnosisRules';
import { products } from '@/data/products';
import type { DiagnosisAnswers, DiagnosisResult, Product } from '@/types/guide';

const defaultReasonJa = '回答内容に合いやすい商品を、タグ・予算・利用シーンから選びました。';
const defaultReasonEn = 'Selected by matching your answers with item tags, budget range, and use scene.';

function matchesRule(ruleCondition: Partial<DiagnosisAnswers>, answers: DiagnosisAnswers) {
  return Object.entries(ruleCondition).every(([key, value]) => {
    return answers[key as keyof DiagnosisAnswers] === value;
  });
}

function scoreProduct(product: Product, answers: DiagnosisAnswers) {
  let score = 0;

  if (!product.is_available) {
    return -999;
  }

  if (answers.recipient && product.recommended_for.includes(answers.recipient)) score += 3;
  if (answers.budget && product.budget_range.includes(answers.budget)) score += 3;
  if (answers.preference && product.tags.includes(answers.preference)) score += 4;
  if (answers.scene && product.scenes.includes(answers.scene)) score += 3;

  for (const rule of diagnosisRules) {
    if (matchesRule(rule.condition, answers) && rule.recommended_product_ids.includes(product.id)) {
      score += 5;
    }
  }

  return score;
}

function findBestRuleReason(productId: string, answers: DiagnosisAnswers) {
  const rule = diagnosisRules.find(
    (candidate) =>
      matchesRule(candidate.condition, answers) && candidate.recommended_product_ids.includes(productId),
  );

  return {
    reason_ja: rule?.reason_ja ?? defaultReasonJa,
    reason_en: rule?.reason_en ?? defaultReasonEn,
  };
}

export function diagnoseSouvenirs(answers: DiagnosisAnswers): DiagnosisResult[] {
  return products
    .map((product) => {
      const reasons = findBestRuleReason(product.id, answers);
      return {
        product,
        score: scoreProduct(product, answers),
        ...reasons,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export function getProductsByIds(ids: string[]) {
  return ids
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
}

