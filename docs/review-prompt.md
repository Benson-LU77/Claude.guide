# 交叉檢核任務：Claude 全貌指南（給 Codex 或其他 AI 用）

> 用法：在這個 repo 的根目錄打開 Codex（或其他 coding agent），把這整份檔案貼給它，或直接說「照 docs/review-prompt.md 做」。
> 這份說明不會被網站引用，只是工作用的檢核清單。

## 你的角色

你是第二位獨立審查者。第一輪審查已由另一個 AI（Claude）做完，結論列在下方「第一輪結論」。
**你的任務是挑戰它，而不是附和它**：
- 第一輪說「錯」的，請重新查證，確認真的錯、改成的內容也正確
- 第一輪說「正確」或「查不到」的，請找出它漏掉或判斷錯的地方
- 對「主題與品牌建議」提出你自己的看法，可以完全不同

所有事實判斷都要附**官方來源網址**。查不到就寫「查不到」，不要憑記憶補。今天的日期以你執行時為準；網站寫的是「截至 2026-09」。

## 網站是什麼

- 繁體中文的 Claude（Anthropic）產品家族說明網站，對象從一般使用者到開發者、團隊管理者
- 主頁 `index.html`：22 章（`<section class="chapter" id="...">`），約 28 萬字，整頁做成「正在瀏覽的 JSON 檔」風格
- 測驗頁 `quiz.html`：66 題，題庫在 `quiz-data.js`；另有 3D 奇幻 RPG 闖關（`rpg.js`、`rpg-data.js`），嚮導是精靈「露米」
- logo：像素風睡覺橘貓（`assets/logo/pixel-cat-sleep.svg`）
- 線上網址：https://benson-lu77.github.io/Claude.guide/

章節 id：getting-started、overview、claudeai、cowork、prompting、aifluency、pipeline、api、tooluse、codeexec、claudecode、claudecode-adv、ecosystem、practical、gitflow、deploy、features、extensions、enterprise、aicoding、safety、resources

## 官方來源（優先順序）

1. https://platform.claude.com/docs （模型、API、工具、定價、錯誤碼）
2. https://code.claude.com/docs （Claude Code）
3. https://support.claude.com （claude.ai、Cowork、方案、組織設定）
4. https://claude.com/pricing 、https://claude.com/docs （Claude Tag、Cowork 指南）
5. https://www.anthropic.com/news
6. https://privacy.claude.com 、https://trust.anthropic.com （資料與合規）

---

## 第一輪結論（請挑戰）

### A. 時效性錯誤（第一輪認為最急）

1. **Sonnet 5.5 全站沒提到**：2026-09-28 推出，ID `claude-sonnet-5-5`，$2／$10，1M／128K，知識截止 2026-06，預設 effort high；Sonnet 5 改列 legacy。影響 overview 模型表，以及 api、tooluse、features、prompting 裡的各份模型清單（安全分類器、思考無法關閉、tool_choice any/tool 回 400、取樣參數回 400）。來源：platform.claude.com/docs/en/models/sonnet-5-5/overview
2. **Cowork**：2026-10-06 起 Pro／Max 新任務一律在雲端執行，「Only on your computer」移除，排程也移到雲端。cowork 章的本機段落與「本機 vs 雲端排程」表過時。來源：support.claude.com/en/articles/15520349、/13854387
3. **Claude for Government**：features 章寫「所有組織要在 2026-10-04 前轉到新版」，期限已過。
4. **Sonnet 4.5**：2026-09-30 宣布淘汰，2026-11-30 退役。來源：platform.claude.com/docs/en/about-claude/model-deprecations
5. **Claude Code 預設權限模式**：v2.1.283（2026-09-25）起，終端機與 VS Code 一律預設 auto；網站寫部分方案預設 Manual。來源：code.claude.com/docs/en/permission-modes
6. **⚠ 第一輪內部有衝突**：Haiku 4.5「最早 2026-10-15 退役」。一組說官方 deprecations 表有這個日期；另一組說官方表上仍是 Active、尚未發淘汰通知，依「至少提前 60 天通知」最早要 12 月。**請你判定哪個對。**

### B. 其他錯誤（節錄）

