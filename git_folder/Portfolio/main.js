/**
 * Rajeswari Rayapati — Portfolio
 * main.js — All animations, interactivity & responsive logic
 */

'use strict';

/* ═══════════════════════════════════════════
   UTILITY HELPERS
═══════════════════════════════════════════ */
const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
const isMobile = () => window.innerWidth <= 768;
const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

/* ═══════════════════════════════════════════
   1. LOADING SCREEN
═══════════════════════════════════════════ */
function initLoader() {
  const loader = qs('#loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('fade-out'), 2000);
}

/* ═══════════════════════════════════════════
   2. CUSTOM CURSOR (desktop only)
═══════════════════════════════════════════ */
function initCursor() {
  const cursor = qs('#cursor');
  const ring   = qs('#cursor-ring');
  if (!cursor || !ring) return;

  // On true touch-only devices, hide elements and restore native cursor
  if (isTouchDevice() && !window.matchMedia('(pointer: fine)').matches) {
    cursor.style.display = 'none';
    ring.style.display   = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  // Mouse position (dot) and ring lag position
  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  // RAF loop — dot is instant, ring lerps
  (function loop() {
    // Dot snaps directly to mouse
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';

    // Ring smoothly follows
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = Math.round(rx) + 'px';
    ring.style.top  = Math.round(ry) + 'px';

    requestAnimationFrame(loop);
  })();

  // Expand on hover
  const hoverSel = 'a, button, .btn-primary, .btn-outline, .chip, ' +
                   '.timeline-card, .project-card, .contact-card, ' +
                   '.edu-card, .cert-chip, .hero-card, .nav-logo';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSel)) {
      cursor.classList.add('cursor-hover');
      ring.classList.add('ring-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSel)) {
      cursor.classList.remove('cursor-hover');
      ring.classList.remove('ring-hover');
    }
  });

  // Hide/show when entering or leaving the browser window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    ring.style.opacity   = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    ring.style.opacity   = '1';
  });
}

/* ═══════════════════════════════════════════
   3. PARTICLE CANVAS
═══════════════════════════════════════════ */
function initParticles() {
  const canvas = qs('#particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#6366f1', '#ec4899', '#22d3ee', '#f59e0b'];
  let W, H, particles, animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    // Reduce particle density on mobile for performance
    const divisor = isMobile() ? 22000 : 14000;
    const count   = Math.max(30, Math.floor((W * H) / divisor));
    particles = Array.from({ length: count }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * 0.32,
      vy:    (Math.random() - 0.5) * 0.32,
      r:     Math.random() * 1.6 + 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.4 + 0.2
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    // Draw connecting lines
    ctx.globalAlpha = 1;
    const maxDist = isMobile() ? 80 : 115;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = (1 - dist / maxDist) * 0.16;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      createParticles();
    }, 200);
  });

  resize();
  createParticles();
  draw();
}

