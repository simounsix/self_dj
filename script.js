document.addEventListener('DOMContentLoaded', () => {
  /* ---------------- TYPEWRITER ---------------- */
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

  const titleEl  = document.getElementById('titre');
  const jingleEl = document.getElementById('jingle');
  const titleTxt = titleEl?.textContent ?? "";
  const jingleTxt= jingleEl?.textContent ?? "";

  (async () => {
    await typeText(titleEl, titleTxt, 120);
    jingleEl.style.visibility = 'visible';
    await typeText(jingleEl, jingleTxt, 90);
  })();

  /* ---------------- CAROUSEL ---------------- */
  const slidesEl = document.querySelector('.slides');
  const slideEls = document.querySelectorAll('.slide');
  const prevBtn  = document.querySelector('.prev');
  const nextBtn  = document.querySelector('.next');
  const dotsWrap = document.querySelector('.carousel-dots');

  let index = 0;

  // Crée les dots dynamiquement
  const dots = [];
  slideEls.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('type', 'button');
    dot.dataset.index = i;

    dot.addEventListener('click', () => {
      showSlide(i);
    });

    dotsWrap.appendChild(dot);
    dots.push(dot);
  });

  function updateDots(active) {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === active);
    });
  }

  function showSlide(i) {
    index = (i + slideEls.length) % slideEls.length;
    slidesEl.style.transform = `translateX(-${index * 100}%)`;
    updateDots(index);
  }

  nextBtn?.addEventListener('click', () => showSlide(index + 1));
  prevBtn?.addEventListener('click', () => showSlide(index - 1));

  // Init
  showSlide(0);

  // Auto (toutes les 5s)
  setInterval(() => {
    showSlide(index + 1);
  }, 5000);
});
