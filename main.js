/* Constance Dugauguez — Portfolio
   Le JS n’ajoute que du poli. Tout fonctionne sans lui. */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Révélation du hero au chargement ─────────────────────── */

  const reveal = () => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('is-loaded');
    });
  };

  if (reduceMotion) {
    document.documentElement.classList.add('is-loaded');
  } else if (document.fonts && document.fonts.ready) {
    // On attend la fonte pour que les lignes se lèvent déjà composées.
    Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]).then(reveal);
  } else {
    window.addEventListener('DOMContentLoaded', reveal);
  }

  /* ── Révélations au défilement (sections à venir) ─────────── */

  const revealables = document.querySelectorAll('[data-reveal]');

  if (revealables.length && !reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealables.forEach((el) => observer.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
  }

  /* ── Carrousel des travaux ────────────────────────────────── */

  const track = document.querySelector('[data-carousel]');

  if (track) {
    const buttons = document.querySelectorAll('.carousel-btn[data-dir]');
    let rafId = null;

    const step = () => {
      const slide = track.querySelector('.work');
      return slide ? slide.getBoundingClientRect().width : track.clientWidth / 2;
    };

    const updateButtons = () => {
      // Le premier point d’accroche vaut le padding gauche de la piste,
      // pas zéro : on ne peut jamais défiler en deçà.
      const min = parseFloat(getComputedStyle(track).paddingLeft) + 1;
      const max = track.scrollWidth - track.clientWidth - 1;
      buttons.forEach((btn) => {
        const dir = Number(btn.dataset.dir);
        btn.disabled = dir < 0 ? track.scrollLeft <= min : track.scrollLeft >= max;
      });
    };

    /* Le snap « mandatory » avale les défilements progressifs (Chrome
       ramène chaque image intermédiaire au point d’accroche). On le
       suspend le temps du geste, puis on le rétablit une fois posé. */
    const stopGlide = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      track.style.scrollSnapType = '';
    };

    const glideTo = (target) => {
      stopGlide();
      /* Onglet caché : pas d’images d’animation, on se pose directement. */
      if (reduceMotion || document.hidden) {
        track.scrollLeft = target;
        updateButtons();
        return;
      }
      track.style.scrollSnapType = 'none';
      const from = track.scrollLeft;
      const distance = target - from;
      const duration = 700;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4);   /* proche de notre --ease */
        track.scrollLeft = from + distance * eased;
        if (t < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          stopGlide();
          updateButtons();
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const max = track.scrollWidth - track.clientWidth;
        const target = Math.max(0, Math.min(max, track.scrollLeft + Number(btn.dataset.dir) * step()));
        glideTo(target);
      });
    });

    /* La main de l’utilisateur reprend toujours le dessus. */
    ['wheel', 'touchstart', 'pointerdown'].forEach((evt) => {
      track.addEventListener(evt, stopGlide, { passive: true });
    });

    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  }

  /* ── Horloge du colophon (heure de Paris) ─────────────────── */

  const clock = document.querySelector('[data-clock]');

  if (clock) {
    const tick = () => {
      clock.textContent = new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Paris',
      }).format(new Date());
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ── Petit mot pour les curieuses et curieux ──────────────── */

  console.log(
    '%c\n' +
    '┌──────────────────────────────────────────────┐\n' +
    '│                                              │\n' +
    '│   Constance Dugauguez — Portfolio            │\n' +
    '│   Composé en Fraunces, corps 17/24.          │\n' +
    '│   Trois couleurs, un crayon, des marges.     │\n' +
    '│   Conçu & codé à la main — MMXXVI            │\n' +
    '│                                              │\n' +
    '└──────────────────────────────────────────────┘\n',
    'color:#2E3618; background:#A8A857; font-family:Georgia,serif; line-height:1.4;'
  );
})();
