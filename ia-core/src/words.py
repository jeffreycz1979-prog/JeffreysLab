# IA2（Connections Book 2）單字表：課本 Syllabus 各單元 Vocabulary，每單元 24 個
# 欄位：單字 | 詞性 | 音標（先空白） | 中文 | 英文定義 | 例句 | 例句中文 | 備註
# 備註「L2」＝ Lesson 2 的字（照片還沒拍到 Lesson 2，中文依單元主題推測，請 Jeffrey 核對）
# 例句都是原創，主題跟著課文走（不抄課文句子）
# KEY＝遊戲拼字的關鍵字（片語用；空白＝遊戲自動挑最長的字）
import csv, sys

U = {}
U['U1'] = [
  ('amateur', 'adj.', '', '業餘的；業餘者', 'doing something for fun, not as a job', 'Many amateur climbers go to Everest every year.', '每年都有很多業餘登山客去聖母峰。'),
  ('assist', 'v.', '', '協助', 'to help someone do something', 'The Sherpa assist the climbers on the mountain.', '雪巴人在山上協助登山客。', 'L2'),
  ('avalanche', 'n.', '', '雪崩', 'a lot of snow falling down a mountain very fast', 'An avalanche can kill many people at once.', '一場雪崩可能一次奪走很多人的性命。'),
  ('border', 'n.', '', '邊界', 'the line between two countries', 'Mount Everest is on the border between Nepal and China.', '聖母峰在尼泊爾和中國的邊界上。'),
  ('climate', 'n.', '', '氣候', 'the usual weather of a place', 'Climate change is making the glaciers less stable.', '氣候變遷讓冰河變得比較不穩定。'),
  ('come across', 'v.', '', '偶然遇到；偶然發現', 'to find or meet something by chance', 'The climbers came across a pile of old tents.', '登山客偶然看到一堆舊帳篷。', 'L2'),
  ('effort', 'n.', '', '努力；嘗試', 'a try to do something hard', 'The first efforts to climb Everest began in the 1920s.', '第一批攀登聖母峰的嘗試從 1920 年代開始。'),
  ('express', 'v.', '', '表達', 'to show what you think or feel', 'The Sherpa expressed their anger after the accident.', '意外發生後，雪巴人表達了他們的憤怒。', 'L2'),
  ('frostbite', 'n.', '', '凍傷', 'when very cold weather hurts your fingers, toes, or nose', 'He got frostbite on his toes near the top.', '他在山頂附近腳趾凍傷了。', 'L2'),
  ('glacier', 'n.', '', '冰河', 'a very large river of ice that moves very slowly', 'The glaciers on Everest are melting.', '聖母峰上的冰河正在融化。'),
  ('head', 'v.', '', '前往', 'to go toward a place', 'The team headed to the top early in the morning.', '隊伍一大早就往山頂出發。', 'L2'),
  ('increase', 'v.', '', '增加', 'to become bigger or more', 'The number of climbers increases every year.', '登山客的人數每年都在增加。'),
  ('lead', 'v.', '', '帶領', 'to show the way by going first', 'A Sherpa will lead our team up the mountain.', '一位雪巴人會帶我們的隊伍上山。', 'L2'),
  ('out of', 'prep.', '', '用完；缺少', 'having no more of something', 'The climber was out of oxygen.', '那位登山客的氧氣用完了。', 'L2'),
  ('oxygen', 'n.', '', '氧氣', 'the gas in the air that we need to breathe', 'There is less oxygen high up on the mountain.', '山上越高的地方氧氣越少。'),
  ('pass out', 'v.', '', '昏倒', 'to suddenly stop being awake because you are sick or hurt', 'Some climbers pass out because of the low oxygen.', '有些登山客因為氧氣太少而昏倒。', 'L2'),
  ('pile', 'n.', '', '一堆', 'many things on top of each other', 'There are piles of trash on the mountain.', '山上有一堆一堆的垃圾。'),
  ('professional', 'adj.', '', '專業的；職業的', 'doing something as a job and doing it well', 'Professional climbers plan the trips for amateurs.', '專業登山家幫業餘的人規劃行程。'),
  ('region', 'n.', '', '地區', 'a large area of a country or the world', 'Everest is in the Himalaya region.', '聖母峰在喜馬拉雅山地區。'),
  ('service', 'n.', '', '服務', 'work that a company does for people', 'In 1993, businesses started offering climbing services.', '1993 年，公司開始提供登山服務。'),
  ('stable', 'adj.', '', '穩定的', 'not likely to move or change', 'The ice is not stable, so it is dangerous.', '冰不穩定，所以很危險。'),
  ('steep', 'adj.', '', '陡峭的', 'going up very quickly, hard to climb', 'The trail to the top is steep and narrow.', '通往山頂的路又陡又窄。'),
  ('trail', 'n.', '', '山路；小徑', 'a small path in the mountains or a forest', 'Hundreds of climbers wait on the narrow trail.', '好幾百個登山客在窄窄的山路上排隊。'),
  ('willing', 'adj.', '', '願意的', 'happy or ready to do something', 'Are you willing to carry your trash down?', '你願意把你的垃圾帶下山嗎？'),
]
U['U2'] = [
  ('attention', 'n.', '', '注意', 'when you watch, listen, or think about something carefully', 'Stories help us pay attention to what is important.', '故事幫助我們注意重要的事。'),
  ('balance', 'n.', '', '平衡', 'when two things are equal, not too much and not too little', 'Yin and yang show balance in the world.', '陰和陽代表世界的平衡。'),
  ('barrel', 'n.', '', '木桶', 'a big round wooden container', 'The farmer brought a barrel of apples to his neighbor.', '農夫帶了一桶蘋果給他的鄰居。', 'L2'),
  ('Buddhist', 'adj.', '', '佛教的；佛教徒', 'about Buddhism, a religion from Asia', 'This is an old Buddhist story about a student.', '這是一個關於學生的古老佛教故事。'),
  ('citizen', 'n.', '', '市民；公民', 'a person who lives in a city or country', 'The citizens of the town loved the old stories.', '鎮上的居民很喜歡那些古老的故事。', 'L2'),
  ('crawl', 'v.', '', '爬行', 'to move on your hands and knees', 'The little bear crawled under the tree.', '小熊爬到樹下。', 'L2'),
  ('crow', 'n.', '', '烏鴉', 'a big black bird', 'The crow could fly high above the trees.', '那隻烏鴉可以飛得比樹還高。'),
  ('darkness', 'n.', '', '黑暗', 'when there is no light', 'Yin means darkness, and yang means light.', '陰代表黑暗，陽代表光明。'),
  ('difficulty', 'n.', '', '困難', 'something that is hard to do', 'The student had difficulty remembering what he read.', '那個學生很難記住他讀過的東西。'),
  ('entertain', 'v.', '', '娛樂；使開心', 'to do something that makes people have fun', 'Long ago, people told stories to entertain themselves.', '很久以前，人們說故事來娛樂自己。'),
  ('event', 'n.', '', '事件', 'something that happens', 'Look at the events in the story first.', '先看故事裡發生的事件。'),
  ('fall apart', 'v.', '', '崩壞；散掉', 'to break into many pieces', 'The old book is falling apart.', '那本舊書快散掉了。', 'L2'),
  ('heaven', 'n.', '', '天；天堂', 'the sky; the place where gods live', 'Pangu held up heaven with his hands.', '盤古用雙手撐起天。'),
  ('kneel', 'v.', '', '跪下', 'to go down on your knees', 'The monk knelt down and closed his eyes.', '那位僧人跪下來，閉上眼睛。', 'L2'),
  ('opposite', 'n.', '', '相反；相反的', 'completely different', 'Tomorrow might be the opposite of today.', '明天可能跟今天完全相反。'),
  ('orchard', 'n.', '', '果園', 'a place with many fruit trees', 'The farmer picked apples in his orchard.', '農夫在他的果園裡摘蘋果。', 'L2'),
  ('reason', 'n.', '', '原因；理由', 'why something happens', 'What is the reason for this story?', '這個故事的原因是什麼？'),
  ('separate', 'adj.', '', '分開的', 'not together', 'Pangu kept heaven and earth separate.', '盤古讓天和地分開。'),
  ('set', 'v.', '', '以……為背景', 'when a story happens in a place or time', 'Many old stories are set in nature.', '很多古老的故事都發生在大自然裡。'),
  ('stretch', 'v.', '', '伸展', 'to make your arms, legs, or body long', 'Pangu woke up and stretched his arms.', '盤古醒來，伸展他的手臂。'),
  ('survival', 'n.', '', '生存', 'staying alive', 'Working together helped their survival.', '一起合作幫助他們活下來。'),
  ('swat', 'v.', '', '拍打', 'to hit something small quickly, like a fly', 'She swatted the fly with a book.', '她用書拍蒼蠅。', 'L2'),
  ('wander', 'v.', '', '走失；閒逛', 'to walk away without a plan', 'Little Bear wandered away from his family.', '小熊從家人身邊走丟了。'),
  ('worn', 'adj.', '', '磨損的；破舊的', 'old and damaged because it was used a lot', "The farmer's shoes were worn.", '農夫的鞋子很破舊了。', 'L2'),
]
U['U3'] = [
  ('blue', 'adj.', '', '憂鬱的；難過的', 'feeling sad', 'She felt blue when her campaign did not reach its goal.', '她的募資活動沒達到目標時，她覺得很難過。', 'L2'),
  ('campaign', 'n.', '', '（募資）活動', 'a plan of actions to get something, like money', 'Not every crowdfunding campaign is successful.', '不是每個群眾募資活動都會成功。'),
  ('cause', 'n.', '', '理念；目標', 'an idea or goal that people want to support', 'Some people donate because they believe in the cause.', '有些人捐款是因為他們相信這個理念。'),
  ('charity', 'n.', '', '慈善（機構）', 'a group that helps people who need money or food', 'People also use crowdfunding to raise money for charity.', '人們也用群眾募資幫慈善機構籌錢。'),
  ('cheerful', 'adj.', '', '開朗的；快樂的', 'happy and smiling', 'Our cheerful teacher always says hello with a big smile.', '我們開朗的老師總是笑咪咪地打招呼。', 'L2'),
  ('claw', 'n.', '', '爪子', 'a sharp nail on an animal\'s foot', 'The bear coat comes complete with a head and claws.', '那件熊外套還附有熊頭和爪子。'),
  ('complete', 'adj.', '', '附有；完整的', 'with every part; having everything', 'The kit comes complete with batteries.', '這組工具附有電池。'),
  ('develop', 'v.', '', '開發；發展', 'to make a new product or idea', 'The company used the money to develop a smartwatch.', '那間公司用這筆錢開發智慧手錶。'),
  ('donate', 'v.', '', '捐（款）', 'to give money or things to help someone', 'You can donate a small amount of money.', '你可以捐一點點錢。'),
  ('entrepreneur', 'n.', '', '創業家', 'a person who starts a new business', 'Entrepreneurs need money to start a business.', '創業家需要錢來創業。'),
  ('give up', 'v.', '', '放棄', 'to stop trying', "Don't give up if your first idea doesn't work.", '如果第一個點子行不通，不要放棄。', 'L2'),
  ('invest', 'v.', '', '投資', 'to put money into a business to get more money later', 'Many people invested in the smartwatch.', '很多人投資那支智慧手錶。'),
  ('method', 'n.', '', '方法', 'a way of doing something', 'Crowdfunding is a useful method of raising money.', '群眾募資是一個很有用的籌錢方法。'),
  ('product', 'n.', '', '產品', 'something that a company makes and sells', 'They showed their new product in a video.', '他們在影片裡展示新產品。'),
  ('profile', 'n.', '', '簡介；（個人）檔案', 'a short page about a person or a project', 'Start a project profile on a crowdfunding website.', '在募資網站上建立一個專案簡介。'),
  ('project', 'n.', '', '計畫；專案', 'a piece of planned work', 'My class started a project to clean the beach.', '我們班開始一個淨灘計畫。'),
  ('relative', 'n.', '', '親戚', 'a person in your family, like an aunt or a cousin', 'In the past, people often borrowed money from relatives.', '以前，人們常常跟親戚借錢。'),
  ('reward', 'n.', '', '回饋；獎勵', 'something you get for helping', 'People who invest may get a reward, like a free gift.', '投資的人可能會得到回饋，像是免費禮物。'),
  ('sincere', 'adj.', '', '真誠的', 'honest and meaning what you say', 'Thank you for your sincere help.', '謝謝你真誠的幫忙。', 'L2'),
  ('social media', 'n.', '', '社群媒體', 'websites and apps where people share messages and photos', 'They told people about the project through social media.', '他們透過社群媒體讓大家知道這個計畫。'),
  ('thought', 'n.', '', '想法；念頭', 'an idea in your mind', 'That is a nice thought, but we need a plan.', '那是個不錯的想法，但我們需要一個計畫。', 'L2'),
  ('tough', 'adj.', '', '艱難的；困難的', 'very hard to do', 'Starting a business is tough.', '創業很辛苦。', 'L2'),
  ('video', 'n.', '', '影片', 'a short movie you watch on a screen', 'The video should explain the business plan.', '影片應該說明營業計畫。', 'L2'),
  ('work out', 'v.', '', '成功；順利解決', 'to end in a good way', "Don't worry. Everything will work out.", '別擔心，一切都會順利的。', 'L2'),
]
U['U4'] = [
  ('against', 'prep.', '', '對抗；反對', 'fighting or playing with the other side', 'The hero fought against ten bad men.', '那個英雄對抗十個壞人。', 'L2'),
  ('battle', 'n.', '', '戰鬥；戰役', 'a fight between two groups', 'A soldier must keep fighting during a battle.', '士兵在戰鬥中必須繼續作戰。'),
  ('century', 'n.', '', '世紀', '100 years', 'Wushu became popular in the West in the 20th century.', '武術在二十世紀在西方變得流行。'),
  ('competitive', 'adj.', '', '競賽的；競爭的', 'about trying to win against others', 'Wushu is now a competitive sport.', '武術現在是一項競賽運動。'),
  ('emperor', 'n.', '', '皇帝', 'the king of a very large country', 'It is said that an emperor developed wushu.', '據說是一位皇帝發展出武術。'),
  ('emphasize', 'v.', '', '強調', 'to show that something is very important', 'Some styles emphasize physical skills.', '有些派別強調身體技巧。'),
  ('focus', 'v.', '', '專注', 'to give all your attention to one thing', 'Tai chi focuses on the mind and spirit.', '太極專注在心靈和精神上。'),
  ('gang', 'n.', '', '幫派', 'a group of people who do bad things together', 'In the movie, a gang attacked the village.', '在電影裡，一個幫派攻擊了村莊。', 'L2'),
  ('gangster', 'n.', '', '幫派份子', 'a member of a gang', 'The hero stopped the gangsters.', '英雄阻止了那些幫派份子。', 'L2'),
  ('hornet', 'n.', '', '大黃蜂', 'a large flying insect that can sting', 'He moved as fast as a hornet.', '他動作快得像大黃蜂。', 'L2'),
  ('martial art', 'n.', '', '武術', 'a way of fighting, like kung fu or taekwondo', 'Boxing and wrestling are martial arts, too.', '拳擊和摔角也是武術。'),
  ('master', 'n.', '', '師父；大師', 'a person who is very good at something and teaches it', 'The kung fu master taught his students every morning.', '功夫師父每天早上教他的學生。', 'L2'),
  ('monk', 'n.', '', '僧侶；和尚', 'a man who lives in a temple and follows a religion', 'The Shaolin monks organized wushu into a tradition.', '少林僧人把武術整理成一個傳統。'),
  ('nation', 'n.', '', '國家；民族', 'a country and its people', 'Each nation changed wushu to fit its culture.', '每個國家都改變了武術來配合自己的文化。'),
  ('philosopher', 'n.', '', '哲學家', 'a person who thinks about big questions about life', 'Many Chinese philosophers wrote about wushu.', '很多中國哲學家寫過關於武術的東西。'),
  ('physical', 'adj.', '', '身體的', 'about your body', 'Some styles focus on physical skills and power.', '有些派別專注在身體技巧和力量。'),
  ('poison', 'n.', '', '毒；毒藥', 'something that can make you very sick or kill you', 'The bad man put poison in the tea.', '那個壞人在茶裡下毒。', 'L2'),
  ('principle', 'n.', '', '原則', 'an important rule for how to live or act', 'Respect and trust are common principles in wushu.', '尊重和信任是武術常見的原則。'),
  ('punch', 'v.', '', '用拳頭打', 'to hit with your hand closed', 'Actors often kick and punch in action movies.', '演員在動作片裡常常踢和出拳。'),
  ('relationship', 'n.', '', '關係', 'the way people feel and act toward each other', 'Wushu teaches rules for relationships with others.', '武術教人怎麼和別人相處的規則。'),
  ('style', 'n.', '', '風格；派別', 'a special way of doing something', 'Kung fu is just one style of fighting.', '功夫只是其中一種打鬥派別。'),
  ('superhero', 'n.', '', '超級英雄', 'a hero in a story with special powers', 'He fights like a superhero in the movie.', '他在電影裡打起來像超級英雄。', 'L2'),
  ('tradition', 'n.', '', '傳統', 'something people have done for a long time', 'Chinese martial arts have a special tradition.', '中國武術有特別的傳統。'),
  ('weapon', 'n.', '', '武器', 'a thing used to hurt or fight, like a sword', 'The farmers were too poor to buy weapons.', '那些農夫太窮，買不起武器。'),
]
U['U5'] = [
  ('architecture', 'n.', '', '建築', 'the style and design of buildings', 'The ancient Greeks had beautiful architecture.', '古希臘人有很美的建築。'),
  ('carve', 'v.', '', '雕刻', 'to cut wood or stone into a shape', 'People carved huge statues into the mountain.', '人們在山上雕刻巨大的雕像。', 'L2'),
  ('civilization', 'n.', '', '文明', 'a large group of people with cities, writing, and laws', 'One of the oldest civilizations grew along the Nile River.', '最古老的文明之一在尼羅河沿岸發展。'),
  ('concern', 'n.', '', '關心的事；憂慮', 'something that people care or worry about', 'Saving old buildings is a concern for many people.', '保存老建築是很多人關心的事。'),
  ('cross', 'v.', '', '穿越；越過', 'to go from one side to the other', 'They crossed the river by boat.', '他們搭船渡過那條河。', 'L2'),
  ('dam', 'n.', '', '水壩', 'a wall built across a river to hold back water', 'Egypt built a new dam on the Nile River.', '埃及在尼羅河上蓋了一座新水壩。'),
  ('flooding', 'n.', '', '淹水；水災', 'when too much water covers the land', 'The dam can control flooding.', '水壩可以控制淹水。'),
  ('gather', 'v.', '', '採集；收集', 'to collect things from different places', 'Long ago, people hunted animals and gathered food.', '很久以前，人們打獵和採集食物。'),
  ('heritage', 'n.', '', '遺產', 'old buildings, art, and ideas from the past that are important', 'This temple is part of our heritage.', '這座廟是我們的文化遺產。', 'L2'),
  ('indicate', 'v.', '', '指出；表明', 'to show that something is true', 'The old tools indicate that people lived here.', '這些舊工具顯示人們曾經住在這裡。', 'L2'),
  ('inspiration', 'n.', '', '靈感；啟發', 'something that gives you new ideas', 'People in Europe looked to the Greeks for inspiration.', '歐洲人從希臘人身上尋找靈感。'),
  ('literature', 'n.', '', '文學', 'books, stories, and poems', 'The ancient Greeks wrote great literature.', '古希臘人寫出很棒的文學作品。'),
  ('omit', 'v.', '', '省略；遺漏', 'to leave something out', "Don't omit any important facts.", '不要漏掉任何重要的事實。', 'L2'),
  ('option', 'n.', '', '選擇', 'one thing you can choose', 'Egypt had two options, but the leaders did not like either.', '埃及有兩個選擇，但是領導人兩個都不喜歡。'),
  ('pace', 'n.', '', '速度；步調', 'how fast something happens', 'People are learning at a faster pace.', '人們學習的速度越來越快。'),
  ('religion', 'n.', '', '宗教', 'a set of beliefs about God or gods', 'Old cities changed art, literature, and religion.', '古老的城市改變了藝術、文學和宗教。', 'L2'),
  ('result', 'n.', '', '結果', 'what happens because of something', 'As a result, the UN started a group to protect old sites.', '結果，聯合國成立了一個保護古蹟的組織。'),
  ('saint', 'n.', '', '聖人', 'a very good and holy person', 'The church was named after a saint.', '那間教堂是用一位聖人的名字命名的。', 'L2'),
  ('scientific method', 'n.', '', '科學方法', 'a way to study the world: ask, test, and check', 'The scientific method helps us find the causes of things.', '科學方法幫助我們找出事情的原因。'),
  ('site', 'n.', '', '遺址；地點', 'a place where something is or happened', 'Catal Huyuk is a World Heritage Site.', '加泰土丘是世界遺產。'),
  ('statue', 'n.', '', '雕像', 'a shape of a person or animal made of stone or metal', 'A group destroyed two huge Buddha statues.', '有一群人摧毀了兩座巨大的佛像。'),
  ('tunnel', 'n.', '', '隧道', 'a long hole under the ground or through a mountain', 'The train went through a long tunnel.', '火車穿過一條很長的隧道。', 'L2'),
  ('value', 'v.', '', '重視', 'to think something is important', 'Some groups do not value these old sites.', '有些團體不重視這些古蹟。'),
  ('worth', 'adj.', '', '值得', 'good or important enough to do', 'Their knowledge is worth studying.', '他們的知識值得研究。'),
]
U['U6'] = [
  ('accurately', 'adv.', '', '準確地', 'correctly, with no mistakes', 'Scientists want to read the tests accurately.', '科學家想要準確地判讀這些測驗。'),
  ('back and forth', 'adv.', '', '來回地', 'moving one way and then the other way again and again', 'The needles move back and forth across the paper.', '指針在紙上來回移動。'),
  ('behavior', 'n.', '', '行為', 'the way someone acts', 'People lie because they do not want to admit bad behavior.', '人們說謊是因為不想承認不好的行為。'),
  ('blood pressure', 'n.', '', '血壓', 'how hard your blood pushes as it moves in your body', 'The machine measures your blood pressure.', '這台機器會測量你的血壓。'),
  ('bunch', 'n.', '', '一串；一束', 'a group of things that grow or are held together', 'He bought a bunch of bananas.', '他買了一串香蕉。', 'L2'),
  ('capture', 'v.', '', '捕捉；抓到', 'to catch a person or an animal', 'The police captured the thief.', '警察抓到了小偷。', 'L2'),
  ('chest', 'n.', '', '胸部', 'the front part of your body between your neck and stomach', 'They put sensors on his hands and chest.', '他們在他的手和胸口放上感應器。'),
  ('coconut', 'n.', '', '椰子', 'a big brown nut with milk inside', 'There was a bunch of coconuts in the tree.', '樹上有一串椰子。', 'L2'),
  ('commit', 'v.', '', '犯（罪）', 'to do something wrong or illegal', 'They asked questions about the crime he committed.', '他們問了關於他犯下的罪的問題。'),
  ('content', 'adj.', '', '滿足的', 'happy with what you have', 'He was content with a simple life.', '他對簡單的生活很滿足。', 'L2'),
  ('court', 'n.', '', '法院；法庭', 'a place where a judge decides if someone did a crime', 'In most countries, polygraphs cannot be used in court.', '在大部分國家，測謊結果不能在法庭上使用。'),
  ('drug', 'n.', '', '藥物；毒品', 'a medicine, or something people take that changes how they feel', 'Some drugs can change your heart rate.', '有些藥物會改變你的心跳。'),
  ('fancy', 'adj.', '', '花俏的；高級的', 'expensive, with many decorations', 'They had dinner at a fancy restaurant.', '他們在一間高級餐廳吃晚餐。', 'L2'),
  ('hook', 'v.', '', '接上；鉤住', 'to connect one thing to another (hook up)', 'The police hook some wires to his hands.', '警察把一些電線接到他的手上。', 'L2'),
  ('insane', 'adj.', '', '精神失常的', 'having a very sick mind', 'A true lie detector must work even if a person is insane.', '真正的測謊器即使對精神失常的人也必須有效。'),
  ('interview', 'n.', '', '面談；訊問', 'a meeting where one person asks another person questions', 'Stay calm during the interview.', '面談時要保持冷靜。'),
  ('investigate', 'v.', '', '調查', 'to try to find out the truth about something', 'The police investigate the crime scene.', '警察調查犯罪現場。'),
  ('measure', 'v.', '', '測量', 'to find out how big, fast, or strong something is', 'The sensors measure your breathing and pulse.', '感應器測量你的呼吸和脈搏。'),
  ('needle', 'n.', '', '指針；針', 'a thin pointer on a machine', 'Everyone watched the needle on the machine.', '大家都盯著機器上的指針。'),
  ('perspiration', 'n.', '', '流汗；汗水', 'water that comes out of your skin when you are hot or nervous', 'Lying can increase your perspiration.', '說謊可能讓你流更多汗。'),
  ('prison', 'n.', '', '監獄', 'a place where people who commit crimes must stay', 'He was afraid of going to prison.', '他很怕去坐牢。', 'L2'),
  ('pulse', 'n.', '', '脈搏', 'the beat of your heart that you can feel in your wrist', 'The nurse checked my pulse.', '護士幫我量脈搏。'),
  ('sunscreen', 'n.', '', '防曬乳', 'a cream that keeps the sun from burning your skin', 'Put on sunscreen before you go to the beach.', '去海邊前要擦防曬乳。', 'L2'),
  ('tempt', 'v.', '', '引誘', 'to make someone want to do something, often something bad', 'The cake tempted her, but she said no.', '蛋糕很誘人，但是她拒絕了。'),
]

