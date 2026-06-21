'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Church,
  Clock,
  Cloud,
  CloudRain,
  CloudSun,
  Coffee,
  Compass,
  Copy,
  ExternalLink,
  Footprints,
  Gift,
  Home,
  Languages,
  Landmark,
  Map,
  MapPinned,
  MapPin,
  Menu,
  MessageCircleMore,
  Music,
  NotebookText,
  PackageCheck,
  RefreshCw,
  Route,
  Send,
  ShoppingBasket,
  Snowflake,
  Sparkles,
  Store,
  Sun,
  Target,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  TrainFront,
  Trees,
  Umbrella,
  UserRound,
  Users,
  Wallet,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { dialects } from '@/data/dialects';
import { productNarratives, routeNarratives } from '@/data/guideNarratives';
import { getNearbySpotById, nearbySpots, type NearbySpot } from '@/data/nearbySpots';
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
import type {
  BudgetRange,
  DiagnosisAnswers,
  DiagnosisResult,
  Locale,
  Preference,
  Product,
  Recipient,
  Scene,
} from '@/types/guide';

type CardId = 'diagnosis' | 'products' | 'routes' | 'booking' | 'dialect';
type ProductFilter = 'all' | Scene | 'coffee_pairing';
type RoutePace = 'all' | 'quick' | 'standard' | 'deep';
type BookingFormState = {
  courseId: string;
  date: string;
  time: string;
  guests: string;
  name: string;
  contact: string;
  note: string;
};

const productFilters: {
  value: ProductFilter;
  icon: LucideIcon;
  ja: string;
  en: string;
}[] = [
  { value: 'all', icon: Store, ja: 'すべて', en: 'All' },
  { value: 'eat_now', icon: Coffee, ja: '今食べる', en: 'Eat now' },
  { value: 'take_home', icon: PackageCheck, ja: '持ち帰り', en: 'Take home' },
  { value: 'gift', icon: Gift, ja: '贈り物', en: 'Gift' },
  { value: 'memory', icon: BadgeCheck, ja: '記念', en: 'Memory' },
  { value: 'coffee_pairing', icon: Coffee, ja: '珈琲に合う', en: 'With coffee' },
];

const routePaces: {
  value: RoutePace;
  icon: LucideIcon;
  ja: string;
  en: string;
}[] = [
  { value: 'all', icon: Compass, ja: '全ルート', en: 'All' },
  { value: 'quick', icon: Clock, ja: '30分以内', en: '30 min' },
  { value: 'standard', icon: Footprints, ja: '1時間前後', en: 'Around 1 hr' },
  { value: 'deep', icon: MapPinned, ja: 'ゆっくり', en: 'Leisurely' },
];

const nearbyTagLabels: Record<NearbySpot['tags'][number], { ja: string; en: string }> = {
  short: { ja: '短時間', en: 'Short' },
  indoor: { ja: '屋内', en: 'Indoor' },
  rain: { ja: '雨の日', en: 'Rain' },
  family: { ja: '家族向け', en: 'Family' },
  photo: { ja: '写真', en: 'Photo' },
  literature: { ja: '太宰', en: 'Dazai' },
  food: { ja: '食事', en: 'Food' },
  seasonal: { ja: '季節', en: 'Seasonal' },
};

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
    id: 'booking',
    icon: CalendarCheck,
    title_ja: '予約相談',
    title_en: 'Booking',
    body_ja: '来店や案内の希望を送る',
    body_en: 'Send a visit request.',
    bg: 'bg-[#9f6f58]',
    iconBg: 'bg-[#fff6ea]',
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

function optionLabel<T extends string>(
  options: { value: T; ja: string; en: string }[],
  value: T | undefined,
  locale: Locale,
) {
  const option = options.find((item) => item.value === value);
  return option ? copy(locale, option.ja, option.en) : '-';
}

function getProductNarrative(productId: string) {
  return productNarratives[productId] ?? productNarratives['seasonal-gift'];
}

function getRouteNarrative(routeId: string) {
  return routeNarratives[routeId] ?? routeNarratives['classic-30'];
}

function getSpotIcon(spot: NearbySpot) {
  if (spot.id === 'shamisen-hall') return Music;

  const icons: Record<NearbySpot['category'], LucideIcon> = {
    literature: BookOpen,
    museum: Landmark,
    food: Store,
    temple: Church,
    park: Trees,
    railway: TrainFront,
    rest: MapPinned,
  };

  return icons[spot.category] ?? Building2;
}

function formatNearbyTag(tag: NearbySpot['tags'][number], locale: Locale) {
  const label = nearbyTagLabels[tag];
  return label ? copy(locale, label.ja, label.en) : tag;
}

function productMatchesFilter(product: Product, filter: ProductFilter) {
  if (filter === 'all') return true;
  if (filter === 'coffee_pairing') return product.tags.includes('coffee_pairing');
  return product.scenes.includes(filter);
}

function formatRouteDuration(route: (typeof routes)[number], locale: Locale) {
  if (route.duration_label_ja && route.duration_label_en) {
    return copy(locale, route.duration_label_ja, route.duration_label_en);
  }

  return `${route.duration_minutes}${copy(locale, '分', ' min')}`;
}

function routeMatchesPace(route: (typeof routes)[number], pace: RoutePace) {
  if (pace === 'all') return true;
  if (route.placement === 'final') return false;
  if (pace === 'quick') return route.duration_minutes <= 30;
  if (pace === 'standard') return route.duration_minutes > 30 && route.duration_minutes <= 75;
  return route.duration_minutes > 75;
}

function formatWeatherTime(time: string, locale: Locale) {
  if (!time) return copy(locale, '現在値', 'Current');

  const normalized = time.includes('+') || time.endsWith('Z') ? time : `${time}${time.length === 16 ? ':00' : ''}+09:00`;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return copy(locale, '現在値', 'Current');

  const formatted = new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  }).format(date);

  return locale === 'ja' ? `${formatted}更新` : `Updated ${formatted}`;
}

