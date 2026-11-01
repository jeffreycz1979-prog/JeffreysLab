# THP5「閱讀偵探」站（grammar.json 的 reading）
# 每單元一個閱讀策略：策略卡 → 教學篇（一段一段帶著做）→ 練習篇（自己做）
# 短文都是原創、學生沒看過的文章；可以有沒學過的字，但不能是答題關鍵。
# 中文翻譯與解說：學生作答之後才顯示（答錯一次給提示，第二次才給答案）。
#
# strategy: name 英文名、zh 中文名、intro 一句話說明、parts 每一部分的偵探問句、tip 小技巧
# teach:    title、paras（每段一個句子陣列）、zh（同樣結構的中文）、steps（每段的題目）
#           step: para 亮哪一段、part 對應策略卡哪一格、q 題目、opts 英文選項、ozh 選項中文、a 答案、
#                 hint 第一次答錯的提示、why 答完的解說、ev 證據句（全文句子編號，從 0 開始）
# practice: title、sents（句子陣列）、zh、tasks
#           sort:     items [英文, 中文, 第幾格]，學生依序點卡片放進 slots
#           evidence: 點出文章裡的句子，a 可以接受的句子編號

READING = {
 'U1': {
  'strategy': {
   'name': 'Plot', 'zh': '故事情節',
   'intro': '每個故事都像爬一座小山：開頭 → 中間 → 結尾。',
   'parts': [
    {'k': 'B', 'zh': '開頭', 'en': 'Beginning', 'ic': '🟢', 'q': '故事裡有誰？在哪裡？發生了什麼事讓故事開始？'},
    {'k': 'M', 'zh': '中間', 'en': 'Middle', 'ic': '🟡', 'q': '接下來發生什麼事？遇到什麼麻煩？'},
    {'k': 'E', 'zh': '結尾', 'en': 'Ending', 'ic': '🔴', 'q': '麻煩怎麼解決？最後大家怎麼了？'},
   ],
   'tip': '找 Then、Suddenly、Finally 這種字，故事常常在這裡換到下一段。',
  },
  'teach': {
   'title': 'The Typhoon Night',
   'paras': [
    ['It was a cloudy afternoon.',
     'Ben was playing outside with his dog, Lucky.',
     'Then the wind got very strong, and Mom said, "A typhoon is coming! It\'s dangerous. Come inside!"'],
    ['Ben closed the door and the windows.',
     'It was windy and rainy outside.',
     'Ben turned on the TV, but suddenly the lights went off!',
     'Ben was scared.',
     '"Where is Lucky?" he asked.'],
    ['Mom took a flashlight from the box.',
     'Finally, they found Lucky under the bed.',
     'Ben gave his blanket to Lucky, and they stayed inside together until the storm stopped.'],
   ],
   'zh': [
    ['那是一個多雲的下午。', 'Ben 正和他的狗 Lucky 在外面玩。', '接著風變得很強，媽媽說：「颱風要來了！很危險，快進來！」'],
    ['Ben 關上門和窗戶。', '外面又颳風又下雨。', 'Ben 打開電視，但是突然停電了！', 'Ben 很害怕。', '「Lucky 在哪裡？」他問。'],
    ['媽媽從箱子裡拿出手電筒。', '最後，他們在床底下找到了 Lucky。', 'Ben 把自己的毯子給 Lucky，他們一起待在家裡，直到暴風雨停了。'],
   ],
   'steps': [
    {'para': 0, 'part': 0, 'q': '開頭：故事裡有誰？他們在哪裡？',
     'opts': ['Ben and his dog, outside', 'Ben and Mom, at school', 'Lucky and Mom, under the bed'],
     'ozh': ['Ben 和他的狗，在外面', 'Ben 和媽媽，在學校', 'Lucky 和媽媽，在床底下'], 'a': 0,
     'hint': '讀第一段第二句：Ben was playing ___ with ___.',
     'why': '第二句 Ben was playing outside with his dog, Lucky. 告訴我們人物是 Ben 和他的狗 Lucky，地點在外面。', 'ev': [1]},
    {'para': 0, 'part': 0, 'q': '開頭：發生了什麼事，讓故事開始？',
     'opts': ['A typhoon is coming.', 'Ben is hungry.', 'Lucky runs away.'],
     'ozh': ['颱風要來了。', 'Ben 肚子餓了。', 'Lucky 跑走了。'], 'a': 0,
     'hint': '找 Then：接著發生了什麼事？媽媽說了什麼？',
     'why': 'Then 後面說風變強了，媽媽說 A typhoon is coming!——颱風要來，故事就從這裡開始。', 'ev': [2]},
    {'para': 1, 'part': 1, 'q': '中間：Ben 遇到什麼麻煩？',
     'opts': ['The lights went off, and he can\'t find Lucky.', 'He can\'t watch his favorite TV show.', 'Mom is angry at him.'],
     'ozh': ['停電了，而且他找不到 Lucky。', '他不能看最喜歡的電視節目。', '媽媽在生他的氣。'], 'a': 0,
     'hint': '找 suddenly，再看 Ben 為什麼害怕、他在問什麼。',
     'why': 'suddenly the lights went off（突然停電）和 "Where is Lucky?"（Lucky 在哪裡？）就是麻煩。不能看電視只是停電造成的小事，不是最大的麻煩。', 'ev': [5, 7]},
    {'para': 2, 'part': 2, 'q': '結尾：麻煩怎麼解決？',
     'opts': ['They found Lucky under the bed.', 'Lucky ran back outside.', 'The lights came back on.'],
     'ozh': ['他們在床底下找到了 Lucky。', 'Lucky 跑回外面去了。', '電燈又亮了。'], 'a': 0,
     'hint': '找 Finally：最後發生了什麼事？',
     'why': 'Finally, they found Lucky under the bed. 找到 Lucky，Ben 最擔心的事就解決了。文章沒有說電燈又亮了喔。', 'ev': [9]},
   ],
   'sum': ['Ben 在外面玩，颱風要來了。', '停電了，Lucky 不見了。', '在床底下找到 Lucky，一起等暴風雨停。'],
  },
  'practice': {
   'title': "Mia's Kite",
   'sents': [
    'It was a sunny Saturday.',
    'Mia and her brother Leo were flying a kite in the park.',
    'Suddenly, the wind got very strong, and the kite flew into a tall tree!',
    'Mia was sad.',
    'Leo picked up a long stick, but it was too short.',
    'Then the clouds came, and it started to rain.',
    'Finally, a man with a ladder walked by.',
    'He took the kite from the tree and gave it to Mia.',
    '"Thank you!" Mia said.',
    'They went home wet but happy.',
   ],
   'zh': [
    '那是一個晴朗的星期六。', 'Mia 和她的哥哥 Leo 正在公園放風箏。', '突然，風變得很強，風箏飛進了一棵高高的樹裡！', 'Mia 很難過。',
    'Leo 撿起一根長棍子，但是還是太短了。', '接著烏雲來了，開始下雨。', '最後，一位拿著梯子的叔叔走過來。',
    '他把風箏從樹上拿下來，交給 Mia。', '「謝謝你！」Mia 說。', '他們全身濕答答地回家，但是很開心。',
   ],
   'tasks': [
    {'type': 'sort', 'q': '把三件事依照故事順序，放進開頭、中間、結尾',
     'items': [['Mia and Leo fly a kite in the park.', 'Mia 和 Leo 在公園放風箏。', 0],
               ['The kite is in a tall tree, and they can\'t get it.', '風箏卡在高高的樹上，他們拿不下來。', 1],
               ['A man takes the kite down and gives it to Mia.', '一位叔叔把風箏拿下來交給 Mia。', 2]],
     'hint': '回到偵探問句：先找「誰、在哪裡」（開頭），再找「麻煩」（中間），最後找「怎麼解決」（結尾）。',
     'why': '開頭介紹 Mia 和 Leo 在公園放風箏；中間風箏飛進樹裡、棍子太短拿不到；結尾叔叔用梯子把風箏拿下來。'},
    {'type': 'evidence', 'q': '🔍 故事的麻煩是從哪一句開始的？點出那一句。', 'a': [2],
     'hint': '麻煩出現的時候，常常有 Suddenly 這個字。',
     'why': 'Suddenly, the wind got very strong, and the kite flew into a tall tree! 風箏飛進樹裡，麻煩就從這裡開始。'},
    {'type': 'evidence', 'q': '🔍 哪一句告訴你麻煩解決了？點出那一句。', 'a': [7],
     'hint': '找 Finally 之後：叔叔做了什麼事，讓 Mia 拿回風箏？',
     'why': 'He took the kite from the tree and gave it to Mia. 風箏回到 Mia 手上，麻煩才真的解決。叔叔走過來（Finally, a man … walked by.）的時候還沒有拿到風箏喔。'},
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
        for st in t['steps']:
            assert 0 <= st['para'] < len(t['paras']) and 0 <= st['part'] < len(s['parts']), (u, st)
            assert len(st['opts']) == len(st['ozh']) == len(set(st['opts'])) and 0 <= st['a'] < len(st['opts']), (u, st)
            assert all(0 <= e < n for e in st['ev']), (u, st)
        assert len(p['sents']) == len(p['zh']), u
        for k in p['tasks']:
            if k['type'] == 'sort':
                assert sorted(i[2] for i in k['items']) == list(range(len(k['items']))), (u, k)
            else:
                assert k['type'] == 'evidence' and all(0 <= e < len(p['sents']) for e in k['a']), (u, k)
            assert k['hint'] and k['why'], (u, k)

check(READING)