KEY = {'come across': 'come', 'out of': 'out', 'pass out': 'pass', 'fall apart': 'fall', 'give up': 'give', 'work out': 'work',
       'social media': 'social', 'martial art': 'martial', 'scientific method': 'scientific', 'back and forth': 'forth', 'blood pressure': 'pressure'}
OPEN = {'U1', 'U2', 'U3', 'U4', 'U5', 'U6'}   # 開放的單元（其他填 N＝未開放）
HEAD = ['ID', '單字', '類型', '詞性', '音標', '中文', '英文定義', '例句', '例句中文', '教材', '單元', '課次', 'CEFR', '狀態', '備註', '開放', '關鍵字']

def kind(word, pos):
    if pos == '慣用語': return '句子'
    return '片語' if ' ' in word else '單字'

rows, n = [], 0
for u in sorted(U, key=lambda k: int(k[1:])):
    assert len(U[u]) == 24, (u, len(U[u]))
    assert len({t[0] for t in U[u]}) == 24, u
    for t in U[u]:
        n += 1
        word, pos, ipa, zh, de, ex, exzh = t[:7]
        note = t[7] if len(t) > 7 else ''
        assert '"' not in word
        if u in OPEN: assert de and ex and exzh, (u, word)
        rows.append([f'IA{n:04d}', word, kind(word, pos), pos, ipa, zh, de, ex, exzh, 'Connections 2', u, '', '', '', note, '' if u in OPEN else 'N', KEY.get(word, '')])

out = sys.argv[1]
with open(out, 'w', encoding='utf-8', newline='') as f:
    w = csv.writer(f, lineterminator='\n'); w.writerow(HEAD); w.writerows(rows)
print(len(rows), 'rows →', out)
