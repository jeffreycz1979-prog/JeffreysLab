# THP5（Tree House 5）grammar.json：課本 Grammar 頁（每單元 3 個文法點）＋ Phonics 頁
# cards＝文法小卡；questions＝choice 選擇／order 排句子；listening＝lfill／lpick／lorder（用課本文法例句）＋發音聽辨（lpick，label 標成發音題）
# phonics＝發音小卡（每個音：規則、課本例字、紅字部分用 [ ] 標出）＋ Phonics Practice 練習字
# 所有選擇題的正確答案寫在第一個（a=0），App 會打亂順序
import json, sys

def C(q, opts, tip):  return {'type': 'choice', 'q': q, 'opts': opts, 'a': 0, 'tip': tip}
def O(s, tip):        return {'type': 'order', 'words': s.split(' '), 'tip': tip}
def LF(say, q, opts, tip): return {'type': 'lfill', 'say': say, 'q': q, 'opts': opts, 'a': 0, 'tip': tip}
def LP(say, opts, tip):    return {'type': 'lpick', 'say': say, 'opts': [say] + opts, 'a': 0, 'tip': tip}
def LO(s, tip):       return {'type': 'lorder', 'words': s.split(' '), 'tip': tip}
PH_LABEL = ['🔤 發音：選出你聽到的字 Which word did you hear?', 'Phonics: which word did you hear?']
def PW(say, opts, tip):    return {'type': 'lpick', 'say': say, 'opts': [say] + opts, 'a': 0, 'tip': tip, 'label': PH_LABEL}

G = {'_說明': 'THP5（Tree House 5）文法、聽力與發音。cards＝課本 Grammar 頁小卡；questions＝文法題（choice 選擇、order 排句子）；listening＝用課本例句出的聽力題（lfill、lpick、lorder），加上發音聽辨（lpick、有 label）；phonics＝課本 Phonics 頁（例字用 [ ] 標出發這個音的字母）。a＝正確選項位置（從 0 開始），App 會打亂選項順序。',
     'cards': {}, 'everyday': {}, 'questions': {}, 'listening': {}, 'phonics': {}}

def unit(u, card, qs, ls, ph, pws):
    G['cards'][u] = card; G['questions'][u] = qs; G['listening'][u] = ls + pws; G['phonics'][u] = ph

# ───────────────────────── U1 ─────────────────────────
unit('U1', {
  'title': 'and / but · Present Continuous · Past Continuous',
  'zh': '連接詞 and／but；現在進行式：現在正在做的事；過去進行式：過去某個時間正在做的事',
  'rules': [
    ['and：好事＋好事（＋, and ＋）', "Chuck's dad turned on the TV, and Susie wrote her homework."],
    ['but：一正一反（＋, but －）', "Susie likes to write English homework, but she doesn't like to write math homework."],
    ['現在進行式：am / is / are ＋ V-ing', "Chuck's dad is putting down the fruit."],
    ['I → am；he / she / it → is；you / we / they → are', 'Chuck and Susie are standing by the sink.'],
    ['過去進行式：was / were ＋ V-ing', "Was Chuck turning off the computer at eleven o'clock?"],
    ['I / he / she / it → was；you / we / they → were', "Chuck's parents were sitting down at one o'clock."],
  ],
  'phrases': [['問句', "Who is eating pizza?　What were you doing at one o'clock?"]],
  'mistakes': [
    ['She are standing by the sink.', 'She is standing by the sink.', 'she 用 is'],
    ["They was sitting down at one o'clock.", "They were sitting down at one o'clock.", 'they 用 were'],
    ['Dad is put down the fruit.', 'Dad is putting down the fruit.', '進行式動詞要加 -ing'],
    ['I like cats, but I like dogs.', 'I like cats, and I like dogs.', '兩件都是好事用 and'],
  ]}, [
  C('Susie likes cats, ___ she doesn\'t like dogs.', ['but', 'and', 'or'], '一正一反（likes／doesn\'t like）用 but'),
  C('Dad turned on the TV, ___ Mom opened the window.', ['and', 'but', 'so'], '兩件事都是「有做」用 and'),
  C("Chuck's dad ___ putting down the fruit.", ['is', 'are', 'am'], "Chuck's dad＝he → is"),
  C('Chuck and Susie ___ standing by the sink.', ['are', 'is', 'am'], 'Chuck and Susie＝they → are'),
  C('I ___ closing the door.', ['am', 'is', 'are'], 'I → am'),
  C('___ Chuck and Susie going outside?', ['Are', 'Is', 'Am'], '問句把 are 放前面'),
  C("Chuck's mom ___ closing the refrigerator door.", ["isn't", "aren't", "don't"], "Chuck's mom＝she → isn't"),
  C('Look! The dog is ___ pizza.', ['eating', 'eat', 'eats'], 'is ＋ V-ing'),
  C("Chuck's parents ___ sitting down at one o'clock yesterday.", ['were', 'was', 'are'], 'yesterday 是過去；parents＝they → were'),
  C("___ Chuck turning off the computer at eleven o'clock last night?", ['Was', 'Were', 'Is'], 'last night 是過去；Chuck＝he → was'),
  C("What ___ you doing at one o'clock yesterday?", ['were', 'was', 'are'], 'you 的過去用 were'),
  C("Susie ___ giving the yo-yo to Chuck at eleven o'clock yesterday.", ["wasn't", "weren't", "isn't"], 'Susie＝she，過去否定用 wasn\'t'),
  O("Chuck's dad is putting down the fruit.", '現在進行式 is ＋ V-ing'),
  O("What were you doing at one o'clock?", '過去進行式問句：What were you ＋ V-ing'),
  O("Susie likes English, but she doesn't like math.", '一正一反用 but'),
], [
  LF('Chuck and Susie are standing by the sink.', 'Chuck and Susie ___ standing by the sink.', ['are', 'were', 'is'], '現在正在做 → are ＋ V-ing'),
  LF("Chuck's parents were sitting down at one o'clock.", "Chuck's parents ___ sitting down at one o'clock.", ['were', 'are', 'was'], "過去某個時間正在做 → were ＋ V-ing"),
  LP("Susie wasn't giving the yo-yo to Chuck.", ["Susie isn't giving the yo-yo to Chuck.", 'Susie was giving the yo-yo to Chuck.'], "聽清楚 wasn't（過去、否定）"),
  LO('Who is eating pizza?', '誰正在吃披薩？Who is ＋ V-ing'),
], {
  'title': 'short a · long a',
  'sounds': [
    {'name': 'short a', 'ipa': 'æ', 'rule': '短母音 a，嘴巴張大、嘴角往兩邊拉', 'words': ['t[a]ck', 'l[a]dder']},
    {'name': 'long a', 'ipa': 'e', 'rule': '長母音 a，唸字母 A 的名字：a_e、ai、ay，或 a 後面沒有子音擋住', 'words': ['c[a]n[e]', 'p[ai]l', 'j[ay]', 'm[a]ple', 'm[ai]den', 'l[ay]er']},
  ],
  'practice': ['painless', 'tactic', 'staff', 'blast', 'act', 'flake', 'bait', 'sate', 'clasp', 'fray', 'pass', 'bandit',
               'aim', 'sway', 'bay', 'sail', 'nay', 'knack', 'ladle', 'mayor', 'maize', 'basin', 'cannon', 'phase'],
}, [
  PW('cane', ['can', 'cone'], 'a_e 唸長音 /e/，像字母 A'),
  PW('tack', ['take', 'tick'], 't[a]ck 是短音 /æ/'),
  PW('pail', ['pal', 'pill'], 'ai 唸長音 /e/'),
])

