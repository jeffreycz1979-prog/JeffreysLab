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
# U3–U6：先放單字和中文（上鎖中），等 Jeffrey 拍好課文再補定義、例句
def short(u, items):
    U[u] = [(w, '', '', zh, '', '', '') for w, zh in items]
short('U3', [('blue', '憂鬱的'), ('campaign', '（募資）活動'), ('cause', '理念；目標'), ('charity', '慈善（機構）'), ('cheerful', '開朗的'), ('claw', '爪子'),
             ('complete', '附有；完整的'), ('develop', '開發'), ('donate', '捐款'), ('entrepreneur', '創業家'), ('give up', '放棄'), ('invest', '投資'),
             ('method', '方法'), ('product', '產品'), ('profile', '簡介'), ('project', '計畫；專案'), ('relative', '親戚'), ('reward', '回饋；獎勵'),
             ('sincere', '真誠的'), ('social media', '社群媒體'), ('thought', '想法；念頭'), ('tough', '艱難的'), ('video', '影片'), ('work out', '成功；順利解決')])
short('U4', [('against', '對抗'), ('battle', '戰鬥'), ('century', '世紀'), ('competitive', '競賽的；競爭的'), ('emperor', '皇帝'), ('emphasize', '強調'),
             ('focus', '專注'), ('gang', '幫派'), ('gangster', '幫派份子'), ('hornet', '大黃蜂'), ('martial art', '武術'), ('master', '師父；大師'),
             ('monk', '僧侶；和尚'), ('nation', '國家；民族'), ('philosopher', '哲學家'), ('physical', '身體的'), ('poison', '毒；下毒'), ('principle', '原則'),
             ('punch', '拳打'), ('relationship', '關係'), ('style', '風格；派別'), ('superhero', '超級英雄'), ('tradition', '傳統'), ('weapon', '武器')])
short('U5', [('architecture', '建築'), ('carve', '雕刻'), ('civilization', '文明'), ('concern', '關心的事'), ('cross', '穿越；十字架'), ('dam', '水壩'),
             ('flooding', '淹水'), ('gather', '採集；收集'), ('heritage', '遺產'), ('indicate', '指出；表明'), ('inspiration', '靈感；啟發'), ('literature', '文學'),
             ('omit', '省略'), ('option', '選擇'), ('pace', '速度；步調'), ('religion', '宗教'), ('result', '結果'), ('saint', '聖人'),
             ('scientific method', '科學方法'), ('site', '遺址；地點'), ('statue', '雕像'), ('tunnel', '隧道'), ('value', '重視；價值'), ('worth', '值得')])
short('U6', [('accurately', '準確地'), ('back and forth', '來回地'), ('behavior', '行為'), ('blood pressure', '血壓'), ('bunch', '一串；一束'), ('capture', '捕捉'),
             ('chest', '胸部'), ('coconut', '椰子'), ('commit', '犯（罪）'), ('content', '滿足的'), ('court', '法院；法庭'), ('drug', '藥物'),
             ('fancy', '花俏的；高級的'), ('hook', '連接；鉤上'), ('insane', '精神失常的'), ('interview', '面談；訊問'), ('investigate', '調查'), ('measure', '測量'),
             ('needle', '指針；針'), ('perspiration', '流汗；汗水'), ('prison', '監獄'), ('pulse', '脈搏'), ('sunscreen', '防曬乳'), ('tempt', '引誘')])

KEY = {'come across': 'come', 'out of': 'out', 'pass out': 'pass', 'fall apart': 'fall', 'give up': 'give', 'work out': 'work',
       'social media': 'social', 'martial art': 'martial', 'scientific method': 'scientific', 'back and forth': 'forth', 'blood pressure': 'pressure'}
OPEN = {'U1', 'U2'}   # 開放的單元（其他填 N＝未開放）
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
