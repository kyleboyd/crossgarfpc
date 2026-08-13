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
