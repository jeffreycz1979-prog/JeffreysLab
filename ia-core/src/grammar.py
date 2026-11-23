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

# ───────────────────────── U3 Crowdfunding ─────────────────────────
unit('U3', {
  'title': 'Indefinite Pronouns',
  'zh': '不定代名詞：不說清楚是「誰、什麼、哪裡」。人用 -body／-one、東西用 -thing、地方用 -where',
  'rules': [
    ['some-：肯定句、yes 的回答', 'Someone donated $1,000 to our project!'],
    ['any-：問句', 'Did anyone watch our video?'],
    ['no-：「沒有」，當主詞時動詞不加 not', 'No one gave up.'],
    ['any- 當受詞時：動詞加 not', "I didn't see anything on the website."],
    ['every-：每一個（動詞用單數）', 'Everyone likes the Griz Coat.'],
    ['人：somebody／someone…　東西：something…　地方：somewhere…', 'I put my phone somewhere, but I can\'t find it.'],
  ],
  'phrases': [['回答的公式', 'Will anyone donate? → Yes, someone will. ／ No, no one will.'],
              ['東西、地方的「沒有」', "No, I didn't buy anything.＝No, I bought nothing."]],
  'mistakes': [
    ["No one didn't donate.", 'No one donated.', 'no one 已經是「沒有」，動詞不再加 not'],
    ["I didn't see nothing.", "I didn't see anything.", '有 not 的時候用 any-'],
    ['Everyone like crowdfunding.', 'Everyone likes crowdfunding.', 'everyone 當一個人看，動詞加 s'],
    ['Did you buy something? No, I didn\'t buy something.', "Did you buy anything? No, I didn't buy anything.", '問句和否定用 any-'],
  ]}, [
  C('___ in my class watched the Pebble video, so we all know about it.', ['Everybody', 'Nobody', 'Anybody'], '「全班」都看了 → everybody'),
  C("The campaign got ___, so the brothers were very sad.", ['nothing', 'something', 'everything'], '很難過 → 什麼都沒募到 → nothing'),
  C("No, I didn't tell ___ about our project.", ['anyone', 'no one', 'someone'], "有 didn't 了，受詞用 any-"),
  C("I saved the video ___, but I can't find it now.", ['somewhere', 'nowhere', 'anywhere'], '存在「某個地方」→ somewhere'),
  C('Did ___ watch our crowdfunding video?', ['anyone', 'someone', 'no one'], '問句用 any-'),
  C('Yes, ___ donated $100 to our project!', ['someone', 'anyone', 'no one'], 'yes 的回答用 some-'),
  C('___ needs to give a lot of money. Many people give a little.', ['No one', 'Anyone', 'Everyone'], '「沒有人」需要給很多 → no one'),
  C('Crowdfunding is open to ___. You can be rich or poor.', ['anyone', 'no one', 'nobody'], '「任何人」都可以 → anyone'),
  C("Is there ___ to eat? I'm hungry.", ['anything', 'something', 'nothing'], '問句用 anything'),
  C('Everyone ___ the new smartwatch.', ['likes', 'like', 'liking'], 'everyone 當單數 → likes'),
  C("We looked ___ for the cat, but we couldn't find it.", ['everywhere', 'nowhere', 'anyone'], '「到處」找 → everywhere'),
  O('No one wants to give up.', 'No one ＋ 肯定動詞'),
  O("I didn't see anything upstairs.", "didn't ＋ any-"),
  O('Someone donated money to our project.', '肯定句用 some-'),
], [
  LF('Will anyone eat those cookies?', 'Will ___ eat those cookies?', ['anyone', 'someone', 'no one'], '問句用 any-'),
  LP('No one called me today.', ['Someone called me today.', 'Everyone called me today.'], '聽清楚 no one（沒有人）'),
  LF('Everybody in my class watched the video.', '___ in my class watched the video.', ['Everybody', 'Nobody', 'Anybody'], '全班都看了 → everybody'),
  LO("There isn't anywhere to sit.", "isn't ＋ anywhere"),
])

