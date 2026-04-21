# NewCore 補習班管理系統 - Claude Context
最後更新：2026/04/21

---

## 🔄 系統現況

### 前端網址
| 頁面 | 網址 |
|------|------|
| 教務系統 | https://jeffreycz1979-prog.github.io/newcore-pro/ |
| 建班系統 | https://jeffreycz1979-prog.github.io/newcore-pro/admin.html |
| 工具包 | https://jeffreycz1979-prog.github.io/JeffreysLab/tools.html |
| 產品介紹 | https://jeffreycz1979-prog.github.io/JeffreysLab/guide.html |

### GitHub Repos
- 教務+建班系統：`jeffreycz1979-prog/newcore-pro`
- 工具包+產品介紹：`jeffreycz1979-prog/JeffreysLab`

---

## 🏗️ GAS 架構

### 兩個 GAS 部署（嚴格分工）

| GAS | 部署網址（前綴）| 用途 |
|-----|----------------|------|
| 授權中心 | `AKfycbyF9mEn3...` | 授權管理、Email 發放 |
| 客戶端母版 | `AKfycbxE7aSry...` | 教務功能、建班功能 |

### 授權中心 GAS
- Script ID：`1trz1CHf07__NsmHswJc8lOzaQGceGg6DCzuyya66Ytfsu0dMe4gqSovk`
- Sheet ID：`1h3JG5HjMz0H4q8zXE7cFsLbfB-J63j6GjfudRkho1Jg`
- 發布為 Library（識別碼：`NewCore`），供客戶端引用
- 目前 Library 版本：v20（2026/04/19）
- 包含：`checkLicense`、`checkToolsToken`、`verifyMasterAuth`、`getMasterClients`、`issueNewLicense`、`buildEmailBody`
- **待加入**：`大腦端_Core.gs` 的所有教務母版功能

### 客戶端 GAS（目前過渡狀態）
- 部署在語音版原始 Sheet（`1_25p98pfd3kS7bn8SbaDGRswv9ENIz-368brYWtr6OQ`）
- 目前 SHEET_ID 常數寫死為 v2 的 Sheet（`17vjqKCeRHVZgYARg8Se6J9RZjSsNeD1k-8qPjk_WdIA`）
- ⚠️ **已知問題**：因 SHEET_ID 寫死，所有客戶 getClassList 都讀到 v2 的班級

---

## 📋 授權名單欄位（0-based）
```
A=0  姓名
B=1  Email
C=2  SheetID
D=3  開始日期
E=4  到期日
F=5  狀態（待發放/啟用/停用）
G=6  方案類型（Free/Standard/Pro）
H=7  班級上限（3/10/999）
I=8  Tools Token
J=9  Tools 到期日
K=10 Admin 授權碼（Standard/Pro 才填）
```

## 📋 授權紀錄分頁欄位
```
A=授權碼  B=姓名  C=角色(superadmin/admin)
D=可操作SheetId（空=全部，填了=只能操作那間）
E=備註
```
- 目前只有 Jeffrey（ADMINjeff, superadmin）
- Standard/Pro 客戶需在此加一行 admin 角色

---

## 📦 方案設計
| 方案 | 班級上限 | 建班系統 | Tools | 備註 |
|------|---------|---------|-------|------|
| Free | 3班 | ❌（Jeffrey協助） | 30天試用 | Jeffrey保管Sheet |
| Standard | 10班 | ✅ | 30天試用 | 需在授權紀錄加admin授權碼 |
| Pro | 無限 | ✅ | 30天試用 | 同Standard |

---

## 🎯 目前客戶名單
| 補習班名稱 | Sheet ID | 方案 | 備註 |
|-----------|---------|------|------|
| 客戶端原始版 | `1cMR_d_7yf7gNWZ2SQPXd66Q7-MfMwm9bMSPXe8VDP7Q` | Free | Jeffrey保管 |
| 專屬語音版v2 | `17vjqKCeRHVZgYARg8Se6J9RZjSsNeD1k-8qPjk_WdIA` | Pro | Jeffrey的v2 |
| 專屬語音版v1 | `1_25p98pfd3kS7bn8SbaDGRswv9ENIz-368brYWtr6OQ` | Standard | 客戶端母版GAS所在 |
| 民權Doris | `1Z8xoVzEu5cbnWnVRHuGskMuhdLVbbN0Cu5f1TyIqs_I` | Standard | |

