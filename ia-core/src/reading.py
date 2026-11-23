# IA Core「課文導讀」站（grammar.json 的 reading）— 引擎沿用 THP5 閱讀偵探
# 和 THP5 不同：IA2 的目標是讀懂「課本這一篇」。
#   教學篇＝Claude 改寫的「簡單版課文」（同樣的事實、短句、一段一個重點；不放課本原文）
#   練習篇＝原創短文（延伸課文主題，或用同一個道理的新故事），驗收學生會不會用導讀卡的方法
# 降難度的招式：一段一句話大意 → 時間線／數字偵探 → 分兩堆 → 句型尋寶（找出本單元句型那一句）
# 中文翻譯與解說：學生作答之後才顯示（答錯一次給提示，第二次才給答案）。
#
# strategy: name 英文名、zh 中文名、intro 一句話說明、parts 每一部分的導讀問句、tip 小技巧
# teach:    title、paras（每段一個句子陣列）、zh（同樣結構的中文）、steps（每段的題目）
#           step: para 亮哪一段、part 對應導讀卡哪一格、q 題目、opts 英文選項、ozh 選項中文、a 答案、
#                 hint 第一次答錯的提示、why 答完的解說、ev 證據句（全文句子編號，從 0 開始）
# practice: title、sents（句子陣列）、zh、tasks
#           sort:     items [英文, 中文, 第幾格]，slots 格子名稱
#           group:    groups 格子名稱、items [英文, 中文, 第幾格]（全部分對才算）
#           choice:   opts、ozh、a
#           evidence: 點出文章裡的句子，a 可以接受的句子編號

