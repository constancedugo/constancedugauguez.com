/* Constance Dugauguez — Portfolio
   Le JS n’ajoute que du poli. Tout fonctionne sans lui. */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Révélation du hero au chargement ─────────────────────── */

  /* Le CSS cache le hero (opacité 0) en attendant cette classe. Tout
     ce qui la pose doit donc être increvable : un requestAnimationFrame
     seul ne suffit pas — il ne se déclenche pas tant que l’onglet est
     en arrière-plan, et le titre resterait invisible. Le rAF garde la
     main dans le cas normal, le délai rattrape le reste. */
  const show = () => document.documentElement.classList.add('is-loaded');

  const reveal = () => {
    requestAnimationFrame(show);
    setTimeout(show, 1200);
  };

  if (reduceMotion) {
    show();
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

  /* ── Machine à écrire du hero ─────────────────────────────── */

  /* Le mot de départ est déjà dans le HTML : sans JS, la phrase reste
     complète et juste. On ne prend la main qu’une fois la fonte posée. */

  const typer = document.querySelector('[data-typewriter]');

  if (typer && !reduceMotion) {
    const words = (typer.dataset.words || '')
      .split('|')
      .map((w) => w.trim())
      .filter(Boolean);

    if (words.length > 1) {
      const text = document.createElement('span');
      const caret = document.createElement('span');
      caret.className = 'typewriter-caret';
      caret.setAttribute('aria-hidden', 'true');

      /* Le mot qui défile change trop vite pour une synthèse vocale :
         on annonce le premier, puis on laisse la zone muette. */
      typer.textContent = '';
      typer.append(text, caret);
      text.textContent = words[0];

      const TYPE = 34, ERASE = 16, HOLD = 1100, BREATH = 200;
      let word = 0, letters = words[0].length, erasing = false;

      const frame = () => {
        const current = words[word];
        let delay;

        if (erasing) {
          letters -= 1;
          delay = ERASE;
          if (letters === 0) {
            erasing = false;
            word = (word + 1) % words.length;
            delay = BREATH;
          }
        } else {
          if (letters < current.length) {
            letters += 1;
            delay = letters === current.length ? HOLD : TYPE;
            if (letters === current.length) erasing = true;
          } else {
            erasing = true;
            delay = HOLD;
          }
        }

        text.textContent = words[word].slice(0, letters);
        /* Onglet caché : requestAnimationFrame dort, setTimeout traîne.
           On se contente de reprendre là où on en est au retour. */
        setTimeout(frame, delay);
      };

      /* On attend que les deux lignes et le rappel soient posés :
         la frappe commence après le hero, pas pendant. */
      setTimeout(frame, 1750);
    }
  }

  /* ── Curseur ──────────────────────────────────────────────── */

  /* Trois conditions avant de masquer le curseur système, parce que
     le remplacer mal vaut bien pire que ne pas le remplacer :
       — un vrai pointeur (ni doigt, ni stylet) ;
       — pas de demande de mouvement réduit, auquel cas on laisse la
         flèche d’origine plutôt que d’imposer un suiveur ;
       — et le point n’est posé qu’à la première vraie souris vue,
         pour qu’un écran tactile branché sur un portable ne se
         retrouve jamais sans curseur du tout. */

  const pointeurFin = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (pointeurFin && !reduceMotion) {
    const point = document.createElement('div');
    point.className = 'cursor';
    point.setAttribute('aria-hidden', 'true');
    point.appendChild(document.createElement('span'));

    let viseX = 0, viseY = 0, x = 0, y = 0, rafId = null, ne = false;

    const boucle = () => {
      /* interpolation : le point rattrape la souris sans la coller —
         c’est ce retard infime qui lui donne du poids */
      x += (viseX - x) * 0.22;
      y += (viseY - y) * 0.22;
      point.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      /* on s’arrête net une fois posé : pas de boucle qui tourne
         dans le vide tant que la souris ne bouge pas */
      if (Math.abs(viseX - x) > 0.1 || Math.abs(viseY - y) > 0.1) {
        rafId = requestAnimationFrame(boucle);
      } else {
        rafId = null;
      }
    };

    const suivre = (e) => {
      viseX = e.clientX;
      viseY = e.clientY;

      if (!ne) {
        /* première souris : on pose le point sous elle sans glisser
           depuis le coin, puis seulement on masque la flèche */
        ne = true;
        x = viseX; y = viseY;
        document.body.appendChild(point);
        document.documentElement.classList.add('has-cursor');
      }

      point.classList.remove('is-out');
      if (!rafId) rafId = requestAnimationFrame(boucle);
    };

    const cliquable = 'a, button, summary, [role="button"], input, textarea, select';

    document.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse') suivre(e);
    }, { passive: true });

    document.addEventListener('pointerover', (e) => {
      if (!ne || !e.target.closest) return;
      point.classList.toggle('is-link', !!e.target.closest(cliquable));
    }, { passive: true });

    document.addEventListener('pointerdown', () => point.classList.add('is-down'), { passive: true });
    document.addEventListener('pointerup', () => point.classList.remove('is-down'), { passive: true });

    /* sorti de la fenêtre : le point s’efface au lieu de rester
       collé au bord */
    document.addEventListener('mouseleave', () => point.classList.add('is-out'));
    window.addEventListener('blur', () => point.classList.add('is-out'));

    /* Le fond bordeaux avalerait un point bordeaux. On inverse sur
       les zones sombres, en s’appuyant sur le survol plutôt que sur
       un relevé de couleur à chaque image. */
    const zonesSombres = document.querySelectorAll('.site-footer');
    zonesSombres.forEach((zone) => {
      zone.addEventListener('pointerenter', () => point.classList.add('is-inverted'));
      zone.addEventListener('pointerleave', () => point.classList.remove('is-inverted'));
    });
  }

  /* ── Horloge du colophon (heure de New York) ──────────────── */

  const clock = document.querySelector('[data-clock]');

  if (clock) {
    const tick = () => {
      /* en-GB plutôt que en-US : même langue, mais affichage 24 h,
         plus sobre qu’un « 10:51:29 PM » dans une ligne de colophon */
      clock.textContent = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/New_York',
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
    '│   Composé en Instrument Serif & Afacad.      │\n' +
    '│   Trois couleurs, un crayon, des marges.     │\n' +
    '│   Conçu & codé à la main — MMXXVI            │\n' +
    '│                                              │\n' +
    '└──────────────────────────────────────────────┘\n',
    'color:#FFFDEF; background:#580119; font-family:Georgia,serif; line-height:1.4;'
  );
})();