# ───────────────────────── U2 ─────────────────────────
unit('U2', {
  'title': 'time to / time for · before / after · when',
  'zh': '該做什麼的時間到了；在……之前／之後；當……的時候',
  'rules': [
    ['time to ＋ 動詞', '"Tim, it\'s time to come inside!" yells Alice.'],
    ['time for ＋ 名詞（bed, breakfast, school, a nap, a snack, a story, the test）', '"It\'s time for school," said Wally\'s dad.'],
    ['before / after ＋ 名詞（介系詞）', 'Alice woke up before breakfast.'],
    ['before / after ＋ 句子（連接詞）', 'Tim will put on his pajamas after he runs upstairs.'],
    ['when ＋ 句子：當……的時候', 'Kate and Jimmy felt excited when their cards blew away.'],
    ['講未來時，when／after 後面用現在式', 'Wally will feel happy when he sits on the couch with his parents.'],
  ],
  'phrases': [['問句', 'Did Wally go downstairs before he went to school?　Did Alice sing when she took a shower?']],
  'mistakes': [
    ["It's time to bed.", "It's time for bed.", 'bed 是名詞 → time for'],
    ["It's time for eat.", "It's time to eat.", 'eat 是動詞 → time to'],
    ['Tim will put on his pajamas after he will run upstairs.', 'Tim will put on his pajamas after he runs upstairs.', '講未來時，after 後面用現在式'],
  ]}, [
  C("It's time ___ bed.", ['for', 'to', 'at'], 'bed 是名詞 → time for'),
  C("It's time ___ eat.", ['to', 'for', 'at'], 'eat 是動詞 → time to'),
  C("Tim, it's time to ___ inside!", ['come', 'comes', 'coming'], 'time to ＋ 原形動詞'),
  C("Kids, it's time for ___.", ['a snack', 'eat', 'sleep'], 'time for ＋ 名詞'),
  C('First I wake up. Then I eat breakfast. I wake up ___ breakfast.', ['before', 'after', 'when'], '先醒來、再吃早餐 → before breakfast'),
  C('The party ends at 8:00. Chuck will mop the floor at 9:00. He will mop the floor ___ the party.', ['after', 'before', 'for'], '派對結束之後 → after'),
  C('Tim will put on his pajamas after he ___ upstairs.', ['runs', 'will run', 'ran'], '講未來時，after 後面用現在式'),
  C('Did Wally go downstairs before he ___ to school?', ['went', 'goes', 'will go'], 'Did 問過去的事 → went'),
  C('I feel happy ___ I sit on the couch with my parents.', ['when', 'for', 'to'], 'when ＋ 句子：當……的時候'),
  C('Wally sometimes eats French fries when he ___ TV.', ['watches', 'watch', 'watching'], 'sometimes 常做的事；he → watches'),
  C('Did Alice sing when she ___ a shower?', ['took', 'takes', 'take'], 'Did 問過去 → took'),
  O("It's time for school.", 'time for ＋ 名詞'),
  O('Tim will put on his pajamas after he runs upstairs.', '講未來時，after 後面用現在式'),
  O('Did Alice sing when she took a shower?', 'when ＋ 過去式'),
], [
  LF("It's time for bed, Tim.", "It's time ___ bed, Tim.", ['for', 'to', 'at'], 'time for ＋ 名詞'),
  LF('Alice woke up before breakfast.', 'Alice woke up ___ breakfast.', ['before', 'after', 'for'], 'before＝在……之前'),
  LP('Wally will feel happy when he sits on the couch.', ['Wally will feel happy when he sits on the chair.', 'Wally felt happy when he sat on the couch.'], '聽清楚 will feel 和 couch'),
  LO("It's time to eat.", 'time to ＋ 動詞'),
], {
  'title': 'short e · long e',
  'sounds': [
    {'name': 'short e', 'ipa': 'ɛ', 'rule': '短母音 e，嘴巴半開', 'words': ['m[e]ss', 'p[e]bble']},
    {'name': 'long e', 'ipa': 'i', 'rule': '長母音 e，唸字母 E 的名字：e_e、ee、ea，或 e 後面沒有子音擋住', 'words': ['g[e]n[e]', '[ee]l', 'l[ea]k', 'm[e]ter', 'w[ee]ping', '[ea]sel']},
  ],
  'practice': ['tweed', 'vend', 'blend', 'wreath', 'please', 'meter', 'squeal', 'lentil', 'these', 'venture', 'fence', 'press',
               'jeep', 'greasy', 'hectic', 'here', 'deft', 'dream', 'mete', 'sweeten', 'wreck', 'knee', 'sheet', 'theme'],
}, [
  PW('mess', ['miss', 'mass'], 'm[e]ss 是短音 /ɛ/'),
  PW('leak', ['lick', 'lake'], 'ea 唸長音 /i/'),
  PW('eel', ['ill', 'all'], 'ee 唸長音 /i/'),
])

