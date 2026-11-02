# THC6 句型教學頁（grammar.json 的 lessons）
# 每個單元 3 個重點，每個重點：
#   t 標題、en 英文標題、ex 說明（白話一兩句）
#   tl 圖解：時間軸或圖（type＋標籤），見 index.html 的 tlSVG()
#   f  公式（一行或多行），每格 [文字, 顏色角色]
#   tb 對照表（可省略）
#   eg 例句 [英文, 中文]；英文用 {角色:文字} 上色
#   tip 小提醒
# 顏色角色：S 主詞、B be 動詞／助動詞、V 動詞、T 時間、C 連接詞、N 否定、A 形容詞／副詞、P 介系詞、O 其他（受詞）

L = lambda t, en, ex, tl, f, eg, tip='', tb=None: {k: v for k, v in dict(t=t, en=en, ex=ex, tl=tl, f=f, tb=tb, eg=eg, tip=tip).items() if v}

LESSONS = {
 'U1': [
  L('stop／keep ＋ V-ing：停止做／持續做', 'stop Ving / keep Ving',
    'stop 和 keep 後面接「動作」時，動作要加 -ing。stop＝不再做了；keep＝一直做下去。',
    {'type': 'span', 'a': 'keep skating 🛼', 'b': 'stopped at 3:15'},
    [[['主詞', 'S'], ['stop', 'V'], ['動詞-ing', 'V']], [['主詞', 'S'], ['keep', 'V'], ['動詞-ing', 'V']]],
    [['{S:Susie} {V:stopped skating} {T:at 3:15}.', 'Susie 三點十五分停止溜冰。'],
     ['{S:Becky and Susie} {B:will} {V:keep playing} chess.', 'Becky 和 Susie 會繼續下西洋棋。'],
     ['{S:Tim} {V:kept trying} until he won.', 'Tim 一直努力到他贏為止。']],
    '錯：stop skate／keep play → 對：stop skating／keep playing',
    [['stop', 'stopped'], ['keep', 'kept']]),
  L('現在進行式：現在「正在」做', 'Present Continuous',
    '說「這一刻正在發生」的事。be 動詞跟著主詞變，動詞後面加 -ing。否定就在 be 動詞後面加 not。',
    {'type': 'now', 'a': 'is digging'},
    [[['主詞', 'S'], ['am / is / are', 'B'], ['動詞-ing', 'V'], ['…', 'O']], [['主詞', 'S'], ["am not / isn't / aren't", 'N'], ['動詞-ing', 'V']]],
    [['{S:The dog} {B:is} {V:digging} a hole.', '那隻狗正在挖洞。'],
     ["{S:Paul and Wally} {N:aren't} {V:having} fun.", 'Paul 和 Wally 玩得不開心。'],
     ["{S:I}{B:'m} {V:trying}, but I can't!", '我正在試啊，但我沒辦法！']],
    '動詞一定要加 -ing：is dig → is digging（dig 要重複 g）', [['I', 'am'], ['he / she / it／一個人', 'is'], ['you / we / they／很多人', 'are']]),
  L('程度副詞：really／very ＋ 副詞', 'Adverbs of Degree',
    '副詞告訴我們動作「怎麼做」：fast、carefully。前面再加 really 或 very，表示「非常」。',
    {'type': 'adverb', 'a': 'careless', 'b': 'carelessly'},
    [[['主詞＋動詞', 'S'], ['really / very', 'A'], ['副詞', 'A']]],
    [['{S:Alice} {B:was} {V:throwing} the balls {A:really fast}.', 'Alice 擲球擲得非常快。'],
     ['{S:Kate} {B:is} {V:skating} {A:very carelessly}.', 'Kate 溜冰溜得非常不小心。'],
     ["{S:I}{B:'ll} {V:try} to skate {A:more carefully}.", '我會試著更小心地溜冰。']],
    '大部分形容詞加 -ly 變副詞（careful → carefully）；fast、hard 不變',
    [['careful', 'carefully'], ['careless', 'carelessly'], ['slow', 'slowly'], ['fast', 'fast'], ['good', 'well']]),
 ],
 'U2': [
  L('good at／terrible at ＋ V-ing：擅長／很不會', 'good at Ving / terrible at Ving',
    'at 後面接「動作」時，動作要加 -ing。good at＝很會；terrible at＝很不會。',
    None,
    [[['主詞', 'S'], ['be', 'B'], ['good at', 'A'], ['動詞-ing', 'V']], [['主詞', 'S'], ['be', 'B'], ['terrible at', 'N'], ['動詞-ing', 'V']]],
    [['{S:Alice} {B:is} {A:good at} {V:drawing} clothes.', 'Alice 擅長畫衣服。'],
     ['{S:The worker} {B:is} {N:terrible at} {V:mopping} the floor.', '那工人很不會拖地。'],
     ["{S:My mom}{B:'s} {A:good at} {V:sewing} things.", '我媽媽很會縫東西。']],
    '錯：good at draw → 對：good at drawing'),
  L('感官動詞：看起來、聞起來、嚐起來……', 'Sensory Verbs',
    'look／smell／sound／taste／feel 說「感覺起來怎樣」。後面接形容詞；要接名詞時加 like。',
    {'type': 'senses'},
    [[['主詞', 'S'], ['look / smell / sound / taste / feel', 'V'], ['形容詞', 'A']], [['主詞', 'S'], ['感官動詞', 'V'], ['like', 'P'], ['名詞', 'O']]],
    [["{S:The man's cake} {V:tasted} {A:bad}.", '那男人的蛋糕嚐起來不好吃。'],
     ['{S:The socks} {V:felt} {P:like} rocks.', '這雙襪子摸起來像石頭。'],
     ['{S:This dress} {V:looks} really {A:cute}.', '這件洋裝看起來真可愛。']],
    '後面用形容詞不用副詞：tasted bad（不是 badly）',
    [['👀 look', '看起來'], ['👃 smell', '聞起來'], ['👂 sound', '聽起來'], ['👅 taste', '嚐起來'], ['✋ feel', '摸起來']]),
  L('as／when：當……的時候', 'as / when',
    'as＝兩件事「同時」進行（一邊……一邊……）；when＝正在做一件事的時候，另一件事突然發生。',
    {'type': 'interrupt', 'a': 'was talking', 'b': 'the boy jumped over her'},
    [[['主詞＋動詞', 'S'], ['as', 'C'], ['主詞＋動詞', 'S']], [['主詞 was / were ＋ V-ing', 'S'], ['when', 'C'], ['主詞＋過去式', 'S']]],
    [["{S:Chuck's dad} {B:will} {V:talk} to the vendor {C:as} {S:he} {V:tries on} the hat.", 'Chuck 的爸爸會一邊試戴帽子一邊和小販講話。'],
     ['{S:Grandma} {B:was} {V:talking} on her cell phone {C:when} {S:the boy} {V:jumped} over her.', '奶奶正在講手機的時候，男孩跳過了她。'],
     ["{C:When} {S:you}{B:'re} {V:finished}, you can take the rest home.", '妳試穿完之後，可以把其他的帶回家。']],
    '講未來時，as／when 後面用現在式：as he tries（不是 will try）'),
 ],
}
