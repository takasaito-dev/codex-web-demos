export type ProductNarrative = {
  lead_ja: string;
  lead_en: string;
  pairing_ja: string;
  pairing_en: string;
  staffQuestion_ja: string;
  staffQuestion_en: string;
  carryMood_ja: string;
  carryMood_en: string;
};

export type RouteNarrative = {
  bestFor_ja: string;
  bestFor_en: string;
  pace_ja: string;
  pace_en: string;
  finish_ja: string;
  finish_en: string;
};

export const productNarratives: Record<string, ProductNarrative> = {
  'kanro-ume': {
    lead_ja: '「金木らしい甘さ」を言葉にしやすく、県外の人にも渡しやすい主役候補です。',
    lead_en: 'A strong main pick when you want a sweet Kanagi story that is easy to explain.',
    pairing_ja: '八甲田の残雪コーヒーや焼き菓子と合わせると、甘味と休憩感がまとまります。',
    pairing_en: 'Pair it with Hakkoda coffee or baked sweets to make the gift feel complete.',
    staffQuestion_ja: '梅の風味が好きな方か、甘酸っぱい味が苦手でないかを確認すると安心です。',
    staffQuestion_en: 'Ask whether the recipient likes plum flavor and sweet-tart tastes.',
    carryMood_ja: '旅の記念、家族用、県外への手みやげに向きます。',
    carryMood_en: 'Good for memories, family, and gifts outside Aomori.',
  },
  'nitabo-soba': {
    lead_ja: '土地の名前と一緒に渡せるため、説明のあるおみやげとして印象に残ります。',
    lead_en: 'Memorable as a gift because it carries a local name and a story with it.',
    pairing_ja: '甘露梅やコーヒーを添えると、食事系と甘味系のバランスが取れます。',
    pairing_en: 'Add plum sweets or coffee for a balanced local-food plus treat set.',
    staffQuestion_ja: '持ち帰り時間と調理しやすさを聞くと、相手に合う渡し方を選べます。',
    staffQuestion_en: 'Check travel time and how easy it should be to prepare at home.',
    carryMood_ja: '職場、家族、金木町らしい話題づくりに向きます。',
    carryMood_en: 'Good for family, workplace, and a Kanagi conversation starter.',
  },
  madeleine: {
    lead_ja: '迷った時に外しにくい焼き菓子。休憩にも小分けの贈り物にも使いやすいです。',
    lead_en: 'A safe baked-sweet choice for breaks, small gifts, and easy sharing.',
    pairing_ja: '八甲田の残雪コーヒーと合わせると、店頭での休憩提案が自然です。',
    pairing_en: 'Pairs naturally with Hakkoda coffee for a small cafe-style break.',
    staffQuestion_ja: '個数、持ち歩き時間、すぐ食べるか持ち帰るかを確認すると選びやすくなります。',
    staffQuestion_en: 'Ask quantity, carry time, and whether it will be eaten now or later.',
    carryMood_ja: '友人、職場、自分用の軽いおやつに向きます。',
    carryMood_en: 'Good for friends, workplace sharing, and a light personal snack.',
  },
  'blueberry-muffin': {
    lead_ja: '散策前後のひと休みにちょうどよく、写真にも残しやすいカジュアルな一品です。',
    lead_en: 'A casual pick for a walking break and easy to remember as a trip snack.',
    pairing_ja: 'コーヒーと合わせると、その場で食べる満足感が上がります。',
    pairing_en: 'Add coffee when the goal is a satisfying snack on the spot.',
    staffQuestion_ja: '当日中に食べる予定かを聞くと、持ち歩きの不安を減らせます。',
    staffQuestion_en: 'Ask whether it will be eaten the same day to avoid carry concerns.',
    carryMood_ja: '自分用、友人との休憩、短時間の街歩きに向きます。',
    carryMood_en: 'Good for yourself, a friend break, and a short walk around town.',
  },
  'hakkoda-coffee': {
    lead_ja: '甘いものと組み合わせやすく、相手の好みが分かれにくい休憩系ギフトです。',
    lead_en: 'A break-time gift that pairs well with sweets and works for many recipients.',
    pairing_ja: 'マドレーヌ、ブルーベリーマフィン、甘露梅のどれとも合わせやすいです。',
    pairing_en: 'Pairs easily with madeleine, blueberry muffin, or plum sweets.',
    staffQuestion_ja: '豆・粉・ドリップなどの形状や、香りの好みを確認すると丁寧です。',
    staffQuestion_en: 'Check the preferred format and flavor profile if options are available.',
    carryMood_ja: '自宅用、職場、甘いものに添える贈り物に向きます。',
    carryMood_en: 'Good for home use, workplace, and pairing with a sweet gift.',
  },
  'seasonal-gift': {
    lead_ja: '予算や相手に合わせて組み立てられる、迷った時の相談しやすいセット候補です。',
    lead_en: 'A flexible set concept when you want the staff to help match budget and recipient.',
    pairing_ja: '日持ちするもの、甘いもの、金木らしいものを一つずつ入れるとまとまります。',
    pairing_en: 'Balance it with one shelf-stable item, one sweet item, and one Kanagi-style item.',
    staffQuestion_ja: '人数、渡す日、相手との関係性を伝えると、組み合わせを決めやすくなります。',
    staffQuestion_en: 'Tell staff the group size, gift date, and relationship to the recipient.',
    carryMood_ja: 'きちんと贈りたい時、県外の人、複数人へのおみやげに向きます。',
    carryMood_en: 'Good for proper gifts, visitors outside Aomori, and groups.',
  },
};

