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
    await typeText(titleEl, titleTxt, 120); // anime le titre
    jingleEl.style.visibility = 'visible';
    await typeText(jingleEl, jingleTxt, 90); // anime le jingle
  })();

  /* ---------------- CAROUSEL ---------------- */
  const slidesEl = document.querySelector('.slides');
  const slideEls = document.querySelectorAll('.slide');
  const prevBtn  = document.querySelector('.prev');
  const nextBtn  = document.querySelector('.next');
  const dotsWrap = document.querySelector('.carousel-dots');

  let index = 0;
  let autoTimer = null;

  // création des dots
  const dots = [];
  slideEls.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.type = 'button';
    dot.dataset.index = i;
    dot.addEventListener('click', () => {
      showSlide(i);
      stopAuto(); // stop si clic utilisateur
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

  // auto défilement
  function startAuto() {
    autoTimer = setInterval(() => {
      showSlide(index + 1);
    }, 5000);
  }
  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  // flèches
  nextBtn?.addEventListener('click', () => {
    showSlide(index + 1);
    stopAuto();
  });
  prevBtn?.addEventListener('click', () => {
    showSlide(index - 1);
    stopAuto();
  });

  // option : pause si survol
  const carousel = document.querySelector('.carousel');
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  // init
  showSlide(0);
  startAuto();
});

const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});


