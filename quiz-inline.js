/* 每章章末的「精靈試煉」小關卡：讀 quiz-data.js，插到每個 section.chapter 的內容最後。
   進度與 quiz.html 共用 localStorage（claudeGuideTrial.v1），只記每關最佳星數。 */
(function(){
  const Q = window.QUIZ; if(!Q) return;
  const KEY = 'claudeGuideTrial.v1', RUNES = ['甲','乙','丙','丁'];
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || {best:{}}; }catch(e){ return {best:{}}; } }
  function save(s){ try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} }

  const css = `
  /* 紙本書版式：章末小關卡是一張淺色測驗卡 */
  .elf-trial{margin:2.8rem 0 1rem;padding:1.3rem 1.4rem 1.4rem;border-radius:14px;position:relative;
    background:#fffaf1;border:1px solid #ecd3b5;box-shadow:0 10px 28px -20px rgba(150,90,40,.45);}
  .elf-trial::before{content:"✦";position:absolute;top:-.85em;left:1.2rem;padding:0 .45em;background:var(--bg-deep,#faf6ef);color:var(--accent,#d9772b);font-size:1.1rem;}
  .elf-trial .et-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:.3rem .8rem;}
  .elf-trial .et-title{font-family:var(--serif,"Noto Serif TC",serif);font-weight:900;font-size:1.15rem;color:var(--string-amber,#b4561a);letter-spacing:.06em;}
  .elf-trial .et-sub{font-size:.84rem;color:var(--ink-soft,#5b4e46);}
  .elf-trial .et-best{margin-left:auto;font-size:.95rem;letter-spacing:2px;color:#e0d3bf;}
  .elf-trial .et-best .on{color:#e0a02f;}
  .elf-trial .et-q{margin:1.15rem 0 0;}
  .elf-trial .et-q > p{margin:0 0 .55rem;font-weight:700;color:var(--ink,#2b2320);}
  .elf-trial .et-q > p span{color:var(--string-amber,#b4561a);margin-right:.4em;font-family:var(--serif,serif);}
  .elf-trial .et-opts{display:grid;gap:.45rem;}
  .elf-trial button.et-opt{font:inherit;font-size:.94rem;text-align:left;cursor:pointer;display:flex;gap:.7rem;align-items:center;
    padding:.55rem .8rem;border-radius:10px;color:var(--ink,#2b2320);background:#fff;border:1px solid #e6d8c3;transition:background .15s,border-color .15s;}
  .elf-trial button.et-opt:hover:not(:disabled){background:#fff3e3;border-color:var(--accent,#d9772b);}
  .elf-trial button.et-opt:disabled{cursor:default;}
  .elf-trial .et-rune{flex:none;width:1.65rem;height:1.65rem;border-radius:50%;display:grid;place-items:center;font-size:.78rem;font-weight:700;border:1px solid #e0c3a0;color:var(--string-amber,#b4561a);background:#fff8ee;font-family:var(--serif,serif);}
  .elf-trial .et-opt.right{border-color:#5f9e72;background:#eef7ef;}
  .elf-trial .et-opt.right .et-rune{background:#3f7d52;color:#fff;border-color:#3f7d52;}
  .elf-trial .et-opt.wrong{border-color:#d58a96;background:#fbeef0;}
  .elf-trial .et-opt.wrong .et-rune{background:#b4475a;color:#fff;border-color:#b4475a;}
  .elf-trial .et-opt.dim{opacity:.5;}
  .elf-trial .et-fb{display:none;margin-top:.5rem;padding:.6rem .85rem;border-radius:10px;font-size:.9rem;line-height:1.7;color:var(--ink-soft,#5b4e46);}
  .elf-trial .et-fb.ok{display:block;background:#eef7ef;border:1px solid #bfdcc6;}
  .elf-trial .et-fb.no{display:block;background:#fbeef0;border:1px solid #ecc5cc;}
  .elf-trial .et-end{display:none;margin-top:1.1rem;padding-top:.9rem;border-top:1px dashed #e6cfb1;font-size:.94rem;}
  .elf-trial .et-end.show{display:block;}
  .elf-trial .et-end .stars{font-size:1.4rem;letter-spacing:4px;}
  .elf-trial .et-end .stars .on{color:#e0a02f;}
  .elf-trial .et-end .stars .off{color:#e6dccd;}
  .elf-trial .et-links{display:flex;flex-wrap:wrap;gap:.5rem 1rem;margin-top:.5rem;}
  .elf-trial .et-links button{font:inherit;font-size:.9rem;background:none;border:none;color:var(--key-blue,#2d6a86);cursor:pointer;padding:0;text-decoration:underline;}
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
