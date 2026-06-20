'use client';

import { useMemo, useState } from 'react';
import { dialects } from '@/data/dialects';
import { products } from '@/data/products';
import { routes } from '@/data/routes';
import { diagnoseSouvenirs, getProductsByIds } from '@/lib/diagnosis';
import type { BudgetRange, DiagnosisAnswers, Locale, Preference, Recipient, Scene } from '@/types/guide';

const cards = [
  {
    id: 'diagnosis',
    title_ja: 'おみやげ診断',
    title_en: 'Souvenir finder',
    body_ja: '数問で、渡す相手に合う商品候補を提案します。',
    body_en: 'Answer a few questions and get a stable recommendation.',
  },
  {
    id: 'products',
    title_ja: '商品を知る',
    title_en: 'Product guide',
    body_ja: '日本語・英語で、商品の特徴と持ち帰り注意を確認できます。',
    body_en: 'Read short Japanese and English explanations for each item.',
  },
  {
    id: 'routes',
    title_ja: '金木町を歩く',
    title_en: 'Walk Kanagi',
    body_ja: 'KADOKKO起点で、時間別の固定散策ルートを見られます。',
    body_en: 'Choose a fixed walking idea from KADOKKO by available time.',
  },
  {
    id: 'dialect',
    title_ja: '津軽弁くじ',
    title_en: 'Tsugaru phrase draw',
    body_ja: '短い津軽弁を、意味・例文・英語付きで楽しめます。',
    body_en: 'Draw a short Tsugaru phrase with meaning and examples.',
  },
] as const;

const recipients: { value: Recipient; ja: string; en: string }[] = [
  { value: 'self', ja: '自分用', en: 'Myself' },
  { value: 'family', ja: '家族', en: 'Family' },
  { value: 'friend', ja: '友人', en: 'Friend' },
  { value: 'workplace', ja: '職場', en: 'Workplace' },
  { value: 'outside_prefecture', ja: '県外の人', en: 'Outside Aomori' },
  { value: 'international', ja: '外国人観光客', en: 'International visitor' },
];

const budgets: { value: BudgetRange; ja: string; en: string }[] = [
  { value: 'under_500', ja: '500円以内', en: 'Under ¥500' },
  { value: 'around_1000', ja: '1,000円前後', en: 'Around ¥1,000' },
  { value: 'around_2000', ja: '2,000円前後', en: 'Around ¥2,000' },
  { value: 'gift', ja: 'しっかり贈りたい', en: 'A proper gift' },
];

const preferences: { value: Preference; ja: string; en: string }[] = [
  { value: 'sweet', ja: '甘いもの', en: 'Sweet' },
  { value: 'kanagi', ja: '金木町らしいもの', en: 'Kanagi story' },
  { value: 'light', ja: '軽く持ち帰れるもの', en: 'Easy to carry' },
  { value: 'shelf_stable', ja: '日持ちするもの', en: 'Keeps well' },
  { value: 'coffee_pairing', ja: 'コーヒーに合うもの', en: 'Coffee pairing' },
  { value: 'conversation', ja: '話題になるもの', en: 'Conversation starter' },
];

const scenes: { value: Scene; ja: string; en: string }[] = [
  { value: 'eat_now', ja: 'その場で食べたい', en: 'Eat now' },
  { value: 'take_home', ja: '家に持ち帰りたい', en: 'Take home' },
  { value: 'gift', ja: '贈り物にしたい', en: 'Gift' },
  { value: 'memory', ja: '旅の記念にしたい', en: 'Travel memory' },
];

function copy(locale: Locale, ja: string, en: string) {
  return locale === 'ja' ? ja : en;
}

const assetBasePath = process.env.NODE_ENV === 'production' ? '/codex-web-demos' : '';

function ProductThumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
      <img src={`${assetBasePath}${src}`} alt={alt} className="aspect-[4/3] w-full object-cover" />
    </div>
  );
}

