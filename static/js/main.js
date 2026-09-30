/* Senses Wide Shut — IMAVB project page. No build step, no framework.
   Every number below is copied from BRIEF.md / the paper source. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* ================================================================ data */
  var BASE = [ // model, std_v, std_a, mis_v, mis_a, Bal, group
    ['OLA', 71.0, 71.6, 6.8, 0.0, 37.4, 'under'],
    ['OmniVinci', 75.4, 71.4, 6.6, 0.0, 38.4, 'under'],
    ['Qwen2.5-Omni', 64.4, 69.0, 16.0, 0.6, 37.5, 'under'],
    ['MiniCPM-o 2.6', 56.6, 54.2, 9.0, 6.6, 31.6, 'under'],
    ['Uni-MoE-2.0-Omni', 74.8, 69.0, 9.0, 0.0, 38.2, 'under'],
    ['Baichuan-Omni-1.5', 66.0, 66.8, 13.8, 0.6, 36.8, 'under'],
    ['Video-SALMONN-2', 69.8, 66.6, 16.2, 0.0, 38.2, 'under'],
    ['Qwen3-Omni', 40.6, 46.6, 72.8, 23.6, 45.9, 'over'],
    ['Gemini 3.1 Pro (API)', 50.2, 53.8, 94.0, 48.6, 61.6, 'over'],
    ['Human', 92.0, 86.0, 84.0, 72.0, 83.5, 'human']
  ];
  var GAP = [ // model, probe_v, probe_a, resid_v, resid_a, beh_v, beh_a, excluded
    ['OLA', 84.0, 77.8, 79.0, 67.7, 6.8, 0.0],
    ['OmniVinci', 84.4, 78.8, 78.9, 66.1, 6.6, 0.0],
    ['Qwen2.5-Omni', 86.0, 75.6, 77.7, 67.0, 16.0, 0.6],
    ['MiniCPM-o 2.6', 83.2, 78.6, 78.7, 69.5, 9.0, 6.6],
    ['Uni-MoE-2.0-Omni', 84.4, 76.3, 76.7, 65.6, 9.0, 0.0],
    ['Baichuan-Omni-1.5', 99.3, 98.7, 99.8, 100.0, 13.8, 0.6, true],
    ['Video-SALMONN-2', 83.5, 77.1, 80.7, 65.8, 16.2, 0.0],
    ['Qwen3-Omni', 76.5, 64.9, 79.8, 65.0, 72.8, 23.6]
  ];
  var TEXTREF = { v: { tfidf: 73.4, sbert: 66.8 }, a: { tfidf: 71.4, sbert: 57.3 } };
  var PGLA = [ // model, baseline Bal, Std, Mis, Bal, dBal
    ['Uni-MoE-2.0-Omni', 38.2, 54.7, 59.3, 57.0, 18.8],
    ['MiniCPM-o 2.6', 31.6, 45.5, 52.8, 49.2, 17.6],
    ['OLA', 37.4, 58.7, 51.2, 54.9, 17.5],
    ['Video-SALMONN-2', 38.2, 46.2, 64.1, 55.1, 16.9],
    ['Qwen2.5-Omni', 37.5, 55.5, 51.3, 53.4, 15.9],
    ['OmniVinci', 38.4, 53.8, 52.2, 53.0, 14.6],
    ['Qwen3-Omni', 45.9, 46.5, 68.8, 57.7, 11.8],
    ['Baichuan-Omni-1.5', 36.8, 52.0, 35.0, 43.5, 6.7]
  ];
  var PGLA_MEAN = [38.0, 51.6, 54.3, 53.0, 15.0];
  var INTERF = [ // model, A->V, V->A, interpretation
    ['Qwen2.5-Omni', 6.2, 1.0, 'Audio interferes'],
    ['Video-SALMONN-2', 6.4, 0.0, 'Audio interferes'],
    ['Baichuan-Omni-1.5', 5.4, 0.6, 'Audio interferes'],
    ['OmniVinci', 1.2, 0.0, 'Minimal'],
    ['OLA', -0.6, 0.0, 'No interference'],
    ['Uni-MoE-2.0-Omni', -1.8, 0.4, 'No interference'],
    ['MiniCPM-o 2.6', -4.4, -5.8, 'AV synergistic'],
    ['Qwen3-Omni', 2.0, 14.4, 'Video interferes']
  ];

  var REJ_E = 'The visual detail in the question is incorrect';
  var REJ_F = 'The audio detail in the question is incorrect';
  // [[standard|misleading]] marks the one swapped premise detail.
  var CLIPS = [
    {
      id: '-5be_UPkLRw', name: 'The doorway', src: 'static/videos/ex_doorway.mp4', poster: 'static/images/ex_doorway.jpg',
      meta: 'excerpt 1:30–1:42 of a 1:50 clip · answer window 90–100 s',
      cue: 'Two men talk normally to each other, over a gentle, melancholic string underscore that fits a sad-scene moment.',
      vision: {
        q: 'When the man in the dark suit faces the younger man wearing a [[maroon|blue]] polo shirt, what color is the dress of the woman standing motionless in the doorway?',
        opts: ['Black', 'Blue', 'White', 'Red'], ans: 'D', cat: 'temporal', sub: 'person identity'
      },
      audio: {
        q: "As the suited man pleads with raw urgency while a [[delicate string melody|loud drum beat]] swells beneath the silence, what specific phrase does he say immediately after asking ‘Who cried for the little boy?’",
        opts: ['I will cry for him', 'He is lost forever', 'It hurts so much', 'He cries inside me'], ans: 'D', cat: 'temporal', sub: 'sound type'
      }
    },
    {
      id: '--aqjaJyZLk', name: 'The monitor', src: 'static/videos/ex_hardhat.mp4', poster: 'static/images/ex_hardhat.jpg',
      meta: 'excerpt 0:00–0:12 of a 2:10 clip · answer window 0–10 s',
      cue: 'Synthesised electronic music reminiscent of late-1980s video games, then a processed voice announces “And now, Danny boy! Let’s talk about safety in the workplace.”',
      vision: {
        q: 'When the alien-like figure with reddish-brown skin appears on the monitor wearing a bright [[yellow|blue]] hard hat, how are its eyes described?',
        opts: ['large and expressive', 'small and black', 'glowing green', 'hidden behind sunglasses'], ans: 'A', cat: 'time order', sub: 'person identity'
      },
      audio: {
        q: 'While the synthesized electronic music loop reminiscent of [[late-1980s video games|1950s jazz club]] plays in the background, what specific phrase does the processed voice announce?',
        opts: ['And now, Danny boy! Let’s talk about safety in the workplace.', 'Welcome to the factory floor, everyone stay safe.', 'Danger ahead, please evacuate immediately.', 'The system is ready for inspection.'], ans: 'A', cat: 'time order', sub: 'background music'
      }
    },
    {
      id: '-7cV5cWQmxg', name: 'The car ride', src: 'static/videos/ex_carride.mp4', poster: 'static/images/ex_carride.jpg',
      meta: 'excerpt 0:00–0:12 of a 2:00 clip · answer window 0–10 s',
      cue: 'A woman tells the man softly to stop eating, then the man murmurs “I know, I know” in a soft, resigned tone.',
      vision: {
        q: 'When Billy responds to Heidi’s remark while wearing a [[brown|blue]] suit jacket, what color is his shirt underneath?',
        opts: ['white', 'black', 'gray', 'blue'], ans: 'A', cat: 'temporal', sub: 'object attribute'
      },
      audio: {
        q: 'After Heidi tells Billy to stop eating like that[[| in a loud and angry tone]], how does Billy murmur ‘I know, I know’?',
        opts: ['soft and resigned', 'loud and angry', 'whispering fiercely', 'shouting in panic'], ans: 'A', cat: 'temporal', sub: 'speech tone', insert: true
      }
    }
  ];

  /* ================================================================ helpers */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, attrs) {
    var a = attrs || {}; a.x = x; a.y = y;
    var t = el('text', a, parent); t.textContent = s; return t;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(v, sign) { var s = v.toFixed(1); return sign && v > 0 ? '+' + s : (v < 0 ? '−' + Math.abs(v).toFixed(1) : s); }
  function css(name, node) { return getComputedStyle(node || document.body).getPropertyValue(name).trim(); }
  function widthOf(node) { return Math.max(300, Math.round(node.getBoundingClientRect().width)); }

  function makeTip(container) {
    var t = document.createElement('div'); t.className = 'tip'; container.appendChild(t);
    return {
      show: function (html, x, y) { t.innerHTML = html; t.style.left = x + 'px'; t.style.top = y + 'px'; t.classList.add('on'); },
      hide: function () { t.classList.remove('on'); }
    };
  }
  function bindTip(node, tip, container, html) {
    function at(ev) {
      var r = container.getBoundingClientRect();
      var bb = node.getBoundingClientRect();
      var x = ev && ev.clientX ? ev.clientX - r.left : bb.left + bb.width / 2 - r.left;
      x = Math.min(Math.max(x, 70), r.width - 70);
      tip.show(html, x, bb.top - r.top);
    }
    node.addEventListener('mousemove', at);
    node.addEventListener('mouseenter', at);
    node.addEventListener('mouseleave', tip.hide);
    node.addEventListener('click', function (e) { at(e); e.stopPropagation(); });
  }

  /* ================================================================ reveal + counters */
  function countUp(dd) {
    var target = parseFloat(dd.getAttribute('data-count'));
    var dec = +(dd.getAttribute('data-dec') || 0);
    var sep = dd.hasAttribute('data-sep');
    var node = dd.firstChild; // text node before <small>
    if (!node || node.nodeType !== 3) return;
    function show(v) {
      var s = v.toFixed(dec);
      if (sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      node.nodeValue = s;
    }
    if (reduce) return show(target);
    var t0 = null, dur = 1400;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      show(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    show(0); requestAnimationFrame(step);
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      if (en.target.classList.contains('stats')) $$('dd[data-count]', en.target).forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;
  $$('.reveal').forEach(function (n) { if (io && !reduce) io.observe(n); else n.classList.add('in'); });

  /* ================================================================ explorer */
  var ex = { clip: 0, m: 'vision', p: 'mis', revealed: false };
  var exClips = $('.explorer__clips');
  CLIPS.forEach(function (c, i) {
    var b = document.createElement('button');
    b.className = 'clipbtn'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.innerHTML = '<img src="' + c.poster + '" alt=""><span><b>Clip ' + (i + 1) + ' · ' + esc(c.name) + '</b><span>' + esc(c.id) + '</span></span>';
    b.addEventListener('click', function () { ex.clip = i; ex.revealed = false; loadClip(); renderQ(); });
    exClips.appendChild(b);
  });
  var vid = $('#exVideo');
  function loadClip() {
    var c = CLIPS[ex.clip];
    $$('.clipbtn').forEach(function (b, i) { b.setAttribute('aria-selected', i === ex.clip ? 'true' : 'false'); });
    vid.pause(); vid.poster = c.poster; vid.src = c.src; vid.load();
    $('#exMeta').textContent = c.id + ' · ' + c.meta;
    $('#exCue').innerHTML = '<b>Audio cue</b>' + esc(c.cue);
  }
  function renderQ() {
    var c = CLIPS[ex.clip], q = c[ex.m], mis = ex.p === 'mis';
    var html = esc(q.q).replace(/\[\[(.*?)\|(.*?)\]\]/, function (_, a, b) {
      if (mis) return '<mark class="bad">' + b + '</mark>';
      return a ? '<mark class="ok">' + a + '</mark>' : '';
    });
    $('#exQ').innerHTML = html;
    var tag = $('#exTag');
    tag.className = ex.m === 'vision' ? 'v' : 'a';
    tag.textContent = (ex.m === 'vision' ? 'Vision' : 'Audio') + ' · ' + (mis ? 'misleading' : 'standard');
    $('#exCat').textContent = q.cat;
    var correct = mis ? (ex.m === 'vision' ? 'E' : 'F') : q.ans;
    var all = q.opts.concat([REJ_E, REJ_F]);
    var ol = $('#exOpts'); ol.innerHTML = '';
    all.forEach(function (o, i) {
      var k = 'ABCDEF'[i];
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.className = 'opt' + (i > 3 ? ' opt--reject' : '');
      b.type = 'button'; b.dataset.k = k;
      b.innerHTML = '<span class="opt__k">' + k + '</span><span class="opt__t">' + esc(o) + '</span><svg aria-hidden="true"><use href="#i-check"/></svg>';
      b.addEventListener('click', function () { choose(k, correct); });
      li.appendChild(b); ol.appendChild(li);
    });
    var swap = $('#exSwap');
    if (mis) {
      var m = q.q.match(/\[\[(.*?)\|(.*?)\]\]/);
      swap.innerHTML = q.insert
        ? 'Inserted: <b>“' + esc(m[2].trim()) + '”</b> · ' + q.sub
        : 'Swap: ' + esc(m[1]) + ' → <b>' + esc(m[2]) + '</b> · ' + q.sub;
    } else {
      swap.textContent = 'Standard premise: every detail matches the clip.';
    }
    $$('.cell').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.m === ex.m && b.dataset.p === ex.p ? 'true' : 'false'); });
    $('#exReveal').textContent = 'Show answer';
    if (ex.revealed) choose(null, correct);
  }
  function choose(k, correct) {
    $$('#exOpts .opt').forEach(function (b) {
      b.classList.remove('is-correct', 'is-wrong');
      var use = b.querySelector('use');
      if (b.dataset.k === correct) { b.classList.add('is-correct'); use.setAttribute('href', '#i-check'); }
      else if (b.dataset.k === k) { b.classList.add('is-wrong'); use.setAttribute('href', '#i-x'); }
    });
    $('#exReveal').textContent = 'Answer: ' + correct;
  }
  $$('.cell').forEach(function (b) {
    b.addEventListener('click', function () { ex.m = b.dataset.m; ex.p = b.dataset.p; ex.revealed = false; renderQ(); });
  });
  $('#exReveal').addEventListener('click', function () {
    var c = CLIPS[ex.clip], q = c[ex.m];
    ex.revealed = true;
    choose(null, ex.p === 'mis' ? (ex.m === 'vision' ? 'E' : 'F') : q.ans);
  });
  loadClip(); renderQ();

  /* ================================================================ chart: baseline */
  var baseView = 'all';
  function drawBaseline() {
    var box = $('#chartBaseline'); if (!box) return;
    box.innerHTML = '';
    var W = widthOf(box), narrow = W < 600;
    var sec = box.closest('.sec');
    var cV = css('--c-vision', sec), cA = css('--c-audio', sec), cF = css('--c-false', sec), fg3 = css('--fg-3', sec);
    var labelW = narrow ? 0 : Math.min(190, W * 0.24);
    var balW = narrow ? 0 : 64;
    var bh = narrow ? 7 : 8, gapIn = 2, head = narrow ? 18 : 0;
    var groupH = head + 4 * bh + 3 * gapIn;
    var groupGap = narrow ? 16 : 14, sepGap = 26;
    var x0 = labelW, x1 = W - balW - 30;
    var sx = function (v) { return x0 + (x1 - x0) * v / 100; };
    var top = 44;
    var rows = BASE.length;
    var H = top + rows * (groupH + groupGap) + 2 * sepGap + 12;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Grouped bars of baseline accuracy per model: standard vision, standard audio, misleading vision, misleading audio.' }, box);
    var defs = el('defs', {}, svg);
    [['hv', cV], ['ha', cA]].forEach(function (p) {
      var pat = el('pattern', { id: p[0], width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      el('rect', { width: 5, height: 5, fill: p[1], 'fill-opacity': 0.22 }, pat);
      el('rect', { width: 2.2, height: 5, fill: p[1] }, pat);
    });
    // axis
    var ax = el('g', { class: 'axis' }, svg);
    [0, 25, 50, 75, 100].forEach(function (t) {
      el('line', { x1: sx(t), x2: sx(t), y1: top - 6, y2: H - 8 }, ax);
      txt(ax, sx(t), 12, t + (t === 100 ? '%' : ''), { 'text-anchor': 'middle' });
    });
    if (!narrow) txt(ax, W - 4, 12, 'Bal', { 'text-anchor': 'end' });
    var tip = makeTip(box);
    var y = top, prevGroup = null;
    BASE.forEach(function (r, i) {
      if (prevGroup && r[6] !== prevGroup) {
        // separator with label
        var ly = y + sepGap / 2 - 2;
        el('line', { x1: 0, x2: W, y1: ly - 6, y2: ly - 6, stroke: 'currentColor', 'stroke-opacity': .12, 'stroke-dasharray': '2 4' }, svg);
        y += sepGap;
      }
      if (r[6] !== prevGroup) {
        var lab = r[6] === 'under' ? 'UNDER-REJECTION' : r[6] === 'over' ? 'OVER-REJECTION' : 'REFERENCE';
        var col = r[6] === 'under' ? cF : fg3;
        txt(svg, narrow ? 0 : 0, y - 6 + (prevGroup ? -2 : 0), lab, { class: 't-mono', 'font-size': 10, fill: col, 'letter-spacing': '.12em', 'font-family': 'JetBrains Mono, monospace', style: 'fill:' + col });
        if (!prevGroup) { /* first label sits above the first group */ }
      }
      prevGroup = r[6];
      var g = el('g', {}, svg);
      if (narrow) {
        txt(g, 0, y + 12, r[0], { class: 'grp-label' });
        txt(g, W, y + 12, 'Bal ' + r[5].toFixed(1), { class: 'grp-sub', 'text-anchor': 'end' });
      } else {
        txt(g, labelW - 14, y + groupH / 2 + 4, r[0], { class: 'grp-label', 'text-anchor': 'end' });
        txt(g, W, y + groupH / 2 + 5, r[5].toFixed(1), { class: 'grp-label t-mono', 'text-anchor': 'end', 'font-size': 13 });
      }
      var series = [
        ['Standard · vision', r[1], cV, 'std'], ['Standard · audio', r[2], cA, 'std'],
        ['Misleading · vision', r[3], 'url(#hv)', 'mis', cV], ['Misleading · audio', r[4], 'url(#ha)', 'mis', cA]
      ];
      series.forEach(function (s, j) {
        var by = y + head + j * (bh + gapIn);
        var w = Math.max(sx(s[1]) - x0, 0);
        var dim = (baseView === 'std' && s[3] === 'mis') || (baseView === 'mis' && s[3] === 'std');
        var hit = el('g', { class: 'bar' + (dim ? ' dim' : ''), style: 'cursor:pointer' }, g);
        el('rect', { x: x0, y: by - 1, width: x1 - x0, height: bh + 2, fill: 'transparent' }, hit);
        if (s[1] === 0) {
          el('line', { x1: x0, x2: x0, y1: by, y2: by + bh, stroke: s[4] || s[2], 'stroke-width': 2 }, hit);
        } else {
          el('rect', { x: x0, y: by, width: w, height: bh, rx: 2, fill: s[2], stroke: s[4] || 'none', 'stroke-width': s[4] ? 1 : 0 }, hit);
        }
        var showVal = !dim && (baseView !== 'all' || s[3] === 'mis');
        if (showVal) txt(hit, x0 + w + 5, by + bh - 0.5, s[1].toFixed(1), { class: 'val', 'font-size': 10 });
        bindTip(hit, tip, box, r[0] + '<br>' + s[0] + ': <b>' + s[1].toFixed(1) + '%</b>');
      });
      y += groupH + groupGap;
    });
    box.addEventListener('mouseleave', tip.hide);
  }
  $$('#resView button').forEach(function (b) {
    b.addEventListener('click', function () {
      baseView = b.dataset.view;
      $$('#resView button').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      drawBaseline();
    });
  });

  /* ================================================================ chart: gap dumbbell */
  var gapMod = 'v', gapCur = null, gapAnim = null;
  function gapTarget(mod) {
    return GAP.map(function (r) { return mod === 'v' ? [r[1], r[3], r[5]] : [r[2], r[4], r[6]]; });
  }
  function drawGap(vals) {
    var box = $('#chartGap'); if (!box) return;
    var tipNode = box.querySelector('.tip');
    box.innerHTML = '';
    var W = widthOf(box), narrow = W < 600;
    var sec = box.closest('.sec');
    var cP = css('--c-probe', sec), cF = css('--c-false', sec), fg3 = css('--fg-3', sec);
    var labelW = narrow ? 0 : Math.min(180, W * 0.22);
    var rowH = narrow ? 50 : 44, top = 40, head = narrow ? 16 : 0;
    var bgc = css('--bg', sec);
    var x0 = labelW + 8, x1 = W - 20;
    var sx = function (v) { return x0 + (x1 - x0) * v / 100; };
    var H = top + GAP.length * rowH + 30;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Dumbbell chart per model: behavioural rejection rate versus hidden-state probe accuracy, with residualized probe and text-only baselines.' }, box);
    var defs = el('defs', {}, svg);
    var lg = el('linearGradient', { id: 'gg', x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
    el('stop', { offset: 0, 'stop-color': cF, 'stop-opacity': .9 }, lg);
    el('stop', { offset: 1, 'stop-color': cP, 'stop-opacity': .9 }, lg);
    var glow = el('filter', { id: 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
    el('feGaussianBlur', { stdDeviation: 3.5, result: 'b' }, glow);
    var fm = el('feMerge', {}, glow); el('feMergeNode', { in: 'b' }, fm); el('feMergeNode', { in: 'SourceGraphic' }, fm);

    var ax = el('g', { class: 'axis' }, svg);
    [0, 20, 40, 60, 80, 100].forEach(function (t) {
      el('line', { x1: sx(t), x2: sx(t), y1: top - 8, y2: H - 6 }, ax);
      txt(ax, sx(t), top - 14, t + (t === 100 ? '%' : ''), { 'text-anchor': 'middle' });
    });
    var ref = TEXTREF[gapMod];
    [['TF-IDF', ref.tfidf], ['SBERT', ref.sbert]].forEach(function (rf, i) {
      var x = sx(rf[1]);
      el('line', { x1: x, x2: x, y1: top - 4, y2: H - 6, stroke: fg3, 'stroke-dasharray': '4 4', 'stroke-width': 1.2 }, svg);
      txt(svg, x + (i === 0 ? 4 : -4), H - 6, rf[0] + ' ' + rf[1].toFixed(1), { 'text-anchor': i === 0 ? 'start' : 'end', class: 'val', 'font-size': 10 });
    });
    var tip = makeTip(box);
    GAP.forEach(function (r, i) {
      var v = vals[i], y = top + i * rowH + head + rowH / 2 - (narrow ? 6 : 0);
      var g = el('g', { opacity: r[7] ? 0.55 : 1 }, svg);
      var name = r[0] + (r[7] ? ' †' : '');
      if (narrow) {
        txt(g, 0, y - 13, name, { class: 'grp-label', 'font-size': 12.5 });
        var vt = txt(g, W, y - 13, '', { 'text-anchor': 'end', class: 'val', 'font-size': 10.5, style: 'paint-order:stroke;stroke:' + bgc + ';stroke-width:6px;stroke-linejoin:round' });
        var t1 = el('tspan', { style: 'fill:' + cF }, vt); t1.textContent = 'says ' + v[2].toFixed(1);
        var t2 = el('tspan', { style: 'fill:' + fg3 }, vt); t2.textContent = '  ·  ';
        var t3 = el('tspan', { style: 'fill:' + cP }, vt); t3.textContent = 'knows ' + v[0].toFixed(1);
      }
      else txt(g, labelW - 6, y + 4, name, { class: 'grp-label', 'text-anchor': 'end' });
      var xb = sx(v[2]), xp = sx(v[0]), xr = sx(v[1]);
      el('line', { x1: xb, x2: xp, y1: y, y2: y, stroke: 'url(#gg)', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      el('circle', { cx: xr, cy: y, r: 6, fill: 'none', stroke: cP, 'stroke-width': 1.8 }, g);
      el('circle', { cx: xb, cy: y, r: 6.5, fill: cF }, g);
      el('circle', { cx: xp, cy: y, r: 7, fill: cP, filter: 'url(#glow)' }, g);
      if (!narrow) {
        var bl = txt(g, xb - 10, y + 4, v[2].toFixed(1), { 'text-anchor': 'end', class: 'val', style: 'fill:' + cF, 'font-size': 10.5 });
        if (xb - 10 < x0 + 22) { bl.setAttribute('x', xb); bl.setAttribute('text-anchor', 'middle'); bl.setAttribute('y', y - 11); }
        var px = Math.max(xp, xr) + 11;
        var pl = txt(g, px, y + 4, v[0].toFixed(1), { class: 'val', style: 'fill:' + cP, 'font-size': 10.5 });
        if (px + 26 > W) { pl.setAttribute('x', xp); pl.setAttribute('text-anchor', 'middle'); pl.setAttribute('y', y - 12); }
      }
      var hit = el('rect', { x: x0, y: y - rowH / 2 + 4, width: x1 - x0, height: rowH - 8, fill: 'transparent', style: 'cursor:pointer' }, g);
      var gapPP = (v[0] - v[2]).toFixed(1);
      bindTip(hit, tip, box, r[0] + (r[7] ? ' (†)' : '') + '<br>Probe <b>' + v[0].toFixed(1) + '%</b> · residualized <b>' + v[1].toFixed(1) + '%</b><br>Rejects in output <b>' + v[2].toFixed(1) + '%</b>');
    });
  }
  function animateGap(to) {
    var from = gapCur || to.map(function (r) { return [r[0], r[1], r[2]]; });
    if (reduce || !gapCur) { gapCur = to; drawGap(to); return; }
    var t0 = null; cancelAnimationFrame(gapAnim);
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 700), e = 1 - Math.pow(1 - p, 3);
      var cur = to.map(function (r, i) { return r.map(function (v, j) { return from[i][j] + (v - from[i][j]) * e; }); });
      drawGap(cur);
      if (p < 1) gapAnim = requestAnimationFrame(step); else gapCur = to;
    }
    gapAnim = requestAnimationFrame(step);
  }
  $$('#gapView button').forEach(function (b) {
    b.addEventListener('click', function () {
      gapMod = b.dataset.mod;
      $$('#gapView button').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      animateGap(gapTarget(gapMod));
    });
  });

  /* ================================================================ chart: PGLA */
  function drawPgla() {
    var box = $('#chartPgla'); if (!box) return;
    box.innerHTML = '';
    var W = widthOf(box), narrow = W < 460;
    var sec = box.closest('.sec');
    var cG = css('--c-correct', sec), fg = css('--fg', sec), fg3 = css('--fg-3', sec);
    var labelW = narrow ? 0 : Math.min(150, W * 0.33);
    var rowH = narrow ? 42 : 32, top = 22, head = narrow ? 15 : 0;
    var x0 = labelW + 6, x1 = W - (narrow ? 44 : 110);
    var sx = function (v) { return x0 + (x1 - x0) * v / 20; };
    var rows = PGLA.concat([['Mean', PGLA_MEAN[0], PGLA_MEAN[1], PGLA_MEAN[2], PGLA_MEAN[3], PGLA_MEAN[4]]]);
    var H = top + rows.length * rowH + 10;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Balanced accuracy gain from PGLA per model.' }, box);
    var ax = el('g', { class: 'axis' }, svg);
    [0, 5, 10, 15, 20].forEach(function (t) {
      el('line', { x1: sx(t), x2: sx(t), y1: top - 4, y2: H - 4 }, ax);
      txt(ax, sx(t), 12, (t ? '+' : '') + t, { 'text-anchor': 'middle' });
    });
    var mx = sx(15.0);
    el('line', { x1: mx, x2: mx, y1: top - 4, y2: H - 4, stroke: cG, 'stroke-dasharray': '3 3', 'stroke-width': 1.2 }, svg);
    var tip = makeTip(box);
    rows.forEach(function (r, i) {
      var isMean = r[0] === 'Mean';
      var y = top + i * rowH + head;
      var bh = narrow ? 16 : 18;
      var g = el('g', {}, svg);
      if (isMean) el('line', { x1: 0, x2: W, y1: y - 5, y2: y - 5, stroke: fg3, 'stroke-opacity': .35 }, g);
      if (narrow) txt(g, 0, y - 3, r[0], { class: 'grp-label', 'font-size': 12.5, 'font-weight': isMean ? 700 : 500 });
      else txt(g, labelW - 4, y + bh / 2 + 4, r[0], { class: 'grp-label', 'text-anchor': 'end', 'font-weight': isMean ? 700 : 500 });
      el('rect', { x: x0, y: y, width: sx(r[5]) - x0, height: bh, rx: 3, fill: cG, 'fill-opacity': isMean ? 1 : 0.78 }, g);
      txt(g, sx(r[5]) + 6, y + bh / 2 + 4, '+' + r[5].toFixed(1), { class: 'val', style: 'fill:' + fg + ';font-weight:600', 'font-size': 11.5 });
      if (!narrow) txt(g, W, y + bh / 2 + 4, r[1].toFixed(1) + ' → ' + r[4].toFixed(1), { class: 'val', 'text-anchor': 'end', 'font-size': 10.5 });
      var hit = el('rect', { x: 0, y: y - 2, width: W, height: bh + 4, fill: 'transparent', style: 'cursor:pointer' }, g);
      bindTip(hit, tip, box, r[0] + '<br>Bal <b>' + r[1].toFixed(1) + '</b> → <b>' + r[4].toFixed(1) + '</b> (ΔBal <b>+' + r[5].toFixed(1) + '</b>)<br>After PGLA: Std ' + r[2].toFixed(1) + ' · Mis ' + r[3].toFixed(1));
    });
  }

  /* ================================================================ chart: interference */
  function drawInterf() {
    var box = $('#chartInterf'); if (!box) return;
    box.innerHTML = '';
    var W = widthOf(box), narrow = W < 520;
    var sec = box.closest('.sec');
    var cV = css('--c-vision', sec), cA = css('--c-audio', sec), fg3 = css('--fg-3', sec);
    var labelW = narrow ? 0 : Math.min(150, W * 0.3);
    var interpW = narrow ? 0 : 118;
    var bh = 9, head = narrow ? 16 : 0, rowH = head + 2 * bh + 16, top = narrow ? 58 : 40;
    var bgc = css('--bg', sec);
    var lo = -8, hi = 18;
    var x0 = labelW + 8, x1 = W - interpW - 8;
    var sx = function (v) { return x0 + (x1 - x0) * (v - lo) / (hi - lo); };
    var H = top + INTERF.length * rowH + 4;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Diverging bars: change in misleading accuracy when the other modality is removed.' }, box);
    var ax = el('g', { class: 'axis' }, svg);
    [-5, 0, 5, 10, 15].forEach(function (t) {
      el('line', { x1: sx(t), x2: sx(t), y1: top - 6, y2: H - 4, 'stroke-width': t === 0 ? 1.5 : 1, style: t === 0 ? 'stroke:' + fg3 : '' }, ax);
      txt(ax, sx(t), top - 12, (t > 0 ? '+' : t < 0 ? '−' : '') + Math.abs(t), { 'text-anchor': 'middle' });
    });
    // mini legend
    txt(svg, x0, 12, '■ A→V (audio removed, mis_v)', { class: 'val', style: 'fill:' + cV, 'font-size': 10.5 });
    txt(svg, narrow ? x0 : x0 + 210, narrow ? 27 : 12, '■ V→A (video removed, mis_a)', { class: 'val', style: 'fill:' + cA, 'font-size': 10.5 });
    var tip = makeTip(box);
    INTERF.forEach(function (r, i) {
      var y = top + i * rowH + head + 4;
      var g = el('g', {}, svg);
      if (narrow) txt(g, 0, y - 4, r[0] + ' · ' + r[3], { class: 'grp-label', 'font-size': 12.5, style: 'paint-order:stroke;stroke:' + bgc + ';stroke-width:5px;stroke-linejoin:round' });
      else {
        txt(g, labelW - 2, y + bh + 4, r[0], { class: 'grp-label', 'text-anchor': 'end' });
        txt(g, W, y + bh + 4, r[3], { class: 'grp-sub', 'text-anchor': 'end' });
      }
      [[r[1], cV, 'A→V'], [r[2], cA, 'V→A']].forEach(function (s, j) {
        var by = y + j * (bh + 2);
        var a = sx(Math.min(0, s[0])), b = sx(Math.max(0, s[0]));
        el('rect', { x: a, y: by, width: Math.max(b - a, 1.5), height: bh, rx: 2, fill: s[1], 'fill-opacity': s[0] < 0 ? 0.55 : 0.95 }, g);
        var lx = s[0] >= 0 ? b + 4 : a - 4;
        txt(g, lx, by + bh - 1, fmt(s[0], true), { class: 'val', 'text-anchor': s[0] >= 0 ? 'start' : 'end', 'font-size': 10 });
      });
      var hit = el('rect', { x: 0, y: y - 2, width: W, height: 2 * bh + 6, fill: 'transparent', style: 'cursor:pointer' }, g);
      bindTip(hit, tip, box, r[0] + '<br>A→V <b>' + fmt(r[1], true) + ' pp</b> · V→A <b>' + fmt(r[2], true) + ' pp</b><br>' + r[3]);
    });
  }

  /* ================================================================ draw + resize */
  function drawAll() { drawBaseline(); drawGap(gapCur || gapTarget(gapMod)); drawPgla(); drawInterf(); }
  gapCur = gapTarget(gapMod);
  drawAll();
  var rt, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return; lastW = window.innerWidth;
    clearTimeout(rt); rt = setTimeout(drawAll, 150);
  });
  document.addEventListener('click', function () { $$('.tip').forEach(function (t) { t.classList.remove('on'); }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawAll);

  /* ================================================================ KaTeX */
  function renderMath() {
    if (!window.katex) return false;
    var eq = $('#pglaEq');
    if (eq && !eq.dataset.done) {
      katex.render(eq.textContent, eq, { displayMode: true, throwOnError: false });
      eq.dataset.done = 1;
    }
    $$('.math-inline').forEach(function (n) { if (!n.dataset.done) { katex.render(n.textContent, n, { throwOnError: false }); n.dataset.done = 1; } });
    return true;
  }
  if (!renderMath()) window.addEventListener('load', renderMath);

  /* ================================================================ BibTeX copy */
  var copyBtn = $('#bibCopy');
  copyBtn.addEventListener('click', function () {
    var s = $('#bibText').innerText;
    function done() {
      copyBtn.classList.add('done'); copyBtn.querySelector('span').textContent = 'Copied';
      setTimeout(function () { copyBtn.classList.remove('done'); copyBtn.querySelector('span').textContent = 'Copy'; }, 1800);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(s).then(done, fallback);
    else fallback();
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = s; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  });

  /* ================================================================ hero video: pause when off-screen */
  var hv = $('.hero__video');
  if (hv) {
    if (reduce) { hv.removeAttribute('autoplay'); hv.pause(); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { var p = hv.play(); if (p && p.catch) p.catch(function () {}); } else hv.pause(); });
      }).observe(hv);
    }
  }
})();
