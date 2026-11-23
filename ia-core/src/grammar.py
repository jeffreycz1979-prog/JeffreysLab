# IA2（Connections Book 2）句型：每單元一個文法重點（課本 Usage 頁）
# 例句、題目都是原創，主題跟著該單元課文走（不抄課本句子）
# IA 沒有發音 → phonics 不放；句型站只有文法小卡＋練習
import json, sys
def C(q, opts, tip):  return {'type': 'choice', 'q': q, 'opts': opts, 'a': 0, 'tip': tip}
def O(s, tip):        return {'type': 'order', 'words': s.split(' '), 'tip': tip}
def LF(say, q, opts, tip): return {'type': 'lfill', 'say': say, 'q': q, 'opts': opts, 'a': 0, 'tip': tip}
def LP(say, opts, tip):    return {'type': 'lpick', 'say': say, 'opts': [say] + opts, 'a': 0, 'tip': tip}
def LO(s, tip):       return {'type': 'lorder', 'words': s.split(' '), 'tip': tip}

G = {'_說明': 'IA2（Connections Book 2）文法。cards＝文法小卡；questions＝文法題（choice 選擇、order 排句子）；listening＝聽力題（lfill、lpick、lorder）。a＝正確選項位置（從 0 開始），App 會打亂選項順序。',
     'cards': {}, 'everyday': {}, 'questions': {}, 'listening': {}}

def unit(u, card, qs, ls):
    G['cards'][u] = card; G['questions'][u] = qs; G['listening'][u] = ls

# ───────────────────────── U1 Mount Everest ─────────────────────────
unit('U1', {
  'title': 'Compound Relative Pronouns',
  'zh': '複合關係代名詞：whoever／whatever／whenever／wherever／whichever／however＝「不管是誰／什麼／何時／哪裡／哪一個／怎麼……」',
  'rules': [
    ['whoever＝不管是誰；任何……的人', 'Whoever reaches the top of Everest must be very strong.'],
    ['whatever＝不管什麼；任何……的東西', 'The Sherpa carry whatever the climbers need.'],
    ['whenever＝不管什麼時候；每次', 'Whenever it snows, the trail is closed.'],
    ['wherever＝不管去哪裡', 'Wherever the climbers go, they leave trash behind.'],
    ['whichever＝不管哪一個（有幾個可以選）', 'You can take whichever trail you like.'],
    ['however＝不管用什麼方法', 'However you climb Everest, it is still dangerous.'],
  ],
  'phrases': [['單獨回答＝「哪個都可以」', 'Which tent do you want? — Whichever.　Where should we eat? — Wherever.'],
              ['改寫的訣竅', "It doesn't matter who … ／ Any person who … → Whoever …"]],
  'mistakes': [
    ['Who wins the race will get a prize.', 'Whoever wins the race will get a prize.', '「任何……的人」要用 whoever'],
    ['Whatever you go, I will go with you.', 'Wherever you go, I will go with you.', '地方用 wherever'],
    ["However you want, you can eat it.", 'Whatever you want, you can eat it.', '東西用 whatever；however 是「方法」'],
    ['Whoever you climb, it is dangerous.', 'However you climb, it is dangerous.', '「不管怎麼爬」是方法 → however'],
  ]}, [
  C('___ reaches the top of Everest must be very strong.', ['Whoever', 'Whatever', 'Wherever'], '指「任何人」→ whoever'),
  C('The Sherpa carry ___ the climbers need.', ['whatever', 'whoever', 'whenever'], '指「任何東西」→ whatever'),
  C('___ the climbers go, they leave trash behind.', ['Wherever', 'Whenever', 'Whoever'], '指「任何地方」→ wherever'),
  C('___ you climb Everest, it is still dangerous.', ['However', 'Whatever', 'Whichever'], '「不管用什麼方法」→ however'),
  C('___ I visit Grandma, she gives me a big hug.', ['Whenever', 'Wherever', 'Whoever'], '「每次、不管什麼時候」→ whenever'),
  C('Which trail do you want to take? — ___. They are both fine.', ['Whichever', 'Whoever', 'However'], '從幾個選項裡選、哪個都可以 → whichever'),
  C("I don't care where we go. ___ we go, I will have fun.", ['Wherever', 'Whatever', 'However'], "I don't care where → wherever"),
  C('Any person who watches this movie will cry. → ___ watches this movie will cry.', ['Whoever', 'Whatever', 'Whenever'], 'any person who → whoever'),
  C("It doesn't matter what you cook. ___ you cook, I will eat it.", ['Whatever', 'Whoever', 'Wherever'], "it doesn't matter what → whatever"),
  C('Any time you call me, I will answer. → ___ you call me, I will answer.', ['Whenever', 'Whichever', 'Wherever'], 'any time → whenever'),
  C('___ finds my dog will get a reward.', ['Whoever', 'However', 'Whichever'], '找到狗的「人」→ whoever'),
  C('You can sit ___ you want.', ['wherever', 'whoever', 'whatever'], '坐在「哪裡」→ wherever'),
  O('Whoever finds my dog will get a reward.', 'Whoever ＋ 動詞（當主詞）'),
  O('You can sit wherever you want.', 'wherever ＋ 句子＝不管哪裡'),
  O('However you climb, you need a good plan.', 'However ＋ 句子＝不管怎麼做'),
], [
  LF('Whoever climbs Everest needs extra oxygen.', '___ climbs Everest needs extra oxygen.', ['Whoever', 'Whatever', 'Wherever'], '爬山的「人」→ whoever'),
  LP('Whenever it snows, the trail is closed.', ['Wherever it snows, the trail is closed.', 'However it snows, the trail is closed.'], '聽清楚 whenever（每次、什麼時候）'),
  LF('Bring whatever you need for the trip.', 'Bring ___ you need for the trip.', ['whatever', 'whoever', 'whenever'], '需要的「東西」→ whatever'),
  LO('However you climb, you need a good plan.', 'However ＋ 句子＝不管怎麼做'),
])

