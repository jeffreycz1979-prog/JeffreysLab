# THP5（Tree House 5）單字表：課本 Spelling List 拼字表 U1–U9，每單元 20 個
# 欄位：單字 | 詞性 | KK 音標（只標單字） | 中文（照課本） | 英文定義 | 例句 | 例句中文 | 備註
# 詞性照課本顏色：v.＝動詞／動詞片語、n.＝名詞、prep.＝介系詞片語、adj.＝形容詞、adv.＝副詞、時間片語、慣用語（子句／慣用語）
# 「give ... to」這類有省略號的寫成空格分開，拼字題就不會考
import csv, sys

U = {}
U['U1'] = [
  ('easy', 'adj.', 'ˋizɪ', '簡單的', 'not hard', 'This math question is easy.', '這題數學很簡單。'),
  ('put down', 'v.', '', '放下', 'to put something on a table or the floor', "Chuck's dad is putting down the fruit.", '查克的爸爸正在把水果放下。'),
  ('stay inside', 'v.', '', '待在室內', 'to not go out of the house', 'We stay inside on rainy days.', '下雨天我們待在室內。'),
  ('turn on the TV', 'v.', '', '打開電視', 'to make the TV start', "Chuck's dad turned on the TV.", '查克的爸爸打開了電視。'),
  ('typhoon', 'n.', 'taɪˋfun', '颱風', 'a very big storm with strong wind and rain', 'A typhoon is coming to Taiwan.', '颱風要來台灣了。'),
  ('close the door', 'v.', '', '關門', 'to shut the door', "Please close the door. It's cold.", '請關門，好冷。'),
  ('clouds', 'n.', 'klaʊdz', '雲', 'white or gray things in the sky', 'There are many clouds in the sky.', '天空有很多雲。'),
  ('cloudy', 'adj.', 'ˋklaʊdɪ', '多雲的', 'with a lot of clouds in the sky', 'It is cloudy today.', '今天多雲。'),
  ('go outside', 'v.', '', '走到戶外', 'to leave the house', "Let's go outside and play.", '我們去外面玩吧。'),
  ('open the window', 'v.', '', '開窗', 'to make the window open', 'Mom opened the window.', '媽媽打開了窗戶。'),
  ('give ... to', 'v.', '', '拿……給', 'to put something in another person\'s hand', 'Please give the book to me.', '請把書拿給我。'),
  ('pick up', 'v.', '', '撿起', 'to take something up from the floor', 'Pick up your toys, please.', '請把你的玩具撿起來。'),
  ('rain', 'n.', 'ren', '雨', 'water that falls from the clouds', 'The rain is very heavy.', '雨下得很大。'),
  ('rainy', 'adj.', 'ˋrenɪ', '下雨的', 'with a lot of rain', 'It was rainy yesterday.', '昨天下雨。'),
  ('take ... from', 'v.', '', '從……拿到', 'to get something from a place or a person', 'Susie took a cookie from the box.', '蘇西從盒子裡拿了一塊餅乾。'),
  ('dangerous', 'adj.', 'ˋdendʒərəs', '危險的', 'not safe', 'A typhoon is dangerous.', '颱風很危險。'),
  ('storm', 'n.', 'stɔrm', '暴風雨', 'very bad weather with strong wind and rain', 'The storm was very loud last night.', '昨晚的暴風雨很大聲。'),
  ('turn off the computer', 'v.', '', '關掉電腦', 'to make the computer stop', "Chuck was turning off the computer at eleven o'clock.", '查克十一點的時候正在關電腦。'),
  ('wind', 'n.', 'wɪnd', '風', 'moving air', 'The wind is very strong today.', '今天的風很強。'),
  ('windy', 'adj.', 'ˋwɪndɪ', '風大的', 'with a lot of wind', "It's windy. Hold your hat!", '風好大，抓好你的帽子！'),
]
U['U2'] = [
  ('run upstairs', 'v.', '', '跑上樓', 'to run up the stairs', 'Tim will put on his pajamas after he runs upstairs.', '提姆跑上樓之後會換上睡衣。'),
  ('shake the gift', 'v.', '', '搖禮物', 'to move a present up and down quickly', 'Kate shook the gift. What is in it?', '凱特搖了搖禮物。裡面是什麼呢？'),
  ('time to eat', '時間片語', '', '吃飯時間到了', 'it is the time for a meal', "Kids, it's time to eat!", '孩子們，吃飯時間到了！'),
  ('wake up', 'v.', '', '醒來', 'to stop sleeping', "I wake up at seven o'clock.", '我七點醒來。'),
  ("What's the matter?", '慣用語', '', '發生什麼事？', 'a question you ask when someone looks sad or worried', "What's the matter? Are you sick?", '怎麼了？你生病了嗎？'),
  ('answer the telephone', 'v.', '', '接電話', 'to pick up the phone and talk', 'Mom answered the telephone.', '媽媽接了電話。'),
  ('blow away', 'v.', '', '吹走', 'when the wind moves something far away', 'Kate and Jimmy felt excited when their cards blew away.', '他們的卡片被吹走時，凱特和吉米很激動。'),
  ('cell phone', 'n.', '', '手機', 'a small phone you can carry', "Dad's cell phone is ringing.", '爸爸的手機在響。'),
  ('couch', 'n.', 'kaʊtʃ', '長沙發；靠椅', 'a long soft seat for two or three people', 'Wally will feel happy when he sits on the couch with his parents.', '沃利和爸媽一起坐在沙發上時會很開心。'),
  ('go downstairs', 'v.', '', '下樓', 'to go down the stairs', 'Wally went downstairs before he went to school.', '沃利去上學之前先下樓了。'),
  ('across the street', 'prep.', '', '在對街', 'on the other side of the road', 'The park is across the street.', '公園在對街。'),
  ('in the dining room', 'prep.', '', '在飯廳', 'in the room where you eat meals', 'We eat dinner in the dining room.', '我們在飯廳吃晚餐。'),
  ('in the kitchen', 'prep.', '', '在廚房', 'in the room where you cook', 'Mom is cooking in the kitchen.', '媽媽正在廚房煮飯。'),
  ('in the living room', 'prep.', '', '在客廳', 'in the room where a family sits and watches TV', 'We watch TV in the living room.', '我們在客廳看電視。'),
  ('on the balcony', 'prep.', '', '在陽台', 'outside on the small floor of a building', 'The cat is sleeping on the balcony.', '貓在陽台上睡覺。'),
  ('during dinner', 'prep.', '', '在晚餐時', 'while people are eating dinner', "Don't play with your cell phone during dinner.", '吃晚餐的時候不要玩手機。'),
  ('flashlight', 'n.', 'ˋflæʃˏlaɪt', '手電筒', 'a small light you hold in your hand', 'Use a flashlight in the dark.', '黑暗中要用手電筒。'),
  ("It's raining cats and dogs.", '慣用語', '', '正下著傾盆大雨。', 'It is raining very hard.', "Stay inside. It's raining cats and dogs.", '待在室內，外面正在下傾盆大雨。'),
  ('time for bed', '時間片語', '', '睡覺時間到了', 'it is the time to go to sleep', "It's time for bed, Tim.", '提姆，睡覺時間到了。'),
  ('under the stairs', 'prep.', '', '在樓梯下方', 'in the space below the stairs', 'The flashlight is under the stairs.', '手電筒在樓梯下方。'),
]
U['U3'] = [
  ('fall down', 'v.', '', '跌倒；掉落', 'to drop to the ground', 'The boy fell down on the street.', '男孩在街上跌倒了。'),
  ('get up', 'v.', '', '起立', 'to stand up', 'Get up, please.', '請起立。'),
  ('hurry', 'v.', 'ˋhɝɪ', '匆忙', 'to go or do something very fast', 'The boy should not hurry.', '那個男孩不應該匆匆忙忙的。'),
  ('meet at the bus stop', 'v.', '', '在公車站碰面', 'to see each other at the place where the bus stops', "Let's meet at the bus stop at eight o'clock.", '我們八點在公車站碰面吧。'),
  ('mouths fall open', 'v.', '', '吃驚地張大嘴巴', 'when people open their mouths because they are very surprised', 'Their mouths fell open when they saw the big truck.', '他們看到那台大卡車，驚訝得張大了嘴巴。'),
  ('drive a truck', 'v.', '', '開卡車', 'to make a truck go', 'My uncle drives a truck.', '我叔叔開卡車。'),
  ('fall over', 'v.', '', '朝下跌倒', 'to fall to the ground from standing', 'The bike fell over in the wind.', '腳踏車被風吹倒了。'),
  ('make a mess', 'v.', '', '弄亂', 'to make a place dirty or not neat', 'Grandma will make a mess as she waits for the bus.', '奶奶等公車的時候會弄得一團亂。'),
  ('pull', 'v.', 'pʊl', '拉；拖', 'to move something toward you', 'Pull the door to open it.', '把門拉開。'),
  ('push', 'v.', 'pʊʃ', '推', 'to move something away from you', 'Push the cart, please.', '請推推車。'),
  ('bring ... to', 'v.', '', '帶……給', 'to take something with you to a person or a place', 'Bring the cake to Grandma.', '把蛋糕帶給奶奶。'),
  ('cheer', 'v.', 'tʃɪr', '歡呼', 'to shout because you are happy', 'The children cheered for the team.', '孩子們為隊伍歡呼。'),
  ('crowded', 'adj.', 'ˋkraʊdɪd', '擁擠的', 'with too many people', 'The bus is very crowded.', '公車很擠。'),
  ('cut up', 'v.', '', '切碎；鋸開', 'to cut something into small pieces', 'The vendor watched TV as she cut up the guavas.', '小販一邊切芭樂一邊看電視。'),
  ('make a pile of wood', 'v.', '', '將木材疊成一堆', 'to put pieces of wood on top of each other', 'The workers will finish making a pile of wood at 4:15.', '工人們會在四點十五分把木材疊好。'),
  ('lift', 'v.', 'lɪft', '舉起', 'to move something up', 'Dad can lift the big box.', '爸爸舉得起那個大箱子。'),
  ('miss Grandma', 'v.', '', '想念奶奶', 'to feel sad because Grandma is not with you', 'I miss Grandma. She lives far away.', '我想念奶奶，她住得很遠。'),
  ('put on gloves', 'v.', '', '戴上手套', 'to wear gloves on your hands', 'The worker sang as she put on her gloves.', '那位工人一邊戴手套一邊唱歌。'),
  ('take off boots', 'v.', '', '脫下靴子', 'to remove boots from your feet', 'Take off your boots before you come in.', '進來之前先把靴子脫掉。'),
  ('walk around the neighborhood', 'v.', '', '在社區閒逛', 'to take a walk near your home', 'We walk around the neighborhood after dinner.', '我們晚餐後在社區附近散步。'),
]
U['U4'] = [
  ('earth', 'n.', 'ɝθ', '地球', 'the planet we live on', 'We live on the earth.', '我們住在地球上。'),
  ('month', 'n.', 'mʌnθ', '月', 'one of the twelve parts of a year', 'January is the first month of the year.', '一月是一年的第一個月。'),
  ('planet', 'n.', 'ˋplænɪt', '行星', 'a big round thing in space that moves around the sun', 'Mars is a red planet.', '火星是一顆紅色的行星。'),
  ('science museum', 'n.', '', '科學博物館', 'a building where you can see and learn about science', 'Everyone is in the science museum.', '大家都在科學博物館裡。'),
  ('year', 'n.', 'jɪr', '年', 'twelve months', 'Tim will be nine next year.', '提姆明年就九歲了。'),
  ('dig a hole', 'v.', '', '挖洞', 'to make a hole in the ground', 'Tim will dig a hole in two months.', '提姆兩個月後會挖一個洞。'),
  ('find', 'v.', 'faɪnd', '發現；找到', 'to see something you are looking for', 'Tim is going to find something.', '提姆就要找到某個東西了。'),
  ('pay attention', 'v.', '', '專心', 'to listen or look carefully', "I'm going to pay attention to the teacher.", '我要專心聽老師說話。'),
  ('scientist', 'n.', 'ˋsaɪəntɪst', '科學家', 'a person who studies science', "Tim won't be a scientist in two months.", '提姆兩個月後不會變成科學家。'),
  ('skeleton', 'n.', 'ˋskɛlətn', '骨骼', 'all the bones of a body', 'There is a dinosaur skeleton in the museum.', '博物館裡有一副恐龍骨骼。'),
  ('have an idea', 'v.', '', '有個想法', 'to think of something new', "I have an idea! Let's go to the museum.", '我有個主意！我們去博物館吧。'),
  ("It's made of clay.", '慣用語', '', '這是泥土做的。', 'It is made from soft earth that gets hard.', "Look at this dinosaur. It's made of clay.", '看這隻恐龍，它是泥土做的。'),
  ('look around', 'v.', '', '環顧', 'to look at the things near you', 'Look around. What can you see?', '看看四周，你看到什麼？'),
  ('point at', 'v.', '', '指著', 'to show something with your finger', "Don't point at people.", '不要用手指著別人。'),
  ('promise to be good', 'v.', '', '答應要乖乖的', 'to say you will be a good child', 'I promise to be good, Mom.', '媽媽，我答應會乖乖的。'),
  ('fall', 'n.', 'fɔl', '秋', 'the season after summer', 'The leaves turn red in fall.', '秋天葉子會變紅。'),
  ('jump up and down', 'v.', '', '蹦蹦跳跳', 'to jump many times in one place', 'The kids jump up and down when they are happy.', '孩子們開心的時候會蹦蹦跳跳。'),
  ('spring', 'n.', 'sprɪŋ', '春', 'the season after winter', 'Flowers grow in spring.', '春天花會長出來。'),
  ('summer', 'n.', 'ˋsʌmɚ', '夏', 'the hot season of the year', 'It is hot in summer.', '夏天很熱。'),
  ('winter', 'n.', 'ˋwɪntɚ', '冬', 'the cold season of the year', 'It is cold in winter.', '冬天很冷。'),
]
U['U5'] = [
  ("Don't be a chicken!", '慣用語', '', '別當膽小鬼！', "Don't be afraid!", "Don't be a chicken! Climb up the hill with me.", '別當膽小鬼！跟我一起爬上小山丘。'),
  ('follow the trail', 'v.', '', '沿著小路走', 'to walk on a small path', 'Follow the trail to the forest.', '沿著小路走到森林。'),
  ('forest', 'n.', 'ˋfɔrɪst', '森林', 'a big place with many trees', 'There are many trees in the forest.', '森林裡有很多樹。'),
  ('light', 'n.', 'laɪt', '光；光線', 'something that helps you see, like the sun or a lamp', 'I can see a light in the tunnel.', '我看到地道裡有一道光。'),
  ('sharp teeth', 'n.', '', '銳利的牙齒', 'teeth that can cut things easily', 'Paul likes the small dinosaur with sharp teeth.', '保羅喜歡那隻有銳利牙齒的小恐龍。'),
  ('climb up the hill', 'v.', '', '爬上小山丘', 'to go up a small mountain', 'We climbed up the hill.', '我們爬上了小山丘。'),
  ('crawl into the tunnel', 'v.', '', '爬入地道', 'to move on your hands and knees into a dark hole', 'The cat crawled into the tunnel.', '貓爬進了地道。'),
  ('noise', 'n.', 'nɔɪz', '噪音', 'a loud sound', "What's that noise?", '那是什麼聲音？'),
  ('rocks', 'n.', 'rɑks', '岩石；石頭', 'big hard stones', 'There are big rocks on the hill.', '山丘上有大石頭。'),
  ('understand', 'v.', 'ˏʌndɚˋstænd', '理解', 'to know what something means', "I don't understand this word.", '我不懂這個字。'),
  ('an hour ago', '時間片語', '', '一小時前', 'sixty minutes before now', 'I ate lunch an hour ago.', '我一小時前吃了午餐。'),
  ('move', 'v.', 'muv', '移動', 'to go from one place to another', 'Look! The dinosaur moved!', '你看！恐龍動了！'),
  ('thirty seconds ago', '時間片語', '', '三十秒前', 'a very short time before now', 'Susie drew a grasshopper thirty seconds ago.', '蘇西三十秒前畫了一隻蚱蜢。'),
  ('three days ago', '時間片語', '', '三天前', 'three days before today', 'We went to the forest three days ago.', '我們三天前去了森林。'),
  ('twenty minutes ago', '時間片語', '', '二十分鐘前', 'twenty minutes before now', 'The boy with blue shoes laughed at the picture twenty minutes ago.', '穿藍鞋的男孩二十分鐘前看著那張圖哈哈大笑。'),
  ('a long tail', 'n.', '', '一條長尾巴', 'a tail that is not short', 'The dinosaur with a long tail won a prize.', '那隻有長尾巴的恐龍得了獎。'),
  ('a small mouth', 'n.', '', '一張小嘴', 'a mouth that is not big', 'The fish has a small mouth.', '這條魚有一張小嘴。'),
  ('big eyes', 'n.', '', '大眼睛', 'eyes that are not small', 'The girl with big eyes talked on her cell phone.', '那個大眼睛的女孩在講手機。'),
  ('Hold your horses.', '慣用語', '', '不要急，慢慢來。；稍安勿躁。', 'Wait! Do not hurry.', 'Hold your horses! Wait for me.', '別急，等等我！'),
  ('short legs', 'n.', '', '短腿', 'legs that are not long', 'The dog with short legs runs slowly.', '那隻短腿的狗跑得很慢。'),
]
U['U6'] = [
  ('famous', 'adj.', 'ˋfeməs', '著名的', 'known by many people', 'Will Pam and the other children be famous?', '潘和其他孩子會出名嗎？'),
  ('poor', 'adj.', 'pʊr', '貧窮的', 'having very little money', 'The poor man has no house.', '那個窮人沒有房子。'),
  ('pretend', 'v.', 'prɪˋtɛnd', '假裝', 'to act like something is true when it is not', "Let's pretend we are pirates.", '我們假裝是海盜吧。'),
  ('rich', 'adj.', 'rɪtʃ', '富有的', 'having a lot of money', 'The rich man has a big house.', '那個有錢人有一棟大房子。'),
  ('weak', 'adj.', 'wik', '虛弱的', 'not strong', 'Alice thinks Becky is as weak as a baby.', '愛麗絲覺得貝琪像嬰兒一樣虛弱。'),
  ('bright', 'adj.', 'braɪt', '明亮的', 'full of light', 'The classroom is bright.', '教室很明亮。'),
  ('confused', 'adj.', 'kənˋfjuzd', '困惑的', 'not able to understand', 'The little boy will get confused when the girl does a magic trick.', '女孩表演魔術時，小男孩會搞糊塗。'),
  ('dark', 'adj.', 'dɑrk', '黑暗的', 'with no light', "It's dark. Turn on the light.", '好暗，開燈吧。'),
  ('make fun of', 'v.', '', '取笑', 'to laugh at someone in a mean way', "Don't make fun of your friends.", '不要取笑你的朋友。'),
  ('take pictures', 'v.', '', '照相', 'to use a camera', 'I am ready to take pictures.', '我準備好要照相了。'),
  ('different', 'adj.', 'ˋdɪfərənt', '不同的', 'not the same', 'These two cats are different.', '這兩隻貓不一樣。'),
  ('light', 'adj.', 'laɪt', '輕的', 'not heavy', 'The box is light. I can lift it.', '箱子很輕，我舉得起來。'),
  ('news', 'n.', 'njuz', '新聞；消息', 'what is happening in the world, on TV or in a newspaper', 'Pam got excited as she watched the news on TV.', '潘看電視新聞時變得很興奮。'),
  ('proud of their child', 'adj.', '', '以他們的孩子為榮', 'happy about what their child did', 'The parents are proud of their child.', '那對父母以他們的孩子為榮。'),
  ('thick', 'adj.', 'θɪk', '濃厚的；茂密的', 'with many things close together', 'The trees in the forest are thick.', '森林裡的樹很茂密。'),
  ('classroom', 'n.', 'ˋklæsˏrum', '教室', 'a room where students learn', 'The students were in the classroom.', '學生們在教室裡。'),
  ('daydream', 'v.', 'ˋdeˏdrim', '做白日夢', 'to think about nice things and not pay attention', "Don't daydream in class.", '上課不要做白日夢。'),
  ('important', 'adj.', 'ɪmˋpɔrtnt', '重要的', 'very useful or needed', "It's important to pay attention.", '專心很重要。'),
  ('ready', 'adj.', 'ˋrɛdɪ', '準備好的', 'prepared to do something', "Are you ready? Let's go!", '你準備好了嗎？我們走吧！'),
  ('take a break', 'v.', '', '休息片刻', 'to stop working or playing for a short time', 'Bob is taking a break.', '鮑伯正在休息。'),
]
U['U7'] = [
  ('around the bushes', 'prep.', '', '在灌木叢附近', 'going in a circle near the small trees', 'Wally walked around the bushes.', '沃利繞著灌木叢走。'),
  ('first', 'adj.', 'fɝst', '第一', 'number one in order', 'Kate is first in line.', '凱特排第一個。'),
  ('last', 'adj.', 'læst', '最後', 'at the end', 'Tim is last in line.', '提姆排最後一個。'),
  ('second', 'adj.', 'ˋsɛkənd', '第二', 'number two in order', 'Becky came in second.', '貝琪得了第二名。'),
  ('third', 'adj.', 'θɝd', '第三', 'number three in order', 'Chuck came in third.', '查克得了第三名。'),
  ('across the grass', 'prep.', '', '跨越草坪', 'from one side of the grass to the other side', 'The snake was crawling across the grass.', '蛇正爬過草坪。'),
  ('along the stream', 'prep.', '', '沿著溪流', 'next to the stream all the way', 'Susie and Becky were walking along the stream.', '蘇西和貝琪沿著小溪走。'),
  ('between the rocks', 'prep.', '', '在岩石間', 'in the space in the middle of the rocks', 'A frog is hiding between the rocks.', '一隻青蛙躲在岩石之間。'),
  ('hike', 'v.', 'haɪk', '健行', 'to take a long walk in the mountains', 'Pam was hiking when she found some beetles.', '潘在健行時發現了一些甲蟲。'),
  ('through the woods', 'prep.', '', '穿過樹林', 'from one side of the woods to the other side', 'Who ran through the woods?', '誰跑過了樹林？'),
  ('curious', 'adj.', 'ˋkjʊrɪəs', '好奇的', 'wanting to know about something', 'The curious cat looked in the box.', '好奇的貓往箱子裡看。'),
  ('dizzy', 'adj.', 'ˋdɪzɪ', '頭暈目眩的', 'feeling like everything is turning around', 'I feel dizzy after I turn around many times.', '我轉了好多圈之後覺得頭暈。'),
  ('sleepy', 'adj.', 'ˋslipɪ', '想睡的', 'wanting to sleep', "I'm sleepy. It's time for bed.", '我好睏，該睡覺了。'),
  ('tell me the rules', 'v.', '', '告訴我規則', 'to say how to play a game', 'Please tell me the rules of the game.', '請告訴我這個遊戲的規則。'),
  ('try to cheat', 'v.', '', '試著欺騙', 'to try to win in a way that is not fair', "Don't try to cheat in the game.", '玩遊戲不要想作弊。'),
  ('camp', 'v.', 'kæmp', '露營', 'to sleep in a tent outside', 'We camp by the stream.', '我們在小溪旁露營。'),
  ('fish', 'v.', 'fɪʃ', '釣魚', 'to try to catch fish', 'Grandpa likes to fish.', '爺爺喜歡釣魚。'),
  ('make friends', 'v.', '', '交朋友', 'to meet people and become friends', "It's fun to make friends at camp.", '在營隊交朋友很好玩。'),
  ('live', 'v.', 'lɪv', '居住', 'to have your home in a place', 'Bears live in the forest.', '熊住在森林裡。'),
  ('over the mountains', 'prep.', '', '翻過山頭', 'going above and to the other side of the mountains', 'The birds flew over the mountains.', '鳥兒飛過了山頭。'),
]
U['U8'] = [
  ('again', 'adv.', 'əˋgɛn', '再一次', 'one more time', 'Say it again, please.', '請再說一次。'),
  ('close to', 'prep.', '', '靠近', 'not far from', 'The tent is close to the stream.', '帳篷離小溪很近。'),
  ('disappear', 'v.', 'ˏdɪsəˋpɪr', '消失', 'to go away so no one can see it', 'The rabbit disappeared!', '兔子不見了！'),
  ('far from', 'prep.', '', '離……很遠', 'a long way away from', 'My house is far from school.', '我家離學校很遠。'),
  ('know how to climb', 'v.', '', '知道怎麼爬', 'to be able to climb', 'The monkey knows how to climb trees.', '猴子知道怎麼爬樹。'),
  ('bad', 'adj.', 'bæd', '壞的（worse than／the worst）', 'not good', "This hot dog is bad, but that one is worse.", '這個熱狗很難吃，但那個更糟。', '比較級 worse than，最高級 the worst'),
  ('good', 'adj.', 'gʊd', '好的（better than／the best）', 'nice or right', "This cake is good, but that one is better.", '這個蛋糕很好吃，但那個更好吃。', '比較級 better than，最高級 the best'),
  ('remember', 'v.', 'rɪˋmɛmbɚ', '記得', 'to keep something in your mind', 'I remember your name.', '我記得你的名字。'),
  ('round', 'adj.', 'raʊnd', '圓的', 'shaped like a ball or a circle', 'The ball is round.', '球是圓的。'),
  ('shiny', 'adj.', 'ˋʃaɪnɪ', '發光的；閃耀的', 'bright because light is on it', 'The coin is shiny.', '這枚硬幣閃閃發亮。'),
  ('exercise', 'v.', 'ˋɛksɚˏsaɪz', '運動', 'to move your body to stay healthy', 'We exercise every morning.', '我們每天早上運動。'),
  ('get away from', 'v.', '', '從……逃脫；離開', 'to run away from something', 'The mouse got away from the cat.', '老鼠從貓那裡逃走了。'),
  ('go in and out', 'v.', '', '走進走出', 'to go inside and then outside many times', 'The cat goes in and out all day long.', '貓一整天走進走出。'),
  ('leaves', 'n.', 'livz', '樹葉（單數 leaf）', 'the flat green parts of a tree', 'The leaves fell on the ground.', '樹葉掉在地上。', '單數 leaf'),
  ('turn around', 'v.', '', '轉身', 'to turn your body to look behind you', 'Turn around and look at me.', '轉過身來看著我。'),
  ('get caught by', 'v.', '', '被……抓住', 'to be taken by someone or something', 'The fish got caught by the bear.', '魚被熊抓住了。'),
  ('ground', 'n.', 'graʊnd', '地面', 'the top of the earth that you walk on', 'The ground smelled terrible.', '地面的味道很難聞。'),
  ('the same', 'adj.', '', '相同的', 'not different', 'Our shoes are the same.', '我們的鞋子一樣。'),
  ('voice', 'n.', 'vɔɪs', '聲音', 'the sound you make when you talk or sing', 'She has a beautiful voice.', '她的聲音很好聽。'),
  ('be about to jump', 'v.', '', '即將要跳', 'to be going to jump very soon', 'The frog is about to jump.', '青蛙正要跳起來。'),
]
U['U9'] = [
  ('above', 'prep.', 'əˋbʌv', '在……上面', 'higher than something', 'The bird is above the tree.', '鳥在樹的上方。'),
  ('below', 'prep.', 'bəˋlo', '在……下面', 'lower than something', 'The fish are swimming below the boat.', '魚在船的下方游。'),
  ("Don't worry.", '慣用語', '', '別擔心。', 'Do not feel scared or sad about it.', "Don't worry. I can help you.", '別擔心，我可以幫你。'),
  ('drop', 'v.', 'drɑp', '掉落', 'to let something fall', "Don't drop the eggs!", '別把蛋弄掉了！'),
  ('show', 'v.', 'ʃo', '表現', 'to let someone see something', 'Show me your picture, please.', '請給我看你的畫。'),
  ('crazy', 'adj.', 'ˋkrezɪ', '瘋狂的', 'very silly or wild', 'Kate was not the craziest.', '凱特不是最瘋狂的。'),
  ('helpful', 'adj.', 'ˋhɛlpfəl', '有幫助的', 'happy to help other people', 'Tim is very helpful at home.', '提姆在家很會幫忙。'),
  ('polite', 'adj.', 'pəˋlaɪt', '有禮貌的', 'saying please and thank you', 'Is the vendor with the purple shirt the most polite?', '穿紫色上衣的小販是最有禮貌的嗎？'),
  ('rude', 'adj.', 'rud', '無禮的', 'not polite', "It's rude to point at people.", '用手指著別人很沒禮貌。'),
  ('strange', 'adj.', 'strendʒ', '奇怪的', 'not usual', "What's that strange noise?", '那個奇怪的聲音是什麼？'),
  ('bounce', 'v.', 'baʊns', '彈起', 'to hit the ground and go back up', 'The ball bounces very high.', '球彈得很高。'),
  ('burn', 'v.', 'bɝn', '燃燒；著火', 'to be on fire', 'They burned the leaves as carefully as they could.', '他們盡可能小心地燒樹葉。'),
  ('cross the river', 'v.', '', '渡河', 'to go from one side of the river to the other side', 'We crossed the river by boat.', '我們搭船渡河。'),
  ('grow', 'v.', 'gro', '生長；成長', 'to get bigger', 'Plants grow in spring.', '植物在春天生長。'),
  ('wave', 'v.', 'wev', '揮動', 'to move your hand to say hello or goodbye', 'Wave goodbye to Grandma.', '跟奶奶揮手說再見。'),
  ('all day long', '時間片語', '', '一整天', 'from morning to night', 'It snowed all day long.', '雪下了一整天。'),
  ('bother', 'v.', 'ˋbɑðɚ', '打擾', 'to make someone feel angry by talking or playing near them', "Don't bother your sister. She's sleeping.", '不要吵你妹妹，她在睡覺。'),
  ('shake your head', 'v.', '', '搖頭', 'to move your head from side to side to say no', "Shake your head if you don't know.", '不知道的話就搖頭。'),
  ('shortcut', 'n.', 'ˋʃɔrtˏkʌt', '捷徑', 'a faster way to go somewhere', "Let's take the shortcut through the woods.", '我們抄捷徑穿過樹林吧。'),
  ('snow', 'n.', 'sno', '雪', 'soft white ice that falls from the sky', 'We play in the snow in winter.', '冬天我們在雪中玩。'),
]

OPEN = {'U1', 'U2', 'U3', 'U4', 'U5', 'U6'}   # 開放的單元（其他填 N＝未開放）
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
        rows.append([f'P{n:04d}', word, kind(word, pos), pos, ipa, zh, de, ex, exzh, '課本', u, '', '', '', note, '' if u in OPEN else 'N'])

out = sys.argv[1]
with open(out, 'w', encoding='utf-8', newline='') as f:
    w = csv.writer(f, lineterminator='\n'); w.writerow(HEAD); w.writerows(rows)
print(len(rows), 'rows →', out)
