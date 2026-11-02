# THC6（Tree House C6）grammar.json：課本 Grammar 頁（每單元 3 個文法點）＋ Phonics 頁＋會話站
# cards＝文法小卡；questions＝choice 選擇／order 排句子；listening＝lfill／lpick／lorder（用課本文法例句）＋發音聽辨（lpick，label 標成發音題）
# phonics＝發音小卡（每個音：規則、例字、紅字部分用 [ ] 標出）＋ 練習字 24 個
# 會話站（課本 Conversation）：見 talk.py
# 所有選擇題的正確答案寫在第一個（a=0），App 會打亂順序
# 目前寫好：U1–U6（其他單元一單元一單元補，補好再把 words.py 的 OPEN 打開）
import json, sys

def C(q, opts, tip):  return {'type': 'choice', 'q': q, 'opts': opts, 'a': 0, 'tip': tip}
def O(s, tip):        return {'type': 'order', 'words': s.split(' '), 'tip': tip}
def LF(say, q, opts, tip): return {'type': 'lfill', 'say': say, 'q': q, 'opts': opts, 'a': 0, 'tip': tip}
def LP(say, opts, tip):    return {'type': 'lpick', 'say': say, 'opts': [say] + opts, 'a': 0, 'tip': tip}
def LO(s, tip):       return {'type': 'lorder', 'words': s.split(' '), 'tip': tip}
PH_LABEL = ['🔤 發音：選出你聽到的字 Which word did you hear?', 'Phonics: which word did you hear?']
def PW(say, opts, tip):    return {'type': 'lpick', 'say': say, 'opts': [say] + opts, 'a': 0, 'tip': tip, 'label': PH_LABEL}

G = {'_說明': 'THC6（Tree House C6）文法、聽力、發音與會話。cards＝課本 Grammar 頁小卡；questions＝文法題（choice 選擇、order 排句子）；listening＝用課本例句出的聽力題（lfill、lpick、lorder），加上發音聽辨（lpick、有 label）；phonics＝課本 Phonics 頁（例字用 [ ] 標出發這個音的字母）；talk＝課本 Conversation（會話站）。a＝正確選項位置（從 0 開始），App 會打亂選項順序。',
     'cards': {}, 'everyday': {}, 'questions': {}, 'listening': {}, 'phonics': {}}

def unit(u, card, qs, ls, ph, pws):
    G['cards'][u] = card; G['questions'][u] = qs; G['listening'][u] = ls + pws; G['phonics'][u] = ph

