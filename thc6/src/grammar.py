# THC6（Tree House C6）grammar.json：課本 Grammar 頁（每單元 3 個文法點）＋ Phonics 頁＋會話站
# cards＝文法小卡；questions＝choice 選擇／order 排句子；listening＝lfill／lpick／lorder（用課本文法例句）＋發音聽辨（lpick，label 標成發音題）
# phonics＝發音小卡（每個音：規則、例字、紅字部分用 [ ] 標出）＋ 練習字 24 個
# 會話站（課本 Conversation）：見 talk.py
# 所有選擇題的正確答案寫在第一個（a=0），App 會打亂順序
# 目前寫好：U1、U2（其他單元一單元一單元補，補好再把 words.py 的 OPEN 打開）
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