---

## ⚠️ 已知問題 & 注意事項

1. **SHEET_ID 寫死問題**：客戶端 GAS 的 `SHEET_ID` 常數是 v2 的 Sheet ID，導致所有客戶 `getClassList` 都讀 v2 的班級清單。根本解法是 Library 架構。

2. **Library 架構尚未完成**：
   - `大腦端_Core.gs` 已寫好（在 /mnt/user-data/outputs/）
   - 需要貼入授權中心 GAS 的新 Code 檔案
   - 客戶端需要加入選單函數的 wrapper（每個選單函數呼叫 `NewCore.xxx()`）
   - Library 重新發布新版本

3. **Safari/mobile Edge**：JSONP 被 ITP 封鎖，Chrome 和 LINE 瀏覽器正常。尚未修復。

4. **v1/v2 GAS 獨立**：v1、v2 有自己的 Code.gs 和部署網址，不受客戶端 GAS 影響，可正常使用。

5. **Rhino 執行階段**：「NewCore成績語音系統客戶端」GAS 使用舊版 Rhino 執行階段（已淘汰），應遷移至 V8。

---

## 🚀 下次優先待辦（按順序）

### 最優先：Library 架構完成
1. 授權中心 GAS → 新增 `Core.gs` 檔案，貼入 `大腦端_Core.gs` 內容
2. 授權中心重新發布 Library 新版本（v21）
3. 客戶端 Code.gs 改為：
   ```javascript
   const SHEET_ID       = "客戶的 Sheet ID";
   const GEMINI_API_KEY = "客戶的 Gemini Key";
   
   function doGet(e)  { return NewCore.handleGet(e,  SHEET_ID, GEMINI_API_KEY); }
   function doPost(e) { return NewCore.handlePost(e, SHEET_ID, GEMINI_API_KEY); }
   function onOpen()  { NewCore.buildMenu(); }
   
   // 選單 wrapper（必須在客戶端定義）
   function openClassNavigator()     { NewCore.openClassNavigator(); }
   function jumpToToday()            { NewCore.jumpToToday(); }
   function createClassSheet()       { NewCore.createClassSheet(); }
   function updateStudentListOnly()  { NewCore.updateStudentListOnly(); }
   function repairExistingSheets()   { NewCore.repairExistingSheets(); }
   function generateSchedulePreview(){ NewCore.generateSchedulePreview(); }
   function generatePendingTaskReport(){ NewCore.generatePendingTaskReport(); }
   function initSystem()             { NewCore.initSystem(); }
   ```
4. 重新部署客戶端 GAS
5. 測試：用 `1cMR_d...` 登入 index.html，確認班級清單正確

### 其次：Standard 10班封鎖測試
- 用 Doris 或測試 Sheet，建 11 個不同班級，確認第 11 班被封鎖

### 其他待辦
- guide.html 截圖路徑確認（`images/` 資料夾）
- index.html nav 加 guide.html 連結
- tools.html、admin.html 上傳最新版到 GitHub

---

## 💡 工作模式規範

### 新對話開始時，第一句話：
```
我們在改進 NewCore 補習班管理系統。
請先讀 NEWCORE_CONTEXT.md 了解現況，
然後告訴我你看到什麼，我確認後再開始。
```

### 改動原則
- ❌ 不要一次重寫整個 Code.gs（容易出錯）
- ✅ 每次只改一個函數或一個功能
- ✅ 改動前先確認目標，改完後測試再繼續
- ✅ GAS 每次修改後必須重新部署（New version）才生效

### 兩個 GAS 不能混淆
- admin.html 的登入/驗證 → 走 `BRAIN_URL`（授權中心）
- admin.html 的建班/預覽 → 走 `GAS_URL`（客戶端）
- 混淆這兩個是最常見的 bug 來源

---

## 📁 重要輸出檔案位置
所有產出的程式碼都在 `/mnt/user-data/outputs/`：
- `授權中心_Code.gs`：授權中心的授權管理部分
- `大腦端_Core.gs`：授權中心的教務母版功能（待貼入）
- `客戶端_Code.gs`：過渡版（含所有功能，SHEET_ID 寫死）
- `admin.html`：最新版建班系統前端
- `tools.html`：最新版工具包
- `guide.html`：產品介紹頁
