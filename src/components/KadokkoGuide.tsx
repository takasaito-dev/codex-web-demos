'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  Cloud,
  CloudRain,
  CloudSun,
  Gift,
  Home,
  Languages,
  Map,
  MapPin,
  Menu,
  MessageCircleMore,
  Route,
  ShoppingBasket,
  Snowflake,
  Sun,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  Umbrella,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { dialects } from '@/data/dialects';
import { products } from '@/data/products';
import { routes } from '@/data/routes';
import { diagnoseSouvenirs, getProductsByIds } from '@/lib/diagnosis';
import {
  fetchKanagiWeather,
  getRouteWeatherReason,
  getWeatherAdvice,
  getWeatherEmoji,
  getWeatherLabel,
  rankRoutesByWeather,
  type WeatherSnapshot,
} from '@/lib/weather';
import type { BudgetRange, DiagnosisAnswers, Locale, Preference, Recipient, Scene } from '@/types/guide';

type CardId = 'diagnosis' | 'products' | 'routes' | 'dialect';

const cards: {
  id: CardId;
  icon: LucideIcon;
  title_ja: string;
  title_en: string;
  body_ja: string;
  body_en: string;
  bg: string;
  iconBg: string;
}[] = [
  {
    id: 'diagnosis',
    icon: Gift,
    title_ja: 'おみやげ診断',
    title_en: 'Souvenir finder',
    body_ja: '相手に合うおみやげを提案',
    body_en: 'Pick a fitting local gift.',
    bg: 'bg-[#c9654f]',
    iconBg: 'bg-[#fff6ea]',
  },
  {
    id: 'products',
    icon: ShoppingBasket,
    title_ja: '商品を知る',
    title_en: 'Product guide',
    body_ja: '商品の特徴を見やすく紹介',
    body_en: 'See clear product notes.',
    bg: 'bg-[#d99a35]',
    iconBg: 'bg-[#fff8e7]',
  },
  {
    id: 'routes',
    icon: Map,
    title_ja: '金木町を歩く',
    title_en: 'Walk Kanagi',
    body_ja: '時間に合わせて散策を案内',
    body_en: 'Find a short walk plan.',
    bg: 'bg-[#8aa875]',
    iconBg: 'bg-[#f7fbf2]',
  },
  {
    id: 'dialect',
    icon: MessageCircleMore,
    title_ja: '津軽弁くじ',
    title_en: 'Tsugaru phrase draw',
    body_ja: '津軽弁をひいて楽しもう',
    body_en: 'Draw a Tsugaru phrase.',
    bg: 'bg-[#85b8c8]',
    iconBg: 'bg-[#f2fbfd]',
  },
];

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
const streetImagePath = `${assetBasePath}/images/places/kanagi-street.jpg`;

type WeatherState =
  | { status: 'loading' }
  | { status: 'success'; weather: WeatherSnapshot }
  | { status: 'error' };

function ProductThumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e4d7bf] bg-[#fbf6e9]">
      <img src={`${assetBasePath}${src}`} alt={alt} className="aspect-[4/3] w-full object-cover" />
    </div>
  );
}

