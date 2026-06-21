'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from 'react';
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

export type CardId = 'diagnosis' | 'products' | 'routes' | 'booking' | 'dialect';
export type ProductFilter = 'all' | Scene | 'coffee_pairing';
export type RoutePace = 'all' | 'quick' | 'standard' | 'deep';
type BookingFormState = {
  date: string;
  time: string;
  guests: string;
  name: string;
  contact: string;
};

const cardIds: CardId[] = ['diagnosis', 'products', 'routes', 'booking', 'dialect'];

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
}[] = [
  {
    id: 'diagnosis',
    icon: Gift,
    title_ja: 'おみやげ診断',
    title_en: 'Souvenir finder',
    body_ja: '相手に合うおみやげを提案',
    body_en: 'Pick a fitting local gift.',
  },
  {
    id: 'products',
    icon: ShoppingBasket,
    title_ja: '商品を知る',
    title_en: 'Product guide',
    body_ja: '商品の特徴を見やすく紹介',
    body_en: 'See clear product notes.',
  },
  {
    id: 'routes',
    icon: Map,
    title_ja: '金木町を歩く',
    title_en: 'Walk Kanagi',
    body_ja: '時間に合わせて散策を案内',
    body_en: 'Find a short walk plan.',
  },
  {
    id: 'booking',
    icon: CalendarCheck,
    title_ja: '予約相談',
    title_en: 'Booking',
    body_ja: '食事の希望時間を送る',
    body_en: 'Send a meal time request.',
  },
  {
    id: 'dialect',
    icon: MessageCircleMore,
    title_ja: '津軽弁くじ',
    title_en: 'Tsugaru phrase draw',
    body_ja: '津軽弁をひいて楽しもう',
    body_en: 'Draw a Tsugaru phrase.',
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

function getCardFromHash(hash: string): CardId | undefined {
  const card = hash.replace(/^#/, '');
  return cardIds.includes(card as CardId) ? (card as CardId) : undefined;
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

function getWeatherSignalIcon(icon: ReturnType<typeof getWeatherEmoji>) {
  const icons: Record<ReturnType<typeof getWeatherEmoji>, LucideIcon> = {
    sun: Sun,
    cloud: Cloud,
    rain: CloudRain,
    snow: Snowflake,
    hot: ThermometerSun,
    cold: ThermometerSnowflake,
    wind: Wind,
  };

  return icons[icon];
}

const assetBasePath = process.env.NODE_ENV === 'production' ? '/codex-web-demos' : '';
const appBaseHref = process.env.NODE_ENV === 'production' ? '/codex-web-demos/' : '/';
const streetImagePath = `${assetBasePath}/images/places/kanagi-street.jpg`;
const weatherRequestTimeoutMs = 30000;
const weatherRefreshIntervalMs = 10 * 60 * 1000;

type WeatherState =
  | { status: 'loading' }
  | { status: 'success'; weather: WeatherSnapshot }
  | { status: 'error' };

function ProductThumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#e5e5e7] bg-[#f5f5f7]">
      <img src={`${assetBasePath}${src}`} alt={alt} className="aspect-[4/3] w-full object-cover" />
    </div>
  );
}

export function KadokkoGuide({
  initialCard = 'diagnosis',
  initialLocale = 'ja',
  initialProductFilter = 'all',
  initialRoutePace = 'all',
}: {
  initialCard?: CardId;
  initialLocale?: Locale;
  initialProductFilter?: ProductFilter;
  initialRoutePace?: RoutePace;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [activeCard, setActiveCard] = useState<CardId>(initialCard);
  const [productFilter, setProductFilter] = useState<ProductFilter>(initialProductFilter);
  const [routePace, setRoutePace] = useState<RoutePace>(initialRoutePace);
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
    date: '',
    time: '11:00',
    guests: '2',
    name: '',
    contact: '',
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

  function guideHref({
    card = activeCard,
  }: {
    card?: CardId;
    nextLocale?: Locale;
    product?: ProductFilter;
    pace?: RoutePace;
  } = {}) {
    return `${appBaseHref}#${card}`;
  }

  function replaceGuideUrl(href: string) {
    if (typeof window === 'undefined') return;
    window.history.replaceState(null, '', href);
  }

  function openCard(event: MouseEvent<HTMLAnchorElement>, card: CardId) {
    const href = guideHref({ card });
    event.preventDefault();
    setActiveCard(card);
    replaceGuideUrl(href);
  }

  function switchLocale(event: MouseEvent<HTMLAnchorElement>, nextLocale: Locale) {
    const href = guideHref({ nextLocale });
    event.preventDefault();
    setLocale(nextLocale);
    replaceGuideUrl(href);
  }

  function pickProductFilter(event: MouseEvent<HTMLAnchorElement>, value: ProductFilter) {
    const href = guideHref({ card: 'products', product: value });
    event.preventDefault();
    setActiveCard('products');
    setProductFilter(value);
    replaceGuideUrl(href);
  }

  function pickRoutePace(event: MouseEvent<HTMLAnchorElement>, value: RoutePace) {
    const href = guideHref({ card: 'routes', pace: value });
    event.preventDefault();
    setActiveCard('routes');
    setRoutePace(value);
    replaceGuideUrl(href);
  }

  useEffect(() => {
    function syncCardFromHash() {
      const hashCard = getCardFromHash(window.location.hash);
      if (hashCard) setActiveCard(hashCard);
    }

    syncCardFromHash();
    window.addEventListener('hashchange', syncCardFromHash);
    window.addEventListener('popstate', syncCardFromHash);

    return () => {
      window.removeEventListener('hashchange', syncCardFromHash);
      window.removeEventListener('popstate', syncCardFromHash);
    };
  }, []);

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
    <main className="kadokko-app kanagi-texture min-h-screen overflow-x-hidden pb-32 text-[#2b2b2b] lg:pb-8">
      <div className="kadokko-layout mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-4 sm:px-4 lg:grid lg:grid-cols-[minmax(340px,410px)_1fr] lg:px-8">
        <section className="kadokko-sidebar mx-auto w-full min-w-0 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[16px] border border-[#ded6d1] bg-white shadow-[0_16px_40px_rgb(109_73_52_/_10%)] sm:max-w-md">
          <header className="relative overflow-hidden bg-white">
            <div className="flex items-center justify-between gap-2 px-4 py-4 sm:px-5">
              <a
                href={guideHref({ card: 'diagnosis' })}
                onClick={(event) => openCard(event, 'diagnosis')}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#ded6d1] bg-[#f8f5f2] text-[#2b2b2b]"
                aria-label={copy(locale, '診断へ戻る', 'Back to finder')}
              >
                <Menu size={24} strokeWidth={2.4} />
              </a>
              <p className="min-w-0 flex-1 text-center text-base font-semibold tracking-normal sm:text-xl">
                KADOKKO AI Guide
              </p>
              <div className="flex shrink-0 rounded-full border border-[#ded6d1] bg-[#f8f5f2] p-1 text-xs font-semibold">
                <a
                  href={guideHref({ nextLocale: 'ja' })}
                  className={`rounded-full px-2 py-2 ${locale === 'ja' ? 'bg-[#bf0000] text-white shadow-sm' : 'text-[#666666]'}`}
                  onClick={(event) => switchLocale(event, 'ja')}
                  aria-pressed={locale === 'ja'}
                >
                  JP
                </a>
                <a
                  href={guideHref({ nextLocale: 'en' })}
                  className={`rounded-full px-2 py-2 ${locale === 'en' ? 'bg-[#bf0000] text-white shadow-sm' : 'text-[#666666]'}`}
                  onClick={(event) => switchLocale(event, 'en')}
                  aria-pressed={locale === 'en'}
                >
                  EN
                </a>
              </div>
            </div>
            <div className="kadokko-hero relative mx-3 h-[20rem] overflow-hidden rounded-[14px] bg-[#f8f5f2] sm:mx-4 sm:h-[23rem]">
              <img
                src={streetImagePath}
                alt={copy(locale, '金木町の街並みイメージ', 'Kanagi town street image')}
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/66 to-white/28" />
              <div className="absolute inset-x-5 top-7 text-center sm:top-9">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#bf0000]">KADOKKO AI Guide</p>
                <h1 className="mx-auto mt-2 max-w-[20rem] text-[2rem] font-semibold leading-[1.08] tracking-normal text-[#2b2b2b] sm:mt-3 sm:text-[2.65rem]">
                  {locale === 'ja' ? (
                    <>
                      <span className="block">金木を、</span>
                      <span className="block whitespace-nowrap">シンプルに案内。</span>
                    </>
                  ) : (
                    <>
                      <span className="block">Kanagi,</span>
                      <span className="block whitespace-nowrap">simply guided.</span>
                    </>
                  )}
                </h1>
                <p className="mx-auto mt-4 max-w-[18rem] text-[0.82rem] font-medium leading-5 text-[#555555] sm:text-sm">
                  {copy(
                    locale,
                    'おみやげ、散策、食事予約をひとつに。',
                    'Souvenirs, walks, and meal reservations in one calm guide.',
                  )}
                </p>
              </div>
              <div className="absolute inset-x-4 bottom-4 grid gap-2">
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

          <WeatherSummaryBar
            locale={locale}
            weatherState={weatherState}
            isRefreshing={isWeatherRefreshing}
            onRefresh={() => refreshWeather('manual')}
          />

          <section className="grid grid-cols-2 gap-3 px-3 pb-5 pt-4 sm:gap-3 sm:px-4 sm:pb-6 sm:pt-5">
            {cards.map((card) => (
              <FeatureCard
                key={card.id}
                card={card}
                locale={locale}
                active={activeCard === card.id}
                href={guideHref({ card: card.id })}
                onClick={(event) => openCard(event, card.id)}
              />
            ))}
          </section>

        </section>

        <section className="kadokko-content mx-auto w-full min-w-0 max-w-[calc(100vw-1.5rem)] sm:max-w-md lg:max-w-none">
          <section
            className="guide-panel rounded-[14px] border border-[#ded6d1] bg-white p-4 shadow-[0_14px_34px_rgb(109_73_52_/_9%)] sm:p-6"
            data-active={activeCard === 'diagnosis'}
            data-guide-panel="diagnosis"
            id="diagnosis"
          >
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

              <div className="mt-5 rounded-[12px] border border-[#ded6d1] bg-[#fff7f7] p-4 text-[#2b2b2b] shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-[#bf0000]">{copy(locale, 'おすすめ候補', 'Recommended')}</p>
                    <h3 className="mt-1 text-2xl font-black text-[#2b2b2b]">
                      {topDiagnosis
                        ? copy(locale, topDiagnosis.product.name_ja, topDiagnosis.product.name_en)
                        : copy(locale, '候補を選定中', 'Selecting picks')}
                    </h3>
                  </div>
                  <MatchMeter locale={locale} percent={diagnosisMatchPercent} />
                </div>
                <div className="mt-4 grid gap-3 xl:grid-cols-3">
                  {diagnosisResults.map((result, index) => (
                    <DiagnosisResultCard key={result.product.id} result={result} index={index} locale={locale} />
                  ))}
                </div>
                <div className="mt-4 rounded-[8px] border border-[#eaded8] bg-white p-4">
                  <p className="flex items-center gap-2 text-sm font-black text-[#bf0000]">
                    <PackageCheck size={18} />
                    {copy(locale, '組み合わせメモ', 'Bundle note')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#555555]">
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

          <section
            className="guide-panel rounded-[14px] border border-[#ded6d1] bg-white p-4 shadow-[0_14px_34px_rgb(109_73_52_/_9%)] sm:p-6"
            data-active={activeCard === 'products'}
            data-guide-panel="products"
            id="products"
          >
              <SectionTitle
                locale={locale}
                eyebrowJa="商品コンシェルジュ"
                eyebrowEn="Product concierge"
                titleJa="商品を知る"
                titleEn="Product guide"
                descriptionJa="用途別に絞り込み、贈り方・組み合わせ・持ち帰りの注意まで一枚で確認できます。"
                descriptionEn="Filter by intent and compare gift fit, pairing, and carry notes in one view."
              />
              <FilterRail
                items={productFilters}
                active={productFilter}
                locale={locale}
                getHref={(value) => guideHref({ card: 'products', product: value })}
                onPick={pickProductFilter}
              />
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
                <div className="rounded-[12px] border border-[#eaded8] bg-[#fff7f7] p-4 text-[#2b2b2b]">
                  <p className="flex items-center gap-2 text-sm font-black text-[#bf0000]">
                    <Sparkles size={18} />
                    {copy(locale, '店頭確認ポイント', 'In-store check')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#555555]">
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
                    <article key={product.id} className="rounded-[24px] border border-[#e5e5e7] bg-white p-3 shadow-sm">
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

          <section
            className="guide-panel rounded-[14px] border border-[#ded6d1] bg-white p-4 shadow-[0_14px_34px_rgb(109_73_52_/_9%)] sm:p-6"
            data-active={activeCard === 'routes'}
            data-guide-panel="routes"
            id="routes"
          >
              <SectionTitle
                locale={locale}
                eyebrowJa="天気連動ルート"
                eyebrowEn="Weather-aware routes"
                titleJa="KADOKKO起点の金木町散策"
                titleEn="Kanagi walks from KADOKKO"
                descriptionJa="現在の天気を見ながら、短時間・標準・ゆっくり回遊の候補を並び替えます。"
                descriptionEn="Current weather helps reorder quick, standard, and leisurely walking ideas."
              />
              <FilterRail
                items={routePaces}
                active={routePace}
                locale={locale}
                getHref={(value) => guideHref({ card: 'routes', pace: value })}
                onPick={pickRoutePace}
              />
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
                      className={`rounded-[24px] border p-4 shadow-sm ${
                        isWeatherPick ? 'border-[#d7d7dc] bg-[#f5f5f7]' : 'border-[#e5e5e7] bg-white'
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
                            <span className="rounded-full bg-[#bf0000] px-2 py-1 text-xs text-white">
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
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-[#bf0000] text-white"
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
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[#bf0000] text-sm font-black text-white">
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

          <section
            className="guide-panel rounded-[14px] border border-[#ded6d1] bg-white p-4 shadow-[0_14px_34px_rgb(109_73_52_/_9%)] sm:p-6"
            data-active={activeCard === 'booking'}
            data-guide-panel="booking"
            id="booking"
          >
              <SectionTitle
                locale={locale}
                eyebrowJa="予約リクエスト"
                eyebrowEn="Visit request"
                titleJa="お食事の予約相談"
                titleEn="Meal reservation request"
                descriptionJa="希望日時・人数・お名前・連絡先をまとめて入力できます。現在はデモ表示で、外部には送信されません。"
                descriptionEn="Enter date, time, party size, name, and contact details. This demo does not send data externally."
              />
              <BookingPanel
                locale={locale}
                form={bookingForm}
                submitted={bookingSubmitted}
                onChange={updateBookingField}
                onSubmit={submitBookingRequest}
              />
          </section>

          <section
            className="guide-panel rounded-[14px] border border-[#ded6d1] bg-white p-4 shadow-[0_14px_34px_rgb(109_73_52_/_9%)] sm:p-6"
            data-active={activeCard === 'dialect'}
            data-guide-panel="dialect"
            id="dialect"
          >
              <SectionTitle
                locale={locale}
                eyebrowJa="ローカルフレーズ"
                eyebrowEn="Local phrase"
                titleJa="津軽弁くじ"
                titleEn="Tsugaru phrase draw"
                descriptionJa="短い津軽弁を、意味・使用例・旅の共有文までセットで楽しめます。"
                descriptionEn="Enjoy compact Tsugaru phrases with meaning, example, and a share-ready line."
              />
              <article className="overflow-hidden rounded-[12px] border border-[#ded6d1] bg-white text-[#2b2b2b] shadow-sm">
                <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
                  <div className="bg-[#fff7f7] p-5 sm:p-6">
                    <p className="flex items-center gap-2 text-sm font-black text-[#bf0000]">
                      <MessageCircleMore size={18} />
                      {copy(locale, '今日の一言', 'Phrase')}
                    </p>
                    <h3 className="mt-4 text-7xl font-black leading-none sm:text-8xl">{activeDialect.word}</h3>
                    <p className="mt-4 text-xl font-black">
                      {copy(locale, activeDialect.standard_ja, activeDialect.meaning_en)}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-[#555555]">
                      {copy(locale, activeDialect.note_ja, activeDialect.note_en)}
                    </p>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="rounded-[8px] border border-[#eaded8] bg-[#f8f5f2] p-4">
                      <p className="text-sm text-[#666666]">{copy(locale, '使用例', 'Example')}</p>
                      <p className="mt-1 text-2xl font-black">{activeDialect.example_tsugaru}</p>
                      <p className="mt-2 text-sm leading-6 text-[#555555]">
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
                        className="flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#bf0000] px-4 text-base font-black text-white"
                      >
                        <RefreshCw size={18} />
                        {copy(locale, 'もう一回ひく', 'Draw again')}
                      </button>
                      <button
                        type="button"
                        onClick={copyDialectShareText}
                        className="flex min-h-12 items-center justify-center gap-2 rounded-[8px] border border-[#ded6d1] bg-white px-4 text-base font-black text-[#bf0000]"
                      >
                        {copiedDialect ? <Check size={18} /> : <Copy size={18} />}
                        {copiedDialect
                          ? copy(locale, 'コピー済み', 'Copied')
                          : copyFailed
                            ? copy(locale, 'コピー不可', 'Copy failed')
                            : copy(locale, '共有文コピー', 'Copy share text')}
                      </button>
                    </div>
                    <p className="mt-3 rounded-[8px] border border-[#ded6d1] bg-[#f8f5f2] px-3 py-2 text-sm leading-6 text-[#555555]">
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
        </section>
      </div>

      <MobileDock
        activeCard={activeCard}
        locale={locale}
        getHref={(card) => guideHref({ card })}
        onPick={(event, card) => openCard(event, card)}
      />
    </main>
  );
}

function BookingPanel({
  locale,
  form,
  submitted,
  onChange,
  onSubmit,
}: {
  locale: Locale;
  form: BookingFormState;
  submitted: boolean;
  onChange: <T extends keyof BookingFormState>(key: T, value: BookingFormState[T]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <form data-booking-form onSubmit={onSubmit} className="rounded-[12px] border border-[#ded6d1] bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid min-w-0 gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#2b2b2b]">
              <CalendarDays size={17} className="text-[#bf0000]" />
              {copy(locale, '希望日', 'Date')}
            </span>
            <input
              data-booking-field="date"
              type="date"
              defaultValue={form.date}
              onChange={(event) => onChange('date', event.target.value)}
              className="min-h-12 w-full min-w-0 rounded-[8px] border border-[#ded6d1] bg-[#f8f5f2] px-3 text-base font-medium text-[#2b2b2b]"
              required
            />
          </label>

          <label className="grid min-w-0 gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#2b2b2b]">
              <Clock size={17} className="text-[#bf0000]" />
              {copy(locale, '希望時間', 'Time')}
            </span>
            <input
              data-booking-field="time"
              type="time"
              defaultValue={form.time}
              onChange={(event) => onChange('time', event.target.value)}
              className="min-h-12 w-full min-w-0 rounded-[8px] border border-[#ded6d1] bg-[#f8f5f2] px-3 text-base font-medium text-[#2b2b2b]"
              required
            />
          </label>

          <label className="grid min-w-0 gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#2b2b2b]">
              <Users size={17} className="text-[#bf0000]" />
              {copy(locale, '人数', 'Guests')}
            </span>
            <input
              data-booking-field="guests"
              type="number"
              min="1"
              max="20"
              defaultValue={form.guests}
              onChange={(event) => onChange('guests', event.target.value)}
              className="min-h-12 w-full min-w-0 rounded-[8px] border border-[#ded6d1] bg-[#f8f5f2] px-3 text-base font-medium text-[#2b2b2b]"
              required
            />
          </label>

          <label className="grid min-w-0 gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#2b2b2b]">
              <UserRound size={17} className="text-[#bf0000]" />
              {copy(locale, 'お名前', 'Name')}
            </span>
            <input
              data-booking-field="name"
              type="text"
              defaultValue={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              className="min-h-12 w-full min-w-0 rounded-[8px] border border-[#ded6d1] bg-[#f8f5f2] px-3 text-base font-medium text-[#2b2b2b]"
              placeholder={copy(locale, '例: 山田 太郎', 'Example: Taro Yamada')}
              required
            />
          </label>

          <label className="grid min-w-0 gap-2 sm:col-span-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#2b2b2b]">
              <MessageCircleMore size={17} className="text-[#bf0000]" />
              {copy(locale, '連絡先', 'Contact')}
            </span>
            <input
              data-booking-field="contact"
              type="text"
              defaultValue={form.contact}
              onChange={(event) => onChange('contact', event.target.value)}
              className="min-h-12 w-full min-w-0 rounded-[8px] border border-[#ded6d1] bg-[#f8f5f2] px-3 text-base font-medium text-[#2b2b2b]"
              placeholder={copy(locale, '電話番号またはメール', 'Phone number or email')}
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#bf0000] px-4 text-base font-semibold text-white hover:bg-[#a40000]"
        >
          <Send size={18} />
          {copy(locale, '予約内容を確認', 'Review request')}
        </button>
      </form>

      <aside className="rounded-[12px] border border-[#eaded8] bg-[#fff7f7] p-5 text-[#2b2b2b] shadow-sm">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#bf0000]">
          <CalendarCheck size={18} />
          {copy(locale, '予約内容', 'Request summary')}
        </p>
        <h3 className="mt-2 text-2xl font-semibold leading-snug text-[#2b2b2b]">
          {copy(locale, 'お食事予約', 'Meal reservation')}
        </h3>
        <div className="mt-4 grid gap-2 text-sm">
          <BookingSummaryRow field="date" label={copy(locale, '希望日', 'Date')} value={form.date || '-'} />
          <BookingSummaryRow field="time" label={copy(locale, '時間', 'Time')} value={form.time || '-'} />
          <BookingSummaryRow
            field="guests"
            label={copy(locale, '人数', 'Guests')}
            value={form.guests ? `${form.guests}${copy(locale, '名', '')}` : '-'}
            suffix={copy(locale, '名', '')}
          />
          <BookingSummaryRow field="name" label={copy(locale, 'お名前', 'Name')} value={form.name || '-'} />
          <BookingSummaryRow field="contact" label={copy(locale, '連絡先', 'Contact')} value={form.contact || '-'} />
        </div>
        <div
          className="booking-confirmation mt-4 rounded-[8px] px-3 py-3 text-sm font-black"
          data-booking-confirmation
          data-status={submitted ? 'submitted' : 'pending'}
        >
          <span data-booking-submitted-text>
            {copy(
              locale,
              '予約リクエスト内容を確認しました。実運用ではここから店舗へ送信します。',
              'Request details are ready. In production, this would send to the shop.',
            )}
          </span>
          <span data-booking-pending-text>
            {copy(locale, '入力後、内容確認を押してください。', 'Fill the form and review the request.')}
          </span>
        </div>
      </aside>
    </div>
  );
}

function BookingSummaryRow({
  label,
  value,
  field,
  suffix = '',
}: {
  label: string;
  value: string;
  field?: keyof BookingFormState;
  suffix?: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#eaded8] bg-white px-3 py-2">
      <p className="text-xs font-black text-[#666666]">{label}</p>
      <p
        className="mt-1 break-words font-black text-[#2b2b2b]"
        data-booking-summary={field}
        data-booking-empty="-"
        data-booking-suffix={suffix}
      >
        {value}
      </p>
    </div>
  );
}

function FeatureCard({
  card,
  locale,
  active,
  href,
  onClick,
}: {
  card: (typeof cards)[number];
  locale: Locale;
  active: boolean;
  href: string;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const Icon = card.icon;

  return (
    <a
      href={href}
      onClick={onClick}
      data-guide-card={card.id}
      data-current={active ? 'true' : 'false'}
      className={`group min-h-[132px] rounded-[12px] border bg-white p-4 text-left text-[#2b2b2b] shadow-[0_8px_22px_rgb(109_73_52_/_7%)] transition sm:min-h-[152px] ${
        active
          ? 'border-[#bf0000]/35 ring-1 ring-[#bf0000]/20'
          : 'border-[#ded6d1] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgb(191_0_0_/_10%)]'
      }`}
    >
      <span className="mx-auto grid h-[52px] w-[52px] place-items-center rounded-[10px] bg-[#fff2f2] text-[#bf0000] sm:h-16 sm:w-16">
        <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.8} />
      </span>
      <span className="mt-3 block text-center text-[1rem] font-semibold leading-tight tracking-normal [word-break:keep-all] sm:mt-4 sm:text-xl">
        {copy(locale, card.title_ja, card.title_en)}
      </span>
      <span className="mx-auto mt-2 block max-w-[9.5rem] text-center text-[0.75rem] font-medium leading-5 text-[#666666] [word-break:keep-all] sm:max-w-none sm:text-sm sm:leading-6">
        {copy(locale, card.body_ja, card.body_en)}
      </span>
    </a>
  );
}

function HeroSignal({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[8px] border border-[#eaded8] bg-white/94 px-3 py-2 shadow-[0_8px_20px_rgb(109_73_52_/_12%)] backdrop-blur">
      <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#bf0000]">
        <Icon size={14} />
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-[#2b2b2b]">{value}</p>
    </div>
  );
}

function WeatherSummaryBar({
  locale,
  weatherState,
  isRefreshing,
  onRefresh,
}: {
  locale: Locale;
  weatherState: WeatherState;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  const weather = weatherState.status === 'success' ? weatherState.weather : undefined;
  const icon = weather ? getWeatherEmoji(weather) : weatherState.status === 'error' ? 'rain' : 'cloud';
  const Icon = getWeatherSignalIcon(icon);
  const weatherCondition = weather
    ? getWeatherLabel(weather, locale)
    : weatherState.status === 'error'
      ? copy(locale, '天気を取得できません', 'Weather unavailable')
      : copy(locale, '天気確認中', 'Checking weather');
  const weatherTemperature = weather ? `${weather.temperature.toFixed(1)}°` : '--°';
  const weatherDetail = weather ? formatWeatherTime(weather.time, locale) : copy(locale, '金木町の天気', 'Kanagi weather');

  return (
    <section className="mx-3 mt-4 overflow-hidden rounded-[12px] border border-[#ded6d1] bg-white shadow-[0_12px_28px_rgb(109_73_52_/_8%)] sm:mx-4">
      <div className="grid grid-cols-1 min-[390px]:grid-cols-[minmax(0,1.22fr)_minmax(7.7rem,0.78fr)]">
        <div className="min-w-0 border-b border-[#ded6d1] px-4 py-3.5 min-[390px]:border-b-0 min-[390px]:border-r sm:px-5 sm:py-4">
          <p className="flex min-w-0 items-center gap-1.5 text-[0.7rem] font-bold leading-4 text-[#bf0000] sm:text-xs">
            <Clock className="shrink-0" size={14} strokeWidth={2.1} />
            <span className="truncate">{copy(locale, '本日の営業時間', "Today's Hours")}</span>
          </p>
          <p className="mt-1 whitespace-nowrap text-[1.18rem] font-black leading-none tracking-normal text-[#2b2b2b] sm:text-[1.55rem]">
            09:00 〜 17:00
          </p>
          <p className="mt-1 whitespace-nowrap text-[0.6rem] font-semibold leading-4 text-[#666666] sm:text-[0.7rem]">
            {copy(locale, '※変更の場合があります。', 'Hours may change.')}
          </p>
        </div>
        <div className="relative flex min-w-0 items-center gap-1.5 bg-[#f8f5f2] px-2 py-3.5 sm:px-3 sm:py-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white text-[#2b2b2b] shadow-[0_6px_16px_rgb(109_73_52_/_8%)] sm:h-9 sm:w-9">
            <Icon size={22} strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate pr-5 text-[0.62rem] font-bold leading-4 text-[#666666] sm:text-[0.68rem]">
              {weatherCondition}
            </p>
            <p className="whitespace-nowrap text-[1.18rem] font-black leading-none text-[#2b2b2b] sm:text-[1.45rem]">
              {weatherTemperature}
            </p>
            <p className="mt-0.5 truncate text-[0.54rem] font-semibold leading-3 text-[#666666] sm:text-[0.62rem]">
              {weatherDetail}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="absolute right-1.5 top-1.5 grid h-5 w-5 shrink-0 place-items-center rounded-[7px] border border-[#ded6d1] bg-white text-[#bf0000] sm:h-6 sm:w-6"
            aria-label={copy(locale, '天気を更新', 'Refresh weather')}
            disabled={isRefreshing}
          >
            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={10} />
          </button>
        </div>
      </div>
      <div className="flex min-h-13 items-center justify-between gap-3 border-t border-[#ded6d1] bg-[#fdf7f5] px-4 py-3 text-[#bf0000] sm:min-h-14 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays className="shrink-0" size={24} strokeWidth={2.1} />
          <span className="truncate text-[0.95rem] font-bold tracking-normal sm:text-base">
            {copy(locale, 'イベントカレンダーを見る', 'View event calendar')}
          </span>
        </div>
        <ChevronRight className="shrink-0" size={21} strokeWidth={2.4} />
      </div>
    </section>
  );
}

function WeatherPanel({
  locale,
  weatherState,
  isRefreshing,
  onRefresh,
  routesHref,
  onOpenRoutes,
}: {
  locale: Locale;
  weatherState: WeatherState;
  isRefreshing: boolean;
  onRefresh: () => void;
  routesHref: string;
  onOpenRoutes: (event: MouseEvent<HTMLAnchorElement>) => void;
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
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#bf0000] px-4 py-3 text-sm font-semibold text-white hover:bg-[#a40000]"
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
      <a
        href={routesHref}
        onClick={onOpenRoutes}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#bf0000] px-4 py-3 text-sm font-black text-white"
      >
        <Route size={18} />
        {copy(locale, '天気に合う散策を見る', 'Show weather-aware routes')}
      </a>
    </section>
  );
}

function RoutePreviewCard({
  locale,
  route,
  weatherReason,
  routesHref,
  onOpenRoutes,
}: {
  locale: Locale;
  route?: (typeof routes)[number];
  weatherReason: string;
  routesHref: string;
  onOpenRoutes: (event: MouseEvent<HTMLAnchorElement>) => void;
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
          <a
            href={routesHref}
            onClick={onOpenRoutes}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-[#bf0000] px-4 text-sm font-semibold text-white hover:bg-[#a40000]"
          >
            {copy(locale, 'ルートを見る', 'View route')}
            <ChevronRight size={18} />
          </a>
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
      <div className="mt-4 rounded-[8px] border border-[#eaded8] bg-[#fff7f7] p-3 text-[#2b2b2b]">
        <p className="text-xs font-black text-[#bf0000]">{copy(locale, '最有力候補', 'Top pick')}</p>
        <p className="mt-1 text-lg font-black leading-snug text-[#2b2b2b]">
          {topDiagnosis ? copy(locale, topDiagnosis.product.name_ja, topDiagnosis.product.name_en) : '-'}
        </p>
        <div className="mt-3">
          <MatchMeter locale={locale} percent={matchPercent} />
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
  const trackClass = tone === 'dark' ? 'bg-[#f0ded8]' : 'bg-[#eaded8]';
  const labelClass = tone === 'dark' ? 'text-[#666666]' : 'text-[#666666]';
  const valueClass = tone === 'dark' ? 'text-[#2b2b2b]' : 'text-[#2b2b2b]';

  return (
    <div className={compact ? 'w-24' : 'w-full min-w-[9rem]'}>
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs font-black ${labelClass}`}>{copy(locale, '一致度', 'Match')}</span>
        <span className={`text-sm font-black ${valueClass}`}>{percent}%</span>
      </div>
      <div className={`mt-1 h-2 overflow-hidden rounded-full ${trackClass}`} aria-hidden="true">
        <div className="h-full rounded-full bg-[#bf0000]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function DiagnosisResultCard({ result, index, locale }: { result: DiagnosisResult; index: number; locale: Locale }) {
  const narrative = getProductNarrative(result.product.id);

  return (
    <article className="rounded-[8px] border border-[#eaded8] bg-white p-3">
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
            <span className="rounded-full bg-[#fff2f2] px-2 py-1 text-xs font-black text-[#bf0000]">{result.score}</span>
          </div>
          <p className="mt-1 text-xs font-bold text-[#bf0000]">
            {copy(locale, result.product.priceLabel_ja, result.product.priceLabel_en)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#555555]">{copy(locale, result.reason_ja, result.reason_en)}</p>
      <p className="mt-3 rounded-[8px] bg-[#f8f5f2] px-3 py-2 text-xs font-bold leading-5 text-[#555555]">
        {copy(locale, narrative.lead_ja, narrative.lead_en)}
      </p>
    </article>
  );
}

function FilterRail<T extends string>({
  items,
  active,
  locale,
  getHref,
  onPick,
}: {
  items: { value: T; icon: LucideIcon; ja: string; en: string }[];
  active: T;
  locale: Locale;
  getHref: (value: T) => string;
  onPick: (event: MouseEvent<HTMLAnchorElement>, value: T) => void;
}) {
  return (
    <div className="-mx-1 mb-1 flex gap-2 overflow-x-auto px-1 pb-2" role="tablist">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.value;

        return (
          <a
            key={item.value}
            href={getHref(item.value)}
            onClick={(event) => onPick(event, item.value)}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${
              isActive
                ? 'border-[#bf0000] bg-[#bf0000] text-white'
                : 'border-[#e5e5e7] bg-white text-[#515154] hover:border-[#d2d2d7] hover:bg-[#f5f5f7]'
            }`}
            aria-pressed={isActive}
          >
            <Icon size={17} />
            {copy(locale, item.ja, item.en)}
          </a>
        );
      })}
    </div>
  );
}

function SpotCandidateGrid({ locale, spots }: { locale: Locale; spots: NearbySpot[] }) {
  return (
    <section className="mb-5 rounded-[24px] border border-[#e5e5e7] bg-[#f5f5f7] p-4">
      <div>
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#a24f3d]">
            <MapPinned size={18} />
            {copy(locale, '周辺スポット候補', 'Nearby spot candidates')}
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-[#1d1d1f]">
            {copy(locale, 'KADOKKOから組み合わせる場所', 'Places to combine with KADOKKO')}
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-[#6e6e73]">
            {copy(
              locale,
              '公式観光情報を確認して、短時間・雨の日・文学深掘り・公園散策の候補を追加しました。',
              'Added source-checked options for short walks, rainy days, literary depth, and park outings.',
            )}
          </p>
        </div>
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
    <article className="rounded-[20px] border border-[#e5e5e7] bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f5f5f7] text-[#a24f3d]">
          <Icon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-semibold leading-snug text-[#1d1d1f]">
            {copy(locale, spot.name_ja, spot.name_en)}
          </h4>
          <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-[#6e6e73]">
            {copy(locale, spot.access_ja, spot.access_en)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-[#515154]">
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
          <span key={`${spot.id}-${tag}`} className="rounded-full bg-[#f5f5f7] px-3 py-1 text-xs font-semibold text-[#515154]">
            {formatNearbyTag(tag, locale)}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={spot.source_url}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-10 items-center justify-center gap-2 rounded-[14px] border border-[#e5e5e7] bg-white px-3 text-sm font-semibold text-[#1d1d1f]"
        >
          <ExternalLink size={16} />
          {copy(locale, '公式情報', 'Source')}
        </a>
        <a
          href={spot.google_maps_url}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-10 items-center justify-center gap-2 rounded-[8px] bg-[#bf0000] px-3 text-sm font-semibold text-white"
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
      <div className="rounded-[24px] border border-[#e5e5e7] bg-[#f5f5f7] p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#a24f3d]">
          <CloudSun size={18} />
          {copy(locale, '今日の判断', 'Today signal')}
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-[#515154]">
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
          <p className="mt-2 text-lg font-semibold leading-snug text-[#1d1d1f]">
            {copy(locale, route.title_ja, route.title_en)}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onResetFilter}
        className="min-h-14 rounded-[20px] border border-[#e5e5e7] bg-white px-5 text-sm font-semibold text-[#1d1d1f] lg:min-w-36"
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
    <div className="flex gap-3 rounded-[14px] border border-[#e5e5e7] bg-white px-3 py-2">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f5f5f7] text-[#a24f3d]">
        <Icon size={16} />
      </span>
      <div>
        <p className="text-xs font-semibold text-[#6e6e73]">{label}</p>
        <p className="font-medium text-[#1d1d1f]">{value}</p>
      </div>
    </div>
  );
}

function MiniNote({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#eaded8] bg-white px-3 py-3">
      <p className="flex items-center gap-1.5 text-xs font-black text-[#666666]">
        <Icon size={14} />
        {label}
      </p>
      <p className="mt-1 text-sm font-black leading-5 text-[#2b2b2b]">{value}</p>
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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a24f3d]">
        {copy(locale, eyebrowJa, eyebrowEn)}
      </p>
      <h2 className="mt-1 text-3xl font-semibold tracking-normal text-[#1d1d1f]">
        {copy(locale, titleJa, titleEn)}
      </h2>
      {descriptionJa && descriptionEn && (
        <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[#6e6e73]">
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
      <legend className="text-base font-semibold text-[#1d1d1f]">{label}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPick(option.value)}
            className={`min-h-12 rounded-[14px] border px-3 py-2 text-left text-sm font-semibold leading-5 ${
              value === option.value
                ? 'border-[#bf0000] bg-[#bf0000] text-white'
                : 'border-[#e5e5e7] bg-[#f5f5f7] text-[#515154] hover:border-[#d2d2d7]'
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
    <div className="grid grid-cols-[7rem_1fr] gap-3 rounded-[14px] bg-white px-3 py-2">
      <dt className="font-semibold text-[#6e6e73]">{label}</dt>
      <dd className="font-medium text-[#1d1d1f]">{value || '-'}</dd>
    </div>
  );
}

function MobileDock({
  activeCard,
  locale,
  getHref,
  onPick,
}: {
  activeCard: CardId;
  locale: Locale;
  getHref: (card: CardId) => string;
  onPick: (event: MouseEvent<HTMLAnchorElement>, card: CardId) => void;
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
      className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-[#e5e5e7] bg-white/92 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgb(0_0_0_/_8%)] backdrop-blur lg:hidden"
    >
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeCard === item.id;

          return (
            <a
              key={item.id}
              href={getHref(item.id)}
              onClick={(event) => onPick(event, item.id)}
              data-mobile-dock-card={item.id}
              data-current={active ? 'true' : 'false'}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-semibold ${
                active ? 'bg-[#f5f5f7] text-[#1d1d1f]' : 'text-[#6e6e73]'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.6 : 2} />
              <span>{copy(locale, item.ja, item.en)}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
