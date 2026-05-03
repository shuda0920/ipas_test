# 考試系統（React + Vite）

這是一個簡單的選擇題考試系統，流程分三頁：

- 題數選擇頁：選擇本次考試題數（一次最多 50 題）
- 考試頁：依據題庫出題、作答
- 結果頁：顯示分數，並可點選錯題查看解析與複習關鍵字

## 開發 / 建置

安裝：

```bash
npm install
```

啟動開發伺服器：

```bash
npm run dev
```

建置：

```bash
npm run build
```

預覽建置結果：

```bash
npm run preview
```

## 題庫格式（topic.json）

題庫放在 `src/topic/**/topic.json`，系統會用 `import.meta.glob` 在 build 時把所有題庫檔案打包進來。

每個 `topic.json` 內容是一個陣列，元素格式如下：

```json
{
	"topic": "題目內容",
	"choic": ["選項A", "選項B", "選項C", "選項D"],
	"ans": "選項B",
	"why": "解析文字",
	"keyword": ["關鍵字1", "關鍵字2"]
}
```

支援：

- `choic` 也可寫成 `choice`
- `ans` 可寫成：正確選項文字、數字索引（0-based 或 1-based）、或 A/B/C...（會自動解析）

範例題庫在 `src/topic/sample/topic.json`。