# ───────────────────────── U3 ─────────────────────────
unit('U3', {
  'title': 'should · as · start / finish V-ing',
  'zh': '應該；一邊……一邊……（同時）；開始／做完某件事',
  'rules': [
    ['should ＋ 原形動詞：應該', 'Kate should put on her boots.'],
    ['should not（shouldn\'t）：不應該', 'The boy should not hurry.'],
    ['問句：Should ＋ 主詞 ＋ 原形動詞？', "Should the woman answer her cell phone? No, she shouldn't answer her cell phone."],
    ['as：同時。過去式 as 過去式', 'The vendor watched TV as she cut up the guavas.'],
    ['講未來：will ＋ 動詞 as ＋ 現在式', 'Grandma will make a mess as she waits for the bus.'],
    ['start / finish ＋ V-ing', 'The children started putting on their boots at four o\'clock.'],
  ],
  'phrases': [['更多例句', 'The man will start doing magic tricks at 4:15.　The workers will finish making a pile of wood at 4:15.']],
  'mistakes': [
    ['Kate should puts on her boots.', 'Kate should put on her boots.', 'should 後面用原形動詞'],
    ['The children started put on their boots.', 'The children started putting on their boots.', 'start ＋ V-ing'],
    ['Grandma will make a mess as she will wait for the bus.', 'Grandma will make a mess as she waits for the bus.', '講未來時，as 後面用現在式'],
  ]}, [
  C('Kate should ___ on her boots.', ['put', 'puts', 'putting'], 'should ＋ 原形動詞'),
  C("It's cold outside. You ___ put on gloves.", ['should', "shouldn't", 'should not to'], '天冷 → 應該戴手套'),
  C('The road is dangerous. The boy ___ hurry.', ["shouldn't", 'should', "doesn't should"], '危險 → 不應該匆忙'),
  C('___ the woman answer her cell phone?', ['Should', 'Does', 'Is'], 'Should ＋ 主詞 ＋ 原形動詞？'),
  C('The vendor watched TV as she ___ up the guavas.', ['cut', 'cuts', 'will cut'], '過去式 as 過去式（cut 的過去式還是 cut）'),
  C('The worker sang as she ___ on her gloves.', ['put', 'puts', 'will put'], '過去式 as 過去式（put 的過去式還是 put）'),
  C('Grandma will make a mess as she ___ for the bus.', ['waits', 'will wait', 'waited'], '講未來時，as 後面用現在式'),
  C('They will drink water as they ___.', ['talk', 'will talk', 'talked'], '講未來時，as 後面用現在式'),
  C('The children started ___ on their boots.', ['putting', 'put', 'puts'], 'start ＋ V-ing'),
  C('The workers will finish ___ a pile of wood at 4:15.', ['making', 'make', 'made'], 'finish ＋ V-ing'),
  C('Did the men finish ___ around the neighborhood at 4:05?', ['walking', 'walk', 'walked'], 'finish ＋ V-ing'),
  O('The boy should not hurry.', 'should not ＋ 原形動詞'),
  O('The man will start doing magic tricks.', 'start ＋ V-ing'),
  O('The worker sang as she put on her gloves.', '過去式 as 過去式'),
], [
  LF('Kate should put on her boots.', 'Kate ___ put on her boots.', ['should', "shouldn't", 'will'], '應該 → should'),
  LF('The children started putting on their boots.', 'The children ___ putting on their boots.', ['started', 'finished', 'will start'], '開始 → started'),
  LP("No, she shouldn't answer her cell phone.", ['Yes, she should answer her cell phone.', "No, she didn't answer her cell phone."], "聽清楚 shouldn't"),
  LO('Should the woman answer her cell phone?', 'Should ＋ 主詞 ＋ 原形動詞？'),
], {
  'title': 'short i · long i',
  'sounds': [
    {'name': 'short i', 'ipa': 'ɪ', 'rule': '短母音 i，短而輕', 'words': ['p[i]nch', 'z[i]pper']},
    {'name': 'long i', 'ipa': 'aɪ', 'rule': '長母音 i，唸字母 I 的名字：i_e、igh，或 i 後面沒有子音擋住', 'words': ['l[i]m[e]', 'th[igh]', 'b[i]son', 'fr[igh]tful']},
  ],
  'practice': ['itch', 'spring', 'chimp', 'highness', 'griffin', 'diction', 'virus', 'bride', 'yipe', 'pistil', 'nigh', 'blight',
               'tine', 'rightist', 'twist', 'vibe', 'slight', 'plight', 'limb', 'quill', 'fife', 'sigh', 'knight', 'rite'],
}, [
  PW('lime', ['limb', 'lamb'], 'i_e 唸長音 /aɪ/'),
  PW('slight', ['slit', 'slate'], 'igh 唸長音 /aɪ/'),
  PW('itch', ['each', 'etch'], '[i]tch 是短音 /ɪ/'),
])

