// 精簡 Quaternius 魔物：只留需要的動作、重新取樣、量化，輸出 .glb
// 用法（先在 tools/ 執行一次 npm install）：node optimize-monsters.mjs 來源.gltf 輸出.glb
// 注意：不要量化 POSITION。骨架模型量化座標後，rpg.js 用幾何包圍盒量身高會算錯（變成幾萬單位）
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, resample, quantize } from '@gltf-transform/functions';
const KEEP = ['Idle','Run','Walk','HitReact','HitRecieve','Death','Punch','Bite_Front','Yes','Dance','Flying_Idle','Fast_Flying','Headbutt'];
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const [src, out] = process.argv.slice(2);
const doc = await io.read(src);
for (const a of doc.getRoot().listAnimations()) if (!KEEP.includes(a.getName())) a.dispose();
await doc.transform(resample({tolerance:1e-3}), dedup(), prune(), quantize({pattern:/^(NORMAL|TEXCOORD_0|JOINTS_0|WEIGHTS_0)$/, quantizeNormal:10, quantizeTexcoord:12, quantizeWeight:8}));
await io.write(out, doc);