# ───────────────────────── U1 Games and Activities ─────────────────────────
unit('U1', {
  'title': 'stop / keep Ving · Present Continuous · Adverbs of Degree',
  'zh': 'stop／keep 後面接 V-ing；現在進行式：現在正在做的事；程度副詞：really、very 讓副詞更強',
  'rules': [
    ['stop ＋ V-ing：停止做某件事', 'Susie stopped skating at 3:15.'],
    ['keep ＋ V-ing：持續做某件事', 'Becky and Susie will keep playing chess.'],
    ['現在進行式：am / is / are ＋ V-ing', 'The dog is digging a hole.'],
    ['否定：am not / isn\'t / aren\'t ＋ V-ing', "Paul and Wally aren't having fun."],
    ['really / very ＋ 副詞：程度更強', 'Alice was throwing the balls really fast.'],
    ['形容詞 → 副詞：careless → carelessly', 'Kate is skating very carelessly.'],
  ],
  'phrases': [['常用', 'really fast　very carefully　very carelessly　really well　very slowly']],
  'mistakes': [
    ['Susie stopped skate at 3:15.', 'Susie stopped skating at 3:15.', 'stop 後面接 V-ing'],
    ['They will keep play chess.', 'They will keep playing chess.', 'keep 後面接 V-ing'],
    ['The dog digging a hole.', 'The dog is digging a hole.', '進行式不能少了 is'],
    ['Kate is skating very careless.', 'Kate is skating very carelessly.', '形容動作要用副詞 carelessly'],
  ]}, [
  C('Susie stopped ___ at 3:15.', ['skating', 'skate', 'to skate'], 'stop 後面接 V-ing：stopped skating'),
  C('Becky and Susie will keep ___ chess.', ['playing', 'play', 'plays'], 'keep 後面接 V-ing：keep playing'),
  C('Please stop ___. I\'m trying to read.', ['talking', 'talk', 'talked'], 'stop ＋ V-ing'),
  C('Tim kept ___ until he beat Paul.', ['trying', 'try', 'tries'], 'keep（過去 kept）＋ V-ing'),
  C('The dog ___ digging a hole.', ['is', 'are', 'am'], 'The dog＝it → is'),
  C('Paul and Wally ___ having fun.', ["aren't", "isn't", "don't"], 'Paul and Wally＝they → aren\'t'),
  C('I ___ listening to music.', ['am', 'is', 'are'], 'I → am'),
  C('Look! The kids are ___ catch.', ['playing', 'play', 'plays'], 'are ＋ V-ing'),
  C('___ Kate skating with her friends?', ['Is', 'Are', 'Does'], '問句把 is 放前面；Kate＝she → Is'),
  C('Alice was throwing the balls really ___.', ['fast', 'faster', 'fastly'], 'fast 的副詞還是 fast（沒有 fastly）'),
  C('Kate is skating very ___.', ['carelessly', 'careless', 'care'], '形容「怎麼溜」要用副詞：careless → carelessly'),
  C("I'll try to skate more ___.", ['carefully', 'careful', 'care'], '形容「怎麼溜」：careful → carefully'),
  O('Susie stopped skating at 3:15.', 'stop ＋ V-ing'),
  O('The dog is digging a hole.', '現在進行式 is ＋ V-ing'),
  O('Kate is skating very carelessly.', '動詞後面：very ＋ 副詞'),
], [
  LF('Becky and Susie will keep playing chess.', 'Becky and Susie will keep ___ chess.', ['playing', 'play', 'played'], 'keep ＋ V-ing'),
  LF("Paul and Wally aren't having fun.", "Paul and Wally ___ having fun.", ["aren't", "are", "isn't"], "聽清楚 aren't（否定）"),
  LP('Alice was throwing the balls really fast.', ['Alice was throwing the balls really slowly.', 'Alice is throwing the balls really fast.'], '聽清楚 was（過去）和 fast'),
  LO('Susie stopped skating at 3:15.', 'stop ＋ V-ing'),
], {
  'title': '-ar- · w+ar- · -ar',
  'sounds': [
    {'name': '-ar-', 'ipa': 'ɑr', 'rule': 'ar 在字中間或重音的地方唸 /ɑr/，嘴巴張大像「啊」再捲舌', 'words': ['c[ar]', 'st[ar]', 'p[ar]k', 'g[ar]den', 'f[ar]m']},
    {'name': 'w+ar-', 'ipa': 'ɔr', 'rule': 'w 後面的 ar 不唸 /ɑr/，要唸 /ɔr/，像 or 的音', 'words': ['w[ar]m', 'w[ar]', 'w[ar]n', 'rew[ar]d', 'sw[ar]m']},
    {'name': '-ar', 'ipa': 'ɚ', 'rule': '字尾不是重音的 ar 唸輕輕的 /ɚ/，跟 -er 一樣', 'words': ['doll[ar]', 'coll[ar]', 'sug[ar]', 'cell[ar]', 'gramm[ar]']},
  ],
  'practice': ['card', 'hard', 'yard', 'shark', 'dark', 'smart', 'start', 'market', 'party', 'carpet', 'harm', 'march',
               'warm', 'warn', 'ward', 'dwarf', 'warp', 'wart',
               'dollar', 'collar', 'sugar', 'cellar', 'grammar', 'pillar'],
}, [
  PW('warm', ['farm', 'worm'], 'w 後面的 ar 唸 /ɔr/'),
  PW('park', ['pork', 'pack'], 'p[ar]k 的 ar 唸 /ɑr/'),
  PW('dollar', ['doll', 'dollars'], '字尾 ar 唸輕輕的 /ɚ/'),
])

