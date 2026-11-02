# THC6（Tree House C6）單字表：課本各單元 Learning Objectives 的 Vocabulary，U1–U9，每單元 20 個
# 欄位：單字 | 詞性 | KK 音標（先空白） | 中文（照課本） | 英文定義 | 例句 | 例句中文
# 詞性：v.＝動詞／動詞片語、n.＝名詞（含 a pair of… 這類量詞片語）、adj.、adv.、prep.＝介系詞片語、時間片語、慣用語（一整句話）
# 課本的 (someone) 照抄：App 會把括號裡的字當成可打可不打
import csv, sys

U = {}
U['U1'] = [
  ('Leave me alone.', '慣用語', '', '不要理我', 'what you say when you want people to stop bothering you', 'Leave me alone. I want to read.', '不要理我，我想看書。'),
  ('loser', 'n.', '', '輸家', 'a person who does not win', 'The loser has to clean the table.', '輸的人要擦桌子。'),
  ('my turn', '慣用語', '', '輪到我', 'it is time for me to play', "It's my turn! Give me the dice.", '輪到我了！骰子給我。'),
  ("That's not fair!", '慣用語', '', '那不公平！', 'what you say when something is not right for everyone', "That's not fair! You went twice.", '那不公平！你走了兩次。'),
  ('tiring', 'adj.', '', '累人的', 'making you feel tired', 'Skating all day is tiring.', '溜冰一整天很累人。'),
  ('a sore loser', 'n.', '', '輸不起的人', 'a person who gets angry when he or she loses', "Don't be a sore loser. It's just a game.", '別輸不起，只是個遊戲而已。'),
  ('annoying', 'adj.', '', '煩人的', 'making you a little angry', 'That loud noise is annoying.', '那個大聲的噪音很煩人。'),
  ('have fun', 'v.', '', '玩得開心', 'to enjoy yourself', 'We had fun at the skating rink.', '我們在溜冰場玩得很開心。'),
  ('listen to music', 'v.', '', '聽音樂', 'to hear songs and enjoy them', 'I listen to music after school.', '我放學後聽音樂。'),
  ('play catch', 'v.', '', '玩接球', 'to throw a ball to each other', "Let's play catch in the park.", '我們去公園玩接球吧。'),
  ('beat (someone)', 'v.', '', '打敗（某人）', 'to win against someone', 'I really wanted to beat Tim.', '我真的很想打敗 Tim。'),
  ('try hard', 'v.', '', '努力地嘗試', 'to do your best', 'Susie tried hard, but she lost.', 'Susie 很努力，但還是輸了。'),
  ('play chess', 'v.', '', '下西洋棋', 'to play a board game with kings and queens', 'Becky and Susie will keep playing chess.', 'Becky 和 Susie 會繼續下西洋棋。'),
  ('skate', 'v.', '', '輪式溜冰', 'to move on shoes with wheels', 'Kate is skating very carelessly.', 'Kate 溜冰溜得很不小心。'),
  ('winner', 'n.', '', '贏家', 'a person who wins', 'The winner gets a gold medal.', '贏的人得到金牌。'),
  ('a close game', 'n.', '', '勢均力敵；不相上下的比賽', 'a game where both sides almost win', 'It was a close game. We won by one point.', '那是一場勢均力敵的比賽，我們只贏一分。'),
  ('exciting', 'adj.', '', '令人興奮的', 'making you feel happy and full of energy', 'The race was very exciting.', '那場比賽非常刺激。'),
  ('good at Go', 'adj.', '', '善於下圍棋', 'able to play the game Go well', 'My grandpa is good at Go.', '我爺爺很會下圍棋。'),
  ('lose to (someone)', 'v.', '', '輸給（某人）', 'to not win against someone', 'Paul lost to Tim in the race.', 'Paul 在比賽中輸給了 Tim。'),
  ('play against each other', 'v.', '', '彼此對抗', 'to play on different sides in a game', 'The two teams will play against each other.', '這兩隊會互相對戰。'),
]
U['U2'] = [
  ('a skirt', 'n.', '', '一條裙子', 'clothes for girls that hang from the waist', 'Pam is wearing a red skirt.', 'Pam 穿著一條紅裙子。'),
  ("Let's go.", '慣用語', '', '我們走吧', 'what you say when it is time to leave', "Let's go. The bus is here.", '我們走吧，公車來了。'),
  ('match clothes', 'v.', '', '搭配衣服', 'to put on clothes that look good together', 'Becky is good at matching clothes.', 'Becky 很會搭配衣服。'),
  ('notice', 'v.', '', '察覺；注意到', 'to see something and think about it', 'Did you notice the hole in the sleeve?', '你有注意到袖子上的破洞嗎？'),
  ('wear socks', 'v.', '', '穿襪子', 'to have socks on your feet', 'I wear socks in winter.', '我冬天會穿襪子。'),
  ('a belt', 'n.', '', '一條皮帶', 'a long thing you wear around your waist', 'Dad needs a belt for his pants.', '爸爸的褲子需要一條皮帶。'),
  ('a dress', 'n.', '', '一件洋裝', 'one piece of clothes for girls, from top to knees', 'This dress looks really cute.', '這件洋裝看起來好可愛。'),
  ('a pair of pants', 'n.', '', '一條長褲', 'clothes for your legs, from waist to feet', 'I need a new pair of pants.', '我需要一條新長褲。'),
  ('a sweater', 'n.', '', '一件毛衣', 'a warm top for cold days', 'Put on a sweater. It\'s cold.', '穿上毛衣，好冷。'),
  ('change shirts', 'v.', '', '換襯衫', 'to take off one shirt and put on another', 'Tim changed shirts after soccer.', 'Tim 踢完足球後換了襯衫。'),
  ('annoyed', 'adj.', '', '氣惱的；惱怒的', 'a little angry', 'Mom was annoyed because I was late.', '媽媽很不高興，因為我遲到了。'),
  ('get on', 'v.', '', '上（車）', 'to go into a bus or train', 'We get on the bus at seven.', '我們七點上公車。'),
  ('pick out some clothes', 'v.', '', '挑選衣服', 'to choose clothes you like', 'You should pick out the ones you like.', '你應該挑你喜歡的。'),
  ('take a bus', 'v.', '', '搭公車', 'to go somewhere by bus', 'I take a bus to school.', '我搭公車上學。'),
  ('try on a new uniform', 'v.', '', '試穿新制服', 'to put on a new uniform to see if it fits', 'Chuck tried on a new uniform.', 'Chuck 試穿了新制服。'),
  ('a pair of glasses', 'n.', '', '一副眼鏡', 'two pieces of glass you wear to see better', 'Grandma lost her pair of glasses.', '奶奶弄丟了她的眼鏡。'),
  ('a pair of shorts', 'n.', '', '一條短褲', 'short pants for hot days', 'I wear a pair of shorts in summer.', '我夏天穿短褲。'),
  ('a pair of underwear', 'n.', '', '一套內衣', 'clothes you wear under your other clothes', 'Pack a pair of underwear for the trip.', '旅行要帶一套內衣。'),
  ('change her mind', 'v.', '', '改變她的心意', 'to decide something different', 'Pam changed her mind and kept the dress.', 'Pam 改變心意，把洋裝留下來了。'),
  ('get off', 'v.', '', '下（車）', 'to leave a bus or train', 'We get off the bus at the park.', '我們在公園下公車。'),
]
U['U3'] = [
  ('honest', 'adj.', '', '誠實的', 'always telling the truth', 'Tim is honest. He never tells lies.', 'Tim 很誠實，他從不說謊。'),
  ("hurt (someone's) feelings", 'v.', '', '傷害（某人的）感受', 'to make someone feel sad', "Don't hurt your sister's feelings.", '不要傷你妹妹的心。'),
  ('kind', 'adj.', '', '仁慈的', 'nice and helpful to others', 'Becky is kind to everyone.', 'Becky 對每個人都很好。'),
  ('selfish', 'adj.', '', '自私的', 'only thinking about yourself', "Don't be selfish. Share your candy.", '不要自私，分享你的糖果。'),
  ('at the shopping center', 'prep.', '', '在購物中心', 'in a big building with many stores', 'We met Pam at the shopping center.', '我們在購物中心遇到 Pam。'),
  ('apologize', 'v.', '', '道歉', 'to say sorry', 'You should apologize to your brother.', '你應該向你弟弟道歉。'),
  ('go inside', 'v.', '', '進去裡面', 'to go into a building or room', "It's raining. Let's go inside.", '下雨了，我們進去吧。'),
  ('in the gym', 'prep.', '', '在體育館', 'in the room for sports', 'We play basketball in the gym.', '我們在體育館打籃球。'),
  ('miss the bus', 'v.', '', '沒趕上公車', 'to be too late for the bus', 'Tim usually misses the bus before school.', 'Tim 上學前常常沒趕上公車。'),
  ('play a trick on (someone)', 'v.', '', '捉弄（某人）', 'to do something funny to fool someone', 'Becky and Pam played a trick on Wally.', 'Becky 和 Pam 捉弄了 Wally。'),
  ('call (someone)', 'v.', '', '打電話給（某人）', 'to talk to someone on the phone', 'Pam called Becky last night.', 'Pam 昨晚打電話給 Becky。'),
  ('at church', 'prep.', '', '在教堂', 'in a building where people pray', 'They sing at church on Sunday.', '他們星期天在教堂唱歌。'),
  ('hang up the phone', 'v.', '', '掛上電話', 'to stop a phone call', "Don't hang up the phone yet!", '先別掛電話！'),
  ('lie down on the bed', 'v.', '', '躺在床上', 'to put your body flat on the bed', 'I lie down on the bed when I am tired.', '我累了就躺在床上。'),
  ('at the movie theater', 'prep.', '', '在電影院', 'in the place where you watch movies', 'We bought popcorn at the movie theater.', '我們在電影院買了爆米花。'),
  ('come outside', 'v.', '', '到外面來', 'to leave a building and come out', 'Come outside and play with us!', '出來跟我們一起玩！'),
  ('hate', 'v.', '', '討厭；憎恨', 'to not like something at all', 'I hate waiting for the bus.', '我討厭等公車。'),
  ('have a problem', 'v.', '', '有一個問題', 'to have something wrong or hard', 'I have a problem. I lost my key.', '我有個麻煩，我的鑰匙不見了。'),
  ('invite', 'v.', '', '邀請', 'to ask someone to come', 'I will invite Tim to my party.', '我會邀請 Tim 來我的派對。'),
  ('jealous', 'adj.', '', '嫉妒的', 'unhappy because someone has what you want', 'Wally was jealous of Tim\'s new bike.', 'Wally 很嫉妒 Tim 的新腳踏車。'),
]
U['U4'] = [
  ('daughter', 'n.', '', '女兒', 'a girl child of a mother or father', 'The king has one daughter.', '國王有一個女兒。'),
  ('evil giant', 'n.', '', '邪惡的巨人', 'a very big, very bad person in stories', 'The evil giant lives in the castle.', '邪惡的巨人住在城堡裡。'),
  ('leave', 'v.', '', '離開', 'to go away from a place', 'The knight will leave in the morning.', '武士早上會離開。'),
  ('wise wizard', 'n.', '', '聰明的巫師', 'a smart old man who can do magic', 'The wise wizard knows the answer.', '聰明的巫師知道答案。'),
  ('young knight', 'n.', '', '年輕的武士', 'a young soldier who rides a horse', 'The young knight wants to fight the dragon.', '年輕的武士想對抗那隻龍。'),
  ('arrive at', 'v.', '', '抵達', 'to get to a place', 'We will arrive at the castle at noon.', '我們中午會抵達城堡。'),
  ('guess', 'v.', '', '猜測', 'to say an answer when you are not sure', 'Can you guess my age?', '你猜得到我幾歲嗎？'),
  ('kill the monster', 'v.', '', '殺死怪獸', 'to make the monster die', 'The hero will kill the monster.', '英雄會殺死怪獸。'),
  ('save the princess', 'v.', '', '拯救公主', 'to help the princess get out of danger', 'The knight saved the princess.', '武士救了公主。'),
  ('visit some people', 'v.', '', '拜訪一些人', 'to go and see some people', 'The queen visited some people in town.', '王后去鎮上拜訪了一些人。'),
  ('for a short time', '時間片語', '', '（持續）一小段時間', 'not for long', 'The dragon slept for a short time.', '那隻龍睡了一下下。'),
  ('for two hours', '時間片語', '', '（持續）兩個小時', 'for 120 minutes', 'The soldiers will exercise for two hours.', '士兵會運動兩個小時。'),
  ('son', 'n.', '', '兒子', 'a boy child of a mother or father', 'The queen has a son.', '王后有一個兒子。'),
  ("until four o'clock", '時間片語', '', '直到四點鐘', 'up to the time 4:00', "We played until four o'clock.", '我們玩到四點。'),
  ('until she finds the dragon', '時間片語', '', '直到她找到龍', 'up to the time she finds the dragon', 'The queen will ride until she finds the dragon.', '王后會一直騎馬，直到她找到龍。'),
  ('die', 'v.', '', '死；死掉', 'to stop living', 'Plants die without water.', '植物沒有水會死掉。'),
  ('large', 'adj.', '', '大的', 'big', 'The castle has a large door.', '城堡有一扇很大的門。'),
  ('lucky', 'adj.', '', '幸運的', 'having good things happen by chance', 'You are lucky. You found a coin!', '你真幸運，撿到一枚硬幣！'),
  ('narrow', 'adj.', '', '窄的', 'not wide', 'The bridge is very narrow.', '這座橋很窄。'),
  ('wide', 'adj.', '', '寬的', 'far from one side to the other', 'Were there any eggs on the wide bench?', '那張寬板凳上有蛋嗎？'),
]
U['U5'] = [
  ('alive', 'adj.', '', '活著的', 'living, not dead', 'The fish is still alive.', '那條魚還活著。'),
  ('dead', 'adj.', '', '死的', 'not living', 'The plant is dead. It needs water.', '這株植物死了，它需要水。'),
  ('poisonous', 'adj.', '', '有毒的', 'can make you very sick or kill you', 'Some snakes are poisonous.', '有些蛇有毒。'),
  ('tongue', 'n.', '', '舌頭', 'the soft part in your mouth that tastes food', 'The frog has a long tongue.', '青蛙有長長的舌頭。'),
  ('world', 'n.', '', '世界', 'the earth and all the people on it', 'She wants to travel around the world.', '她想環遊世界。'),
  ('attack', 'v.', '', '攻擊', 'to try to hurt someone', "I'll attack first!", '我先攻擊！'),
  ('cast a spell', 'v.', '', '施咒語', 'to use magic words', 'I cast a water wall spell.', '我施了水牆咒。'),
  ('centipede', 'n.', '', '蜈蚣', 'a long bug with many legs', 'The centipede ran faster than the cockroach.', '蜈蚣跑得比蟑螂快。'),
  ('hurt your toe', 'v.', '', '傷到你的腳趾頭', 'to make your toe feel pain', 'Be careful, or you will hurt your toe.', '小心，不然你會傷到腳趾。'),
  ('turn into a leaf', 'v.', '', '變成樹葉', 'to change and become a leaf', 'The witch made the frog turn into a leaf.', '女巫把青蛙變成了一片葉子。'),
  ('a group of witches', 'n.', '', '一群巫婆', 'some witches together', 'A group of witches flew over the house.', '一群巫婆飛過房子。'),
  ('make a mistake', 'v.', '', '犯一個錯', 'to do something wrong', "It's OK to make a mistake.", '犯錯沒關係。'),
  ('save her life', 'v.', '', '拯救她的命', 'to stop her from dying', 'The doctor saved her life.', '醫生救了她的命。'),
  ('fly into the air', 'v.', '', '飛上天空', 'to go up into the sky', 'The bird flew into the air.', '那隻鳥飛上了天空。'),
  ('turn a corner', 'v.', '', '轉彎', 'to go around a corner', 'Turn a corner and you will see the park.', '轉個彎就會看到公園。'),
  ('carry', 'v.', '', '攜帶', 'to hold something and take it with you', 'Can you carry my bag?', '你可以幫我拿包包嗎？'),
  ('cockroach', 'n.', '', '蟑螂', 'a brown bug that lives in houses', 'Mom screamed when she saw a cockroach.', '媽媽看到蟑螂就尖叫。'),
  ('Good luck!', '慣用語', '', '祝好運！', 'what you say to wish someone good things', 'Good luck on your test!', '考試加油！'),
  ('hope the spell works', 'v.', '', '希望咒語有效', 'to want the magic to work', 'I hope the spell works this time.', '我希望這次咒語有效。'),
  ('shoulder', 'n.', '', '肩膀', 'the part of your body between your neck and arm', 'The bird sat on my shoulder.', '那隻鳥停在我的肩膀上。'),
]
U['U6'] = [
  ('a shiny horn', 'n.', '', '閃亮的角；閃亮的號角', 'a bright horn on an animal\'s head', 'The unicorn has a shiny horn.', '獨角獸有一支閃亮的角。'),
  ('colorful feathers', 'n.', '', '鮮豔的羽毛', 'feathers with many colors', 'The bird has colorful feathers.', '那隻鳥有鮮豔的羽毛。'),
  ('long fingers', 'n.', '', '長手指', 'fingers that are not short', 'The witch has long fingers.', '女巫有長長的手指。'),
  ('sharp claws', 'n.', '', '利爪', 'pointy nails on an animal\'s feet', 'The eagle has sharp claws.', '老鷹有銳利的爪子。'),
  ('strong wings', 'n.', '', '強而有力的翅膀', 'wings that can fly far', 'The dragon has strong wings.', '那隻龍有強壯的翅膀。'),
  ('beside the castle', 'prep.', '', '在城堡的旁邊', 'next to the castle', 'There is a lake beside the castle.', '城堡旁邊有一座湖。'),
  ('choose', 'v.', '', '選擇', 'to pick one', "I'll be careful when I choose my wishes.", '選願望時我會小心。'),
  ('fire', 'n.', '', '火', 'the hot, bright thing that burns', 'The dragon breathes fire.', '那隻龍會噴火。'),
  ('solve the puzzle', 'v.', '', '解開難題', 'to find the answer to a puzzle', 'The prince solved the puzzle.', '王子解開了難題。'),
  ('surprise the prince', 'v.', '', '給王子驚喜', 'to do something the prince does not expect', 'The princess wants to surprise the prince.', '公主想給王子一個驚喜。'),
  ('huge', 'adj.', '', '巨大的', 'very, very big', 'The giant has huge feet.', '巨人有巨大的腳。'),
  ('in the middle of the cave', 'prep.', '', '在洞穴的中央', 'in the center of the cave', 'The gold is in the middle of the cave.', '金子在洞穴的正中央。'),
  ('sign', 'n.', '', '告示牌', 'a board with words or pictures on it', 'The sign says "Danger."', '告示牌上寫著「危險」。'),
  ('smoke', 'n.', '', '煙霧', 'the gray cloud from a fire', 'Smoke came out of the cave.', '煙從洞穴裡冒出來。'),
  ('tell the truth', 'v.', '', '說實話', 'to say what really happened', 'Please tell the truth.', '請說實話。'),
  ('agree', 'v.', '', '同意', 'to think the same thing', 'I agree with you.', '我同意你。'),
  ('healthy', 'adj.', '', '健康的', 'not sick; strong', 'Eat vegetables to be healthy.', '吃蔬菜才會健康。'),
  ('heart', 'n.', '', '心；愛心；內心', 'the part of your body that pumps blood', 'Will the giant want the heart?', '巨人會想要那顆心嗎？'),
  ('plan', 'n.', '', '計畫', 'an idea of what to do', 'The eagle had a plan.', '老鷹有一個計畫。'),
  ('trust the king', 'v.', '', '相信國王', 'to believe the king is honest', 'The people trust the king.', '人民相信國王。'),
]
U['U7'] = [
  ('a pair of sunglasses', 'n.', '', '一副太陽眼鏡', 'dark glasses for sunny days', 'Take a pair of sunglasses to the beach.', '帶一副太陽眼鏡去海邊。'),
  ('sunny', 'adj.', '', '晴朗的', 'with a lot of sun', "It's sunny today. Let's go out.", '今天天氣晴朗，我們出去吧。'),
  ('until lunchtime', '時間片語', '', '直到午餐時間', 'up to the time for lunch', 'We worked until lunchtime.', '我們一直做到午餐時間。'),
  ('warm', 'adj.', '', '暖和的', 'a little hot, nice', 'The soup is warm.', '湯是溫的。'),
  ('weather', 'n.', '', '天氣', 'how hot, cold, sunny or rainy it is', 'The weather is nice today.', '今天天氣很好。'),
  ('an extra umbrella', 'n.', '', '一把多的雨傘', 'one more umbrella', 'Do you have an extra umbrella?', '你有多的雨傘嗎？'),
  ('figure it out', 'v.', '', '想出；算出', 'to find the answer by thinking', 'This puzzle is hard, but I can figure it out.', '這個謎題很難，但我想得出來。'),
  ('get ready for dinner', 'v.', '', '準備吃晚餐', 'to wash your hands and come to the table', 'Get ready for dinner, kids!', '孩子們，準備吃晚餐了！'),
  ('grab', 'v.', '', '抓取；奪取', 'to take something quickly', "Don't grab my pencil!", '不要搶我的鉛筆！'),
  ('slam the door', 'v.', '', '甩門', 'to close the door hard and loud', 'Please don\'t slam the door.', '請不要甩門。'),
  ('ignore', 'v.', '', '忽視', 'to not pay attention to someone', "Don't ignore me. I'm talking to you.", '不要不理我，我在跟你說話。'),
  ('interrupt', 'v.', '', '打斷（講話）；打擾', 'to start talking when someone else is talking', 'Becky interrupted her mom.', 'Becky 打斷了她媽媽說話。'),
  ('scream', 'v.', '', '尖叫', 'to shout in a very loud, high voice', 'The kids screamed on the ride.', '孩子們在遊樂設施上尖叫。'),
  ('sick and tired', 'adj.', '', '受夠了', 'very unhappy because something keeps happening', "I'm sick and tired of the noise.", '我受夠了這些噪音。'),
  ('stare', 'v.', '', '瞪；盯著看', 'to look at something for a long time', "It's not polite to stare.", '一直盯著人看不禮貌。'),
  ('a pair of slippers', 'n.', '', '一雙拖鞋', 'soft shoes you wear at home', 'Grandpa wears a pair of slippers at home.', '爺爺在家穿拖鞋。'),
  ('knock on the door', 'v.', '', '敲門', 'to hit the door to tell people you are there', 'Please knock on the door before you come in.', '進來前請先敲門。'),
  ('lock the window', 'v.', '', '鎖上窗戶', 'to close the window so no one can open it', 'When did Alice lock the window?', 'Alice 什麼時候鎖了窗戶？'),
  ('pocket', 'n.', '', '口袋', 'a small bag in your clothes', 'I put the coin in my pocket.', '我把硬幣放進口袋。'),
  ('stomp his feet', 'v.', '', '跺腳', 'to put his feet down hard and loud', 'The boy stomped his feet because he was angry.', '那男孩氣得跺腳。'),
]
U['U8'] = [
  ('believe', 'v.', '', '相信', 'to think something is true', "I can't believe it!", '我不敢相信！'),
  ('be covered with leaves', 'v.', '', '被樹葉覆蓋', 'to have leaves all over it', 'The dog was covered with leaves.', '那隻狗身上蓋滿了樹葉。'),
  ('suggest', 'v.', '', '建議', 'to give an idea', 'I suggest we go to the park.', '我建議我們去公園。'),
  ('sunlight', 'n.', '', '日光', 'the light from the sun', 'Plants need sunlight.', '植物需要陽光。'),
  ('wonder', 'v.', '', '想知道；納悶', 'to want to know something', 'I wonder where my cat is.', '我在想我的貓跑哪去了。'),
  ('eat junk food', 'v.', '', '吃垃圾食物', 'to eat food that is not good for you', 'They eat junk food once a week.', '他們一週吃一次垃圾食物。'),
  ('frustrated', 'adj.', '', '挫敗的；沮喪的', 'upset because you cannot do something', 'Wally was frustrated with the riddle.', 'Wally 被那個謎語搞得很沮喪。'),
  ('get ready to leave', 'v.', '', '準備離開', 'to get your things and be ready to go', 'Get ready to leave. The bus is coming.', '準備走了，公車要來了。'),
  ('have a nightmare', 'v.', '', '做惡夢', 'to have a scary dream', 'Becky is scared because she is having a nightmare.', 'Becky 很害怕，因為她在做惡夢。'),
  ('melt', 'v.', '', '融化', 'to turn from ice into water', 'Ice cream melts in the sun.', '冰淇淋在太陽下會融化。'),
  ('go through the bag', 'v.', '', '翻袋子／包包', 'to look at everything in the bag', 'Mom went through the bag to find her key.', '媽媽翻包包找鑰匙。'),
  ('once a week', '時間片語', '', '一週一次', 'one time every week', 'I go swimming once a week.', '我一週游泳一次。'),
  ('sweatshirt', 'n.', '', '圓領長袖運動衫', 'a thick, soft top with long sleeves', 'Alice took off her sweatshirt.', 'Alice 脫掉了她的運動衫。'),
  ('twice a month', '時間片語', '', '一個月兩次', 'two times every month', 'We visit Grandma twice a month.', '我們一個月去看奶奶兩次。'),
  ('weird', 'adj.', '', '奇特的；怪異的', 'strange, not normal', 'That is a weird hat.', '那頂帽子好奇怪。'),
  ('backpack', 'n.', '', '背包', 'a bag you carry on your back', 'My backpack is heavy.', '我的背包很重。'),
  ('blanket', 'n.', '', '毯子', 'a warm cover for your bed', 'I sleep with a blanket.', '我蓋毯子睡覺。'),
  ("That doesn't make any sense.", '慣用語', '', '沒道理', 'what you say when something is not clear or right', "That doesn't make any sense. Say it again.", '那沒道理，再說一次。'),
  ('That was close.', '慣用語', '', '好險', 'what you say when something bad almost happened', 'That was close. The ball almost hit me!', '好險，球差點打到我！'),
  ('three times a day', '時間片語', '', '一天三次', '3 times every day', 'Brush your teeth three times a day.', '一天刷牙三次。'),
]
U['U9'] = [
  ('a bottle of paint remover', 'n.', '', '一瓶脫漆劑', 'a bottle of liquid that takes off paint', 'Dad bought a bottle of paint remover.', '爸爸買了一瓶去漆劑。'),
  ('drawer', 'n.', '', '抽屜', 'a box in a desk that you pull out', 'The glue is in the drawer.', '膠水在抽屜裡。'),
  ('spot', 'n.', '', '（斑）點；地點', 'a small dot, or a place', 'There is a red spot on my shirt.', '我的襯衫上有一個紅點。'),
  ('the bottom of the can', 'n.', '', '罐頭的底部', 'the lowest part of the can', 'Look at the bottom of the can.', '看看罐子的底部。'),
  ('the top of the can', 'n.', '', '罐頭的頂部', 'the highest part of the can', 'Open the top of the can.', '打開罐子的頂部。'),
  ('a tube of glue', 'n.', '', '一條膠水', 'glue in a soft, long container', 'I need a tube of glue for my model.', '我的模型需要一條膠水。'),
  ('metal', 'n.', '', '金屬', 'hard stuff like iron or gold', 'This toy car is made of metal.', '這台玩具車是金屬做的。'),
  ('model airplane', 'n.', '', '模型飛機', 'a small toy airplane you build', 'Paul is building a model airplane.', 'Paul 正在做模型飛機。'),
  ('plastic', 'n.', '', '塑膠', 'light stuff used to make bottles and toys', 'The soldiers are made of plastic.', '這些士兵是塑膠做的。'),
  ('play baseball', 'v.', '', '打棒球', 'to play a game with a bat and a ball', 'We play baseball after school.', '我們放學後打棒球。'),
  ('borrow a stapler from your friend', 'v.', '', '向你朋友借一個釘書機', 'to get a stapler from your friend for a short time', 'You can borrow a stapler from your friend.', '你可以跟朋友借釘書機。'),
  ('collect stamps', 'v.', '', '集郵', 'to keep many stamps as a hobby', 'My uncle likes to collect stamps.', '我叔叔喜歡集郵。'),
  ('hobby', 'n.', '', '嗜好', 'something you like to do for fun', 'My hobby is drawing.', '我的嗜好是畫畫。'),
  ('lend a paintbrush to me', 'v.', '', '借我一枝水彩筆', 'to give me a paintbrush for a short time', 'Can you lend a paintbrush to me?', '你可以借我一枝水彩筆嗎？'),
  ('put together a model', 'v.', '', '組裝模型', 'to build a model from small pieces', 'You get to put together a model yourself.', '你可以自己組裝模型。'),
  ('a bag of marbles', 'n.', '', '一袋彈珠', 'a bag with many small glass balls', 'Tim has a bag of marbles.', 'Tim 有一袋彈珠。'),
  ('a box of soldiers', 'n.', '', '一盒士兵', 'a box with many toy soldiers', 'Paul got a box of soldiers.', 'Paul 拿到一盒玩具士兵。'),
  ('glass', 'n.', '', '玻璃', 'hard, clear stuff used in windows', 'The marbles are made of glass.', '彈珠是玻璃做的。'),
  ("Let's try.", '慣用語', '', '我們試試看', 'what you say when you want to do something new together', "Let's try. Maybe it will work.", '我們試試看，也許會成功。'),
  ("What's wrong?", '慣用語', '', '怎麼了？', 'what you say when someone looks sad or upset', "What's wrong? You look sad.", '怎麼了？你看起來很難過。'),
]

OPEN = {'U1', 'U2'}   # 開放的單元（其他填 N＝未開放）
HEAD = ['ID', '單字', '類型', '詞性', '音標', '中文', '英文定義', '例句', '例句中文', '教材', '單元', '課次', 'CEFR', '狀態', '備註', '開放']

def kind(word, pos):
    if pos == '慣用語': return '句子'
    return '片語' if ' ' in word else '單字'

rows, n = [], 0
for u in sorted(U, key=lambda k: int(k[1:])):
    assert len(U[u]) == 20, (u, len(U[u]))
    for t in U[u]:
        n += 1
        word, pos, ipa, zh, de, ex, exzh = t[:7]
        note = t[7] if len(t) > 7 else ''
        assert '"' not in word
        rows.append([f'C{n:04d}', word, kind(word, pos), pos, ipa, zh, de, ex, exzh, '課本', u, '', '', '', note, '' if u in OPEN else 'N'])

out = sys.argv[1]
with open(out, 'w', encoding='utf-8', newline='') as f:
    w = csv.writer(f, lineterminator='\n'); w.writerow(HEAD); w.writerows(rows)
print(len(rows), 'rows →', out)
