
const el = document.getElementById('titre');
const full = el.textContent;
el.textContent = "";
let i = 0;

function tick(){
  el.textContent = full.slice(0, i);
  // place le curseur à la fin du texte
  const r = el.getBoundingClientRect();
  el.style.setProperty('--cw', el.textContent.length);
  el.style.setProperty('--cursor-x', el.clientWidth + 'px');
  el.style.setProperty('--cursor-x', el.scrollWidth + 'px'); // fallback

  i++;
  if(i <= full.length) setTimeout(tick, 120); // vitesse
}
tick();

// positionne le curseur visuellement
const obs = new MutationObserver(() => {
  const x = el.scrollWidth;
  el.style.setProperty('--x', x + 'px');
  el.style.setProperty('--x', x + 'px');
});
obs.observe(el, {childList:true, characterData:true, subtree:true});