# ───────────────────────── U2 Clothes ─────────────────────────
unit('U2', {
  'title': 'good at / terrible at Ving · Sensory Verbs · as / when',
  'zh': 'good at／terrible at 後面接 V-ing；感官動詞＋形容詞／like＋名詞；as／when：當……的時候',
  'rules': [
    ['good at ＋ V-ing：擅長做某件事', 'Alice is good at drawing clothes.'],
    ['terrible at ＋ V-ing：很不會做某件事', 'The worker is terrible at mopping the floor.'],
    ['感官動詞 ＋ 形容詞：look / smell / sound / taste / feel', "The man's cake tasted bad."],
    ['感官動詞 ＋ like ＋ 名詞：摸起來像……', 'The socks felt like rocks.'],
    ['as：一邊……一邊……（兩件事同時進行）', "Chuck's dad will talk to the vendor as he tries on the hat."],
    ['when：正在做 A 的時候，B 發生了', 'Grandma was talking on her cell phone when the boy jumped over her.'],
  ],
  'phrases': [['常用', 'look cute　smell good　sound great　taste bad　feel soft　feel like rocks']],
  'mistakes': [
    ['Alice is good at draw clothes.', 'Alice is good at drawing clothes.', 'at 後面的動作要加 -ing'],
    ['The cake tasted badly.', 'The cake tasted bad.', '感官動詞後面用形容詞，不用副詞'],
    ['The socks felt rocks.', 'The socks felt like rocks.', '後面接名詞要加 like'],
    ['He will talk as he will try on the hat.', 'He will talk as he tries on the hat.', '講未來時，as／when 後面用現在式'],
  ]}, [
  C('Alice is good at ___ clothes.', ['drawing', 'draw', 'draws'], 'good at ＋ V-ing'),
  C('The worker is terrible at ___ the floor.', ['mopping', 'mop', 'mops'], 'terrible at ＋ V-ing（mop 要重複 p）'),
  C("My mom's good at ___ things.", ['sewing', 'sew', 'sews'], 'good at ＋ V-ing'),
  C("Susie isn't very good at ___.", ['skating', 'skate', 'skated'], 'good at ＋ V-ing'),
  C("The man's cake tasted ___.", ['bad', 'badly', 'like bad'], '感官動詞＋形容詞：tasted bad'),
  C('The socks felt ___ rocks.', ['like', 'as', 'to'], '後面接名詞（rocks）要用 felt like'),
  C('Wow, this dress looks really ___.', ['cute', 'cutely', 'like cute'], 'look ＋ 形容詞'),
  C('This soup smells ___.', ['good', 'well', 'like good'], 'smell ＋ 形容詞：smells good'),
  C('Your idea ___ great!', ['sounds', 'hears', 'listens'], '聽起來＝sound'),
  C("Chuck's dad will talk to the vendor as he ___ on the hat.", ['tries', 'will try', 'tried'], '講未來時，as 後面用現在式'),
  C('Grandma was talking on her cell phone ___ the boy jumped over her.', ['when', 'as', 'so'], '正在做 A（was talking）的時候，B 突然發生 → when'),
  C('I ___ watching TV when Mom came home.', ['was', 'were', 'am'], '過去正在做：I was ＋ V-ing'),
  O('Alice is good at drawing clothes.', 'good at ＋ V-ing'),
  O('The socks felt like rocks.', '感官動詞＋like＋名詞'),
  O('Grandma was talking when the boy jumped over her.', 'was ＋ V-ing ＋ when ＋ 過去式'),
], [
  LF('The worker is terrible at mopping the floor.', 'The worker is ___ at mopping the floor.', ['terrible', 'good', 'great'], '聽清楚 terrible（很不會）'),
  LF("The man's cake tasted bad.", "The man's cake ___ bad.", ['tasted', 'looked', 'smelled'], 'tasted＝嚐起來'),
  LP('The socks felt like rocks.', ['The socks look like rocks.', 'The socks felt like socks.'], '聽清楚 felt（摸起來）'),
  LO('Alice is good at drawing clothes.', 'good at ＋ V-ing'),
], {
  'title': '-air · -are · -ear',
  'sounds': [
    {'name': '-air', 'ipa': 'ɛr', 'rule': 'air 唸 /ɛr/，像「ㄝ」再捲舌', 'words': ['ch[air]', 'h[air]', 'p[air]', 'st[air]s', 'f[air]']},
    {'name': '-are', 'ipa': 'ɛr', 'rule': 'are 在字尾也唸 /ɛr/，跟 air 一樣（e 不發音）', 'words': ['c[are]', 'sh[are]', 'sc[are]', 'squ[are]', 'b[are]']},
    {'name': '-ear', 'ipa': 'ɛr', 'rule': '有些 ear 唸 /ɛr/：bear、pear、wear（但 hear、near 唸 /ɪr/，U4 會學）', 'words': ['b[ear]', 'p[ear]', 'w[ear]', 'underw[ear]']},
  ],
  'practice': ['hair', 'pair', 'fair', 'stairs', 'repair', 'airplane', 'dairy', 'flair',
               'care', 'dare', 'rare', 'share', 'spare', 'stare', 'glare', 'careful',
               'bear', 'pear', 'wear', 'underwear', 'wears', 'bears', 'wearing', 'pears'],
}, [
  PW('chair', ['cheer', 'char'], 'air 唸 /ɛr/'),
  PW('share', ['sheer', 'shore'], 'are 唸 /ɛr/'),
  PW('bear', ['beer', 'bar'], 'b[ear] 的 ear 唸 /ɛr/'),
])

