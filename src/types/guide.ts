export type Locale = 'ja' | 'en';

export type Recipient = 'self' | 'family' | 'friend' | 'workplace' | 'outside_prefecture' | 'international';
export type BudgetRange = 'under_500' | 'around_1000' | 'around_2000' | 'gift';
export type Preference = 'sweet' | 'kanagi' | 'light' | 'shelf_stable' | 'coffee_pairing' | 'conversation';
export type Scene = 'eat_now' | 'take_home' | 'gift' | 'memory';

export type DiagnosisAnswers = {
  recipient?: Recipient;
  budget?: BudgetRange;
  preference?: Preference;
  scene?: Scene;
};

export type Product = {
  id: string;
  name_ja: string;
  name_en: string;
  category: string;
  price: number | null;
  priceLabel_ja: string;
  priceLabel_en: string;
  description_ja: string;
  description_en: string;
  recommended_for: Recipient[];
  budget_range: BudgetRange[];
  tags: Preference[];
  scenes: Scene[];
  shelf_life_ja: string;
  shelf_life_en: string;
  carry_note_ja: string;
  carry_note_en: string;
  image_url: string;
  online_shop_url: string | null;
  is_available: boolean;
  related_product_ids: string[];
};

export type RouteSpot = {
  name_ja: string;
  name_en: string;
  walk_minutes: number | null;
};

export type GuideRoute = {
  id: string;
  title_ja: string;
  title_en: string;
  duration_minutes: number;
  situation: string[];
  description_ja: string;
  description_en: string;
  spots: RouteSpot[];
  google_maps_url: string;
  note_ja: string;
  note_en: string;
  recommended_product_ids: string[];
};

export type Dialect = {
  id: string;
  word: string;
  standard_ja: string;
  meaning_en: string;
  example_tsugaru: string;
  example_ja: string;
  example_en: string;
  note_ja: string;
  note_en: string;
};

export type DiagnosisRule = {
  id: string;
  condition: Partial<DiagnosisAnswers>;
  recommended_product_ids: string[];
  reason_ja: string;
  reason_en: string;
};

export type DiagnosisResult = {
  product: Product;
  score: number;
  reason_ja: string;
  reason_en: string;
};