# ───────────────────────── U4 Chinese Martial Arts ─────────────────────────
unit('U4', {
  'title': 'Passive Voice: Reporting Verbs',
  'zh': '用被動語態說「大家都說／大家相信」：It ＋ is／was／has been ＋ said／believed／thought ＋ that…（說的人不重要，或不確定是不是真的）',
  'rules': [
    ['It is said that…＝據說……', 'It is said that wushu was developed 4,000 years ago.'],
    ['It is believed that…＝一般相信……', 'It is believed that tai chi keeps people healthy.'],
    ['It was thought that…＝以前大家認為……（現在不一定這樣想）', 'It was thought that the earth was flat.'],
    ['It has been said that…＝一直有人說……', 'It has been said that Bruce Lee was very fast.'],
    ['改寫：Many people say/believe that … → It is said/believed that …', 'Many people believe that … → It is believed that …'],
    ['確定是事實就直接說，不用這個句型', 'Bruce Lee was a famous actor.'],
  ],
  'phrases': [['時態跟著原句', 'Many people think → It is thought／Many people thought → It was thought／Many people have said → It has been said']],
  'mistakes': [
    ['It is say that wushu is old.', 'It is said that wushu is old.', 'is 後面要用過去分詞 said'],
    ['It believed that tai chi is healthy.', 'It is believed that tai chi is healthy.', '被動要有 is／was'],
    ['Many people believed that … → It is believed that …', 'It was believed that …', '原句是過去式 → was'],
  ]}, [
  C('Many people say that wushu was developed by farmers. → It is ___ that wushu was developed by farmers.', ['said', 'say', 'saying'], 'is ＋ 過去分詞 said'),
  C('Many people believe that tai chi is good for your health. → It ___ believed that tai chi is good for your health.', ['is', 'was', 'has'], '原句現在式 believe → is'),
  C('Many people thought that being cold gave people the flu. → It ___ thought that being cold gave people the flu.', ['was', 'is', 'has'], '原句過去式 thought → was'),
  C('Many people have said that Everest is the most dangerous mountain. → It has ___ said that Everest is the most dangerous mountain.', ['been', 'be', 'being'], 'has been said'),
  C('It is said ___ wushu was developed by an emperor.', ['that', 'what', 'who'], 'It is said ＋ that ＋ 句子'),
  C('Many people believe that aliens will come soon. → It is ___ that aliens will come soon.', ['believed', 'believe', 'believing'], 'is ＋ believed'),
  C("I'm not sure it's true, but ___ that the monks could break stones with their hands.", ['it is said', 'it says', 'it is saying'], '不確定、只是聽說 → it is said that'),
  C('Many people thought tomorrow\'s typhoon would be bad. → It ___ thought that the typhoon would be bad.', ['was', 'is', 'were'], 'It 一律用單數 was'),
  C('It ___ believed that Sun Tzu wrote The Art of War.', ['is', 'are', 'were'], 'It 一律用 is／was'),
  C('Many people say that kung fu masters can fly. → ___ said that kung fu masters can fly.', ['It is', 'They are', 'It does'], 'It is said that…'),
  O('It is said that wushu is very old.', 'It ＋ is ＋ said ＋ that ＋ 句子'),
  O('It was thought that the earth was flat.', '過去的看法用 was thought'),
  O('It is believed that tai chi keeps people healthy.', 'It is believed that…'),
], [
  LF('It is said that the monks practiced every day.', 'It is ___ that the monks practiced every day.', ['said', 'say', 'saying'], 'is said'),
  LP('It was thought that the sun moved around the earth.', ['It is thought that the sun moved around the earth.', 'It has been thought that the sun moved around the earth.'], '聽清楚 was（過去的看法）'),
  LF('It is believed that wushu is good for the mind.', 'It is ___ that wushu is good for the mind.', ['believed', 'believe', 'believes'], 'is believed'),
  LO('It has been said that Bruce Lee was very fast.', 'It has been said that…'),
])

# ───────────────────────── U5 World Heritage Sites ─────────────────────────
unit('U5', {
  'title': 'may／might／could ＋ have ＋ p.p.',
  'zh': '猜測「過去可能發生過」的事：may／might／could (not) ＋ have ＋ 過去分詞；could not have＝「不可能」',
  'rules': [
    ['may have ＋ p.p.＝可能已經……（不確定）', 'The first city may have been in Turkey.'],
    ['might have ＋ p.p.＝也許……（不確定）', 'The ancient people might have used the river for water.'],
    ['could have ＋ p.p.＝有可能……', 'Mallory could have reached the top in 1924.'],
    ['may not／might not have ＋ p.p.＝可能沒有……', 'The archaeologists may not have found everything.'],
    ['⚠️ could not have ＋ p.p.＝「不可能」……（我不相信）', "The statues couldn't have moved by themselves."],
  ],
  'phrases': [['改寫的訣竅', "Maybe ＋ 過去式 → might have ＋ p.p.／It's possible that … → could have ＋ p.p.／It's not possible that … → couldn't have ＋ p.p."]],
  'mistakes': [
    ['The climbers may has died in the storm.', 'The climbers may have died in the storm.', 'may 後面一律用 have'],
    ['They might have went home.', 'They might have gone home.', 'have 後面用過去分詞 gone'],
    ["He couldn't have forget the answer.", "He couldn't have forgotten the answer.", 'forget → forgotten'],
  ]}, [
  C('Maybe the climbers went back down. → The climbers might have ___ back down.', ['gone', 'went', 'go'], 'have ＋ 過去分詞 gone'),
  C("It's possible that the Greeks used this tunnel. → The Greeks ___ have used this tunnel.", ['could', "couldn't", 'can'], "it's possible → could have"),
  C("It's not possible that a child carved this huge statue. → A child ___ have carved this huge statue.", ["couldn't", 'could', 'might'], "not possible → couldn't have"),
  C('Maybe the old city was not built by one group. → The old city may not have ___ built by one group.', ['been', 'be', 'being'], 'may not have been ＋ p.p.'),
  C('The first city may ___ been in Turkey.', ['have', 'has', 'had'], 'may 後面一律用 have'),
  C('Mallory could have ___ the top, but nobody knows.', ['reached', 'reach', 'reaching'], 'have ＋ reached'),
  C('The statues are too heavy. One man ___ have carried them.', ["couldn't", 'might', 'may'], '太重了，不可能 → couldn\'t have'),
  C('Ancient people might have ___ near rivers because animals came to drink.', ['lived', 'live', 'living'], 'have ＋ lived'),
  C("I don't believe it! My best friend ___ have forgotten my birthday.", ["couldn't", 'could', 'might'], "不相信、不可能 → couldn't have"),
  C('Jane may have ___ my watch. I\'m not sure.', ['broken', 'broke', 'break'], 'break → broke → broken'),
  O('The first city may have been in Turkey.', 'may ＋ have ＋ been'),
  O("The statues couldn't have moved by themselves.", "couldn't have＝不可能"),
  O('Grandma might have bought some candy.', 'might ＋ have ＋ bought'),
], [
  LF('The first climbers might not have been the winners.', 'The first climbers might not have ___ the winners.', ['been', 'be', 'being'], 'might not have been'),
  LP("The monk couldn't have lied to us.", ['The monk could have lied to us.', 'The monk might have lied to us.'], "聽清楚 couldn't（不可能）"),
  LF('The ancient people may have used the river for water.', 'The ancient people may have ___ the river for water.', ['used', 'use', 'using'], 'have ＋ used'),
  LO('Mallory could have reached the top.', 'could ＋ have ＋ reached'),
])