READING = {
 'U1': {
  'strategy': {
   'name': 'Timeline + Problem & Solution', 'zh': '時間線＋問題與解決',
   'intro': '課文很長、數字很多？先抓時間線，再分清楚「出了什麼問題」和「怎麼解決」。',
   'parts': [
    {'k': 'T', 'zh': '時間線', 'en': 'Timeline', 'ic': '📅', 'q': '找年份：先發生什麼？後來呢？'},
    {'k': 'P', 'zh': '問題', 'en': 'Problem', 'ic': '⚠️', 'q': '哪裡出了問題？為什麼危險？'},
    {'k': 'S', 'zh': '解決', 'en': 'Solution', 'ic': '✅', 'q': '有人怎麼處理？還可以怎麼做？'},
   ],
   'tip': '先把年份和數字圈起來，再一段一段問自己：「這段在說什麼？」看到 To help、so、However 這種字要停下來。',
  },
  'teach': {
   'title': 'Everest: Too Many Climbers?',
   'paras': [
    ['Mount Everest is the tallest mountain in the world.',
     "It is on the border between Nepal and China's Tibet region.",
     'The first efforts to climb it began in the 1920s.',
     'In 1924, two climbers got very close to the top, but they never came back.',
     'In 1953, Tenzing Norgay and Edmund Hillary finally reached the top together.'],
    ['In 1993, businesses started selling climbing services.',
     'Professional climbers plan the trip and do the hard work, so amateur climbers can go too.',
     'Now hundreds of climbers wait in long lines on steep, narrow trails.',
     'Many of them also leave trash on the mountain.',
     'To help, Nepal makes each climber carry 8 kg of trash down.'],
    ['Everest is still very dangerous.',
     'Climbers fall, freeze, or get sick from the low oxygen, and avalanches can kill many people at once.',
     'The Sherpa are people from Nepal, and their bodies work well high up on the mountain.',
     'They carry heavy packs and do almost all the dangerous work.',
     'Most of the people who died in the 2014 avalanche were Sherpa.',
     'However Nepal solves these problems, it should do it soon.'],
   ],
   'zh': [
    ['聖母峰是世界上最高的山。', '它在尼泊爾和中國西藏地區的邊界上。', '第一批攀登它的嘗試從 1920 年代開始。',
     '1924 年，兩個登山家已經非常接近山頂，但是再也沒有回來。', '1953 年，丹增・諾蓋和艾德蒙・希拉瑞終於一起登上山頂。'],
    ['1993 年，公司開始販賣登山服務。', '專業登山家規劃行程、做困難的工作，所以業餘登山客也能去。',
     '現在好幾百個登山客在又陡又窄的山路上排長長的隊。', '他們很多人也把垃圾留在山上。', '為了改善，尼泊爾規定每個登山客要帶 8 公斤的垃圾下山。'],
    ['聖母峰還是非常危險。', '登山客會摔落、凍傷，或因為氧氣太少而生病，雪崩也可能一次奪走很多人的性命。',
     '雪巴人是尼泊爾的原住民，他們的身體在高山上也能好好運作。', '他們背很重的背包，幾乎做了所有危險的工作。',
     '2014 年雪崩的罹難者大部分是雪巴人。', '不管尼泊爾用什麼方法解決這些問題，都應該快一點。'],
   ],
   'steps': [
    {'para': 0, 'part': 0, 'q': '第一段大部分在講什麼？',
     'opts': ['The first people who tried to climb Everest', 'Why Everest is so dangerous', 'How much an Everest trip costs'],
     'ozh': ['最早嘗試爬聖母峰的人', '聖母峰為什麼這麼危險', '聖母峰行程要多少錢'], 'a': 0,
     'hint': '這段有好幾個年份：1920s、1924、1953。這些年份都在講什麼人做什麼事？',
     'why': '1920s 開始嘗試、1924 年兩個人沒回來、1953 年第一次登頂——整段都在講「最早去爬聖母峰的人」。', 'ev': [2, 3, 4]},
    {'para': 0, 'part': 0, 'q': 'Who were the first people to reach the top?',
     'opts': ['Tenzing Norgay and Edmund Hillary', 'The two climbers in 1924', 'The Sherpa in 2014'],
     'ozh': ['丹增・諾蓋和艾德蒙・希拉瑞', '1924 年的兩個登山家', '2014 年的雪巴人'], 'a': 0,
     'hint': '找 finally 和 reached the top。1924 年那兩個人 never came back，他們有沒有確定登頂？',
     'why': 'In 1953, Tenzing Norgay and Edmund Hillary finally reached the top together. finally＝「終於」，表示前面的人都沒成功。', 'ev': [4]},
    {'para': 1, 'part': 1, 'q': 'Why can amateur climbers climb Everest now?',
     'opts': ['Professional climbers plan the trip and do the hard work.', 'The trails are wider and safer now.', 'There is more oxygen on the mountain now.'],
     'ozh': ['專業登山家規劃行程、做困難的工作。', '現在山路比較寬、比較安全。', '現在山上的氧氣比較多。'], 'a': 0,
     'hint': '找 so：so 後面是結果（業餘的人也能去），so 前面就是原因。',
     'why': 'Professional climbers plan the trip and do the hard work, so amateur climbers can go too. 原因在 so 前面。文章說山路又陡又窄，沒有變寬喔。', 'ev': [6]},
    {'para': 1, 'part': 2, 'q': 'What does "8 kg" mean in this paragraph?',
     'opts': ['The trash each climber must carry down', 'The weight of one oxygen tank', 'The food a climber eats in one day'],
     'ozh': ['每個登山客要帶下山的垃圾', '一瓶氧氣筒的重量', '登山客一天吃的食物'], 'a': 0,
     'hint': '數字偵探：8 kg 前後是什麼字？To help 後面是在解決哪個問題？',
     'why': 'To help, Nepal makes each climber carry 8 kg of trash down. 這是解決「垃圾問題」的方法。', 'ev': [9]},
    {'para': 2, 'part': 1, 'q': 'Who does almost all the dangerous work?',
     'opts': ['The Sherpa', 'The amateur climbers', 'The businesses'],
     'ozh': ['雪巴人', '業餘登山客', '登山公司'], 'a': 0,
     'hint': '找 almost all the dangerous work，往前看 They 指的是誰。',
     'why': 'They carry heavy packs and do almost all the dangerous work. They＝前一句的 the Sherpa。代名詞要往前找它指誰！', 'ev': [12, 13]},
    {'para': 2, 'part': 2, 'q': 'What does the last sentence mean?',
     'opts': ['Nepal should fix the problems soon, in any way it can.', 'Nepal has already fixed the problems.', 'Nepal does not want to fix the problems.'],
     'ozh': ['不管用什麼方法，尼泊爾都應該快點解決問題。', '尼泊爾已經解決問題了。', '尼泊爾不想解決問題。'], 'a': 0,
     'hint': 'However ＋ 句子＝「不管怎麼……」——這就是本單元的句型！',
     'why': 'However Nepal solves these problems＝不管尼泊爾怎麼解決；it should do it soon＝都應該快一點。這句用的是本單元的複合關係代名詞 however。', 'ev': [15]},
   ],
   'sumTitle': '📅 聖母峰時間線',
   'sum': [['1924', '兩個人差一點登頂，但沒有回來'], ['1953', 'Norgay 和 Hillary 第一次登頂'],
           ['1993', '公司開始賣登山服務，業餘的人也能爬'], ['現在', '人太多、垃圾多、雪崩危險；雪巴人做最危險的工作']],
  },
  'practice': {
   'title': 'Three Problems on Everest',
   'sents': [
    'Everest has three big problems today.',
    'The first problem is crowds: sometimes hundreds of people wait in line on one narrow trail.',
    'The second problem is trash.',
    'Climbers leave tents, bottles, and human waste, and the cold keeps the waste from disappearing.',
    'Nepal already makes each climber carry 8 kg of trash down, and this has helped some.',
    'The third problem is danger, especially for the Sherpa.',
    'In 2015, an earthquake caused an avalanche, and 22 more people were killed.',
    'Some people think Nepal should allow only a few climbers each year.',
    'Others think only small teams should climb together.',
    'Whatever Nepal decides, the mountain needs help soon.',
   ],
   'zh': [
    '聖母峰現在有三個大問題。', '第一個問題是人潮：有時候好幾百個人在同一條窄山路上排隊。', '第二個問題是垃圾。',
    '登山客留下帳篷、瓶子和排泄物，而且天氣太冷，排泄物不會分解消失。', '尼泊爾已經規定每個登山客要帶 8 公斤垃圾下山，這有一點幫助。',
    '第三個問題是危險，特別是對雪巴人。', '2015 年，一場地震引發雪崩，又有 22 個人罹難。',
    '有些人認為尼泊爾每年應該只讓少數登山客上山。', '也有人認為只能讓小隊伍一起爬。', '不管尼泊爾決定怎麼做，這座山都需要趕快被幫助。',
   ],
   'tasks': [
    {'type': 'group', 'q': '每張卡片是「問題」還是「解決方法」？（6 張都要分對）', 'groups': ['⚠️ 問題', '✅ 解決方法'],
     'items': [['long lines on one narrow trail', '同一條窄山路上大排長龍', 0],
               ["human waste that doesn't disappear", '不會消失的排泄物', 0],
               ['an avalanche caused by an earthquake', '地震引發的雪崩', 0],
               ['carry 8 kg of trash down', '帶 8 公斤垃圾下山', 1],
               ['allow only a few climbers each year', '每年只讓少數人上山', 1],
               ['only small teams climb together', '只讓小隊伍一起爬', 1]],
     'hint': '問自己：這件事是讓山「變糟」（問題），還是讓山「變好」（解決）？看到 should、makes … carry 通常是解決方法。',
     'why': '人潮、排泄物、雪崩是問題；帶垃圾下山已經在做，限制人數、只讓小隊伍爬是有人提出的解決方法。'},
    {'type': 'choice', 'q': '🔢 數字偵探：What does "22" mean in this passage?',
     'opts': ['The people killed in the 2015 avalanche', 'The climbers waiting on one trail', 'The kilograms of trash each climber carries'],
     'ozh': ['2015 年雪崩罹難的人數', '在一條山路上排隊的人數', '每個人要帶的垃圾公斤數'], 'a': 0,
     'hint': '找到 22，看它後面接的是什麼字（people? kg?）。',
     'why': 'In 2015, an earthquake caused an avalanche, and 22 more people were killed. 22 後面是 people were killed。垃圾是 8 kg 喔。'},
    {'type': 'evidence', 'q': '🔍 句型尋寶：哪一句用了本單元的句型（whoever／whatever／wherever／however…）？點出那一句。', 'a': [9],
     'hint': '找開頭是 Wh…ever 或 However 的句子。',
     'why': 'Whatever Nepal decides, the mountain needs help soon.＝不管尼泊爾決定什麼，這座山都需要幫助。whatever＝不管什麼。'},
   ],
  },
 },
 'U2': {
  'strategy': {
   'name': 'Story → Lesson', 'zh': '故事和它教的道理',
   'intro': '課文裡有好幾個小故事：先看懂「發生什麼事」，再找「它想教我們什麼」。',
   'parts': [
    {'k': 'S', 'zh': '故事', 'en': 'Story', 'ic': '📖', 'q': '誰？發生了什麼事？最後怎麼了？'},
    {'k': 'L', 'zh': '道理', 'en': 'Lesson', 'ic': '💡', 'q': '這個故事想教我們什麼？'},
   ],
   'tip': '找 The story teaches us that…、The lesson is… 這種句子，後面通常就是道理。一個故事講完，下一段常常換新的故事。',
  },
  'teach': {
   'title': 'Why Do We Tell Stories?',
   'paras': [
    ["Long ago, people didn't have the Internet, TV, or even books.",
     'To entertain themselves, they told stories.',
     'But stories were not only for fun.',
     'They also taught lessons.'],
    ['The Chinese story of Pangu tells how the world began.',
     'Pangu slept inside a black egg for 18,000 years.',
     'When he woke up, he stretched and broke the egg into heaven and earth.',
     'He held heaven up with his hands and held the earth down with his feet, so the two stayed separate.',
     'The story teaches us that the world needs balance, like light (yang) and darkness (yin).'],
    ["A story from Canada's west coast is about Crow and Little Bear.",
     'Little Bear wandered away and got lost, and Crow was not good at catching food.',
     'Crow flew high and showed Little Bear the way home, and Little Bear caught fish for Crow.',
     'Neither of them could survive alone, but together they made it home.',
     'The lesson is that we should share and work together.'],
    ['In an old Buddhist story, a student had difficulty remembering what he read.',
     'His teacher said, "Keep studying. You\'ll feel differently soon."',
     'Later, studying became easy, and the teacher said the same thing again.',
     "Everything in life changes, so we shouldn't get too happy or too sad.",
     'Even though these stories are old, they still have meaning for us today.'],
   ],
   'zh': [
    ['很久以前，人們沒有網路、電視，甚至沒有書。', '為了娛樂自己，他們說故事。', '但是故事不只是為了好玩。', '故事也在教道理。'],
    ['中國盤古的故事說的是世界怎麼開始。', '盤古在一顆黑色的蛋裡睡了一萬八千年。', '他醒來後伸了個懶腰，把蛋打破，變成天和地。',
     '他用手撐住天、用腳踩住地，所以天和地一直分開。', '這個故事教我們：世界需要平衡，就像光明（陽）和黑暗（陰）。'],
    ['一個來自加拿大西岸的故事，主角是烏鴉和小熊。', '小熊走丟迷路了，而烏鴉不太會抓食物。',
     '烏鴉飛得高高的，幫小熊指出回家的路；小熊抓魚給烏鴉吃。', '他們誰都沒辦法自己活下去，但是一起合作就回到了家。', '道理是：我們應該分享、一起合作。'],
    ['在一個古老的佛教故事裡，一個學生很難記住他讀過的東西。', '老師說：「繼續讀，你很快就會有不同的感覺。」',
     '後來讀書變簡單了，老師又說了一樣的話。', '人生的每件事都會改變，所以我們不應該太開心或太難過。', '雖然這些故事很古老，對現在的我們還是有意義。'],
   ],
   'steps': [
    {'para': 0, 'part': 1, 'q': 'Why did ancient people tell stories?',
     'opts': ['To have fun and to teach lessons', 'To sell books', 'To learn how to use the Internet'],
     'ozh': ['為了好玩，也為了教道理', '為了賣書', '為了學怎麼用網路'], 'a': 0,
     'hint': '有兩個原因：一個在 To entertain themselves，另一個在 They also…',
     'why': 'To entertain themselves, they told stories.（為了好玩）＋ They also taught lessons.（也教道理）。also 表示「還有另一個」。', 'ev': [1, 3]},
    {'para': 1, 'part': 0, 'q': 'What did Pangu do after he woke up?',
     'opts': ['He broke the egg into heaven and earth.', 'He slept for another 18,000 years.', 'He gave the egg to the gods.'],
     'ozh': ['他把蛋打破，變成天和地。', '他又睡了一萬八千年。', '他把蛋送給神。'], 'a': 0,
     'hint': '找 When he woke up，後面就是答案。',
     'why': 'When he woke up, he stretched and broke the egg into heaven and earth. 18,000 年是他「醒來之前」睡的時間。', 'ev': [6]},
    {'para': 1, 'part': 1, 'q': 'What does the Pangu story teach us?',
     'opts': ['The world needs balance.', 'We should sleep a lot.', 'Light is better than darkness.'],
     'ozh': ['世界需要平衡。', '我們應該多睡覺。', '光明比黑暗好。'], 'a': 0,
     'hint': '找 The story teaches us that…',
     'why': 'The story teaches us that the world needs balance——光明和黑暗都要有，不是哪一個比較好。', 'ev': [8]},
    {'para': 2, 'part': 0, 'q': 'How did Crow help Little Bear?',
     'opts': ['He flew high and showed him the way home.', 'He caught fish for him.', 'He carried him home on his back.'],
     'ozh': ['他飛得高高的，幫小熊指出回家的路。', '他抓魚給小熊。', '他把小熊背回家。'], 'a': 0,
     'hint': '小心！這句有兩個人在幫忙。and 前面是誰幫誰？and 後面是誰幫誰？',
     'why': 'Crow flew high and showed Little Bear the way home.（烏鴉幫小熊）, and Little Bear caught fish for Crow.（小熊幫烏鴉）。抓魚的是小熊喔。', 'ev': [11]},
    {'para': 2, 'part': 1, 'q': 'What is the lesson of Crow and Little Bear?',
     'opts': ['We should share and work together.', 'Bears are better at fishing than birds.', 'Never leave your family.'],
     'ozh': ['我們應該分享、一起合作。', '熊比鳥會抓魚。', '永遠不要離開家人。'], 'a': 0,
     'hint': '找 The lesson is that…',
     'why': 'The lesson is that we should share and work together. 小熊會抓魚、烏鴉會飛，各有所長，合作才活得下去。', 'ev': [13]},
    {'para': 3, 'part': 1, 'q': 'Why did the teacher say the same thing two times?',
     'opts': ['Because everything changes, on good days and bad days.', 'Because he forgot what he said before.', "Because the student didn't listen."],
     'ozh': ['因為不管好日子或壞日子，一切都會改變。', '因為他忘記自己說過了。', '因為學生沒在聽。'], 'a': 0,
     'hint': '第一次是學生覺得很難（壞日子），第二次是覺得很簡單（好日子）。找講「道理」的那一句。',
     'why': "Everything in life changes, so we shouldn't get too happy or too sad. 難的時候會變簡單，簡單的時候也可能再變難，所以老師兩次都說「你很快會有不同的感覺」。", 'ev': [17]},
   ],
   'sumTitle': '💡 故事 → 道理',
   'sum': [['盤古', '世界需要平衡（陰陽）'], ['烏鴉與小熊', '要分享、一起合作'], ['學生與老師', '一切都會改變，別太開心也別太難過']],
  },
  'practice': {
   'title': 'The Two Farmers',
   'sents': [
    'Two farmers lived next to each other.',
    'One farmer had an orchard full of apple trees, and the other had a river full of fish.',
    'For years, they never talked to each other.',
    "One summer, it didn't rain, and the apple trees started to die.",
    'The river got low, too, and the fish were hard to catch.',
    "As soon as the apple farmer saw his neighbor's empty net, he brought him a barrel of apples.",
    'The fish farmer was surprised, and he gave the apple farmer water from the river for his trees.',
    'Even though it was a hard summer, both farmers made it through.',
    'After that, they always shared what they had.',
   ],
   'zh': [
    '兩個農夫住在隔壁。', '一個農夫有一座種滿蘋果樹的果園，另一個有一條滿是魚的河。', '很多年來，他們從來不跟對方說話。',
    '有一年夏天都沒下雨，蘋果樹開始枯死。', '河水也變少了，魚很難抓。', '蘋果農夫一看到鄰居空空的魚網，就帶了一桶蘋果給他。',
    '養魚的農夫很驚訝，他把河水分給蘋果農夫澆樹。', '雖然那是一個很辛苦的夏天，兩個農夫都撐過去了。', '從那之後，他們總是分享自己擁有的東西。',
   ],
   'tasks': [
    {'type': 'sort', 'q': '把三件事照故事順序排好', 'slots': ['先', '接著', '最後'],
     'items': [["It doesn't rain, and both farmers have problems.", '沒下雨，兩個農夫都遇到麻煩。', 0],
               ['The apple farmer brings a barrel of apples.', '蘋果農夫帶來一桶蘋果。', 1],
               ['The farmers always share after that.', '兩個農夫從此都會分享。', 2]],
     'hint': '用導讀卡的「故事」問句：先發生什麼麻煩？誰先幫忙？最後怎麼了？',
     'why': '先是沒下雨（蘋果樹枯、魚難抓）；接著蘋果農夫看到空魚網就送蘋果；最後兩人從此互相分享。'},
    {'type': 'choice', 'q': '💡 What lesson does this story teach?',
     'opts': ['Neighbors should help and share with each other.', 'Apples are better than fish.', 'Farmers should not live near rivers.'],
     'ozh': ['鄰居應該互相幫忙、分享。', '蘋果比魚好。', '農夫不應該住在河邊。'], 'a': 0,
     'hint': '跟課文哪一個故事的道理很像？（烏鴉和小熊？）',
     'why': '兩個農夫各有東西（蘋果／河水），互相幫忙才撐過夏天——跟烏鴉和小熊一樣：分享、一起合作。'},
    {'type': 'evidence', 'q': '🔍 哪一句告訴你「雖然很辛苦，兩個人都撐過去了」？點出那一句。', 'a': [7],
     'hint': '找本單元的連接詞 Even though（雖然）。',
     'why': 'Even though it was a hard summer, both farmers made it through. even though＝雖然；made it through＝撐過去。'},
   ],
  },
 },
}

