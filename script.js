document.addEventListener('DOMContentLoaded', () => {
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
      stopAuto(); // stoppe si clic sur dot
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
    stopAuto(); // stoppe si clic
  });
  prevBtn?.addEventListener('click', () => {
    showSlide(index - 1);
    stopAuto(); // stoppe si clic
  });

  // option : pause si survol
  const carousel = document.querySelector('.carousel');
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  // init
  showSlide(0);
  startAuto();
});
