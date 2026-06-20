import type { GuideRoute } from '@/types/guide';

export const routes: GuideRoute[] = [
  {
    id: 'quick-15',
    title_ja: '15分だけの店先さんぽ',
    title_en: '15-minute quick stop',
    duration_minutes: 15,
    situation: ['次の予定まで15分', 'おみやげだけ買いたい'],
    description_ja: 'KADOKKOで軽いおみやげを選び、近くを少し歩いて金木町の空気を感じる短時間ルートです。',
    description_en:
      'Pick up a light souvenir at KADOKKO and take a short walk nearby to feel the local town atmosphere.',
    spots: [
      { name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 0 },
      { name_ja: '店舗周辺', name_en: 'Around the shop', walk_minutes: 3 },
    ],
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=KADOKKO%20%E9%87%91%E6%9C%A8%E7%94%BA',
    note_ja: '店舗周辺の歩道状況や営業時間は当日確認してください。',
    note_en: 'Check walking conditions and opening hours on the day.',
    recommended_product_ids: ['madeleine', 'blueberry-muffin', 'hakkoda-coffee'],
  },
  {
    id: 'classic-30',
    title_ja: '30分の金木町ミニ散策',
    title_en: '30-minute Kanagi mini walk',
    duration_minutes: 30,
    situation: ['30分だけ時間がある', '休憩したい'],
    description_ja: 'KADOKKOで休憩用の甘いものを選び、近場の見どころへ寄る想定の短い散策です。',
    description_en:
      'Choose a snack or drink at KADOKKO and make a compact visit to nearby points of interest.',
    spots: [
      { name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 0 },
      { name_ja: '斜陽館周辺', name_en: 'Around Shayokan', walk_minutes: 8 },
    ],
    google_maps_url:
      'https://www.google.com/maps/dir/?api=1&origin=KADOKKO%20%E9%87%91%E6%9C%A8%E7%94%BA&destination=%E6%96%9C%E9%99%BD%E9%A4%A8',
    note_ja: '徒歩時間は仮です。冬道や雨の日は余裕を見てください。',
    note_en: 'Walking time is a placeholder. Allow extra time in rain or winter conditions.',
    recommended_product_ids: ['blueberry-muffin', 'hakkoda-coffee'],
  },
  {
    id: 'heritage-60',
    title_ja: '1時間の文学とおみやげ',
    title_en: 'One hour of literature and souvenirs',
    duration_minutes: 60,
    situation: ['1時間ある', '斜陽館周辺も見たい'],
    description_ja: '斜陽館周辺を見てから、KADOKKOで金木町らしいおみやげを選ぶルートです。',
    description_en:
      'A route for visiting the Shayokan area, then returning to KADOKKO to choose Kanagi-style souvenirs.',
    spots: [
      { name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 0 },
      { name_ja: '斜陽館周辺', name_en: 'Around Shayokan', walk_minutes: 8 },
      { name_ja: 'KADOKKOでおみやげ選び', name_en: 'Souvenir time at KADOKKO', walk_minutes: 8 },
    ],
    google_maps_url:
      'https://www.google.com/maps/dir/?api=1&origin=KADOKKO%20%E9%87%91%E6%9C%A8%E7%94%BA&destination=%E6%96%9C%E9%99%BD%E9%A4%A8',
    note_ja: '施設の開館日・料金は公式情報を確認してください。',
    note_en: 'Check official opening days and fees for facilities.',
    recommended_product_ids: ['kanro-ume', 'nitabo-soba'],
  },
  {
    id: 'rain-winter',
    title_ja: '雨・冬の日の短めルート',
    title_en: 'Short route for rain or winter',
    duration_minutes: 30,
    situation: ['雨の日', '冬の日', '休憩したい'],
    description_ja: '長く歩かず、店内で商品説明を見ながら選ぶことを重視したルートです。',
    description_en:
      'A low-walking plan focused on browsing indoors and choosing items with clear product explanations.',
    spots: [
      { name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 0 },
      { name_ja: '近隣スポットは天候次第', name_en: 'Nearby spots depending on weather', walk_minutes: null },
    ],
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=KADOKKO%20%E9%87%91%E6%9C%A8%E7%94%BA',
    note_ja: '足元が悪い日は、無理に散策せず店内滞在を中心にしてください。',
    note_en: 'On slippery days, prioritize staying indoors over walking.',
    recommended_product_ids: ['hakkoda-coffee', 'madeleine', 'seasonal-gift'],
  },
  {
    id: 'deep-90',
    title_ja: '90分の金木町ゆっくり回遊',
    title_en: '90-minute relaxed Kanagi walk',
    duration_minutes: 90,
    situation: ['90分ある', '斜陽館周辺も見たい', '旅の記念にしたい'],
    description_ja: '金木町の雰囲気をゆっくり楽しみ、最後にKADOKKOで記念になる商品を選ぶ想定です。',
    description_en:
      'A relaxed route to enjoy Kanagi’s atmosphere and end with a memorable souvenir at KADOKKO.',
    spots: [
      { name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 0 },
      { name_ja: '斜陽館周辺', name_en: 'Around Shayokan', walk_minutes: 8 },
      { name_ja: '津軽三味線会館周辺', name_en: 'Around Tsugaru Shamisen Hall', walk_minutes: 4 },
      { name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 10 },
    ],
    google_maps_url:
      'https://www.google.com/maps/dir/?api=1&origin=KADOKKO%20%E9%87%91%E6%9C%A8%E7%94%BA&destination=%E6%B4%A5%E8%BB%BD%E4%B8%89%E5%91%B3%E7%B7%9A%E4%BC%9A%E9%A4%A8',
    note_ja: '見学時間や営業状況により調整してください。',
    note_en: 'Adjust depending on facility time and shop conditions.',
    recommended_product_ids: ['kanro-ume', 'nitabo-soba', 'seasonal-gift'],
  },
];