# ───────────────────────── U3 Out and About ─────────────────────────
unit('U3', {
  'title': 'Comparative & Superlative Adjectives · before / after · Past Continuous: while',
  'zh': '比較級（比較兩個）與最高級（三個以上最……）；before／after：在……之前／之後；while：正在做某事的時候',
  'rules': [
    ['比較級：形容詞-er ＋ than（兩個比）', 'Alice and Susie were faster than Chuck.'],
    ['最高級：the ＋ 形容詞-est（三個以上最……）', 'Today must be the hottest day so far this summer.'],
    ['before／after ＋ 名詞（介系詞）', 'Tim usually misses the bus before school.'],
    ['before／after ＋ 主詞＋動詞（連接詞）', 'Wally fed the cat after he watched the movie.'],
    ['while ＋ 主詞 was / were ＋ V-ing：正在做的時候', 'Pam called Becky while she was lying on the bed.'],
    ['長的形容詞：more ＋ 形容詞／the most ＋ 形容詞', 'Becky is more honest than Wally.'],
  ],
  'phrases': [['變化', 'fast → faster → the fastest　heavy → heavier → the heaviest　hot → hotter → the hottest　good → better → the best']],
  'mistakes': [
    ["Tim's bag is heavyer than Susie's.", "Tim's bag is heavier than Susie's.", 'y 結尾：改 i 再加 -er'],
    ['Today is the hotest day.', 'Today is the hottest day.', 'hot 要重複 t：hottest'],
    ['Alice is more fast than Chuck.', 'Alice is faster than Chuck.', '短的形容詞直接加 -er，不用 more'],
    ['Pam called Becky while she lay on the bed.', 'Pam called Becky while she was lying on the bed.', 'while 後面用 was / were ＋ V-ing'],
  ]}, [
  C('Alice and Susie were ___ than Chuck.', ['faster', 'fast', 'fastest'], '兩個人比，用比較級＋than'),
  C("Tim's book bag is ___ than Susie's book bag.", ['heavier', 'heavyer', 'heaviest'], 'heavy：y 改 i 加 -er'),
  C('Today must be the ___ day so far this summer.', ['hottest', 'hotter', 'hotest'], 'the ＋ 最高級；hot 要重複 t'),
  C('Becky is the ___ girl in our class.', ['kindest', 'kinder', 'kind'], '整班比（三個以上）用最高級'),
  C('Wally is more ___ than Tim.', ['selfish', 'selfisher', 'selfishest'], '長的形容詞用 more ＋ 原形'),
  C('Tim usually misses the bus ___ school.', ['before', 'after', 'while'], '上學「之前」沒趕上公車'),
  C('Pam and Becky went to the shopping center ___ church.', ['after', 'before', 'while'], '先上教堂，「之後」去購物中心'),
  C('Wally fed the cat after he ___ the movie.', ['watched', 'watches', 'watching'], '過去的事，after 後面也用過去式'),
  C('Becky and Pam will play Go before they ___ a trick on Wally.', ['play', 'will play', 'played'], '講未來時，before 後面用現在式'),
  C('Pam called Becky while she was ___ on the bed.', ['lying', 'lie', 'lay'], 'while ＋ was ＋ V-ing；lie → lying'),
  C('What did Tim do while he ___ walking?', ['was', 'were', 'is'], 'he 的過去進行式用 was'),
  C('The phone rang while we ___ dinner.', ['were eating', 'are eating', 'eat'], 'while ＋ were ＋ V-ing'),
  O('Alice and Susie were faster than Chuck.', '比較級＋than'),
  O('Wally fed the cat after he watched the movie.', 'after ＋ 主詞＋過去式'),
  O('Pam called Becky while she was lying on the bed.', 'while ＋ was ＋ V-ing'),
], [
  LF("Tim's book bag is heavier than Susie's book bag.", "Tim's book bag is ___ than Susie's book bag.", ['heavier', 'lighter', 'heaviest'], '聽清楚 heavier'),
  LF('Tim usually misses the bus before school.', 'Tim usually misses the bus ___ school.', ['before', 'after', 'at'], '聽清楚 before'),
  LP('Pam called Becky while she was lying on the bed.', ['Pam called Becky while she was sitting on the bed.', 'Pam called Becky after she was lying on the bed.'], '聽清楚 while 和 lying'),
  LO('Alice and Susie were faster than Chuck.', '比較級＋than'),
], {
  'title': '-er- · -er',
  'sounds': [
    {'name': '-er-', 'ipa': 'ɝ', 'rule': 'er 在重音的地方唸 /ɝ/，嘴巴小小、舌頭捲起來', 'words': ['h[er]', 'f[er]n', 'p[er]son', 't[er]m', 'n[er]vous']},
    {'name': '-er', 'ipa': 'ɚ', 'rule': '字尾不是重音的 er 唸輕輕的 /ɚ/，比較級的 -er 也是這個音', 'words': ['fast[er]', 'heavi[er]', 'summ[er]', 'wint[er]', 'teach[er]']},
  ],
  'practice': ['her', 'herd', 'fern', 'term', 'germ', 'jerk', 'verb', 'serve', 'person', 'perfect', 'nervous', 'clerk',
               'faster', 'taller', 'bigger', 'summer', 'winter', 'teacher', 'mother', 'sister', 'paper', 'water', 'never', 'after'],
}, [
  PW('her', ['hair', 'here'], 'er 唸 /ɝ/'),
  PW('fern', ['farm', 'fan'], 'f[er]n 的 er 唸 /ɝ/'),
  PW('faster', ['fast', 'fastest'], '字尾 -er 唸輕輕的 /ɚ/'),
])

