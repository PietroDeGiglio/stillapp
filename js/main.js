// =====================================================================
// IMPOSTAZIONI: cambia solo qui
// ---------------------------------------------------------------------
// EMAIL: dove arrivano i messaggi del form. È scritta a pezzi perché
// i programmi che raccolgono indirizzi dalle pagine non la trovino.
// SOCIAL: incolla i link delle pagine di STILL. Se un link è vuoto,
// l'icona resta visibile ma spenta.
// =====================================================================
const EMAIL = ['still.webapp', 'gmail.com'];

const SOCIAL = {
  instagram: 'https://www.instagram.com/still.webapp/',
  tiktok: 'https://www.tiktok.com/@still.webapp',
  linkedin: 'https://www.linkedin.com/company/stillwebapp/',
  facebook: 'https://www.facebook.com/profile.php?id=61596785875883'
};
// =====================================================================

document.documentElement.classList.add('js');

// Indirizzo email ricomposto
const emailAddress = EMAIL.join('@');

// --- Social --------------------------------------------------------------
document.querySelectorAll('[data-social]').forEach((a) => {
  const url = SOCIAL[a.dataset.social];
  if (url) a.href = url;
  else { a.classList.add('off'); a.setAttribute('aria-disabled', 'true'); a.removeAttribute('target'); }
});

// --- Gradiente sincronizzato ----------------------------------------------
// Ogni scritta arcobaleno usa il gradiente del blocco che la contiene (titolo,
// frase, paragrafo): così "Ieri. Oggi. Domani. Ancora." sembra un'unica pennellata.
const gradEls = document.querySelectorAll('.grad-text, .hl, .brand-logo, .eyebrow-line');
function syncGradients() {
  gradEls.forEach((el) => {
    const group = el.closest('.brand, h1, h2, h3, p, li') || el;
    // misure "di layout" (offset*), non quelle a schermo: così le inclinazioni 3D e le
    // animazioni d'ingresso non falsano il gradiente
    const same = el !== group && el.offsetParent === group.offsetParent;
    el.style.setProperty('--gw', group.offsetWidth + 'px');
    el.style.setProperty('--gh', group.offsetHeight + 'px');
    el.style.setProperty('--gx', (same ? el.offsetLeft - group.offsetLeft : 0) + 'px');
    el.style.setProperty('--gy', (same ? el.offsetTop - group.offsetTop : 0) + 'px');
    el.classList.add('gsync');
  });
}
syncGradients();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncGradients);
window.addEventListener('load', () => setTimeout(syncGradients, 1400));
let gradTimer;
window.addEventListener('resize', () => { clearTimeout(gradTimer); gradTimer = setTimeout(syncGradients, 150); });

// --- Telefono animato -----------------------------------------------------
// Una piccola "giornata" che si ripete: calorie che salgono, serie completate,
// carico che aumenta, serie di giorni che cresce e l'uovo che inizia a schiudersi.
const stage = document.getElementById('stage');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (stage) {
  const screen = stage.querySelector('.screen');
  const kcal = document.getElementById('kcal');
  const streak = document.getElementById('streak');
  const pill = document.getElementById('pill');
  const pet = document.getElementById('pet');
  const sets = stage.querySelectorAll('.sets i');
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  let timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  const countUp = (to, ms) => {
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      kcal.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const reset = () => {
    timers.forEach(clearTimeout); timers = [];
    screen.classList.remove('play');
    pill.classList.remove('show');
    pet.classList.remove('hatch');
    sets.forEach((s) => s.classList.remove('done'));
    streak.textContent = '11';
    kcal.textContent = '0';
  };

  const cycle = () => {
    reset();
    at(80, () => { screen.classList.add('play'); countUp(1420, 1600); });
    sets.forEach((s, i) => at(1800 + i * 650, () => s.classList.add('done')));
    at(4500, () => pill.classList.add('show'));
    at(5200, () => { streak.textContent = '12'; streak.classList.remove('bump'); void streak.offsetWidth; streak.classList.add('bump'); });
    at(6000, () => pet.classList.add('hatch'));
    at(10500, cycle);
  };

  if (reduceMotion) {
    screen.classList.add('play'); kcal.textContent = fmt(1420); streak.textContent = '12';
    sets.forEach((s) => s.classList.add('done')); pill.classList.add('show');
  } else {
    setTimeout(cycle, 900);
    // Inclinazione che segue il mouse (solo con un mouse vero)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const hero = document.querySelector('.hero');
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        stage.style.setProperty('--ry', (-10 + x * 18).toFixed(2) + 'deg');
        stage.style.setProperty('--rx', (4 - y * 12).toFixed(2) + 'deg');
      });
      hero.addEventListener('pointerleave', () => { stage.style.removeProperty('--ry'); stage.style.removeProperty('--rx'); });
    }
  }
}

