#!/bin/bash
# ============================================================
# 網站一鍵部署 → Claude.guide
# 改完同資料夾的 index.html 後，在 Finder 按兩下這個檔案
# （或在終端機 enter 執行），就會自動更新線上網站。
#   線上網址：https://benson-lu77.github.io/Claude.guide/
# ============================================================
set -e

# 切到這支腳本所在的資料夾（也就是網站資料夾本身）
cd "$(dirname "$0")"
REPO="https://github.com/Benson-LU77/Claude.guide.git"

# --- 首次設定：把這個資料夾連到 Claude.guide repo ---
if [ ! -d .git ]; then
  echo "🔧 首次設定，連接到 Claude.guide ..."
  git init -q
  git branch -M main
  git remote add origin "$REPO"
  git fetch -q origin
  git reset --soft origin/main                 # 沿用線上歷史，工作目錄保留你本機的 index.html
  git checkout origin/main -- README.md 2>/dev/null || true   # 保留網站原本的 README
  echo "✅ 已連線。"
fi

# --- 每次更新：commit + push ---
git add -A
if git commit -q -m "更新網站 $(date '+%Y-%m-%d %H:%M')" 2>/dev/null; then
  echo "✅ 已建立更新紀錄。"
else
  echo "ℹ️  沒有偵測到新變更。"
fi

echo "🚀 推送到 GitHub ..."
git push -u origin main

echo
echo "🎉 完成！約 1-2 分鐘後 GitHub Pages 會更新："
echo "   https://benson-lu77.github.io/Claude.guide/"
echo
echo "（按 Enter 關閉視窗）"
read -r _