- aifluency：人機團隊四原則，網站寫資訊存取「不多不少」；第一輪認為官方是「Work in public, give agents broad context」，且來源是 2026-06-24 部落格文章（claude.com/blog/building-effective-human-agent-teams），不是課程
- claudeai、features：Free 也能用「Anyone with the link」分享 artifact；「要 Owner 開 External sharing」只適用 Enterprise，Team 預設開（support.claude.com/en/articles/9547008）
- pipeline：「塞不下會被截掉或壓縮」→ API 輸入超過上限直接 400 `prompt is too long`；輸出撞上限是 stop_reason `model_context_window_exceeded`
- tooluse：Opus 5.5／Sonnet 5.5 在 Claude API 與 Google Cloud 只接受 `computer_toolset_20260801`；streaming 的 thinking 是先空字串 `thinking_delta` 再 `signature_delta`
- enterprise：自助購買的 Enterprise 不能開 HIPAA；API BAA 可在 Console 自助簽；強制最低版本的鍵是 `requiredMinimumVersion` 不是 `minimumVersion`；Covered Models 漏 Mythos 5.1／Mythos 5
- claudecode／claudecode-adv：Routines 改每小時上限（排程 100 次／小時／帳號；Run now 與 API 30 次／小時／routine）；`--bare` 不讀訂閱登入；接續到雲端的路徑改為 session 選單 → Open in → Cloud；Remote Control 支援 CLI、Desktop、VS Code；Security guidance 需 Python 3.7+
- ecosystem：Claude Tag 設定流程與官方不符（官方：配對 Slack → 額度 → 上線）；MCP 已於 2025-12 捐給 Linux Foundation 旗下 Agentic AI Foundation
- overview、claudeai：Free 的限制是「1 個自訂連接器」，不是「1 個外部工具」
- practical：錯誤碼表少 409 conflict_error
- features：Skills 的 `allowed-tools` 是「預先核准」不是「限制」
- deploy：GitHub Pages 不是「一律公開」（Enterprise Cloud 可私有）

### C. 第一輪查不到原文的主張（請重點查）

- Team Standard 用量為 Pro 的 1.25 倍（Premium 為其 5 倍）
- 「所有方案都有 5 小時上限，付費方案另有每週上限」
- 組織指示上限 3,000 字元；群組最多 1,000 個；Surveys 約 90 秒
- 訓練資料包含使用 Claude in Chrome 時蒐集的資料
- 消費者版資料保留 5 年／30 天／2 年／7 年等數字
- Claude in Chrome「受 HIPAA 規範的組織不提供」
- 「有自訂保留協議或 HIPAA 的組織，記憶不可用」
- Programmatic tool calling 每個 cell 90 秒上限
- Dispatch「目前不開放新使用者」（兩組說法不一）
- Cowork 是否已與一般對話合併（約 2026-09-16）
- Cowork 活動是否進 Compliance API
- AI 素養課程的四特性、課名、徽章或證書

### D. 刪除或精簡（第一輪建議）

- features 與 claudeai 逐條重複（記憶、無痕、語音、專案、Research、Docs、Artifacts 分享）
- 「Dispatch 暫不開放新使用者」全站 6 次、「網路搜尋沒有開關」3 次、「無痕用舊介面」2 次
- 提示注入與「不會做的事」在 cowork、ecosystem、safety 重複；Chrome 權限表在 cowork、ecosystem 重複
- Claude in Chrome 說明、Agent SDK 對照在 ecosystem 與 extensions 重複
- claudecode-adv「隨處工作」表與 claudecode 入口表重疊
- gitflow 約 2.2 萬字多為通用 Git 教學 → 移附錄；aicoding 12 積木與第三方工具推薦縮減
- api「JSON 是語法不是語意」、Haiku 4.5 temperature 範例可刪

### E. 新增（第一輪建議）

- Sonnet 5.5 定位與從 Sonnet 5 遷移的 breaking changes；Opus 5.5 effort 預設 medium
- Claude × GitHub：PR 裡 @claude、Code Review、/autofix-pr、雲端工作階段開 PR、GitHub 事件觸發 Routines
- Claude Code：self-hosted environments、`claude --desktop`、GitHub Actions 用 CLAUDE_CODE_OAUTH_TOKEN、apt／dnf／apk 安裝
- 成本：各級距月花費上限、快取折扣、Fast mode、inference_geo 加價、圖片限制
- 企業：Bedrock 新舊整合差異、Compliance API 涵蓋範圍、`allowedProviders`
- Claude Tag 官方名稱「@Claude」與計費

### F. 主題與品牌（第一輪建議，請提出你的看法）

- 主題「Claude 全貌指南」保留
- 視覺有三套（JSON 編輯器、像素橘貓 logo、奇幻精靈 RPG）且吉祥物有兩個（貓、露米）→ 建議橘貓定為全站品牌，露米只當遊戲角色
- 頁首「// anthropic / claude」＋「claude.guide.json」容易被誤認為官方 → 加明顯的「非官方、個人整理」聲明
- 從「百科」改成「一般使用者／開發者／團隊管理者」三條導讀主線，通用軟體知識移附錄

---

## 你要交出的東西

請寫成一個新檔 `docs/review-codex.md`（**不要修改網站本身的任何檔案**），格式：

1. **對第一輪的判定**：A、B、C 每一條標「同意／不同意／部分同意」＋理由＋來源網址
2. **第一輪漏掉的錯誤**：章節 id＋網站原文摘句（30 字內）→ 正確內容 → 來源
3. **測驗題庫**：檢查 `quiz-data.js` 66 題，列出答案已過時或有爭議的題目
4. **主題與品牌**：你的建議（可以和第一輪不同），以及理由
5. **優先順序**：你會先改哪 10 件事

寫繁體中文，條列，不要開場白。
