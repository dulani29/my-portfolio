(function () {
  'use strict';

  // Enable reveal animations only when JS is running
  document.documentElement.classList.add('js');

  var toggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');

  // ---------- Mobile menu ----------
  function setMenu(open) {
    navLinks.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  navLinks.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1100) setMenu(false);
  });

  // ---------- Active nav link on scroll ----------
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function updateActive() {
    var y = window.scrollY + 140;
    var current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= y) current = s; });
    // Contact footer sits at the bottom of the page
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      current = document.getElementById('contact');
    }
    links.forEach(function (a) {
      a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id);
    });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  // ---------- Reveal on scroll ----------
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ---------- Project "View Details" toggles ----------
  document.querySelectorAll('.card__details').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('data-details'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });


  // ---------- Project screenshots: hide missing images + click to enlarge ----------
  document.querySelectorAll('.card__gallery').forEach(function (g) {
    g.querySelectorAll('img').forEach(function (im) {
      function drop() { im.remove(); if (!g.querySelector('img')) g.remove(); }
      im.addEventListener('error', drop);
      if (im.complete && im.naturalWidth === 0 && im.getAttribute('src')) { /* may still be lazy-loading */ }
    });
  });
  var lb = document.createElement('div');
  lb.className = 'lightbox'; lb.hidden = true;
  lb.innerHTML = '<button type="button" class="lightbox__close" aria-label="Close image">&times;</button><img alt="" />';
  document.body.appendChild(lb);
  function closeLb() { lb.hidden = true; document.body.classList.remove('lb-open'); }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.matches && t.matches('.card__gallery img')) {
      lb.querySelector('img').src = t.src; lb.querySelector('img').alt = t.alt;
      lb.hidden = false; document.body.classList.add('lb-open');
    } else if (!lb.hidden && (t === lb || t.classList.contains('lightbox__close'))) { closeLb(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  // ---------- Profile photo fallback ----------
  var img = document.getElementById('profile-img');
  var frame = img.parentElement;
  function showFallback() { frame.classList.add('no-photo'); }
  img.addEventListener('error', showFallback);
  if (img.complete && img.naturalWidth === 0) showFallback();

  // ---------- Placeholder links ----------
  // Links still set to "#" or an example address do nothing instead of jumping to the top.
  document.querySelectorAll('[data-todo-link]').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href === '#' || href.indexOf('example.com') !== -1) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        a.classList.add('is-placeholder');
      });
    }
  });

  // ---------- Skills carousel ----------
  var track = document.getElementById('skills-track');
  var prev = document.querySelector('.sk-arrow--prev');
  var next = document.querySelector('.sk-arrow--next');
  function updateArrows() {
    var max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 6;
    next.disabled = track.scrollLeft >= max;
  }
  [prev, next].forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = track.querySelector('.sk-card');
      var step = card.getBoundingClientRect().width + 20;
      track.scrollBy({ left: Number(btn.getAttribute('data-dir')) * step, behavior: 'smooth' });
    });
  });
  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();


  // ---------- Scroll progress bar + back-to-top ----------
  var bar = document.getElementById('progress');
  var toTop = document.getElementById('to-top');
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
    toTop.classList.toggle('show', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Typing effect in hero ----------
  var typed = document.getElementById('typed');
  if (typed && !reduce) {
    var words = typed.getAttribute('data-words').split('|');
    var w = 0, c = 0, del = false;
    typed.textContent = '';
    (function tick() {
      var word = words[w];
      c += del ? -1 : 1;
      typed.textContent = word.slice(0, c);
      var delay = del ? 45 : 90;
      if (!del && c === word.length) { del = true; delay = 1400; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; delay = 350; }
      setTimeout(tick, delay);
    })();
  }

  // ---------- Count-up numbers ----------
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = Number(el.getAttribute('data-count'));
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      var start = null;
      function step(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / 1200, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
    o.observe(el);
  });

  // ---------- Photo tilt (desktop pointer only) ----------
  var frameEl = document.querySelector('.photo-frame');
  if (frameEl && !reduce && window.matchMedia('(hover: hover)').matches) {
    var hp = frameEl.parentElement;
    hp.addEventListener('mousemove', function (e) {
      var r = frameEl.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      frameEl.style.transform = 'perspective(900px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg)';
    });
    hp.addEventListener('mouseleave', function () { frameEl.style.transform = ''; });
  }

  // ---------- Footer year ----------
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();


/* Eduflow screenshot slider */
(() => {
  const slider = document.getElementById("eduflow-slider");

  if (!slider) return;

  const image = slider.querySelector(".project-slider__image");
  const counter = document.getElementById("eduflow-counter");

  const screenshots = [
    "assets/eduflow/screen1.png",
    "assets/eduflow/screen2.png",
    "assets/eduflow/screen3.png",
    "assets/eduflow/screen4.png",
    "assets/eduflow/screen5.png",
    "assets/eduflow/screen6.png",
    "assets/eduflow/screen7.png"
  ];

  let currentSlide = 0;

  function showSlide(index) {
    currentSlide = (index + screenshots.length) % screenshots.length;

    image.src = screenshots[currentSlide];
    image.alt = `Eduflow screenshot ${currentSlide + 1} of ${screenshots.length}`;
    counter.textContent = `${currentSlide + 1} / ${screenshots.length}`;
  }

  slider.querySelectorAll(".slider-btn").forEach(button => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.direction);
      showSlide(currentSlide + direction);
    });
  });
})();
