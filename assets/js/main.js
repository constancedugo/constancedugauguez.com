/* ==========================================================================
   Constance — portfolio
   Lenis smooth scroll + GSAP/ScrollTrigger micro-interactions
   ========================================================================== */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var html = document.documentElement;
  html.classList.add("js");
  if (reducedMotion) html.classList.add("reduced-motion");

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setupNav();
    setupFooterYear();
    fitHeadlines();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        fitHeadlines();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      }, 150);
    });

    if (!reducedMotion && window.gsap) {
      setupLenis();
      setupReveals();
      setupCursor();
    } else if (window.gsap) {
      // Reduced motion: snap everything to its final visible state, no animation.
      gsap.set(".line > span", { yPercent: 0 });
      gsap.set(".reveal-img", { clipPath: "inset(0% 0 0 0)" });
      gsap.set(".reveal-img img", { scale: 1 });
      gsap.set(".hero__eyebrow, .hero__subtitle, .hero .pill-btn", { opacity: 1, y: 0 });
    }

    setupPageTransitions();
    revealPage();
  }

  /* -----------------------------------------------------------------------
     Page entrance / exit transitions
     -------------------------------------------------------------------- */

  function revealPage() {
    if (!reducedMotion && window.gsap) {
      gsap.set(document.body, { y: 12 });
      gsap.to(document.body, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        // A leftover transform (even an identity matrix) on <body> creates a new
        // containing block for every position:fixed descendant (nav, mobile menu,
        // cursor), breaking them site-wide. Strip it once the entrance settles.
        onComplete: function () {
          document.body.style.transform = "";
          document.body.style.translate = "";
        },
      });
    } else {
      document.body.style.opacity = 1;
    }
  }

  function setupPageTransitions() {
    document.addEventListener("click", function (e) {
      var link = e.target.closest("a");
      if (!link) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      if (link.href.indexOf("mailto:") === 0 || link.href.indexOf("tel:") === 0) return;

      var url;
      try {
        url = new URL(link.href);
      } catch (err) {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return; // in-page anchor

      e.preventDefault();
      var dest = link.href;

      if (!reducedMotion && window.gsap) {
        gsap.to(document.body, {
          opacity: 0,
          y: -12,
          duration: 0.45,
          ease: "power2.in",
          onComplete: function () {
            window.location.href = dest;
          },
        });
      } else {
        window.location.href = dest;
      }
    });
  }

  /* -----------------------------------------------------------------------
     Nav: mobile burger + active link
     -------------------------------------------------------------------- */

  function setupNav() {
    var burger = document.querySelector(".burger");
    var mobileNav = document.querySelector(".nav__mobile");
    if (burger && mobileNav) {
      burger.addEventListener("click", function () {
        var isOpen = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", String(!isOpen));
        mobileNav.classList.toggle("is-open", !isOpen);
        document.body.style.overflow = !isOpen ? "hidden" : "";
      });

      mobileNav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          burger.setAttribute("aria-expanded", "false");
          mobileNav.classList.remove("is-open");
          document.body.style.overflow = "";
        });
      });
    }
  }

  function setupFooterYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* -----------------------------------------------------------------------
     Display type is sized in vw and can overflow narrow words/containers
     at some viewport widths. Shrink-to-fit after fonts load, per element.
     -------------------------------------------------------------------- */

  function availableWidth(container) {
    var cs = getComputedStyle(container);
    return container.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
  }

  function fitHeadlines() {
    var run = function () {
      var selector =
        ".hero-title .line > span, .section-title .line > span, " +
        ".footer-title .line > span, .project-hero__title .line > span, " +
        ".next-project__name";

      document.querySelectorAll(selector).forEach(function (el) {
        el.style.fontSize = ""; // reset to CSS clamp value before measuring
        var container = el.parentElement;
        var available = availableWidth(container);
        var natural = el.scrollWidth;
        if (available > 0 && natural > available) {
          var current = parseFloat(getComputedStyle(el).fontSize);
          el.style.fontSize = current * (available / natural) * 0.97 + "px";
        }
      });
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        run();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    }
    run();
  }

  /* -----------------------------------------------------------------------
     Lenis smooth scroll wired into GSAP's ticker + ScrollTrigger
     -------------------------------------------------------------------- */

  function setupLenis() {
    if (!window.Lenis) return;

    var lenis = new Lenis({
      duration: 1.15,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* -----------------------------------------------------------------------
     Reveal animations: headline lines + images
     -------------------------------------------------------------------- */

  function setupReveals() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero: intro timeline on load (above the fold, not scroll-triggered)
    var heroTitleSpans = document.querySelectorAll(".hero-title .line > span");
    var heroEyebrow = document.querySelector(".hero__eyebrow");
    var heroSubtitle = document.querySelector(".hero__subtitle");
    var heroCta = document.querySelector(".hero .pill-btn");
    var heroMedia = document.querySelector(".hero__media");

    if (heroTitleSpans.length) {
      gsap.set(heroTitleSpans, { yPercent: 100 });
      if (heroEyebrow) gsap.set(heroEyebrow, { opacity: 0, y: 16 });
      if (heroSubtitle) gsap.set(heroSubtitle, { opacity: 0, y: 16 });
      if (heroCta) gsap.set(heroCta, { opacity: 0, y: 16 });
      if (heroMedia) {
        gsap.set(heroMedia, { clipPath: "inset(100% 0 0 0)" });
        gsap.set(heroMedia.querySelector("img"), { scale: 1.15 });
      }

      var heroTl = gsap.timeline({ delay: 0.3, defaults: { ease: "power4.out" } });
      heroTl
        .to(heroTitleSpans, { yPercent: 0, duration: 1.1, stagger: 0.08 })
        .to(heroEyebrow, { opacity: 1, y: 0, duration: 0.7 }, "-=0.7")
        .to(heroSubtitle, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
        .to(heroCta, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");

      if (heroMedia) {
        heroTl.to(
          heroMedia,
          { clipPath: "inset(0% 0 0 0)", duration: 1.2 },
          "-=1"
        );
        heroTl.to(
          heroMedia.querySelector("img"),
          { scale: 1, duration: 1.4, ease: "power3.out" },
          "<"
        );
      }
    }

    // Every other headline: reveal on scroll
    var scrollLines = document.querySelectorAll(
      ".section-title .line > span, .footer-title .line > span, .project-hero__title .line > span, .case-block__heading, .next-project__name"
    );

    document.querySelectorAll(".line > span").forEach(function (span) {
      var parentTitle = span.closest(".hero-title");
      if (parentTitle) return; // already handled above
      gsap.set(span, { yPercent: 100 });
      ScrollTrigger.create({
        trigger: span.closest(".line") || span,
        start: "top 88%",
        onEnter: function () {
          gsap.to(span, { yPercent: 0, duration: 1, ease: "power4.out" });
        },
      });
    });

    document.querySelectorAll(".case-block__heading, .next-project__name").forEach(function (el) {
      gsap.set(el, { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        onEnter: function () {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" });
        },
      });
    });

    // Image reveals: clip-path wipe + scale settle
    // (.hero__media is excluded — it's driven by the hero entrance timeline above)
    document.querySelectorAll(".reveal-img:not(.hero__media)").forEach(function (frame, i) {
      var img = frame.querySelector("img");
      gsap.set(frame, { clipPath: "inset(100% 0 0 0)" });
      if (img) gsap.set(img, { scale: 1.15 });

      ScrollTrigger.create({
        trigger: frame,
        start: "top 85%",
        onEnter: function () {
          gsap.to(frame, { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "power4.out" });
          if (img) gsap.to(img, { scale: 1, duration: 1.4, ease: "power3.out" });
        },
      });
    });

    // Meta / body fade-ups
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      gsap.set(el, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        onEnter: function () {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
        },
      });
    });
  }

  /* -----------------------------------------------------------------------
     Custom cursor: "voir →" bubble that follows the pointer over project cards
     -------------------------------------------------------------------- */

  function setupCursor() {
    var cards = document.querySelectorAll(".project-card");
    if (!cards.length) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    var cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<span>voir <span aria-hidden="true">&rarr;</span></span>';
    document.body.appendChild(cursor);

    var mouseX = 0,
      mouseY = 0,
      curX = 0,
      curY = 0;

    window.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    gsap.ticker.add(function () {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      cursor.style.left = curX + "px";
      cursor.style.top = curY + "px";
    });

    cards.forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        cursor.classList.add("is-visible");
      });
      card.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-visible");
      });
    });
  }
})();
