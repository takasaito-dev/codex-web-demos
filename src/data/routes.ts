import type { GuideRoute } from '@/types/guide';

export const routes: GuideRoute[] = [
  {
    id: 'quick-15',
    title_ja: '15分だけの店先さんぽ',
    title_en: '15-minute quick stop',
    duration_minutes: 15,
    situation: ['次の予定まで15分', 'おみやげだけ買いたい'],
    description_ja: 'KADOKKOで軽いおみやげを選び、雲祥寺や思い出広場など近場を少し歩く短時間ルートです。',
    description_en:
      'Pick up a light souvenir at KADOKKO and take a short walk to nearby stops such as Unshoji or Omoide Hiroba.',
    spots: [
      { spot_id: 'kadokko', name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 0 },
      { spot_id: 'unshoji', name_ja: '雲祥寺', name_en: 'Unshoji Temple', walk_minutes: 2 },
      { spot_id: 'omoide-hiroba', name_ja: '太宰治 思い出広場', name_en: 'Dazai Osamu Omoide Hiroba', walk_minutes: 6 },
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
    description_ja: 'KADOKKOで休憩用の甘いものを選び、斜陽館周辺と物産館へ寄る想定の短い散策です。',
    description_en:
      'Choose a snack or drink at KADOKKO and make a compact visit around Shayokan and the local product center.',
    spots: [
      { spot_id: 'kadokko', name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 0 },
      { spot_id: 'shayokan', name_ja: '太宰治記念館「斜陽館」', name_en: 'Shayokan', walk_minutes: 5 },
      { spot_id: 'sanchoku-meros', name_ja: '金木観光物産館「産直メロス」', name_en: 'Sanchoku Meros', walk_minutes: 2 },
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
    description_ja: '太宰ゆかりの家と斜陽館周辺を見てから、KADOKKOで金木町らしいおみやげを選ぶルートです。',
    description_en:
      'A route for visiting Dazai-related houses around Shayokan, then returning to KADOKKO for Kanagi-style souvenirs.',
    spots: [
      { spot_id: 'kadokko', name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 0 },
      { spot_id: 'sojourn-house', name_ja: '太宰治疎開の家', name_en: 'Dazai Osamu Sojourn House', walk_minutes: 7 },
      { spot_id: 'shayokan', name_ja: '太宰治記念館「斜陽館」', name_en: 'Shayokan', walk_minutes: 4 },
      { spot_id: 'shamisen-hall', name_ja: '津軽三味線会館', name_en: 'Tsugaru Shamisen Hall', walk_minutes: 2 },
      { spot_id: 'kadokko', name_ja: 'KADOKKOでおみやげ選び', name_en: 'Souvenir time at KADOKKO', walk_minutes: 10 },
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
    description_ja: '長く歩かず、KADOKKOと屋内スポットを中心に商品説明や展示を見ながら選ぶルートです。',
    description_en:
      'A low-walking plan focused on KADOKKO and indoor stops with product notes and exhibits.',
    spots: [
      { spot_id: 'kadokko', name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 0 },
      { spot_id: 'sanchoku-meros', name_ja: '金木観光物産館「産直メロス」', name_en: 'Sanchoku Meros', walk_minutes: 10 },
      { spot_id: 'shamisen-hall', name_ja: '津軽三味線会館', name_en: 'Tsugaru Shamisen Hall', walk_minutes: 2 },
      { spot_id: 'shayokan', name_ja: '太宰治記念館「斜陽館」', name_en: 'Shayokan', walk_minutes: 2 },
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
    description_ja: '太宰ゆかりの寺や建物をつなぎ、最後にKADOKKOで記念になる商品を選ぶ想定です。',
    description_en:
      'A relaxed route connecting Dazai-related temples and buildings, ending with a memorable souvenir at KADOKKO.',
    spots: [
      { spot_id: 'kadokko', name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 0 },
      { spot_id: 'unshoji', name_ja: '雲祥寺', name_en: 'Unshoji Temple', walk_minutes: 2 },
      { spot_id: 'nandaiji', name_ja: '南台寺', name_en: 'Nandaiji Temple', walk_minutes: 8 },
      { spot_id: 'sojourn-house', name_ja: '太宰治疎開の家', name_en: 'Dazai Osamu Sojourn House', walk_minutes: 8 },
      { spot_id: 'shayokan', name_ja: '太宰治記念館「斜陽館」', name_en: 'Shayokan', walk_minutes: 4 },
      { spot_id: 'kadokko', name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 5 },
    ],
    google_maps_url:
      'https://www.google.com/maps/dir/?api=1&origin=KADOKKO%20%E9%87%91%E6%9C%A8%E7%94%BA&destination=%E6%B4%A5%E8%BB%BD%E4%B8%89%E5%91%B3%E7%B7%9A%E4%BC%9A%E9%A4%A8',
    note_ja: '見学時間や営業状況により調整してください。',
    note_en: 'Adjust depending on facility time and shop conditions.',
    recommended_product_ids: ['kanro-ume', 'nitabo-soba', 'seasonal-gift'],
  },
  {
    id: 'park-120',
    title_ja: '芦野公園まで足を伸ばす半日手前ルート',
    title_en: 'Extended Ashino Park route',
    duration_minutes: 120,
    situation: ['2時間近くある', '晴れの日', '写真も撮りたい'],
    description_ja:
      '金木中心部の文学スポットを見たあと、芦野公園や赤い屋根の喫茶店「駅舎」まで足を伸ばす長めの候補です。',
    description_en:
      'A longer option that starts with central Kanagi literary stops, then extends toward Ashino Park and Cafe Ekisha.',
    spots: [
      { spot_id: 'kadokko', name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 0 },
      { spot_id: 'shayokan', name_ja: '太宰治記念館「斜陽館」', name_en: 'Shayokan', walk_minutes: 5 },
      { spot_id: 'sanchoku-meros', name_ja: '金木観光物産館「産直メロス」', name_en: 'Sanchoku Meros', walk_minutes: 2 },
      { spot_id: 'ashino-park', name_ja: '芦野公園', name_en: 'Ashino Park', walk_minutes: null },
      { spot_id: 'kissaten-ekisha', name_ja: '赤い屋根の喫茶店「駅舎」', name_en: 'Cafe Ekisha', walk_minutes: null },
    ],
    google_maps_url:
      'https://www.google.com/maps/dir/?api=1&origin=KADOKKO%20%E9%87%91%E6%9C%A8%E7%94%BA&destination=%E8%8A%A6%E9%87%8E%E5%85%AC%E5%9C%92',
    note_ja: '芦野公園方面は徒歩だけだと長めです。津軽鉄道や車での移動も含めて当日判断してください。',
    note_en: 'Ashino Park is longer by foot. Consider Tsugaru Railway or car transfer depending on the day.',
    recommended_product_ids: ['blueberry-muffin', 'hakkoda-coffee', 'seasonal-gift'],
  },
  {
    id: 'dazai-roots-75',
    title_ja: '太宰治ルーツ推し活コース',
    title_en: 'Dazai roots fan route',
    duration_minutes: 75,
    duration_label_ja: '時間に余裕がある方向け',
    duration_label_en: 'Flexible timing',
    placement: 'final',
    situation: ['太宰治に興味がある', '推し活したい', '旅の記念にしたい'],
    description_ja:
      'アニメや漫画をきっかけに太宰治へ興味を持った方にもおすすめの推し活コース。斜陽館、疎開の家、思い出広場をめぐり、文豪・太宰治の原点をたどります。',
    description_en:
      'Recommended for visitors who became interested in Dazai through anime or manga. Follow Dazai’s roots through Shayokan, the sojourn house, and Omoide Hiroba.',
    spots: [
      { spot_id: 'kadokko', name_ja: 'KADOKKO', name_en: 'KADOKKO', walk_minutes: 0 },
      { spot_id: 'shayokan', name_ja: '太宰治記念館「斜陽館」', name_en: 'Shayokan', walk_minutes: 5 },
      { spot_id: 'sojourn-house', name_ja: '太宰治疎開の家', name_en: 'Dazai Osamu Sojourn House', walk_minutes: 4 },
      { spot_id: 'omoide-hiroba', name_ja: '太宰治 思い出広場', name_en: 'Dazai Osamu Omoide Hiroba', walk_minutes: 6 },
      { spot_id: 'kadokko', name_ja: 'KADOKKOで記念のおみやげ選び', name_en: 'Souvenir time at KADOKKO', walk_minutes: 6 },
    ],
    google_maps_url:
      'https://www.google.com/maps/dir/?api=1&origin=KADOKKO%20%E9%87%91%E6%9C%A8%E7%94%BA&destination=%E5%A4%AA%E5%AE%B0%E6%B2%BB%20%E6%80%9D%E3%81%84%E5%87%BA%E5%BA%83%E5%A0%B4',
    note_ja: '施設の開館日・料金・見学可否は当日確認してください。時間に余裕があれば雲祥寺や南台寺も追加できます。',
    note_en:
      'Check opening days, fees, and visit availability on the day. Add Unshoji or Nandaiji if you have extra time.',
    recommended_product_ids: ['kanro-ume', 'hakkoda-coffee', 'seasonal-gift'],
  },
];