# ───────────────────────── U4 Around the Castle ─────────────────────────
unit('U4', {
  'title': 'Pronouns: one, some, a lot, there · like Ving / Ving is (adj.) · How long?: for / until',
  'zh': '用 one／some／a lot／there 代替前面說過的東西；動名詞 V-ing 當主詞或受詞；How long? 用 for（多久）／until（直到）回答',
  'rules': [
    ['one：代替前面說過的「一個」', 'Did the wizard wash a fish? Yes, he washed one.'],
    ['some／a lot：代替「一些／很多」', 'Were there any eggs on the wide bench? Yes, there were some there.'],
    ['like ＋ V-ing：喜歡做某事', 'The dragon likes smelling flowers.'],
    ['V-ing ＋ is ＋ 形容詞：做某事是……的', 'Fighting the monster is dangerous.'],
    ['for ＋ 一段時間：持續多久', 'The soldiers will exercise for two hours.'],
    ['until ＋ 時間／事件：一直到……為止', 'The queen will ride until she finds the dragon.'],
  ],
  'phrases': [['How long?', 'for a short time　for two hours　until four o\'clock　until she finds the dragon']],
  'mistakes': [
    ['Did he wash a fish? Yes, he washed it a fish.', 'Did he wash a fish? Yes, he washed one.', '用 one 代替，不要重複'],
    ['Fight the monster is dangerous.', 'Fighting the monster is dangerous.', '動作當主詞要加 -ing'],
    ['They exercised until two hours.', 'They exercised for two hours.', '一段時間用 for'],
    ['She will ride until she will find the dragon.', 'She will ride until she finds the dragon.', '講未來時，until 後面用現在式'],
  ]}, [
  C('Did the wizard wash a fish? Yes, he washed ___.', ['one', 'some', 'any'], '代替「一條魚」用 one'),
  C('Were there any eggs on the bench? Yes, there were ___ there.', ['some', 'one', 'any'], '代替「一些蛋」用 some'),
  C('Do you have many cookies? Yes, I have ___.', ['a lot', 'one', 'any'], '代替「很多餅乾」用 a lot'),
  C('Is there a sign beside the castle? Yes, there is ___.', ['one', 'some', 'a lot'], '一個告示牌 → one'),
  C('The dragon likes ___ flowers.', ['smelling', 'smell', 'smells'], 'like ＋ V-ing'),
  C('___ the monster is dangerous.', ['Fighting', 'Fight', 'Fights'], '動作當主詞要加 -ing'),
  C('___ the princess was the knight\'s plan.', ['Saving', 'Save', 'Saved'], '動作當主詞：Saving'),
  C('How long will the soldiers exercise? They will exercise ___ two hours.', ['for', 'until', 'at'], '一段時間（兩個小時）用 for'),
  C("We will wait ___ four o'clock.", ['until', 'for', 'in'], '一直等「到」四點 → until'),
  C('The queen will ride until she ___ the dragon.', ['finds', 'will find', 'found'], '講未來時，until 後面用現在式'),
  C('The dragon slept ___ a short time.', ['for', 'until', 'on'], 'a short time 是一段時間 → for'),
  C('___ long will the knight stay?', ['How', 'What', 'When'], '問「多久」用 How long'),
  O('The dragon likes smelling flowers.', 'like ＋ V-ing'),
  O('Fighting the monster is dangerous.', 'V-ing 當主詞'),
  O('The soldiers will exercise for two hours.', 'for ＋ 一段時間'),
], [
  LF('The queen will ride until she finds the dragon.', 'The queen will ride ___ she finds the dragon.', ['until', 'for', 'when'], '聽清楚 until'),
  LF('Fighting the monster is dangerous.', '___ the monster is dangerous.', ['Fighting', 'Finding', 'Feeding'], '聽清楚 Fighting'),
  LP('Yes, there were some there.', ['Yes, there was one there.', 'No, there were none there.'], '聽清楚 some'),
  LO('The soldiers will exercise for two hours.', 'for ＋ 一段時間'),
], {
  'title': '-ear · -eer · -ere',
  'sounds': [
    {'name': '-ear', 'ipa': 'ɪr', 'rule': '大部分的 ear 唸 /ɪr/，像「一」再捲舌（U2 的 bear、pear 是例外）', 'words': ['h[ear]', 'n[ear]', 'y[ear]', 'cl[ear]', 'sp[ear]']},
    {'name': '-eer', 'ipa': 'ɪr', 'rule': 'eer 唸 /ɪr/', 'words': ['d[eer]', 'ch[eer]', 'st[eer]', 'p[eer]', 'volunt[eer]']},
    {'name': '-ere', 'ipa': 'ɪr', 'rule': 'ere 在字尾也常唸 /ɪr/（e 不發音）', 'words': ['h[ere]', 'm[ere]', 'sev[ere]', 'sinc[ere]', 'atmosph[ere]']},
  ],
  'practice': ['hear', 'near', 'dear', 'fear', 'year', 'clear', 'gear', 'beard', 'spear', 'appear',
               'deer', 'cheer', 'steer', 'peer', 'sheer', 'sneer', 'career', 'engineer',
               'here', 'mere', 'severe', 'sincere', 'interfere', 'sphere'],
}, [
  PW('hear', ['hair', 'her'], 'h[ear] 唸 /ɪr/'),
  PW('deer', ['dare', 'door'], 'eer 唸 /ɪr/'),
  PW('cheer', ['chair', 'chore'], 'eer 唸 /ɪr/'),
])

