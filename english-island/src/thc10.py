# THC10 題庫（測試島用）：課本 Vocabulary C01＋Grammar C02（These and Those、Wish、Embedded Questions、Phrasal Verbs）
# 產生：python3 thc10.py ../thc10.csv
# 欄位：單字 | 類型 | 詞性 | 中文 | 英文定義（課本手寫的同義說明） | 例句 | 例句中文 | 關鍵字
# 類型：單字／片語／句子。遊戲的拼字題：片語、句子只拼「關鍵字」——關鍵字欄空白就自動挑最長的字；
#       文法句子手動指定關鍵字＝文法重點（例：These priests are richer than ____ priests. → those）
# 單元全部是 U1 → 九款遊戲都從這一份題庫出題（遊戲的單元不存在時用全部單字）
import csv, sys

V = [
  # ── Verb Phrases ──
  ('read a magazine article', '片語', 'v.', '讀雜誌文章', '', 'I read a magazine article about Japan.', '我讀了一篇關於日本的雜誌文章。', ''),
  ('buy a travel guide', '片語', 'v.', '買旅遊指南', '', 'We bought a travel guide before the trip.', '我們在旅行前買了一本旅遊指南。', 'travel'),
  ('arrange a trip', '片語', 'v.', '安排旅行', 'plan a trip', 'Mom arranged a trip to Tainan.', '媽媽安排了一趟台南之旅。', ''),
  ('cancel a trip', '片語', 'v.', '取消旅行', '', 'We canceled the trip because of the typhoon.', '因為颱風，我們取消了旅行。', ''),
  ('go abroad', '片語', 'v.', '出國', 'travel to another country', 'My aunt goes abroad every summer.', '我阿姨每年夏天都出國。', ''),
  ('travel a long distance', '片語', 'v.', '長途旅行', 'travel far', 'Birds travel a long distance in winter.', '鳥在冬天會長途飛行。', ''),
  ('own a company', '片語', 'v.', '擁有一間公司', 'own a business', 'His father owns a company in Taipei.', '他爸爸在台北擁有一間公司。', ''),
  ('sell jewelry', '片語', 'v.', '賣珠寶', '', 'The woman sells jewelry at the night market.', '那位女士在夜市賣珠寶。', ''),
  ('bargain with a vendor', '片語', 'v.', '跟小販討價還價', '', 'Dad bargained with a vendor for a cheaper price.', '爸爸跟小販殺價想買便宜一點。', ''),
  ('pay in cash', '片語', 'v.', '付現金', '', 'Can I pay in cash?', '我可以付現金嗎？', ''),
  ('carry luggage', '片語', 'v.', '提行李', '', 'He helped me carry my luggage.', '他幫我提行李。', ''),
  ('stamp a passport', '片語', 'v.', '在護照上蓋章', '', 'The officer stamped my passport.', '海關人員在我的護照上蓋了章。', ''),
  ('send a postcard', '片語', 'v.', '寄明信片', 'mail a postcard', 'I sent a postcard to my grandma.', '我寄了一張明信片給奶奶。', ''),
  ('force (someone) to ...', '片語', 'v.', '強迫（某人）做…', 'make (someone) do something', 'The rain forced us to stay home.', '下雨讓我們不得不待在家。', ''),
  ('slow (someone) down', '片語', 'v.', '讓（某人）慢下來', '', 'The heavy bag slowed him down.', '那個很重的包包讓他走得很慢。', ''),
  ('see a funeral', '片語', 'v.', '看見葬禮', '', 'We saw a funeral near the temple.', '我們在廟附近看到一場葬禮。', ''),
  # ── Nouns ──
  ('a tour guide', '片語', 'n.', '導遊（人）', 'a person who shows visitors around', 'The tour guide told us a funny story.', '導遊跟我們說了一個好笑的故事。', 'tour'),
  ('priests', '單字', 'n.', '神父；祭司（複數）', '', 'The priests are walking to the church.', '神父們正走向教堂。', ''),
  ('an owner', '片語', 'n.', '擁有者；老闆', '', 'Is she the owner of the shop?', '她是這家店的老闆嗎？', ''),
  ('a modest judge', '片語', 'n.', '謙虛的法官', '', 'The modest judge never talks about himself.', '那位謙虛的法官從不談論自己。', 'judge'),
  # ── Adjectives ──
  ('on schedule', '片語', 'adj.', '準時；照預定時間', 'on time', 'The train left on schedule.', '火車準時開走了。', ''),
  ('homesick', '單字', 'adj.', '想家的', 'missing home', 'Kevin felt homesick on his first night at camp.', 'Kevin 營隊第一晚很想家。', ''),
  ('grateful', '單字', 'adj.', '感激的', 'thankful', 'I am grateful for your help.', '我很感謝你的幫忙。', ''),
  ('disappointed', '單字', 'adj.', '失望的', 'feeling let down', 'She was disappointed when the trip was canceled.', '旅行取消時她很失望。', ''),
  # ── 圖片標籤 ──
  ('magazines', '單字', 'n.', '雜誌（複數）', '', 'There are many magazines on the table.', '桌上有很多雜誌。', ''),
  ('articles', '單字', 'n.', '文章（複數）', '', 'I read two articles about space.', '我讀了兩篇關於太空的文章。', ''),
  ('luggage', '單字', 'n.', '行李（不可數）', '', 'How much luggage do you have?', '你有多少行李？', ''),
  ('passport', '單字', 'n.', '護照', '', "Don't forget your passport!", '別忘了你的護照！', ''),
  ('postcards', '單字', 'n.', '明信片（複數）', '', 'She bought three postcards in New York.', '她在紐約買了三張明信片。', ''),
  ('jewelry', '單字', 'n.', '珠寶（不可數）', '', 'This jewelry is very expensive.', '這些珠寶非常貴。', ''),
  ('tour', '單字', 'n.', '旅遊；參觀行程', '', 'We went on a tour of the old city.', '我們參加了老城區的導覽行程。', ''),
  ('a travel guide', '片語', 'n.', '旅遊指南（書）', 'a book about a place for travelers', 'The travel guide shows the best restaurants.', '這本旅遊指南列出最好的餐廳。', 'travel'),
]

