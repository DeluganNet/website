// Script per il sito Kevin Delugan

// Smooth scroll per i link interni
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href === '#top') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', href);
    }
  });
});

// Header sticky: cambia stile dopo lo scroll
const header = document.querySelector('header');
const onScroll = () => {
  if (!header) return;
  if (window.scrollY > 24) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// IntersectionObserver: rivela gli elementi .reveal
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    })
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  // fallback
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// Effetto tilt 3D al movimento del mouse
const tilts = document.querySelectorAll('.hover-tilt');
tilts.forEach(card => {
  const damp = 16; // minore = più sensibile
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left; // da 0 a width
    const y = e.clientY - r.top;  // da 0 a height
    const rx = (y - r.height / 2) / damp;
    const ry = -(x - r.width / 2) / damp;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
  });
});

// Modal per mailto su desktop (prenotazioni)
(function mailtoModal() {
  const triggers = document.querySelectorAll('a.mailto-modal-trigger[href^="mailto:"]');
  if (!triggers.length) return;

  const isDesktop = !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const modal = document.getElementById('mailto-modal');
  if (!modal) return;
  const overlay = modal.querySelector('[data-close-modal]');
  const closeBtn = modal.querySelector('.modal__close');
  const addressEl = document.getElementById('mailto-address');
  const copyBtn = document.getElementById('mailto-copy');
  const openBtn = document.getElementById('mailto-open');
  const gmailLink = document.getElementById('mailto-gmail');
  const outlookLink = document.getElementById('mailto-outlook');

  let lastHref = '';

  function parseMailto(href) {
    // href tipo: mailto:user@dominio?subject=...&body=...
    try {
      const withoutScheme = href.replace(/^mailto:/i, '');
      const [toPart, query = ''] = withoutScheme.split('?');
      const to = decodeURIComponent(toPart || '');
      const params = new URLSearchParams(query);
      const subject = params.get('subject') ? decodeURIComponent(params.get('subject')) : '';
      const body = params.get('body') ? decodeURIComponent(params.get('body')) : '';
      return { to, subject, body };
    } catch (e) {
      return { to: 'info@delugan.net', subject: '', body: '' };
    }
  }

  function gmailCompose({ to, subject, body }) {
    const p = new URLSearchParams({ view: 'cm', to, su: subject, body });
    return `https://mail.google.com/mail/?${p.toString()}`;
  }
  function outlookCompose({ to, subject, body }) {
    const p = new URLSearchParams({ to, subject, body, path: '/mail/action/compose' });
    return `https://outlook.live.com/owa/?${p.toString()}`;
  }

  function openModal(href) {
    lastHref = href;
    const data = parseMailto(href);
    addressEl.textContent = data.to || 'info@delugan.net';
    gmailLink.href = gmailCompose(data);
    outlookLink.href = outlookCompose(data);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  triggers.forEach(link => {
    link.addEventListener('click', (e) => {
      if (isDesktop) {
        e.preventDefault();
        openModal(link.getAttribute('href'));
      }
    });
  });

  // Azioni nel modal
  openBtn?.addEventListener('click', () => {
    if (lastHref) window.location.href = lastHref;
    // Lasciamo il modal aperto qualche secondo in caso non succeda nulla
    setTimeout(closeModal, 1500);
  });
  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(addressEl.textContent);
      copyBtn.textContent = 'Copiato!';
      setTimeout(() => (copyBtn.textContent = 'Copia'), 1500);
    } catch (e) {
      // fallback: selezione manuale
      const r = document.createRange();
      r.selectNodeContents(addressEl);
      const sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(r);
    }
  });
  [overlay, closeBtn].forEach(el => el && el.addEventListener('click', closeModal));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
})();