# ───────────────────────── U5 Once Upon a Time ─────────────────────────
unit('U5', {
  'title': 'may / must · Future Tense · Comparative & Superlative Adverbs',
  'zh': 'may＝可以／也許，must＝必須；未來式 will 與 be going to；副詞的比較級與最高級（跑得比較快、跳得最高）',
  'rules': [
    ['may ＋ 原形動詞：可以（允許）', 'Who may go for a hike?'],
    ['must ＋ 原形動詞：必須', 'What must the dad bear do? He must clean the house.'],
    ['will ＋ 原形動詞：將會', 'The witch will hurt her toe.'],
    ['be going to ＋ 原形動詞：快要／打算', 'The cat is going to be in the tree.'],
    ['副詞比較級：動詞 ＋ 副詞-er ＋ than', 'The centipede ran faster than the cockroach.'],
    ['副詞最高級：動詞 ＋ the ＋ 副詞-est', 'Which frog jumped the highest?'],
  ],
  'phrases': [['變化', 'fast → faster → the fastest　high → higher → the highest　carefully → more carefully → the most carefully　well → better → the best']],
  'mistakes': [
    ['He must cleans the house.', 'He must clean the house.', 'must 後面用原形動詞'],
    ['The witch will hurts her toe.', 'The witch will hurt her toe.', 'will 後面用原形動詞'],
    ['The cat is going be in the tree.', 'The cat is going to be in the tree.', 'be going to 不能少了 to'],
    ['Which frog jumped highest than the others?', 'Which frog jumped the highest?', '三個以上比用 the ＋ 最高級'],
  ]}, [
  C('Who ___ go for a hike? The kids may.', ['may', 'must not', 'mays'], '問「誰可以」用 may'),
  C('What must the dad bear do? He must ___ the house.', ['clean', 'cleans', 'cleaning'], 'must ＋ 原形動詞'),
  C('You ___ wear a helmet. It\'s the rule.', ['must', 'may', 'will not'], '規定一定要 → must'),
  C('The witch will ___ her toe.', ['hurt', 'hurts', 'hurting'], 'will ＋ 原形動詞'),
  C('The cat is going ___ be in the tree.', ['to', 'for', 'will'], 'be going to ＋ 原形動詞'),
  C('Look at the clouds! It ___ going to rain.', ['is', 'are', 'will'], 'It is going to…'),
  C('I ___ attack first!', ['will', 'am', 'going to'], "I will＝I'll"),
  C('The centipede ran ___ than the cockroach.', ['faster', 'fastest', 'more fast'], '兩隻比：副詞比較級＋than'),
  C('Which frog jumped the ___?', ['highest', 'higher', 'high'], '三隻以上比：the ＋ 最高級'),
  C('Becky cast her spell ___ than Jimmy.', ['more carefully', 'carefuller', 'most carefully'], '長的副詞用 more ＋ 副詞'),
  C('Kate sang the ___ of all.', ['best', 'better', 'well'], 'well 的最高級是 best'),
  C('My spell ___ work on you!', ["won't", "isn't", "don't"], "won't＝will not"),
  O('He must clean the house.', 'must ＋ 原形動詞'),
  O('The cat is going to be in the tree.', 'be going to ＋ 原形動詞'),
  O('The centipede ran faster than the cockroach.', '副詞比較級＋than'),
], [
  LF('The witch will hurt her toe.', 'The witch ___ hurt her toe.', ['will', "won't", 'must'], '聽清楚 will'),
  LF('Which frog jumped the highest?', 'Which frog jumped the ___?', ['highest', 'higher', 'fastest'], '聽清楚 highest'),
  LP('He must clean the house.', ['He may clean the house.', 'He must close the house.'], '聽清楚 must 和 clean'),
  LO('The cat is going to be in the tree.', 'be going to ＋ 原形動詞'),
], {
  'title': '-ir- · -ire · -ur- · -ure',
  'sounds': [
    {'name': '-ir-', 'ipa': 'ɝ', 'rule': 'ir 唸 /ɝ/，跟 er、ur 一樣', 'words': ['b[ir]d', 'g[ir]l', 'sh[ir]t', 'f[ir]st', 'th[ir]sty']},
    {'name': '-ire', 'ipa': 'aɪr', 'rule': 'ire 唸 /aɪr/，像字母 I 再加捲舌（e 不發音）', 'words': ['f[ire]', 't[ire]d', 'w[ire]', 'h[ire]', 'insp[ire]']},
    {'name': '-ur-', 'ipa': 'ɝ', 'rule': 'ur 也唸 /ɝ/', 'words': ['t[ur]n', 'h[ur]t', 'n[ur]se', 'p[ur]ple', 'c[ur]l']},
    {'name': '-ure', 'ipa': 'jʊr', 'rule': 'ure 唸 /jʊr/ 或 /ʊr/，像「優兒」（e 不發音）', 'words': ['c[ure]', 'p[ure]', 's[ure]', 'sec[ure]', 'mat[ure]']},
  ],
  'practice': ['bird', 'girl', 'shirt', 'first', 'dirt', 'skirt', 'third',
               'fire', 'tire', 'wire', 'hire', 'admire', 'entire',
               'turn', 'hurt', 'nurse', 'purple', 'curl', 'burn',
               'cure', 'pure', 'sure', 'secure', 'mature'],
}, [
  PW('turn', ['tan', 'torn'], 'ur 唸 /ɝ/'),
  PW('fire', ['far', 'fur'], 'ire 唸 /aɪr/'),
  PW('shirt', ['short', 'shut'], 'ir 唸 /ɝ/'),
])

