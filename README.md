# Portfolio de Constance

Site statique en HTML/CSS/JS vanilla, avec [GSAP](https://gsap.com) + [ScrollTrigger](https://gsap.com/scrolltrigger/) et [Lenis](https://lenis.darkroom.engineering/) chargés via CDN. Aucun build, aucun framework.

## Structure

```
index.html                    page d'accueil
projets/
  kinnect.html
  annual-report.html
  heritage-trees.html
  creativity-through.html
  experimentation.html
assets/
  css/style.css                tout le CSS (variables de palette en haut du fichier)
  js/main.js                   Lenis, GSAP/ScrollTrigger, menu mobile, curseur, transitions
  img/
    favicon.svg
    <nom-du-projet>/           un dossier par projet, images placeholder en SVG
```

## Remplacer les images placeholder

Chaque projet a son dossier dans `assets/img/<nom-du-projet>/` avec des `.svg` de couleur unie en attendant les vraies images. Pour les remplacer :

1. Prépare tes visuels aux mêmes ratios que les placeholders (le nom du fichier indique le ratio) :
   - `cover.svg` → 21:9 (image de couverture / héro de projet)
   - `card.svg` → 4:5 (vignette de la grille projets, accueil)
   - `full-1.svg` → 21:9 (visuel plein cadre dans l'étude de cas)
   - `side-a.svg` / `side-b.svg` (/ `side-c.svg` pour Expérimentation) → 3:2 (visuels côte à côte)
   - `tall-a.svg` / `tall-b.svg` → 4:5 (visuels côte à côte, format portrait)
2. Remplace le fichier par ta propre image, en gardant **le même nom mais avec l'extension `.jpg`, `.png` ou `.webp`**.
3. Mets à jour le `src` correspondant dans le HTML (recherche le nom du fichier, ex. `cover.svg` → `cover.jpg`), et adapte l'attribut `alt` pour qu'il décrive vraiment l'image.
4. Garde `loading="lazy"` sur toutes les images sauf si tu ajoutes un visuel visible dès le chargement de la page (auquel cas tu peux le retirer pour cette image précise).

La photo de la section « à propos » sur la page d'accueil utilise `assets/img/kinnect/tall-a.svg` — remplace-la par ton propre portrait au format 4:5.

## Modifier les textes

- **Accueil** (`index.html`) : titre du hero, sous-titre, texte du marquee, texte « à propos », liens réseaux sociaux (LinkedIn / Instagram / Behance — mets tes vraies URLs).
- **Pages projet** (`projets/*.html`) : titre, méta (année, catégorie, rôle, outils), et les 4 blocs de l'étude de cas (« le brief », « la démarche », « le résultat », « les livrables »). La page `experimentation.html` suit un gabarit différent : une courte intro suivie d'une galerie libre.
- **Email de contact** : cherche `constancedugauguez28@gmail.com` dans tous les fichiers HTML si tu veux le changer.
- Le CSS n'a pas besoin d'être touché pour ces changements — tout le texte est directement dans le HTML.

## Modifier la palette ou les polices

Tout se règle en haut de `assets/css/style.css`, dans `:root` :

```css
--cloud: #F0EEE9;
--custard: #FAE38E;
--blueberry: #D2E8FF;
--cherry: #861519;
--font-display: "Climate Crisis", sans-serif;
--font-body: "Archivo", sans-serif;
```

Les polices sont chargées depuis Google Fonts dans le `<head>` de chaque page HTML.

## Ajouter ou retirer un projet

1. Duplique une page projet existante dans `projets/` et adapte son contenu.
2. Crée son dossier d'images dans `assets/img/<nom-du-projet>/`.
3. Ajoute une carte vers cette page dans la grille `#projets` de `index.html`.
4. Mets à jour les liens « projet suivant » (`.next-project`) des pages concernées pour garder la boucle circulaire entre tous les projets.

## Déployer sur Netlify

**Option 1 — glisser-déposer**
Va sur [app.netlify.com/drop](https://app.netlify.com/drop) et dépose le dossier du projet entier. Le site est en ligne en quelques secondes.

**Option 2 — connecté à Git (recommandé)**
1. Pousse ce dossier sur un repo GitHub/GitLab/Bitbucket.
2. Sur Netlify : *Add new site → Import an existing project* → sélectionne le repo.
3. Aucune commande de build n'est nécessaire — laisse le champ *Build command* vide et mets `/` comme *Publish directory*.
4. Chaque `git push` redéploie automatiquement le site.

Le site fonctionne aussi tel quel sur **GitHub Pages** (Settings → Pages → déployer depuis la branche `main`, dossier racine).
