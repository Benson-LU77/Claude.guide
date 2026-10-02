/* 每章章末的「精靈試煉」小關卡：讀 quiz-data.js，插到每個 section.chapter 的內容最後。
   進度與 quiz.html 共用 localStorage（claudeGuideTrial.v1），只記每關最佳星數。 */
(function(){
  const Q = window.QUIZ; if(!Q) return;
  const KEY = 'claudeGuideTrial.v1', RUNES = ['甲','乙','丙','丁'];
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || {best:{}}; }catch(e){ return {best:{}}; } }
  function save(s){ try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} }

  const css = `
  .elf-trial{margin:2.6rem 0 1rem;padding:1.2rem 1.3rem 1.3rem;border-radius:16px;position:relative;
    background:radial-gradient(600px 200px at 100% 0%,rgba(181,140,217,.16),transparent 70%),radial-gradient(500px 200px at 0% 100%,rgba(127,201,154,.12),transparent 70%),#121a26;
    border:1px solid rgba(227,168,87,.35);box-shadow:0 0 24px rgba(181,140,217,.12),inset 0 0 20px rgba(227,168,87,.04);}
  .elf-trial::before{content:"✦";position:absolute;top:-.8em;left:1.2rem;padding:0 .4em;background:var(--bg-deep,#10141c);color:#e3a857;font-size:1.1rem;}
  .elf-trial .et-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:.3rem .8rem;}
  .elf-trial .et-title{font-family:"Noto Serif TC","Songti TC",serif;font-weight:900;font-size:1.15rem;color:#f3d28b;letter-spacing:.06em;}
  .elf-trial .et-sub{font-size:.82rem;color:var(--ink-soft,#8b94a3);}
  .elf-trial .et-best{margin-left:auto;font-size:.95rem;letter-spacing:2px;color:rgba(255,255,255,.18);}
  .elf-trial .et-best .on{color:#f3d28b;text-shadow:0 0 8px rgba(243,210,139,.6);}
  .elf-trial .et-q{margin:1.1rem 0 0;}
  .elf-trial .et-q > p{margin:0 0 .55rem;font-weight:600;color:var(--ink,#c9d1d9);}
  .elf-trial .et-q > p span{color:#b58cd9;margin-right:.4em;font-family:monospace;}
  .elf-trial .et-opts{display:grid;gap:.45rem;}
  .elf-trial button.et-opt{font:inherit;font-size:.93rem;text-align:left;cursor:pointer;display:flex;gap:.7rem;align-items:center;
    padding:.55rem .8rem;border-radius:10px;color:var(--ink,#c9d1d9);background:rgba(181,140,217,.06);border:1px solid rgba(181,140,217,.25);transition:background .15s,border-color .15s;}
  .elf-trial button.et-opt:hover:not(:disabled){background:rgba(181,140,217,.14);border-color:#b58cd9;}
  .elf-trial button.et-opt:disabled{cursor:default;}
  .elf-trial .et-rune{flex:none;width:1.6rem;height:1.6rem;border-radius:50%;display:grid;place-items:center;font-size:.75rem;font-weight:700;border:1px solid #b58cd9;color:#b58cd9;}
  .elf-trial .et-opt.right{border-color:#7fc99a;background:rgba(127,201,154,.14);}
  .elf-trial .et-opt.right .et-rune{background:#7fc99a;color:#0b2318;border-color:#7fc99a;}
  .elf-trial .et-opt.wrong{border-color:#e98a9b;background:rgba(233,138,155,.1);}
  .elf-trial .et-opt.wrong .et-rune{background:#e98a9b;color:#2a0b12;border-color:#e98a9b;}
  .elf-trial .et-opt.dim{opacity:.45;}
  .elf-trial .et-fb{display:none;margin-top:.5rem;padding:.55rem .8rem;border-radius:10px;font-size:.88rem;line-height:1.65;}
  .elf-trial .et-fb.ok{display:block;background:rgba(127,201,154,.08);border:1px solid rgba(127,201,154,.3);}
  .elf-trial .et-fb.no{display:block;background:rgba(233,138,155,.07);border:1px solid rgba(233,138,155,.3);}
  .elf-trial .et-end{display:none;margin-top:1.1rem;padding-top:.9rem;border-top:1px dashed rgba(227,168,87,.3);font-size:.92rem;}
  .elf-trial .et-end.show{display:block;}
  .elf-trial .et-end .stars{font-size:1.4rem;letter-spacing:4px;}
  .elf-trial .et-end .stars .on{color:#f3d28b;text-shadow:0 0 10px rgba(243,210,139,.7);}
  .elf-trial .et-end .stars .off{color:rgba(255,255,255,.15);}
  .elf-trial .et-links{display:flex;flex-wrap:wrap;gap:.5rem 1rem;margin-top:.5rem;}
  .elf-trial .et-links button{font:inherit;font-size:.88rem;background:none;border:none;color:#7aa2d9;cursor:pointer;padding:0;text-decoration:underline;}
  @media (prefers-reduced-motion:reduce){.elf-trial *{transition:none!important;}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function stars(n){ let h=''; for(let i=0;i<3;i++) h += i<n ? '<span class="on">★</span>' : '<span class="off">★</span>'; return h; }
  function bestHTML(n){ let h=''; for(let i=0;i<3;i++) h += i<n ? '<span class="on">★</span>' : '★'; return h; }

  Q.chapters.forEach(c=>{
    const sec = document.getElementById(c.id); if(!sec) return;
    const content = sec.querySelector(':scope > .content') || sec;
    const box = document.createElement('div'); box.className = 'elf-trial'; box.id = c.id + '-trial';
    const realm = Q.realms[c.realm].name;
    function build(){
      const best = load().best[c.id] || 0;
      box.innerHTML = `<div class="et-head"><span class="et-title">精靈試煉 · ${c.stage}</span>
        <span class="et-sub">${realm} 第 ${c.idx+1} 關 · 讀完這章，用 3 題確認自己懂了</span>
        <span class="et-best" title="本關最佳紀錄">${bestHTML(best)}</span></div>` +
        c.questions.map((q,qi)=>`<div class="et-q" data-qi="${qi}"><p><span>${qi+1}/3</span>${q.q}</p>
          <div class="et-opts">${q.options.map((o,oi)=>`<button class="et-opt" data-oi="${oi}"><span class="et-rune">${RUNES[oi]}</span><span>${o}</span></button>`).join('')}</div>
          <div class="et-fb"></div></div>`).join('') +
        `<div class="et-end"></div>`;
      const res = [];
      box.querySelectorAll('.et-q').forEach(qd=>{
        const qi = +qd.dataset.qi, q = c.questions[qi];
        qd.querySelectorAll('.et-opt').forEach(b=>b.addEventListener('click',()=>{
          const pick = +b.dataset.oi, good = pick===q.answer;
          qd.querySelectorAll('.et-opt').forEach(x=>{
            x.disabled = true; const oi = +x.dataset.oi;
            x.classList.add(oi===q.answer ? 'right' : (x===b ? 'wrong' : 'dim'));
          });
          const fb = qd.querySelector('.et-fb');
          fb.className = 'et-fb ' + (good?'ok':'no');
          const link = q.link && q.link !== '#'+c.id ? ` <a href="${q.link}">看原文 →</a>` : '';
          fb.innerHTML = `<strong>${good?'答對了！':'再想想～'}</strong> ${q.explain}${link}`;
          res[qi] = good;
          if(res.filter(x=>x!==undefined).length===3) finish(res.filter(Boolean).length);
        }));
      });
    }
    function finish(n){
      const s = load(); s.best = s.best || {};
      const prev = s.best[c.id] || 0;
      if(n>prev){ s.best[c.id] = n; save(s); }
      const end = box.querySelector('.et-end'); end.classList.add('show');
      const msg = ['符文尚未甦醒，往上翻再讀一次吧。','感受到一絲魔力了，再挑戰一次會更好。','差一步就完美！','完美通關！這一關的光為你點亮。'][n];
      end.innerHTML = `<div class="stars">${stars(n)}</div><div>${msg}${n>prev?'（新紀錄已存下）':''}</div>
        <div class="et-links"><button type="button" data-retry>重新挑戰</button><a href="quiz.html">前往精靈試煉地圖，看看你的冒險等級 →</a></div>`;
      box.querySelector('.et-best').innerHTML = bestHTML(Math.max(n,prev));
      end.querySelector('[data-retry]').addEventListener('click', build);
    }
    build();
    const brace = content.querySelector(':scope > .closing-brace');
    if(brace) content.insertBefore(box, brace); else content.appendChild(box);
  });
})();