# ───────────────────────── U6 Fantasy ─────────────────────────
unit('U6', {
  'title': 'Pronouns: one / it · Conjunctions: when / while · too…to / so…that…couldn\'t',
  'zh': 'one＝同一種的「一個」，it＝前面說過的「那一個」；when／while：當……的時候；too…to／so…that…couldn\'t：太……以致於不能',
  'rules': [
    ['one：任何一個（不是特定的）', 'Who had a plan? The eagle had one.'],
    ['it：前面說過的「那一個」（特定的）', 'Will the giant want the heart? Yes, he will want it.'],
    ['正在做（was ＋ V-ing）＋ when ＋ 突然發生（過去式）', 'The prince was bouncing a ball when he fell down.'],
    ['過去式 ＋ while ＋ 正在做（was ＋ V-ing）', 'The duck hit the castle while it was flying.'],
    ['too ＋ 形容詞 ＋ to ＋ 原形動詞：太……而不能……', 'The giant is too tired to talk.'],
    ["so ＋ 形容詞 ＋ that ＋ 主詞 ＋ couldn't ＋ 原形動詞", "The rabbit was so scared that it couldn't move."],
  ],
  'phrases': [['常用', 'too tired to talk　too heavy to carry　so scared that it couldn\'t move　so hungry that he couldn\'t sleep']],
  'mistakes': [
    ['Who had a plan? The eagle had it.', 'Who had a plan? The eagle had one.', '「一個計畫」（沒有特定的）用 one'],
    ['The giant is too tired to talking.', 'The giant is too tired to talk.', 'to 後面用原形動詞'],
    ["The rabbit was so scared that it can't move.", "The rabbit was so scared that it couldn't move.", '過去的事用 couldn\'t'],
    ['The prince bounced a ball when he was falling down.', 'The prince was bouncing a ball when he fell down.', '長的動作用 was ＋ V-ing，突然發生的用過去式'],
  ]}, [
  C('Who had a plan? The eagle had ___.', ['one', 'it', 'some'], '一個計畫（還沒說是哪個）→ one'),
  C('Will the giant want the heart? Yes, he will want ___.', ['it', 'one', 'them'], 'the heart 是特定的那顆 → it'),
  C('I lost my pencil. Can I borrow ___?', ['one', 'it', 'ones'], '借「一枝」鉛筆，不是剛才那枝 → one'),
  C('Where is my magic lamp? I can\'t find ___.', ['it', 'one', 'some'], '找的是「我的那盞」→ it'),
  C('The prince was bouncing a ball when he ___ down.', ['fell', 'was falling', 'falls'], '突然發生的事用過去式'),
  C('The duck hit the castle while it ___ flying.', ['was', 'were', 'is'], 'while ＋ was ＋ V-ing'),
  C('I ___ sleeping when the dragon roared.', ['was', 'am', 'did'], '正在做：was ＋ V-ing'),
  C('The giant is too tired ___ talk.', ['to', 'that', 'for'], 'too ＋ 形容詞 ＋ to ＋ 動詞'),
  C('The box is too heavy to ___.', ['carry', 'carries', 'carrying'], 'to 後面用原形動詞'),
  C('The rabbit was ___ scared that it couldn\'t move.', ['so', 'too', 'very'], 'so ＋ 形容詞 ＋ that'),
  C("The rabbit was so scared that it ___ move.", ["couldn't", "can't", "wasn't"], "過去的事 → couldn't"),
  C('Chuck was so excited ___ he couldn\'t sit still.', ['that', 'to', 'when'], 'so … that …'),
  O('The giant is too tired to talk.', 'too ＋ 形容詞 ＋ to ＋ 動詞'),
  O("The rabbit was so scared that it couldn't move.", "so … that … couldn't"),
  O('The prince was bouncing a ball when he fell down.', 'was ＋ V-ing ＋ when ＋ 過去式'),
], [
  LF('The giant is too tired to talk.', 'The giant is too ___ to talk.', ['tired', 'tall', 'tiny'], '聽清楚 tired'),
  LF('The duck hit the castle while it was flying.', 'The duck hit the castle ___ it was flying.', ['while', 'when', 'until'], '聽清楚 while'),
  LP("The rabbit was so scared that it couldn't move.", ["The rabbit was so scared that it could move.", "The rabbit was too scared to move."], "聽清楚 so … that … couldn't"),
  LO('Who had a plan? The eagle had one.', 'one 代替「一個計畫」'),
], {
  'title': '-or- · w+or- · -or',
  'sounds': [
    {'name': '-or-', 'ipa': 'ɔr', 'rule': 'or 唸 /ɔr/，嘴巴圓圓的「ㄛ」再捲舌', 'words': ['h[or]n', 'c[or]n', 'sh[or]t', 'st[or]m', 'f[or]k']},
    {'name': 'w+or-', 'ipa': 'ɝ', 'rule': 'w 後面的 or 不唸 /ɔr/，要唸 /ɝ/，跟 er 一樣', 'words': ['w[or]ld', 'w[or]d', 'w[or]k', 'w[or]m', 'w[or]se']},
    {'name': '-or', 'ipa': 'ɚ', 'rule': '字尾不是重音的 or 唸輕輕的 /ɚ/', 'words': ['doct[or]', 'col[or]', 'act[or]', 'sail[or]', 'visit[or]']},
  ],
  'practice': ['horn', 'corn', 'short', 'storm', 'fork', 'sport', 'north', 'horse', 'morning',
               'world', 'word', 'work', 'worm', 'worse', 'worth', 'worst',
               'doctor', 'color', 'actor', 'sailor', 'visitor', 'mirror', 'tailor', 'motor'],
}, [
  PW('horn', ['hen', 'hand'], 'or 唸 /ɔr/'),
  PW('world', ['wild', 'word'], 'w 後面的 or 唸 /ɝ/'),
  PW('work', ['walk', 'week'], 'w[or]k 的 or 唸 /ɝ/'),
])

