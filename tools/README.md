# tools：精靈試煉 RPG 的模型處理腳本

網站本身不需要這些腳本；只有要新增或重做模型時才用。

## pack-gltf.py：把多個 KayKit 單模型 .gltf 合併成一個 .glb

需要 Python 3（不用安裝其他套件）。

```bash
python3 tools/pack-gltf.py 輸出.glb 模型1.gltf 模型2.gltf …
```

目前的 `assets/kaykit/env/` 是這樣產生的（素材來自 KayKit 的 GitHub repo，CC0）：

```bash
# KayKit-Medieval-Hexagon-Pack-1.0：addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/
python3 tools/pack-gltf.py assets/kaykit/env/nature.glb \
  tree_single_A tree_single_B trees_A_small trees_A_medium trees_B_small trees_B_medium \
  rock_single_A rock_single_C rock_single_D rock_single_E \
  mountain_A_grass_trees mountain_B_grass_trees mountain_C_grass_trees mountain_A mountain_C \
  hills_A_trees hills_C_trees cloud_big cloud_small waterlily_A waterlily_B waterplant_A waterplant_C
# （每個名稱前面加上資料夾路徑、後面加 .gltf）

# KayKit-Halloween-Bits-1.0：addons/kaykit_halloween_bits/Assets/gltf/
python3 tools/pack-gltf.py assets/kaykit/env/spooky.glb \
  tree_dead_large tree_dead_medium tree_dead_small tree_pine_yellow_large tree_pine_yellow_medium \
  tree_pine_orange_large tree_pine_orange_medium lantern_standing post_lantern pillar arch \
  shrine_candles candle_triple fence fence_pillar path_A path_C
```

取得素材：`git clone --depth 1 https://github.com/KayKit-Game-Assets/<repo 名稱>`

## optimize-monsters.mjs：精簡 Quaternius 魔物

需要 Node.js。第一次先安裝相依套件：

```bash
cd tools && npm install
```

```bash
node tools/optimize-monsters.mjs 來源.gltf assets/quaternius/名稱.glb
```

它會做這些事：
- 只保留遊戲用到的動作
- 重新取樣動畫
- 量化法線、UV、骨架權重，但**不量化頂點座標**（量化座標會讓 rpg.js 算錯模型身高）

素材是 Quaternius「Ultimate Monsters」（CC0），從 https://quaternius.com/packs/ultimatemonsters.html 的 Google Drive 連結下載，用的是 `Blob/glTF/` 與 `Flying/glTF/` 裡的 .gltf。

目前 `assets/quaternius/` 的 16 隻：
- Blob 系列（輸出時檔名加 `Blob_` 前綴）：Cactoro、PinkBlob、Yeti、Mushnub_Evolved、Wizard
- Flying 系列：Armabee、Armabee_Evolved、Ghost、Ghost_Skull、Hywirl、Pigeon、Squidle、Dragon、Dragon_Evolved、Glub_Evolved、Alpaking

新增魔物後，在 `rpg-data.js` 的 monsters 加上 `model:{ file:'quaternius/名稱', own:BLOB 或 FLY, atk:… }`。
