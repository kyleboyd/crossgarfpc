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

  /* ---- live status (schedule-aware placeholder) ----
     Services: Sun 11:30 & 19:00, Wed 20:00 (Europe/London).
     Shows a LIVE state during service windows; otherwise the next service. */
  var statusEl = document.querySelector('[data-live-status]');
  if (statusEl) {
    var now = new Date();
    var day = now.getDay();            // 0 Sun .. 6 Sat
    var mins = now.getHours() * 60 + now.getMinutes();
    var windows = [
      { day: 0, start: 11 * 60 + 30, end: 12 * 60 + 45 },
      { day: 0, start: 19 * 60,      end: 20 * 60 + 15 },
      { day: 3, start: 20 * 60,      end: 21 * 60 + 15 }
    ];
    var isLive = windows.some(function (w) { return w.day === day && mins >= w.start && mins <= w.end; });
    if (isLive) {
      statusEl.classList.add('live-status--on');
      statusEl.querySelector('[data-live-text]').textContent = 'Live now';
    } else {
      statusEl.querySelector('[data-live-text]').textContent = 'Offline — next service below';
    }
  }
})();

/* ---- latest sermons from SermonAudio (auto-updates; falls back to the static list) ---- */
(function () {
  'use strict';
  var list = document.getElementById('sermon-list');
  if (!list) return;
  var key = window.SERMONAUDIO_API_KEY;
  var bc  = window.SERMONAUDIO_BROADCASTER || list.getAttribute('data-sa-broadcaster') || 'crossgar';
  if (!key) return; // no key yet — keep the manual list

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

  var url = 'https://api.sermonaudio.com/v2/node/sermons?broadcasterID=' +
    encodeURIComponent(bc) + '&sortBy=newest&pageSize=6';
  fetch(url, { headers: { 'X-API-Key': key, 'Accept': 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      var items = j && (j.results || j.nodes);
      if (items && items.length) {
        list.innerHTML = items.slice(0, 6).map(card).join('');
      }
    })
    .catch(function () { /* keep the static fallback */ });
})();
