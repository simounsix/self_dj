// ========== HELPERS GLOBAUX ==========
function typeText(el, text, speed = 120) {
  return new Promise(resolve => {
    if (!el) return resolve();               // si l'élément n'existe pas, on sort proprement
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

// Conversions pour Google Calendar / .ics (UTC)
const pad = n => String(n).padStart(2, "0");
const toUTCStamp = d =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
  `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

const frDateTime = d => d.toLocaleString("fr-FR", {
  weekday: "long", day: "2-digit", month: "long", year: "numeric",
  hour: "2-digit", minute: "2-digit"
});

// ========== ON READY ==========
document.addEventListener("DOMContentLoaded", () => {

  // ----- TYPEWRITER (titre + jingle si présents) -----
  (async () => {
    const titleEl = document.getElementById("titre");
    const jingleEl = document.getElementById("jingle");

    if (titleEl) {
      const titleTxt = titleEl.textContent;
      await typeText(titleEl, titleTxt, 110);
    }
    if (jingleEl) {
      const jTxt = jingleEl.textContent;
      jingleEl.style.visibility = "visible";
      await typeText(jingleEl, jTxt, 90);
    }
  })();


  // ----- CAROUSEL (seulement si présent) -----
  (function initCarousel() {
    const slidesEl = document.querySelector(".slides");
    const slideEls = document.querySelectorAll(".slide");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");
    const dotsWrap = document.querySelector(".carousel-dots");
    if (!slidesEl || slideEls.length === 0) return;   // pas de carrousel sur cette page

    let index = 0;
    let autoTimer = null;

    // Dots are disabled per user request (hidden via CSS); we keep a no-op array
    const dots = [];
    const updateDots = i => { /* no-op: dots removed */ };

    // Affichage
    function showSlide(i) {
      index = (i + slideEls.length) % slideEls.length;
      slidesEl.style.transform = `translateX(-${index * 100}%)`;
      updateDots(index);
    }

    // Auto-rotation (can be enabled via toggle, persisted in localStorage)
    const AUTO_KEY = 'carouselAutoEnabled';
    let autoEnabled = true;
    try { const saved = localStorage.getItem(AUTO_KEY); if (saved !== null) autoEnabled = saved === '1'; } catch(e){}

    function startAuto() {
      stopAuto();
      if (!autoEnabled) return;
      autoTimer = setInterval(() => showSlide(index + 1), 5000);
    }
    function stopAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = null;
    }

    // Setup UI toggle if present
    const autoToggle = document.getElementById('carousel-auto-toggle');
    const autoIcon = document.getElementById('carousel-auto-icon');
    function refreshAutoIcon() {
      if (!autoIcon) return;
      if (autoEnabled) {
        autoIcon.classList.remove('fa-play');
        autoIcon.classList.add('fa-pause');
      } else {
        autoIcon.classList.remove('fa-pause');
        autoIcon.classList.add('fa-play');
      }
    }

    if (autoToggle) {
      autoToggle.checked = !!autoEnabled;
      refreshAutoIcon();
      autoToggle.addEventListener('change', (e) => {
        autoEnabled = !!e.target.checked;
        try { localStorage.setItem(AUTO_KEY, autoEnabled ? '1' : '0'); } catch(err){}
        refreshAutoIcon();
        if (autoEnabled) startAuto(); else stopAuto();
      });
    }

    // Pause auto-advance when any video is playing
    const videos = Array.from(slideEls).map(s => s.querySelector('video')).filter(Boolean);
    videos.forEach(v => {
      v.addEventListener('play', () => {
        stopAuto();
      });
      v.addEventListener('pause', () => {
        // resume auto after a short delay so user can watch
        setTimeout(() => { if (!videos.some(x=> !x.paused)) startAuto(); }, 1500);
      });
      v.addEventListener('ended', () => { startAuto(); });
    });

  // Flèches — handlers replaced later with safe versions that pause videos

    // Pause au survol (respecte autoEnabled)
    const carousel = document.querySelector(".carousel");
    carousel?.addEventListener("mouseenter", () => { if (autoEnabled) stopAuto(); });
    carousel?.addEventListener("mouseleave", () => { if (autoEnabled) startAuto(); });

    // Touch / swipe support (left/right)
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipe = 40; // px
    carousel?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carousel?.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > minSwipe) {
        if (diff < 0) { // swipe left -> next
          showSlideSafe(index + 1);
        } else { // swipe right -> prev
          showSlideSafe(index - 1);
        }
      }
    }, { passive: true });

    // Init
    // When changing slide, pause any playing videos and center media
    function pauseAllVideos() {
      videos.forEach(v => { try { v.pause(); v.currentTime = v.currentTime; } catch(e){} });
    }

    // Ensure to pause videos when navigating slides
    function showSlideSafe(i) {
      pauseAllVideos();
      showSlide(i);
    }

    // Replace handlers to use showSlideSafe where appropriate
    nextBtn?.addEventListener('click', () => { showSlideSafe(index + 1); stopAuto(); });
    prevBtn?.addEventListener('click', () => { showSlideSafe(index - 1); stopAuto(); });

    // Init
    showSlide(0);
    startAuto();
  })();


  // ----- AGENDA (style A) : seulement si .agenda-list existe -----
  (function initAgenda() {
    const root = document.querySelector(".agenda-list");
    if (!root) return;

    // 🔧 ÉDITE ICI TES ÉVÉNEMENTS (clubs/bars uniquement)
    const EVENTS = [
      {

      },
      {
      }
    ];

    // .ics (Apple/Outlook)
    function buildICS(ev) {
      const start = new Date(`${ev.date}T${(ev.start || "00:00")}:00`);
      const end = ev.end ? new Date(`${ev.date}T${ev.end}:00`)
        : new Date(start.getTime() + 2 * 3600e3);

      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SELF DJ//Agenda//FR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${(crypto.randomUUID?.() || Date.now() + "@selfdj")}`,
        `DTSTAMP:${toUTCStamp(new Date())}`,
        `DTSTART:${toUTCStamp(start)}`,
        `DTEND:${toUTCStamp(end)}`,
        `SUMMARY:${ev.title}`,
        ev.venue ? `LOCATION:${ev.venue}` : "",
        ev.description ? `DESCRIPTION:${ev.description}` : "",
        "END:VEVENT", "END:VCALENDAR"
      ].filter(Boolean).join("\r\n");

      return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
    }

    // Lien "Ajouter à Google" (lieu + description propre)
    function googleLink(ev) {
      const start = new Date(`${ev.date}T${(ev.start || "00:00")}:00`);
      const end = ev.end ? new Date(`${ev.date}T${ev.end}:00`)
        : new Date(start.getTime() + 2 * 3600e3);

      const desc = ev.description || "DJ set en club";

      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: ev.title,
        dates: `${toUTCStamp(start)}/${toUTCStamp(end)}`,
        details: desc,              // description (pas d’URL brute)
        location: ev.venue || "",   // lieu physique (souvent cliquable côté Google)
      });
      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    }

    const now = new Date();
    const future = EVENTS
      .map(e => ({ ...e, startDate: new Date(`${e.date}T${(e.start || "00:00")}:00`) }))
      .filter(e => e.startDate.getTime() >= now.getTime() - 3600e3) // garde futur (tolérance -1h)
      .sort((a, b) => a.startDate - b.startDate);

    if (future.length === 0) {
      root.innerHTML = `<p style="text-align:center;color:#ddd;">Aucune date pour le moment. Reviens bientôt ✨</p>`;
      return;
    }

    future.forEach(ev => {
      const end = ev.end ? new Date(`${ev.date}T${ev.end}:00`) : null;
      const card = document.createElement("article");
      card.className = "event-card";
      card.innerHTML = `
        <div class="event-title">${ev.title}</div>
        <div class="event-meta">
          ${ev.venue ? `<span class="badge">${ev.venue}</span><br>` : ""}
          ${frDateTime(new Date(`${ev.date}T${ev.start}:00`))}
          ${end ? " – " + end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ""}
        </div>
        <div class="event-actions">
          <a href="${googleLink(ev)}" target="_blank" rel="noopener">Ajouter à Google</a>
          <a href="${buildICS(ev)}" download="event-selfdj.ics">Télécharger .ics</a>
          <a href="https://www.google.com/maps/search/${encodeURIComponent(ev.venue)}" target="_blank" rel="noopener">Itinéraire</a>
          ${ev.tickets ? `<a href="${ev.tickets}" target="_blank" rel="noopener">Billetterie</a>` : ""}
        </div>
      `;
      root.appendChild(card);
    });
  })();


  // ----- BACK TO TOP (affichage au scroll) -----
  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) backToTop.classList.add("show");
      else backToTop.classList.remove("show");
    });
    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  // ----- FORMULAIRE DE CONTACT -----
  (function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return; // aucune action si pas de formulaire sur la page

    const msg = form.querySelector(".form-msg");
    const btn = form.querySelector("button");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "Envoi en cours...";
      btn.disabled = true;

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        });
        if (res.ok) {
          msg.textContent = "✅ Merci ! Ton message a bien été envoyé 💜";
          form.reset();
        } else {
          msg.textContent = "❌ Oups, une erreur est survenue. Réessaie plus tard.";
        }
      } catch (err) {
        msg.textContent = "⚠️ Problème de connexion.";
      } finally {
        btn.disabled = false;
      }
    });
  })();
  // effet d’apparition du formulaire au scroll
  const contactSection = document.querySelector('.contact-section');
  if (contactSection) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) contactSection.classList.add('visible');
    }, { threshold: 0.2 });
    observer.observe(contactSection);
  }

});
