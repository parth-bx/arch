/* =========================================================
   main.js — Interactions, cursor, scroll, reveal
   ========================================================= */

// ── Custom Cursor ──────────────────────────────────────────
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

if (cursor && follower) {
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  (function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  })();

  // Scale cursor on hover
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '14px';
      cursor.style.height = '14px';
      cursor.style.background = '#0d0c0a';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '8px';
      cursor.style.height = '8px';
    });
  });
}

// ── Nav Scroll Effect ──────────────────────────────────────
const nav = document.getElementById('mainNav');
if (nav) {
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Scroll-Reveal ──────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

// ── Staggered tile entrance ────────────────────────────────
function initTileEntrance() {
  const tiles = document.querySelectorAll('.project-tile');
  if (!tiles.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 60 * i);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  tiles.forEach(tile => {
    tile.style.opacity = '0';
    tile.style.transform = 'translateY(20px)';
    tile.style.transition = 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)';
    observer.observe(tile);
  });
}

// ── Hero name text split animation ────────────────────────
function initHeroAnim() {
  const hero = document.getElementById('heroName');
  if (!hero) return;
  hero.style.animation = 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.15s both';
}

// ── Smooth Page Transitions ────────────────────────────────
function initPageTransitions() {
  // Add a page-fade class to body on load
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.45s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only intercept internal links
    if (href && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('#') && !link.hasAttribute('download')) {
      link.addEventListener('click', e => {
        e.preventDefault();
        document.body.style.opacity = '0';
        setTimeout(() => { window.location.href = href; }, 380);
      });
    }
  });
}

// ── Number counter animation ───────────────────────────────
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        let count = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
          count = Math.min(count + step, target);
          el.textContent = count;
          if (count >= target) clearInterval(timer);
        }, 30);
        observer.disconnect();
      }
    });
    observer.observe(el);
  });
}

// ── Init all ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initTileEntrance();
  initHeroAnim();
  initPageTransitions();
  initCounters();
});