def check(R):
    for u, r in R.items():
        s, t, p = r['strategy'], r['teach'], r['practice']
        assert len(t['paras']) == len(t['zh']), u
        for a, b in zip(t['paras'], t['zh']): assert len(a) == len(b), (u, a)
        n = sum(len(x) for x in t['paras'])
        assert all(isinstance(x, str) or len(x) == 2 for x in t['sum']), u
        for st in t['steps']:
            assert 0 <= st['para'] < len(t['paras']) and 0 <= st['part'] < len(s['parts']), (u, st)
            assert len(st['opts']) == len(st['ozh']) == len(set(st['opts'])) and 0 <= st['a'] < len(st['opts']), (u, st)
            assert all(0 <= e < n for e in st['ev']), (u, st)
        assert len(p['sents']) == len(p['zh']), u
        for k in p['tasks']:
            if k['type'] == 'sort':
                assert sorted(i[2] for i in k['items']) == list(range(len(k['items']))), (u, k)
                assert 'slots' not in k or len(k['slots']) == len(k['items']), (u, k)
                assert 'slots' in k or len(k['items']) <= len(s['parts']), (u, k)
            elif k['type'] == 'choice':
                assert len(k['opts']) == len(k['ozh']) == len(set(k['opts'])) and 0 <= k['a'] < len(k['opts']), (u, k)
            elif k['type'] == 'group':
                assert all(0 <= i[2] < len(k['groups']) for i in k['items']), (u, k)
            else:
                assert k['type'] == 'evidence' and all(0 <= e < len(p['sents']) for e in k['a']), (u, k)
            assert k['hint'] and k['why'], (u, k)

check(READING)
