// Year
const y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();

// Burger
const burger = document.getElementById('burger');
const links = document.getElementById('navLinks');
if (burger) burger.addEventListener('click', () => links.classList.toggle('open'));

// Reveal on scroll (Standard & Staggered)
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { 
    if (e.isIntersecting) { 
      e.target.classList.add('in'); 
      io.unobserve(e.target); 
    } 
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isActive) item.classList.add('active');
  });
});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lbImg = lightbox?.querySelector('img');
const lbCap = lightbox?.querySelector('.lightbox-caption');

document.querySelectorAll('.g-item img').forEach(img => {
  img.addEventListener('click', () => {
    if (!lightbox) return;
    lbImg.src = img.src;
    lbCap.textContent = img.parentElement.querySelector('b')?.textContent || '';
    lightbox.classList.add('show');
  });
});

lightbox?.addEventListener('click', () => lightbox.classList.remove('show'));

// Mouse Parallax for Hero
const hero = document.querySelector('.hero');
const frames = document.querySelectorAll('.frame-card');
if (hero && window.innerWidth > 900) {
  hero.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 30;
    const y = (clientY / window.innerHeight - 0.5) * 30;
    frames.forEach((f, i) => {
      const speed = (i + 1) * 0.5;
      f.style.transform = `translate(${x * speed}px, ${y * speed}px) rotate(var(--r))`;
    });
  });
}

// Page Transitions
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('https://wa.me') && !link.target) {
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = href; }, 400);
    }
  });
});