# ───────────────────────── U4 ─────────────────────────
unit('U4', {
  'title': 'will … in (time) · be going to · anyone / everyone …',
  'zh': '未來式：多久之後會……；打算要做……；不定代名詞（有人、大家、沒有人……）',
  'rules': [
    ['will ＋ 動詞 ＋ in ＋ 時間（in a minute＝一分鐘後）', 'Who will dig a hole in two months? Tim will dig a hole in two months.'],
    ['will be ＋ 形容詞／名詞／地方', 'Susie will be angry in a week.'],
    ['否定：won\'t', "Tim won't be a scientist in two months."],
    ['be going to ＋ 原形動詞：打算要……', "Chuck's dad is going to watch television."],
    ['問句：Are … going to …? 否定：isn\'t going to', 'Are Pam and her grandfather going to plant a tree? Yes, they are going to plant a tree.'],
    ['anyone, everyone, someone, no one／anything, everything, something, nothing（當單數）', 'Everyone is in the science museum.'],
  ],
  'phrases': [['更多例句', 'Is anyone looking at the tiger? No, no one is looking at the tiger.　Someone is sleeping on the bench.　Will Chuck eat anything? Yes, Chuck will eat everything.']],
  'mistakes': [
    ['Susie will angry in a week.', 'Susie will be angry in a week.', 'will 後面接形容詞要加 be'],
    ['Tim will digs a hole.', 'Tim will dig a hole.', 'will ＋ 原形動詞'],
    ["Chuck's dad is going to watches TV.", "Chuck's dad is going to watch TV.", 'going to ＋ 原形動詞'],
    ['Everyone are in the museum.', 'Everyone is in the museum.', 'everyone 當單數 → is'],
  ]}, [
  C('Tim will ___ a hole in two months.', ['dig', 'digs', 'digging'], 'will ＋ 原形動詞'),
  C('Susie will ___ angry in a week.', ['be', 'is', 'are'], 'will be ＋ 形容詞'),
  C('Tim ___ be a scientist in two months.', ["won't", "isn't", "doesn't"], 'will 的否定是 won\'t'),
  C('I will see you ___ a minute.', ['in', 'on', 'at'], 'in a minute＝一分鐘後'),
  C("Chuck's dad is going to ___ television.", ['watch', 'watches', 'watching'], 'going to ＋ 原形動詞'),
  C('___ Pam and her grandfather going to plant a tree?', ['Are', 'Is', 'Do'], 'Pam and her grandfather＝they → Are'),
  C('Alice ___ going to help Tim.', ["isn't", "aren't", "don't"], "Alice＝she → isn't"),
  C("What are you going to do? I'm going to ___ attention to the teacher.", ['pay', 'pays', 'paying'], 'going to ＋ 原形動詞'),
  C('Everyone ___ in the science museum.', ['is', 'are', 'am'], 'everyone 當單數 → is'),
  C('Is anyone looking at the tiger? No, ___ is looking at the tiger.', ['no one', 'someone', 'everyone'], '回答 No → no one（沒有人）'),
  C('Will Chuck eat anything? Yes, Chuck will eat ___.', ['everything', 'nothing', 'no one'], '回答 Yes，全部都吃 → everything'),
  O('Who will dig a hole in two months?', 'will ＋ 動詞 ＋ in ＋ 時間'),
  O("Alice isn't going to help Tim.", "isn't going to ＋ 原形動詞"),
  O('Someone is sleeping on the bench.', 'someone 當單數 → is'),
], [
  LF('Chuck and Susie will be at home in a week.', 'Chuck and Susie will be at home ___ a week.', ['in', 'on', 'at'], 'in a week＝一週後'),
  LF("I'm going to pay attention to the teacher.", "I'm going to ___ attention to the teacher.", ['pay', 'play', 'say'], 'pay attention＝專心'),
  LP('No one is looking at the tiger.', ['Someone is looking at the tiger.', 'Everyone is looking at the tiger.'], 'no one＝沒有人'),
  LO("Nothing is going to help the plants.", 'nothing 當單數 → is'),
], {
  'title': 'short o · long o',
  'sounds': [
    {'name': 'short o', 'ipa': 'ɑ', 'rule': '短母音 o，嘴巴張大像「啊」', 'words': ['m[o]ss', 'l[o]cker']},
    {'name': 'long o', 'ipa': 'o', 'rule': '長母音 o，唸字母 O 的名字：o_e、oa、ow，或 o 後面沒有子音擋住', 'words': ['b[o]n[e]', 't[oa]st', 'sn[ow]', 'fr[o]zen', 'c[oa]stal', 'b[ow]lful']},
  ],
  'practice': ['dock', 'moth', 'thrown', 'spotless', 'crone', 'frond', 'foster', 'bowler', 'crotch', 'floss', 'ode', 'flow',
               'throat', 'loaf', 'loft', 'boastful', 'moat', 'stroke', 'phone', 'nozzle', 'coax', 'stow', 'doting', 'molar'],
}, [
  PW('bone', ['bun', 'Ben'], 'o_e 唸長音 /o/'),
  PW('moss', ['mass', 'mess'], 'm[o]ss 是短音 /ɑ/'),
  PW('toast', ['test', 'taste'], 'oa 唸長音 /o/'),
])

