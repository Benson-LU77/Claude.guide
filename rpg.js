/* 精靈試煉 RPG：3D 大地圖＋回合制戰鬥（Three.js r128）
   依賴：quiz-data.js（window.QUIZ）、rpg-data.js（window.RPG）
   存檔：localStorage 'claudeGuideTrial.v1'（與每章章末小關卡共用 best 星數） */
(function(){
'use strict';
const Q = window.QUIZ, R = window.RPG, KEY = 'claudeGuideTrial.v1';
const $ = id => document.getElementById(id);
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===================== 存檔與共用 =====================
function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || {}; }catch(e){ return {}; } }
let S = load(); if(!S.best) S.best = {};
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
const RANKS = [[0,'迷途旅人'],[6,'見習勇者'],[15,'森林行者'],[27,'符文術士'],[39,'星語法師'],[51,'精靈賢者'],[66,'全知大賢者']];
function rankOf(st){ let r = RANKS[0], nx = null; for(const x of RANKS){ if(st>=x[0]) r = x; else { nx = x; break; } } return {r, nx}; }
const totalStars = () => Q.chapters.reduce((a,c)=>a+(S.best[c.id]||0),0);
const beaten = () => Q.chapters.filter(c=>(S.best[c.id]||0)>=2).length;
const partyAt = n => R.members.filter(m=>n>=m.unlock);
const party = () => partyAt(beaten());
const monOf = c => R.monsters[c.id];
function shuffle(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
const sleep = ms => new Promise(r=>setTimeout(r, reduce?Math.min(ms,80):ms));
const RUNES = ['甲','乙','丙','丁'];

// ===================== 音效（WebAudio 合成） =====================
const Sfx = (function(){
  let ac = null, on = S.sfx !== false;
  function ctx(){ if(!ac){ try{ ac = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; } } if(ac.state==='suspended') ac.resume(); return ac; }
  function tone(f, d, type, v, delay, f2){
    const a = on && ctx(); if(!a) return;
    const t = a.currentTime + (delay||0), o = a.createOscillator(), g = a.createGain();
    o.type = type||'square'; o.frequency.setValueAtTime(f, t); if(f2) o.frequency.exponentialRampToValueAtTime(f2, t+d);
    g.gain.setValueAtTime(v||.05, t); g.gain.exponentialRampToValueAtTime(.0001, t+d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+d+.03);
  }
  const P = {
    sel(){ tone(880,.05,'square',.025); },
    ok(){ tone(660,.08,'square',.045); tone(990,.14,'square',.045,.08); },
    no(){ tone(240,.3,'sawtooth',.045,0,110); },
    hit(){ tone(170,.12,'square',.055,0,60); tone(1300,.04,'triangle',.03); },
    crit(){ tone(1500,.07,'square',.05); tone(210,.25,'sawtooth',.06,.05,45); },
    hurt(){ tone(130,.22,'sawtooth',.065,0,50); },
    guard(){ tone(1200,.08,'triangle',.05); tone(1600,.12,'triangle',.04,.06); },
    heal(){ [523,659,784,1046].forEach((f,i)=>tone(f,.16,'triangle',.045,i*.07)); },
    win(){ [523,659,784,659,784,1046].forEach((f,i)=>tone(f,.2,'square',.04,i*.12)); },
    lose(){ [392,330,262].forEach((f,i)=>tone(f,.32,'triangle',.05,i*.2)); },
    join(){ [784,988,1175,1568,1175,1568].forEach((f,i)=>tone(f,.22,'triangle',.05,i*.1)); },
    enc(){ [220,277,330,440,554,659].forEach((f,i)=>tone(f,.08,'square',.045,i*.045)); },
    boom(){ tone(90,.6,'sawtooth',.07,0,30); tone(600,.3,'square',.03,.02,80); }
  };
  return { play(n){ try{ P[n] && P[n](); }catch(e){} }, toggle(){ on = !on; S.sfx = on; save(); return on; }, get on(){ return on; }, wake(){ if(on) ctx(); } };
})();

// ===================== 上方冒險者卡與關卡清單 =====================
function renderHUD(){
  const st = totalStars(), {r, nx} = rankOf(st), b = beaten();
  $('rank').firstChild.nodeValue = r[1];
  $('rankNext').textContent = nx ? `再拿 ${nx[0]-st} 顆星晉升「${nx[1]}」` : '你已走遍整座精靈世界';
  const lo = r[0], hi = nx ? nx[0] : 66;
  $('xpFill').style.width = (nx ? ((st-lo)/(hi-lo))*100 : 100) + '%';
  $('xp').textContent = st*10; $('stars').textContent = st; $('beaten').textContent = b;
  const p = party(); $('partyCount').textContent = p.length;
  const nm = R.members.find(m=>m.unlock>b);
  $('nextJoin').textContent = nm ? `再擊敗 ${nm.unlock-b} 隻魔物，就有新夥伴加入` : '所有夥伴都到齊了';
  $('roster').innerHTML = R.members.map(m=> m.unlock<=b
    ? `<span class="mem">${m.id==='hero'?'你・見習勇者':m.name+'・'+m.job}</span>`
    : `<span class="mem locked">？？？（擊敗 ${m.unlock} 隻）</span>`).join('');
  $('badges').innerHTML = Q.realms.map((rm,i)=>{
    const on = Q.chapters.filter(c=>c.realm===i).every(c=>S.best[c.id]===3);
    return `<span class="badge${on?' on':''}" title="${on?'已取得':'該秘境所有魔物三星擊敗即可取得'}">${rm.badge}</span>`;
  }).join('');
  const star = n => { let h=''; for(let i=0;i<3;i++) h += i<n?'<span class="on">★</span>':'★'; return h; };
  $('map').innerHTML = Q.realms.map((rm,i)=>`<section class="glass realm"><h2>${rm.name}</h2><p>${rm.desc}</p><div class="stages">${
    Q.chapters.filter(c=>c.realm===i).map(c=>`<button class="stage" data-id="${c.id}"><span class="no">第 ${c.idx+1} 關${monOf(c).boss?' · 頭目':''}</span><span class="nm">${c.stage}</span><span class="mo">魔物：${monOf(c).name}</span><span class="ch">對應：${c.title}</span><span class="st">${star(S.best[c.id]||0)}</span></button>`).join('')
  }</div></section>`).join('');
  document.querySelectorAll('#map .stage').forEach(bt=>bt.addEventListener('click',()=>startStage(bt.dataset.id)));
}

// ===================== 純文字備用試煉（瀏覽器不支援 3D 時） =====================
function textTrial(c){
  const ov = $('overlay'), box = $('trial'); let i = 0, ok = 0;
  ov.classList.add('show');
  function show(){
    const q = c.questions[i], order = shuffle([0,1,2,3]);
    box.innerHTML = `<p style="margin:0;color:var(--ink-soft)">第 ${c.idx+1} 關 · ${c.title} · ${i+1}/3</p><h3>${c.stage}</h3><p><b>${q.q}</b></p>`+
      order.map(oi=>`<button class="opt" data-oi="${oi}">${q.options[oi]}</button>`).join('')+`<div id="tfb"></div>`;
    box.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{
      const good = +b.dataset.oi===q.answer; if(good) ok++;
      box.querySelectorAll('.opt').forEach(x=>{ x.disabled = true; if(+x.dataset.oi===q.answer) x.classList.add('right'); else if(x===b) x.classList.add('wrong'); });
      $('tfb').innerHTML = `<p>${good?'答對了！':'答錯了。'}${q.explain} <a href="index.html${q.link}" target="_blank" rel="noopener">回指南複習 →</a></p><button class="btn" id="tnx">${i<2?'下一題':'看結果'}</button>`;
      $('tnx').addEventListener('click',()=>{ i++; if(i<3) show(); else end(); });
    }));
  }
  function end(){
    if(ok>(S.best[c.id]||0)){ S.best[c.id] = ok; save(); }
    box.innerHTML = `<h3>${'★'.repeat(ok)}${'☆'.repeat(3-ok)}</h3><p>答對 ${ok} / 3 題。</p><button class="btn" id="tcl">回到清單</button>`;
    $('tcl').addEventListener('click',()=>{ ov.classList.remove('show'); renderHUD(); });
  }
  show();
}

let G = null, booting = false;   // 3D 遊戲實例；booting = 模型還在載入
function startStage(id){
  const c = Q.chapters.find(x=>x.id===id); if(!c || booting) return;
  if(G){ setMode('world'); G.engage(c); } else textTrial(c);
}

// ===================== 模式切換與按鈕 =====================
let mode = 'world';
function setMode(m){
  mode = m;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on', t.dataset.mode===m));
  $('game').classList.toggle('hidden', m!=='world');
  $('map').classList.toggle('hidden', m!=='list');
  if(G) G.setActive(m==='world');
}
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{ if(t.dataset.mode==='world' && !G) return; setMode(t.dataset.mode); }));
$('goNext').addEventListener('click',()=>{
  if(booting) return;
  const c = Q.chapters.find(x=>(S.best[x.id]||0)<2) || Q.chapters.find(x=>(S.best[x.id]||0)<3);
  if(!c){ if(G){ setMode('world'); G.randomBattle(); } return; }
  if(G){ setMode('world'); G.walkTo(c); $('game').scrollIntoView({behavior:reduce?'auto':'smooth', block:'center'}); }
  else textTrial(c);
});
$('goRandom').addEventListener('click',()=>{
  if(booting) return;
  if(!G){ const pool = []; Q.chapters.forEach(c=>c.questions.forEach(q=>pool.push(q))); const c = {idx:-1,id:'_r',title:'隨機',stage:'流星雨試煉',questions:shuffle(pool).slice(0,3)}; return textTrial(c); }
  setMode('world'); $('game').scrollIntoView({behavior:reduce?'auto':'smooth', block:'center'}); G.randomBattle();
});
$('reset').addEventListener('click',()=>{ if(confirm('確定要清除所有星星、夥伴與經驗值嗎？')){ S = {best:{}, met:true, sfx:S.sfx}; save(); renderHUD(); if(G) G.refreshAll(true); } });
window.addEventListener('storage', e=>{ if(e.key===KEY){ S = load(); if(!S.best) S.best={}; renderHUD(); if(G) G.refreshAll(); } });
$('sfxBtn').addEventListener('click',()=>{ $('sfxBtn').textContent = '音效：' + (Sfx.toggle()?'開':'關'); });
$('sfxBtn').textContent = '音效：' + (Sfx.on?'開':'關');
$('fsBtn').addEventListener('click',()=>{
  const el = $('game');
  if(document.fullscreenElement) document.exitFullscreen(); else if(el.requestFullscreen) el.requestFullscreen().catch(()=>{});
});

renderHUD();

