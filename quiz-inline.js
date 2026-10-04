/* 每章章末的「自我檢測」（預設收合，點開才顯示 3 題）：讀 quiz-data.js，插到每個 section.chapter 的內容最後。
   進度與 quiz.html 共用 localStorage（claudeGuideTrial.v1），只記每關最佳星數。 */
(function(){
  const Q = window.QUIZ; if(!Q) return;
  const KEY = 'claudeGuideTrial.v1', RUNES = ['A','B','C','D'];
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || {best:{}}; }catch(e){ return {best:{}}; } }
  function save(s){ try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} }

  const css = `
  /* 章末自我檢測：預設收合成一行，點開才出題 */
  .elf-trial{margin:2.6rem 0 1rem;border:1px solid var(--border,#e0d3bf);border-radius:4px;background:#fffdf8;}
  .elf-trial .et-head{all:unset;box-sizing:border-box;width:100%;cursor:pointer;display:flex;flex-wrap:wrap;align-items:baseline;gap:.3rem .8rem;padding:.8rem 1.1rem;}
  .elf-trial .et-head:hover{background:#fbf3e6;}
  .elf-trial .et-head:focus-visible{outline:2px solid var(--key-blue,#1f5f6e);outline-offset:-2px;}
  .elf-trial .et-title{font-family:var(--mono,monospace);font-weight:600;font-size:.82rem;letter-spacing:.08em;color:var(--key-blue,#1f5f6e);border:1px solid currentColor;border-radius:3px;padding:0 .45rem;}
  .elf-trial .et-sub{font-size:.9rem;color:var(--ink-soft,#5b4e46);}
  .elf-trial .et-best{margin-left:auto;font-size:.9rem;letter-spacing:2px;color:#e0d3bf;}
  .elf-trial .et-best .on{color:var(--accent,#d9772b);}
  .elf-trial .et-chev{font-family:var(--mono,monospace);color:var(--ink-faint,#8d8076);transition:transform .15s;}
  .elf-trial.open .et-chev{transform:rotate(90deg);}
  .elf-trial .et-body{padding:0 1.1rem 1.1rem;border-top:1px solid var(--border-soft,#ebe2d4);}
  .elf-trial .et-q{margin:1.1rem 0 0;}
  .elf-trial .et-q > p{margin:0 0 .5rem;font-weight:700;color:var(--ink,#2b2320);}
  .elf-trial .et-q > p span{font-family:var(--mono,monospace);font-size:.8em;color:var(--key-blue,#1f5f6e);margin-right:.5em;}
  .elf-trial .et-opts{display:grid;gap:.4rem;}
  .elf-trial button.et-opt{font:inherit;font-size:.93rem;text-align:left;cursor:pointer;display:flex;gap:.7rem;align-items:center;
    padding:.5rem .75rem;border-radius:4px;color:var(--ink,#2b2320);background:#fff;border:1px solid #e3d7c5;transition:background .15s,border-color .15s;}
  .elf-trial button.et-opt:hover:not(:disabled){background:#f6f1e7;border-color:var(--key-blue,#1f5f6e);}
  .elf-trial button.et-opt:disabled{cursor:default;}
  .elf-trial .et-rune{flex:none;width:1.5rem;height:1.5rem;border-radius:3px;display:grid;place-items:center;font-family:var(--mono,monospace);font-size:.76rem;font-weight:600;border:1px solid #d9ccb8;color:var(--ink-soft,#5b4e46);}
  .elf-trial .et-opt.right{border-color:#5f9e72;background:#eef7ef;}
  .elf-trial .et-opt.right .et-rune{background:#3f7d52;color:#fff;border-color:#3f7d52;}
  .elf-trial .et-opt.wrong{border-color:#d58a96;background:#fbeef0;}
  .elf-trial .et-opt.wrong .et-rune{background:#b4475a;color:#fff;border-color:#b4475a;}
  .elf-trial .et-opt.dim{opacity:.5;}
  .elf-trial .et-fb{display:none;margin-top:.45rem;padding:.55rem .8rem;border-radius:4px;font-size:.9rem;line-height:1.7;color:var(--ink-soft,#5b4e46);}
  .elf-trial .et-fb.ok{display:block;background:#eef7ef;border:1px solid #bfdcc6;}
  .elf-trial .et-fb.no{display:block;background:#fbeef0;border:1px solid #ecc5cc;}
  .elf-trial .et-end{display:none;margin-top:1rem;padding-top:.85rem;border-top:1px dashed #e3d3bd;font-size:.94rem;}
  .elf-trial .et-end.show{display:block;}
  .elf-trial .et-end .stars{font-size:1.25rem;letter-spacing:4px;}
  .elf-trial .et-end .stars .on{color:var(--accent,#d9772b);}
  .elf-trial .et-end .stars .off{color:#e6dccd;}
  .elf-trial .et-links{display:flex;flex-wrap:wrap;gap:.5rem 1rem;margin-top:.5rem;}
  .elf-trial .et-links button{font:inherit;font-size:.9rem;background:none;border:none;color:var(--key-blue,#1f5f6e);cursor:pointer;padding:0;text-decoration:underline;}
  @media (prefers-reduced-motion:reduce){.elf-trial *{transition:none!important;}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function stars(n){ let h=''; for(let i=0;i<3;i++) h += i<n ? '<span class="on">★</span>' : '<span class="off">★</span>'; return h; }
  function bestHTML(n){ let h=''; for(let i=0;i<3;i++) h += i<n ? '<span class="on">★</span>' : '★'; return h; }

  Q.chapters.forEach(c=>{
    const sec = document.getElementById(c.id); if(!sec) return;
    const content = sec.querySelector(':scope > .content') || sec;
    const box = document.createElement('div'); box.className = 'elf-trial'; box.id = c.id + '-trial';
    let open = false;
    function build(){
      const best = load().best[c.id] || 0;
      box.innerHTML = `<button type="button" class="et-head" aria-expanded="${open}"><span class="et-title">自我檢測</span>
        <span class="et-sub">讀完這章？用 3 題確認自己懂了</span>
        <span class="et-best" title="最佳紀錄">${bestHTML(best)}</span><span class="et-chev" aria-hidden="true">▸</span></button>
        <div class="et-body"${open?'':' hidden'}>` +
        c.questions.map((q,qi)=>`<div class="et-q" data-qi="${qi}"><p><span>${qi+1}/3</span>${q.q}</p>
          <div class="et-opts">${q.options.map((o,oi)=>`<button class="et-opt" data-oi="${oi}"><span class="et-rune">${RUNES[oi]}</span><span>${o}</span></button>`).join('')}</div>
          <div class="et-fb"></div></div>`).join('') +
        `<div class="et-end"></div></div>`;
      const head = box.querySelector('.et-head'), body = box.querySelector('.et-body');
      head.addEventListener('click',()=>{ open = !open; body.hidden = !open; head.setAttribute('aria-expanded', open); box.classList.toggle('open', open); });
      box.classList.toggle('open', open);
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
          fb.innerHTML = `<strong>${good?'答對':'答錯'}</strong> ${q.explain}${link}`;
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
      const msg = ['再讀一次這章，重點會更清楚。','掌握了一部分，再試一次會更穩。','差一題就全對。','全對，這章你懂了。'][n];
      end.innerHTML = `<div class="stars">${stars(n)}</div><div>${msg}${n>prev?'（新紀錄已存下）':''}</div>
        <div class="et-links"><button type="button" data-retry>重新作答</button><a href="quiz.html">挑戰全部 66 題（精靈試煉）→</a></div>`;
      box.querySelector('.et-best').innerHTML = bestHTML(Math.max(n,prev));
      end.querySelector('[data-retry]').addEventListener('click', build);
    }
    build();
    const brace = content.querySelector(':scope > .closing-brace');
    if(brace) content.insertBefore(box, brace); else content.appendChild(box);
  });
})();
