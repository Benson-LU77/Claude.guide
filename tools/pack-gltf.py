# 把多個 KayKit 單模型 .gltf 合併成一個 .glb（每個模型一個具名節點；同一張貼圖只存一次）
# 用法：python3 pack-gltf.py 輸出.glb 模型1.gltf 模型2.gltf …
# 每個 .gltf 必須是「單一節點、單一網格」並引用同資料夾的 .bin 與 .png（KayKit 的 gltf 就是這樣）
# 遊戲裡用節點名稱（= 檔名去掉 .gltf）取模型，見 rpg.js 的 ENV
import json, struct, sys, os
out, files = sys.argv[1], sys.argv[2:]
G = {'asset':{'version':'2.0','generator':'claude-guide pack.py'}, 'scene':0, 'scenes':[{'nodes':[]}], 'nodes':[], 'meshes':[], 'materials':[], 'textures':[], 'images':[], 'samplers':[], 'accessors':[], 'bufferViews':[], 'buffers':[{'byteLength':0}]}
blob = bytearray(); imgIdx = {}
def add_view(data, extra=None):
    while len(blob)%4: blob.append(0)
    v = {'buffer':0, 'byteOffset':len(blob), 'byteLength':len(data)}
    if extra: v.update(extra)
    blob.extend(data); G['bufferViews'].append(v); return len(G['bufferViews'])-1
for f in files:
    d = os.path.dirname(f); j = json.load(open(f)); b = open(os.path.join(d, j['buffers'][0]['uri']),'rb').read()
    vmap = {}
    for i,bv in enumerate(j['bufferViews']):
        o = bv.get('byteOffset',0); ex = {k:bv[k] for k in ('byteStride','target') if k in bv}
        vmap[i] = add_view(b[o:o+bv['byteLength']], ex)
    amap = {}
    for i,a in enumerate(j['accessors']):
        a = dict(a); a['bufferView'] = vmap[a['bufferView']]; G['accessors'].append(a); amap[i] = len(G['accessors'])-1
    # 貼圖
    im = j['images'][0]['uri']
    if im not in imgIdx:
        G['images'].append({'mimeType':'image/png','bufferView':add_view(open(os.path.join(d,im),'rb').read())})
        if not G['samplers']: G['samplers'].append(j['samplers'][0])
        G['textures'].append({'sampler':0,'source':len(G['images'])-1})
        m = dict(j['materials'][0]); m['pbrMetallicRoughness'] = dict(m['pbrMetallicRoughness']); m['pbrMetallicRoughness']['baseColorTexture'] = {'index':len(G['textures'])-1}
        G['materials'].append(m); imgIdx[im] = len(G['materials'])-1
    mesh = j['meshes'][0]; prims = []
    for p in mesh['primitives']:
        p = dict(p); p['attributes'] = {k:amap[v] for k,v in p['attributes'].items()}
        if 'indices' in p: p['indices'] = amap[p['indices']]
        p['material'] = imgIdx[im]; prims.append(p)
    G['meshes'].append({'name':mesh.get('name'),'primitives':prims})
    n = dict(j['nodes'][0]); n['mesh'] = len(G['meshes'])-1; n['name'] = os.path.basename(f)[:-5]
    G['nodes'].append(n); G['scenes'][0]['nodes'].append(len(G['nodes'])-1)
while len(blob)%4: blob.append(0)
G['buffers'][0]['byteLength'] = len(blob)
js = json.dumps(G, separators=(',',':')).encode()
while len(js)%4: js += b' '
glb = struct.pack('<III',0x46546C67,2,12+8+len(js)+8+len(blob)) + struct.pack('<II',len(js),0x4E4F534A) + js + struct.pack('<II',len(blob),0x004E4942) + blob
open(out,'wb').write(glb); print(out, len(glb), 'bytes,', len(files), 'models')