# ───────────────────────── U5 ─────────────────────────
unit('U5', {
  'title': 'with (adj.) (n.) · Past Tense: ago · Past Tense: time phrases',
  'zh': '有……的（人／東西）；多久以前；用過去的時間詞要用過去式',
  'rules': [
    ['（人／東西）with ＋ 形容詞 ＋ 名詞：有……的', 'The girl with big eyes talked on her cell phone.'],
    ['', 'The dog with the short tail played in a puddle.'],
    ['時間 ＋ ago：……以前（ago＝before now），動詞用過去式', 'Susie drew a grasshopper thirty seconds ago.'],
    ['When did …? → … ago', 'When did the fat boy chase his friend? He chased his friend four hours ago.'],
    ['過去的時間詞：this morning, yesterday, last night, last week, last weekend, six months ago', 'Who played video games last weekend?'],
    ['', 'What did the girl with long hair do this morning? She fed the swan this morning.'],
  ],
  'mistakes': [
    ['The girl has big eyes talked on her phone.', 'The girl with big eyes talked on her phone.', '描述是哪一個人用 with'],
    ['I eat lunch an hour ago.', 'I ate lunch an hour ago.', 'ago 是過去 → 過去式'],
    ['I played games ago three days.', 'I played games three days ago.', 'ago 放在時間的後面'],
  ]}, [
  C('The girl ___ big eyes talked on her cell phone.', ['with', 'has', 'of'], '有大眼睛的女孩 → with big eyes'),
  C('Paul likes the small dinosaur with ___ teeth.', ['sharp', 'sharply', 'a sharp'], 'with ＋ 形容詞 ＋ 名詞'),
  C('Susie ___ a grasshopper thirty seconds ago.', ['drew', 'draws', 'will draw'], 'ago 是過去 → drew'),
  C('He chased his friend four hours ___.', ['ago', 'last', 'next'], '時間 ＋ ago'),
  C('When ___ the fat boy chase his friend?', ['did', 'does', 'is'], '問過去的事 → did'),
  C('I ___ lunch an hour ago.', ['ate', 'eat', 'will eat'], 'ago 是過去 → ate'),
  C('Who played video games ___ weekend?', ['last', 'ago', 'next'], 'played 是過去 → last weekend'),
  C('What did the girl do this morning? She ___ the swan.', ['fed', 'feeds', 'will feed'], 'did 問過去 → fed（feed 的過去式）'),
  C('The man with the green shirt threw up ___ year.', ['last', 'ago', 'next'], 'threw 是過去 → last year'),
  C('We went to the forest three days ___.', ['ago', 'last', 'yesterday'], 'three days ago＝三天前'),
  C('The boy ___ blue shoes laughed at the picture.', ['with', 'and', 'has'], '穿藍鞋的男孩 → with blue shoes'),
  O('The girl with big eyes talked on her cell phone.', '（人）with ＋ 形容詞 ＋ 名詞'),
  O('Susie drew a grasshopper thirty seconds ago.', '時間 ＋ ago 放句尾'),
  O('What did the girl do this morning?', 'What did ＋ 主詞 ＋ 原形動詞？'),
], [
  LF('The dog with the short tail played in a puddle.', 'The dog ___ the short tail played in a puddle.', ['with', 'has', 'and'], '有短尾巴的狗 → with the short tail'),
  LF('He chased his friend four hours ago.', 'He chased his friend ___ hours ago.', ['four', 'five', 'nine'], '聽清楚數字'),
  LP('The girl with long hair fed the swan.', ['The girl with short hair fed the swan.', 'The girl with long hair fed the duck.'], '聽清楚 long hair 和 swan'),
  LO('Who played video games last weekend?', '過去的時間詞 last weekend 放句尾'),
], {
  'title': 'short u · long u',
  'sounds': [
    {'name': 'short u', 'ipa': 'ʌ', 'rule': '短母音 u，嘴巴輕輕張開', 'words': ['c[u]ff', 'dr[u]mmer']},
    {'name': 'long u', 'ipa': 'u', 'rule': '長母音 u（ㄨ）：u_e、ue、ew、ui', 'words': ['l[u]t[e]', 'gr[ue]l', 'br[ui]se', 'scr[ew]', 'ch[ew]y', 's[ui]tor']},
    {'name': 'long u', 'ipa': 'ju', 'rule': '長母音 u（一ㄨ），唸字母 U 的名字：u_e、u、ue', 'words': ['c[u]b[e]', 'c[u]pid', 'f[ue]ling']},
  ],
  'practice': ['fruit', 'skunk', 'ruckus', 'suiting', 'sultan', 'bruit', 'skew', 'yew', 'plume', 'ruse', 'suture', 'musk',
               'crumb', 'cue', 'brew', 'fuel', 'rueful', 'slue', 'tune', 'Newton', 'tuft', 'brunt', 'truss', 'juice'],
}, [
  PW('cube', ['cub', 'cab'], 'u_e 唸長音 /ju/'),
  PW('tune', ['ton', 'tan'], 'u_e 唸長音 /u/'),
  PW('cuff', ['cave', 'cough'], 'c[u]ff 是短音 /ʌ/'),
])