/* ═══════════════════════════════════════════
   4. NAVBAR — scroll shadow + active link
═══════════════════════════════════════════ */
function initNavbar() {
  const navbar  = qs('#navbar');
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-links a');

  function onScroll() {
    // Shadow on scroll
    navbar.classList.toggle('scrolled', window.scrollY > 44);

    // Active link highlight
    if (!navLinks.length) return;
    let current = '';
    sections.forEach(s => {
      const top = s.getBoundingClientRect().top;
      if (top <= 120) current = s.id;
    });
    navLinks.forEach(a => {
      const href = a.getAttribute('href').replace('#', '');
      a.classList.toggle('active', href === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ═══════════════════════════════════════════
   5. MOBILE HAMBURGER MENU
═══════════════════════════════════════════ */
function initMobileMenu() {
  const hamburger = qs('#hamburger');
  const mobileNav = qs('#nav-mobile');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click
  qsa('#nav-mobile a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('is-open');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('is-open');
    }
  });
}

/* ═══════════════════════════════════════════
   6. SCROLL REVEAL (IntersectionObserver)
═══════════════════════════════════════════ */
function initScrollReveal() {
  const targets = qsa(
    '.reveal, .timeline-item, .project-card, .edu-card, .contact-card'
  );

  // Apply staggered delays to sibling groups
  function applyStagger(selector, parentSelector) {
    qsa(parentSelector).forEach(parent => {
      qsa(selector, parent).forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.1}s`;
      });
    });
  }
  applyStagger('.project-card', '.projects-grid');
  applyStagger('.contact-card', '.contact-grid');
  applyStagger('.edu-card',     '.edu-grid');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════
   7. SKILL BARS — animate on reveal
═══════════════════════════════════════════ */
function initSkillBars() {
  const section = qs('#skills');
  if (!section) return;

  let fired = false;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !fired) {
        fired = true;
        qsa('.skill-bar-fill', section).forEach((bar, i) => {
          const pct = bar.dataset.pct || 0;
          // stagger each bar
          setTimeout(() => {
            bar.style.width = `${pct}%`;
          }, i * 80);
        });
      }
    });
  }, { threshold: 0.25 });
  obs.observe(section);
}

/* ═══════════════════════════════════════════
   8. 3D CARD TILT (desktop only)
═══════════════════════════════════════════ */
function initCardTilt() {
  const card = qs('#floatCard');
  const wrap = card?.parentElement;
  if (!card || !wrap || isMobile()) return;

  let tiltRaf;
  let targetRX = 4, targetRY = -4;
  let currentRX = 4, currentRY = -4;
  let isTilting = false;

  wrap.addEventListener('mousemove', e => {
    const rect = wrap.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    targetRX = -dy * 12;
    targetRY =  dx * 12;
    if (!isTilting) startTilt();
  });

  wrap.addEventListener('mouseleave', () => {
    targetRX = 4;
    targetRY = -4;
  });

  function startTilt() {
    isTilting = true;
    card.style.animation = 'none';

    function lerp() {
      currentRX += (targetRX - currentRX) * 0.08;
      currentRY += (targetRY - currentRY) * 0.08;
      card.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg) translateY(-6px)`;

      // Check if close to floating defaults → resume animation
      const atDefault = Math.abs(targetRX - 4) < 0.1 && Math.abs(targetRY + 4) < 0.1
                     && Math.abs(currentRX - 4) < 0.5 && Math.abs(currentRY + 4) < 0.5;
      if (atDefault) {
        isTilting = false;
        card.style.animation = 'float-card 6s ease-in-out infinite';
        card.style.transform = '';
        return;
      }
      tiltRaf = requestAnimationFrame(lerp);
    }
    lerp();
  }
}

/* ═══════════════════════════════════════════
   9. COUNTER ANIMATION — Hero card stats
═══════════════════════════════════════════ */
function initCounters() {
  const card = qs('.hero-card');
  if (!card) return;

  const counters = [
    { el: qs('.stat-indigo .stat-num', card), end: 3,  suffix: '+', dur: 1000 },
    { el: qs('.stat-pink   .stat-num', card), end: 15, suffix: '+', dur: 1200 },
    { el: qs('.stat-cyan   .stat-num', card), end: 30, suffix: '+', dur: 1400 },
    { el: qs('.stat-amber  .stat-num', card), end: 3,  suffix: '',  dur: 800  },
  ];

  let fired = false;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !fired) {
        fired = true;
        counters.forEach(({ el, end, suffix, dur }) => {
          if (!el) return;
          const start = performance.now();
          function update(now) {
            const pct = Math.min((now - start) / dur, 1);
            const val = Math.round(pct * end);
            el.textContent = val + suffix;
            if (pct < 1) requestAnimationFrame(update);
          }
          requestAnimationFrame(update);
        });
      }
    });
  }, { threshold: 0.5 });
  obs.observe(card);
}

/* ═══════════════════════════════════════════
   10. CHIP ENTRANCE ANIMATION (staggered)
═══════════════════════════════════════════ */
function initChipAnimations() {
  const chips = qsa('.chip');
  chips.forEach((chip, i) => {
    chip.style.opacity   = '0';
    chip.style.transform = 'translateY(14px) scale(0.9)';
    chip.style.transition = `opacity 0.4s, transform 0.4s`;
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        qsa('.chip', entry.target).forEach((chip, i) => {
          setTimeout(() => {
            chip.style.opacity   = '1';
            chip.style.transform = 'none';
          }, i * 35);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const chipSection = qs('.chips-section');
  if (chipSection) obs.observe(chipSection);
}

/* ═══════════════════════════════════════════
   11. PARALLAX HERO (subtle — desktop only)
═══════════════════════════════════════════ */
function initParallax() {
  if (isMobile()) return;
  const heroLeft = qs('.hero-left');
  if (!heroLeft) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroLeft.style.transform = `translateY(${y * 0.08}px)`;
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════
   12. RESPONSIVE LAYOUT MANAGER
   Watches window resize; re-runs mobile-sensitive logic
═══════════════════════════════════════════ */
function initResponsiveManager() {
  let prevWidth = window.innerWidth;

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    if (w === prevWidth) return;
    prevWidth = w;

    // Show/hide floating hero card
    const cardWrap = qs('.hero-card-wrap');
    if (cardWrap) {
      cardWrap.style.display = w <= 900 ? 'none' : '';
    }
  });
}

/* ═══════════════════════════════════════════
   13. SMOOTH SCROLL for nav links
═══════════════════════════════════════════ */
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = qs(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')) || 64;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ═══════════════════════════════════════════
   14. TIMELINE ITEM — alternating slide direction
═══════════════════════════════════════════ */
function initTimelineAnimations() {
  qsa('.timeline-item').forEach((item, i) => {
    // All slide from left since timeline is single-column
    item.style.transitionDelay = `${i * 0.08}s`;
  });
}

/* ═══════════════════════════════════════════
   15. MAGNETIC BUTTON EFFECT
═══════════════════════════════════════════ */
function initMagneticButtons() {
  if (isMobile()) return;
  qsa('.btn-primary, .btn-outline').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx   = e.clientX - (rect.left + rect.width  / 2);
      const dy   = e.clientY - (rect.top  + rect.height / 2);
      btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.26}px) translateY(-3px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ═══════════════════════════════════════════
   INIT ALL ON DOM READY
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initParticles();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initSkillBars();
  initCardTilt();
  initCounters();
  initChipAnimations();
  initParallax();
  initResponsiveManager();
  initSmoothScroll();
  initTimelineAnimations();
  initMagneticButtons();
});