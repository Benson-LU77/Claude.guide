#!/bin/bash
# ============================================================
# 強制重新部署 → Claude.guide
# 什麼時候用：GitHub Pages 建置失敗（紅叉），或想手動觸發一次重建。
# 用法：在 Finder 對這個檔案按兩下，或在終端機執行。
#   線上網址：https://benson-lu77.github.io/Claude.guide/
# ============================================================
set -e

cd "$(dirname "$0")"

# 確保 .nojekyll 存在：叫 GitHub Pages 略過 Jekyll 處理，避免建置失敗
touch .nojekyll

# 有變更就正常提交；沒有變更就用空 commit 強制觸發一次 Pages 重建
git add -A
if git commit -q -m "重新部署 $(date '+%Y-%m-%d %H:%M')" 2>/dev/null; then
  echo "✅ 已提交變更（含 .nojekyll）"
else
  git commit -q --allow-empty -m "強制重新部署 $(date '+%Y-%m-%d %H:%M')"
  echo "ℹ️  沒有檔案變更，已用空 commit 觸發重建"
fi

echo "🚀 推送到 GitHub，觸發 Pages 重新建置 ..."
git push origin main

echo
echo "🎉 已推送。到 repo 的 Deployments 看這次是否變成綠勾（約 1–2 分鐘）："
echo "   https://benson-lu77.github.io/Claude.guide/"
echo
echo "（按 Enter 關閉視窗）"
read -r _