# ───────────────────────── U6 ─────────────────────────
unit('U6', {
  'title': 'as (adj.) as (n.) · get (adj.) · Be Verbs',
  'zh': '跟……一樣（形容詞）；變得……；be 動詞的過去、現在、未來',
  'rules': [
    ['as ＋ 形容詞 ＋ as ＋ 名詞：跟……一樣', 'The thin girl is as tall as the tree.'],
    ['', 'Who will be as excited as Wally? Becky will be as excited as Wally.'],
    ['get ＋ 形容詞：變得……', 'Pam got excited as she watched the news on TV.'],
    ['', 'The little boy will get confused when the girl does a magic trick.'],
    ['Be 動詞：過去 was / were；現在 am / is / are；未來 will be', 'Where were the students?'],
    ['', 'Bob will be a vendor.　Will Pam and the other children be famous?'],
  ],
  'mistakes': [
    ['The girl is as tall the tree.', 'The girl is as tall as the tree.', 'as … as 兩個 as 都要有'],
    ['Pam got excite.', 'Pam got excited.', 'get ＋ 形容詞（excited）'],
    ["Tim and Susie isn't hot.", "Tim and Susie aren't hot.", 'Tim and Susie＝they → are'],
    ['Bob will is a vendor.', 'Bob will be a vendor.', 'will 後面用 be'],
  ]}, [
  C('The thin girl is as tall ___ the tree.', ['as', 'than', 'like'], 'as ＋ 形容詞 ＋ as'),
  C('The hamster was ___ fat as the ball.', ['as', 'so', 'very'], 'as ＋ 形容詞 ＋ as'),
  C('Becky will be as ___ as Wally.', ['excited', 'excite', 'excites'], 'as 中間放形容詞'),
  C('Pam ___ excited as she watched the news on TV.', ['got', 'gets', 'getting'], 'watched 是過去 → got'),
  C('Is Paul ___ angry at Bob?', ['getting', 'get', 'got'], 'Is ＋ V-ing'),
  C('The little boy will get ___ when the girl does a magic trick.', ['confused', 'confuse', 'confuses'], 'get ＋ 形容詞'),
  C('Where ___ the students yesterday?', ['were', 'was', 'are'], 'yesterday 過去；students＝they → were'),
  C('The short girl ___ reading a book yesterday afternoon.', ['was', 'were', 'is'], '過去；girl＝she → was'),
  C('I ___ ready to take pictures.', ['am', 'is', 'are'], 'I → am'),
  C('Tim and Susie ___ hot.', ["aren't", "isn't", 'am not'], "Tim and Susie＝they → aren't"),
  C('Bob ___ a vendor next year.', ['will be', 'will', 'is be'], '未來 → will be'),
  O('The hamster was as fat as the ball.', 'as ＋ 形容詞 ＋ as'),
  O('Is Paul getting angry at Bob?', 'get ＋ 形容詞，進行式 getting'),
  O('Will Pam and the other children be famous?', 'Will ＋ 主詞 ＋ be ＋ 形容詞？'),
], [
  LF('Becky will be as excited as Wally.', 'Becky will be ___ excited as Wally.', ['as', 'so', 'very'], 'as … as：跟……一樣'),
  LF("Alice isn't getting tired.", 'Alice ___ getting tired.', ["isn't", 'is', "wasn't"], "聽清楚 isn't"),
  LP('Where were the students?', ['Where are the students?', 'Where was the student?'], '聽清楚 were（過去、複數）'),
  LO('Bob is taking a break.', 'is ＋ V-ing'),
], {
  'title': 'middle u "oo" · long u "oo"',
  'sounds': [
    {'name': 'middle u "oo"', 'ipa': 'ʊ', 'rule': '短的「ㄨ」，嘴巴不用嘟太圓：u、oo', 'words': ['p[u]sh', 'h[oo]d', 'b[u]lly', 'w[oo]len']},
    {'name': 'long u "oo"', 'ipa': 'u', 'rule': '長的「ㄨ」，嘴巴嘟圓、拉長：oo', 'words': ['br[oo]m', 'r[oo]ster']},
  ],
  'practice': ['booklet', 'fully', 'bush', 'looker', 'droopy', 'wooden', 'foot', 'crooner', 'boost', 'stood', 'bushel', 'nook',
               'loosen', 'choose', 'shook', 'pusher', 'put', 'rook', 'sooty', 'footless', 'full', 'scoopful', 'rooted', 'push'],
}, [
  PW('foot', ['food', 'feet'], 'f[oo]t 是短的 /ʊ/；food 是長的 /u/'),
  PW('full', ['fool', 'fill'], 'f[u]ll 是短的 /ʊ/'),
  PW('broom', ['brim', 'bram'], 'br[oo]m 是長的 /u/'),
])

# ───────────────────────── U7 ─────────────────────────
unit('U7', {
  'title': 'Prepositions of Movement · Past Continuous + when · should / will + if',
  'zh': '移動的介系詞；正在做某事的時候，突然發生另一件事；如果……就應該／會……',
  'rules': [
    ['across 穿越／along 沿著／around 繞著／between 在兩者之間／over 越過上方／through 穿過（裡面）', 'Wally walked around the bushes.'],
    ['', 'Susie and Becky were walking along the stream.'],
    ['(was / were ＋ V-ing) when (過去式)：長時間的事 when 短時間的事', 'The bear was climbing a tree when it fell.'],
    ['', 'What were you doing when you heard a wolf?'],
    ['should / will ＋ 原形動詞 ＋ if ＋ 現在式', 'What should you do if you see a bear? You should make a lot of noise if you see a bear.'],
    ['', 'Tim will hide if he sees a bear.'],
  ],
  'mistakes': [
    ['The bear climbed a tree when it was falling.', 'The bear was climbing a tree when it fell.', '長時間的事用進行式，短時間的事用過去式'],
    ['Tim will hide if he will see a bear.', 'Tim will hide if he sees a bear.', 'if 後面用現在式'],
    ['Jimmy should eats an apple.', 'Jimmy should eat an apple.', 'should ＋ 原形動詞'],
  ]}, [
  C('We walked ___ the woods. There were trees all around us.', ['through', 'over', 'between'], '從樹林裡面穿過去 → through'),
  C('The frog sat ___ the two rocks.', ['between', 'through', 'along'], '兩個東西中間 → between'),
  C('Susie and Becky were walking ___ the stream. The stream was next to them all the time.', ['along', 'across', 'through'], '沿著 → along'),
  C('Chuck jumped ___ the rock.', ['over', 'through', 'between'], '從上面越過 → over'),
  C('The snake was crawling ___ the grass to the other side.', ['across', 'along', 'around'], '到另一邊 → across'),
  C('The bear ___ climbing a tree when it fell.', ['was', 'were', 'is'], 'bear＝it → was'),
  C('The baby birds were singing when their mother ___ home.', ['came', 'comes', 'was coming'], 'when 後面用過去式'),
  C('Pam was hiking when she ___ some beetles.', ['found', 'finds', 'was finding'], 'when 後面用過去式'),
  C('What ___ you doing when you heard a wolf?', ['were', 'was', 'did'], 'you → were ＋ V-ing'),
  C('You should make a lot of noise if you ___ a bear.', ['see', 'will see', 'saw'], 'if 後面用現在式'),
  C('Tim will hide if he ___ a bear.', ['sees', 'see', 'will see'], 'if 後面用現在式；he → sees'),
  C('Jimmy should ___ an apple if he is hungry.', ['eat', 'eats', 'eating'], 'should ＋ 原形動詞'),
  O('Who ran through the woods?', 'through＝穿過'),
  O('The bear was climbing a tree when it fell.', '(was ＋ V-ing) when (過去式)'),
  O('Tim will hide if he sees a bear.', 'will ＋ 動詞 ＋ if ＋ 現在式'),
], [
  LF('Wally walked around the bushes.', 'Wally walked ___ the bushes.', ['around', 'along', 'across'], 'around＝繞著'),
  LF('Pam was hiking when she found some beetles.', 'Pam was ___ when she found some beetles.', ['hiking', 'biking', 'walking'], 'hike＝健行'),
  LP('Kate will not drink water if she is thirsty.', ['Kate will drink water if she is thirsty.', 'Kate will not eat bread if she is hungry.'], '聽清楚 will not'),
  LO('What should you do if you see a bear?', 'What should you do if …?'),
], {
  'title': 'au / aw · al / all',
  'sounds': [
    {'name': 'au / aw', 'ipa': 'ɔ', 'rule': 'au、aw 唸 /ɔ/，嘴巴圓圓張開', 'words': ['f[au]lt', 'y[aw]n', 'c[au]tion', '[aw]ful']},
    {'name': 'al / all', 'ipa': 'ɔl', 'rule': 'al、all 唸 /ɔl/', 'words': ['st[all]', 'h[al]ter']},
  ],
  'practice': ['vaunted', 'malted', 'staunch', 'dawdle', 'maudlin', 'maw', 'crawly', 'causal', 'calling', 'faucet', 'yawn', 'lawful',
               'bald', 'caucus', 'shawl', 'baldness', 'thaw', 'hall', 'haul', 'falter', 'malt', 'scald', 'cause', 'rawness'],
}, [
  PW('fault', ['felt', 'fit'], 'au 唸 /ɔ/'),
  PW('stall', ['still', 'stale'], 'all 唸 /ɔl/'),
  PW('yawn', ['yarn', 'young'], 'aw 唸 /ɔ/'),
])

