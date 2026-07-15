/* ==========================================================
   MARTINEZ HUNTING EXPEDITIONS — main.js
   Vanilla JS · sin dependencias · v20260713
   Patrón: cada init va envuelto en safe() — si uno falla,
   el resto sigue funcionando. El contenido está hardcodeado
   en HTML: este script solo enriquece.
   ========================================================== */
(function () {
  "use strict";

  function safe(fn, name) {
    try { fn(); } catch (e) {
      if (window.console && console.warn) console.warn("[MHE] init falló:", name, e);
    }
  }

  /* ---------- Splash (doble red de seguridad) ---------- */
  function initSplash() {
    var splash = document.getElementById("splash");
    if (!splash) return;
    // La animación CSS ya lo oculta a los 2.2s aunque este JS no corra.
    setTimeout(function () { splash.classList.add("is-hidden"); }, 2600);
    // Red de seguridad del título del hero: visible a los 4s pase lo que pase.
    setTimeout(function () { document.body.classList.add("hero-shown"); }, 4000);
  }

  /* ---------- Header al hacer scroll ---------- */
  function initHeader() {
    var header = document.getElementById("header");
    if (!header) return;
    var update = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Menú móvil ---------- */
  function initBurger() {
    var burger = document.getElementById("burger");
    var nav = document.getElementById("nav");
    if (!burger || !nav) return;
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    var showAll = function () {
      for (var i = 0; i < items.length; i++) items[i].classList.add("is-visible");
    };

    if (!("IntersectionObserver" in window)) { showAll(); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.03, rootMargin: "0px 0px -5% 0px" });

    items.forEach(function (el) { io.observe(el); });

    // Red de seguridad: a los 6s, cualquier cosa aún oculta se muestra.
    setTimeout(showAll, 6000);
  }

  /* ---------- Contadores del manifiesto ---------- */
  function initCounters() {
    var nums = document.querySelectorAll(".manifesto__num[data-count]");
    if (!nums.length) return;

    var animate = function (el) {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var start = null;
      var dur = 1400;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      nums.forEach(function (el) {
        el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.03 });

    nums.forEach(function (el) { io.observe(el); });

    // Red de seguridad: valores finales a los 6s pase lo que pase.
    setTimeout(function () {
      nums.forEach(function (el) {
        if (!el.dataset.done) {
          el.dataset.done = "1";
          el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
        }
      });
    }, 6000);
  }

  /* ---------- Pestañas de especies ---------- */
  function initSpeciesTabs() {
    var tabs = document.querySelectorAll(".species__tab");
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var targetId = tab.getAttribute("data-target");
        var panel = document.getElementById(targetId);
        if (!panel) return;

        tabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
        });

        document.querySelectorAll(".species__panel").forEach(function (p) {
          p.hidden = p !== panel;
        });
      });
    });
  }

  /* ---------- Comparador macho / hembra (slider) ---------- */
  function initCompare() {
    var compares = document.querySelectorAll(".compare");
    if (!compares.length) return;

    compares.forEach(function (compare) {
      var slider = compare.querySelector("[data-compare-slider]");
      var male = compare.querySelector(".compare__frame--male");
      var divider = compare.querySelector(".compare__divider");
      var handle = compare.querySelector(".compare__handle");
      var label = compare.querySelector("[data-compare-label]");
      if (!slider || !male) return;

      var update = function () {
        var v = Number(slider.value);
        male.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
        if (divider) divider.style.left = v + "%";
        if (handle) handle.style.left = v + "%";
        if (label) label.textContent = v >= 50 ? "Macho" : "Hembra";
      };

      slider.addEventListener("input", update);
      update();
    });
  }

  /* ---------- Galería con lightbox ---------- */
  function initGallery() {
    var items = document.querySelectorAll("[data-gallery-item]");
    var lightbox = document.getElementById("lightbox");
    if (!items.length || !lightbox) return;

    var content = lightbox.querySelector("[data-lightbox-content]");
    var closeBtn = lightbox.querySelector("[data-lightbox-close]");

    var open = function (html) {
      content.innerHTML = html;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    };
    var close = function () {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      content.innerHTML = "";
    };

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        open(item.innerHTML);
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- Parallax sutil del topo del hero ---------- */
  function initParallax() {
    var topo = document.querySelector(".hero__topo");
    if (!topo) return;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          topo.style.transform = "translateY(" + (y * 0.18) + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Arranque ---------- */
  function boot() {
    safe(initSplash, "splash");
    safe(initHeader, "header");
    safe(initBurger, "burger");
    safe(initReveals, "reveals");
    safe(initCounters, "counters");
    safe(initSpeciesTabs, "speciesTabs");
    safe(initCompare, "compare");
    safe(initGallery, "gallery");
    safe(initParallax, "parallax");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
