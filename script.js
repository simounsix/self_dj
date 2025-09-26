/* TYPEWRITER réutilisable: écrit le texte de el, puis résout */
function typeText(el, text, speed = 120) {
  return new Promise(resolve => {
    if (!el) return resolve();
    el.textContent = "";
    let i = 0;
    (function tick() {
      el.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) setTimeout(tick, speed);
      else resolve();
    })();
  });
}

/* Sélection pour typing */
const titleEl  = document.getElementById('titre');
const jingleEl = document.getElementById('jingle');
const titleTxt = titleEl?.textContent ?? "";
const jingleTxt= jingleEl?.textContent ?? "";

/* Lancer les effets: titre puis jingle */
(async () => {
  await typeText(titleEl,  titleTxt, 120);
  await typeText(jingleEl, jingleTxt, 90);
})();

/* CAROUSEL */
const slidesEl = document.querySelector('.slides');   // la bande
const slideEls = document.querySelectorAll('.slide'); // toutes les cartes
const prevBtn  = document.querySelector('.prev');
const nextBtn  = document.querySelector('.next');
let index = 0;

function showSlide(i) {
  index = (i + slideEls.length) % slideEls.length; // boucle infinie
  slidesEl.style.transform = `translateX(-${index * 100}%)`;
}

nextBtn.addEventListener('click', () => showSlide(index + 1));
prevBtn.addEventListener('click', () => showSlide(index - 1));