export const routeNarratives: Record<string, RouteNarrative> = {
  'quick-15': {
    bestFor_ja: '出発前に一つだけ買いたい人',
    bestFor_en: 'For visitors who need one quick pick before leaving',
    pace_ja: '歩く時間を短くし、店頭での選びやすさを優先します。',
    pace_en: 'Keeps walking short and prioritizes an easy in-store choice.',
    finish_ja: '軽い焼き菓子やコーヒーを選んで、次の予定へ移りやすい流れです。',
    finish_en: 'Finish with a light baked sweet or coffee before the next plan.',
  },
  'classic-30': {
    bestFor_ja: '少し歩いて、休憩もしたい人',
    bestFor_en: 'For a short walk plus a small break',
    pace_ja: '近場の見どころと休憩用のおやつを組み合わせます。',
    pace_en: 'Combines a nearby point of interest with a snack break.',
    finish_ja: 'マフィンやコーヒーを選ぶと、散策後の満足感が出ます。',
    finish_en: 'A muffin or coffee gives the short walk a clear finish.',
  },
  'heritage-60': {
    bestFor_ja: '斜陽館周辺まで見たい人',
    bestFor_en: 'For visitors who want the Shayokan area',
    pace_ja: '文学の街らしい目的地を入れ、最後に金木らしいおみやげへ戻します。',
    pace_en: 'Adds a literary-town destination and returns to a Kanagi souvenir choice.',
    finish_ja: '甘露梅や仁太坊そばのように、土地の話がしやすい商品が合います。',
    finish_en: 'Choose items with an easy local story, such as plum sweets or soba.',
  },
  'dazai-roots-75': {
    bestFor_ja: '太宰治を作品きっかけで知り、本人の原点でも推し活したい人',
    bestFor_en: 'For visitors who found Dazai through fiction and want to see the author’s roots',
    pace_ja: '斜陽館で原点を見て、疎開の家と思い出広場で生活感や余韻までたどります。',
    pace_en: 'Starts at Shayokan, then follows the sojourn house and Omoide Hiroba for more context.',
    finish_ja: '甘露梅やコーヒーを選ぶと、巡礼後の記念として持ち帰りやすいです。',
    finish_en: 'Plum sweets or coffee make an easy keepsake after the route.',
  },
  'rain-winter': {
    bestFor_ja: '雨・雪・強風の日に無理なく過ごしたい人',
    bestFor_en: 'For rain, snow, wind, or low-energy weather',
    pace_ja: '屋内滞在を中心にし、足元の不安を減らします。',
    pace_en: 'Focuses on indoor browsing and reduces walking risk.',
    finish_ja: '日持ちする商品やセット相談を選ぶと、天候に左右されにくいです。',
    finish_en: 'Shelf-stable items or a set consultation work well in poor weather.',
  },
  'deep-90': {
    bestFor_ja: '金木町をゆっくり記憶に残したい人',
    bestFor_en: 'For a slower visit that should feel memorable',
    pace_ja: '見どころをつなぎ、最後に旅の記念になる商品を選びます。',
    pace_en: 'Connects multiple spots and ends with a memorable gift choice.',
    finish_ja: '季節のおみやげセットや土地名のある商品で、旅の余韻を持ち帰れます。',
    finish_en: 'A seasonal set or local-name item carries the trip home.',
  },
  'park-120': {
    bestFor_ja: '晴れの日に写真と公園散策まで楽しみたい人',
    bestFor_en: 'For clear-weather visitors who want photos and a park walk',
    pace_ja: '中心部の文学スポットを見てから、移動手段を確認して芦野公園方面へ伸ばします。',
    pace_en: 'Starts with central literary stops, then extends toward Ashino Park after checking transport.',
    finish_ja: 'KADOKKOで軽いおやつやコーヒーを選ぶと、長めの散策前後に使いやすいです。',
    finish_en: 'A snack or coffee from KADOKKO works well before or after the longer outing.',
  },
};
