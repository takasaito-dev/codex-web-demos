import type { GuideRoute, Locale } from '@/types/guide';

const KANAGI_LATITUDE = 40.902979;
const KANAGI_LONGITUDE = 140.456624;

const openMeteoUrl = new URL('https://api.open-meteo.com/v1/forecast');
openMeteoUrl.searchParams.set('latitude', String(KANAGI_LATITUDE));
openMeteoUrl.searchParams.set('longitude', String(KANAGI_LONGITUDE));
openMeteoUrl.searchParams.set('current_weather', 'true');
openMeteoUrl.searchParams.set('timezone', 'Asia/Tokyo');

export const KANAGI_WEATHER_API_URL = openMeteoUrl.toString();

export type WeatherMood = 'clear' | 'cloudy' | 'rain' | 'snow' | 'cold' | 'hot' | 'wind';

export type WeatherSnapshot = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitation: number;
  rain: number;
  snowfall: number;
  weatherCode: number;
  cloudCover: number;
  windSpeed: number;
};

type OpenMeteoResponse = {
  current_weather?: {
    time?: string;
    temperature?: number;
    windspeed?: number;
    weathercode?: number;
  };
};

export async function fetchKanagiWeather(signal?: AbortSignal): Promise<WeatherSnapshot> {
  const response = await fetch(KANAGI_WEATHER_API_URL, {
    signal,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const current = data.current_weather;

  if (!current || current.temperature === undefined || current.weathercode === undefined) {
    throw new Error('Weather response did not include current conditions.');
  }

  const cloudCoverByCode: Record<number, number> = {
    0: 0,
    1: 25,
    2: 60,
    3: 100,
  };

  return {
    time: current.time ?? '',
    temperature: current.temperature,
    apparentTemperature: current.temperature,
    precipitation: 0,
    rain: 0,
    snowfall: 0,
    weatherCode: current.weathercode,
    cloudCover: cloudCoverByCode[current.weathercode] ?? 0,
    windSpeed: current.windspeed ?? 0,
  };
}

export function getWeatherMood(weather: WeatherSnapshot): WeatherMood {
  if (weather.snowfall > 0 || [71, 73, 75, 77, 85, 86].includes(weather.weatherCode)) {
    return 'snow';
  }

  if (
    weather.precipitation > 0 ||
    weather.rain > 0 ||
    [
      51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
    ].includes(weather.weatherCode)
  ) {
    return 'rain';
  }

  if (weather.windSpeed >= 30) {
    return 'wind';
  }

  if (weather.apparentTemperature <= 5) {
    return 'cold';
  }

  if (weather.temperature >= 28) {
    return 'hot';
  }

  if ([0, 1].includes(weather.weatherCode)) {
    return 'clear';
  }

  return 'cloudy';
}

export function getWeatherLabel(weather: WeatherSnapshot, locale: Locale) {
  const labels: Record<number, { ja: string; en: string }> = {
    0: { ja: '快晴', en: 'Clear' },
    1: { ja: '晴れ', en: 'Mainly clear' },
    2: { ja: '一部くもり', en: 'Partly cloudy' },
    3: { ja: 'くもり', en: 'Overcast' },
    45: { ja: '霧', en: 'Fog' },
    48: { ja: '着氷性の霧', en: 'Depositing rime fog' },
    51: { ja: '弱い霧雨', en: 'Light drizzle' },
    53: { ja: '霧雨', en: 'Drizzle' },
    55: { ja: '強い霧雨', en: 'Dense drizzle' },
    61: { ja: '弱い雨', en: 'Light rain' },
    63: { ja: '雨', en: 'Rain' },
    65: { ja: '強い雨', en: 'Heavy rain' },
    71: { ja: '弱い雪', en: 'Light snow' },
    73: { ja: '雪', en: 'Snow' },
    75: { ja: '強い雪', en: 'Heavy snow' },
    80: { ja: 'にわか雨', en: 'Rain showers' },
    81: { ja: '強いにわか雨', en: 'Heavy showers' },
    82: { ja: '激しいにわか雨', en: 'Violent showers' },
    85: { ja: 'にわか雪', en: 'Snow showers' },
    86: { ja: '強いにわか雪', en: 'Heavy snow showers' },
    95: { ja: '雷雨', en: 'Thunderstorm' },
  };

  const label = labels[weather.weatherCode] ?? { ja: '天気情報', en: 'Weather' };
  return locale === 'ja' ? label.ja : label.en;
}

export function getWeatherEmoji(weather: WeatherSnapshot) {
  const mood = getWeatherMood(weather);

  if (mood === 'snow') return 'snow';
  if (mood === 'rain') return 'rain';
  if (mood === 'hot') return 'hot';
  if (mood === 'cold') return 'cold';
  if (mood === 'wind') return 'wind';
  if (mood === 'clear') return 'sun';
  return 'cloud';
}

export function getWeatherAdvice(weather: WeatherSnapshot, locale: Locale) {
  const mood = getWeatherMood(weather);

  const advice: Record<WeatherMood, { ja: string; en: string }> = {
    clear: {
      ja: '外歩きしやすい天気です。斜陽館周辺まで少し足を伸ばすルートも選びやすい日です。',
      en: 'Good weather for walking. A route toward the Shayokan area should be easy to choose.',
    },
    cloudy: {
      ja: '歩きやすいですが、空模様を見ながら短めルートも選べる状態です。',
      en: 'Comfortable for walking, while keeping a shorter route as a backup.',
    },
    rain: {
      ja: '雨寄りの天気です。店内で商品を見て、近場だけ歩くルートがおすすめです。',
      en: 'Rain is likely. Browse indoors and keep the walk short.',
    },
    snow: {
      ja: '雪に注意してください。無理に歩かず、店内中心・短時間の案内を優先します。',
      en: 'Watch for snow. Prefer a short indoor-focused visit.',
    },
    cold: {
      ja: '体感温度が低めです。温かい休憩と短め散策を組み合わせるのがおすすめです。',
      en: 'It feels cold. Pair a warm break with a short walk.',
    },
    hot: {
      ja: '暑さに注意してください。長く歩きすぎず、休憩しながら回るのがおすすめです。',
      en: 'It is warm. Avoid walking too long and include a break.',
    },
    wind: {
      ja: '風が強めです。持ち歩きやすい商品と短めの散策を優先します。',
      en: 'Wind is strong. Choose easy-to-carry items and a shorter route.',
    },
  };

  return locale === 'ja' ? advice[mood].ja : advice[mood].en;
}

export function rankRoutesByWeather(routes: GuideRoute[], weather?: WeatherSnapshot) {
  if (!weather) {
    return routes.map((route) => ({
      route,
      weatherScore: 0,
      isWeatherPick: false,
    }));
  }

  const mood = getWeatherMood(weather);

  return routes
    .map((route) => {
      let weatherScore = 0;

      if (['rain', 'snow', 'cold', 'wind'].includes(mood)) {
        if (route.id === 'rain-winter') weatherScore += 30;
        if (route.id === 'quick-15') weatherScore += 12;
        if (route.id === 'classic-30') weatherScore += 8;
      }

      if (mood === 'hot') {
        if (route.id === 'quick-15') weatherScore += 20;
        if (route.id === 'classic-30') weatherScore += 12;
        if (route.id === 'rain-winter') weatherScore += 10;
      }

      if (['clear', 'cloudy'].includes(mood)) {
        if (route.id === 'heritage-60') weatherScore += 20;
        if (route.id === 'deep-90') weatherScore += 14;
        if (route.id === 'classic-30') weatherScore += 8;
      }

      return {
        route,
        weatherScore,
        isWeatherPick: false,
      };
    })
    .sort((a, b) => b.weatherScore - a.weatherScore || a.route.duration_minutes - b.route.duration_minutes)
    .map((item, index) => ({
      ...item,
      isWeatherPick: index === 0 && item.weatherScore > 0,
    }));
}

export function getRouteWeatherReason(routeId: string, weather: WeatherSnapshot | undefined, locale: Locale) {
  if (!weather) {
    return '';
  }

  const mood = getWeatherMood(weather);

  if (routeId === 'rain-winter' && ['rain', 'snow', 'cold', 'wind'].includes(mood)) {
    return locale === 'ja'
      ? '今の天気では、店内中心で短く動けるこのルートを優先しています。'
      : 'Current conditions favor this short indoor-focused route.';
  }

  if (routeId === 'quick-15' && mood === 'hot') {
    return locale === 'ja'
      ? '暑さを避けるため、短時間で戻れるルートを優先しています。'
      : 'A short route is prioritized to avoid walking too long in the heat.';
  }

  if (routeId === 'heritage-60' && ['clear', 'cloudy'].includes(mood)) {
    return locale === 'ja'
      ? '歩きやすい天気なので、斜陽館周辺まで見やすいルートを優先しています。'
      : 'The weather is suitable for walking, so a Shayokan-area route is prioritized.';
  }

  return '';
}