export function KadokkoGuide() {
  const [locale, setLocale] = useState<Locale>('ja');
  const [activeCard, setActiveCard] = useState<CardId>('diagnosis');
  const [weatherState, setWeatherState] = useState<WeatherState>({ status: 'loading' });
  const [answers, setAnswers] = useState<DiagnosisAnswers>({
    recipient: 'outside_prefecture',
    budget: 'around_1000',
    preference: 'kanagi',
    scene: 'gift',
  });
  const [dialectIndex, setDialectIndex] = useState(0);

  const diagnosisResults = useMemo(() => diagnoseSouvenirs(answers), [answers]);
  const activeDialect = dialects[dialectIndex % dialects.length];
  const weather = weatherState.status === 'success' ? weatherState.weather : undefined;
  const weatherRankedRoutes = useMemo(() => rankRoutesByWeather(routes, weather), [weather]);
  const primaryRoute = weatherRankedRoutes[0]?.route;
  const primaryRouteReason = primaryRoute ? getRouteWeatherReason(primaryRoute.id, weather, locale) : '';

  useEffect(() => {
    const controller = new AbortController();

    fetchKanagiWeather(controller.signal)
      .then((weather) => {
        setWeatherState({ status: 'success', weather });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setWeatherState({ status: 'error' });
        }
      });

    return () => controller.abort();
  }, []);

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
    <main className="kanagi-texture min-h-screen overflow-x-hidden pb-32 text-[#24190f]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-4 sm:px-4 lg:grid lg:grid-cols-[minmax(360px,430px)_1fr] lg:px-8">
        <section className="mx-auto w-full min-w-0 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[28px] border border-[#e5d8bf] bg-[#fffaf0] shadow-[0_24px_70px_rgb(92_66_40_/_18%)] sm:max-w-md">
          <header className="relative overflow-hidden bg-[#fffaf0]">
            <div className="flex items-center justify-between gap-2 px-4 py-4">
              <button
                type="button"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#dfd2ba] bg-white text-[#2f251a]"
                aria-label={copy(locale, 'メニュー', 'Menu')}
              >
                <Menu size={24} strokeWidth={2.4} />
              </button>
              <p className="min-w-0 flex-1 text-center text-lg font-black tracking-normal sm:text-2xl">
                KADOKKO AI Guide
              </p>
              <div className="flex shrink-0 rounded-full border border-[#dfd2ba] bg-white p-1 text-xs font-black">
                <button
                  type="button"
                  className={`rounded-full px-2 py-2 ${locale === 'ja' ? 'bg-[#2f251a] text-white' : 'text-[#7a6a56]'}`}
                  onClick={() => setLocale('ja')}
                  aria-pressed={locale === 'ja'}
                >
                  JP
                </button>
                <button
                  type="button"
                  className={`rounded-full px-2 py-2 ${locale === 'en' ? 'bg-[#2f251a] text-white' : 'text-[#7a6a56]'}`}
                  onClick={() => setLocale('en')}
                  aria-pressed={locale === 'en'}
                >
                  EN
                </button>
              </div>
            </div>
            <div className="relative h-64 overflow-hidden">
              <img
                src={streetImagePath}
                alt={copy(locale, '金木町の街並みイメージ', 'Kanagi town street image')}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#fffaf0]/85 via-[#fffaf0]/28 to-[#fffaf0]/82" />
              <div className="absolute inset-x-5 top-8 text-center">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b54b36]">KADOKKO AI案内所</p>
                <h1 className="mx-auto mt-3 max-w-[18rem] text-xl font-black leading-[1.6] tracking-normal text-[#24190f] sm:text-2xl">
                  {copy(
                    locale,
                    '金木町の「いいもの」や「たのしい」をAIがやさしくご案内します。',
                    'A gentle guide to Kanagi souvenirs, walks, and local phrases.',
                  )}
                </h1>
              </div>
            </div>
          </header>

          <section className="-mt-8 grid grid-cols-2 gap-3 px-3 sm:gap-4 sm:px-4">
            {cards.map((card) => (
              <FeatureCard
                key={card.id}
                card={card}
                locale={locale}
                active={activeCard === card.id}
                onClick={() => setActiveCard(card.id)}
              />
            ))}
          </section>

          <div className="grid gap-4 px-3 py-5 sm:px-4">
            <WeatherPanel
              locale={locale}
              weatherState={weatherState}
              onOpenRoutes={() => setActiveCard('routes')}
            />
            <RoutePreviewCard
              locale={locale}
              route={primaryRoute}
              weatherReason={primaryRouteReason}
              onOpenRoutes={() => setActiveCard('routes')}
            />
            <button
              type="button"
              onClick={() => setActiveCard('routes')}
              className="flex min-h-16 items-center justify-between rounded-2xl border border-[#e4d7bf] bg-white px-4 text-left shadow-sm"
            >
              <span className="flex items-center gap-3 text-base font-black text-[#2f251a]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff4e2] text-[#bd4a34]">
                  <MapPin size={23} />
                </span>
                {copy(locale, '現在地から近いスポットを探す', 'Find nearby spots')}
              </span>
              <ChevronRight size={24} />
            </button>
          </div>
        </section>

        <section className="mx-auto w-full min-w-0 max-w-[calc(100vw-1.5rem)] sm:max-w-md lg:max-w-none">
          {activeCard === 'diagnosis' && (
            <section className="rounded-[22px] border border-[#e4d7bf] bg-white/95 p-4 shadow-sm" id="diagnosis">
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

              <div className="mt-5 rounded-2xl bg-[#2f251a] p-4 text-white">
                <p className="text-sm font-black text-[#f2c36b]">{copy(locale, 'おすすめ候補', 'Recommended')}</p>
                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  {diagnosisResults.map((result, index) => (
                    <article key={result.product.id} className="rounded-xl bg-white/10 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xl font-black">
                          {index + 1}. {copy(locale, result.product.name_ja, result.product.name_en)}
                        </h3>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-[#2f251a]">
                          {result.score}
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
            <section className="rounded-[22px] border border-[#e4d7bf] bg-white/95 p-4 shadow-sm" id="products">
              <SectionTitle
                locale={locale}
                eyebrowJa="商品データ"
                eyebrowEn="Product data"
                titleJa="商品を知る"
                titleEn="Product guide"
              />
              <div className="grid gap-4 lg:grid-cols-2">
                {products.map((product) => {
                  const related = getProductsByIds(product.related_product_ids);
                  const sceneLabels = product.scenes
                    .map((scene) => scenes.find((item) => item.value === scene))
                    .filter((item): item is (typeof scenes)[number] => Boolean(item))
                    .map((item) => copy(locale, item.ja, item.en))
                    .join(' / ');

                  return (
                    <article key={product.id} className="rounded-2xl border border-[#e4d7bf] bg-[#fffaf0] p-3">
                      <ProductThumb src={product.image_url} alt={copy(locale, product.name_ja, product.name_en)} />
                      <div className="mt-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-normal text-[#bd4a34]">
                              {product.category}
                            </p>
                            <h3 className="text-2xl font-black text-[#24190f]">
                              {copy(locale, product.name_ja, product.name_en)}
                            </h3>
                          </div>
                          <span className="rounded-full bg-white px-3 py-2 text-xs font-black text-[#6d5b43]">
                            {copy(locale, product.priceLabel_ja, product.priceLabel_en)}
                          </span>
                        </div>
                        <p className="mt-3 text-base leading-7 text-[#594c3b]">
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
            <section className="rounded-[22px] border border-[#e4d7bf] bg-white/95 p-4 shadow-sm" id="routes">
              <SectionTitle
                locale={locale}
                eyebrowJa="固定ルート"
                eyebrowEn="Fixed routes"
                titleJa="KADOKKO起点の金木町散策"
                titleEn="Kanagi walks from KADOKKO"
              />
              <div className="grid gap-4 lg:grid-cols-2">
                {weatherRankedRoutes.map(({ route, isWeatherPick }) => {
                  const weatherReason = getRouteWeatherReason(route.id, weather, locale);

                  return (
                    <article
                      key={route.id}
                      className={`rounded-2xl border p-4 ${
                        isWeatherPick ? 'border-[#bd4a34] bg-[#fff4e2]' : 'border-[#e4d7bf] bg-[#fffaf0]'
                      }`}
                    >
                      <div className="overflow-hidden rounded-xl">
                        <img
                          src={streetImagePath}
                          alt={copy(locale, route.title_ja, route.title_en)}
                          className="aspect-[16/9] w-full object-cover"
                        />
                      </div>
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="flex flex-wrap items-center gap-2 text-sm font-black text-[#bd4a34]">
                            <span>
                              {route.duration_minutes}
                              {copy(locale, '分', ' min')}
                            </span>
                            {isWeatherPick && (
                              <span className="rounded-full bg-[#bd4a34] px-2 py-1 text-xs text-white">
                                {copy(locale, '今日の天気おすすめ', 'Weather pick')}
                              </span>
                            )}
                          </p>
                          <h3 className="text-2xl font-black leading-tight text-[#24190f]">
                            {copy(locale, route.title_ja, route.title_en)}
                          </h3>
                        </div>
                        <a
                          href={route.google_maps_url}
                          target="_blank"
                          rel="noreferrer"
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#2f251a] text-white"
                          aria-label={copy(locale, 'Googleマップで開く', 'Open in Google Maps')}
                        >
                          <MapPin size={21} />
                        </a>
                      </div>
                      <p className="mt-3 text-base leading-7 text-[#594c3b]">
                        {copy(locale, route.description_ja, route.description_en)}
                      </p>
                      <ol className="mt-4 grid gap-2">
                        {route.spots.map((spot, index) => (
                          <li key={`${route.id}-${index}-${spot.name_ja}`} className="flex gap-3 rounded-xl bg-white p-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#bd4a34] text-sm font-black text-white">
                              {index + 1}
                            </span>
                            <span className="font-black text-[#3a2b1c]">
                              {copy(locale, spot.name_ja, spot.name_en)}
                              {spot.walk_minutes !== null && (
                                <span className="ml-2 text-sm font-semibold text-[#7a6a56]">
                                  {spot.walk_minutes}
                                  {copy(locale, '分徒歩', ' min walk')}
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ol>
                      <p className="mt-3 rounded-xl bg-[#f7ead0] px-3 py-2 text-sm leading-6 text-[#5d331f]">
                        {copy(locale, route.note_ja, route.note_en)}
                      </p>
                      {weatherReason && (
                        <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-bold leading-6 text-[#3a2b1c]">
                          {weatherReason}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {activeCard === 'dialect' && (
            <section className="rounded-[22px] border border-[#e4d7bf] bg-white/95 p-4 shadow-sm" id="dialect">
              <SectionTitle
                locale={locale}
                eyebrowJa="固定データ"
                eyebrowEn="Curated data"
                titleJa="津軽弁くじ"
                titleEn="Tsugaru phrase draw"
              />
              <article className="rounded-2xl bg-[#2f251a] p-5 text-white">
                <p className="text-sm font-black text-[#f2c36b]">{copy(locale, '今日の一言', 'Phrase')}</p>
                <h3 className="mt-2 text-6xl font-black leading-none">{activeDialect.word}</h3>
                <p className="mt-4 text-xl font-black">
                  {copy(locale, activeDialect.standard_ja, activeDialect.meaning_en)}
                </p>
                <div className="mt-5 rounded-xl bg-white/10 p-4">
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
                  className="mt-5 w-full rounded-xl bg-[#f2c36b] px-4 py-4 text-lg font-black text-[#24190f]"
                >
                  {copy(locale, 'もう一回ひく', 'Draw again')}
                </button>
                <p className="mt-3 rounded-xl border border-white/15 px-3 py-2 text-sm leading-6 text-stone-200">
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
      </div>

      <MobileDock activeCard={activeCard} locale={locale} onPick={setActiveCard} />
    </main>
  );
}

function FeatureCard({
  card,
  locale,
  active,
  onClick,
}: {
  card: (typeof cards)[number];
  locale: Locale;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = card.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[158px] rounded-2xl p-3 text-left text-white shadow-[0_16px_28px_rgb(88_57_24_/_16%)] transition sm:min-h-[170px] sm:p-4 ${
        card.bg
      } ${active ? 'ring-4 ring-white' : 'hover:-translate-y-0.5'}`}
    >
      <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full sm:h-20 sm:w-20 ${card.iconBg} text-[#8d3d2b]`}>
        <Icon className="h-9 w-9 sm:h-[42px] sm:w-[42px]" strokeWidth={1.8} />
      </span>
      <span className="mt-3 block text-center text-[1.18rem] font-black leading-tight tracking-normal [word-break:keep-all] sm:mt-4 sm:text-2xl">
        {copy(locale, card.title_ja, card.title_en)}
      </span>
      <span className="mx-auto mt-2 block max-w-[9.5rem] text-center text-[0.78rem] font-bold leading-5 text-white/95 [word-break:keep-all] sm:max-w-none sm:text-sm sm:leading-6">
        {copy(locale, card.body_ja, card.body_en)}
      </span>
    </button>
  );
}

function WeatherPanel({
  locale,
  weatherState,
  onOpenRoutes,
}: {
  locale: Locale;
  weatherState: WeatherState;
  onOpenRoutes: () => void;
}) {
  if (weatherState.status === 'loading') {
    return (
      <section className="rounded-2xl border border-[#e4d7bf] bg-white/95 p-4 shadow-sm">
        <p className="text-center text-lg font-black text-[#24190f]">
          {copy(locale, '現在の金木町天気', 'Current Kanagi weather')}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#fff4d8] text-[#d9961f]">
            <CloudSun size={36} />
          </span>
          <div>
            <p className="text-xl font-black text-[#24190f]">
              {copy(locale, '天気を確認中です', 'Checking weather')}
            </p>
            <p className="mt-1 text-sm font-bold text-[#7a6a56]">Open-Meteo</p>
          </div>
        </div>
      </section>
    );
  }

  if (weatherState.status === 'error') {
    return (
      <section className="rounded-2xl border border-[#e4d7bf] bg-white/95 p-4 shadow-sm">
        <p className="text-center text-lg font-black text-[#24190f]">
          {copy(locale, '現在の金木町天気', 'Current Kanagi weather')}
        </p>
        <p className="mt-3 rounded-xl bg-[#fff4e2] px-3 py-3 text-center text-sm font-bold leading-6 text-[#5d331f]">
          {copy(
            locale,
            '天気情報を取得できませんでした。固定ルートはそのまま使えます。',
            'Weather could not be loaded. Fixed routes still work.',
          )}
        </p>
      </section>
    );
  }

  const { weather } = weatherState;
  const icon = getWeatherEmoji(weather);

  return (
    <section className="rounded-2xl border border-[#e4d7bf] bg-white/95 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-center text-lg font-black text-[#24190f]">
            {copy(locale, '現在の金木町天気', 'Current Kanagi weather')}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <WeatherIcon icon={icon} />
            <div className="text-center">
              <p className="text-5xl font-black leading-none text-[#2f251a]">
                {Math.round(weather.temperature)}
                <span className="text-2xl">°C</span>
              </p>
              <p className="mt-1 text-base font-black text-[#3a2b1c]">{getWeatherLabel(weather, locale)}</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenRoutes}
          className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#bd4a34] text-white"
          aria-label={copy(locale, '散策ルートを見る', 'Show routes')}
        >
          <Route size={21} />
        </button>
      </div>
      <dl className="mt-5 grid grid-cols-3 divide-x divide-[#eadfc9] border-t border-[#eadfc9] pt-4 text-center text-sm">
        <WeatherMetric
          icon={Thermometer}
          label={copy(locale, '体感', 'Feels')}
          value={`${Math.round(weather.apparentTemperature)}°C`}
        />
        <WeatherMetric
          icon={Umbrella}
          label={copy(locale, '降水', 'Rain')}
          value={`${weather.precipitation.toFixed(1)}mm`}
        />
        <WeatherMetric
          icon={Wind}
          label={copy(locale, '風', 'Wind')}
          value={`${Math.round(weather.windSpeed)}km/h`}
        />
      </dl>
      <p className="mt-4 rounded-xl bg-[#fff4e2] px-3 py-3 text-sm font-bold leading-6 text-[#5d331f]">
        {getWeatherAdvice(weather, locale)}
      </p>
    </section>
  );
}

function RoutePreviewCard({
  locale,
  route,
  weatherReason,
  onOpenRoutes,
}: {
  locale: Locale;
  route?: (typeof routes)[number];
  weatherReason: string;
  onOpenRoutes: () => void;
}) {
  if (!route) return null;

  return (
    <section className="rounded-2xl border border-[#e4d7bf] bg-white/95 p-4 shadow-sm">
      <p className="text-lg font-black text-[#24190f]">
        {copy(locale, 'おすすめの歩き方ルート', 'Recommended walking route')}
      </p>
      <div className="mt-4 grid grid-cols-[44%_1fr] overflow-hidden rounded-xl border border-[#eadfc9] bg-[#fffaf0]">
        <img
          src={streetImagePath}
          alt={copy(locale, route.title_ja, route.title_en)}
          className="h-full min-h-36 w-full object-cover"
        />
        <div className="flex flex-col justify-between p-4">
          <div>
            <h3 className="text-xl font-black leading-snug text-[#24190f]">
              {copy(locale, route.title_ja, route.title_en)}
            </h3>
            <p className="mt-2 text-sm font-bold text-[#594c3b]">
              {copy(locale, '所要時間', 'Duration')}: {route.duration_minutes}
              {copy(locale, '分', ' min')}
            </p>
            {weatherReason && <p className="mt-2 text-xs font-bold leading-5 text-[#8c5138]">{weatherReason}</p>}
          </div>
          <button
            type="button"
            onClick={onOpenRoutes}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#bd4a34] px-4 text-sm font-black text-white"
          >
            {copy(locale, 'ルートを見る', 'View route')}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function WeatherIcon({ icon }: { icon: ReturnType<typeof getWeatherEmoji> }) {
  const icons: Record<ReturnType<typeof getWeatherEmoji>, LucideIcon> = {
    sun: Sun,
    cloud: Cloud,
    rain: CloudRain,
    snow: Snowflake,
    hot: ThermometerSun,
    cold: ThermometerSnowflake,
    wind: Wind,
  };
  const Icon = icons[icon];

  return (
    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#fff4d8] text-[#d9961f]">
      <Icon size={48} strokeWidth={1.8} />
    </span>
  );
}

function WeatherMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="px-2">
      <dt className="flex items-center justify-center gap-1 text-xs font-bold text-[#7a6a56]">
        <Icon size={16} />
        {label}
      </dt>
      <dd className="mt-1 font-black text-[#24190f]">{value}</dd>
    </div>
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
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#bd4a34]">
        {copy(locale, eyebrowJa, eyebrowEn)}
      </p>
      <h2 className="mt-1 text-3xl font-black tracking-normal text-[#24190f]">
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
      <legend className="text-base font-black text-[#24190f]">{label}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPick(option.value)}
            className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-black leading-5 ${
              value === option.value
                ? 'border-[#bd4a34] bg-[#bd4a34] text-white'
                : 'border-[#e4d7bf] bg-[#fffaf0] text-[#594c3b]'
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
    <div className="grid grid-cols-[7rem_1fr] gap-3 rounded-xl bg-white px-3 py-2">
      <dt className="font-black text-[#7a6a56]">{label}</dt>
      <dd className="font-semibold text-[#3a2b1c]">{value || '-'}</dd>
    </div>
  );
}

function MobileDock({
  activeCard,
  locale,
  onPick,
}: {
  activeCard: CardId;
  locale: Locale;
  onPick: (card: CardId) => void;
}) {
  const items: { id: CardId; icon: LucideIcon; ja: string; en: string }[] = [
    { id: 'diagnosis', icon: Home, ja: '診断', en: 'Find' },
    { id: 'products', icon: ShoppingBasket, ja: '商品', en: 'Items' },
    { id: 'routes', icon: Map, ja: '散策', en: 'Walk' },
    { id: 'dialect', icon: Languages, ja: '津軽弁', en: 'Phrase' },
  ];

  return (
    <nav
      aria-label={copy(locale, '主要機能', 'Primary functions')}
      className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-[#e4d7bf] bg-[#fffaf0]/96 px-4 pb-4 pt-3 shadow-[0_-12px_30px_rgb(92_66_40_/_12%)] backdrop-blur"
    >
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeCard === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPick(item.id)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-black ${
                active ? 'text-[#bd4a34]' : 'text-[#5f5140]'
              }`}
            >
              <Icon size={24} strokeWidth={active ? 2.6 : 2} />
              <span>{copy(locale, item.ja, item.en)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