export function KadokkoGuide() {
  const [locale, setLocale] = useState<Locale>('ja');
  const [activeCard, setActiveCard] = useState<(typeof cards)[number]['id']>('diagnosis');
  const [answers, setAnswers] = useState<DiagnosisAnswers>({
    recipient: 'outside_prefecture',
    budget: 'around_1000',
    preference: 'kanagi',
    scene: 'gift',
  });
  const [dialectIndex, setDialectIndex] = useState(0);

  const diagnosisResults = useMemo(() => diagnoseSouvenirs(answers), [answers]);
  const activeDialect = dialects[dialectIndex % dialects.length];

  function updateAnswer<T extends keyof DiagnosisAnswers>(key: T, value: DiagnosisAnswers[T]) {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function drawDialect() {
    setDialectIndex((current) => (current + 1) % dialects.length);
  }

  return (
    <main className="kanagi-texture min-h-screen pb-16">
      <section className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-6 pt-4 sm:max-w-3xl">
        <header className="rounded-b-[32px] border border-stone-200 bg-[#fffaf1]/95 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-normal text-[#a73c2c]">KADOKKO AI Guide</p>
              <h1 className="mt-2 text-4xl font-black leading-none tracking-normal text-stone-950">
                {copy(locale, 'KADOKKO AI案内所', 'KADOKKO AI Guide')}
              </h1>
            </div>
            <div className="flex rounded-full border border-stone-300 bg-white p-1 text-sm font-bold">
              <button
                type="button"
                className={`rounded-full px-3 py-2 ${locale === 'ja' ? 'bg-stone-900 text-white' : 'text-stone-600'}`}
                onClick={() => setLocale('ja')}
                aria-pressed={locale === 'ja'}
              >
                JP
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-2 ${locale === 'en' ? 'bg-stone-900 text-white' : 'text-stone-600'}`}
                onClick={() => setLocale('en')}
                aria-pressed={locale === 'en'}
              >
                EN
              </button>
            </div>
          </div>
          <p className="mt-4 text-lg font-semibold leading-7 text-stone-700">
            {copy(
              locale,
              'おみやげ選び、金木町散策、津軽弁体験をサポートします。',
              'Souvenir ideas, Kanagi walks, and Tsugaru dialect experiences from your phone.',
            )}
          </p>
          <p className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-sm leading-6 text-amber-950">
            {copy(
              locale,
              'デモ版です。価格・在庫・徒歩時間は店頭または公式情報で確認してください。',
              'Demo version. Confirm prices, stock, and walking times in store or from official sources.',
            )}
          </p>
        </header>

        <nav className="grid grid-cols-2 gap-3" aria-label="Main functions">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveCard(card.id)}
              className={`min-h-36 rounded-lg border p-4 text-left shadow-sm transition ${
                activeCard === card.id
                  ? 'border-[#a73c2c] bg-[#fff4e6]'
                  : 'border-stone-200 bg-white/95 hover:border-stone-400'
              }`}
            >
              <span className="block text-lg font-black text-stone-950">
                {copy(locale, card.title_ja, card.title_en)}
              </span>
              <span className="mt-2 block text-sm leading-6 text-stone-600">
                {copy(locale, card.body_ja, card.body_en)}
              </span>
            </button>
          ))}
        </nav>

        {activeCard === 'diagnosis' && (
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm" id="diagnosis">
            <SectionTitle
              locale={locale}
              eyebrowJa="固定ロジック"
              eyebrowEn="Rule based"
              titleJa="あなたに合う金木みやげ"
              titleEn="Find a Kanagi souvenir"
            />
            <QuestionGroup
              label={copy(locale, '誰へのおみやげですか？', 'Who is it for?')}
              options={recipients}
              locale={locale}
              value={answers.recipient}
              onPick={(value) => updateAnswer('recipient', value)}
            />
            <QuestionGroup
              label={copy(locale, '予算は？', 'Budget?')}
              options={budgets}
              locale={locale}
              value={answers.budget}
              onPick={(value) => updateAnswer('budget', value)}
            />
            <QuestionGroup
              label={copy(locale, 'どんなものがいいですか？', 'What kind of item?')}
              options={preferences}
              locale={locale}
              value={answers.preference}
              onPick={(value) => updateAnswer('preference', value)}
            />
            <QuestionGroup
              label={copy(locale, '利用シーンは？', 'Use scene?')}
              options={scenes}
              locale={locale}
              value={answers.scene}
              onPick={(value) => updateAnswer('scene', value)}
            />

            <div className="mt-5 rounded-lg bg-stone-950 p-4 text-white">
              <p className="text-sm font-bold text-amber-200">{copy(locale, 'おすすめ候補', 'Recommended')}</p>
              <div className="mt-3 grid gap-3">
                {diagnosisResults.map((result, index) => (
                  <article key={result.product.id} className="rounded-lg bg-white/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-black">
                        {index + 1}. {copy(locale, result.product.name_ja, result.product.name_en)}
                      </h3>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-stone-950">
                        score {result.score}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-100">
                      {copy(locale, result.reason_ja, result.reason_en)}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeCard === 'products' && (
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm" id="products">
            <SectionTitle
              locale={locale}
              eyebrowJa="商品データ"
              eyebrowEn="Product data"
              titleJa="商品を知る"
              titleEn="Product guide"
            />
            <div className="grid gap-4">
              {products.map((product) => {
                const related = getProductsByIds(product.related_product_ids);
                const sceneLabels = product.scenes
                  .map((scene) => scenes.find((item) => item.value === scene))
                  .filter((item): item is (typeof scenes)[number] => Boolean(item))
                  .map((item) => copy(locale, item.ja, item.en))
                  .join(' / ');

                return (
                  <article key={product.id} className="rounded-lg border border-stone-200 bg-[#fffaf1] p-3">
                    <ProductThumb src={product.image_url} alt={copy(locale, product.name_ja, product.name_en)} />
                    <div className="mt-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-normal text-[#a73c2c]">
                            {product.category}
                          </p>
                          <h3 className="text-2xl font-black text-stone-950">
                            {copy(locale, product.name_ja, product.name_en)}
                          </h3>
                        </div>
                        <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-stone-700">
                          {copy(locale, product.priceLabel_ja, product.priceLabel_en)}
                        </span>
                      </div>
                      <p className="mt-3 text-base leading-7 text-stone-700">
                        {copy(locale, product.description_ja, product.description_en)}
                      </p>
                      <dl className="mt-4 grid gap-2 text-sm leading-6">
                        <InfoRow label={copy(locale, 'おすすめシーン', 'Best scene')} value={sceneLabels} />
                        <InfoRow
                          label={copy(locale, '日持ち', 'Shelf life')}
                          value={copy(locale, product.shelf_life_ja, product.shelf_life_en)}
                        />
                        <InfoRow
                          label={copy(locale, '持ち帰り注意', 'Carry note')}
                          value={copy(locale, product.carry_note_ja, product.carry_note_en)}
                        />
                        <InfoRow
                          label={copy(locale, '関連商品', 'Related')}
                          value={related.map((item) => copy(locale, item.name_ja, item.name_en)).join(' / ')}
                        />
                      </dl>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeCard === 'routes' && (
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm" id="routes">
            <SectionTitle
              locale={locale}
              eyebrowJa="固定ルート"
              eyebrowEn="Fixed routes"
              titleJa="KADOKKO起点の金木町散策"
              titleEn="Kanagi walks from KADOKKO"
            />
            <div className="grid gap-4">
              {routes.map((route) => (
                <article key={route.id} className="rounded-lg border border-stone-200 bg-[#fffaf1] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#a73c2c]">
                        {route.duration_minutes}
                        {copy(locale, '分', ' min')}
                      </p>
                      <h3 className="text-2xl font-black leading-tight text-stone-950">
                        {copy(locale, route.title_ja, route.title_en)}
                      </h3>
                    </div>
                    <a
                      href={route.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-stone-950 px-3 py-2 text-sm font-bold text-white"
                    >
                      Map
                    </a>
                  </div>
                  <p className="mt-3 text-base leading-7 text-stone-700">
                    {copy(locale, route.description_ja, route.description_en)}
                  </p>
                  <ol className="mt-4 grid gap-2">
                    {route.spots.map((spot, index) => (
                      <li key={`${route.id}-${spot.name_ja}`} className="flex gap-3 rounded-lg bg-white p-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#a73c2c] text-sm font-black text-white">
                          {index + 1}
                        </span>
                        <span className="font-bold text-stone-800">
                          {copy(locale, spot.name_ja, spot.name_en)}
                          {spot.walk_minutes !== null && (
                            <span className="ml-2 text-sm font-semibold text-stone-500">
                              {spot.walk_minutes}
                              {copy(locale, '分徒歩', ' min walk')}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-sm leading-6 text-amber-950">
                    {copy(locale, route.note_ja, route.note_en)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeCard === 'dialect' && (
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm" id="dialect">
            <SectionTitle
              locale={locale}
              eyebrowJa="固定データ"
              eyebrowEn="Curated data"
              titleJa="津軽弁くじ"
              titleEn="Tsugaru phrase draw"
            />
            <article className="rounded-lg bg-stone-950 p-5 text-white">
              <p className="text-sm font-bold text-amber-200">{copy(locale, '今日の一言', 'Phrase')}</p>
              <h3 className="mt-2 text-6xl font-black leading-none">{activeDialect.word}</h3>
              <p className="mt-4 text-xl font-bold">
                {copy(locale, activeDialect.standard_ja, activeDialect.meaning_en)}
              </p>
              <div className="mt-5 rounded-lg bg-white/10 p-4">
                <p className="text-sm text-stone-300">{copy(locale, '使用例', 'Example')}</p>
                <p className="mt-1 text-2xl font-black">{activeDialect.example_tsugaru}</p>
                <p className="mt-2 text-sm leading-6 text-stone-100">
                  {copy(locale, activeDialect.example_ja, activeDialect.example_en)}
                </p>
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-100">
                {copy(locale, activeDialect.note_ja, activeDialect.note_en)}
              </p>
              <button
                type="button"
                onClick={drawDialect}
                className="mt-5 w-full rounded-lg bg-[#f7c76f] px-4 py-4 text-lg font-black text-stone-950"
              >
                {copy(locale, 'もう一回ひく', 'Draw again')}
              </button>
              <p className="mt-3 rounded-lg border border-white/15 px-3 py-2 text-sm leading-6 text-stone-200">
                {copy(
                  locale,
                  `SNS用: 金木町で覚えた津軽弁「${activeDialect.word}」 = ${activeDialect.standard_ja}`,
                  `Share text: Tsugaru phrase from Kanagi: "${activeDialect.word}" = ${activeDialect.meaning_en}`,
                )}
              </p>
            </article>
          </section>
        )}
      </section>
    </main>
  );
}

function SectionTitle({
  locale,
  eyebrowJa,
  eyebrowEn,
  titleJa,
  titleEn,
}: {
  locale: Locale;
  eyebrowJa: string;
  eyebrowEn: string;
  titleJa: string;
  titleEn: string;
}) {
  return (
    <div className="mb-4">
      <p className="text-xs font-black uppercase tracking-normal text-[#a73c2c]">
        {copy(locale, eyebrowJa, eyebrowEn)}
      </p>
      <h2 className="mt-1 text-3xl font-black tracking-normal text-stone-950">
        {copy(locale, titleJa, titleEn)}
      </h2>
    </div>
  );
}

function QuestionGroup<T extends string>({
  label,
  options,
  locale,
  value,
  onPick,
}: {
  label: string;
  options: { value: T; ja: string; en: string }[];
  locale: Locale;
  value?: T;
  onPick: (value: T) => void;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="text-base font-black text-stone-950">{label}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPick(option.value)}
            className={`min-h-12 rounded-lg border px-3 py-2 text-left text-sm font-bold leading-5 ${
              value === option.value
                ? 'border-[#a73c2c] bg-[#a73c2c] text-white'
                : 'border-stone-200 bg-stone-50 text-stone-700'
            }`}
          >
            {copy(locale, option.ja, option.en)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 rounded-lg bg-white px-3 py-2">
      <dt className="font-bold text-stone-500">{label}</dt>
      <dd className="font-semibold text-stone-800">{value || '-'}</dd>
    </div>
  );
}
