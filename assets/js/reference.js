/* ============================================================
   REFERENCE / LEARNING FILE — behaviour for reference.html
   Two small, framework-free patterns that produce the reference
   site's scroll animations.
   ============================================================ */

// 1. Scroll reveal: watch every ".reveal" element and add ".is-visible"
// the first time it enters the viewport. CSS (see reference.css) handles
// the actual fade/slide transition — this just flips the class at the
// right moment.
const revealTargets = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealTargets.forEach((el) => revealObserver.observe(el));

// 2. Mobile burger menu: toggle the nav open/closed on small screens.
const burger = document.querySelector(".ref-burger");
const nav = document.querySelector(".ref-header .ref-nav");

if (burger && nav) {
  burger.addEventListener("click", () => {
    nav.style.display = nav.style.display === "flex" ? "none" : "flex";
  });
}
