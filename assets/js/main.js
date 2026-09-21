(function () {
  "use strict";

  /* ---------- Pricing data (edit prices and items here) ---------- */
  var PLANS = {
    interior: [
      { level: "Classic", price: 45, items: [
        "Aspiration complète", "Nettoyage des surfaces plastiques", "Nettoyage des vitres intérieures"
      ]},
      { level: "Premium", price: 95, top: true, items: [
        "Nettoyage et soin complet du tableau de bord au Tornador",
        "Nettoyage et entretien de tous les plastiques intérieurs",
        "Aspiration à sec de l'habitacle et du coffre",
        "Nettoyage des vitres intérieures",
        "Nettoyage des panneaux de portes",
        "Nettoyage de l'intérieur des portes",
        "Lavage complet des moquettes à l'extracteur",
        "Conditionnement du cuir"
      ]},
      { level: "All-in", price: 110, items: [
        "Nettoyage des seuils de portes",
        "Nettoyage et soin complet du tableau de bord au Tornador",
        "Protection et brillance des plastiques intérieurs",
        "Aspiration et shampouinage des moquettes et du coffre",
        "Shampouinage des sièges en tissu et traitement cuir",
        "Nettoyage en profondeur des vitres intérieures",
        "Désodorisant textile",
        "Parfum d'ambiance"
      ]}
    ],
    exterior: [
      { level: "Classic", price: 35, items: [
        "Lavage haute pression", "Séchage à la main", "Nettoyage des jantes"
      ]},
      { level: "Premium", price: 55, top: true, items: [
        "Prélavage extérieur",
        "Lavage extérieur",
        "Élimination des traces d'insectes légères",
        "Nettoyage des jantes ou enjoliveurs (parties extérieures)",
        "Nettoyage des vitres extérieures",
        "Élimination des impuretés par décontamination"
      ]},
      { level: "All-in", price: 80, items: [
        "Prélavage extérieur",
        "Lavage extérieur",
        "Nettoyage des jantes et pneus",
        "Élimination des impuretés par décontamination",
        "Nettoyage et rénovation des plastiques extérieurs",
        "Polissage cire protectrice (Koch Chemie)",
        "Lustrage pneus",
        "Élimination des traces d'insectes légères"
      ]}
    ],
    combo: [
      { level: "Classic", price: 70, top: true, items: [
        "Aspiration complète", "Nettoyage des surfaces plastiques",
        "Nettoyage des vitres intérieures et extérieures",
        "Lavage haute pression", "Séchage à la main", "Nettoyage des jantes"
      ]},
      { level: "Duo Classic", price: 120, vehicles: 2, items: [
        "Tout le Classic", "Pour 2 véhicules"
      ]}
    ]
  };
  var TAB_NAMES = { interior: "Intérieur", exterior: "Extérieur", combo: "Intérieur & extérieur" };
  var SIZE_NAMES = { 0: "Citadine", 10: "Berline", 20: "SUV" };

  var state = { tab: "interior", size: 0 };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE_OUT = "cubic-bezier(.22, 1, .36, 1)";

  /* ---------- Loader ---------- */
  var loader = $("#loader");
  function hideLoader() { if (loader) loader.classList.add("hide"); }
  window.addEventListener("load", function () { setTimeout(hideLoader, 450); });
  setTimeout(hideLoader, 2800);

  /* ---------- Pricing section ---------- */
  var panel = $("#panel"), note = $("#plan-note");

  function renderPlans() {
    var plans = PLANS[state.tab];
    panel.className = "plans" + (plans.length === 2 ? " two" : "");
    panel.setAttribute("aria-labelledby", "tab-" + state.tab);
    panel.innerHTML = plans.map(function (p) {
      var total = p.price + state.size * (p.vehicles || 1);
      var forText = SIZE_NAMES[state.size];
      if (p.vehicles) forText += ", " + p.vehicles + " vehicles";
      return '<article class="plan' + (p.top ? " plan--top" : "") + '">' +
        (p.top ? '<span class="plan__badge">Recommended</span>' : "") +
        '<div class="plan__level">' + p.level + '</div>' +
        '<div class="plan__price"><sup>€</sup>' + total + '</div>' +
        '<div class="plan__for">' + forText + '</div>' +
        '<ul>' + p.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + '</ul>' +
        '<a class="btn" href="#contact" data-book="' + TAB_NAMES[state.tab] + " " + p.level + '"><span>Book this</span></a>' +
      '</article>';
    }).join("");
    note.textContent = state.tab === "combo"
      ? "Les suppléments Berline et SUV s'appliquent à chaque véhicule dans la formule Duo."
      : "";
  }

  function setTab(name) {
    state.tab = name;
    $$('.tabs [role="tab"]').forEach(function (b) {
      b.setAttribute("aria-selected", b.dataset.tab === name ? "true" : "false");
      b.tabIndex = b.dataset.tab === name ? 0 : -1;
    });
    renderPlans();
  }

  $$('.tabs [role="tab"]').forEach(function (b, i, all) {
    b.addEventListener("click", function () { setTab(b.dataset.tab); });
    b.addEventListener("keydown", function (e) {
      var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!n) return;
      var t = all[(i + n + all.length) % all.length];
      t.focus(); setTab(t.dataset.tab);
    });
  });
  $$('input[name="size"]').forEach(function (r) {
    r.addEventListener("change", function () { state.size = Number(r.value); renderPlans(); syncQuoteSize(); });
  });
  $$("a[data-tab]").forEach(function (a) {
    a.addEventListener("click", function () { setTab(a.dataset.tab); });
  });

  /* ---------- Package select in the form ---------- */
  var sel = $("#packageSelect");
  var opts = [];
  Object.keys(PLANS).forEach(function (k) {
    PLANS[k].forEach(function (p) { opts.push(TAB_NAMES[k] + " " + p.level); });
  });
  opts.push("Options ou autre service", "Pas sûr encore, merci de me conseiller");
  sel.innerHTML = opts.map(function (o) { return "<option>" + o + "</option>"; }).join("");

  panel.addEventListener("click", function (e) {
    var a = e.target.closest("[data-book]");
    if (a) sel.value = a.dataset.book;
  });

  /* ---------- Hero quick quote ---------- */
  var q = { type: "interior", level: 0, size: 0 };
  var qLevel = $("#qLevel"), qPrice = $("#qPrice"), qInc = $("#qInc"), qBook = $("#qBook");
  var shown = 45, tween;

  function animatePrice(to) {
    if (reduce) { qPrice.textContent = to; shown = to; return; }
    cancelAnimationFrame(tween);
    var from = shown, t0 = null;
    (function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / 350, 1), e = 1 - Math.pow(1 - k, 3);
      shown = Math.round(from + (to - from) * e);
      qPrice.textContent = shown;
      if (k < 1) tween = requestAnimationFrame(step);
    })(performance.now());
  }
  function summary(p) {
    var it = p.items;
    if (p.vehicles) return "Nettoyage intérieur et extérieur formule Classic pour 2 véhicules.";
    return it.slice(0, 3).join(", ") + (it.length > 3 ? " et " + (it.length - 3) + " autres." : ".");
  }
  function renderQuote() {
    var plans = PLANS[q.type];
    if (q.level >= plans.length) q.level = 0;
    qLevel.innerHTML = plans.map(function (p, i) {
      return '<button type="button" data-v="' + i + '" aria-pressed="' + (i === q.level) + '">' + p.level + "</button>";
    }).join("");
    var p = plans[q.level];
    animatePrice(p.price + q.size * (p.vehicles || 1));
    qInc.textContent = summary(p);
    qBook.dataset.book = TAB_NAMES[q.type] + " " + p.level;
  }
  function pressGroup(group, val) {
    $$("button", group).forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === String(val))); });
  }
  $("#qType").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    q.type = b.dataset.v; q.level = 0; pressGroup(this, q.type); renderQuote();
  });
  qLevel.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    q.level = Number(b.dataset.v); renderQuote();
  });
  $("#qSize").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    q.size = Number(b.dataset.v); pressGroup(this, q.size); renderQuote();
    var r = $('input[name="size"][value="' + q.size + '"]'); if (r) { r.checked = true; state.size = q.size; renderPlans(); }
  });
  function syncQuoteSize() {
    q.size = state.size; pressGroup($("#qSize"), q.size); renderQuote();
  }
  qBook.addEventListener("click", function () {
    sel.value = qBook.dataset.book;
    var vs = $('select[name="vehicle"]'); if (vs) vs.value = SIZE_NAMES[q.size];
  });

  setTab("interior");
  renderQuote();

  /* ---------- Contact form -> email ---------- */
  var form = $("#form"), hint = $("#formHint");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements, ok = true;
    ["name", "phone"].forEach(function (n) {
      var bad = !f[n].value.trim();
      f[n].classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { hint.textContent = "Veuillez indiquer votre nom et votre téléphone."; return; }
    var body = [
      "Name: " + f.name.value.trim(),
      "Phone: " + f.phone.value.trim(),
      "Vehicle: " + f.vehicle.value,
      "Package: " + f.package.value,
      "",
      f.message.value.trim()
    ].join("\n");
    window.location.href = "mailto:info.cm.ride@gmail.com?subject=" +
      encodeURIComponent("Booking request: " + f.package.value) + "&body=" + encodeURIComponent(body);
    hint.textContent = "Votre application email devrait s'ouvrir. Si ce n'est pas le cas, écrivez à info.cm.ride@gmail.com.";
  });

  /* ---------- Hamburger menu (medium screens and below) ----------
     The panel slides open and shut with the Web Animations API.
     Change MENU_BREAKPOINT together with the 991px media query in style.css. */
  var MENU_BREAKPOINT = "(max-width: 991px)";
  var burger = $("#burger"), menu = $("#menu"), nav = $(".nav");
  var mobileMq = window.matchMedia(MENU_BREAKPOINT);
  var menuOpen = false, menuAnims = [];
  var HIDDEN = { clipPath: "inset(0 0 100% 0 round 20px)", opacity: 0, transform: "translateY(-12px)" };
  var SHOWN = { clipPath: "inset(0 0 0% 0 round 20px)", opacity: 1, transform: "translateY(0)" };

  function stopMenuAnims() { menuAnims.forEach(function (a) { a.cancel(); }); menuAnims = []; }
  function setBurger(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  }
  function openMenu() {
    if (!mobileMq.matches || menuOpen) return;
    menuOpen = true; stopMenuAnims();
    menu.classList.add("open"); setBurger(true);
    if (reduce || !menu.animate) return;
    menuAnims.push(menu.animate([HIDDEN, SHOWN], { duration: 460, easing: EASE_OUT }));
    $$("a", menu).forEach(function (a, i) {
      menuAnims.push(a.animate(
        [{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 420, delay: 100 + i * 50, easing: EASE_OUT, fill: "backwards" }
      ));
    });
  }
  function closeMenu(instant) {
    if (!menuOpen) return;
    menuOpen = false; stopMenuAnims(); setBurger(false);
    if (instant || reduce || !menu.animate || !mobileMq.matches) { menu.classList.remove("open"); return; }
    var a = menu.animate([SHOWN, HIDDEN], { duration: 320, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "forwards" });
    menuAnims.push(a);
    a.onfinish = function () { menu.classList.remove("open"); a.cancel(); };
  }
  burger.addEventListener("click", function () { menuOpen ? closeMenu() : openMenu(); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { closeMenu(); }); });
  document.addEventListener("click", function (e) {
    if (menuOpen && !menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });
  function onBreakpoint() { if (!mobileMq.matches) { stopMenuAnims(); menuOpen = false; menu.classList.remove("open"); setBurger(false); } }
  if (mobileMq.addEventListener) mobileMq.addEventListener("change", onBreakpoint); else mobileMq.addListener(onBreakpoint);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenu(); if (!lb.hidden) closeLightbox(); }
  });
  window.addEventListener("scroll", function () { nav.classList.toggle("scrolled", window.scrollY > 10); }, { passive: true });

  /* ---------- Active link + reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var links = {};
    $$("a:not(.btn)", menu).forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          $$("a", menu).forEach(function (a) { a.classList.remove("active"); });
          links[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });

    var rv = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); rv.unobserve(en.target); }
      });
    }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      rv.observe(el);
    });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Before / after ---------- */
  var cmp = $("#compare");
  if (cmp) {
    var range = $("input", cmp), touched = false;
    var setPos = function (v) { cmp.style.setProperty("--pos", v + "%"); };
    range.addEventListener("input", function () { touched = true; setPos(range.value); });
    ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
      cmp.addEventListener(ev, function () { touched = true; }, { passive: true });
    });
    setPos(range.value);

    /* One small nudge the first time it scrolls into view, so people see it is draggable */
    if (!reduce && "IntersectionObserver" in window) {
      var nudge = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        nudge.disconnect();
        var t0 = null, dur = 1700;
        (function step(t) {
          if (touched) return;
          if (!t0) t0 = t;
          var k = Math.min((t - t0) / dur, 1);
          var v = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k * .4);
          range.value = v; setPos(v);
          if (k < 1) requestAnimationFrame(step); else { range.value = 50; setPos(50); }
        })(performance.now());
      }, { threshold: .7 });
      nudge.observe(cmp);
    }
  }

  /* ---------- Gallery lightbox ---------- */
  var shots = $$(".shot"), lb = $("#lightbox"), lbImg = $("img", lb), lbCount = $(".lightbox__count", lb);
  var lbIndex = 0, lbReturn = null;
  function showShot(i) {
    lbIndex = (i + shots.length) % shots.length;
    var s = shots[lbIndex];
    lbImg.src = s.getAttribute("href");
    lbImg.alt = $("img", s).alt;
    lbCount.textContent = (lbIndex + 1) + " / " + shots.length;
    [lbIndex + 1, lbIndex - 1].forEach(function (n) {
      var pre = new Image(); pre.src = shots[(n + shots.length) % shots.length].getAttribute("href");
    });
  }
  function openLightbox(i) {
    lbReturn = document.activeElement;
    showShot(i); lb.hidden = false;
    document.body.classList.add("lb-open");
    $(".lightbox__close", lb).focus();
  }
  function closeLightbox() {
    lb.hidden = true; lbImg.removeAttribute("src");
    document.body.classList.remove("lb-open");
    if (lbReturn && lbReturn.focus) lbReturn.focus();
  }
  shots.forEach(function (s, i) {
    s.addEventListener("click", function (e) { e.preventDefault(); openLightbox(i); });
  });
  $(".lightbox__nav--prev", lb).addEventListener("click", function () { showShot(lbIndex - 1); });
  $(".lightbox__nav--next", lb).addEventListener("click", function () { showShot(lbIndex + 1); });
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.closest(".lightbox__close")) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "ArrowLeft") showShot(lbIndex - 1);
    else if (e.key === "ArrowRight") showShot(lbIndex + 1);
    else if (e.key === "Tab") {
      var f = $$("button", lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var swipeX = null;
  lb.addEventListener("touchstart", function (e) { swipeX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (swipeX === null) return;
    var dx = e.changedTouches[0].clientX - swipeX; swipeX = null;
    if (Math.abs(dx) > 50) showShot(lbIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- FAQ: smooth open and close ---------- */
  $$(".faq details").forEach(function (d) {
    var head = $("summary", d), body = $(".faq__a", d), run = null;
    head.addEventListener("click", function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (run) run.cancel();
      if (d.open && !d.classList.contains("closing")) {
        d.classList.add("closing");
        run = body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 280, easing: "ease" });
        run.onfinish = function () { d.open = false; d.classList.remove("closing"); run = null; };
      } else {
        d.classList.remove("closing"); d.open = true;
        run = body.animate([{ height: "0px", opacity: 0 }, { height: body.offsetHeight + "px", opacity: 1 }], { duration: 340, easing: EASE_OUT });
        run.onfinish = function () { run = null; };
      }
    });
  });

  /* ---------- Hero bubbles ---------- */
  var bub = $("#bubbles");
  if (bub && !reduce) {
    var count = window.innerWidth < 700 ? 8 : 18;
    for (var i = 0; i < count; i++) {
      var b = document.createElement("span"), s = 8 + Math.random() * 38;
      b.style.width = b.style.height = s + "px";
      b.style.left = Math.random() * 100 + "%";
      b.style.animationDuration = 9 + Math.random() * 12 + "s";
      b.style.animationDelay = -Math.random() * 20 + "s";
      b.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
      b.style.opacity = .35 + Math.random() * .5;
      bub.appendChild(b);
    }
  }

  /* ---------- Hero background video ----------
     Muted, no controls, loops forever. The script only makes sure it keeps playing:
     it retries if the browser blocks autoplay, resumes when the tab returns, and pauses
     while the hero is off screen so the rest of the page stays smooth. */
  var hv = $("#heroVideo");
  if (hv) {
    var saveData = navigator.connection && navigator.connection.saveData;
    if (reduce || saveData) {
      var srcEl = $("source", hv);
      hv.removeAttribute("autoplay"); hv.pause();
      if (srcEl) { srcEl.remove(); hv.load(); }   /* shows the poster image only */
    } else {
      var heroInView = true;
      hv.muted = true; hv.defaultMuted = true; hv.loop = true;
      var play = function () {
        if (!heroInView || document.hidden) return;
        var p = hv.play();
        if (p && p.catch) p.catch(function () {});
      };
      hv.addEventListener("loadeddata", play);
      hv.addEventListener("canplay", play);
      hv.addEventListener("pause", function () { if (heroInView && !document.hidden && !hv.ended) setTimeout(play, 150); });
      document.addEventListener("visibilitychange", play);
      ["touchstart", "pointerdown", "keydown", "scroll"].forEach(function (ev) {
        window.addEventListener(ev, function retry() {
          if (hv.paused) play();
          else window.removeEventListener(ev, retry);
        }, { passive: true });
      });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          heroInView = entries[0].isIntersecting;
          if (heroInView) play(); else hv.pause();
        }).observe(hv.parentElement);
      }
      play();
    }
  }

  $("#year").textContent = new Date().getFullYear();
})();