// --- Barra in alto: sfondo quando si scorre ------------------------------
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// --- Comparsa delle sezioni ----------------------------------------------
const toReveal = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  toReveal.forEach((el, i) => {
    // piccolo ritardo a cascata dentro le griglie
    el.style.transitionDelay = (el.closest('.grid, .why-list') ? (i % 3) * 90 : 0) + 'ms';
    io.observe(el);
  });
} else {
  toReveal.forEach((el) => el.classList.add('in'));
}

// --- Form di contatto ------------------------------------------------------
const form = document.getElementById('form');
const errorBox = document.getElementById('form-error');
const okBox = document.getElementById('form-ok');
const roleField = document.getElementById('campo-ruolo');
const msgLabel = document.getElementById('msg-label');
const fallback = document.getElementById('mail-fallback');
fallback.href = 'mailto:' + emailAddress;
fallback.textContent = emailAddress;

const MOTIVI = {
  coda: { subject: 'Voglio provare STILL', msg: 'Messaggio <em>(facoltativo)</em>', ph: 'Raccontaci che sport fai, cosa ti aspetti da STILL…', needMsg: false },
  idea: { subject: 'Un\'idea per STILL', msg: 'La tua idea', ph: 'Cosa vorresti trovare in STILL?', needMsg: true },
  collab: { subject: 'Proposta di collaborazione con STILL', msg: 'La tua proposta', ph: 'Chi sei e come vorresti collaborare?', needMsg: true },
  altro: { subject: 'Messaggio per STILL', msg: 'Messaggio', ph: 'Scrivi qui…', needMsg: true }
};

function updateMotivo() {
  const m = form.motivo.value;
  roleField.hidden = m !== 'collab';
  msgLabel.innerHTML = MOTIVI[m].msg;
  form.messaggio.placeholder = MOTIVI[m].ph;
}
form.addEventListener('change', (e) => { if (e.target.name === 'motivo') updateMotivo(); });

// I pulsanti "Mettiti in coda" selezionano già il motivo giusto
document.querySelectorAll('[data-motivo]').forEach((a) => {
  a.addEventListener('click', () => {
    const r = form.querySelector(`input[name="motivo"][value="${a.dataset.motivo}"]`);
    if (r) { r.checked = true; updateMotivo(); }
  });
});

function showError(text, field) {
  errorBox.textContent = text;
  errorBox.hidden = false;
  if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
}

form.addEventListener('input', (e) => {
  e.target.removeAttribute('aria-invalid');
  errorBox.hidden = true;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  okBox.hidden = true;
  const m = form.motivo.value;
  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const ruolo = form.ruolo.value.trim();
  const messaggio = form.messaggio.value.trim();

  if (!nome) return showError('Scrivi il tuo nome.', form.nome);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Controlla l\'email: serve per risponderti.', form.email);
  if (MOTIVI[m].needMsg && !messaggio) return showError('Scrivi due righe, così sappiamo di cosa si tratta.', form.messaggio);

  const righe = [
    `Nome: ${nome}`,
    `Email: ${email}`,
    ruolo ? `Chi sono: ${ruolo}` : '',
    '',
    messaggio || 'Vorrei essere tra i primi a provare STILL.',
    '',
    '— Inviato da pietrodegiglio.github.io/stillapp'
  ].filter((r, i) => r !== '' || i === 3 || i === 5);

  const href = 'mailto:' + emailAddress
    + '?subject=' + encodeURIComponent(MOTIVI[m].subject)
    + '&body=' + encodeURIComponent(righe.join('\n'));

  window.location.href = href;
  okBox.hidden = false;
});

updateMotivo();
