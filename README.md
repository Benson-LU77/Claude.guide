# Claude 全貌指南 — claude.guide.json

一份把 Claude 整個產品家族攤開來看的單頁網站：claude.ai、Claude API、JSON 訊息格式、工具調用機制、code execution、Claude Code、Claude Design、開發者延伸介面，一路講到 Settings 裡每個功能的定義與使用方式。

整個頁面把自己當成一份「正在被瀏覽的 JSON 檔案」來設計：每章標題寫成 `"key": {` 的形式，左側導覽是可捲動高亮的樹狀結構，程式碼區塊有即時語法上色。

## 內容

- `00` 新手入門 — 帳號、方案、限額
- `01–03` claude.ai 一般使用者路線（總覽、功能、怎麼問問題）
- `04–11` 開發者路線（API/JSON、工具調用、code execution、Claude Code、生態系、實務操作、功能定義、開發者延伸介面）
- `12–13` 安全限制與延伸閱讀

## 本機預覽

不需要建置工具，直接用瀏覽器開：

```bash
open index.html        # macOS
# 或起一個本機伺服器
python3 -m http.server 8000
```

## 部署到 GitHub Pages

1. 在 GitHub 建一個新 repo（public）
2. 把這個資料夾的內容 push 上去（見下方指令）
3. repo 的 Settings → Pages → Source 選 `main` branch / `/ (root)`
4. 幾分鐘後就會有一個 `https://<你的帳號>.github.io/<repo名稱>/` 的公開網址

## Push 到你自己的 GitHub

```bash
# 在 GitHub 上先建好一個空 repo，例如叫 claude-guide
git remote add origin https://github.com/<你的帳號>/claude-guide.git
git branch -M main
git push -u origin main
```

---
整理時間 2026-06，部分名稱與版本以官方文件最新狀態為準。
