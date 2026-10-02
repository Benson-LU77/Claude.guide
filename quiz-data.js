/* 精靈試煉題庫：由 04_稽核報告/quiz/*.json 產生，勿手改；改題請改 JSON 後重跑 gen_quiz_data.py */
window.QUIZ = {
 "realms": [
  {
   "name": "晨露森林",
   "desc": "一般使用者的起點：認識 Claude、學會好好說話",
   "icon": "leaf",
   "badge": "森林之葉"
  },
  {
   "name": "符文工坊",
   "desc": "開發者的魔法基礎：訊息怎麼流動、API 與工具",
   "icon": "rune",
   "badge": "符文之印"
  },
  {
   "name": "星橋山谷",
   "desc": "動手實作：生態系、Git、部署與功能字典",
   "icon": "star",
   "badge": "星橋之星"
  },
  {
   "name": "精靈王庭",
   "desc": "團隊與系統：企業設定與 AI coding 地圖",
   "icon": "crown",
   "badge": "王庭之冠"
  },
  {
   "name": "月光書塔",
   "desc": "守護與知識：安全、限制與術語",
   "icon": "moon",
   "badge": "月光之書"
  }
 ],
 "chapters": [
  {
   "id": "getting-started",
   "idx": 0,
   "title": "新手入門",
   "stage": "林間入口",
   "realm": 0,
   "questions": [
    {
     "q": "你想讓 Claude 直接整理你電腦裡的資料夾，最需要安裝哪一個？",
     "options": [
      "只用瀏覽器開網頁版就好",
      "手機 App",
      "桌面版 Claude Desktop",
      "任何入口都可以，效果一樣"
     ],
     "answer": 2,
     "explain": "想讓 Claude 直接讀寫你電腦裡的檔案、操作瀏覽器，一定要裝桌面版，網頁版做不到。",
     "link": "#getting-started"
    },
    {
     "q": "你用 email 註冊了 Claude 帳號，之後要怎麼登入？",
     "options": [
      "點 email 收到的登入連結",
      "輸入註冊時設定的 Claude 密碼",
      "用 API 金鑰登入",
      "每次都重新註冊一個新帳號"
     ],
     "answer": 0,
     "explain": "Claude 帳號沒有獨立密碼，每次都是用寄到信箱的登入連結，或用 Google 登入。",
     "link": "#getting-started"
    },
    {
     "q": "你想做個小網站，但很怕終端機。網站建議你可以先怎麼開始？",
     "options": [
      "先把 API 與 JSON 章讀完",
      "改用手機 App 來寫程式",
      "一定要先學會終端機才能開始",
      "用桌面版的「Code」分頁選資料夾開始"
     ],
     "answer": 3,
     "explain": "怕終端機可以先跳過安裝步驟，直接用桌面版的「Code」分頁選一個資料夾，完全不用打指令。",
     "link": "#getting-started"
    }
   ]
  },
  {
   "id": "overview",
   "idx": 1,
   "title": "總覽與選擇",
   "stage": "分岔路口的路標",
   "realm": 0,
   "questions": [
    {
     "q": "你要把上千筆資料做分類、格式轉換，想要又快又省，適合哪種模型？",
     "options": [
      "最強、最慢的頂級模型",
      "最快、最便宜的小模型",
      "官方旗艦主力模型",
      "上一代、不再更新的舊模型"
     ],
     "answer": 1,
     "explain": "格式轉換、分類、大量重複這類高量低複雜度的工作，適合交給最快最便宜的小模型，能明顯壓低成本。",
     "link": "#overview-models"
    },
    {
     "q": "你在 Claude Code 跑了很久的任務，網頁版 claude.ai 的用量額度會怎樣？",
     "options": [
      "不受影響，各產品分開算",
      "網頁額度反而會變多",
      "只有手機版會被扣",
      "也跟著減少，全產品共用額度"
     ],
     "answer": 3,
     "explain": "網頁、桌面、手機、Cowork、Claude Code 全部算在同一個帳號的上限裡，用在一處其他地方也會跟著減少。",
     "link": "#overview-plans"
    },
    {
     "q": "對話中途出現通知，說回答改由較低階的模型處理。最可能的原因是？",
     "options": [
      "請求觸發安全分類器而自動切換",
      "對話太長被系統自動降級",
      "effort 設太高被強制更換",
      "免費試用期到了"
     ],
     "answer": 0,
     "explain": "部分模型會對請求做自動安全檢查，少數高風險類別的請求會被改由能力較低的模型回答，並顯示切換通知。",
     "link": "#overview-model-switch"
    }
   ]
  },
  {
   "id": "claudeai",
   "idx": 2,
   "title": "claude.ai 功能",
   "stage": "會說話的泉水",
   "realm": 0,
   "questions": [
    {
     "q": "你想問一個一次性的私人問題，不想留在紀錄裡，也不想影響 Claude 的記憶，該用？",
     "options": [
      "建立一個新的 Project",
      "問完再分享對話",
      "無痕對話（Incognito）",
      "開啟 Research"
     ],
     "answer": 2,
     "explain": "無痕對話不存進對話紀錄、不使用也不寫入記憶，適合一次性的私人問題。",
     "link": "#claudeai-incognito"
    },
    {
     "q": "你希望所有對話都「用繁體中文、先給結論」，長期固定下來，最適合寫在哪？",
     "options": [
      "每次對話第一句重打一次",
      "全域指示 Instructions for Claude",
      "專案的名稱與描述欄",
      "Styles 回應風格"
     ],
     "answer": 1,
     "explain": "「Instructions for Claude」是全域指示，套用到你所有對話，適合寫語言、語氣、格式等長期偏好。",
     "link": "#claudeai-personalize"
    },
    {
     "q": "你分享了一段對話，之後又繼續聊了很多。對方打開連結會看到什麼？",
     "options": [
      "自動看到最新的完整內容",
      "可以接著跟 Claude 繼續聊",
      "連你附加的原始檔案都看得到",
      "只有分享當下的內容，要手動更新"
     ],
     "answer": 3,
     "explain": "分享出去的是唯讀「快照」，只含分享當下的內容；想讓對方看到新內容，要在分享視窗按「Update shared chat」。",
     "link": "#claudeai-share"
    }
   ]
  },
  {
   "id": "cowork",
   "idx": 3,
   "title": "Cowork",
   "stage": "小精靈的樹屋",
   "realm": 0,
   "questions": [
    {
     "q": "你想讓 Claude 每週一早上自動整理上週 Slack 頻道的重點，該用 Cowork 的哪個功能？",
     "options": [
      "排程任務（Scheduled）",
      "無痕對話",
      "Artifacts",
      "語音模式"
     ],
     "answer": 0,
     "explain": "排程任務會把任務指示存起來，照你設定的頻率自動執行並交出成果，例如每週摘要。",
     "link": "#cowork-schedule"
    },
    {
     "q": "你第一次用 Cowork 處理寄信、付款這類難以復原的事，權限模式該選？",
     "options": [
      "Auto（自動核准）",
      "Skip（略過所有核准）",
      "Manual（每個動作先問你）",
      "不用管，它不會做這些事"
     ],
     "answer": 2,
     "explain": "Manual 會在每個需要權限的動作前停下來問你，適合新手和寄信、付款這類難以復原的事。",
     "link": "#cowork-folders"
    },
    {
     "q": "你想排程讓 Claude 定期整理「你電腦裡」的某個資料夾，需要什麼條件？",
     "options": [
      "用雲端排程，關機也照跑",
      "只能本機跑，電腦醒著且 App 開著",
      "用手機 App 就能直接存取",
      "Free 方案就能設定"
     ],
     "answer": 1,
     "explain": "雲端排程不能綁本機資料夾；需要本機檔案的排程只能在本機跑，電腦要醒著、Claude Desktop 要開著。",
     "link": "#cowork-schedule"
    }
   ]
  },
  {
   "id": "prompting",
   "idx": 4,
   "title": "怎麼問問題",
   "stage": "咒語學堂",
   "realm": 0,
   "questions": [
    {
     "q": "官方的「黃金法則」建議怎麼檢查你的提示寫得夠不夠清楚？",
     "options": [
      "越短越好，一句話最理想",
      "一律改用英文寫",
      "加一句「請一步一步想」",
      "給不了解狀況的同事看能否照做"
     ],
     "answer": 3,
     "explain": "把提示拿給完全不了解這件事的同事看，如果他會看不懂、要回頭問你，Claude 多半也會卡在同一處。",
     "link": "#prompting-mindset"
    },
    {
     "q": "你想讓 Claude 照固定格式把顧客留言分類，官方說最可靠的做法之一是？",
     "options": [
      "給 3–5 個「輸入→輸出」範例",
      "只寫「請照格式做」",
      "把 Effort 調到最高",
      "只說「不要用 Markdown」"
     ],
     "answer": 0,
     "explain": "直接示範幾個輸入→輸出的例子（few-shot），是官方說控制格式、語氣、結構最可靠的方法之一。",
     "link": "#prompting-fewshot"
    },
    {
     "q": "你希望 Claude 用流暢的段落回答，不要滿滿條列。官方建議怎麼寫提示？",
     "options": [
      "只寫「不要用條列」",
      "提示裡用大量條列示範",
      "說「用段落回答」，提示也用段落寫",
      "預填一則 assistant 訊息強迫格式"
     ],
     "answer": 2,
     "explain": "說「要做什麼」比只說「不要做什麼」有效；而且提示長什麼樣它就容易回什麼樣，想要散文就用散文寫提示。",
     "link": "#prompting-format"
    }
   ]
  },
  {
   "id": "aifluency",
   "idx": 5,
   "title": "AI 素養",
   "stage": "智慧古樹",
   "realm": 0,
   "questions": [
    {
     "q": "你設定好一個客服助理，讓它代表你獨立回答顧客問題，這屬於哪種互動方式？",
     "options": [
      "自動化（Automation）",
      "代理（Agency）",
      "增強（Augmentation）",
      "辨別（Discernment）"
     ],
     "answer": 1,
     "explain": "代理是事先設定好 AI 的知識、規則與行為，讓它代表你獨立行動；設定客服助理正是網站舉的例子。",
     "link": "#aifluency-modes"
    },
    {
     "q": "用 AI 做完報告後，誠實告訴主管哪些部分用了 AI，屬於 4D 框架的哪一項？",
     "options": [
      "委派（Delegation）",
      "描述（Description）",
      "辨別（Discernment）",
      "審慎（Diligence）"
     ],
     "answer": 3,
     "explain": "審慎是為 AI 協作成果負責，其中「透明審慎」就是誠實告訴該知道的人哪裡用了 AI。",
     "link": "#aifluency-4d"
    },
    {
     "q": "長對話聊到後期，Claude 忘了一開始講好的規則。比較對症的修正是？",
     "options": [
      "寫進 Project 指示，或開新對話重貼",
      "開網頁搜尋讓它查規則",
      "換成更便宜的模型",
      "一直重新產生直到它做對"
     ],
     "answer": 0,
     "explain": "這是「工作記憶」的限制：視窗有上限、注意力不均。把規則寫進 Project 指示，或開新對話重貼重點最對症。",
     "link": "#aifluency-properties"
    }
   ]
  },
  {
   "id": "pipeline",
   "idx": 6,
   "title": "一則訊息的旅程",
   "stage": "信使之路",
   "realm": 1,
   "questions": [
    {
     "q": "你昨天在同一段對話講過的事，今天 Claude 好像還記得。背後主要是怎麼做到的？",
     "options": [
      "模型會把每位使用者的對話永久記在腦中",
      "App 每次送出時都把先前對話重新打包附上",
      "模型訓練時就已經學過你的個人資料",
      "伺服器會自動猜出你上次說過什麼"
     ],
     "answer": 1,
     "explain": "按下送出時，App 會把先前對話、指示、記憶等一起打包送給模型。Claude 看起來記得你，其實是每次都重新附上。",
     "link": "#pipeline-simple"
    },
    {
     "q": "你問「明天台北會下雨嗎？」，Claude 決定上網搜尋。這個搜尋工具實際上由誰執行？",
     "options": [
      "模型在腦中直接完成搜尋",
      "你的瀏覽器自動替模型打開網頁",
      "模型不查，直接猜一個答案",
      "模型以外的地方執行，再把結果送回"
     ],
     "answer": 3,
     "explain": "模型只會提出「我要用工具」的請求，工具由雲端沙箱、外部服務或你的電腦執行，結果再送回給模型繼續想。",
     "link": "#pipeline-steps"
    },
    {
     "q": "你用 API 寫程式，收到的回應 stop_reason 是 tool_use。程式下一步該做什麼？",
     "options": [
      "執行工具，把 tool_result 連同歷史送回",
      "直接把回應顯示給使用者就結束",
      "調高 max_tokens 後重送同一個請求",
      "只送 tool_result，不必附上先前歷史"
     ],
     "answer": 0,
     "explain": "tool_use 代表模型要用工具：執行後把結果包成 tool_result，連同完整歷史再送一次，直到 stop_reason 變成 end_turn。",
     "link": "#pipeline-diagram"
    }
   ]
  },
  {
   "id": "api",
   "idx": 7,
   "title": "API 與 JSON",
   "stage": "符文契約",
   "realm": 1,
   "questions": [
    {
     "q": "第一次用 Python 呼叫 Claude API，API key 放在哪裡最不容易不小心上傳到 GitHub？",
     "options": [
      "直接寫在程式碼的第一行",
      "放進 system 參數裡",
      "設成環境變數 ANTHROPIC_API_KEY",
      "寫在 messages 的第一則訊息"
     ],
     "answer": 2,
     "explain": "官方 SDK 會自動讀取環境變數 ANTHROPIC_API_KEY，程式碼裡不用寫 key，自然不會跟著程式碼被上傳。",
     "link": "#api-setup"
    },
    {
     "q": "你用 API 做聊天機器人，希望 Claude 記得使用者前面說過的名字，該怎麼做？",
     "options": [
      "每次都把前面的問答放進 messages 重送",
      "不用做事，伺服器會自動記住",
      "把 temperature 調低讓它記得比較牢",
      "只在第一次請求設定 system 就好"
     ],
     "answer": 0,
     "explain": "API 是無狀態的，伺服器不記得上一次說過什麼。要讓 Claude 記得，就得把前幾輪的問與答依序放進 messages 每次重傳。",
     "link": "#api-multi-turn"
    },
    {
     "q": "網路教學說「直接取 content 第一個區塊的 .text」，換成會思考的新模型後常出錯。為什麼？",
     "options": [
      "回應的 content 其實是字串不是陣列",
      "stop_reason 一定會是 max_tokens",
      "第一個區塊固定是 tool_use",
      "第一個區塊常是 thinking 而不是 text"
     ],
     "answer": 3,
     "explain": "會思考的模型回應第一個區塊常是 thinking。比較保險的寫法是只挑出 type 為 text 的區塊再組合文字。",
     "link": "#api-first-request"
    }
   ]
  },
  {
   "id": "tooluse",
   "idx": 8,
   "title": "工具調用",
   "stage": "魔具寶庫",
   "realm": 1,
   "questions": [
    {
     "q": "你定義了自訂工具 get_weather，Claude 決定呼叫它。實際去查天氣的是誰？",
     "options": [
      "Claude 模型本身",
      "你自己寫的程式",
      "使用者的瀏覽器",
      "Anthropic 的伺服器"
     ],
     "answer": 1,
     "explain": "Claude 只會吐出 tool_use 請求。使用者自訂工具的 schema 由你寫、也由你的程式執行，再把結果送回給 Claude。",
     "link": "#tooluse-types"
    },
    {
     "q": "Claude 常常該用你的自訂工具時卻沒用，或選錯工具。最該先改善工具定義的哪一部分？",
     "options": [
      "把 name 改得更短",
      "把 required 欄位全部刪掉",
      "把 description 的用途與時機寫清楚",
      "把 input_schema 改成空物件"
     ],
     "answer": 2,
     "explain": "description 是最重要的一欄，要寫清楚做什麼、什麼時候用、不該用在哪。Claude 選不選、選不選對工具，大多靠這段文字。",
     "link": "#tooluse-schema"
    },
    {
     "q": "Claude 在同一次回應裡發了兩個 tool_use（查台北和高雄天氣）。正確的送回方式是？",
     "options": [
      "兩個 tool_result 放在同一則 user 訊息",
      "拆成兩則 user 訊息分別送回",
      "只回傳第一個工具的結果就好",
      "先寫一段文字，再放兩個 tool_result"
     ],
     "answer": 0,
     "explain": "每個 tool_use 都要有一個 tool_result 用 tool_use_id 對應，並全部放在同一則 user 訊息，且排在任何文字之前。",
     "link": "#tooluse-parallel"
    }
   ]
  },
  {
   "id": "codeexec",
   "idx": 9,
   "title": "程式碼執行",
   "stage": "煉金爐房",
   "realm": 1,
   "questions": [
    {
     "q": "你透過 API 開啟程式碼執行，請 Claude 精確算出一組數字的標準差。程式實際在哪裡跑？",
     "options": [
      "你自己的電腦",
      "使用者的手機",
      "Claude 模型的腦袋裡",
      "Anthropic 伺服器上的隔離容器"
     ],
     "answer": 3,
     "explain": "程式碼執行是伺服器端工具，程式在 Anthropic 伺服器上的隔離容器裡跑，你不用自己準備環境，也不用自己回傳 tool_result。",
     "link": "#codeexec"
    },
    {
     "q": "在 API 的程式碼執行容器裡，Claude 想用一個沒預裝的套件而執行 pip install，會怎樣？",
     "options": [
      "可以，容器會自動上網下載",
      "不行，容器完全沒有對外連線",
      "可以，但要先加 beta 標頭",
      "可以，先打開 Allow network egress 就行"
     ],
     "answer": 1,
     "explain": "API 的執行容器完全沒有對外網路，執行時不能 pip install。Allow network egress 是 claude.ai 的設定。",
     "link": "#codeexec-env"
    },
    {
     "q": "你請 Claude 在執行容器裡做一份 Excel，想用程式下載回來。檔案要放在哪才會被交回？",
     "options": [
      "容器裡任何資料夾都可以",
      "/tmp 暫存資料夾",
      "$OUTPUT_DIR 資料夾的最上層",
      "寫進請求的 system 參數"
     ],
     "answer": 2,
     "explain": "只有放在 $OUTPUT_DIR 最上層的檔案會被收集並以 file_id 交回，寫在其他地方的會留在容器裡。可在提示裡明講要複製過去。",
     "link": "#codeexec-files"
    }
   ]
  },
  {
   "id": "claudecode",
   "idx": 10,
   "title": "Claude Code 入門",
   "stage": "學徒的魔杖",
   "realm": 1,
   "questions": [
    {
     "q": "Claude Code 剛幫你改了幾個檔案，結果改壞了，你想退回它動手前的程式碼。最直接的做法是？",
     "options": [
      "打 /rewind 選一個檢查點退回",
      "打 /clear 清空對話就會復原",
      "打 /compact 壓縮對話",
      "只能重新安裝 Claude Code"
     ],
     "answer": 0,
     "explain": "每次送出提示前都會自動存檢查點；打 /rewind（或空輸入框連按兩下 Esc）就能選點退回程式碼。",
     "link": "#claudecode-rewind"
    },
    {
     "q": "要做一個會動到很多檔案的大功能，你想先看 Claude 的修改計畫，同意後才讓它改。該選哪個權限模式？",
     "options": [
      "Accept edits",
      "Auto",
      "Bypass permissions",
      "Plan"
     ],
     "answer": 3,
     "explain": "Plan 模式只讀檔、探索、寫計畫，不改原始碼；你核准計畫後才開始改，適合大功能或想先確認方向的時候。",
     "link": "#claudecode-permission-modes"
    },
    {
     "q": "你把任務交給雲端工作階段後就關機了。它做好的程式碼要怎樣才會確實保存下來？",
     "options": [
      "不用處理，雲端電腦會永久保存",
      "push 到 GitHub（一條分支或 PR）",
      "在雲端 session 裡打 /clear",
      "用 /rewind 存一個 checkpoint"
     ],
     "answer": 1,
     "explain": "雲端電腦閒置會被收回，成果一定要 push 到 GitHub（分支或 PR）才會留下來。對話紀錄會保留，但跑到一半的背景工作不會回來。",
     "link": "#claudecode-cloud"
    }
   ]
  },
  {
   "id": "claudecode-adv",
   "idx": 11,
   "title": "Claude Code 進階",
   "stage": "大法師的法典",
   "realm": 1,
   "questions": [
    {
     "q": "想讓 Claude 每個 session 開頭自動讀到專案的 build、test 指令與風格，該用什麼？",
     "options": [
      "Hooks",
      "Subagents",
      "CLAUDE.md",
      "Plugins"
     ],
     "answer": 2,
     "explain": "CLAUDE.md 是你寫的專案說明，每個 session 開頭自動載入，最適合放 build／test 指令、風格、架構這類「這個專案一律…」的慣例。",
     "link": "#claudecode-adv-customize"
    },
    {
     "q": "團隊規定「每次改完檔一定要自動跑格式化」，不想靠 Claude 自己記得。最可靠的做法是？",
     "options": [
      "設一個 PostToolUse 的 Hook",
      "在 CLAUDE.md 寫「記得格式化」",
      "把 output style 換成 Concise",
      "開一個 subagent 負責提醒它"
     ],
     "answer": 0,
     "explain": "Hooks 由程式在固定時點強制執行，不靠 Claude 自覺；PostToolUse 在工具執行成功後觸發。CLAUDE.md 只是參考，它可能沒照做。",
     "link": "#claudecode-adv-hooks"
    },
    {
     "q": "你想在 CI 裡無人值守地執行 Claude Code 產報告，不能卡在權限詢問。哪個做法正確？",
     "options": [
      "用 Desktop App 的 Code 分頁執行",
      "用 claude -p，不做任何權限設定",
      "在 session 裡用 /loop 5m 輪詢",
      "claude -p 加 --allowedTools 先核准"
     ],
     "answer": 3,
     "explain": "claude -p 預設是 Manual，遇到要核准的動作會失敗，所以要用 --allowedTools 或 dontAsk 先講好。",
     "link": "#claudecode-adv-headless"
    }
   ]
  },
  {
   "id": "ecosystem",
   "idx": 12,
   "title": "周邊生態",
   "stage": "星橋群島",
   "realm": 2,
   "questions": [
    {
     "q": "你想讓 Claude 直接在瀏覽器裡幫你比較幾個分頁的內容、填網頁表單，該用哪個產品？",
     "options": [
      "Claude Science",
      "Claude in Chrome",
      "Claude Design",
      "Microsoft 365 連接器"
     ],
     "answer": 1,
     "explain": "Claude in Chrome 是 Chrome 擴充功能，能在側邊欄讀、點、填表、切換分頁，就像旁邊有個幫你操作網頁的助理。",
     "link": "#ecosystem-chrome"
    },
    {
     "q": "MCP 有三個基本元素。其中由 Claude（模型）自己決定要不要呼叫、用來執行動作的是哪一個？",
     "options": [
      "Prompts",
      "Resources",
      "Tools",
      "Connectors"
     ],
     "answer": 2,
     "explain": "Tools 由模型控制，是可以執行的動作（如搜尋、建工單）；Resources 由應用程式控制，Prompts 由使用者控制。",
     "link": "#ecosystem-mcp"
    },
    {
     "q": "開發者想透過 API 交給 Anthropic 代跑 agent 迴圈，執行數小時長任務、不自己維運沙箱，該選？",
     "options": [
      "Claude Managed Agents",
      "Claude Agent SDK",
      "Desktop extensions（.mcpb）",
      "自訂連接器"
     ],
     "answer": 0,
     "explain": "Managed Agents 由 Anthropic 在雲端沙箱跑迴圈，適合長任務；Agent SDK 則跑在你自己的程式裡，主機與權限由你負責。",
     "link": "#ecosystem-agents"
    }
   ]
  },
  {
   "id": "practical",
   "idx": 13,
   "title": "實際操作",
   "stage": "實戰演武場",
   "realm": 2,
   "questions": [
    {
     "q": "在 Claude Code 互動模式裡，你要換一個完全不同的主題，想清空目前對話重新開始，該打哪個指令？",
     "options": [
      "/init",
      "/resume",
      "/compact",
      "/clear"
     ],
     "answer": 3,
     "explain": "/clear 會清空目前對話重新開始，換主題時用可省 context；/compact 是摘要壓縮並保留重點，不是清空。",
     "link": "#practical-slash"
    },
    {
     "q": "API 回了 429 rate_limit_error，且帶有 retry-after header，該怎麼處理？",
     "options": [
      "放慢請求，依 retry-after 稍後重試",
      "改用 Authorization: Bearer 認證",
      "到 Console 刪除金鑰再重建",
      "改用 Files API 上傳請求"
     ],
     "answer": 0,
     "explain": "429 代表觸及速率上限，做法是放慢請求並照 retry-after 重試；換 header、重建金鑰都不是解法。",
     "link": "#practical-errors"
    },
    {
     "q": "想讓全隊拉下 repo 就有同一個 MCP server，claude mcp add 的 --scope 該選？",
     "options": [
      "local",
      "project",
      "user",
      "global"
     ],
     "answer": 1,
     "explain": "project 會寫進專案根目錄的 .mcp.json，可 commit 給全隊共用；local 只有你在該專案有，user 是你自己所有專案都有。",
     "link": "#practical-mcp"
    }
   ]
  },
  {
   "id": "gitflow",
   "idx": 14,
   "title": "Git 與 GitHub",
   "stage": "時光之河",
   "realm": 2,
   "questions": [
    {
     "q": "你剛完成一小塊功能，想在自己電腦上留下一個隨時能退回的「存檔點」，該做哪個動作？",
     "options": [
      "git push",
      "git clone",
      "git commit",
      "在 GitHub 開 PR"
     ],
     "answer": 2,
     "explain": "commit 就是一次存檔點，記錄改了什麼和為什麼；push 才是把本機的 commit 推上雲端。",
     "link": "#gitflow-setup"
    },
    {
     "q": "你在分支上改好登入 bug 並已 push，想請隊友審查後再合進 main，下一步該做什麼？",
     "options": [
      "直接把改動 push 到 main",
      "用 git stash 收起改動",
      "到隊友的 repo 按 Fork",
      "在 GitHub 開 Pull Request"
     ],
     "answer": 3,
     "explain": "PR 是「請看一下、同意後合進 main」的正式提案，可討論、留意見，也會觸發 CI 自動檢查。",
     "link": "#gitflow"
    },
    {
     "q": "AI 改壞的程式已經 commit 而且 push 上 GitHub 了，最安全的救法是？",
     "options": [
      "git reset --hard 後強制覆蓋",
      "git revert 該 commit 再 push",
      "git restore . 還原工作區",
      "刪掉 repo 重新建立"
     ],
     "answer": 1,
     "explain": "revert 會產生一個反向 commit，保留歷史又能撤銷改動；已 push 的狀況別用強制覆蓋，reset --hard 也難以挽回。",
     "link": "#gitflow"
    }
   ]
  },
  {
   "id": "deploy",
   "idx": 15,
   "title": "部署上線",
   "stage": "點燈高塔",
   "realm": 2,
   "questions": [
    {
     "q": "你把 http://localhost:3000 傳給朋友，他說打不開。主要原因是什麼？",
     "options": [
      "localhost 指的是「這台電腦自己」",
      "朋友的瀏覽器版本太舊",
      "網址前面少打了 www",
      "朋友沒有安裝 git"
     ],
     "answer": 0,
     "explain": "localhost 代表「這台電腦自己」，朋友打開只會找他自己的電腦；要讓別人連得到，得部署到 24 小時開著的伺服器。",
     "link": "#deploy"
    },
    {
     "q": "API 金鑰不小心寫在程式碼裡、已經推上公開 repo，正確的處置是？",
     "options": [
      "從程式碼刪掉再 push 一次",
      "把 .env 加進 .gitignore 即可",
      "改用前端程式碼存放金鑰",
      "立刻到服務商撤銷金鑰並重發"
     ],
     "answer": 3,
     "explain": "光從程式碼刪掉沒用，git 歷史裡還留著；要立刻到服務商後台撤銷該金鑰並重發一把新的。",
     "link": "#deploy"
    },
    {
     "q": "純 HTML 網站從分支發佈到 GitHub Pages 後，_assets/ 裡的 CSS 一直 404，該怎麼解？",
     "options": [
      "把 repo 改成 private",
      "改用 Render 這類伺服器平台",
      "在發佈來源最上層放空白的 .nojekyll",
      "把 Source 改選 /docs 資料夾"
     ],
     "answer": 2,
     "explain": "GitHub Pages 預設用 Jekyll 建置，會忽略底線開頭的資料夾；放一個空白 .nojekyll 就會跳過 Jekyll 原封不動發佈。",
     "link": "#deploy-github-pages"
    }
   ]
  },
  {
   "id": "features",
   "idx": 16,
   "title": "功能字典",
   "stage": "萬物圖鑑",
   "realm": 2,
   "questions": [
    {
     "q": "你想請 Claude 查很多網頁、交叉整理競品資料，最後產出一份附引用的完整報告，該用？",
     "options": [
      "Research",
      "Incognito（無痕對話）",
      "Voice mode（語音模式）",
      "Styles（回應風格）"
     ],
     "answer": 0,
     "explain": "Research 會自動查多個網頁、交叉整合並附上引用，幾分鐘內產出完整報告，適合市場與競品彙整。",
     "link": "#features-research"
    },
    {
     "q": "在大型專案裡要翻上百個檔案，找出所有呼叫某個 API 的地方，又不想塞爆主對話的 context，該用？",
     "options": [
      "Plugins（外掛）",
      "Subagents（子代理）",
      "Hooks（生命週期掛鉤）",
      "Voice mode（語音模式）"
     ],
     "answer": 1,
     "explain": "子代理有自己獨立的 context window，翻完大量檔案只把摘要交回主對話，主對話保持乾淨。",
     "link": "#features-subagents"
    },
    {
     "q": "使用者層與專案層都各有一份 CLAUDE.md 時，Claude Code 會怎麼處理？",
     "options": [
      "只讀專案層，忽略使用者層",
      "只讀使用者層，忽略專案層",
      "兩者都載入、串接在一起",
      "內容衝突時直接報錯停止"
     ],
     "answer": 2,
     "explain": "CLAUDE.md 各層由廣到窄全部串接在一起載入，不是互相覆蓋；所以撰寫時要避免各層指示互相矛盾。",
     "link": "#features-claudemd"
    }
   ]
  },
  {
   "id": "extensions",
   "idx": 17,
   "title": "開發者延伸",
   "stage": "秘境地圖",
   "realm": 2,
   "questions": [
    {
     "q": "你平常用 VS Code 寫程式，想在編輯器側邊跟 Claude 對話、逐行審閱它的改動，該裝什麼？",
     "options": [
      "Claude API CLI（ant）",
      "Claude Code 的 VS Code 擴充套件",
      "Files API",
      "Token counting"
     ],
     "answer": 1,
     "explain": "VS Code 擴充套件是 Claude Code 在 VS Code 裡的原生圖形介面，提供側邊面板對話與逐行 inline diff 審閱。",
     "link": "#extensions-vscode"
    },
    {
     "q": "你的後端程式要直接解析 Claude 的回應，希望回應一定符合你指定的 JSON 格式，該用哪個 API 功能？",
     "options": [
      "Citations",
      "Compaction",
      "Token counting",
      "Structured outputs"
     ],
     "answer": 3,
     "explain": "Structured outputs 用受限取樣讓回應一定符合你給的 JSON schema，後端可以直接解析、不用重試。",
     "link": "#extensions-structured-outputs"
    },
    {
     "q": "你做多客戶的產品，用 Files API 存各家上傳的合約。要讓 A 客戶讀不到 B 客戶的檔案，官方建議？",
     "options": [
      "每個客戶各用一個獨立的 workspace",
      "每個客戶各發一把 API key 就好",
      "上傳時設定 expires_in_seconds",
      "上傳後把檔名改成含客戶代號"
     ],
     "answer": 0,
     "explain": "檔案屬於整個 workspace，同一 workspace 的任何 key 都讀得到；多租戶產品要一個客戶一個 workspace。",
     "link": "#extensions-files"
    }
   ]
  },
  {
   "id": "enterprise",
   "idx": 18,
   "title": "企業與團隊",
   "stage": "王庭議會",
   "realm": 3,
   "questions": [
    {
     "q": "公司希望員工用公司帳號（例如 Okta、Google Workspace）統一登入 Claude，這個功能叫什麼？",
     "options": [
      "ZDR（零資料保留）",
      "CMEK（自管加密金鑰）",
      "SSO（單一登入）",
      "IP allowlisting"
     ],
     "answer": 2,
     "explain": "SSO 讓成員用公司帳號登入，例如 Okta、Microsoft Entra ID、Google Workspace。",
     "link": "#enterprise-sso"
    },
    {
     "q": "員工離職、從公司身分系統移除後，希望他的 Claude 帳號也自動移除，該用哪個機制？",
     "options": [
      "SCIM 目錄同步",
      "JIT 即時建立帳號",
      "組織指示",
      "網域驗證"
     ],
     "answer": 0,
     "explain": "SCIM 會跟公司身分系統持續同步，員工被移除時帳號也自動移除；JIT 建立的帳號不會自動移除。",
     "link": "#enterprise-sso"
    },
    {
     "q": "Enterprise 組織開啟 IP allowlisting 後，下列哪一項會因認證錯誤而無法使用？",
     "options": [
      "在公司網路內用 claude.ai 聊天",
      "自架環境（self-hosted）的工作階段",
      "在公司網路內使用 Desktop",
      "Anthropic 託管的雲端工作階段"
     ],
     "answer": 3,
     "explain": "雲端工作階段的請求來自 Anthropic 的機器而非你的網段，所以會失敗；自架環境從你自己的網路連線，不受影響。",
     "link": "#enterprise-ip"
    }
   ]
  },
  {
   "id": "aicoding",
   "idx": 19,
   "title": "AI coding 地圖",
   "stage": "十二積木祭壇",
   "realm": 3,
   "questions": [
    {
     "q": "想讓系統「每天早上 8 點自動執行」，這屬於 12 塊積木中的哪一塊？",
     "options": [
      "展示",
      "身份",
      "檔案",
      "觸發"
     ],
     "answer": 3,
     "explain": "「觸發」決定系統何時動起來，例如手動按鈕、排程或 Webhook；每天定時執行就是排程觸發。",
     "link": "#aicoding"
    },
    {
     "q": "想每天從某個「沒有提供 API」的電商網頁抓商品價格，主要該用哪塊積木？",
     "options": [
      "連線",
      "通知",
      "爬蟲",
      "身份"
     ],
     "answer": 2,
     "explain": "「連線」是跟有 API 的外部系統對話；「爬蟲」才是從沒有 API 的網頁直接抓資料。",
     "link": "#aicoding"
    },
    {
     "q": "用 GitHub Actions 排程想在台灣早上 9 點執行，沒另設 timezone 時，cron 的小時該填幾點？",
     "options": [
      "9 點",
      "1 點",
      "17 點",
      "8 點"
     ],
     "answer": 1,
     "explain": "cron 預設用 UTC；台灣是 UTC+8 且沒有夏令時間，所以台灣 9 點＝UTC 1 點，全年固定。",
     "link": "#aicoding-price-bot"
    }
   ]
  },
  {
   "id": "safety",
   "idx": 20,
   "title": "安全與限制",
   "stage": "守護結界",
   "realm": 4,
   "questions": [
    {
     "q": "你想問 Claude「今年的報稅截止日是哪天」，最穩妥的做法是？",
     "options": [
      "它語氣很肯定，直接相信",
      "換個問法多問幾次",
      "開網頁搜尋或要它附官方來源",
      "請它改用英文回答"
     ],
     "answer": 2,
     "explain": "模型有知識截止日，問「今年、最新」這類問題可能用舊資訊回答；開搜尋或要求附官方來源比較可靠。",
     "link": "#safety-cutoff"
    },
    {
     "q": "想請 Claude 幫忙除錯，但程式碼裡寫死了一組 API 金鑰，該怎麼處理？",
     "options": [
      "改用環境變數，不要把金鑰貼上去",
      "直接貼，Claude 會幫忙保密",
      "開無痕對話就能放心貼",
      "把金鑰拆成兩段分開貼"
     ],
     "answer": 0,
     "explain": "密碼、API 金鑰、token 一律不要貼；寫程式時用環境變數，不要寫死在要給 Claude 看的程式碼裡。",
     "link": "#safety-confidential"
    },
    {
     "q": "依官方說法，提示注入攻擊要成功，通常需要同時滿足哪兩個條件？",
     "options": [
      "用免費方案且關閉訓練開關",
      "用英文輸入且開啟記憶功能",
      "網頁很長且含有大量圖片",
      "讀到不可信內容，且能做有害動作"
     ],
     "answer": 3,
     "explain": "Claude 讀得到信任範圍以外的內容，而且能做出傷害你的動作（寄信、改檔、付款），兩者同時成立風險才高。",
     "link": "#safety-injection"
    }
   ]
  },
  {
   "id": "resources",
   "idx": 21,
   "title": "術語表與延伸閱讀",
   "stage": "月光書庫",
   "realm": 4,
   "questions": [
    {
     "q": "朋友說「Claude 是一個 LLM」，這裡的 LLM 指的是什麼？",
     "options": [
      "一種瀏覽器擴充功能",
      "讀過大量文字、學會接下一個字的程式",
      "一種資料加密標準",
      "一種雲端儲存服務"
     ],
     "answer": 1,
     "explain": "LLM 是大型語言模型：讀過大量文字、學會「接下一個字」的程式，Claude 就是一個 LLM。",
     "link": "#glossary"
    },
    {
     "q": "跟 Claude 聊了很長一段後，它好像忘了最前面講過的事，這跟哪個概念最有關？",
     "options": [
      "Prompt caching",
      "Temperature",
      "Context window",
      "Rate limit"
     ],
     "answer": 2,
     "explain": "Context window 是 AI 一次能「看到」的文字量上限，像工作記憶；內容太長就會忘掉前面。",
     "link": "#glossary"
    },
    {
     "q": "關於 token，下列哪個說法正確？",
     "options": [
      "AI 讀寫文字的最小單位，也是計費單位",
      "中英文換算固定，看字數就能精算",
      "AI 用來加密對話的金鑰",
      "就是「一個中文字」的意思"
     ],
     "answer": 0,
     "explain": "Token 是 AI 讀寫文字的最小單位，也是計費單位；中英文換算不固定，要精確就用 token counting 實測。",
     "link": "#glossary"
    }
   ]
  }
 ]
};
