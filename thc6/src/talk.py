# THC6 會話站（grammar.json 的 talk）：課本每單元的 Conversation
#   scene  情境 [中文, 英文]
#   lines  [角色, 英文, 中文]（照課本順序；U5 課本中文欄第 6、8 句誤標 Jimmy，已改成 Becky）
#   phrases 重點句 [英文片語, 中文, 什麼時候用]：會話裡出現時標黃，點了看說明
#   build  句子重組用的句子（從會話挑，短一點；App 把單字打亂）
# 對話排序：App 一句一句問「下一句是哪一句？」，選項＝正確的下一句＋後面還沒出現的句子

def T(scene, lines, phrases, build):
    return {'scene': scene, 'lines': [list(x) for x in lines], 'phrases': [list(x) for x in phrases], 'build': build}

TALK = {
 'U1': T(['溜冰場上撞成一團', 'At the Skating Rink'], [
  ('Paul', 'Get out of the way, Susie!', 'Susie，閃開！'),
  ('Susie', "I'm trying, but I can't!", '我正在試啊，但我沒辦法！'),
  ('Paul', 'Watch out!', '小心！'),
  ('Susie', 'AHHH!!!!', '啊！'),
  ('Paul', "Now I lost the race. Why didn't you move?", '這下我輸了比賽。妳為什麼不動？'),
  ('Susie', "You know I'm not very good at skating. Anyway, you were going too fast.", '你知道我不太擅長溜冰的。總之，你溜得太快了。'),
  ('Paul', 'Sorry, I really wanted to beat Tim.', '對不起，我真的很想打敗 Tim。'),
  ('Susie', 'You could have hurt me. This skating rink is for everyone, not just you and Tim.', '你可能會傷到我耶。這個溜冰場是大家的，不是只有你和 Tim 可以用。'),
  ('Paul', "Yeah, you're right. I'll try to skate more carefully.", '是，妳是對的。我會試著更小心地溜冰。'),
 ], [
  ('Get out of the way', '閃開；讓開', '叫別人讓路，很急的時候用（有點不客氣）'),
  ('Watch out!', '小心！', '看到危險，馬上提醒別人'),
  ('Anyway', '總之；反正', '換個話題，或說出最重要的那句話'),
  ("you're right", '你說得對', '承認對方有道理'),
 ], [
  "I'm trying, but I can't!",
  "Why didn't you move?",
  'I really wanted to beat Tim.',
  "I'll try to skate more carefully.",
 ]),
 'U2': T(['Pam 清衣櫥送衣服', 'Cleaning Out the Closet'], [
  ('Becky', "Hey, Pam. What's going on?", '嘿，Pam。怎麼回事？'),
  ('Pam', "I'm cleaning out my closet. A lot of my clothes are too small for me. Mom said that you should pick out the ones you like.", '我正在清理衣櫥。很多衣服對我而言都太小了。媽媽說妳應該挑選一些妳喜歡的。'),
  ('Becky', "Really? You're going to give them to me?", '真的嗎？妳要把它們給我？'),
  ('Pam', 'If you want them.', '如果妳要的話。'),
  ('Becky', 'Sure. Wow, this dress looks really cute.', '當然。哇，這件洋裝看起來真可愛。'),
  ('Pam', "Yeah, but there's a hole in the sleeve.", '對啊，但袖子有一個破洞。'),
  ('Becky', "That's OK. My mom's good at sewing things.", '沒關係。我媽媽很擅長縫紉。'),
  ('Pam', "It'll probably fit you. Try it on.", '它可能會適合妳。試穿一下。'),
  ('Pam', "Becky, you look great! There's more in this pile for you to try. When you're finished, you can take the rest home to Kate.", 'Becky，妳看起來很漂亮！這疊還有更多衣服讓妳試穿。妳試穿完後，可以將其他的帶回家給 Kate。'),
  ('Becky', 'Thanks, Pam! This is lots of fun!', 'Pam，謝謝妳！這好有趣！'),
 ], [
  ("What's going on?", '怎麼回事？在做什麼？', '看到別人在忙，想知道發生什麼事'),
  ('too small for me', '對我來說太小', 'too ＋ 形容詞 ＋ for 某人'),
  ('Try it on.', '試穿一下', '叫別人試穿衣服、鞋子'),
  ("That's OK.", '沒關係', '對方擔心時，讓他放心'),
 ], [
  "What's going on?",
  'This dress looks really cute.',
  "My mom's good at sewing things.",
  "It'll probably fit you.",
 ]),
 'U3': T(['便利商店借錢', 'At the Convenience Store'], [
  ('Tim', 'Whew! Today must be the hottest day so far this summer.', '唷！到目前為止今天一定是這個夏天最熱的一天。'),
  ('Wally', "Yeah, I'm thirsty already. Let's stop at that convenience store for a drink.", '是啊，我已經口渴了。我們在那家便利商店停一下，喝點東西。'),
  ('Tim', 'Good idea.', '好主意。'),
  ('Tim', "I got an iced tea. What'd you get?", '我拿了一瓶冰茶。你拿了什麼？'),
  ('Wally', "Milk tea, and this. It's a new candy bar.", '奶茶和這個。這是新的糖果棒。'),
  ('Wally', "Aw, I don't have enough money. Can you lend me twenty dollars?", '噢，我的錢不夠。你可以借我二十元嗎？'),
  ('Tim', "I don't know, Wally. You still owe me ten dollars from last week. You should pay me back before I lend any more money to you.", 'Wally，我不確定。上週你還欠我十元。你應該在我借更多錢給你之前先還我錢。'),
  ('Wally', "You're right. Here's your ten, then.", '你是對的。既然這樣，你的十元。'),
  ('Tim', 'Thanks.', '謝謝。'),
  ('Wally', "You're welcome. Now, can I borrow thirty dollars?", '不客氣。現在，我可以借三十元嗎？'),
 ], [
  ('Good idea.', '好主意', '同意別人的提議'),
  ('lend me', '借給我', 'lend＝借出去：Can you lend me…?'),
  ('borrow', '向別人借', 'borrow＝借進來：Can I borrow…?'),
  ('pay me back', '還我錢', '把借的錢還給人'),
 ], [
  "I'm thirsty already.",
  'Can you lend me twenty dollars?',
  'You still owe me ten dollars.',
  'Can I borrow thirty dollars?',
 ]),
 'U4': T(['演城堡戲，台詞又忘了', 'Acting in the Castle Play'], [
  ('Alice', "My king, there's a terrible red dragon above the castle!", '國王，城堡上方有一隻可怕的紅色的龍！'),
  ('Chuck', 'Quick! Tell my knights and archers! Get ready to attack!', '快！告訴我的武士們和弓箭手！準備攻擊！'),
  ('Chuck', 'Archers, raise your bows. Ready, attack!', '弓箭手，舉高你們的弓。預備，攻擊！'),
  ('Alice', 'Oh, Chuck! You messed up your lines again. You forgot to say, "Knights, draw your swords."', '噢，Chuck！你又搞錯台詞了。你忘了說：「武士們，拔劍。」'),
  ('Chuck', 'Sorry, acting is really hard.', '對不起，演戲真難。'),
  ('Alice', "No, it's not. You didn't learn your lines well enough. Look at your script.", '不，不難。你沒背熟台詞。看你的劇本。'),
  ('Chuck', "OK, OK. I'm ready now. Let's try again.", '好，好。現在我準備好了。我們再試一次。'),
  ('Chuck', 'Knights, raise your bows! Archers, draw your swords!', '武士們，舉高你們的弓。弓箭手，拔劍！'),
  ('Alice', "No, Chuck! That's still wrong. Give me the crown! If you don't want to take this seriously, then I'll be the king.", '不對，Chuck！那樣還是錯。王冠給我，如果你不認真排練，我就要演國王了。'),
 ], [
  ('Get ready to', '準備好要……', 'Get ready to ＋ 動詞'),
  ('messed up your lines', '搞錯台詞', 'mess up＝搞砸；lines＝演戲的台詞'),
  ("Let's try again.", '我們再試一次', '失敗了，鼓勵大家再來一次'),
  ('take this seriously', '認真看待這件事', '叫別人不要隨便、要認真'),
 ], [
  'Get ready to attack!',
  'Acting is really hard.',
  'Look at your script.',
  "That's still wrong.",
 ]),
 'U5': T(['巫師大戰，魔鏡反彈', "Wizard's Fight"], [
  ('Jimmy', 'Becky. Becky! Stop watching TV. Will you play "Wizard\'s Fight" with Kate and me? Pleeeaaase?', 'Becky，Becky！不要看電視了。妳要跟我和 Kate 玩「巫師大戰」嗎？拜託？'),
  ('Becky', 'Oh, all right. You two can team up against me.', '噢，好吧。你們兩個可以組隊跟我對抗。'),
  ('Jimmy', "OK! I'll attack first! Take my fireball spell, Becky!", '好！我先攻！Becky，接我的火球咒。'),
  ('Becky', "Ha, ha, ha! It won't work on me. I cast a water wall spell, and it will protect me from fire.", '哈哈哈！對我沒效，我施了水牆咒，它會保護我不受火擊。'),
  ('Kate', 'Water? How about this ice spell? It will freeze you in the water!', '水？這冰咒如何？它會讓妳在水裡結成冰！'),
  ('Becky', 'Silly little wizard. I have a magic mirror, and your spell bounced back. Now, you and Jimmy are both frozen.', '傻小巫師。我有魔鏡，妳的咒語彈回去了。現在，妳和 Jimmy 都結凍了。'),
  ('Jimmy', "Hey! That's not fair! You can't just freeze us with a magic mirror!", '嘿！不公平！妳不能用魔鏡冰凍我們。'),
  ('Becky', "You can't talk, you're both frozen. Now, I'm going to watch TV.", '你們不能說話，你們兩個冰凍了。現在我要去看電視了。'),
 ], [
  ('Oh, all right.', '噢，好吧', '不太想但還是答應'),
  ('team up against me', '組隊跟我對抗', 'team up＝組隊；against＝對抗'),
  ("It won't work on me.", '對我沒效', 'won\'t＝will not，說未來不會發生'),
  ('How about', '……怎麼樣？', '提出另一個辦法：How about this ice spell?'),
 ], [
  'Stop watching TV.',
  "I'll attack first!",
  'It will protect me from fire.',
  "I'm going to watch TV.",
 ]),
 'U6': T(['閣樓裡的神燈', "Grandpa's Attic"], [
  ('Susie', "Wow, there's a lot of neat stuff here in Grandpa's attic.", '哇，爺爺的閣樓裡有好多好棒的東西喔。'),
  ('Chuck', "Yeah, check this out. It looks like a magic lamp. You know what happens when you rub a magic lamp, don't you?", '對啊，妳看這個。看起來像神燈。妳知道擦一擦神燈會發生什麼事，對吧？'),
  ('Susie', 'Of course, a genie will pop out and give you three wishes.', '當然，一個精靈會蹦出來並給你三個願望。'),
  ('Chuck', "That's right! I'm going to rub it and make my dreams come true!", '沒錯！我來把它擦一擦使我的願望實現！'),
  ('Susie', "I don't know, Chuck. Sometimes genies trick people. If your wishes are too good to be true, something bad might happen.", 'Chuck，我不知道。有時精靈會捉弄人。如果你的願望太過美好，可能會發生不好的事。'),
  ('Chuck', "Don't worry. I'll be careful when I choose my wishes. Here goes!", '別擔心。選擇願望時我會小心。開始囉！'),
  ('Susie', 'Chuck! Is that really a genie behind the dust?', 'Chuck！灰塵後的那個真的是一個精靈嗎？'),
  ('Chuck', "I . . . I . . . don't know. I'm not sure . . .", '我…我…我不知道。我不確定…'),
  ('Susie', "That's not a genie! It's Grandpa!", '那不是精靈！是爺爺！'),
  ('Grandpa', "What are you kids doing? You're supposed to be helping me clean!", '你們這些孩子在做什麼？你們應該在幫我打掃！'),
 ], [
  ('check this out', '你看這個', '叫別人看你發現的東西'),
  ('too good to be true', '好得不像真的', '太好了，反而讓人懷疑'),
  ('Here goes!', '開始囉！', '要做一件有點緊張的事之前說'),
  ("You're supposed to", '你應該要……', '提醒別人本來該做的事'),
 ], [
  'It looks like a magic lamp.',
  'Sometimes genies trick people.',
  "I'll be careful when I choose my wishes.",
  "That's not a genie!",
 ]),
 'U7': T(['排隊有人插隊', 'Cutting in Line'], [
  ('Tim', "Hey! You can't cut in front of me. Get back in line.", '嘿！你不能在我前面插隊。去後面排隊。'),
  ('Bully', "Oh, yeah? Who's going to make me? You?", '哦，是嗎？誰敢要我排隊？你？'),
  ('Tim', 'Well, no.', '嗯，不是。'),
  ('Bully', "That's what I thought. Now, get out of my way, shrimp.", '我想也是。現在，軟腳蝦，滾開。'),
  ('Alice', "Hey, don't shove him!", '嘿，不要推他！'),
  ('Bully', 'Who are you?', '你是誰？'),
  ('Alice', "I'm his sister. Those are your parents over there, right? Well, you'd better apologize to my brother, or I'll tell them what you did.", '我是他姊姊。在那裡的是你的父母，對吧？嗯，你最好向我弟弟道歉，否則我會告訴他們你做的事。'),
  ('Bully', "Please . . . don't . . . Hey, I'm sorry.", '拜託…不要…嘿，對不起。'),
  ('Tim', "It's OK.", '沒關係。'),
  ('Alice', "Now, get back in line, and don't do it again.", '現在，回去排隊，不要再犯了。'),
 ], [
  ('cut in front of me', '插隊插到我前面', 'cut in line＝插隊'),
  ('Get back in line.', '回去排隊', '叫插隊的人回到隊伍裡'),
  ("you'd better", '你最好……', '給警告：you had better ＋ 動詞'),
  ("It's OK.", '沒關係', '接受別人的道歉'),
 ], [
  "You can't cut in front of me.",
  "Don't shove him!",
  "You'd better apologize to my brother.",
  "Don't do it again.",
 ]),
 'U8': T(['猜謎語，又被騙了', 'Riddle Time'], [
  ('Wally', 'Hi, Pam. What are you reading?', '嗨，Pam。你在看什麼書？'),
  ('Pam', 'A book about riddles and puzzles.', '一本關於謎語和猜謎的書。'),
  ('Wally', 'Cool, I love riddles. Give me one.', '酷，我喜歡謎語。考我一題。'),
  ('Pam', "Sure. Here's an easy one. How many months have 28 days in them?", '好呀。先來一題簡單的。有多少個月份有二十八天？'),
  ('Wally', "That's a piece of cake! Only February has 28 days in it.", '真簡單！只有二月有二十八天。'),
  ('Pam', "Sorry, you're wrong! All 12 months have 28 days in them.", '抱歉，你答錯了！十二個月全都有二十八天。'),
  ('Wally', "That was a trick question. Give me another one. I'll get this one right for sure.", '那題很詐。再問我一題。這次我肯定會答對。'),
  ('Pam', 'OK. Listen carefully. Mary\'s father has four children. Three are named Jan, Jen, and Jin. What is the fourth child\'s name?', '好，仔細聽喔。Mary 的爸爸有四個小孩，有三個名字是 Jan、Jen 和 Jin。第四個小孩叫什麼名字？'),
  ('Wally', "Let's see . . . a, e, i . . . Jon. The fourth child must be Jon!", '我想想… a、e、i… Jon。第四個小孩一定是 Jon！'),
  ('Pam', "Nope, wrong again. It's Mary.", '不對，又錯了。答案是 Mary。'),
  ('Wally', 'Ah! That was a tricky one. Give me another one.', '噢！那題很詐。再問我一題。'),
 ], [
  ("That's a piece of cake!", '太簡單了！', '一塊蛋糕＝很容易'),
  ('a trick question', '陷阱題', '故意讓你答錯的題目'),
  ('for sure', '一定；肯定', '非常確定的時候說'),
  ("Let's see", '我想想', '想答案的時候先說這句'),
 ], [
  'What are you reading?',
  'Give me another one.',
  "Here's an easy one.",
  'That was a tricky one.',
 ]),
 'U9': T(['送什麼生日禮物？', 'Birthday Gifts'], [
  ('Paul', 'Hey, Wally. What did you get Chuck for his birthday?', '嘿，Wally。你送 Chuck 什麼生日禮物？'),
  ('Wally', "I heard that he's interested in reptiles, so I got him a DVD about poisonous snakes. How about you?", '我聽說他對爬蟲類有興趣，所以我買一片有關毒蛇的 DVD 要給他。你呢？'),
  ('Paul', 'A model robot. See? You get to put it together yourself.', '一個模型機器人。你看？你要自己組裝。'),
  ('Wally', 'Cool. It says here you can paint it, too!', '酷。這裡說你也可以將它塗上顏色。'),
  ('Paul', "Paint? Uh-oh, I didn't buy any paint. I sure hope he already has some.", '塗顏色？糟糕，我沒有買任何顏料。我希望他已經有些顏料了。'),
  ('Wally', "Don't worry. If he doesn't have any, he can go buy some himself.", '別擔心。如果他沒有，他可以自己去買一些。'),
  ('Paul', "I guess so. I just don't want him to hate my gift!", '我想是吧。我只是不要他討厭我的禮物！'),
  ('Wally', "Relax. It's an awesome gift. I would love it if I were him.", '放輕鬆。這是個很棒的禮物。如果我是他，我會愛死它。'),
 ], [
  ("he's interested in", '他對……有興趣', 'be interested in ＋ 東西'),
  ('How about you?', '你呢？', '說完自己，反問對方'),
  ('I guess so.', '我想是吧', '不太確定，但大概同意'),
  ('if I were him', '如果我是他', '假設不可能的事，用 were'),
 ], [
  'What did you get Chuck for his birthday?',
  "I didn't buy any paint.",
  'He can go buy some himself.',
  'I would love it if I were him.',
 ]),
}

# 檢查
for u, t in TALK.items():
    assert 8 <= len(t['lines']) <= 12, u
    allen = ' '.join(x[1] for x in t['lines'])
    for p in t['phrases']:
        assert p[0].lower() in allen.lower(), (u, p[0])
    for s in t['build']:
        assert 3 <= len(s.split()) <= 10, (u, s)
    assert len(set(x[1] for x in t['lines'])) == len(t['lines']), u