# ───────────────────────── U8 ─────────────────────────
unit('U8', {
  'title': 'Sensory Verbs · Comparative Adjectives · see / hear (something) V-ing',
  'zh': '感官動詞；比較級（比……更……）；看到／聽到某人正在做某事',
  'rules': [
    ['look / smell / sound / taste / feel ＋ 形容詞', 'How does the recorder sound? It sounds scary.'],
    ['look / smell / sound / taste / feel ＋ like ＋ 名詞', 'What did the water taste like? It tasted like chicken.'],
    ['一個音節：A be 形容詞-er than B', 'The pink butterfly is bigger than the yellow butterfly.'],
    ['兩個以上音節：A be more 形容詞 than B（bad → worse）', 'The small egg is more colorful than the big egg.'],
    ['see / hear ＋ 某人或某物 ＋ V-ing', 'Alice sees a mouse digging a hole.'],
    ['', 'Tim heard Alice talking loudly.'],
  ],
  'phrases': [['更多例句', 'The mouse felt soft.　The ground smelled terrible.　The turtle looks like a dinosaur.　The gray pigeon was heavier than the purple pigeon.']],
  'mistakes': [
    ['The mouse felt softly.', 'The mouse felt soft.', '感官動詞後面接形容詞'],
    ['The turtle looks a dinosaur.', 'The turtle looks like a dinosaur.', '接名詞要加 like'],
    ['The pink butterfly is more big than the yellow one.', 'The pink butterfly is bigger than the yellow one.', '一個音節加 -er'],
    ["Kate's hot dog was badder than Becky's.", "Kate's hot dog was worse than Becky's.", 'bad 的比較級是 worse'],
  ]}, [
  C('How does the recorder sound? It sounds ___.', ['scary', 'like scary', 'scarily'], 'sound ＋ 形容詞'),
  C('The tree feels ___ a rock.', ['like', 'as', 'than'], 'feel like ＋ 名詞'),
  C('The turtle looks ___ a dinosaur.', ['like', 'as', 'to'], 'look like ＋ 名詞'),
  C('The mouse felt ___.', ['soft', 'softly', 'like soft'], 'feel ＋ 形容詞'),
  C('The pink butterfly is ___ than the yellow butterfly.', ['bigger', 'more big', 'biggest'], '一個音節 → big ＋ g ＋ er'),
  C('The small egg is ___ colorful than the big egg.', ['more', 'most', 'very'], '兩個以上音節 → more'),
  C("Kate's hot dog was ___ than Becky's hot dog.", ['worse', 'badder', 'more bad'], 'bad → worse'),
  C('The gray pigeon was ___ than the purple pigeon.', ['heavier', 'heavyer', 'more heavy'], 'heavy → y 改 i ＋ er'),
  C('Alice sees a mouse ___ a hole.', ['digging', 'digs', 'dug'], 'see ＋ 某物 ＋ V-ing'),
  C('Tim heard Alice ___ loudly.', ['talking', 'talks', 'talked'], 'hear ＋ 某人 ＋ V-ing'),
  C('The ground ___ terrible.', ['smelled', 'smelled like', 'smelly'], 'smell ＋ 形容詞'),
  O('What did the water taste like?', 'taste like ＋ 名詞'),
  O('The pink butterfly is bigger than the yellow butterfly.', '形容詞-er than'),
  O('Tim hears his father playing the recorder.', 'hear ＋ 某人 ＋ V-ing'),
], [
  LF('The ground smelled terrible.', 'The ground ___ terrible.', ['smelled', 'sounded', 'tasted'], '用鼻子聞 → smell'),
  LF('It tasted like chicken.', 'It ___ like chicken.', ['tasted', 'looked', 'felt'], '用嘴巴嚐 → taste'),
  LP('The gray pigeon was heavier than the purple pigeon.', ['The gray pigeon was bigger than the purple pigeon.', 'The purple pigeon was heavier than the gray pigeon.'], '聽清楚 heavier 和誰比較重'),
  LO("Becky's mother saw Jimmy running in and out.", 'see ＋ 某人 ＋ V-ing'),
], {
  'title': 'ow / ou',
  'sounds': [
    {'name': 'ow / ou', 'ipa': 'aʊ', 'rule': 'ow、ou 唸 /aʊ/，像「ㄠ」', 'words': ['s[ou]th', 'cr[ow]n', 'b[ou]ncing', 'p[ow]der']},
  ],
  'practice': ['chow', 'rounded', 'cowling', 'noun', 'sprout', 'rout', 'gown', 'poundage', 'trowel', 'howling', 'pout', 'countless',
               'dowry', 'joust', 'bounden', 'louse', 'scowl', 'gout', 'mouthful', 'prowl', 'growler', 'scoundrel', 'crowded', 'now'],
}, [
  PW('crown', ['crone', 'crane'], 'ow 唸 /aʊ/（crone 的 o_e 唸 /o/）'),
  PW('now', ['know', 'new'], 'ow 唸 /aʊ/'),
  PW('pout', ['pot', 'put'], 'ou 唸 /aʊ/'),
])

