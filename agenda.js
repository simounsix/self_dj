
document.addEventListener('DOMContentLoaded', () => {
  /* ---------- TYPEWRITER sécurisé ---------- */
  const titleEl  = document.getElementById('titre');   // peut ne pas exister ici
  const jingleEl = document.getElementById('jingle');  // absent sur cette page

  function typeText(el, text, speed = 120){
    return new Promise(resolve=>{
      if(!el) return resolve();
      el.textContent = "";
      let i = 0;
      (function tick(){
        el.textContent = text.slice(0, i);
        i++;
        if(i <= text.length) setTimeout(tick, speed);
        else resolve();
      })();
    });
  }

  (async () => {
    if (titleEl) {
      const titleTxt = titleEl.textContent;
      await typeText(titleEl, titleTxt, 110);
    }
    // pas de jingle ici → on ne fait rien
  })();

  /* ---------- AGENDA (style A) ---------- */
  const EVENTS = [
    {
      title: "SELF DJ – Hard Techno Night",
      date: "2025-10-18",  // AAAA-MM-JJ
      start:"21:00", end:"23:30",
      venue:"Le Warehouse, Paris",
      link:"https://twitch.tv/toncompte"
    },
    {
      title: "SELF DJ – Metz Club Session",
      date: "2025-11-07",
      start:"22:00", end:"01:00",
      venue:"Le Truc, Metz",
      link:""
    },
  ];

  const root = document.querySelector('.agenda-list');
  if (!root) return;

  const pad = n => String(n).padStart(2,'0');
  const toUTCStamp = d =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}`
    + `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  const frDateTime = d => d.toLocaleString('fr-FR', {
    weekday:'long', day:'2-digit', month:'long', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });

  function buildICS(ev){
    const start = new Date(`${ev.date}T${(ev.start||"00:00")}:00`);
    const end   = ev.end ? new Date(`${ev.date}T${ev.end}:00`)
                         : new Date(start.getTime()+2*3600e3);
    const ics = [
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//SELF DJ//Agenda//FR","CALSCALE:GREGORIAN","METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${(crypto.randomUUID?.()||Date.now()+"@selfdj")}`,
      `DTSTAMP:${toUTCStamp(new Date())}`,
      `DTSTART:${toUTCStamp(start)}`,
      `DTEND:${toUTCStamp(end)}`,
      `SUMMARY:${ev.title}`,
      ev.venue ? `LOCATION:${ev.venue}` : "",
      ev.link  ? `URL:${ev.link}` : "",
      "END:VEVENT","END:VCALENDAR"
    ].filter(Boolean).join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
  }

  function googleLink(ev){
    const start = new Date(`${ev.date}T${(ev.start||"00:00")}:00`);
    const end   = ev.end ? new Date(`${ev.date}T${ev.end}:00`)
                         : new Date(start.getTime()+2*3600e3);
    const params = new URLSearchParams({
      action:"TEMPLATE",
      text: ev.title,
      dates: `${toUTCStamp(start)}/${toUTCStamp(end)}`,
      details: ev.link || "",
      location: ev.venue || "",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  const now = new Date();
  const future = EVENTS
    .map(e => ({...e, startDate: new Date(`${e.date}T${(e.start||"00:00")}:00`)}))
    .filter(e => e.startDate.getTime() >= now.getTime() - 3600e3)
    .sort((a,b) => a.startDate - b.startDate);

  if (future.length === 0) {
    root.innerHTML = `<p style="text-align:center;color:#ddd;">Aucune date pour le moment. Reviens bientôt ✨</p>`;
    return;
  }

  future.forEach(ev => {
    const end = ev.end ? new Date(`${ev.date}T${ev.end}:00`) : null;
    const card = document.createElement('article');
    card.className = 'event-card';
    card.innerHTML = `
      <div class="event-title">${ev.title}</div>
      <div class="event-meta">
        ${ev.venue ? `<span class="badge">${ev.venue}</span><br>` : ""}
        ${frDateTime(ev.startDate)}${end ? " – " + end.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : ""}
      </div>
      <div class="event-actions">
        <a href="${googleLink(ev)}" target="_blank" rel="noopener">Ajouter à Google</a>
        <a href="${buildICS(ev)}" download="event-selfdj.ics">Télécharger .ics</a>
        ${ev.link ? `<a href="${ev.link}" target="_blank" rel="noopener">Plus d’infos</a>` : ""}
      </div>
    `;
    root.appendChild(card);
  });
});