const assetBasePath = process.env.NODE_ENV === 'production' ? '/codex-web-demos' : '';
const streetImagePath = `${assetBasePath}/images/places/kanagi-street.jpg`;
const weatherRequestTimeoutMs = 30000;
const weatherRefreshIntervalMs = 10 * 60 * 1000;

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
  const [productFilter, setProductFilter] = useState<ProductFilter>('all');
  const [routePace, setRoutePace] = useState<RoutePace>('all');
  const [weatherState, setWeatherState] = useState<WeatherState>({ status: 'loading' });
  const [isWeatherRefreshing, setIsWeatherRefreshing] = useState(false);
  const weatherRequestIdRef = useRef(0);
  const [answers, setAnswers] = useState<DiagnosisAnswers>({
    recipient: 'outside_prefecture',
    budget: 'around_1000',
    preference: 'kanagi',
    scene: 'gift',
  });
  const [dialectIndex, setDialectIndex] = useState(0);
  const [copiedDialect, setCopiedDialect] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormState>({
    courseId: 'dazai-roots-75',
    date: '',
    time: '11:00',
    guests: '2',
    name: '',
    contact: '',
    note: '',
  });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const diagnosisResults = useMemo(() => diagnoseSouvenirs(answers), [answers]);
  const topDiagnosis = diagnosisResults[0];
  const diagnosisMatchPercent = topDiagnosis ? Math.min(98, 42 + topDiagnosis.score * 4) : 0;
  const diagnosisBundle = diagnosisResults.slice(0, 2).map((result) => result.product);
  const activeDialect = dialects[dialectIndex % dialects.length];
  const weather = weatherState.status === 'success' ? weatherState.weather : undefined;
  const weatherRankedRoutes = useMemo(() => rankRoutesByWeather(routes, weather), [weather]);
  const filteredProducts = useMemo(
    () => products.filter((product) => productMatchesFilter(product, productFilter)),
    [productFilter],
  );
  const filteredRoutes = useMemo(
    () => weatherRankedRoutes.filter(({ route }) => routeMatchesPace(route, routePace)),
    [routePace, weatherRankedRoutes],
  );
  const primaryRoute = weatherRankedRoutes[0]?.route;
  const primaryRouteReason = primaryRoute ? getRouteWeatherReason(primaryRoute.id, weather, locale) : '';
  const selectedBookingRoute = routes.find((route) => route.id === bookingForm.courseId) ?? routes[0];
  const answerSummary = [
    {
      icon: Users,
      label: copy(locale, '相手', 'For'),
      value: optionLabel(recipients, answers.recipient, locale),
    },
    {
      icon: Wallet,
      label: copy(locale, '予算', 'Budget'),
      value: optionLabel(budgets, answers.budget, locale),
    },
    {
      icon: Sparkles,
      label: copy(locale, '好み', 'Taste'),
      value: optionLabel(preferences, answers.preference, locale),
    },
    {
      icon: Target,
      label: copy(locale, '場面', 'Scene'),
      value: optionLabel(scenes, answers.scene, locale),
    },
  ];
  const dialectShareText = copy(
    locale,
    `金木町で覚えた津軽弁「${activeDialect.word}」 = ${activeDialect.standard_ja}。${activeDialect.example_ja}`,
    `Tsugaru phrase from Kanagi: "${activeDialect.word}" = ${activeDialect.meaning_en}. ${activeDialect.example_en}`,
  );

  const refreshWeather = useCallback((mode: 'initial' | 'auto' | 'manual' = 'manual') => {
    const requestId = weatherRequestIdRef.current + 1;
    weatherRequestIdRef.current = requestId;
    let timeoutId = 0;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error('Weather request timed out.')), weatherRequestTimeoutMs);
    });

    setWeatherState((current) => (mode === 'initial' || current.status !== 'success' ? { status: 'loading' } : current));
    setIsWeatherRefreshing(mode !== 'initial');

    Promise.race([fetchKanagiWeather(), timeout])
      .then((weather) => {
        if (weatherRequestIdRef.current !== requestId) return;
        setWeatherState({ status: 'success', weather });
      })
      .catch(() => {
        if (weatherRequestIdRef.current !== requestId) return;
        setWeatherState((current) => (current.status === 'success' ? current : { status: 'error' }));
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (weatherRequestIdRef.current !== requestId) return;
        setIsWeatherRefreshing(false);
      });
  }, []);

  useEffect(() => {
    refreshWeather('initial');
    const intervalId = window.setInterval(() => refreshWeather('auto'), weatherRefreshIntervalMs);

    return () => {
      window.clearInterval(intervalId);
      weatherRequestIdRef.current += 1;
    };
  }, [refreshWeather]);

  function updateAnswer<T extends keyof DiagnosisAnswers>(key: T, value: DiagnosisAnswers[T]) {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateBookingField<T extends keyof BookingFormState>(key: T, value: BookingFormState[T]) {
    setBookingForm((current) => ({
      ...current,
      [key]: value,
    }));
    setBookingSubmitted(false);
  }

  function submitBookingRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingSubmitted(true);
  }

  function drawDialect() {
    setDialectIndex((current) => (current + 1) % dialects.length);
    setCopiedDialect(false);
    setCopyFailed(false);
  }

  async function copyDialectShareText() {
    let didCopy = false;
    setCopyFailed(false);

    try {
      if (!globalThis.navigator?.clipboard?.writeText) {
        throw new Error('Clipboard API is not available.');
      }

      await globalThis.navigator.clipboard.writeText(dialectShareText);
      didCopy = true;
    } catch {
      try {
        if (typeof document.execCommand === 'function') {
          const textarea = document.createElement('textarea');
          textarea.value = dialectShareText;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.left = '-9999px';
          textarea.style.top = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();

          try {
            didCopy = document.execCommand('copy');
          } finally {
            document.body.removeChild(textarea);
          }
        }
      } catch {
        didCopy = false;
      }
    }

    if (didCopy) {
      setCopiedDialect(true);
      window.setTimeout(() => setCopiedDialect(false), 2200);
      return;
    }

    setCopiedDialect(false);
    setCopyFailed(true);
    window.setTimeout(() => setCopyFailed(false), 2200);
  }

  return (
    <main className="kanagi-texture min-h-screen overflow-x-hidden pb-32 text-[#24190f] lg:pb-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-4 sm:px-4 lg:grid lg:grid-cols-[minmax(360px,430px)_1fr] lg:px-8">
        <section className="mx-auto w-full min-w-0 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[28px] border border-[#e5d8bf] bg-[#fffaf0] shadow-[0_24px_70px_rgb(92_66_40_/_18%)] sm:max-w-md">
          <header className="relative overflow-hidden bg-[#fffaf0]">
            <div className="flex items-center justify-between gap-2 px-4 py-4">
              <button
                type="button"
                onClick={() => setActiveCard('diagnosis')}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#dfd2ba] bg-white text-[#2f251a]"
                aria-label={copy(locale, '診断へ戻る', 'Back to finder')}
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
            <div className="relative h-[19rem] overflow-hidden sm:h-[22rem]">
              <img
                src={streetImagePath}
                alt={copy(locale, '金木町の街並みイメージ', 'Kanagi town street image')}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#fffaf0]/92 via-[#fffaf0]/36 to-[#24190f]/72" />
              <div className="absolute inset-x-5 top-6 text-center sm:top-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b54b36]">KADOKKO AI案内所</p>
                <h1 className="mx-auto mt-2 max-w-[19rem] text-[1.22rem] font-black leading-[1.5] tracking-normal text-[#24190f] sm:mt-3 sm:text-2xl sm:leading-[1.55]">
                  {copy(
                    locale,
                    '金木町の「いいもの」や「たのしい」をAIがやさしくご案内します。',
                    'A gentle guide to Kanagi souvenirs, walks, and local phrases.',
                  )}
                </h1>
                <p className="mx-auto mt-3 hidden max-w-[18rem] text-[0.82rem] font-bold leading-5 text-[#5f5140] sm:block sm:text-sm">
                  {copy(
                    locale,
                    '天気、相手、滞在時間から、店頭で迷いにくい提案をまとめます。',
                    'Weather, recipient, and time are combined into clear local suggestions.',
                  )}
                </p>
              </div>
              <div className="absolute inset-x-4 bottom-4 grid gap-2 sm:grid-cols-2">
                <HeroSignal
                  icon={Sparkles}
                  label={copy(locale, 'いまの候補', 'Current pick')}
                  value={
                    topDiagnosis
                      ? copy(locale, topDiagnosis.product.name_ja, topDiagnosis.product.name_en)
                      : copy(locale, '診断中', 'Finding')
                  }
                />
                <HeroSignal
                  icon={Route}
                  label={copy(locale, '散策提案', 'Walk idea')}
                  value={
                    primaryRoute
                      ? copy(locale, primaryRoute.title_ja, primaryRoute.title_en)
                      : copy(locale, '天気確認中', 'Checking weather')
                  }
                />
              </div>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-3 px-3 pt-4 sm:gap-4 sm:px-4 sm:pt-5">
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
            <GuideBriefing
              locale={locale}
              answerSummary={answerSummary}
              topDiagnosis={topDiagnosis}
              matchPercent={diagnosisMatchPercent}
              onOpenDiagnosis={() => setActiveCard('diagnosis')}
              onOpenProducts={() => setActiveCard('products')}
            />
            <WeatherPanel
              locale={locale}
              weatherState={weatherState}
              isRefreshing={isWeatherRefreshing}
              onRefresh={() => refreshWeather('manual')}
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
            <section className="rounded-[22px] border border-[#e4d7bf] bg-white/95 p-4 shadow-sm sm:p-5" id="diagnosis">
              <SectionTitle
                locale={locale}
                eyebrowJa="AIギフト診断"
                eyebrowEn="Gift context"
                titleJa="あなたに合う金木みやげ"
                titleEn="Find a Kanagi souvenir"
                descriptionJa="相手・予算・好み・利用シーンを重ねて、店頭で提案しやすい順に候補を並べます。"
                descriptionEn="Recipient, budget, taste, and scene are combined into a clear in-store recommendation order."
              />
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="rounded-2xl border border-[#eadfc9] bg-[#fffaf0] p-4">
                  <div className="grid gap-3">
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
                  </div>
                </div>

                <DiagnosisSummaryPanel
                  locale={locale}
                  answerSummary={answerSummary}
                  topDiagnosis={topDiagnosis}
                  matchPercent={diagnosisMatchPercent}
                />
              </div>

              <div className="mt-5 rounded-2xl bg-[#2f251a] p-4 text-white shadow-[0_22px_44px_rgb(47_37_26_/_24%)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-[#f2c36b]">{copy(locale, 'おすすめ候補', 'Recommended')}</p>
                    <h3 className="mt-1 text-2xl font-black">
                      {topDiagnosis
                        ? copy(locale, topDiagnosis.product.name_ja, topDiagnosis.product.name_en)
                        : copy(locale, '候補を選定中', 'Selecting picks')}
                    </h3>
                  </div>
                  <MatchMeter locale={locale} percent={diagnosisMatchPercent} tone="dark" />
                </div>
                <div className="mt-4 grid gap-3 xl:grid-cols-3">
                  {diagnosisResults.map((result, index) => (
                    <DiagnosisResultCard key={result.product.id} result={result} index={index} locale={locale} />
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-white/15 bg-white/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-black text-[#f2c36b]">
                    <PackageCheck size={18} />
                    {copy(locale, '組み合わせメモ', 'Bundle note')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-stone-100">
                    {diagnosisBundle.length > 1
                      ? copy(
                          locale,
                          `${diagnosisBundle.map((product) => product.name_ja).join(' + ')}で、金木らしさと渡しやすさを両立できます。`,
                          `${diagnosisBundle.map((product) => product.name_en).join(' + ')} balances local story and easy gifting.`,
                        )
                      : copy(
                          locale,
                          '候補を一つ選んだら、店頭で日持ちや持ち帰り時間を確認すると安心です。',
                          'After choosing one pick, check shelf life and carry time in store.',
                        )}
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeCard === 'products' && (
            <section className="rounded-[22px] border border-[#e4d7bf] bg-white/95 p-4 shadow-sm sm:p-5" id="products">
              <SectionTitle
                locale={locale}
                eyebrowJa="商品コンシェルジュ"
                eyebrowEn="Product concierge"
                titleJa="商品を知る"
                titleEn="Product guide"
                descriptionJa="用途別に絞り込み、贈り方・組み合わせ・持ち帰りの注意まで一枚で確認できます。"
                descriptionEn="Filter by intent and compare gift fit, pairing, and carry notes in one view."
              />
              <FilterRail items={productFilters} active={productFilter} locale={locale} onPick={setProductFilter} />
              <div className="mb-4 mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-[#eadfc9] bg-[#fffaf0] p-4">
                  <p className="flex items-center gap-2 text-sm font-black text-[#bd4a34]">
                    <ShoppingBasket size={18} />
                    {copy(locale, '表示中の商品', 'Visible items')}
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#24190f]">
                    {filteredProducts.length}
                    <span className="ml-1 text-base text-[#7a6a56]">{copy(locale, '件', 'items')}</span>
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#594c3b]">
                    {copy(
                      locale,
                      'フィルターを変えると、食べる・贈る・持ち帰る目的に合わせて候補を比較できます。',
                      'Change the filter to compare items for eating, gifting, or carrying home.',
                    )}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#eadfc9] bg-[#2f251a] p-4 text-white">
                  <p className="flex items-center gap-2 text-sm font-black text-[#f2c36b]">
                    <Sparkles size={18} />
                    {copy(locale, '店頭確認ポイント', 'In-store check')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-stone-100">
                    {copy(
                      locale,
                      '価格、在庫、日持ち、持ち歩き時間は当日の店頭情報で確認すると、提案の精度が上がります。',
                      'Confirm price, stock, shelf life, and carry time in store for the most accurate recommendation.',
                    )}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredProducts.map((product) => {
                  const related = getProductsByIds(product.related_product_ids);
                  const narrative = getProductNarrative(product.id);
                  const sceneLabels = product.scenes
                    .map((scene) => scenes.find((item) => item.value === scene))
                    .filter((item): item is (typeof scenes)[number] => Boolean(item))
                    .map((item) => copy(locale, item.ja, item.en))
                    .join(' / ');

                  return (
                    <article key={product.id} className="rounded-2xl border border-[#e4d7bf] bg-[#fffaf0] p-3 shadow-sm">
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
                        <div className="mt-4 rounded-xl bg-white px-3 py-3">
                          <p className="flex items-start gap-2 text-sm font-black leading-6 text-[#3a2b1c]">
                            <Sparkles className="mt-0.5 shrink-0 text-[#bd4a34]" size={17} />
                            {copy(locale, narrative.lead_ja, narrative.lead_en)}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {product.tags.map((tag) => (
                            <span key={`${product.id}-${tag}`} className="rounded-full bg-[#f7ead0] px-3 py-1 text-xs font-black text-[#6d4c2c]">
                              {optionLabel(preferences, tag, locale)}
                            </span>
                          ))}
                        </div>
                        <dl className="mt-4 grid gap-2 text-sm leading-6">
                          <InfoRow label={copy(locale, 'おすすめシーン', 'Best scene')} value={sceneLabels} />
                          <InfoRow
                            label={copy(locale, '合わせ方', 'Pairing')}
                            value={copy(locale, narrative.pairing_ja, narrative.pairing_en)}
                          />
                          <InfoRow
                            label={copy(locale, '聞くこと', 'Ask')}
                            value={copy(locale, narrative.staffQuestion_ja, narrative.staffQuestion_en)}
                          />
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
                        <p className="mt-3 rounded-xl bg-[#f7ead0] px-3 py-2 text-sm font-bold leading-6 text-[#5d331f]">
                          {copy(locale, narrative.carryMood_ja, narrative.carryMood_en)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {activeCard === 'routes' && (
            <section className="rounded-[22px] border border-[#e4d7bf] bg-white/95 p-4 shadow-sm sm:p-5" id="routes">
              <SectionTitle
                locale={locale}
                eyebrowJa="天気連動ルート"
                eyebrowEn="Weather-aware routes"
                titleJa="KADOKKO起点の金木町散策"
                titleEn="Kanagi walks from KADOKKO"
                descriptionJa="現在の天気を見ながら、短時間・標準・ゆっくり回遊の候補を並び替えます。"
                descriptionEn="Current weather helps reorder quick, standard, and leisurely walking ideas."
              />
              <FilterRail items={routePaces} active={routePace} locale={locale} onPick={setRoutePace} />
              <RouteWeatherBriefing
                locale={locale}
                weather={weather}
                route={primaryRoute}
                weatherReason={primaryRouteReason}
                onResetFilter={() => setRoutePace('all')}
              />
              {routePace === 'all' && <SpotCandidateGrid locale={locale} spots={nearbySpots} />}
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredRoutes.map(({ route, isWeatherPick }) => {
                  const weatherReason = getRouteWeatherReason(route.id, weather, locale);
                  const narrative = getRouteNarrative(route.id);
                  const recommendedProducts = getProductsByIds(route.recommended_product_ids);

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
                            <span>{formatRouteDuration(route, locale)}</span>
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
                          <ExternalLink size={20} />
                        </a>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm leading-6">
                        <RouteInfoLine
                          icon={Users}
                          label={copy(locale, '向いている人', 'Best for')}
                          value={copy(locale, narrative.bestFor_ja, narrative.bestFor_en)}
                        />
                        <RouteInfoLine
                          icon={Footprints}
                          label={copy(locale, '歩き方', 'Pace')}
                          value={copy(locale, narrative.pace_ja, narrative.pace_en)}
                        />
                      </div>
                      <p className="mt-3 text-base leading-7 text-[#594c3b]">
                        {copy(locale, route.description_ja, route.description_en)}
                      </p>
                      <ol className="mt-4 grid gap-2">
                        {route.spots.map((spot, index) => {
                          const spotCandidate = spot.spot_id ? getNearbySpotById(spot.spot_id) : undefined;

                          return (
                            <li key={`${route.id}-${index}-${spot.name_ja}`} className="flex gap-3 rounded-xl bg-white p-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#bd4a34] text-sm font-black text-white">
                                {index + 1}
                              </span>
                              <span className="min-w-0 font-black text-[#3a2b1c]">
                                <span className="block">{copy(locale, spot.name_ja, spot.name_en)}</span>
                                <span className="mt-0.5 block text-sm font-semibold text-[#7a6a56]">
                                  {spot.walk_minutes !== null
                                    ? `${spot.walk_minutes}${copy(locale, '分徒歩', ' min walk')}`
                                    : spotCandidate
                                      ? copy(locale, spotCandidate.access_ja, spotCandidate.access_en)
                                      : copy(locale, '当日確認', 'Check on the day')}
                                </span>
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                      <p className="mt-3 rounded-xl bg-[#f7ead0] px-3 py-2 text-sm leading-6 text-[#5d331f]">
                        {copy(locale, route.note_ja, route.note_en)}
                      </p>
                      <div className="mt-3 rounded-xl bg-white px-3 py-3">
                        <p className="flex items-center gap-2 text-sm font-black text-[#3a2b1c]">
                          <ShoppingBasket size={17} className="text-[#bd4a34]" />
                          {copy(locale, '最後に選ぶなら', 'Good finish')}
                        </p>
                        <p className="mt-1 text-sm font-bold leading-6 text-[#594c3b]">
                          {copy(locale, narrative.finish_ja, narrative.finish_en)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {recommendedProducts.map((product) => (
                            <span key={`${route.id}-${product.id}`} className="rounded-full bg-[#fff4e2] px-3 py-1 text-xs font-black text-[#6d4c2c]">
                              {copy(locale, product.name_ja, product.name_en)}
                            </span>
                          ))}
                        </div>
                      </div>
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

          {activeCard === 'booking' && (
            <section className="rounded-[22px] border border-[#e4d7bf] bg-white/95 p-4 shadow-sm sm:p-5" id="booking">
              <SectionTitle
                locale={locale}
                eyebrowJa="予約リクエスト"
                eyebrowEn="Visit request"
                titleJa="来店・案内の予約相談"
                titleEn="Request a visit"
                descriptionJa="希望コース、日時、人数、連絡先をまとめて入力できます。現在はデモ表示で、外部には送信されません。"
                descriptionEn="Enter course, date, time, party size, and contact details. This demo does not send data externally."
              />
              <BookingPanel
                locale={locale}
                form={bookingForm}
                selectedRoute={selectedBookingRoute}
                submitted={bookingSubmitted}
                onChange={updateBookingField}
                onSubmit={submitBookingRequest}
              />
            </section>
          )}

          {activeCard === 'dialect' && (
            <section className="rounded-[22px] border border-[#e4d7bf] bg-white/95 p-4 shadow-sm sm:p-5" id="dialect">
              <SectionTitle
                locale={locale}
                eyebrowJa="ローカルフレーズ"
                eyebrowEn="Local phrase"
                titleJa="津軽弁くじ"
                titleEn="Tsugaru phrase draw"
                descriptionJa="短い津軽弁を、意味・使用例・旅の共有文までセットで楽しめます。"
                descriptionEn="Enjoy compact Tsugaru phrases with meaning, example, and a share-ready line."
              />
              <article className="overflow-hidden rounded-2xl bg-[#2f251a] text-white shadow-[0_24px_54px_rgb(47_37_26_/_24%)]">
                <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
                  <div className="bg-[#352719] p-5 sm:p-6">
                    <p className="flex items-center gap-2 text-sm font-black text-[#f2c36b]">
                      <MessageCircleMore size={18} />
                      {copy(locale, '今日の一言', 'Phrase')}
                    </p>
                    <h3 className="mt-4 text-7xl font-black leading-none sm:text-8xl">{activeDialect.word}</h3>
                    <p className="mt-4 text-xl font-black">
                      {copy(locale, activeDialect.standard_ja, activeDialect.meaning_en)}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-stone-100">
                      {copy(locale, activeDialect.note_ja, activeDialect.note_en)}
                    </p>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="rounded-xl bg-white/10 p-4">
                      <p className="text-sm text-stone-300">{copy(locale, '使用例', 'Example')}</p>
                      <p className="mt-1 text-2xl font-black">{activeDialect.example_tsugaru}</p>
                      <p className="mt-2 text-sm leading-6 text-stone-100">
                        {copy(locale, activeDialect.example_ja, activeDialect.example_en)}
                      </p>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <MiniNote
                        icon={Store}
                        label={copy(locale, '場所', 'Place')}
                        value={copy(locale, 'KADOKKO店頭', 'At KADOKKO')}
                      />
                      <MiniNote
                        icon={Users}
                        label={copy(locale, '相手', 'With')}
                        value={copy(locale, '友人・家族', 'Friends or family')}
                      />
                      <MiniNote
                        icon={Sparkles}
                        label={copy(locale, '気分', 'Mood')}
                        value={copy(locale, '旅の小ネタ', 'Trip memory')}
                      />
                    </div>
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={drawDialect}
                        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f2c36b] px-4 text-base font-black text-[#24190f]"
                      >
                        <RefreshCw size={18} />
                        {copy(locale, 'もう一回ひく', 'Draw again')}
                      </button>
                      <button
                        type="button"
                        onClick={copyDialectShareText}
                        className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-base font-black text-white"
                      >
                        {copiedDialect ? <Check size={18} /> : <Copy size={18} />}
                        {copiedDialect
                          ? copy(locale, 'コピー済み', 'Copied')
                          : copyFailed
                            ? copy(locale, 'コピー不可', 'Copy failed')
                            : copy(locale, '共有文コピー', 'Copy share text')}
                      </button>
                    </div>
                    <p className="mt-3 rounded-xl border border-white/15 px-3 py-2 text-sm leading-6 text-stone-200">
                      {dialectShareText}
                    </p>
                  </div>
                </div>
              </article>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {dialects.map((dialect, index) => {
                  const active = activeDialect.id === dialect.id;

                  return (
                    <button
                      key={dialect.id}
                      type="button"
                      onClick={() => {
                        setDialectIndex(index);
                        setCopiedDialect(false);
                        setCopyFailed(false);
                      }}
                      className={`rounded-2xl border px-3 py-3 text-left ${
                        active ? 'border-[#bd4a34] bg-[#fff4e2]' : 'border-[#e4d7bf] bg-[#fffaf0]'
                      }`}
                    >
                      <span className="block text-2xl font-black text-[#24190f]">{dialect.word}</span>
                      <span className="mt-1 block text-xs font-bold leading-5 text-[#6d5b43]">
                        {copy(locale, dialect.standard_ja, dialect.meaning_en)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </section>
      </div>

      <MobileDock activeCard={activeCard} locale={locale} onPick={setActiveCard} />
    </main>
  );
}

function BookingPanel({
  locale,
  form,
  selectedRoute,
  submitted,
  onChange,
  onSubmit,
}: {
  locale: Locale;
  form: BookingFormState;
  selectedRoute: (typeof routes)[number];
  submitted: boolean;
  onChange: <T extends keyof BookingFormState>(key: T, value: BookingFormState[T]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <form onSubmit={onSubmit} className="rounded-2xl border border-[#eadfc9] bg-[#fffaf0] p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 sm:col-span-2">
            <span className="flex items-center gap-2 text-sm font-black text-[#3a2b1c]">
              <Route size={17} className="text-[#bd4a34]" />
              {copy(locale, '希望コース', 'Preferred course')}
            </span>
            <select
              value={form.courseId}
              onChange={(event) => onChange('courseId', event.target.value)}
              className="min-h-12 rounded-xl border border-[#e4d7bf] bg-white px-3 text-base font-bold text-[#24190f]"
            >
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {copy(locale, route.title_ja, route.title_en)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-black text-[#3a2b1c]">
              <CalendarDays size={17} className="text-[#bd4a34]" />
              {copy(locale, '希望日', 'Date')}
            </span>
            <input
              type="date"
              value={form.date}
              onChange={(event) => onChange('date', event.target.value)}
              className="min-h-12 rounded-xl border border-[#e4d7bf] bg-white px-3 text-base font-bold text-[#24190f]"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-black text-[#3a2b1c]">
              <Clock size={17} className="text-[#bd4a34]" />
              {copy(locale, '希望時間', 'Time')}
            </span>
            <input
              type="time"
              value={form.time}
              onChange={(event) => onChange('time', event.target.value)}
              className="min-h-12 rounded-xl border border-[#e4d7bf] bg-white px-3 text-base font-bold text-[#24190f]"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-black text-[#3a2b1c]">
              <Users size={17} className="text-[#bd4a34]" />
              {copy(locale, '人数', 'Guests')}
            </span>
            <input
              type="number"
              min="1"
              max="20"
              value={form.guests}
              onChange={(event) => onChange('guests', event.target.value)}
              className="min-h-12 rounded-xl border border-[#e4d7bf] bg-white px-3 text-base font-bold text-[#24190f]"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-black text-[#3a2b1c]">
              <UserRound size={17} className="text-[#bd4a34]" />
              {copy(locale, 'お名前', 'Name')}
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              className="min-h-12 rounded-xl border border-[#e4d7bf] bg-white px-3 text-base font-bold text-[#24190f]"
              placeholder={copy(locale, '例: 津島 花子', 'Example: Hanako Tsushima')}
              required
            />
          </label>

          <label className="grid gap-2 sm:col-span-2">
            <span className="flex items-center gap-2 text-sm font-black text-[#3a2b1c]">
              <MessageCircleMore size={17} className="text-[#bd4a34]" />
              {copy(locale, '連絡先', 'Contact')}
            </span>
            <input
              type="text"
              value={form.contact}
              onChange={(event) => onChange('contact', event.target.value)}
              className="min-h-12 rounded-xl border border-[#e4d7bf] bg-white px-3 text-base font-bold text-[#24190f]"
              placeholder={copy(locale, '電話番号またはメール', 'Phone number or email')}
              required
            />
          </label>

          <label className="grid gap-2 sm:col-span-2">
            <span className="flex items-center gap-2 text-sm font-black text-[#3a2b1c]">
              <NotebookText size={17} className="text-[#bd4a34]" />
              {copy(locale, 'メモ', 'Note')}
            </span>
            <textarea
              value={form.note}
              onChange={(event) => onChange('note', event.target.value)}
              className="min-h-28 rounded-xl border border-[#e4d7bf] bg-white px-3 py-3 text-base font-bold leading-6 text-[#24190f]"
              placeholder={copy(
                locale,
                '例: 推し活コース希望。おみやげも相談したいです。',
                'Example: Interested in the fan route and souvenir advice.',
              )}
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#bd4a34] px-4 text-base font-black text-white"
        >
          <Send size={18} />
          {copy(locale, '予約内容を確認', 'Review request')}
        </button>
      </form>

      <aside className="rounded-2xl border border-[#e4d7bf] bg-[#2f251a] p-4 text-white">
        <p className="flex items-center gap-2 text-sm font-black text-[#f2c36b]">
          <CalendarCheck size={18} />
          {copy(locale, '予約内容', 'Request summary')}
        </p>
        <h3 className="mt-2 text-2xl font-black leading-snug">
          {copy(locale, selectedRoute.title_ja, selectedRoute.title_en)}
        </h3>
        <div className="mt-4 grid gap-2 text-sm">
          <BookingSummaryRow label={copy(locale, '希望日', 'Date')} value={form.date || '-'} />
          <BookingSummaryRow label={copy(locale, '時間', 'Time')} value={form.time || '-'} />
          <BookingSummaryRow
            label={copy(locale, '人数', 'Guests')}
            value={form.guests ? `${form.guests}${copy(locale, '名', '')}` : '-'}
          />
          <BookingSummaryRow label={copy(locale, 'お名前', 'Name')} value={form.name || '-'} />
          <BookingSummaryRow label={copy(locale, '連絡先', 'Contact')} value={form.contact || '-'} />
        </div>
        <p className="mt-4 rounded-xl bg-white/10 px-3 py-3 text-sm font-bold leading-6 text-stone-100">
          {form.note ||
            copy(
              locale,
              'メモがある場合は、希望コースや相談したい内容を書いてください。',
              'Add course preferences or anything you want to ask about.',
            )}
        </p>
        <div className={`mt-4 rounded-xl px-3 py-3 text-sm font-black ${submitted ? 'bg-[#f2c36b] text-[#24190f]' : 'bg-white/10 text-stone-200'}`}>
          {submitted
            ? copy(
                locale,
                '予約リクエスト内容を確認しました。実運用ではここから店舗へ送信します。',
                'Request details are ready. In production, this would send to the shop.',
              )
            : copy(locale, '入力後、内容確認を押してください。', 'Fill the form and review the request.')}
        </div>
      </aside>
    </div>
  );
}

function BookingSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2">
      <p className="text-xs font-black text-stone-300">{label}</p>
      <p className="mt-1 break-words font-black text-white">{value}</p>
    </div>
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
      className={`min-h-[148px] rounded-2xl p-3 text-left text-white shadow-[0_16px_28px_rgb(88_57_24_/_16%)] transition sm:min-h-[170px] sm:p-4 ${
        card.bg
      } ${active ? 'ring-4 ring-white' : 'hover:-translate-y-0.5'}`}
    >
      <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full sm:h-20 sm:w-20 ${card.iconBg} text-[#8d3d2b]`}>
        <Icon className="h-8 w-8 sm:h-[42px] sm:w-[42px]" strokeWidth={1.8} />
      </span>
      <span className="mt-3 block text-center text-[1.12rem] font-black leading-tight tracking-normal [word-break:keep-all] sm:mt-4 sm:text-2xl">
        {copy(locale, card.title_ja, card.title_en)}
      </span>
      <span className="mx-auto mt-2 block max-w-[9.5rem] text-center text-[0.75rem] font-bold leading-5 text-white/95 [word-break:keep-all] sm:max-w-none sm:text-sm sm:leading-6">
        {copy(locale, card.body_ja, card.body_en)}
      </span>
    </button>
  );
}

function HeroSignal({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/45 bg-white/90 px-3 py-2 shadow-[0_10px_26px_rgb(47_37_26_/_18%)] backdrop-blur">
      <p className="flex items-center gap-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#b54b36]">
        <Icon size={14} />
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-[#24190f]">{value}</p>
    </div>
  );
}

function GuideBriefing({
  locale,
  answerSummary,
  topDiagnosis,
  matchPercent,
  onOpenDiagnosis,
  onOpenProducts,
}: {
  locale: Locale;
  answerSummary: { icon: LucideIcon; label: string; value: string }[];
  topDiagnosis?: DiagnosisResult;
  matchPercent: number;
  onOpenDiagnosis: () => void;
  onOpenProducts: () => void;
}) {
  return (
    <section className="rounded-2xl border border-[#e4d7bf] bg-[#2f251a] p-4 text-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-black text-[#f2c36b]">
            <Sparkles size={18} />
            {copy(locale, 'AIブリーフィング', 'AI briefing')}
          </p>
          <h2 className="mt-2 text-xl font-black leading-tight">
            {topDiagnosis
              ? copy(locale, topDiagnosis.product.name_ja, topDiagnosis.product.name_en)
              : copy(locale, '候補を準備中', 'Preparing picks')}
          </h2>
        </div>
        <MatchMeter locale={locale} percent={matchPercent} tone="dark" compact />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {answerSummary.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-xl bg-white/10 px-3 py-2">
              <p className="flex items-center gap-1.5 text-[0.7rem] font-black text-stone-300">
                <Icon size={14} />
                {item.label}
              </p>
              <p className="mt-1 truncate text-sm font-black text-white">{item.value}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onOpenDiagnosis}
          className="min-h-11 rounded-xl bg-[#f2c36b] px-3 text-sm font-black text-[#24190f]"
        >
          {copy(locale, '条件を調整', 'Tune answers')}
        </button>
        <button
          type="button"
          onClick={onOpenProducts}
          className="min-h-11 rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-black text-white"
        >
          {copy(locale, '商品を見る', 'View items')}
        </button>
      </div>
    </section>
  );
}

function WeatherPanel({
  locale,
  weatherState,
  isRefreshing,
  onRefresh,
  onOpenRoutes,
}: {
  locale: Locale;
  weatherState: WeatherState;
  isRefreshing: boolean;
  onRefresh: () => void;
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
        <button
          type="button"
          onClick={onRefresh}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#fff4e2] px-4 py-3 text-sm font-black text-[#5d331f]"
        >
          <RefreshCw size={16} />
          {copy(locale, '再取得する', 'Try again')}
        </button>
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
        <button
          type="button"
          onClick={onRefresh}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#bd4a34] px-4 py-3 text-sm font-black text-white"
        >
          <RefreshCw size={16} />
          {copy(locale, '天気を再取得', 'Reload weather')}
        </button>
      </section>
    );
  }

  const { weather } = weatherState;
  const icon = getWeatherEmoji(weather);
  const precipitationValue =
    weather.precipitation > 0
      ? `${weather.precipitation.toFixed(1)}mm`
      : icon === 'rain'
        ? copy(locale, '雨', 'Rain')
        : icon === 'snow'
          ? copy(locale, '雪', 'Snow')
          : '0.0mm';

  return (
    <section className="rounded-2xl border border-[#e4d7bf] bg-white/95 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-center text-lg font-black text-[#24190f]">
            {copy(locale, '現在の金木町天気', 'Current Kanagi weather')}
          </p>
          <p className="mt-1 text-center text-xs font-black text-[#8a7660]">{formatWeatherTime(weather.time, locale)}</p>
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
          onClick={onRefresh}
          className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff4e2] text-[#bd4a34]"
          aria-label={copy(locale, '天気を更新', 'Refresh weather')}
          disabled={isRefreshing}
        >
          <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={19} />
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
          value={precipitationValue}
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
      <button
        type="button"
        onClick={onOpenRoutes}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#bd4a34] px-4 py-3 text-sm font-black text-white"
      >
        <Route size={18} />
        {copy(locale, '天気に合う散策を見る', 'Show weather-aware routes')}
      </button>
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
              {copy(locale, '所要時間', 'Duration')}: {formatRouteDuration(route, locale)}
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

function DiagnosisSummaryPanel({
  locale,
  answerSummary,
  topDiagnosis,
  matchPercent,
}: {
  locale: Locale;
  answerSummary: { icon: LucideIcon; label: string; value: string }[];
  topDiagnosis?: DiagnosisResult;
  matchPercent: number;
}) {
  return (
    <aside className="rounded-2xl border border-[#eadfc9] bg-white p-4">
      <p className="flex items-center gap-2 text-sm font-black text-[#bd4a34]">
        <Target size={18} />
        {copy(locale, '現在の条件', 'Current context')}
      </p>
      <div className="mt-3 grid gap-2">
        {answerSummary.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="flex items-center gap-3 rounded-xl bg-[#fffaf0] px-3 py-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff4e2] text-[#bd4a34]">
                <Icon size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black text-[#8a7660]">{item.label}</p>
                <p className="truncate text-sm font-black text-[#24190f]">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-xl bg-[#2f251a] p-3 text-white">
        <p className="text-xs font-black text-[#f2c36b]">{copy(locale, '最有力候補', 'Top pick')}</p>
        <p className="mt-1 text-lg font-black leading-snug">
          {topDiagnosis ? copy(locale, topDiagnosis.product.name_ja, topDiagnosis.product.name_en) : '-'}
        </p>
        <div className="mt-3">
          <MatchMeter locale={locale} percent={matchPercent} tone="dark" />
        </div>
      </div>
    </aside>
  );
}

function MatchMeter({
  locale,
  percent,
  tone = 'light',
  compact = false,
}: {
  locale: Locale;
  percent: number;
  tone?: 'light' | 'dark';
  compact?: boolean;
}) {
  const trackClass = tone === 'dark' ? 'bg-white/15' : 'bg-[#eadfc9]';
  const labelClass = tone === 'dark' ? 'text-stone-100' : 'text-[#594c3b]';
  const valueClass = tone === 'dark' ? 'text-white' : 'text-[#24190f]';

  return (
    <div className={compact ? 'w-24' : 'w-full min-w-[9rem]'}>
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs font-black ${labelClass}`}>{copy(locale, '一致度', 'Match')}</span>
        <span className={`text-sm font-black ${valueClass}`}>{percent}%</span>
      </div>
      <div className={`mt-1 h-2 overflow-hidden rounded-full ${trackClass}`} aria-hidden="true">
        <div className="h-full rounded-full bg-[#f2c36b]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function DiagnosisResultCard({ result, index, locale }: { result: DiagnosisResult; index: number; locale: Locale }) {
  const narrative = getProductNarrative(result.product.id);

  return (
    <article className="rounded-xl border border-white/15 bg-white/10 p-3">
      <div className="flex gap-3">
        <img
          src={`${assetBasePath}${result.product.image_url}`}
          alt={copy(locale, result.product.name_ja, result.product.name_en)}
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-black leading-snug">
              {index + 1}. {copy(locale, result.product.name_ja, result.product.name_en)}
            </h3>
            <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-[#2f251a]">{result.score}</span>
          </div>
          <p className="mt-1 text-xs font-bold text-[#f2c36b]">
            {copy(locale, result.product.priceLabel_ja, result.product.priceLabel_en)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-100">{copy(locale, result.reason_ja, result.reason_en)}</p>
      <p className="mt-3 rounded-lg bg-black/15 px-3 py-2 text-xs font-bold leading-5 text-stone-100">
        {copy(locale, narrative.lead_ja, narrative.lead_en)}
      </p>
    </article>
  );
}

function FilterRail<T extends string>({
  items,
  active,
  locale,
  onPick,
}: {
  items: { value: T; icon: LucideIcon; ja: string; en: string }[];
  active: T;
  locale: Locale;
  onPick: (value: T) => void;
}) {
  return (
    <div className="-mx-1 mb-1 flex gap-2 overflow-x-auto px-1 pb-2" role="tablist">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onPick(item.value)}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-black ${
              isActive
                ? 'border-[#bd4a34] bg-[#bd4a34] text-white'
                : 'border-[#e4d7bf] bg-[#fffaf0] text-[#594c3b]'
            }`}
            aria-pressed={isActive}
          >
            <Icon size={17} />
            {copy(locale, item.ja, item.en)}
          </button>
        );
      })}
    </div>
  );
}

function SpotCandidateGrid({ locale, spots }: { locale: Locale; spots: NearbySpot[] }) {
  return (
    <section className="mb-5 rounded-2xl border border-[#e4d7bf] bg-[#fffaf0] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-black text-[#bd4a34]">
            <MapPinned size={18} />
            {copy(locale, '周辺スポット候補', 'Nearby spot candidates')}
          </p>
          <h3 className="mt-1 text-2xl font-black text-[#24190f]">
            {copy(locale, 'KADOKKOから組み合わせる場所', 'Places to combine with KADOKKO')}
          </h3>
          <p className="mt-2 text-sm font-bold leading-6 text-[#6f604d]">
            {copy(
              locale,
              '公式観光情報を確認して、短時間・雨の日・文学深掘り・公園散策の候補を追加しました。',
              'Added source-checked options for short walks, rainy days, literary depth, and park outings.',
            )}
          </p>
        </div>
        <span className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-black text-[#5d331f]">
          {spots.length}
          {copy(locale, '件', ' spots')}
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {spots.map((spot) => (
          <SpotCandidateCard key={spot.id} spot={spot} locale={locale} />
        ))}
      </div>
    </section>
  );
}

function SpotCandidateCard({ spot, locale }: { spot: NearbySpot; locale: Locale }) {
  const Icon = getSpotIcon(spot);

  return (
    <article className="rounded-2xl border border-[#eadfc9] bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff4e2] text-[#bd4a34]">
          <Icon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-black leading-snug text-[#24190f]">
            {copy(locale, spot.name_ja, spot.name_en)}
          </h4>
          <p className="mt-1 text-xs font-black uppercase tracking-normal text-[#8a7660]">
            {copy(locale, spot.access_ja, spot.access_en)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm font-bold leading-6 text-[#594c3b]">
        {copy(locale, spot.description_ja, spot.description_en)}
      </p>
      <div className="mt-3 grid gap-2 text-sm">
        <RouteInfoLine
          icon={Clock}
          label={copy(locale, '滞在目安', 'Visit time')}
          value={copy(locale, spot.visit_time_ja, spot.visit_time_en)}
        />
        <RouteInfoLine
          icon={Sparkles}
          label={copy(locale, '使いどころ', 'Route use')}
          value={copy(locale, spot.route_hint_ja, spot.route_hint_en)}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {spot.tags.slice(0, 4).map((tag) => (
          <span key={`${spot.id}-${tag}`} className="rounded-full bg-[#f7ead0] px-3 py-1 text-xs font-black text-[#6d4c2c]">
            {formatNearbyTag(tag, locale)}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={spot.source_url}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e4d7bf] bg-[#fffaf0] px-3 text-sm font-black text-[#3a2b1c]"
        >
          <ExternalLink size={16} />
          {copy(locale, '公式情報', 'Source')}
        </a>
        <a
          href={spot.google_maps_url}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#2f251a] px-3 text-sm font-black text-white"
        >
          <MapPin size={16} />
          {copy(locale, '地図', 'Map')}
        </a>
      </div>
    </article>
  );
}

function RouteWeatherBriefing({
  locale,
  weather,
  route,
  weatherReason,
  onResetFilter,
}: {
  locale: Locale;
  weather?: WeatherSnapshot;
  route?: (typeof routes)[number];
  weatherReason: string;
  onResetFilter: () => void;
}) {
  return (
    <div className="mb-4 mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
      <div className="rounded-2xl border border-[#eadfc9] bg-[#fffaf0] p-4">
        <p className="flex items-center gap-2 text-sm font-black text-[#bd4a34]">
          <CloudSun size={18} />
          {copy(locale, '今日の判断', 'Today signal')}
        </p>
        <p className="mt-2 text-sm font-bold leading-6 text-[#594c3b]">
          {weather
            ? copy(
                locale,
                `${getWeatherLabel(weather, locale)}・${Math.round(weather.temperature)}°C。${weatherReason || '歩く時間と店内滞在のバランスで選べます。'}`,
                `${getWeatherLabel(weather, locale)} and ${Math.round(weather.temperature)}°C. ${
                  weatherReason || 'Choose by balancing walk time and indoor browsing.'
                }`,
              )
            : copy(
                locale,
                '天気取得前でも固定ルートは使えます。取得後はおすすめ順が自動で変わります。',
                'Fixed routes work before weather loads. Recommendation order updates after weather is available.',
              )}
        </p>
        {route && (
          <p className="mt-2 text-lg font-black leading-snug text-[#24190f]">
            {copy(locale, route.title_ja, route.title_en)}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onResetFilter}
        className="min-h-14 rounded-2xl border border-[#e4d7bf] bg-white px-5 text-sm font-black text-[#3a2b1c] lg:min-w-36"
      >
        {copy(locale, '全ルート表示', 'Show all')}
      </button>
    </div>
  );
}

function RouteInfoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[#eadfc9] bg-white px-3 py-2">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#fff4e2] text-[#bd4a34]">
        <Icon size={16} />
      </span>
      <div>
        <p className="text-xs font-black text-[#8a7660]">{label}</p>
        <p className="font-bold text-[#3a2b1c]">{value}</p>
      </div>
    </div>
  );
}

function MiniNote({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-3">
      <p className="flex items-center gap-1.5 text-xs font-black text-stone-300">
        <Icon size={14} />
        {label}
      </p>
      <p className="mt-1 text-sm font-black leading-5 text-white">{value}</p>
    </div>
  );
}

function SectionTitle({
  locale,
  eyebrowJa,
  eyebrowEn,
  titleJa,
  titleEn,
  descriptionJa,
  descriptionEn,
}: {
  locale: Locale;
  eyebrowJa: string;
  eyebrowEn: string;
  titleJa: string;
  titleEn: string;
  descriptionJa?: string;
  descriptionEn?: string;
}) {
  return (
    <div className="mb-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#bd4a34]">
        {copy(locale, eyebrowJa, eyebrowEn)}
      </p>
      <h2 className="mt-1 text-3xl font-black tracking-normal text-[#24190f]">
        {copy(locale, titleJa, titleEn)}
      </h2>
      {descriptionJa && descriptionEn && (
        <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-[#6f604d]">
          {copy(locale, descriptionJa, descriptionEn)}
        </p>
      )}
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
    { id: 'booking', icon: CalendarCheck, ja: '予約', en: 'Book' },
    { id: 'dialect', icon: Languages, ja: '津軽弁', en: 'Phrase' },
  ];

  return (
    <nav
      aria-label={copy(locale, '主要機能', 'Primary functions')}
      className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-[#e4d7bf] bg-[#fffaf0]/96 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgb(92_66_40_/_12%)] backdrop-blur lg:hidden"
    >
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeCard === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPick(item.id)}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-black ${
                active ? 'text-[#bd4a34]' : 'text-[#5f5140]'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.6 : 2} />
              <span>{copy(locale, item.ja, item.en)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