# ───────────────────────── U9 ─────────────────────────
unit('U9', {
  'title': 'as (adv.) as … could · Superlative Adjectives · Adverbs',
  'zh': '盡可能地……；最高級（最……）；副詞：怎麼做',
  'rules': [
    ['動詞 ＋ as ＋ 副詞 ＋ as ＋ 某人 ＋ could：盡可能地……', 'The goat jumped as high as it could.'],
    ['', 'How carefully did the farmers burn the leaves? They burned them as carefully as they could.'],
    ['一個音節：A be the 形容詞-est', 'The blue turtle is the biggest.'],
    ['兩個以上音節：A be the most 形容詞', 'Is the vendor with the purple shirt the most polite?'],
    ['副詞（形容詞 ＋ ly）說明動作怎麼做', 'The fox crossed the road quickly.'],
    ['', 'Kate was laughing happily.'],
  ],
  'phrases': [['更多例句', 'Were the thin pigs the hungriest?　The gray eagle was the fastest.　The truck driver isn\'t eating slowly.']],
  'mistakes': [
    ['The goat jumped as high as it can.', 'The goat jumped as high as it could.', '過去的事用 could'],
    ['The blue turtle is the most big.', 'The blue turtle is the biggest.', '一個音節 → the 形容詞-est'],
    ['The fox crossed the road quick.', 'The fox crossed the road quickly.', '說明動作用副詞 quickly'],
    ['Kate was the most crazy.', 'Kate was the craziest.', 'crazy → y 改 i ＋ est'],
  ]}, [
  C('The goat jumped as high as it ___.', ['could', 'can', "can't"], '過去的事 → could'),
  C('They burned the leaves as ___ as they could.', ['carefully', 'careful', 'more careful'], 'as ＋ 副詞 ＋ as'),
  C('The blue turtle is the ___.', ['biggest', 'bigger', 'most big'], '一個音節 → biggest'),
  C('Is the vendor with the purple shirt the ___ polite?', ['most', 'more', 'very'], '兩個音節 → the most'),
  C('The gray eagle was the ___.', ['fastest', 'faster', 'most fast'], 'the ＋ 形容詞-est'),
  C('Were the thin pigs the ___?', ['hungriest', 'hungryest', 'most hungry'], 'hungry → y 改 i ＋ est'),
  C('Kate was not the ___.', ['craziest', 'crazyest', 'most crazy'], 'crazy → y 改 i ＋ est'),
  C('The fox crossed the road ___.', ['quickly', 'quick', 'quicker'], '說明怎麼過馬路 → 副詞 quickly'),
  C('Kate was laughing ___.', ['happily', 'happy', 'happyly'], 'happy → y 改 i ＋ ly'),
  C("The truck driver isn't eating ___.", ['slowly', 'slow', 'slower'], '說明怎麼吃 → 副詞 slowly'),
  C('They are reading ___ because they want to learn about Snow Mountain.', ['carefully', 'careful', 'care'], '說明怎麼讀 → 副詞 carefully'),
  O('The goat jumped as high as it could.', 'as ＋ 副詞 ＋ as ＋ it could'),
  O('The gray eagle was the fastest.', 'the ＋ 形容詞-est'),
  O('Kate was laughing happily.', '副詞放在動詞後面'),
], [
  LF('The fox crossed the road quickly.', 'The fox crossed the road ___.', ['quickly', 'quietly', 'slowly'], 'quickly＝很快地'),
  LF('Did the sailor sing as wonderfully as he could?', 'Did the sailor sing as ___ as he could?', ['wonderfully', 'carefully', 'happily'], 'as ＋ 副詞 ＋ as'),
  LP('The blue turtle is the biggest.', ['The blue turtle is bigger.', 'The brown turtle is the biggest.'], '聽清楚 the biggest 和顏色'),
  LO('They are reading carefully.', '副詞放在動詞後面'),
], {
  'title': 'oy / oi',
  'sounds': [
    {'name': 'oy / oi', 'ipa': 'ɔɪ', 'rule': 'oy、oi 唸 /ɔɪ/，像「ㄛ一」連在一起', 'words': ['s[oy]', 'c[oi]n', 'r[oy]al', 'p[oi]son']},
  ],
  'practice': ['spoil', 'ploy', 'soy', 'coy', 'spoilage', 'coyly', 'coyness', 'voiceless', 'cloy', 'hoist', 'coif', 'oink',
               'loiter', 'goiter', 'poise', 'hoyden', 'broiling', 'foible', 'troy', 'joy', 'moisture', 'joyless', 'void', 'cloying'],
}, [
  PW('coin', ['cone', 'can'], 'oi 唸 /ɔɪ/'),
  PW('joy', ['jay', 'Joe'], 'oy 唸 /ɔɪ/'),
  PW('spoil', ['spill', 'spell'], 'oi 唸 /ɔɪ/'),
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

json.dump(G, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', {u: (len(G['questions'][u]), len(G['listening'][u])) for u in G['cards']})