# 檢查
for u in G['cards']:
    for q in G['questions'][u] + G['listening'][u]:
        if 'opts' in q:
            assert len(set(q['opts'])) == len(q['opts']), (u, q)
        if q['type'] in ('choice', 'lfill'):
            assert q['q'].count('___') == 1, (u, q['q'])
            if q['type'] == 'lfill':
                assert q['q'].replace('___', q['opts'][0]) == q['say'], (u, q)
        if q['type'] in ('order', 'lorder'):
            assert len(q['words']) >= 3
    for s in G['phonics'][u]['sounds']:
        for w in s['words']: assert '[' in w and ']' in w, w
    assert len(G['phonics'][u]['practice']) == 24, u

# 句型教學頁（圖解、公式、上色例句）：見 lessons.py
import re
from lessons import LESSONS
for u, ls in LESSONS.items():
    assert u in G['cards'], u
    for x in ls:
        for en, zh in x['eg']:
            assert re.sub(r'\{[SBVTCNAPO]:[^{}]+\}', '', en).count('{') == 0, (u, en)
G['lessons'] = LESSONS
# 會話站（學會話、對話排序、句子重組）：見 talk.py
from talk import TALK
G['talk'] = TALK
json.dump(G, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', {u: (len(G['questions'][u]), len(G['listening'][u])) for u in G['cards']}, 'talk', list(TALK))