G = [
  # ── These and Those ──
  ('these', '單字', 'pron.', '這些（近的，複數）', 'this → these', 'These cookies are mine.', '這些餅乾是我的。', ''),
  ('those', '單字', 'pron.', '那些（遠的，複數）', 'that → those', 'Those plants are healthier.', '那些植物比較健康。', ''),
  ('These priests are richer than those priests.', '句子', '文法', '這些神父比那些神父有錢。', 'these and those', '', '', 'those'),
  ('Those clerks are lazier than these clerks.', '句子', '文法', '那些店員比這些店員懶惰。', 'these and those', '', '', 'these'),
  ('Those plants are healthier than these plants.', '句子', '文法', '那些植物比這些植物健康。', 'these and those', '', '', 'those'),
  # ── Wish ──
  ('wish', '單字', 'v.', '希望（不是事實的願望）', 'wish + past tense / past perfect tense', 'I wish I were taller.', '我希望我更高一點。', ''),
  ('The tour guide wishes he were a cook.', '句子', '文法', '導遊希望自己是廚師。', 'wish + past tense', '', '', 'were'),
  ('The woman in the wheelchair wishes that the nurse would slow down.', '句子', '文法', '坐輪椅的女士希望護士能慢一點。', 'wish + past tense', '', '', 'would'),
  ('Becky wishes she had brought her comic books.', '句子', '文法', 'Becky 希望她當時有帶漫畫書。', 'wish + past perfect tense', '', '', 'brought'),
  ("Who wishes that he hadn't eaten such a big lunch?", '句子', '文法', '誰希望他剛才沒吃那麼多午餐？', 'wish + past perfect tense', '', '', 'eaten'),
  # ── Embedded Questions ──
  ('Tim asked when Dad called.', '句子', '文法', 'Tim 問爸爸什麼時候打過電話。（間接問句）', 'indirect question', '', '', 'when'),
  ('Tim forgot when Dad called.', '句子', '文法', 'Tim 忘記爸爸什麼時候打過電話。（嵌入問句）', 'embedded question', '', '', 'forgot'),
  ('Do you know where my pencil is?', '句子', '文法', '你知道我的鉛筆在哪裡嗎？', 'embedded question in a question', '', '', 'where'),
  ('Does she remember why he canceled the trip?', '句子', '文法', '她記得他為什麼取消旅行嗎？', 'embedded question in a question', '', '', 'remember'),
  ('The happy kid is wondering where the restroom is.', '句子', '文法', '那個開心的小孩在想廁所在哪裡。', 'embedded question', '', '', 'wondering'),
  ('Susie wanted to know whether/if the woman is the owner.', '句子', '文法', 'Susie 想知道那位女士是不是老闆。', 'whether/if (or not)', '', '', 'whether'),
  ("The clerk can't remember whether/if he knows the priests.", '句子', '文法', '店員想不起來他認不認識那些神父。', 'whether/if (or not)', '', '', 'knows'),
  ('Could you tell me what time it is?', '句子', '文法', '你可以告訴我現在幾點嗎？', 'polite embedded question', '', '', 'what'),
  # ── Phrasal Verbs（up ↔ down 反義） ──
  ('come up', '片語', 'v.', '上來（↔ go down）', '', 'Come up to the second floor!', '上來二樓！', ''),
  ('go down', '片語', 'v.', '下去（↔ come up）', '', 'Go down the stairs slowly.', '慢慢走下樓梯。', ''),
  ('come down', '片語', 'v.', '下來（↔ go up）', '', 'Come down from the tree!', '從樹上下來！', ''),
  ('go up', '片語', 'v.', '上去（↔ come down）', '', 'Prices go up every year.', '價格每年都上漲。', ''),
  ('fall down', '片語', 'v.', '跌倒（↔ get up）', '', 'The boy fell down on the ice.', '男孩在冰上跌倒了。', ''),
  ('get up', '片語', 'v.', '起來；起床（↔ fall down）', '', 'I get up at seven.', '我七點起床。', ''),
  ('speed up', '片語', 'v.', '加速（↔ slow down）', 'move faster', 'The car sped up on the highway.', '車子在高速公路上加速。', ''),
  ('slow down', '片語', 'v.', '慢下來（↔ speed up）', 'move more slowly', 'Please slow down. I can\'t keep up.', '請慢一點，我跟不上。', ''),
  ('warm up', '片語', 'v.', '變暖；暖身（↔ cool down）', 'something gets warmer', 'Let\'s warm up before we run.', '跑步前我們先暖身。', ''),
  ('cool down', '片語', 'v.', '變涼；冷靜下來（↔ warm up）', 'something gets cooler', 'Wait for the soup to cool down.', '等湯涼一點。', ''),
]

def main(out):
  with open(out, 'w', newline='', encoding='utf-8') as f:
    wr = csv.writer(f)
    wr.writerow(['ID', '單字', '類型', '詞性', '音標', '中文', '英文定義', '例句', '例句中文', '教材', '單元', '課次', 'CEFR', '狀態', '備註', '開放', '關鍵字'])
    n = 0
    for part, rows in (('V', V), ('G', G)):
      for (w, t, pos, zh, d, ex, exzh, key) in rows:
        n += 1
        wr.writerow([f'T10-{n:03d}', w, t, pos, '', zh, d, ex, exzh, 'THC10', 'U1', '', '', '', '', '', key])
  print(out, n, '筆')

if __name__ == '__main__':
  main(sys.argv[1] if len(sys.argv) > 1 else '../thc10.csv')
