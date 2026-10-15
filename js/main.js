/* Crossgar FPC — interactions */
(function () {
  'use strict';

  /* ---- mobile nav ---- */
  var toggle = document.querySelector('.nav__toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---- calendar rail scroll ---- */
  var rail = document.querySelector('.cal__rail');
  var prev = document.querySelector('[data-cal="prev"]');
  var next = document.querySelector('[data-cal="next"]');
  if (rail && prev && next) {
    var step = function () {
      var card = rail.querySelector('.cal-card');
      return card ? card.offsetWidth + 18 : 300;
    };
    var syncButtons = function () {
      prev.disabled = rail.scrollLeft <= 4;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    };
    prev.addEventListener('click', function () { rail.scrollBy({ left: -step() * 1.4, behavior: 'smooth' }); });
    next.addEventListener('click', function () { rail.scrollBy({ left: step() * 1.4, behavior: 'smooth' }); });
    rail.addEventListener('scroll', syncButtons, { passive: true });
    window.addEventListener('resize', syncButtons);
    syncButtons();
  }

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- live status (driven by SermonAudio's live webcast flag) ----
     Polls the Netlify proxy (/api/sa?kind=live) which reads the broadcaster's
     webcastInProgress flag. The red dot (nav + hero) and the status pill only
     switch to the "live" state while an actual broadcast is running. */
  var statusEl = document.querySelector('[data-live-status]');
  var textEl = statusEl && statusEl.querySelector('[data-live-text]');

  function setLive(live) {
    document.body.classList.toggle('is-live', live);
    if (statusEl) statusEl.classList.toggle('live-status--on', live);
    if (textEl) textEl.textContent = live ? 'Online — Service live now' : 'Offline — next service below';
  }

  function checkLive() {
    fetch('/api/sa?kind=live', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { setLive(!!(j && j.webcastInProgress)); })
      .catch(function () { setLive(false); });
  }

  document.body.classList.remove('is-live'); // dot hidden until a broadcast is confirmed
  checkLive();
  setInterval(checkLive, 60000);             // re-check every minute
})();

/* ---- latest sermons from SermonAudio (auto-updates; falls back to the static list) ---- */
(function () {
  'use strict';
  var list = document.getElementById('sermon-list');
  if (!list) return;
  var bc  = window.SERMONAUDIO_BROADCASTER || list.getAttribute('data-sa-broadcaster') || 'crossgar';

  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function svcLabel(s) {
    var hay = ((s.fullTitle || '') + ' ' + (s.displayEventType || s.eventType || '')).toLowerCase();
    if (/midweek|mid week|bible study|prayer|wednesday/.test(hay)) return 'Wednesday';
    if (/evening|\bpm\b/.test(hay)) return 'Sunday Evening';
    if (/morning|\bam\b/.test(hay)) return 'Sunday Morning';
    return s.displayEventType || s.eventType || '';
  }

  function cleanTitle(s) {
    var raw = s.fullTitle || s.displayTitle || 'Sermon';
    var sp = (s.speaker && s.speaker.displayName) ? s.speaker.displayName.toLowerCase() : '';
    var parts = raw.split('|').map(function (x) { return x.trim(); }).filter(Boolean).filter(function (p) {
      if (/^\d{1,2}[\/.\-]\d/.test(p)) return false;   // dates
      if (/^(am|pm)$/i.test(p)) return false;          // AM / PM tags
      if (/^rev\b/i.test(p)) return false;             // "Rev ..." speaker tag
      if (sp && p.toLowerCase() === sp) return false;  // bare speaker name
      return true;
    });
    if (!parts.length) return raw;
    parts.sort(function (a, b) { return b.length - a.length; });
    return parts[0];
  }

  function card(s) {
    var d = s.preachDate ? new Date(s.preachDate) : null;
    var day = d ? ('0' + d.getDate()).slice(-2) : '';
    var mon = d ? MON[d.getMonth()] : '';
    var title = cleanTitle(s);
    var sp = (s.speaker && s.speaker.displayName) ? s.speaker.displayName : '';
    var ev = svcLabel(s);
    var url = s.sermonID ? ('https://www.sermonaudio.com/sermons/' + s.sermonID + '/') : ('https://www.sermonaudio.com/broadcasters/' + bc + '/');
    var esc = function (t) { var p = document.createElement('p'); p.textContent = t == null ? '' : t; return p.innerHTML; };
    return '<a class="sermon" href="' + url + '" target="_blank" rel="noopener">' +
      '<div class="sermon__date"><b>' + day + '</b><span>' + mon + '</span></div>' +
      '<div><div class="sermon__title">' + esc(title) + '</div><div class="sermon__meta">' + esc(sp) + '</div></div>' +
      '<span class="sermon__meta" style="align-self:center">' + esc(ev) + '</span>' +
      '<span class="sermon__play"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>' +
      '</a>';
  }

  fetch('/api/sa?kind=sermons', { headers: { 'Accept': 'application/json' }, cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      var items = j && (j.results || j.nodes);
      if (items && items.length) {
        list.innerHTML = items.slice(0, 6).map(card).join('');
      }
    })
    .catch(function () { /* keep the static fallback */ });
})();
