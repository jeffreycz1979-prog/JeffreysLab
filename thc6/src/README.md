# THC6 內容來源

- `words.py` → 產生 `../words.csv`（課本各單元 Vocabulary U1–U9，每單元 20 個）
- `grammar.py` → 產生 `../grammar.json`（文法小卡與題目、發音、句型教學頁 lessons.py、會話站 talk.py）

改內容時改這兩個檔，再執行：

```
python3 words.py ../words.csv
python3 grammar.py ../grammar.json
```

開放單元：`words.py` 的 `OPEN`（目前開 U1–U2（文法、發音寫好的單元才開））。

句型教學頁（圖解、公式、上色例句）：`lessons.py`，由 `grammar.py` 一起寫進 grammar.json 的 `lessons`。
