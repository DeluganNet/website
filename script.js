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
