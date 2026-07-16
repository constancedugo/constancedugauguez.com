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
