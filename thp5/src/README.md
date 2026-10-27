# THP5 內容來源

- `words.py` → 產生 `../words.csv`（課本 Spelling List 拼字表 U1–U9，每單元 20 個）
- `grammar.py` → 產生 `../grammar.json`（課本 Grammar 頁小卡與題目、Phonics 頁發音小卡與聽辨題）

改內容時改這兩個檔，再執行：

```
python3 words.py ../words.csv
python3 grammar.py ../grammar.json
```

開放單元：`words.py` 的 `OPEN`（目前 U1–U3）。
