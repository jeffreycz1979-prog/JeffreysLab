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
   'sumTitle': '🗺️ 這個故事的小山',
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
 'U2': {
  'strategy': {
   'name': 'Main Idea and Details', 'zh': '主旨和細節',
   'intro': '主旨像桌面，細節是撐住它的桌腳。',
   'parts': [
    {'k': 'MI', 'zh': '主旨', 'en': 'Main Idea', 'ic': '🏷️', 'q': '這篇大部分在講什麼？哪一句可以把其他句子包起來？'},
    {'k': 'D', 'zh': '細節', 'en': 'Details', 'ic': '🧩', 'q': '哪些句子告訴我們更多、證明主旨是對的？'},
   ],
   'tip': '主旨常在第一句或最後一句，但不一定！只講到一個人、一件事的句子，通常是細節。',
  },
  'teach': {
   'title': 'The Best Room in Our House',
   'paras': [
    ["In my family, the living room is everyone's favorite room.",
     'After school, my brother and I do our homework on the big couch.',
     'Before dinner, Dad sits there and watches the news.',
     "When it's raining cats and dogs, we play board games on the floor.",
     'Even our cat loves it.',
     'She sleeps by the window all day.',
     'At night, Mom reads stories to us there.',
     "When it's time for bed, nobody wants to go upstairs!"],
   ],
   'zh': [
    ['在我們家，客廳是每個人最喜歡的房間。', '放學後，我和弟弟在大沙發上寫功課。', '晚餐前，爸爸坐在那裡看新聞。',
     '下大雨的時候，我們在地板上玩桌遊。', '連我們的貓都很喜歡客廳。', '牠整天睡在窗戶旁邊。', '晚上，媽媽在那裡唸故事給我們聽。',
     '到了睡覺時間，沒有人想上樓！'],
   ],
   'steps': [
    {'para': 0, 'part': 0, 'q': '主旨：這篇大部分在講什麼？',
     'opts': ["The living room is the family's favorite room.", 'Dad watches the news before dinner.', 'The cat sleeps all day.'],
     'ozh': ['客廳是全家人最喜歡的房間。', '爸爸晚餐前看新聞。', '貓整天在睡覺。'], 'a': 0,
     'hint': '每一句都在講同一個地方，是哪裡？哪個答案可以把所有句子包起來？',
     'why': "大部分句子都在說全家人在客廳做什麼。第一句 the living room is everyone's favorite room 把它們全部包起來，就是主旨。爸爸看新聞、貓睡覺都只是其中一件事，是細節。", 'ev': [0]},
    {'para': 0, 'part': 1, 'q': '細節：選一個「文章裡有寫」、支持主旨的細節。',
     'opts': ['They play board games there when it rains.', 'Mom cooks dinner in the kitchen.', 'They eat dinner in the dining room.'],
     'ozh': ['下雨時他們在那裡玩桌遊。', '媽媽在廚房煮晚餐。', '他們在飯廳吃晚餐。'], 'a': 0,
     'hint': '細節一定要在文章裡找得到，而且是在說客廳喔。',
     'why': "When it's raining cats and dogs, we play board games on the floor. 文章裡有寫，而且是在客廳。廚房和飯廳文章都沒提到。", 'ev': [3]},
    {'para': 0, 'part': 1, 'q': '「Dad sits there and watches the news.」這一句是主旨還是細節？',
     'opts': ['A detail', 'The main idea'], 'ozh': ['細節', '主旨'], 'a': 0,
     'hint': '這句只說了一個人做一件事，它能說完整篇在講什麼嗎？',
     'why': '它只說了爸爸一個人做一件事，是證明「客廳是大家最喜歡的房間」的其中一個例子，所以是細節。', 'ev': [2]},
    {'para': 0, 'part': 0, 'q': '最後一句說 nobody wants to go upstairs，作者想告訴我們什麼？',
     'opts': ['They love the living room very much.', 'The stairs are broken.', 'They are scared of the dark.'],
     'ozh': ['他們非常喜歡客廳。', '樓梯壞了。', '他們怕黑。'], 'a': 0,
     'hint': '想想看：到了睡覺時間，為什麼大家都不想離開客廳上樓去？',
     'why': '大家捨不得離開客廳，等於又說了一次主旨：客廳是全家最喜歡的地方。文章沒有說樓梯壞了或怕黑。', 'ev': [7]},
   ],
   'sumTitle': '🗺️ 偵探整理：桌面和桌腳',
   'sum': ['客廳是全家人最喜歡的房間。', '寫功課、看新聞、下雨玩桌遊、貓睡午覺、聽故事、捨不得上樓。'],
  },
  'practice': {
   'title': "Grandpa's Balcony",
   'sents': [
    'My grandpa has many plants on the balcony.',
    'Every morning, he waters them before breakfast.',
    'He talks to them and sometimes sings them songs.',
    'If a leaf turns yellow, he cuts it off right away.',
    "When the wind is strong, he moves the small pots inside so they don't blow away.",
    'At night, he takes a flashlight outside to check on them.',
    'Grandpa also likes to watch baseball on TV.',
    'Grandpa really takes good care of his plants.',
   ],
   'zh': [
    '我爺爺在陽台上種了很多植物。', '每天早上，他在早餐前幫它們澆水。', '他會跟它們說話，有時候還唱歌給它們聽。', '如果有葉子變黃，他會馬上把它剪掉。',
    '風很大的時候，他會把小盆栽搬進屋裡，這樣它們才不會被吹走。', '晚上，他會拿手電筒到外面看看它們。', '爺爺也喜歡看電視上的棒球。', '爺爺真的把他的植物照顧得很好。',
   ],
   'tasks': [
    {'type': 'evidence', 'q': '🔍 哪一句是主旨（整篇大部分在講什麼）？點出那一句。', 'a': [7],
     'hint': '這次主旨不在第一句喔！找一句能把「澆水、唱歌、搬盆栽、拿手電筒」全部包起來的句子。',
     'why': 'Grandpa really takes good care of his plants. 把澆水、說話唱歌、剪黃葉、搬盆栽、拿手電筒全部包起來，是主旨。第一句只說爺爺有很多植物，包不住他做的這些事。'},
    {'type': 'evidence', 'q': '🔍 有一句跟主旨沒關係，偵探要把它抓出來！點出那一句。', 'a': [6],
     'hint': '每一句都在說爺爺怎麼照顧植物嗎？找一句在說別的事情的。',
     'why': 'Grandpa also likes to watch baseball on TV. 說的是看棒球，跟照顧植物沒有關係，不能用來支持主旨。'},
    {'type': 'evidence', 'q': '🔍 哪一個細節告訴我們：天氣不好的時候，爺爺也會保護他的植物？點出那一句。', 'a': [4],
     'hint': '找一句跟天氣有關的句子：wind 是什麼意思？爺爺做了什麼？',
     'why': "When the wind is strong, he moves the small pots inside so they don't blow away. 風大的時候把小盆栽搬進屋，這個細節證明爺爺連天氣不好都會照顧植物。"},
   ],
  },
 },
 'U3': {
  'strategy': {
   'name': 'Sequence', 'zh': '事情的順序',
   'intro': '偵探要把事情排回正確的時間順序。',
   'parts': [
    {'k': 'SW', 'zh': '路標字', 'en': 'Signal Words', 'ic': '🔢', 'q': '找 first、next、then、after that、finally，它們告訴你順序。'},
    {'k': 'ST', 'zh': '同時發生', 'en': 'At the Same Time', 'ic': '⏱️', 'q': '看到 as、while，兩件事是一起發生的，不分先後。'},
    {'k': 'NS', 'zh': '沒有路標時', 'en': 'No Signal Words', 'ic': '🧠', 'q': '哪件事一定要先做，下一件才做得到？'},
   ],
   'tip': '故事寫的順序不一定是發生的順序，要靠路標字和常識判斷。',
  },
  'teach': {
   'title': 'The Big Tree on Our Street',
   'paras': [
    ['Last night, a strong wind made a big tree fall over on our street.',
     'In the morning, the street was a mess.'],
    ['First, Dad and Mr. Lee put on gloves.',
     'Next, Mr. Lee started cutting up the tree.',
     'As he cut the branches, Dad pulled them to the side of the road.',
     'Then my sister and I made a pile of wood.'],
    ['After that, a man drove a truck to our street.',
     'He lifted the wood into the truck.',
     'Finally, the street was clean again, and all the neighbors cheered.'],
   ],
   'zh': [
    ['昨天晚上，一陣強風把我們街上的一棵大樹吹倒了。', '早上，整條街亂七八糟。'],
    ['首先，爸爸和李先生戴上手套。', '接著，李先生開始把樹鋸開。', '他鋸樹枝的同時，爸爸把樹枝拖到路邊。', '然後我和姊姊把木頭疊成一堆。'],
    ['之後，一位叔叔開卡車來到我們這條街。', '他把木頭舉起來放進卡車。', '最後，街道又變乾淨了，所有鄰居都歡呼起來。'],
   ],
   'steps': [
    {'para': 1, 'part': 0, 'q': '爸爸和李先生第一件做的事是什麼？',
     'opts': ['They put on gloves.', 'They cut up the tree.', 'They drove a truck.'],
     'ozh': ['他們戴上手套。', '他們把樹鋸開。', '他們開卡車。'], 'a': 0,
     'hint': '找路標字 First：它後面寫的就是第一件事。',
     'why': 'First, Dad and Mr. Lee put on gloves. 路標字 First 告訴我們：戴手套是第一件事。', 'ev': [2]},
    {'para': 1, 'part': 1, 'q': '李先生鋸樹枝的時候，爸爸在做什麼？',
     'opts': ['He pulled the branches to the side of the road.', 'He put on his gloves.', 'He made a pile of wood.'],
     'ozh': ['他把樹枝拖到路邊。', '他戴上手套。', '他把木頭疊成一堆。'], 'a': 0,
     'hint': '找 as：as 前後的兩件事是同時發生的。',
     'why': 'As he cut the branches, Dad pulled them to the side of the road. as 表示同時：李先生在鋸，爸爸同時在拖。疊木頭是後面 Then 才做的事。', 'ev': [4]},
    {'para': 2, 'part': 2, 'q': '「He lifted the wood into the truck.」這件事一定發生在哪件事之後？',
     'opts': ['After the man drove the truck to the street.', 'Before the tree fell over.', 'Before they put on gloves.'],
     'ozh': ['在叔叔把卡車開到街上之後。', '在樹倒下之前。', '在他們戴手套之前。'], 'a': 0,
     'hint': '這句沒有路標字，用常識想：卡車還沒來，木頭能放進卡車嗎？',
     'why': '要先有卡車開過來（After that, a man drove a truck to our street.），才能把木頭放進去。沒有路標字的時候，就問自己「哪件事要先發生，下一件才做得到」。', 'ev': [6, 7]},
    {'para': 2, 'part': 0, 'q': '故事裡最後發生的事是什麼？',
     'opts': ['The neighbors cheered.', 'A man drove a truck to the street.', 'Mr. Lee started cutting up the tree.'],
     'ozh': ['鄰居們歡呼。', '一位叔叔把卡車開到街上。', '李先生開始鋸樹。'], 'a': 0,
     'hint': '找路標字 Finally。',
     'why': 'Finally, the street was clean again, and all the neighbors cheered. 路標字 Finally 告訴我們這是最後一件事。', 'ev': [8]},
   ],
   'sumTitle': '🗺️ 偵探整理：事情的順序',
   'sum': [['1', '強風把大樹吹倒'], ['2', '戴上手套（First）'], ['3', '李先生鋸樹，同時爸爸拖樹枝（Next、As）'], ['4', '把木頭疊成一堆（Then）'],
           ['5', '卡車來了，木頭放進卡車（After that）'], ['6', '街道乾淨了，鄰居歡呼（Finally）']],
  },
  'practice': {
   'title': 'A Soup for Grandma',
   'sents': [
    "Amy missed Grandma, so she wanted to make Grandma's favorite soup.",
    'First, Amy and Mom went to the market.',
    'The market was very crowded, so they had to hurry.',
    'When they got home, Amy washed the carrots.',
    'As she washed them, Mom cut up the potatoes.',
    'Then they put everything into a big pot.',
    'The soup cooked for one hour.',
    "After that, they took the bus to Grandma's house and brought the soup to her.",
    'When Grandma tasted it, her mouth fell open.',
    '"This is the best soup ever!" she said.',
   ],
   'zh': [
    'Amy 很想念奶奶，所以她想煮奶奶最喜歡的湯。', '首先，Amy 和媽媽去了市場。', '市場非常擁擠，所以她們得動作快一點。', '回到家後，Amy 洗紅蘿蔔。',
    'Amy 洗紅蘿蔔的同時，媽媽把馬鈴薯切塊。', '然後她們把所有東西放進一個大鍋子裡。', '湯煮了一個小時。', '之後，她們搭公車到奶奶家，把湯帶給她。',
    '奶奶嚐了一口，驚訝得張大嘴巴。', '「這是我喝過最好喝的湯！」她說。',
   ],
   'tasks': [
    {'type': 'sort', 'q': '把四件事依照發生的順序，放進第 1～4 格', 'slots': ['第 1 件', '第 2 件', '第 3 件', '第 4 件'],
     'items': [['Amy and Mom go to the market.', 'Amy 和媽媽去市場。', 0],
               ['Amy washes the carrots.', 'Amy 洗紅蘿蔔。', 1],
               ['They put everything into a pot.', '她們把所有東西放進鍋子。', 2],
               ['They bring the soup to Grandma.', '她們把湯帶給奶奶。', 3]],
     'hint': '找路標字：First → When they got home → Then → After that。',
     'why': 'First 去市場 → When they got home 洗紅蘿蔔 → Then 放進鍋子 → After that 把湯帶給奶奶。'},
    {'type': 'evidence', 'q': '🔍 哪一句告訴你有兩件事是「同時」發生的？點出那一句。', 'a': [4],
     'hint': '找 as：as 前後的兩件事是一起發生的。',
     'why': 'As she washed them, Mom cut up the potatoes. Amy 洗紅蘿蔔的同時，媽媽在切馬鈴薯，兩件事一起發生。'},
    {'type': 'evidence', 'q': '🔍 湯煮好之後，下一件事是什麼？點出那一句。', 'a': [7],
     'hint': '先找湯在煮的那一句（cooked for one hour），再看它的下一個路標字。',
     'why': "The soup cooked for one hour. 之後，路標字 After that 帶出下一件事：搭公車把湯帶給奶奶。"},
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
            else:
                assert k['type'] == 'evidence' and all(0 <= e < len(p['sents']) for e in k['a']), (u, k)
            assert k['hint'] and k['why'], (u, k)

check(READING)