# ───────────────────────── U6 Lie Detector Tests ─────────────────────────
unit('U6', {
  'title': 'by ＋ V-ing／with ＋ (n.)',
  'zh': '說「怎麼做到的」：by ＋ 動名詞（用什麼方法）、with ＋ 名詞（用什麼東西）',
  'rules': [
    ['by ＋ V-ing＝藉由（做什麼事）', 'The police find the truth by collecting evidence.'],
    ['by 可以放句首，要加逗號', 'By staying calm, you might trick a polygraph.'],
    ['with ＋ 名詞＝用（什麼東西）', 'Scientists can see the brain with fMRI.'],
    ['改寫：use ＋ 東西 ＋ to V → V ＋ with ＋ 東西', 'I used tape to fix the light. → I fixed the light with tape.'],
    ['改寫：because ＋ 句子 → by ＋ V-ing', 'Alex learns English well because he reads every day. → Alex learns English well by reading every day.'],
  ],
  'phrases': [['分辨', 'by 後面接「做的事」（動作 V-ing）；with 後面接「東西」（名詞）']],
  'mistakes': [
    ['You can feel better by sleep eight hours.', 'You can feel better by sleeping eight hours.', 'by 後面用 V-ing'],
    ['He cleaned his ear by his finger.', 'He cleaned his ear with his finger.', '用「東西」→ with'],
    ['We finished the job with working hard.', 'We finished the job by working hard.', '做的事（動作）→ by V-ing'],
  ]}, [
  C('The interviewer measures your pulse ___ sensors.', ['with', 'by', 'from'], 'sensors 是東西 → with'),
  C('You might trick a polygraph by ___ calm.', ['staying', 'stay', 'stayed'], 'by ＋ V-ing'),
  C('Mia got better at English because she reads every day. → Mia got better at English by ___ every day.', ['reading', 'read', 'reads'], 'by ＋ reading'),
  C('The nurse uses a machine to check my blood pressure. → The nurse checks my blood pressure ___ a machine.', ['with', 'by', 'for'], 'machine 是東西 → with'),
  C('If you think of something stressful, you can trick the test. → ___ thinking of something stressful, you can trick the test.', ['By', 'With', 'For'], 'by ＋ V-ing 放句首'),
  C('The police used gloves to pick up the evidence. → The police picked up the evidence ___ gloves.', ['with', 'by', 'to'], 'gloves 是東西 → with'),
  C('By ___ the past, we can learn about the future.', ['studying', 'study', 'studies'], 'by ＋ V-ing'),
  C('We might make a better lie detector ___ fMRI.', ['with', 'by', 'of'], 'fMRI 是東西（機器）→ with'),
  C('The police solve crimes by ___ evidence.', ['collecting', 'collect', 'collected'], 'by ＋ V-ing'),
  C('You could get to school faster ___ taking a taxi.', ['by', 'with', 'for'], 'taking 是動作 → by'),
  O('The police find the truth by collecting evidence.', 'by ＋ V-ing'),
  O('I fixed the light with tape.', 'with ＋ 東西'),
  O('By staying calm, he tricked the polygraph.', 'By ＋ V-ing 放句首加逗號'),
], [
  LF('The police found the thief by working hard.', 'The police found the thief by ___ hard.', ['working', 'work', 'worked'], 'by ＋ working'),
  LP('I will fix the needle with tape.', ['I will fix the needle by tape.', 'I will fix the needle for tape.'], '東西用 with'),
  LF('Scientists study the brain with fMRI.', 'Scientists study the brain ___ fMRI.', ['with', 'by', 'from'], 'fMRI 是東西 → with'),
  LO('By studying the changes, she knew he was lying.', 'By ＋ V-ing, ＋ 句子'),
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