# ───────────────────────── U2 Story-Telling ─────────────────────────
unit('U2', {
  'title': 'Subordinate Conjunctions',
  'zh': '從屬連接詞：even though／although（雖然）、as long as（只要）、as soon as（一……就）。可以放在句子開頭（要加逗號）或中間',
  'rules': [
    ['even though／although＝雖然……（前後意思相反）', 'Even though Crow was hungry, he helped Little Bear.'],
    ['⚠️ 中文說「雖然……但是……」，英文只能用一個：although 就不能再加 but', 'Although the story is old, it still teaches us a lesson.'],
    ['as long as＝只要……（條件）', 'As long as we work together, we will survive.'],
    ['as soon as＝一……就……（馬上接著發生）', 'As soon as Pangu woke up, he broke the egg.'],
    ['放在句子中間：不用逗號', 'Little Bear kept walking although it was dark.'],
  ],
  'phrases': [['課本小抄', 'even though ≈ although　as long as ≈ while（在……的期間）　as soon as ≈ when（就在那時）']],
  'mistakes': [
    ['Although the story is old, but it still has meaning.', 'Although the story is old, it still has meaning.', 'although 和 but 只能留一個'],
    ['As soon as we work together, we will survive.', 'As long as we work together, we will survive.', '「只要」是 as long as'],
    ['Even though I get home, I will call you.', 'As soon as I get home, I will call you.', '「一到家就」是 as soon as'],
  ]}, [
  C("___ Crow couldn't catch fish, he could fly very high.", ['Even though', 'As soon as', 'As long as'], '前後意思相反（不會抓魚／很會飛）→ even though'),
  C('___ we work together, we will survive.', ['As long as', 'Although', 'Even though'], '「只要」一起合作 → as long as'),
  C('___ Pangu woke up, he broke the egg.', ['As soon as', 'Although', 'As long as'], '「一」醒來「就」 → as soon as'),
  C('Although the story is very old, ___ still teaches us a lesson.', ['it', 'but it', 'so it'], 'although 已經有「雖然」，後面不能再加 but'),
  C('We can keep playing ___ it is bright enough to see.', ['as long as', 'although', 'even though'], '「只要」天還夠亮 → as long as'),
  C('Tim was still tired ___ he slept for ten hours.', ['although', 'as soon as', 'as long as'], '睡很久卻還是累 → 意思相反 → although'),
  C('I will call you ___ I get home.', ['as soon as', 'although', 'even though'], '「一」到家「就」打 → as soon as'),
  C('___ the student tried his best, studying was still difficult.', ['Even though', 'As soon as', 'As long as'], '很努力卻還是難 → even though'),
  C('You can play outside ___ you finish your homework first.', ['as long as', 'even though', 'although'], '條件：只要先寫完功課 → as long as'),
  C('___ the bell rings, we can go home.', ['As soon as', 'Although', 'Even though'], '鐘一響就 → as soon as'),
  O('Even though Crow was hungry, he helped Little Bear.', 'Even though ＋ 句子, ＋ 句子'),
  O('As soon as the bell rings, we can go home.', 'As soon as ＋ 句子, ＋ 句子'),
  O('It will get easier as long as you keep studying.', '放在句子中間不用逗號'),
], [
  LF('As soon as Crow saw Little Bear, he flew down.', '___ Crow saw Little Bear, he flew down.', ['As soon as', 'As long as', 'Although'], '一看到就飛下來 → as soon as'),
  LP('Although it was dark, Little Bear kept walking.', ['As long as it was dark, Little Bear kept walking.', 'As soon as it was dark, Little Bear kept walking.'], '聽清楚 although（雖然）'),
  LF('Even though the story is old, it still has meaning.', '___ the story is old, it still has meaning.', ['Even though', 'As soon as', 'As long as'], '舊卻還有意義 → even though'),
  LO('As long as we share, we will survive.', 'As long as ＋ 句子, ＋ 句子'),
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

G['lessons'] = {}
# 課文導讀（導讀卡、教學篇、練習篇；格式同 THP5 閱讀偵探）：見 reading.py
from reading import READING
for u in READING: assert u in G['cards'], u
G['reading'] = READING
json.dump(G, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', {u: (len(G['questions'][u]), len(G['listening'][u])) for u in G['cards']})
