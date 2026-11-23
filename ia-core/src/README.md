# IA Core 課文導讀 內容來源（IA2：Connections Book 2，6 單元）

- `words.py` → 產生 `../words.csv`（課本 Syllabus 各單元 Vocabulary，每單元 24 個；`KEY` 是片語的遊戲拼字關鍵字）
- `grammar.py` → 產生 `../grammar.json`（每單元一個文法重點的小卡與題目；沒有發音）
- `reading.py` → 由 grammar.py 一起寫進 grammar.json 的 `reading`（課文導讀：簡單版課文＋原創練習篇）

改內容時改這幾個檔，再執行：

```
python3 words.py ../words.csv
python3 grammar.py ../grammar.json
```

開放單元：`words.py` 的 `OPEN`（目前 U1–U2）。U3–U6 的字只有中文，開放前要補英文定義與例句（words.py 會檢查）。