// =====================================================================
// 3D
// =====================================================================
async function init3D(){
  const T = window.THREE; if(!T) return null;
  const canvas = $('gl');
  let renderer;
  try{ renderer = new T.WebGLRenderer({canvas, antialias:true}); }catch(e){ return null; }
  if(!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 1.75));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;

  // ---------- 材質與幾何 ----------
  const grad = new T.DataTexture(new Uint8Array([105,175,255]), 3, 1, T.LuminanceFormat);
  grad.minFilter = grad.magFilter = T.NearestFilter; grad.needsUpdate = true;
  const mat = (c, o) => new T.MeshToonMaterial(Object.assign({color:c, gradientMap:grad}, o||{}));
  const glow = (c, op) => new T.MeshBasicMaterial({color:c, transparent:op!==undefined && op<1, opacity:op===undefined?1:op});
  const OUT = new T.MeshBasicMaterial({color:0x0a0e18, side:T.BackSide});
  const SHADOW = new T.MeshBasicMaterial({color:0x000000, transparent:true, opacity:.32, depthWrite:false});
  const GEO = {
    sph:new T.SphereGeometry(1,18,14), hemi:new T.SphereGeometry(1,18,10,0,Math.PI*2,0,Math.PI/2),
    cyl:new T.CylinderGeometry(1,1,1,14), taper:new T.CylinderGeometry(.75,1,1,14), cone:new T.ConeGeometry(1,1,14),
    box:new T.BoxGeometry(1,1,1), arc:new T.TorusGeometry(1,.06,6,18,Math.PI), ring:new T.TorusGeometry(1,.07,8,40),
    oct:new T.OctahedronGeometry(1), ico:new T.IcosahedronGeometry(1,0), plane:new T.PlaneGeometry(1,1),
    obel:new T.CylinderGeometry(.55,.8,1,4), disk:new T.CircleGeometry(1,24)
  };
  function P(parent, geo, m, x,y,z, s, o){
    o = o || {};
    const mesh = new T.Mesh(geo, m); mesh.position.set(x,y,z);
    if(Array.isArray(s)) mesh.scale.set(s[0],s[1],s[2]); else mesh.scale.setScalar(s);
    if(o.rx) mesh.rotation.x = o.rx; if(o.ry) mesh.rotation.y = o.ry; if(o.rz) mesh.rotation.z = o.rz;
    parent.add(mesh);
    if(o.ol!==false && !m.transparent && m!==OUT){ const ol = new T.Mesh(geo, OUT); ol.scale.setScalar(o.ow||1.08); mesh.add(ol); }
    return mesh;
  }
  function shadowOf(parent, r){ const s = new T.Mesh(GEO.disk, SHADOW); s.rotation.x = -Math.PI/2; s.position.y = .03; s.scale.setScalar(r); parent.add(s); return s; }
  function dotTexture(){ const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.35,'rgba(255,255,255,.6)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0,0,64,64); return new T.CanvasTexture(c); }
  const DOT = dotTexture();

  // ---------- Q 版模型（KayKit glTF）：載入、描邊、動作 ----------
  const ASSET = 'assets/kaykit/';
  const TPL = {}, WEAP = {}, TEX = {}, CLIPS = {};
  const outlineMat = (skin) => { const m = new T.MeshBasicMaterial({color:0x17121f, side:T.BackSide, skinning:skin});
    m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  transformed += normalize(normal) * 0.028;'); };
    return m; };
  const OUTM = outlineMat(false), OUTMS = outlineMat(true);
  function toonify(o, tex){
    const old = o.material, map = tex ? TEX[tex] : old.map;
    if(map){ map.encoding = T.LinearEncoding; }
    o.material = new T.MeshToonMaterial({map, color:0xffffff, gradientMap:grad, skinning:!!o.isSkinnedMesh});
    o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false;
    return o.material;
  }
  function addOutline(o){
    let ol;
    if(o.isSkinnedMesh){ ol = new T.SkinnedMesh(o.geometry, OUTMS); ol.bind(o.skeleton, o.bindMatrix); }
    else ol = new T.Mesh(o.geometry, OUTM);
    ol.position.copy(o.position); ol.quaternion.copy(o.quaternion); ol.scale.copy(o.scale);
    ol.frustumCulled = false; ol.userData.outline = true; o.parent.add(ol);
  }
  async function loadAssets(onProg){
    if(!T.GLTFLoader || !T.SkeletonUtils) return false;
    const gl = new T.GLTFLoader(), tl = new T.TextureLoader();
    const load = url => new Promise((res,rej)=>gl.load(url, res, undefined, rej));
    const files = new Set(), texs = new Set(), weaps = new Set();
    const take = md => { if(!md) return; files.add(md.file); if(md.tex) texs.add(md.tex); if(md.weapon) weaps.add(md.weapon); if(md.shield) weaps.add(md.shield); };
    R.members.forEach(m=>take(m.model)); Object.values(R.monsters).forEach(s=>take(s.model)); take(R.randomMonster.model);
    const jobs = [load(ASSET+'anims.glb').then(g=>{ g.animations.forEach(c=>{ CLIPS[c.name] = c; }); })];
    files.forEach(f=>jobs.push(load(ASSET+f+'.glb').then(g=>{
      g.scene.updateMatrixWorld(true);
      const box = new T.Box3(); g.scene.traverse(o=>{ if(o.isSkinnedMesh){ o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); box.union(b); } });
      TPL[f] = {scene:g.scene, h:Math.max(.5, box.max.y - Math.min(0, box.min.y))};
    })));
    weaps.forEach(w=>jobs.push(load(ASSET+w+'.glb').then(g=>{ WEAP[w] = g.scene; })));
    texs.forEach(t=>jobs.push(new Promise((res,rej)=>tl.load(ASSET+'tex/'+t+'.png', tx=>{ tx.flipY = false; tx.encoding = T.LinearEncoding; TEX[t] = tx; res(); }, undefined, rej))));
    let done = 0; jobs.forEach(j=>j.then(()=>onProg && onProg(++done, jobs.length)));
    await Promise.all(jobs);
    window.__rpgDebug = {TPL, CLIPS, WEAP};
    return true;
  }
  // 由模板做出一個可動的角色：show = 要顯示的配件名稱
  function instModel(md, targetH){
    const t = TPL[md.file], root = T.SkeletonUtils.clone(t.scene), mats = [], acc = [];
    root.traverse(o=>{ if(o.isMesh) acc.push(o); });
    acc.forEach(o=>{
      if(!o.isSkinnedMesh){
        const nm = o.name, pn = o.parent && o.parent.name;
        if(md.show && !md.show.includes(nm) && !md.show.includes(pn)){ o.visible = false; return; }
        if(!md.show && /Offhand|Shield|2H_|Mug|Spellbook|Throwable|Knife|Crossbow|Wand|Staff|Axe|Sword/.test(nm)){ o.visible = false; return; }
      }
      mats.push(toonify(o, md.tex)); addOutline(o);
    });
    const slot = n => root.getObjectByName(n.replace('.','')) || root.getObjectByName(n);
    [['weapon','handslot.r'],['shield','handslot.l']].forEach(([k,bone])=>{
      if(!md[k] || !WEAP[md[k]]) return;
      const w = WEAP[md[k]].clone(true), b = slot(bone); if(!b) return;
      const ms = []; w.traverse(o=>{ if(o.isMesh) ms.push(o); }); ms.forEach(o=>{ mats.push(toonify(o, md.tex)); addOutline(o); });
      b.add(w);
    });
    const g = new T.Group(), holder = new T.Group(); g.add(holder); holder.add(root);
    const s = targetH / t.h; holder.scale.setScalar(s);
    return {g, holder, root, mats};
  }
  function glSetup(X, root){ X.mixer = new T.AnimationMixer(root); X.acts = {}; X.cur = null; X.lt = performance.now(); }
  function act(X, name){ if(!X.acts[name]){ const c = CLIPS[name]; if(!c) return null; X.acts[name] = X.mixer.clipAction(c); } return X.acts[name]; }
  function loopAnim(X, name, fade){
    if(X.cur===name) return; const a = act(X, name); if(!a) return;
    a.reset(); a.setLoop(T.LoopRepeat, Infinity); a.clampWhenFinished = false; a.timeScale = 1; a.enabled = true;
    const p = X.cur && X.acts[X.cur];
    if(p && p!==a){ a.play(); a.crossFadeFrom(p, fade===undefined?.2:fade, false); } else a.fadeIn(fade===undefined?.2:fade).play();
    X.cur = name;
  }
  // 播一次動作，回傳動作長度（秒）
  function onceAnim(X, name, opts){
    opts = opts || {}; const a = act(X, name); if(!a) return 0;
    a.reset(); a.setLoop(T.LoopOnce, 1); a.clampWhenFinished = !!opts.clamp; a.timeScale = opts.speed || 1; a.enabled = true;
    const p = X.cur && X.acts[X.cur];
    if(p && p!==a){ a.play(); a.crossFadeFrom(p, .12, false); } else a.play();
    X.cur = name;
    return a.getClip().duration / a.timeScale;
  }
  function glTick(X){ const now = performance.now(), dt = Math.min(.1, (now - X.lt)/1000); X.lt = now; if(dt>0) X.mixer.update(dt); }
  function makeGlChar(m){
    const md = m.model, I = instModel(md, 2.0);
    const C = {g:I.g, body:I.holder, legs:[], arms:[], wings:[], spin:[], m, float:0, k:1.05, quad:false, gl:true, mats:I.mats, atkAnim:md.atk};
    shadowOf(C.g, .5); glSetup(C, I.root); loopAnim(C, 'Idle', 0);
    return C;
  }
  function makeGlMonster(sp){
    const md = sp.model, I = instModel(md, 2.1);
    const M = {g:I.g, body:I.holder, mats:I.mats, type:'gl', gl:true, boss:!!sp.boss, float:0, top:1.7, sp, atkAnim:md.atk, ranged:md.ranged};
    shadowOf(M.g, .75); glSetup(M, I.root); loopAnim(M, 'Idle', 0);
    if(M.boss){ M.aura = P(M.g, GEO.ring, glow(0xff6b9a,.55), 0,.06,0,1.4,{rx:Math.PI/2,ol:false}); M.g.scale.setScalar(1.5); }
    M.mats.forEach(mm=>{ mm.userData.e = mm.emissive.getHex(); mm.userData.ei = mm.emissiveIntensity; });
    return M;
  }

  // ---------- 角色 ----------
  function makeChar(m){
    if(m.model && TPL[m.model.file]) return makeGlChar(m);
    const g = new T.Group(), body = new T.Group(); g.add(body);
    const C = {g, body, legs:[], arms:[], wings:[], spin:[], m, float:0, k:1, quad:false};
    shadowOf(g, .55);
    const skin = mat(0xf6dcc4), main = mat(m.color), hair = mat(m.hair), dark = mat(0x3a2c26), eye = mat(0x1d2433), blush = mat(0xffa3b0);
    if(m.type==='fox'){ buildFox(C, main, hair, eye); return fin(C); }
    for(const sx of [-1,1]){ const leg = new T.Group(); leg.position.set(sx*.15,.5,0); body.add(leg); P(leg, GEO.cyl, dark, 0,-.25,0,[.11,.5,.11]); C.legs.push(leg); }
    P(body, GEO.taper, main, 0,.86,0,[.3,.7,.3]);
    P(body, GEO.cyl, mat(0x2a1f18), 0,.6,0,[.31,.06,.31],{ol:false});
    const hands = [];
    for(const sx of [-1,1]){
      const arm = new T.Group(); arm.position.set(sx*.36,1.14,0); body.add(arm);
      P(arm, GEO.cyl, main, 0,-.22,0,[.08,.46,.08]);
      const hand = new T.Group(); hand.position.set(0,-.48,0); arm.add(hand); P(hand, GEO.sph, skin, 0,0,0,.09,{ol:false});
      C.arms.push(arm); hands.push(hand);
    }
    const head = new T.Group(); head.position.y = 1.55; body.add(head); C.head = head;
    P(head, GEO.sph, skin, 0,0,0,.36);
    for(const sx of [-1,1]){ P(head, GEO.sph, eye, sx*.12,-.01,.32,[.05,.075,.04],{ol:false}); P(head, GEO.sph, blush, sx*.2,-.1,.28,[.06,.035,.02],{ol:false}); }
    const t = m.type;
    if(!['knight','paladin','mush'].includes(t)) P(head, GEO.hemi, hair, 0,.03,-.03,[.385,.34,.385],{rx:-.3});
    if(['fairy','archer','mage'].includes(t)) for(const sx of [-1,1]) P(head, GEO.cone, skin, sx*.38,.04,0,[.07,.3,.07],{rz:-sx*1.3});
    switch(t){
      case 'hero': {
        for(let i=0;i<5;i++) P(head, GEO.cone, hair, -.24+i*.12,.3,-.05,[.08,.22,.08],{rz:(i-2)*.25,ol:false});
        C.cape = P(body, GEO.plane, mat(0xb8323f,{side:T.DoubleSide}), 0,.82,-.31,[.62,.95,1],{rx:.12,ol:false});
        const sw = new T.Group(); hands[1].add(sw); sw.rotation.x = 1.4;
        P(sw, GEO.box, mat(0xdfe6f0), 0,.42,0,[.07,.72,.03]); P(sw, GEO.box, mat(0xc9a24f), 0,.05,0,[.28,.05,.07]);
        break; }
      case 'fairy': {
        C.k = .72; C.float = .75;
        P(head, GEO.cone, mat(0x2f8a62), 0,.4,-.06,[.3,.48,.3],{rx:-.35});
        P(head, GEO.sph, glow(0xf3d28b), 0,.66,-.22,.06,{ol:false});
        for(const sx of [-1,1]){
          const w = new T.Group(); w.position.set(sx*.1,1.12,-.24); body.add(w);
          P(w, GEO.sph, glow(0xcdf0ff,.55), sx*.34,.12,0,[.36,.19,.02],{ol:false});
          P(w, GEO.sph, glow(0xcdf0ff,.45), sx*.25,-.16,0,[.24,.13,.02],{ol:false});
          C.wings.push(w);
        }
        break; }
      case 'mage': {
        P(head, GEO.cone, main, 0,.66,-.05,[.36,.8,.36],{rx:-.14});
        P(head, GEO.cyl, main, 0,.27,0,[.56,.04,.56]);
        const st = new T.Group(); hands[1].add(st);
        P(st, GEO.cyl, mat(0x6b4a2b), 0,.25,0,[.04,1.3,.04]); C.orb = P(st, GEO.sph, glow(0xc9a7ff), 0,.95,0,.13,{ol:false});
        break; }
      case 'knight': {
        C.k = 1.12;
        P(head, GEO.sph, mat(0x7a8a6a), 0,.06,0,[.41,.39,.41]);
        P(head, GEO.box, eye, 0,.0,.37,[.34,.06,.06],{ol:false});
        for(const sx of [-1,1]){ P(head, GEO.cyl, mat(0x8a6a3a), sx*.25,.45,0,[.04,.35,.04],{rz:-sx*.5}); P(head, GEO.cyl, mat(0x8a6a3a), sx*.38,.55,0,[.03,.18,.03],{rz:sx*.6}); }
        P(hands[0], GEO.cyl, mat(0x8a6a3a), 0,.05,.16,[.38,.06,.38],{rx:Math.PI/2});
        P(hands[0], GEO.sph, mat(0x7fc99a), 0,.05,.2,[.12,.16,.04],{ol:false});
        P(hands[1], GEO.box, mat(0xcfd6c0), 0,.3,.05,[.06,.6,.06]);
        break; }
      case 'archer': {
        P(head, GEO.cone, main, 0,.3,-.1,[.42,.55,.42],{rx:-.45});
        P(hands[0], GEO.arc, mat(0x8a5a2b), 0,0,.06,.55,{rz:Math.PI/2, ry:Math.PI/2});
        P(body, GEO.cyl, mat(0x6b4a2b), .14,1.0,-.3,[.1,.5,.1],{rz:.4});
        break; }
      case 'mush': {
        C.k = .82;
        P(head, GEO.hemi, mat(m.hair), 0,.12,0,[.64,.46,.64]);
        [[0,.55,.2],[.35,.35,.35],[-.35,.35,.35],[.45,.3,-.2],[-.4,.38,-.25],[0,.45,-.45]].forEach(p=>P(head, GEO.sph, mat(0xffffff), p[0],p[1],p[2],.07,{ol:false}));
        C.orb = P(hands[1], GEO.sph, glow(0xff9db0,.85), 0,-.06,.06,.13,{ol:false});
        break; }
      case 'paladin': {
        C.k = 1.08;
        P(head, GEO.sph, mat(0xd9c27a), 0,.06,0,[.41,.39,.41]);
        P(head, GEO.box, eye, 0,0,.37,[.3,.06,.06],{ol:false});
        P(head, GEO.cone, mat(0xc0303a), 0,.52,-.1,[.12,.45,.12],{rx:-.5});
        C.cape = P(body, GEO.plane, mat(0xf4f0e6,{side:T.DoubleSide}), 0,.82,-.31,[.66,1,1],{rx:.12,ol:false});
        const sw = new T.Group(); hands[1].add(sw); sw.rotation.x = 1.4;
        P(sw, GEO.box, mat(0xfff6d6), 0,.55,0,[.1,.95,.035]); P(sw, GEO.box, mat(0xc9a24f), 0,.06,0,[.36,.06,.08]);
        break; }
    }
    return fin(C);
  }
  function buildFox(C, main, hair, eye){
    C.quad = true; C.k = .95; C.float = .05; const b = C.body;
    P(b, GEO.sph, main, 0,.62,0,[.32,.3,.55]);
    for(const [sx,sz] of [[-1,1],[1,1],[-1,-1],[1,-1]]){ const leg = new T.Group(); leg.position.set(sx*.16,.45,sz*.3); b.add(leg); P(leg, GEO.cyl, main, 0,-.22,0,[.07,.45,.07]); C.legs.push(leg); }
    const head = new T.Group(); head.position.set(0,.98,.5); b.add(head); C.head = head;
    P(head, GEO.sph, main, 0,0,0,.27);
    P(head, GEO.cone, main, 0,-.05,.3,[.12,.25,.12],{rx:Math.PI/2});
    P(head, GEO.sph, eye, 0,-.05,.43,.035,{ol:false});
    for(const sx of [-1,1]){ P(head, GEO.sph, eye, sx*.11,.06,.22,[.04,.05,.03],{ol:false}); P(head, GEO.cone, main, sx*.15,.3,0,[.09,.24,.07],{rz:-sx*.25}); P(head, GEO.cone, hair, sx*.15,.28,.03,[.05,.15,.03],{rz:-sx*.25,ol:false}); }
    const tail = new T.Group(); tail.position.set(0,.7,-.45); b.add(tail); C.tail = tail;
    P(tail, GEO.sph, main, 0,.22,-.2,[.2,.2,.5],{rx:-.8});
    P(tail, GEO.sph, glow(C.m.hair), 0,.52,-.42,.15,{ol:false});
    for(let i=0;i<2;i++) C.spin.push(P(b, GEO.sph, glow(0xc9a7ff,.85), 0,1,0,.09,{ol:false}));
  }
  function fin(C){ C.g.scale.setScalar(C.k); C.body.position.y = C.float; C.g.traverse(o=>{ if(o.isMesh && o.material!==OUT && o.material!==SHADOW && !o.material.transparent) o.castShadow = true; }); return C; }
  function animChar(C, t, mv){
    if(C.gl){ if(!C.lock) loopAnim(C, mv ? 'Running_A' : (C.battle ? 'Idle_Combat' : 'Idle')); glTick(C); return; }
    const sp = reduce ? 0 : 1;
    if(C.quad){
      C.legs.forEach((l,i)=> l.rotation.x = mv ? Math.sin(t*12 + ((i===0||i===3)?0:Math.PI))*.7 : 0);
      C.tail.rotation.y = Math.sin(t*3)*.4*sp;
      C.spin.forEach((s,i)=>{ const a = t*2+i*Math.PI; s.position.set(Math.cos(a)*.75, 1.15+Math.sin(t*3+i)*.1, Math.sin(a)*.75); });
      C.body.position.y = C.float + (mv ? Math.abs(Math.sin(t*12))*.06 : 0);
      return;
    }
    const sw = mv ? Math.sin(t*11)*.7 : 0;
    if(C.legs[0]){ C.legs[0].rotation.x = sw; C.legs[1].rotation.x = -sw; }
    if(C.arms[0] && !C.armLock){ C.arms[0].rotation.x = -sw*.8; C.arms[1].rotation.x = sw*.8; }
    C.body.position.y = C.float + (C.float ? Math.sin(t*3)*.12*sp : (mv ? Math.abs(Math.sin(t*11))*.06 : Math.sin(t*2)*.015*sp));
    C.wings.forEach((w,i)=>{ w.rotation.y = (i?-1:1)*(.25+Math.sin(t*(mv?24:8))*.45*sp); });
    if(C.cape) C.cape.rotation.x = .12 + (mv ? .35 : .05*Math.sin(t*2)*sp);
    if(C.orb) C.orb.scale.setScalar(.13*(1+.15*Math.sin(t*4)*sp));
  }

  // ---------- 魔物 ----------
  function makeMonster(sp){
    if(sp.model && TPL[sp.model.file]) return makeGlMonster(sp);
    const g = new T.Group(), body = new T.Group(); g.add(body);
    const M = {g, body, mats:[], type:sp.type, boss:!!sp.boss, float:0, top:1.6, sp};
    const col = (x,o)=>{ const m = mat(x,o); M.mats.push(m); return m; };
    const eyeW = col(0xffffff), eyeB = col(0x141414);
    const c = sp.color;
    function eyes(parent, y, z, sx, s, angry){
      s = s||1;
      for(const d of [-1,1]){
        P(parent, GEO.sph, eyeW, d*sx,y,z,[.13*s,.15*s,.08*s],{ol:false});
        P(parent, GEO.sph, eyeB, d*sx,y-.01*s,z+.06*s,[.07*s,.09*s,.05*s],{ol:false});
        if(angry!==false) P(parent, GEO.box, eyeB, d*sx,y+.17*s,z+.03,[.22*s,.045*s,.04*s],{rz:d*.45,ol:false});
      }
    }
    shadowOf(g, M.boss ? .9 : .75);
    switch(sp.type){
      case 'mush': {
        P(body, GEO.cyl, col(0xf2e6d0), 0,.42,0,[.38,.66,.38]);
        M.cap = P(body, GEO.hemi, col(c), 0,.74,0,[.82,.62,.82]);
        [[0,.6,.2],[.45,.35,.4],[-.45,.35,.4],[.6,.3,-.2],[-.55,.35,-.3],[0,.45,-.6]].forEach(p=>P(M.cap, GEO.sph, col(0xffffff), p[0]/.82,p[1]/.62,p[2]/.82,[.1/.82,.1/.62,.1/.82],{ol:false}));
        eyes(body, .5, .35, .14, .9);
        for(const d of [-1,1]) P(body, GEO.sph, col(0x6b4a2b), d*.2,.06,.1,[.14,.08,.2]);
        M.top = 1.4; break; }
      case 'jelly': {
        M.float = .7;
        const jm = col(c,{transparent:true,opacity:.78,emissive:c,emissiveIntensity:.25});
        P(body, GEO.hemi, jm, 0,1.2,0,[.82,.68,.82],{ol:false});
        P(body, GEO.sph, col(0xffffff,{transparent:true,opacity:.35}), 0,1.4,0,.32,{ol:false});
        M.tent = [];
        for(let i=0;i<7;i++){ const a = i/7*Math.PI*2, tg = new T.Group(); tg.position.set(Math.cos(a)*.5,1.2,Math.sin(a)*.5); body.add(tg); P(tg, GEO.cyl, jm, 0,-.45,0,[.05,.9,.05],{ol:false}); M.tent.push(tg); }
        eyes(body, 1.42, .66, .22, 1, false);
        M.top = 2.0; break; }
      case 'beetle': {
        P(body, GEO.sph, col(c), 0,.72,-.1,[.75,.55,.95]);
        P(body, GEO.box, col(0x111111), 0,1.02,-.1,[.03,.2,1.5],{ol:false});
        P(body, GEO.sph, col(0x2a2a2a), 0,.6,.82,.38);
        for(const d of [-1,1]){
          P(body, GEO.cyl, col(0x222222), d*.16,1.05,1.0,[.025,.5,.025],{rz:d*.4,rx:.5,ol:false});
          P(body, GEO.sph, glow(0xffe08a), d*.28,1.28,1.12,.06,{ol:false});
          for(const z of [-.5,0,.5]) P(body, GEO.cyl, col(0x222222), d*.72,.3,z,[.05,.5,.05],{rz:d*.8});
        }
        eyes(body, .66, 1.12, .15, .8);
        M.top = 1.35; break; }
      case 'golem': {
        P(body, GEO.box, col(c), 0,1.15,0,[1.1,1.0,.8]);
        P(body, GEO.box, col(c), 0,1.95,0,[.62,.5,.56]);
        M.eye = P(body, GEO.box, glow(0x7fe0ff), 0,1.97,.29,[.42,.08,.02],{ol:false});
        P(body, GEO.box, glow(0x7fe0ff), 0,1.15,.41,[.08,.62,.02],{ol:false});
        P(body, GEO.box, glow(0x7fe0ff), 0,1.25,.41,[.45,.06,.02],{ol:false});
        M.arms = [];
        for(const d of [-1,1]){
          const a = new T.Group(); a.position.set(d*.72,1.5,0); body.add(a); P(a, GEO.box, col(c), 0,-.45,0,[.35,.9,.38]); M.arms.push(a);
          P(body, GEO.box, col(c), d*.3,.35,0,[.36,.7,.4]);
        }
        M.top = 2.3; break; }
      case 'ghost': {
        M.float = .7;
        const gm = col(c,{transparent:true,opacity:.86,emissive:c,emissiveIntensity:.22});
        P(body, GEO.sph, gm, 0,1.2,0,.7,{ol:false});
        P(body, GEO.cone, gm, 0,.55,0,[.68,.9,.68],{rx:Math.PI,ol:false});
        eyes(body, 1.3, .6, .22, 1.05);
        P(body, GEO.sph, eyeB, 0,1.0,.64,[.16,.1,.05],{ol:false});
        for(const d of [-1,1]) P(body, GEO.sph, gm, d*.72,1.0,.1,[.18,.12,.12],{ol:false});
        if(/404/.test(sp.name)){
          const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64; const x = cv.getContext('2d');
          x.fillStyle = '#ff5c7a'; x.font = 'bold 48px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('404', 64, 34);
          const s = new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(cv), transparent:true})); s.position.set(0,1.75,.4); s.scale.set(.9,.45,1); body.add(s);
        }
        M.top = 2.05; break; }
      case 'shadow': {
        M.float = .35;
        P(body, GEO.sph, col(c), 0,1.15,0,[.7,.85,.6]);
        P(body, GEO.cone, col(c), 0,.5,0,[.78,1.1,.78],{rx:Math.PI});
        for(const d of [-1,1]) P(body, GEO.sph, glow(0xff3b5c), d*.2,1.3,.5,[.1,.05,.04],{ol:false});
        const key = new T.Group(); key.position.set(.8,1.0,.25); body.add(key); M.key = key;
        P(key, GEO.ring, col(0xf3d28b), 0,.25,0,.16,{ol:false}); P(key, GEO.box, col(0xf3d28b), 0,-.1,0,[.05,.55,.05]); P(key, GEO.box, col(0xf3d28b), .08,-.3,0,[.14,.05,.05]);
        M.smoke = [];
        for(let i=0;i<6;i++) M.smoke.push(P(body, GEO.sph, glow(0x30223a,.5), 0,1,0,.22,{ol:false}));
        M.top = 2.1; break; }
      case 'devourer': {
        M.float = .55;
        P(body, GEO.sph, col(c), 0,1.2,0,.95);
        M.mouth = new T.Group(); M.mouth.position.set(0,1.0,.55); body.add(M.mouth);
        P(M.mouth, GEO.sph, col(0x1a0a14), 0,0,0,[.62,.4,.5],{ol:false});
        for(let i=0;i<5;i++){ P(M.mouth, GEO.cone, col(0xffffff), -.4+i*.2,.28,.25,[.07,.18,.07],{rx:Math.PI,ol:false}); P(M.mouth, GEO.cone, col(0xffffff), -.3+i*.15,-.28,.25,[.06,.14,.06],{ol:false}); }
        eyes(body, 1.7, .72, .32, 1.1);
        M.wings = [];
        for(const d of [-1,1]){ const w = new T.Group(); w.position.set(d*.9,1.5,-.2); body.add(w); P(w, GEO.plane, col(0x2a1f3a,{side:T.DoubleSide}), d*.35,0,0,[.7,.45,1],{ol:false}); M.wings.push(w); }
        M.top = 2.3; break; }
      case 'serpent': M.chains = [buildSerpent(body, c, 0, 0, col, eyes)]; M.top = 2.7; break;
      case 'twin': {
        const c2 = new T.Color(c).offsetHSL(.45,0,0).getHex();
        M.chains = [buildSerpent(body, c, -.55, 0, col, eyes), buildSerpent(body, c2, .55, Math.PI, col, eyes)];
        M.top = 2.7; break; }
    }
    if(M.boss){
      const cr = new T.Group(); cr.position.y = M.top + M.float; body.add(cr);
      P(cr, GEO.cyl, col(0xf3d28b), 0,0,0,[.32,.14,.32]);
      for(let i=0;i<5;i++){ const a = i/5*Math.PI*2; P(cr, GEO.cone, col(0xf3d28b), Math.cos(a)*.27,.17,Math.sin(a)*.27,[.07,.22,.07],{ol:false}); }
      P(cr, GEO.sph, glow(0xff5c7a), 0,.08,.32,.06,{ol:false});
      M.aura = P(g, GEO.ring, glow(0xff6b9a,.55), 0,.06,0,1.4,{rx:Math.PI/2,ol:false});
      g.scale.setScalar(1.5);
    }
    M.mats.forEach(m=>{ m.userData.e = m.emissive.getHex(); m.userData.ei = m.emissiveIntensity; });
    g.traverse(o=>{ if(o.isMesh && o.material!==OUT && o.material!==SHADOW && !o.material.transparent) o.castShadow = true; });
    return M;
  }
  function buildSerpent(parent, c, ox, ph, col, eyes){
    const ch = {seg:[], ox, ph}; const m = col(c), belly = col(new T.Color(c).offsetHSL(0,0,.2).getHex());
    for(let i=0;i<9;i++){ const r = .42 - i*.022; ch.seg.push(P(parent, GEO.sph, i%2?belly:m, ox,.3,0, r)); }
    const head = new T.Group(); parent.add(head); ch.head = head;
    P(head, GEO.sph, m, 0,0,0,[.42,.36,.5]);
    eyes(head, .14, .32, .17, .85);
    for(const d of [-1,1]) P(head, GEO.cone, col(0xffffff), d*.12,-.2,.38,[.05,.16,.05],{rx:Math.PI,ol:false});
    P(head, GEO.box, col(0xff3b5c), 0,-.12,.62,[.04,.02,.3],{ol:false});
    return ch;
  }
  function animMonster(M, t){
    if(M.gl){ if(!M.lock) loopAnim(M, M.battle ? 'Idle_Combat' : 'Idle'); glTick(M); if(M.aura) M.aura.rotation.z = t*.6; return; }
    const sp = reduce ? 0 : 1;
    M.body.position.y = M.float + Math.sin(t*2.2 + (M.ph||0))*.08*sp*(M.float?1.6:1);
    if(M.cap) M.body.scale.y = 1 + Math.sin(t*4)*.04*sp;
    if(M.tent) M.tent.forEach((tg,i)=>{ tg.rotation.x = Math.sin(t*3+i)*.25*sp; tg.rotation.z = Math.cos(t*2.6+i)*.25*sp; });
    if(M.arms) M.arms.forEach((a,i)=> a.rotation.x = Math.sin(t*1.6+i*Math.PI)*.25*sp);
    if(M.eye) M.eye.scale.x = .42*(.8+.2*Math.sin(t*3));
    if(M.smoke) M.smoke.forEach((s,i)=>{ const a = t*.9+i/6*Math.PI*2; s.position.set(Math.cos(a)*.75, .7+Math.sin(t*2+i)*.35, Math.sin(a)*.6); });
    if(M.key) M.key.rotation.z = Math.sin(t*2)*.3*sp;
    if(M.mouth) M.mouth.scale.y = 1 + .3*Math.sin(t*5)*sp;
    if(M.wings) M.wings.forEach((w,i)=> w.rotation.z = (i?-1:1)*Math.sin(t*10)*.5*sp);
    if(M.aura) M.aura.rotation.z = t*.6;
    if(M.chains) M.chains.forEach(ch=>{
      ch.seg.forEach((s,i)=>{ s.position.set(ch.ox + Math.sin(i*.7 + t*2*sp + ch.ph)*.28, .32 + i*.24, -.45 + i*.07); });
      const l = ch.seg[ch.seg.length-1].position;
      ch.head.position.set(l.x, l.y + .32, l.z + .25); ch.head.rotation.z = Math.sin(t*2+ch.ph)*.15*sp;
    });
  }
  function flashMon(M, on){ M.mats.forEach(m=>{ if(on){ m.emissive.setHex(0xffffff); m.emissiveIntensity = .9; } else { m.emissive.setHex(m.userData.e); m.emissiveIntensity = m.userData.ei; } }); }

  // ---------- 世界座標（沿用 2D 版的像素座標，再換算） ----------
  const PX = 20, OX = 80, OZ = 55;
  const toW = (px,py) => ({x:px/PX-OX, z:py/PX-OZ});
  const REALM = [
    {g:0x1f5a43, x:560,  y:1700, a:0x8fe3b8},
    {g:0x3a2a6a, x:1650, y:1700, a:0xc9a7ff},
    {g:0x1b4166, x:2720, y:1420, a:0x8fc7ff},
    {g:0x5a4618, x:1880, y:620,  a:0xf3d28b},
    {g:0x2e3756, x:700,  y:620,  a:0xe6e0ff}];
  const POS = [[220,1950],[430,1740],[300,1490],[610,1400],[830,1620],[1010,1880],
    [1250,1960],[1460,1720],[1350,1460],[1660,1380],[1880,1620],[2070,1880],
    [2350,1720],[2610,1930],[2910,1770],[3010,1430],[2770,1160],[2510,950],
    [2120,640],[1660,500],[1060,720],[600,470]];
  const SPAWN = {x:110, y:2090};
  const ctrl = [SPAWN].concat(POS.map(p=>({x:p[0],y:p[1]})));
  const pathPx = [];
  for(let i=0;i<ctrl.length-1;i++){
    const p0 = ctrl[Math.max(0,i-1)], p1 = ctrl[i], p2 = ctrl[i+1], p3 = ctrl[Math.min(ctrl.length-1,i+2)];
    for(let t=0;t<1;t+=.05){ const t2=t*t, t3=t2*t;
      pathPx.push({x:.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
                   y:.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3)}); }
  }
  pathPx.push({x:ctrl[ctrl.length-1].x, y:ctrl[ctrl.length-1].y});
  let seed = 20261002;
  const rnd = ()=>{ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed>>>15, 1|seed); t = t + Math.imul(t ^ t>>>7, 61|t) ^ t; return ((t ^ t>>>14)>>>0)/4294967296; };
  const realmAtPx = (x,y)=>{ let b=0, bd=1e12; REALM.forEach((r,i)=>{ const d=(r.x-x)**2+(r.y-y)**2; if(d<bd){bd=d;b=i;} }); return b; };

  // ---------- 載入 Q 版模型（失敗就用程式繪製的造型） ----------
  try{
    await loadAssets((d,n)=>{ $('loading').textContent = `正在召喚夥伴與魔物……（${d}/${n}）`; });
  }catch(e){ console.warn('模型載入失敗，改用簡化造型', e); for(const k in TPL) delete TPL[k]; }

  // ---------- 大地圖場景 ----------
  const W = new T.Scene();
  W.background = new T.Color(0x0b1a26); W.fog = new T.Fog(0x0b1a26, 34, 80);
  W.add(new T.HemisphereLight(0xcfe2ff, 0x1a2a20, .8));
  const sun = new T.DirectionalLight(0xfff0d0, .75); sun.position.set(30,60,25); W.add(sun); W.add(sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048,2048); sun.shadow.bias = -0.0008; sun.shadow.normalBias = .02;
  Object.assign(sun.shadow.camera, {left:-26, right:26, top:26, bottom:-26, near:1, far:140}); sun.shadow.camera.updateProjectionMatrix();
  W.add(new T.AmbientLight(0xffffff, .12));
  const wCam = new T.PerspectiveCamera(45, 1, .1, 300);

  // 地面（頂點色混出五個秘境）
  {
    const geo = new T.PlaneGeometry(220,170,110,85); geo.rotateX(-Math.PI/2);
    const pos = geo.attributes.position, cols = new Float32Array(pos.count*3), base = new T.Color(0x0d1c24), tmp = new T.Color();
    const rc = REALM.map(r=>new T.Color(r.g));
    for(let i=0;i<pos.count;i++){
      const px = (pos.getX(i)+OX)*PX, py = (pos.getZ(i)+OZ)*PX;
      let wsum = 0; const acc = new T.Color(0,0,0);
      REALM.forEach((r,k)=>{ const d2 = (r.x-px)**2+(r.y-py)**2, w = Math.exp(-d2/(2*620*620)); wsum += w; acc.r += rc[k].r*w; acc.g += rc[k].g*w; acc.b += rc[k].b*w; });
      tmp.copy(base).lerp(new T.Color(acc.r/Math.max(wsum,1e-6), acc.g/Math.max(wsum,1e-6), acc.b/Math.max(wsum,1e-6)), Math.min(1, wsum*1.25));
      const n = (Math.sin(px*.013)+Math.cos(py*.011)+Math.sin((px+py)*.007))*.018;
      tmp.offsetHSL(0,0,n);
      const out = px<0||px>3200||py<0||py>2200; if(out) tmp.multiplyScalar(.55);
      cols[i*3] = tmp.r; cols[i*3+1] = tmp.g; cols[i*3+2] = tmp.b;
    }
    geo.setAttribute('color', new T.BufferAttribute(cols,3));
    const gm = new T.Mesh(geo, new T.MeshToonMaterial({vertexColors:true, gradientMap:grad})); gm.receiveShadow = true; W.add(gm);
  }
  // 道路
  const pathW = pathPx.map(p=>toW(p.x,p.y));
  {
    const v = [], idx = [];
    pathW.forEach((p,i)=>{
      const a = pathW[Math.max(0,i-1)], b = pathW[Math.min(pathW.length-1,i+1)];
      let tx = b.x-a.x, tz = b.z-a.z; const l = Math.hypot(tx,tz)||1; tx/=l; tz/=l;
      v.push(p.x - tz*1.3, .04, p.z + tx*1.3, p.x + tz*1.3, .04, p.z - tx*1.3);
      if(i){ const k = i*2; idx.push(k-2,k-1,k, k-1,k+1,k); }
    });
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(v,3)); geo.setIndex(idx); geo.computeVertexNormals();
    const pm = new T.Mesh(geo, new T.MeshToonMaterial({color:0xb9a47a, gradientMap:grad, side:T.DoubleSide})); pm.receiveShadow = true; W.add(pm);
    const pg = new T.BufferGeometry(), pv = [];
    for(let i=0;i<pathW.length;i+=2) pv.push(pathW[i].x, .35, pathW[i].z);
    pg.setAttribute('position', new T.Float32BufferAttribute(pv,3));
    var pathDots = new T.Points(pg, new T.PointsMaterial({color:0xf3d28b, size:.5, map:DOT, transparent:true, depthWrite:false, blending:T.AdditiveBlending, opacity:.6}));
    W.add(pathDots);
  }
  // 起點
  {
    const sp = toW(SPAWN.x, SPAWN.y);
    P(W, GEO.ring, glow(0x8fe3b8,.7), sp.x,.08,sp.z, 1.6, {rx:Math.PI/2, ol:false});
  }
  // 裝飾（InstancedMesh）
  {
    const L = {trunk:[], canopy:[], cone:[], stem:[], cap:[], crystal:[], rune:[], pillar:[], pole:[], lamp:[], flower:[]};
    const CAN = [0x2f8a62,0x5b4a9a,0x2f6a9a,0xa8862e,0x8a93b8], ACC = REALM.map(r=>r.a);
    const KINDS = [['tree','tree','mush','flower','tree'],['crystal','rune','crystal','mush','tree'],['pine','pine','flower','crystal'],['tree','pillar','flower','tree'],['tree','lantern','flower','pine']];
    function add(kind, px, py, r, s){
      const w = toW(px,py), ry = rnd()*6.28, cv = (rnd()-.5)*.08;
      const tint = (h)=> new T.Color(h).offsetHSL(0,0,cv);
      switch(kind){
        case 'tree': L.trunk.push([w.x,.7*s,w.z,.2*s,1.4*s,.2*s,ry,0x4a3424]); L.canopy.push([w.x,2.1*s,w.z,1.25*s,1.15*s,1.25*s,ry,tint(CAN[r])]); L.canopy.push([w.x+.4*s,2.8*s,w.z-.2*s,.8*s,.75*s,.8*s,ry,tint(CAN[r]).offsetHSL(0,0,.06)]); break;
        case 'pine': L.trunk.push([w.x,.4*s,w.z,.15*s,.8*s,.15*s,ry,0x3a2a1c]); L.cone.push([w.x,1.5*s,w.z,1*s,1.8*s,1*s,ry,tint(CAN[r])]); L.cone.push([w.x,2.5*s,w.z,.7*s,1.4*s,.7*s,ry,tint(CAN[r]).offsetHSL(0,0,.06)]); break;
        case 'mush': L.stem.push([w.x,.25*s,w.z,.14*s,.5*s,.14*s,ry,0xf2e6d0]); L.cap.push([w.x,.48*s,w.z,.45*s,.35*s,.45*s,ry,r===1?0xa374e6:0xe0606f]); break;
        case 'crystal': L.crystal.push([w.x,.9*s,w.z,.35*s,1*s,.35*s,ry,ACC[r]]); L.crystal.push([w.x+.5*s,.5*s,w.z+.2*s,.2*s,.55*s,.2*s,ry+1,ACC[r]]); break;
        case 'rune': L.rune.push([w.x,.7*s,w.z,.55*s,1.4*s,.32*s,ry,0x4a4560]); break;
        case 'pillar': L.pillar.push([w.x,1.3*s,w.z,.32*s,2.6*s,.32*s,0,0xd9cfb4]); break;
        case 'lantern': L.pole.push([w.x,.9*s,w.z,.05,1.8*s,.05,0,0x3b3f52]); L.lamp.push([w.x,1.85*s,w.z,.2,.2,.2,0,0xfff3c4]); break;
        case 'flower': for(let i=0;i<4;i++) L.flower.push([w.x+(rnd()-.5)*1.4,.18,w.z+(rnd()-.5)*1.4,.13,.13,.13,0,[0xffd6e0,0xe6d2ff,0x9fd8ff,0xffe6a0,0xffffff][r]]); break;
      }
    }
    for(let k=0;k<900 && (L.trunk.length+L.crystal.length+L.rune.length+L.pillar.length+L.pole.length+L.flower.length/4)<520;k++){
      const x = 30+rnd()*3140, y = 40+rnd()*2120;
      if(pathPx.some(p=>(p.x-x)**2+(p.y-y)**2 < 90*90)) continue;
      if(POS.some(p=>(p[0]-x)**2+(p[1]-y)**2 < 150*150)) continue;
      if((SPAWN.x-x)**2+(SPAWN.y-y)**2 < 130*130) continue;
      const r = realmAtPx(x,y), ks = KINDS[r];
      add(ks[Math.floor(rnd()*ks.length)], x, y, r, .8+rnd()*.6);
    }
    for(let x=-20;x<=3220;x+=70){ add('pine', x+rnd()*30, -30-rnd()*60, realmAtPx(x,0), 1+rnd()*.5); add('pine', x+rnd()*30, 2230+rnd()*60, realmAtPx(x,2200), 1+rnd()*.5); }
    for(let y=-20;y<=2220;y+=70){ add('pine', -30-rnd()*60, y+rnd()*30, realmAtPx(0,y), 1+rnd()*.5); add('pine', 3230+rnd()*60, y+rnd()*30, realmAtPx(3200,y), 1+rnd()*.5); }
    const dummy = new T.Object3D(), cc = new T.Color();
    function inst(list, geo, material){
      if(!list.length) return;
      const im = new T.InstancedMesh(geo, material, list.length);
      list.forEach((d,i)=>{ dummy.position.set(d[0],d[1],d[2]); dummy.scale.set(d[3],d[4],d[5]); dummy.rotation.set(0,d[6],0); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); cc.set(d[7]); im.setColorAt(i, cc); });
      im.instanceMatrix.needsUpdate = true; if(im.instanceColor) im.instanceColor.needsUpdate = true;
      im.castShadow = !(material.transparent || material.isMeshBasicMaterial); im.receiveShadow = false;
      W.add(im);
    }
    const tw = ()=> new T.MeshToonMaterial({color:0xffffff, gradientMap:grad});
    inst(L.trunk, GEO.cyl, tw()); inst(L.canopy, GEO.ico, tw()); inst(L.cone, GEO.cone, tw());
    inst(L.stem, GEO.cyl, tw()); inst(L.cap, GEO.hemi, tw()); inst(L.rune, GEO.box, tw()); inst(L.pillar, GEO.cyl, tw()); inst(L.pole, GEO.cyl, tw());
    inst(L.crystal, GEO.oct, new T.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:.82}));
    inst(L.lamp, GEO.sph, new T.MeshBasicMaterial({color:0xffffff}));
    inst(L.flower, GEO.sph, new T.MeshBasicMaterial({color:0xffffff}));
  }
  // 螢火蟲
  const FF = 280, ffGeo = new T.BufferGeometry(), ffBase = new Float32Array(FF*3), ffPos = new Float32Array(FF*3);
  for(let i=0;i<FF;i++){ const w = toW(rnd()*3200, rnd()*2200); ffBase[i*3] = w.x; ffBase[i*3+1] = .6+rnd()*3; ffBase[i*3+2] = w.z; }
  ffPos.set(ffBase); ffGeo.setAttribute('position', new T.BufferAttribute(ffPos,3));
  const fireflies = new T.Points(ffGeo, new T.PointsMaterial({color:0xfff0a0, size:.45, map:DOT, transparent:true, depthWrite:false, blending:T.AdditiveBlending}));
  W.add(fireflies);

  // 祭壇＋魔物
  function markerTex(c){
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const x = cv.getContext('2d');
    const b = S.best[c.id]||0;
    x.fillStyle = 'rgba(4,10,24,.72)'; x.beginPath(); x.moveTo(30,8); x.lineTo(226,8); x.quadraticCurveTo(248,8,248,30); x.lineTo(248,98); x.quadraticCurveTo(248,120,226,120); x.lineTo(30,120); x.quadraticCurveTo(8,120,8,98); x.lineTo(8,30); x.quadraticCurveTo(8,8,30,8); x.fill();
    x.strokeStyle = b>=2 ? '#f3d28b' : '#e9e6ff'; x.lineWidth = 4; x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#ffffff'; x.font = 'bold 36px sans-serif'; x.fillText('第 ' + (c.idx+1) + ' 關', 128, 44);
    x.font = 'bold 40px sans-serif';
    for(let i=0;i<3;i++){ x.fillStyle = i<b ? '#f3d28b' : 'rgba(255,255,255,.22)'; x.fillText('★', 84+i*44, 92); }
    const t = new T.CanvasTexture(cv); return t;
  }
  const shrines = Q.chapters.map((c,i)=>{
    const w = toW(POS[i][0], POS[i][1]), a = REALM[c.realm].a, g = new T.Group(); g.position.set(w.x,0,w.z); W.add(g);
    P(g, GEO.cyl, mat(0x2a2f3a), 0,.17,0,[1.7,.34,1.7]);
    const ring = P(g, GEO.ring, glow(a,.85), 0,.38,0,1.4,{rx:Math.PI/2,ol:false});
    P(g, GEO.obel, mat(0x4b5163), 0,1.6,-.4,[.85,2.6,.85],{ry:Math.PI/4});
    P(g, GEO.sph, glow(a), 0,3.15,-.4,.22,{ol:false});
    const sprite = new T.Sprite(new T.SpriteMaterial({map:markerTex(c), transparent:true, depthWrite:false})); sprite.position.set(0,4.6,-.4); sprite.scale.set(3.2,1.6,1); g.add(sprite);
    const pillar = new T.Mesh(new T.CylinderGeometry(1,1,1,20,1,true), new T.MeshBasicMaterial({color:0xf3d28b, transparent:true, opacity:.16, depthWrite:false, blending:T.AdditiveBlending, side:T.DoubleSide}));
    pillar.scale.set(1.1,22,1.1); pillar.position.y = 11; g.add(pillar);
    g.traverse(o=>{ if(o.isMesh && o.material.isMeshToonMaterial){ o.castShadow = true; o.receiveShadow = true; } });
    const mon = makeMonster(monOf(c)); mon.ph = i; mon.g.position.set(w.x, 0, w.z+2.8); W.add(mon.g);
    return {c, g, w, ring, sprite, pillar, mon, best:-1};
  });
  function refreshShrines(){
    shrines.forEach(s=>{
      const b = S.best[s.c.id]||0;
      if(b!==s.best){ s.sprite.material.map.dispose(); s.sprite.material.map = markerTex(s.c); s.sprite.material.needsUpdate = true; s.best = b; }
      s.pillar.visible = b===3;
      s.mon.g.visible = b<2;
    });
  }

  // 隊伍
  const hero = {x:0, z:0, face:0, moving:false};
  { const sp = toW(SPAWN.x, SPAWN.y); hero.x = sp.x; hero.z = sp.z; }
  if(S.pos && isFinite(S.pos.x)){ const w = toW(Math.max(40,Math.min(3160,S.pos.x)), Math.max(40,Math.min(2160,S.pos.y))); hero.x = w.x; hero.z = w.z; }
  let chars = [], trail = [];
  function buildParty(){
    chars.forEach(c=>W.remove(c.g));
    chars = party().map(m=>{ const C = makeChar(m); W.add(C.g); C.x = hero.x; C.z = hero.z; C.g.position.set(hero.x,0,hero.z); return C; });
    trail = []; for(let i=0;i<120;i++) trail.push({x:hero.x, z:hero.z+i*.22});
    trail.reverse();
  }

  // ---------- 鏡頭與尺寸 ----------
  let vw = 800, vh = 500, active = true, visible = true;
  const camOff = new T.Vector3(0,15,15);
  function resize(){
    const r = $('game').getBoundingClientRect(); if(!r.width) return;
    vw = r.width; vh = r.height; renderer.setSize(vw, vh, false);
    wCam.aspect = vw/vh; wCam.updateProjectionMatrix();
    if(bCam){ bCam.aspect = vw/vh; bCam.updateProjectionMatrix(); placeBattleCam(); }
    camOff.set(0, vw<vh ? 17 : 12, vw<vh ? 16.5 : 12.5);
    const m = $('mini'), mr = m.getBoundingClientRect(); m.width = Math.round(mr.width*1.5); m.height = Math.round(mr.height*1.5);
  }
  if(window.ResizeObserver) new ResizeObserver(resize).observe($('game')); else addEventListener('resize', resize);
  if(window.IntersectionObserver) new IntersectionObserver(es=>{ visible = es[0].isIntersecting; }).observe($('game'));

  // ---------- 對話框 ----------
  const dlg = $('dialog'), dtxt = $('dtxt'); let dq = [], dTimer = null;
  function say(text, who, ms){ $('who').textContent = who || '露米'; dtxt.innerHTML = text; dlg.classList.remove('hidden'); idle = 0; clearTimeout(dTimer); dTimer = setTimeout(nextLine, ms || 5200); }
  function nextLine(){ clearTimeout(dTimer); if(dq.length){ const l = dq.shift(); say(l[0], l[1], l[2]); } else dlg.classList.add('hidden'); }
  function sayMany(lines){ dq = lines.slice(1); say(lines[0][0], lines[0][1], lines[0][2]); }
  dlg.addEventListener('click', nextLine);

  // ---------- 大地圖更新 ----------
  const keys = {}; let target = null, autoEngage = null, near = null, lastNear = null, curRealm = -1, idle = 0, saveT = 0, T0 = 0;
  const SPEED = 8.5;
  const nextUndone = () => shrines.find(s=>(S.best[s.c.id]||0)<2) || shrines.find(s=>(S.best[s.c.id]||0)<3);
  function updateWorld(dt){
    let dx = 0, dz = 0;
    if(keys.l) dx--; if(keys.r) dx++; if(keys.u) dz--; if(keys.d) dz++;
    if(dx||dz){ target = null; autoEngage = null; }
    else if(target){
      const vx = target.x-hero.x, vz = target.z-hero.z, d = Math.hypot(vx,vz);
      if(d<.25){ target = null; if(autoEngage){ const s = autoEngage; autoEngage = null; engage(s.c); return; } }
      else { dx = vx/d; dz = vz/d; }
    }
    const m = Math.hypot(dx,dz); hero.moving = m>0;
    if(m){
      dx/=m; dz/=m;
      hero.x = Math.max(-78,Math.min(78, hero.x+dx*SPEED*dt)); hero.z = Math.max(-52,Math.min(54, hero.z+dz*SPEED*dt));
      hero.face = Math.atan2(dx,dz); idle = 0;
      const lt = trail[trail.length-1]; if(Math.hypot(hero.x-lt.x, hero.z-lt.z)>.22){ trail.push({x:hero.x, z:hero.z}); if(trail.length>400) trail.shift(); }
    } else idle += dt;
    // 隊伍
    chars.forEach((C,i)=>{
      let tx, tz;
      if(i===0){ tx = hero.x; tz = hero.z; }
      else { const p = trail[Math.max(0, trail.length-1-i*6)]; tx = p.x; tz = p.z; }
      const ddx = tx-C.x, ddz = tz-C.z, d = Math.hypot(ddx,ddz);
      const mv = i===0 ? hero.moving : d>.05;
      if(i===0){ C.x = tx; C.z = tz; } else { const k = Math.min(1, dt*10); C.x += ddx*k; C.z += ddz*k; }
      if(i===0) C.face = hero.face; else if(d>.05) C.face = Math.atan2(ddx,ddz);
      C.g.position.set(C.x, 0, C.z);
      let dr = (C.face||0) - C.g.rotation.y; while(dr>Math.PI) dr -= Math.PI*2; while(dr<-Math.PI) dr += Math.PI*2;
      C.g.rotation.y += dr*Math.min(1, dt*12);
      animChar(C, T0 + i*.7, mv);
    });
    // 鏡頭
    const want = new T.Vector3(hero.x, 0, hero.z).add(camOff);
    wCam.position.lerp(want, Math.min(1, dt*5));
    wCam.lookAt(wCam.position.x - camOff.x, 1, wCam.position.z - camOff.z);
    sun.position.set(hero.x+18, 42, hero.z+16); sun.target.position.set(hero.x, 0, hero.z);
    // 魔物與祭壇
    shrines.forEach(s=>{
      const d = Math.hypot(s.w.x-hero.x, s.w.z-hero.z);
      if(d<40 && s.mon.g.visible){ animMonster(s.mon, T0); s.mon.g.rotation.y = Math.atan2(hero.x-s.mon.g.position.x, hero.z-s.mon.g.position.z)*.6; }
      s.ring.material.opacity = .5 + .35*Math.sin(T0*2.2+s.c.idx);
    });
    near = null; let nd = 4.2;
    shrines.forEach(s=>{ const d = Math.hypot(s.w.x-hero.x, s.w.z+2.2-hero.z); if(d<nd){ nd = d; near = s; } });
    if(near!==lastNear){
      lastNear = near; const pr = $('prompt');
      if(near){
        const b = S.best[near.c.id]||0, mo = monOf(near.c);
        pr.textContent = (b>=2 ? `再戰「${mo.name}」` : `挑戰「${mo.name}」`) + '（E）'; pr.classList.remove('hidden');
        say(b>=2 ? `這裡的「${mo.name}」已經被你打倒過了（${b} 星）。想重新挑戰拿更多星星也可以喔！` :
            `小心！<b>${mo.boss?'頭目・':''}${mo.name}</b>盤據在「${near.c.stage}」。牠考的是〈${near.c.title}〉，準備好就按 <b>E</b>！`, '露米', 5600);
      } else pr.classList.add('hidden');
    }
    // 名牌
    let lh = '';
    shrines.forEach(s=>{
      const d = Math.hypot(s.w.x-hero.x, s.w.z-hero.z); if(d>16) return;
      const v = new T.Vector3(s.w.x, 0, s.w.z+2.8).project(wCam); if(v.z>1) return;
      const x = (v.x+1)/2*vw, y = (1-v.y)/2*vh + 26;
      const mo = monOf(s.c);
      lh += `<div class="label" style="left:${x}px;top:${y+22}px">${s.c.stage}${s.mon.g.visible?` <small>· ${mo.boss?'頭目 ':''}${mo.name}</small>`:''}</div>`;
    });
    $('labels').innerHTML = lh;
    // 進入新秘境
    let rb = 0, rd = 1e12; shrines.forEach(s=>{ const d = (s.w.x-hero.x)**2+(s.w.z-hero.z)**2; if(d<rd){ rd = d; rb = s.c.realm; } });
    if(rb!==curRealm){ curRealm = rb; const tt = $('toast'); tt.querySelector('.rn').textContent = Q.realms[rb].name; tt.querySelector('.rd').textContent = Q.realms[rb].desc; tt.classList.add('show'); clearTimeout(tt._t); tt._t = setTimeout(()=>tt.classList.remove('show'), 2600); }
    // 螢火蟲、路燈
    for(let i=0;i<FF;i++){ ffPos[i*3] = ffBase[i*3] + Math.sin(T0*.5+i)*1.2; ffPos[i*3+1] = ffBase[i*3+1] + Math.sin(T0*1.3+i*1.7)*.5; ffPos[i*3+2] = ffBase[i*3+2] + Math.cos(T0*.4+i*.9)*1.2; }
    ffGeo.attributes.position.needsUpdate = true;
    fireflies.material.opacity = .6 + .3*Math.sin(T0*2);
    pathDots.material.opacity = .4 + .25*Math.sin(T0*1.6);
    // 閒聊
    if(idle>24){ idle = 0; const n = nextUndone(); const tips = [
      n ? `下一隻要打倒的是「${monOf(n.c).name}」，在「${n.c.stage}」。點上面「前往下一隻魔物」我帶路！` : '所有魔物都被你打倒了，真正的大賢者！',
      '答錯也沒關係，戰鬥裡可以點「回指南複習」，看完再回來挑戰。',
      '擊敗越多魔物，就會有越多夥伴加入隊伍喔。',
      '金色光柱代表那座祭壇已經三星完美通關。',
      '右上角的小地圖可以直接點，我們會走過去。' ];
      say(tips[Math.floor(Math.random()*tips.length)], '露米', 5600); }
    saveT += dt; if(saveT>3){ saveT = 0; S.pos = {x:Math.round((hero.x+OX)*PX), y:Math.round((hero.z+OZ)*PX)}; save(); }
  }
  function drawMini(){
    const m = $('mini'), x = m.getContext('2d'), w = m.width, h = m.height, sx = w/3200, sy = h/2200;
    x.clearRect(0,0,w,h);
    REALM.forEach(r=>{ const g = x.createRadialGradient(r.x*sx,r.y*sy,0,r.x*sx,r.y*sy,700*sx); g.addColorStop(0,'#'+new T.Color(r.g).getHexString()); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0,0,w,h); });
    x.strokeStyle = 'rgba(243,210,139,.5)'; x.lineWidth = 1.5; x.beginPath(); pathPx.forEach((p,i)=> i ? x.lineTo(p.x*sx,p.y*sy) : x.moveTo(p.x*sx,p.y*sy)); x.stroke();
    shrines.forEach(s=>{ const b = S.best[s.c.id]||0; x.fillStyle = b===3 ? '#f3d28b' : (b>=2 ? '#8fe3b8' : (monOf(s.c).boss ? '#ff6b7f' : 'rgba(255,255,255,.55)')); x.beginPath(); x.arc(POS[s.c.idx][0]*sx, POS[s.c.idx][1]*sy, monOf(s.c).boss?3.6:2.6, 0, 6.283); x.fill(); });
    x.fillStyle = '#fff'; x.beginPath(); x.arc((hero.x+OX)*PX*sx, (hero.z+OZ)*PX*sy, 3.4, 0, 6.283); x.fill();
  }

  // ---------- 輸入（大地圖） ----------
  const ray = new T.Raycaster(), ground = new T.Plane(new T.Vector3(0,1,0), 0), hitV = new T.Vector3();
  canvas.addEventListener('pointerdown', e=>{
    Sfx.wake();
    if(state!=='world') return;
    canvas.focus({preventScroll:true});
    const r = canvas.getBoundingClientRect(), mx = e.clientX-r.left, my = e.clientY-r.top;
    let best = null, bd = 70;
    shrines.forEach(s=>{ const v = new T.Vector3(s.w.x, 1.2, s.w.z+1.4).project(wCam); const sx = (v.x+1)/2*vw, sy = (1-v.y)/2*vh, d = Math.hypot(sx-mx, sy-my); if(d<bd && v.z<1){ bd = d; best = s; } });
    if(best){
      if(Math.hypot(best.w.x-hero.x, best.w.z+2.2-hero.z)<4.2) return engage(best.c);
      target = {x:best.w.x, z:best.w.z+4.6}; autoEngage = best; return;
    }
    ray.setFromCamera({x:mx/vw*2-1, y:-(my/vh)*2+1}, wCam);
    if(ray.ray.intersectPlane(ground, hitV)){ target = {x:Math.max(-78,Math.min(78,hitV.x)), z:Math.max(-52,Math.min(54,hitV.z))}; autoEngage = null; }
  });
  $('mini').addEventListener('pointerdown', e=>{
    e.stopPropagation(); if(state!=='world') return;
    const r = e.currentTarget.getBoundingClientRect(), w = toW((e.clientX-r.left)/r.width*3200, (e.clientY-r.top)/r.height*2200);
    target = {x:w.x, z:w.z}; autoEngage = null;
  });
  $('prompt').addEventListener('click', ()=>{ if(near) engage(near.c); });
  const KM = {ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r',ArrowUp:'u',w:'u',W:'u',ArrowDown:'d',s:'d',S:'d'};
  function inView(){ const r = $('game').getBoundingClientRect(); return active && r.bottom>80 && r.top<innerHeight-80; }
  document.addEventListener('keydown', e=>{
    if(e.metaKey||e.ctrlKey||e.altKey||!inView()) return;
    if(document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if(state==='battle') return battleKey(e);
    if(state!=='world') return;
    if(KM[e.key]){ keys[KM[e.key]] = true; if(e.key.startsWith('Arrow')) e.preventDefault(); return; }
    if((e.key==='e'||e.key==='E'||e.key==='Enter') && near && document.activeElement.tagName!=='BUTTON'){ e.preventDefault(); engage(near.c); }
  });
  document.addEventListener('keyup', e=>{ if(KM[e.key]) keys[KM[e.key]] = false; });
  window.addEventListener('blur', ()=>{ for(const k in keys) keys[k] = false; });

  // =====================================================================
  // 戰鬥
  // =====================================================================
  let state = 'world', bScene = null, bCam = null, B = null;
  const tweens = [];
  function tween(ms, fn){ return new Promise(res=>{ tweens.push({t:0, d:reduce?Math.min(ms,60):ms, fn, res}); }); }
  function updTweens(dt){ for(let i=tweens.length-1;i>=0;i--){ const w = tweens[i]; w.t += dt*1000; const k = Math.min(1, w.t/w.d); w.fn(k); if(k>=1){ tweens.splice(i,1); w.res(); } } }
  const ease = k => k<.5 ? 2*k*k : 1-Math.pow(-2*k+2,2)/2;

  function skyTex(top, bottom){
    const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d');
    const g = x.createLinearGradient(0,0,0,256); g.addColorStop(0,top); g.addColorStop(.55,bottom); g.addColorStop(1,'#05080f'); x.fillStyle = g; x.fillRect(0,0,4,256);
    return new T.CanvasTexture(c);
  }
  function placeBattleCam(){ if(!bCam) return; if(vw<vh){ bCam.position.set(.6,6.5,16.5); } else { bCam.position.set(1.2,4.6,11.2); } bCam.lookAt(.2,1.3,0); if(camBase){ camBase.p = bCam.position.clone(); camLook.set(.2,1.3,0); } }
  function buildBattle(realm, monSpec){
    bScene = new T.Scene(); const rc = REALM[realm];
    bScene.background = new T.Color(0x070d18); bScene.fog = new T.Fog(0x070d18, 22, 60);
    bScene.add(new T.HemisphereLight(0xdfe8ff, 0x1a2a20, .85));
    const d = new T.DirectionalLight(0xfff0d0, .8); d.position.set(6,16,9); bScene.add(d);
    d.castShadow = true; d.shadow.mapSize.set(2048,2048); d.shadow.bias = -0.0008; d.shadow.normalBias = .02;
    Object.assign(d.shadow.camera, {left:-12, right:12, top:12, bottom:-12, near:1, far:50}); d.shadow.camera.updateProjectionMatrix();
    bScene.add(new T.AmbientLight(0xffffff,.12));
    const rim = new T.DirectionalLight(new T.Color(rc.a), .45); rim.position.set(-8,6,-10); bScene.add(rim);
    const sky = new T.Mesh(new T.SphereGeometry(55,24,16), new T.MeshBasicMaterial({map:skyTex('#'+new T.Color(rc.a).multiplyScalar(.35).getHexString(), '#'+new T.Color(rc.g).multiplyScalar(.6).getHexString()), side:T.BackSide, fog:false}));
    bScene.add(sky);
    P(bScene, GEO.cyl, mat(new T.Color(rc.g).offsetHSL(0,0,.04).getHex()), 0,-.2,0,[17,.4,17],{ol:false}).receiveShadow = true;
    P(bScene, GEO.ring, glow(rc.a,.35), 0,.03,0,7,{rx:Math.PI/2,ol:false});
    // 背景景物
    for(let i=0;i<18;i++){
      const a = Math.PI*.95 + i/18*Math.PI*1.15, r = 10 + (i%3)*2.4, x = Math.cos(a)*r, z = Math.sin(a)*r*.75 - 2;
      if(z>3) continue;
      const s = .9 + (i%4)*.18;
      if(realm===1 || (realm===2 && i%3===0)) P(bScene, GEO.oct, glow(rc.a,.8), x,1.2*s,z,[.5*s,1.3*s,.5*s],{ry:i,ol:false});
      else if(realm===2) { P(bScene, GEO.cone, mat(0x2f6a9a), x,1.8*s,z,[1.1*s,2.4*s,1.1*s]); }
      else if(realm===3 && i%2) P(bScene, GEO.cyl, mat(0xd9cfb4), x,1.5*s,z,[.35*s,3*s,.35*s]);
      else { P(bScene, GEO.cyl, mat(0x4a3424), x,.8*s,z,[.22*s,1.6*s,.22*s]); P(bScene, GEO.ico, mat([0x2f8a62,0x5b4a9a,0x2f6a9a,0xa8862e,0x8a93b8][realm]), x,2.3*s,z,1.3*s); }
    }
    const bp = new T.BufferGeometry(), bpv = []; for(let i=0;i<120;i++) bpv.push((Math.random()-.5)*30, Math.random()*8, (Math.random()-.5)*20-4);
    bp.setAttribute('position', new T.Float32BufferAttribute(bpv,3));
    bScene.add(new T.Points(bp, new T.PointsMaterial({color:rc.a, size:.35, map:DOT, transparent:true, depthWrite:false, blending:T.AdditiveBlending, opacity:.7})));
    bCam = new T.PerspectiveCamera(45, vw/vh, .1, 200); placeBattleCam();
    // 魔物
    const M = makeMonster(monSpec); M.g.position.set(-3.6,0,-.4); M.g.rotation.y = Math.PI/2 - .45; bScene.add(M.g); M.home = M.g.position.clone(); M.battle = true;
    // 隊伍
    const ms = party().map(m=>({m, C:makeChar(m), hp:m.hp, max:m.hp, down:false}));
    const n = ms.length, front = Math.min(4, n), back = n-front;
    ms.forEach((u,i)=>{
      const row = i<front ? 0 : 1, k = row ? i-front : i, cnt = row ? back : front;
      const z = (k-(cnt-1)/2)*1.45 + (row?.5:0), x = 2.4 + row*1.7 + Math.abs(z)*.12;
      u.C.g.position.set(x,0,z); u.C.g.rotation.y = -Math.PI/2 + .45; u.home = u.C.g.position.clone(); u.C.battle = true; bScene.add(u.C.g);
    });
    camBase = {p:bCam.position.clone(), l:new T.Vector3(.2,1.3,0)};
    return {M, ms};
  }
  // 鏡頭特寫：移到 from/look 之間，再回原位
  let camBase = null, camLook = new T.Vector3(.2,1.3,0);
  function camTo(pos, look, ms){
    const p0 = bCam.position.clone(), l0 = camLook.clone();
    return tween(ms, k=>{ const e = ease(k); bCam.position.lerpVectors(p0, pos, e); camLook.lerpVectors(l0, look, e); bCam.lookAt(camLook); });
  }
  function camFocus(pt, ms){
    if(!camBase) return Promise.resolve();
    const dir = camBase.p.clone().sub(pt).normalize();
    return camTo(pt.clone().add(dir.multiplyScalar(vw<vh?9:6.5)).add(new T.Vector3(0,.6,0)), pt.clone().add(new T.Vector3(0,.4,0)), ms||320);
  }
  function camHome(ms){ return camBase ? camTo(camBase.p, camBase.l, ms||380) : Promise.resolve(); }
  function shake(amt){ if(reduce || !bCam) return; const p = bCam.position.clone(); tween(220, k=>{ bCam.position.set(p.x+(Math.random()-.5)*amt*(1-k), p.y+(Math.random()-.5)*amt*(1-k), p.z); }).then(()=>bCam.position.copy(p)); }

  // UI 小工具
  const bMain = $('bMain');
  function partyHUD(){
    $('bParty').innerHTML = B.ms.map(u=>`<div class="pm${u.down?' down':''}${B.guard&&u===B.ms.find(x=>x.m.id==='gren'||x.m.id==='leo')?' shield':''}"><span class="nm">${u.m.id==='hero'?'你':u.m.name}<small>${u.hp}/${u.max}</small></span><span class="hp"><i style="width:${u.hp/u.max*100}%"></i></span></div>`).join('');
  }
  function monHUD(){ $('bName').innerHTML = `${B.mon.boss?'【頭目】':''}${B.spec.name}<small>HP ${Math.ceil(B.h*B.maxHp)}/${B.maxHp}</small>`; $('bHp').style.width = (B.h*100)+'%'; }
  function popAt(pos, text, cls){
    const v = pos.clone().project(bCam), x = (v.x+1)/2*vw, y = (1-v.y)/2*vh;
    const el = document.createElement('div'); el.className = 'dmg ' + (cls||''); el.textContent = text; el.style.left = x+'px'; el.style.top = y+'px';
    $('dmgLayer').appendChild(el); setTimeout(()=>el.remove(), 1050);
  }
  let waiter = null;
  function msg(html, auto){
    return new Promise(res=>{
      bMain.innerHTML = `<div class="msg">${html}${auto?'':'<span class="cont">▼</span>'}</div>`;
      const done = ()=>{ if(waiter!==done) return; waiter = null; bMain.onclick = null; res(); };
      waiter = done;
      if(auto) setTimeout(done, reduce?250:auto); else bMain.onclick = (e)=>{ if(e.target.tagName!=='A') done(); };
    });
  }
  function menu(items, title){
    return new Promise(res=>{
      waiter = null;
      bMain.innerHTML = (title?`<div class="qhead"><span>${title}</span></div>`:'') + items.map((it,i)=>`<button class="sel" data-i="${i}" ${it.disabled?'disabled':''}>${it.label}${it.desc?`<span class="d">${it.desc}</span>`:''}</button>`).join('');
      bMain.querySelectorAll('button.sel').forEach(b=>b.addEventListener('click',()=>{ Sfx.play('sel'); res(items[+b.dataset.i].value); }));
      const f = bMain.querySelector('button.sel:not(:disabled)'); if(f) f.focus({preventScroll:true});
    });
  }
  function battleKey(e){
    const k = e.key;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k)){
      e.preventDefault();
      const bs = [...bMain.querySelectorAll('button.sel:not(:disabled)')]; if(!bs.length) return;
      let i = bs.indexOf(document.activeElement); i = (k==='ArrowUp'||k==='ArrowLeft') ? (i<=0?bs.length-1:i-1) : (i+1)%bs.length;
      bs[i].focus({preventScroll:true}); Sfx.play('sel'); return;
    }
    if(['Enter',' ','e','E','z','Z'].includes(k)){
      if(waiter){ e.preventDefault(); waiter(); return; }
      const f = document.activeElement; if(f && bMain.contains(f) && f.tagName==='BUTTON'){ e.preventDefault(); f.click(); }
      return;
    }
    const n = {'1':0,'2':1,'3':2,'4':3}[k];
    if(n!==undefined){ const o = bMain.querySelectorAll('.opts button.sel')[n]; if(o && !o.disabled){ e.preventDefault(); o.click(); } }
  }

  // 特效
  function burst(pos, color, n, spread){
    const g = new T.BufferGeometry(), p = new Float32Array(n*3), v = [];
    for(let i=0;i<n;i++){ p[i*3]=pos.x; p[i*3+1]=pos.y; p[i*3+2]=pos.z; const a = Math.random()*6.28, b = Math.random()*3.14; v.push([Math.cos(a)*Math.sin(b), Math.cos(b)*.8+.4, Math.sin(a)*Math.sin(b)]); }
    g.setAttribute('position', new T.BufferAttribute(p,3));
    const m = new T.PointsMaterial({color, size:.4, map:DOT, transparent:true, depthWrite:false, blending:T.AdditiveBlending});
    const pts = new T.Points(g, m); bScene.add(pts);
    return tween(560, k=>{ for(let i=0;i<n;i++){ p[i*3]=pos.x+v[i][0]*k*spread; p[i*3+1]=pos.y+v[i][1]*k*spread - k*k*.6; p[i*3+2]=pos.z+v[i][2]*k*spread; } g.attributes.position.needsUpdate = true; m.opacity = 1-k; }).then(()=>{ bScene.remove(pts); g.dispose(); m.dispose(); });
  }
  function projectile(from, to, color, size){
    const s = new T.Mesh(GEO.sph, glow(color)); s.scale.setScalar(size||.18); bScene.add(s);
    const h = new T.Mesh(GEO.sph, new T.MeshBasicMaterial({color, transparent:true, opacity:.35, blending:T.AdditiveBlending, depthWrite:false})); h.scale.setScalar(2.2); s.add(h);
    return tween(300, k=>{ s.position.lerpVectors(from, to, k); s.position.y += Math.sin(k*Math.PI)*1.1; }).then(()=>bScene.remove(s));
  }
  const monCenter = () => B.mon.g.position.clone().add(new T.Vector3(0, (B.mon.top*.55+B.mon.float)*(B.mon.boss?1.5:1), 0));
  async function hitMon(dmg, crit, color){
    Sfx.play(crit?'crit':'hit');
    flashMon(B.mon, true); const c = monCenter();
    burst(c, color||0xffffff, crit?36:18, crit?2.4:1.5);
    popAt(c.clone().add(new T.Vector3((Math.random()-.5)*.8, .4, 0)), crit?`${dmg}！會心一擊`:String(dmg), crit?'crit':'');
    if(crit || B.mon.boss) shake(crit?.35:.15);
    if(B.mon.gl && B.h>.07){ B.mon.lock = true; const d = onceAnim(B.mon, Math.random()<.5?'Hit_A':'Hit_B', {speed:1.3}); setTimeout(()=>{ if(B && B.mon.lock && B.mon.cur && B.mon.cur.startsWith('Hit')) B.mon.lock = false; }, d*1000); }
    const h0 = B.mon.home.x;
    await tween(160, k=>{ B.mon.g.position.x = h0 - Math.sin(k*Math.PI*4)*.18*(1-k); });
    flashMon(B.mon, false); monHUD();
  }
  // Q 版模型的攻擊：跑過去 → 播攻擊動作 → 命中 → 跑回來；遠程則原地施法
  async function glMemberAttack(u, dmg, crit, quick){
    const C = u.C, home = u.home, mc = monCenter(), sp = quick ? 1.5 : 1.15;
    C.lock = true;
    if(u.m.style==='melee'){
      const dest = new T.Vector3(B.mon.home.x + 1.7*(B.mon.boss?1.4:1), 0, B.mon.home.z + (Math.random()-.5)*.5);
      loopAnim(C, 'Running_A', .1);
      await tween(260/sp, k=>{ C.g.position.lerpVectors(home, dest, ease(k)); });
      const d = onceAnim(C, C.atkAnim || '1H_Melee_Attack_Slice_Diagonal', {speed:sp});
      await tween(d*1000*.42, ()=>{});
      await hitMon(dmg, crit, u.m.fx);
      await tween(Math.max(60, d*1000*.4), ()=>{});
      loopAnim(C, 'Running_A', .1); const r0 = C.g.rotation.y; C.g.rotation.y = r0 + Math.PI;
      await tween(240/sp, k=>{ C.g.position.lerpVectors(dest, home, ease(k)); });
      C.g.rotation.y = r0; C.g.position.copy(home);
    } else {
      const d = onceAnim(C, C.atkAnim || 'Spellcast_Shoot', {speed:sp});
      await tween(d*1000*.38, ()=>{});
      const from = C.g.position.clone().add(new T.Vector3(-.5, 1.2, 0));
      await projectile(from, mc, u.m.fx, u.m.id==='kia'?.12:.2);
      await hitMon(dmg, crit, u.m.fx);
    }
    C.lock = false;
  }
  async function memberAttack(u, dmg, crit, quick){
    if(u.C.gl) return glMemberAttack(u, dmg, crit, quick);
    const C = u.C, home = u.home, mc = monCenter(), dur = quick ? .6 : 1;
    if(u.m.style==='melee'){
      const dest = new T.Vector3(B.mon.home.x + 1.9*(B.mon.boss?1.3:1), 0, B.mon.home.z + (Math.random()-.5)*.6);
      C.armLock = true;
      await tween(210*dur, k=>{ C.g.position.lerpVectors(home, dest, ease(k)); C.g.position.y = Math.sin(k*Math.PI)*.6; animChar(C, T0, true); });
      await tween(110*dur, k=>{ if(C.arms[1]) C.arms[1].rotation.x = -2.4 + k*3.4; });
      await hitMon(dmg, crit, u.m.fx);
      await tween(200*dur, k=>{ C.g.position.lerpVectors(dest, home, ease(k)); animChar(C, T0, true); });
      C.g.position.copy(home); C.armLock = false;
    } else {
      C.armLock = true;
      await tween(140*dur, k=>{ C.g.position.y = Math.sin(k*Math.PI)*.4; if(C.arms[1]) C.arms[1].rotation.x = -2.2*k; });
      const from = C.g.position.clone().add(new T.Vector3(-.3, 1.3*C.k, 0));
      await projectile(from, mc, u.m.fx, u.m.id==='kia'?.12:.2);
      if(C.arms[1]) C.arms[1].rotation.x = 0; C.armLock = false; C.g.position.y = 0;
      await hitMon(dmg, crit, u.m.fx);
    }
  }
  async function partyAttack(frac, crit){
    const alive = B.ms.filter(u=>!u.down), total = Math.max(1, Math.round(frac*B.maxHp*(crit?1.5:1)));
    const w = alive.map(()=>.7+Math.random()*.6), ws = w.reduce((a,b)=>a+b,0);
    const quick = alive.length>4;
    await camFocus(monCenter().add(new T.Vector3(1.6,0,0)), 300);
    for(let i=0;i<alive.length;i++){
      const dmg = Math.max(1, Math.round(total*w[i]/ws));
      B.h = Math.max(.06, B.h - dmg/B.maxHp);
      await memberAttack(alive[i], dmg, crit && i===alive.length-1, quick);
    }
    await camHome(320);
  }
  function hurtAnim(u, dead){
    const C = u.C; if(!C.gl) return;
    C.lock = true;
    if(dead){ onceAnim(C, 'Death_A', {clamp:true}); return; }
    const d = onceAnim(C, 'Hit_A', {speed:1.2}); setTimeout(()=>{ if(!u.down) C.lock = false; }, d*1000);
  }
  async function monsterAttack(){
    const alive = B.ms.filter(u=>!u.down); if(!alive.length) return;
    const u = alive[Math.floor(Math.random()*Math.min(alive.length,4))], M = B.mon;
    const top = u.home.clone().add(new T.Vector3(0, 1.6*u.C.k, 0));
    await camFocus(u.home.clone().add(new T.Vector3(-1.2,1,0)), 300);
    let dest = null;
    if(M.gl){
      M.lock = true;
      if(M.ranged){
        const d = onceAnim(M, M.atkAnim, {speed:1.1}); await tween(d*1000*.4, ()=>{});
        await projectile(monCenter(), top, M.ranged, .22);
      } else {
        dest = u.home.clone().add(new T.Vector3(-1.7*(M.boss?1.4:1), 0, 0));
        loopAnim(M, 'Running_A', .1);
        await tween(280, k=>{ M.g.position.lerpVectors(M.home, dest, ease(k)); });
        const d = onceAnim(M, M.atkAnim || '1H_Melee_Attack_Chop', {speed:1.15}); await tween(d*1000*.42, ()=>{});
      }
    } else {
      dest = u.home.clone().add(new T.Vector3(-1.8*(M.boss?1.3:1), 0, 0));
      await tween(260, k=>{ M.g.position.lerpVectors(M.home, dest, ease(k)); M.g.position.y = Math.sin(k*Math.PI)*.8; });
    }
    if(B.guard){
      B.guard = false; Sfx.play('guard'); burst(top, 0xb8e08a, 24, 1.6); popAt(top, '守護！完全擋下', 'heal txt');
      if(u.C.gl){ u.C.lock = true; const d = onceAnim(u.C, 'Block_Hit'); setTimeout(()=>{ u.C.lock = false; }, d*1000); }
    } else {
      const dmg = Math.round(u.max*(.2+Math.random()*.12)*(M.boss?1.3:1));
      u.hp = Math.max(0, u.hp-dmg); Sfx.play('hurt'); burst(top, 0xff6b7f, 18, 1.3); popAt(top, String(dmg), 'hurt'); shake(.2);
      hurtAnim(u, u.hp<=0);
      const h = u.home.clone();
      await tween(220, k=>{ u.C.g.position.x = h.x + Math.sin(k*Math.PI*5)*.15*(1-k); });
      if(u.hp<=0){ u.down = true; popAt(top, `${u.m.id==='hero'?'你':u.m.name}倒下了`, 'hurt txt'); if(!u.C.gl) await tween(200, k=>{ u.C.g.rotation.z = -k*1.3; }); }
    }
    partyHUD();
    if(dest){
      if(M.gl){ loopAnim(M, 'Running_A', .1); const r0 = M.g.rotation.y; M.g.rotation.y = r0 + Math.PI; await tween(260, k=>{ M.g.position.lerpVectors(dest, M.home, ease(k)); }); M.g.rotation.y = r0; }
      else await tween(240, k=>{ M.g.position.lerpVectors(dest, M.home, ease(k)); M.g.position.y = 0; });
    }
    M.g.position.copy(M.home); M.lock = false;
    await camHome(300);
  }
  async function finisher(){
    $('bMain').innerHTML = '<div class="msg">全員合擊！</div>';
    const alive = B.ms.filter(u=>!u.down), mc = monCenter();
    alive.forEach(u=>{ u.C.armLock = true; if(u.C.arms[1]) u.C.arms[1].rotation.x = -2.6; if(u.C.gl){ u.C.lock = true; onceAnim(u.C, u.m.style==='melee' ? 'Jump_Full_Short' : 'Spellcast_Long'); } });
    await tween(260, k=>{ alive.forEach(u=>{ if(!u.C.gl) u.C.g.position.y = Math.sin(k*Math.PI)*.8; }); });
    await Promise.all(alive.map(u=>projectile(u.C.g.position.clone().add(new T.Vector3(-.3,1.3*u.C.k,0)), mc, u.m.fx, .22)));
    Sfx.play('boom'); flashMon(B.mon, true); burst(mc, 0xffffff, 80, 4); burst(mc, 0xf3d28b, 60, 3); shake(.5);
    B.h = 0; monHUD();
    if(B.mon.gl){
      flashMon(B.mon, false); B.mon.lock = true; const d = onceAnim(B.mon, 'Death_A', {clamp:true});
      await tween(d*1000, ()=>{});
      B.mon.g.traverse(o=>{ if(o.userData.outline) o.visible = false; });
      burst(mc, 0xc9a7ff, 40, 2.2);
      await tween(500, k=>{ B.mon.g.position.y = -k*.6; B.mon.mats.forEach(m=>{ m.transparent = true; m.opacity = 1-k; }); });
    } else {
      const s0 = B.mon.g.scale.x;
      await tween(700, k=>{ B.mon.g.scale.setScalar(s0*(1-k)); B.mon.g.rotation.y += .25; B.mon.g.position.y = k*1.2; });
    }
    B.mon.g.visible = false;
    alive.forEach(u=>{ u.C.armLock = false; u.C.g.position.y = 0; if(u.C.gl){ u.C.lock = true; loopAnim(u.C, 'Cheer', .25); } });
  }
  async function skillFx(u, color, text){
    const top = u.C.g.position.clone().add(new T.Vector3(0,1.8*u.C.k,0));
    if(u.C.gl){ u.C.lock = true; const d = onceAnim(u.C, u.m.id==='gren' ? 'Block' : (u.m.id==='popo' ? 'Use_Item' : 'Spellcast_Long')); setTimeout(()=>{ if(!u.down) u.C.lock = false; }, d*1000); await tween(Math.min(600, d*500), ()=>{}); }
    else await tween(180, k=>{ u.C.g.position.y = Math.sin(k*Math.PI)*.5; });
    burst(top, color, 30, 1.8); popAt(top, text, 'heal txt');
  }

  async function ask(item, qi, n){
    const q = item.q, order = shuffle([0,1,2,3]); let hintLeft = B.hint;
    const lumi = B.ms.find(u=>u.m.id==='lumi'&&!u.down), mor = B.ms.find(u=>u.m.id==='mor'&&!u.down);
    return new Promise(res=>{
      waiter = null;
      bMain.innerHTML = `<div class="qhead"><span>第 ${qi+1} / ${n} 題${item.c && B.mode==='random' ? ` · 出自〈${item.c.title}〉`:''}</span><span>按 1–4 或點選答案</span></div>
        <div class="qtext">${q.q}</div>
        <div class="opts">${order.map((oi,k)=>`<button class="sel" data-oi="${oi}"><span class="rn">${RUNES[k]}</span>${q.options[oi]}</button>`).join('')}</div>
        <div class="qtools">${lumi?`<button id="tHint" ${hintLeft?'':'disabled'}>露米・精靈之光（剩 ${hintLeft} 次）</button>`:''}${mor?'<button id="tRead">墨爾・符文解讀（開啟原文）</button>':''}</div>`;
      const bs = [...bMain.querySelectorAll('.opts button.sel')];
      bs[0].focus({preventScroll:true});
      bs.forEach(b=>b.addEventListener('click',()=>{
        if(b.disabled) return;
        const good = +b.dataset.oi===q.answer;
        bs.forEach(x=>{ x.disabled = true; if(+x.dataset.oi===q.answer) x.classList.add('right'); else if(x===b) x.classList.add('wrong'); });
        Sfx.play(good?'ok':'no');
        setTimeout(()=>res({good, right:q.options[q.answer]}), reduce?100:650);
      }));
      const th = $('tHint');
      if(th) th.addEventListener('click',()=>{
        if(!B.hint) return; B.hint--; th.disabled = true; th.textContent = '露米・精靈之光（已使用）';
        const wrong = bs.filter(b=>+b.dataset.oi!==q.answer && !b.disabled); const pick = wrong[Math.floor(Math.random()*wrong.length)];
        pick.disabled = true; pick.classList.add('gone'); Sfx.play('heal'); skillFx(lumi, 0xfff3b0, '精靈之光！');
      });
      const tr = $('tRead'); if(tr) tr.addEventListener('click',()=>{ window.open('index.html'+(q.link||''), '_blank', 'noopener'); });
    });
  }

  async function useSkill(u){
    const sk = u.m.skill.id; B.used[sk] = true;
    if(sk==='guard'){ B.guard = true; Sfx.play('guard'); await skillFx(u, 0xb8e08a, '橡木守護！'); partyHUD(); await msg(`葛倫舉起橡木盾。下一次魔物的攻擊會被完全擋下！`); }
    else if(sk==='heal' || sk==='bless'){
      Sfx.play('heal'); await skillFx(u, sk==='heal'?0xffb3c1:0xfff6d6, sk==='heal'?'治癒孢子！':'聖光祝福！');
      B.ms.forEach(x=>{ if(x.down && sk==='bless'){ x.down = false; x.C.g.rotation.z = 0; if(x.C.gl){ x.C.lock = false; x.C.cur = null; } } if(!x.down){ const before = x.hp; x.hp = Math.min(x.max, x.hp + Math.round(x.max*(sk==='heal'?.6:.5))); if(x.hp>before) popAt(x.C.g.position.clone().add(new T.Vector3(0,1.4,0)), '+'+(x.hp-before), 'heal'); } });
      if(sk==='bless') B.guard = true;
      partyHUD(); await msg(sk==='heal' ? '波波撒出治癒孢子，全隊體力回復了！' : '雷歐的聖光籠罩全隊：體力回復，倒下的夥伴也站起來了，並獲得一次守護！');
    }
    else if(sk==='crit'){ B.crit = true; Sfx.play('guard'); await skillFx(u, 0x9fd8ff, '星辰瞄準！'); await msg('琪雅拉滿弓弦。下一次答對時會打出會心一擊！'); }
    else if(sk==='foxfire'){
      await skillFx(u, 0xc9a7ff, '狐火連舞！');
      for(let i=0;i<3;i++){ await projectile(u.C.g.position.clone().add(new T.Vector3(0,1,0)), monCenter(), 0xc9a7ff, .15); const d = Math.round(B.maxHp*.03); B.h = Math.max(.06, B.h - d/B.maxHp); await hitMon(d, false, 0xc9a7ff); }
      await msg('菲恩的狐火在魔物身上連續炸開！');
    }
  }

  async function runBattle(cfg){
    // cfg: {mode:'stage'|'random', c, items:[{q,c}], spec, realm}
    state = 'trans'; setPrompt(false); dlg.classList.add('hidden'); $('labels').innerHTML = '';
    for(const k in keys) keys[k] = false; target = null; autoEngage = null;
    Sfx.play('enc');
    const fl = $('flash'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
    await sleep(380);
    const built = buildBattle(cfg.realm, cfg.spec);
    const n = cfg.items.length, need = Math.ceil(n*2/3);
    B = {mode:cfg.mode, c:cfg.c, spec:cfg.spec, mon:built.M, ms:built.ms, h:1, maxHp:cfg.spec.boss?360:150, need, ok:0, hint:1, guard:false, crit:false, used:{}, partyBefore:party().length};
    $('worldUI').classList.add('hidden'); $('battleUI').classList.remove('hidden'); $('join').classList.add('hidden');
    state = 'battle'; monHUD(); partyHUD(); $('bTurn').textContent = `第 1 / ${n} 回合`;
    await sleep(350);
    if(B.mon.gl && CLIPS['Spawn_Ground_Skeletons']){ B.mon.lock = true; const d = onceAnim(B.mon, 'Spawn_Ground_Skeletons'); setTimeout(()=>{ if(B) B.mon.lock = false; }, d*1000); }
    await msg(`${cfg.spec.boss?'頭目・':''}<b>${cfg.spec.name}</b> 出現了！`);
    if(cfg.spec.line) await msg(`${cfg.spec.name}：「${cfg.spec.line}」`);
    let fled = false;
    for(let i=0;i<n;i++){
      $('bTurn').textContent = `第 ${i+1} / ${n} 回合`;
      // 指令
      let go = false;
      while(!go){
        const skillers = B.ms.filter(u=>u.m.skill && !['hint','read'].includes(u.m.skill.id));
        const cmd = await menu([
          {label:'攻擊', desc:'回答問題：答對就全員攻擊', value:'atk'},
          {label:'技能', desc: skillers.length ? '使用夥伴的技能（不消耗回合）' : '有夥伴加入後就能使用', value:'skill', disabled:!skillers.length},
          {label:'撤退', desc:'離開戰鬥（這場不計分）', value:'flee'}
        ], `你要怎麼做？`);
        if(cmd==='atk') go = true;
        else if(cmd==='skill'){
          const it = skillers.map(u=>({label:`${u.m.name}・${u.m.skill.name}${B.used[u.m.skill.id]?'（已使用）':''}`, desc:u.m.skill.desc, value:u, disabled:!!B.used[u.m.skill.id] || u.down}));
          it.push({label:'返回', value:null});
          const u = await menu(it, '選擇技能');
          if(u) await useSkill(u);
        } else if(cmd==='flee'){
          const y = await menu([{label:'確定撤退', desc:'這場戰鬥不計分', value:true},{label:'繼續戰鬥', value:false}], '真的要撤退嗎？');
          if(y){ fled = true; break; }
        }
      }
      if(fled) break;
      const it = cfg.items[i], r = await ask(it, i, n);
      if(r.good){
        B.ok++;
        await msg('答對了！全員攻擊！', 650);
        await partyAttack(.85/need, B.crit); B.crit = false;
      } else {
        await msg(`答錯了……<b>${cfg.spec.name}</b> 的反擊！`, 700);
        await monsterAttack();
      }
      await msg(`${r.good?'':'正確答案是「<b>'+r.right+'</b>」。'}${it.q.explain} <a href="index.html${it.q.link}" target="_blank" rel="noopener">回指南複習 →</a>`);
      if(B.ms.every(u=>u.down)){ await msg('全員倒下了……'); break; }
    }
    // 結算
    if(fled){ Sfx.play('lose'); await msg('隊伍撤退了。整理好再回來吧！'); return leaveBattle(null); }
    const win = B.ok>=need && !B.ms.every(u=>u.down);
    if(win){ await finisher(); Sfx.play('win'); await msg(`<b>${cfg.spec.name}</b> 被打倒了！`); }
    else { Sfx.play('lose');
      if(B.mon.gl){ B.mon.lock = true; onceAnim(B.mon, 'Taunt'); await tween(900, ()=>{}); }
      else await tween(500, k=>{ B.mon.g.position.y = Math.abs(Math.sin(k*Math.PI*3))*.5; }); await msg(`<b>${cfg.spec.name}</b> 還站著……隊伍先撤退了。複習一下再來挑戰！`); }
    let result = {win, ok:B.ok, n, mode:cfg.mode};
    if(cfg.mode==='stage'){
      const prev = S.best[cfg.c.id]||0; result.prev = prev;
      if(B.ok>prev){ S.best[cfg.c.id] = B.ok; save(); }
      result.gain = Math.max(0, B.ok-prev)*10;
      // 新夥伴
      const after = party();
      const joined = after.slice(B.partyBefore);
      for(const m of joined) await joinScene(m);
      renderHUD();
    }
    return showResult(result);
  }
  async function joinScene(m){
    const C = makeChar(m); C.g.position.set(.3,0,2.2); C.g.rotation.y = 0; C.battle = true; bScene.add(C.g);
    if(C.gl){ C.lock = true; loopAnim(C, 'Cheer', 0); }
    B.ms.push({m, C, hp:m.hp, max:m.hp, down:false, home:C.g.position.clone()}); partyHUD();
    Sfx.play('join');
    const j = $('join'); j.querySelector('.t').textContent = `✦ ${m.name} 加入了隊伍！`; j.querySelector('.s').textContent = `${m.job}`; j.classList.remove('hidden');
    burst(new T.Vector3(.3,1.2,2.2), 0xf3d28b, 70, 3);
    const spin = tween(1400, k=>{ C.g.rotation.y = k*Math.PI*2; C.g.position.y = Math.sin(k*Math.PI)*.6; animChar(C, T0, false); });
    await msg(`${m.name}（${m.job}）：「${m.line}」`);
    await spin; j.classList.add('hidden'); C.lock = false;
    if(m.skill) await msg(`${m.name} 的技能「<b>${m.skill.name}</b>」：${m.skill.desc}`);
  }
  function showResult(r){
    let html = '';
    if(r.mode==='stage'){
      let st = ''; for(let i=0;i<3;i++) st += i<r.ok ? '<span class="on">★</span>' : '<span class="off">★</span>';
      html = `<div class="result"><h3>${r.win?'勝利！':'撤退……'}</h3><div class="stars">${st}</div>
        <div>答對 ${r.ok} / ${r.n} 題 · ${r.gain?`獲得 ${r.gain} 經驗值`:`本關最佳紀錄 ${Math.max(r.prev,r.ok)} 星`}</div>`;
    } else {
      html = `<div class="result"><h3>${r.win?'流星雨試煉 通過！':'流星雨試煉 結束'}</h3><div>答對 ${r.ok} / ${r.n} 題（${Math.round(r.ok/r.n*100)}%）</div>`;
    }
    const nx = Q.chapters.find(c=>(S.best[c.id]||0)<2);
    return new Promise(res=>{
      waiter = null;
      bMain.innerHTML = html + `<div class="rbtns"><button class="sel" data-v="map">回到大地圖</button><button class="sel" data-v="again">${r.mode==='stage'?'再戰一次':'再來一場'}</button>${r.mode==='stage'&&nx&&nx!==B.c?`<button class="sel" data-v="next">前往下一隻：${monOf(nx).name}</button>`:''}</div></div>`;
      bMain.querySelectorAll('button.sel').forEach(b=>b.addEventListener('click',()=>{
        Sfx.play('sel'); const v = b.dataset.v, c = B.c, mode = B.mode;
        leaveBattle(r).then(()=>{
          if(v==='again'){ if(mode==='stage') engage(c); else randomBattle(); }
          else if(v==='next' && nx){ walkTo(shrines[nx.idx].c); }
        }); res();
      }));
      bMain.querySelector('button.sel').focus({preventScroll:true});
    });
  }
  async function leaveBattle(r){
    state = 'trans';
    const fl = $('flash'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
    await sleep(420);
    $('battleUI').classList.add('hidden'); $('worldUI').classList.remove('hidden');
    bScene = null; B = null; refreshAll(); state = 'world'; lastNear = undefined;
    if(r && r.mode==='stage'){
      if(r.win && r.ok===3) say('完美！祭壇亮起金色光柱了。往下一隻魔物前進吧！', '露米', 5000);
      else if(r.win) say('打倒了！再拿一顆星就能點亮金色光柱喔。', '露米', 5000);
      else say('沒關係，每個大賢者都是這樣開始的。回指南複習一下，我在這裡等你。', '露米', 5600);
    }
    canvas.focus({preventScroll:true});
  }
  function setPrompt(v){ $('prompt').classList.toggle('hidden', !v); }

  function engage(c){
    if(state!=='world') return;
    const s = shrines[c.idx];
    hero.x = s.w.x; hero.z = s.w.z + 4.6; chars.forEach(C=>{ C.x = hero.x; C.z = hero.z+1; });
    S.pos = {x:Math.round((hero.x+OX)*PX), y:Math.round((hero.z+OZ)*PX)}; save();
    runBattle({mode:'stage', c, items:c.questions.map(q=>({q, c})), spec:monOf(c), realm:c.realm});
  }
  function randomBattle(){
    if(state!=='world') return;
    const pool = []; Q.chapters.forEach(c=>c.questions.forEach(q=>pool.push({q, c})));
    runBattle({mode:'random', c:null, items:shuffle(pool).slice(0,10), spec:R.randomMonster, realm:4});
  }
  function walkTo(c){
    if(state!=='world') return;
    const s = shrines[c.idx]; target = {x:s.w.x, z:s.w.z+4.6}; autoEngage = s;
    say(`出發！目標是「${monOf(c).name}」，在「${c.stage}」。`, '露米', 3000);
  }
  function refreshAll(rebuild){
    const n = party().length;
    if(rebuild || n!==chars.length) buildParty();
    refreshShrines(); renderHUD();
  }

  // ---------- 主迴圈 ----------
  let last = performance.now(), frame = 0, shown = false;
  function loop(now){
    const dt = Math.min(.05, (now-last)/1000); last = now; T0 += dt; frame++;
    updTweens(dt);
    if(active && visible){
      if(state==='world' || (state==='trans' && !bScene)){ updateWorld(state==='world'?dt:0); renderer.render(W, wCam); if(frame%5===0) drawMini(); }
      else if(bScene){
        if(B){ animMonster(B.mon, T0); B.ms.forEach((u,i)=>{ if(!u.down || u.C.gl) animChar(u.C, T0+i*.5, false); }); }
        renderer.render(bScene, bCam);
      }
      if(!shown){ shown = true; $('loading').classList.add('hidden'); }
    }
    requestAnimationFrame(loop);
  }

  // ---------- 啟動 ----------
  buildParty(); refreshShrines(); resize();
  wCam.position.set(hero.x+camOff.x, camOff.y, hero.z+camOff.z); wCam.lookAt(hero.x, 1, hero.z);
  requestAnimationFrame(loop);
  setTimeout(()=>{
    if(!S.met){
      sayMany([['嗨！我是小精靈<b>露米</b>。這片精靈世界被 22 隻魔物占據了……',null,5200],
               ['魔物最怕「懂 Claude 的人」。戰鬥時<b>答對題目</b>，隊伍就會發動攻擊！',null,5600],
               ['用<b>方向鍵／WASD</b> 走路，或直接<b>點地面</b>。靠近魔物按 <b>E</b> 開戰。打倒越多，夥伴就越多喔！',null,6500]]);
      S.met = true; save();
    } else {
      const n = nextUndone();
      say(n ? `歡迎回來！下一隻魔物是「${monOf(n.c).name}」，在「${n.c.stage}」。` : '歡迎回來，大賢者！所有魔物都被你打倒了。', '露米', 5000);
    }
  }, 500);

  return {
    engage(c){ engage(c); },
    walkTo(c){ walkTo(c); },
    randomBattle(){ randomBattle(); },
    refreshAll(rebuild){ refreshAll(rebuild); },
    setActive(v){ active = v; if(v) setTimeout(resize, 30); },
    placeAt(c){ const s = shrines[c.idx]; hero.x = s.w.x; hero.z = s.w.z+4.6; buildParty(); }
  };
}

function noGL(){
  $('game').classList.add('hidden');
  document.querySelector('.tab[data-mode="world"]').disabled = true;
  document.querySelector('.tab[data-mode="world"]').title = '你的瀏覽器不支援 3D，已改用關卡清單';
  setMode('list');
}
booting = true;
init3D().then(g=>{
  booting = false; G = g;
  if(!G) return noGL();
  const h = decodeURIComponent(location.hash.slice(1)), c = Q.chapters.find(x=>x.id===h);
  if(c){ G.placeAt(c); setTimeout(()=>G.engage(c), 900); }
}).catch(e=>{ console.error('3D 初始化失敗', e); booting = false; G = null; noGL(); });
})();
