/* Umplia site script: nav, hero loop, film dialog, reveal, first-touch UTM and the demo form. No dependencies. */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k) { try { return w.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { w.sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- first-touch attribution (sessionStorage, no cookies) ---------- */
  var FT = 'umplia-ft';
  if (!store.get(FT)) {
    var q = new URLSearchParams(w.location.search), ft = { landing_page: w.location.pathname + w.location.search, referrer: d.referrer || '' };
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (n) { var v = q.get(n); if (v) ft[n] = v.slice(0, 200); });
    store.set(FT, JSON.stringify(ft));
  }

  /* ---------- nav ---------- */
  var nav = d.querySelector('.nav'), burger = d.querySelector('.burger'), menu = d.getElementById('nav-menu');
  var dds = [].slice.call(d.querySelectorAll('.dd'));
  function onScroll() { if (nav) nav.classList.toggle('is-scrolled', w.scrollY > 8); }
  w.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  dds.forEach(function (dd) {
    dd.addEventListener('toggle', function () { if (dd.open) dds.forEach(function (o) { if (o !== dd) o.open = false; }); });
  });
  d.addEventListener('click', function (e) { if (!nav || nav.classList.contains('is-open')) return; dds.forEach(function (dd) { if (dd.open && !dd.contains(e.target)) dd.open = false; }); });
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', burger.getAttribute(open ? 'data-label-close' : 'data-label-open'));
    if (open) { var f = menu.querySelector('summary, a'); if (f) f.focus(); } else burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    nav.addEventListener('keydown', function (e) {
      if (!nav.classList.contains('is-open') || e.key !== 'Tab') return;
      var f = [].slice.call(nav.querySelectorAll('a[href], button:not([hidden]), summary')).filter(function (el) { return el.offsetParent !== null; });
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { nav.classList.remove('is-open'); d.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); } });
    w.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches && nav.classList.contains('is-open')) setMenu(false); });
  }
  d.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (nav && nav.classList.contains('is-open')) return setMenu(false);
    dds.forEach(function (dd) { if (dd.open) { dd.open = false; dd.querySelector('summary').focus(); } });
  });

  /* ---------- reveal ---------- */
  var reveals = d.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in w && !reduce) {
    root.classList.add('reveal-on');
    var ro = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); } }); }, { threshold: 0.15 });
    [].forEach.call(reveals, function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < w.innerHeight) el.classList.add('is-in');
      ro.observe(el);
    });
  }

  /* ---------- hero loop ---------- */
  var filmOpen = false, syncHero = function () {};
  var frame = d.querySelector('.hero .media-frame'), hv = frame && frame.querySelector('.hero-video');
  if (hv) {
    var btn = frame.querySelector('.vid-toggle');
    var conn = navigator.connection || {};
    var slow = !!conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || '');
    var KEY = 'umplia-hero';
    var userPaused = reduce || slow || store.get(KEY) === 'paused';
    var loaded = false, visible = false;
    var pick = function () {
      var lg = w.innerWidth >= 900 && (w.devicePixelRatio || 1) * w.innerWidth >= 1400;
      var av1 = hv.canPlayType('video/mp4; codecs="av01.0.08M.08"') === 'probably';
      return hv.getAttribute('data-' + (av1 ? 'av1' : 'h264') + '-' + (lg ? 'lg' : 'sm'));
    };
    var paint = function () {
      var paused = userPaused || hv.paused;
      btn.classList.toggle('is-paused', paused);
      btn.setAttribute('aria-label', btn.getAttribute(paused ? 'data-play' : 'data-pause'));
    };
    var play = function () {
      if (!loaded) { loaded = true; hv.src = pick(); }
      var p = hv.play(); if (p && p.catch) p.catch(function () { paint(); });
    };
    syncHero = function () {
      if (visible && !userPaused && !filmOpen && !d.hidden) play();
      else if (loaded && !hv.paused) hv.pause();
      paint();
    };
    hv.addEventListener('playing', function () { frame.classList.add('is-playing'); paint(); });
    hv.addEventListener('pause', paint);
    btn.hidden = false;
    btn.addEventListener('click', function () {
      userPaused = !userPaused;
      store.set(KEY, userPaused ? 'paused' : 'playing');
      syncHero();
    });
    d.addEventListener('visibilitychange', function () { syncHero(); });
    var start = function () {
      var r = frame.getBoundingClientRect();
      visible = r.top < w.innerHeight * 0.85 && r.bottom > 0;
      syncHero();
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; syncHero(); }, { threshold: 0.15 }).observe(frame);
    };
    paint();
    if (d.readyState === 'complete') start(); else w.addEventListener('load', start);
  }

  /* ---------- film dialog ---------- */
  var dlg = d.getElementById('film');
  if (dlg && typeof dlg.showModal === 'function') {
    var fv = dlg.querySelector('video'), opener = null;
    d.addEventListener('click', function (e) {
      var t = e.target.closest('[data-film]');
      if (!t) return;
      e.preventDefault();
      opener = t; filmOpen = true; syncHero();
      if (!fv.getAttribute('src')) fv.src = fv.getAttribute(w.innerWidth >= 900 ? 'data-src-lg' : 'data-src-sm');
      dlg.showModal();
      var p = fv.play(); if (p && p.catch) p.catch(function () {});
    });
    dlg.querySelector('[data-close]').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { fv.pause(); filmOpen = false; syncHero(); if (opener) opener.focus(); });
  }

  /* ---------- inline film (launch page): chapters and ?t= ---------- */
  var inline = d.getElementById('video');
  if (inline) {
    var seek = function (t) { inline.currentTime = t; var p = inline.play(); if (p && p.catch) p.catch(function () {}); };
    [].forEach.call(d.querySelectorAll('.chapter'), function (b) {
      b.addEventListener('click', function () { inline.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); seek(Number(b.getAttribute('data-t'))); });
    });
    var t0 = Number(new URLSearchParams(w.location.search).get('t'));
    if (t0 > 0) inline.addEventListener('loadedmetadata', function () { inline.currentTime = t0; }, { once: true });
  }

  /* ---------- demo form (Formspree) ---------- */
  var FORMSPREE = 'https://formspree.io/f/xdalqnkp';
  var FREE_PROVIDERS = ['gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.es', 'hotmail.co', 'hotmail.com.ar', 'outlook.com', 'outlook.es', 'outlook.com.co', 'outlook.com.pe', 'live.com', 'live.com.mx', 'msn.com', 'yahoo.com', 'yahoo.es', 'yahoo.com.mx', 'yahoo.com.ar', 'yahoo.com.co', 'yahoo.com.pe', 'ymail.com', 'aol.com', 'icloud.com', 'me.com', 'mac.com', 'protonmail.com', 'proton.me', 'tutanota.com', 'tutanota.de', 'gmx.com', 'gmx.net', 'gmx.de', 'mail.com', 'zoho.com', 'yandex.com', 'yandex.ru', 'fastmail.com', 'hey.com', 'rocketmail.com', 'inbox.com', 'mail.ru', 'qq.com', '163.com', '126.com', 'foxmail.com', 'sina.com', 'duck.com', 'duckduckgo.com'];
  [].forEach.call(d.querySelectorAll('form[data-form]'), function (form) {
    var ok = form.nextElementSibling, status = form.querySelector('.form-status'), submit = form.querySelector('[type=submit]');
    var msg = function (k) { return form.getAttribute('data-msg-' + k) || ''; };
    var field = function (n) { return form.elements[n]; };
    var setErr = function (input, text) {
      var el = d.getElementById(input.getAttribute('aria-describedby'));
      if (text) { input.setAttribute('aria-invalid', 'true'); el.textContent = text; el.hidden = false; }
      else { input.removeAttribute('aria-invalid'); el.textContent = ''; el.hidden = true; }
      return !text;
    };
    var validate = function () {
      var first = null;
      ['nombre', 'apellido', 'empresa', 'email', 'celular'].forEach(function (n) {
        var i = field(n), v = i.value.trim(), e = '';
        if (!v) e = msg('required');
        else if (n === 'email') {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) e = msg('email');
          else if (FREE_PROVIDERS.indexOf(v.split('@')[1].toLowerCase()) !== -1) e = msg('corp');
        } else if (n === 'celular' && v.replace(/\D/g, '').length < 7) e = msg('phone');
        if (!setErr(i, e) && !first) first = i;
      });
      var c = field('consentimiento');
      if (!setErr(c, c.checked ? '' : msg('consent')) && !first) first = c;
      if (first) first.focus();
      return !first;
    };
    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) setErr(e.target, ''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      if (!validate()) return;
      var done = function () {
        ok.querySelector('[data-ok-text]').textContent = msg('ok').replace('{nombre}', field('nombre').value.trim()).replace('{email}', field('email').value.trim());
        form.hidden = true; ok.hidden = false; ok.focus();
      };
      if (field('_gotcha').value) return done();
      var data = {
        nombre: field('nombre').value.trim(),
        apellido: field('apellido').value.trim(),
        empresa: field('empresa').value.trim(),
        email: field('email').value.trim(),
        celular: field('celular').value.trim(),
        source: field('source').value,
        page: w.location.pathname,
        lang: field('lang').value,
        consentimiento: 'sí',
        consentimiento_version: field('consentimiento_version').value
      };
      try { var t = JSON.parse(store.get(FT) || '{}'); for (var k in t) data[k] = t[k]; } catch (err) {}
      submit.disabled = true; var label = submit.textContent; submit.textContent = msg('sending');
      fetch(FORMSPREE, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(String(r.status)); done(); })
        .catch(function () { status.textContent = msg('fail'); })
        .then(function () { submit.disabled = false; submit.textContent = label; });
    });
  });
})();
