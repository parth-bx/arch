/* =========================================================
   main.js — Sidebar, Cursor, Filter, Search, Reveal, Loader
   ========================================================= */

// ─── LOADER ───────────────────────────────────────────────
(function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  function dismissLoader() {
    document.body.style.overflow = '';
    loader.classList.add('exit');
    loader.addEventListener('animationend', () => {
      loader.classList.add('hide');
    }, { once: true });
  }

  // Only show on first visit this session
  if (sessionStorage.getItem('bb_loader_seen')) {
    loader.classList.add('hide');
    document.body.style.overflow = '';
  } else {
    sessionStorage.setItem('bb_loader_seen', '1');
    document.body.style.overflow = 'hidden';
    setTimeout(dismissLoader, 2400);
  }

  // Logo click in sidebar re-triggers the loader then navigates
  document.querySelectorAll('.sidebar-logo a').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const dest = el.getAttribute('href') || '../index.html';
      // Reset and replay loader
      loader.classList.remove('hide', 'exit');
      void loader.offsetWidth; // force reflow to restart CSS animations
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        dismissLoader();
        setTimeout(() => { window.location.href = dest; }, 650);
      }, 2400);
    });
  });
})();

// ─── CUSTOM CURSOR ────────────────────────────────────────
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animFollower() {
    fx += (mx - fx) * 0.11;
    fy += (my - fy) * 0.11;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animFollower);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1.7)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
})();

// ─── HAMBURGER / SIDEBAR TOGGLE ───────────────────────────
// Sidebar starts CLOSED by default (CSS: transform translateX(-sidebar-w))
// Hamburger toggles the .open class to reveal it
(function initSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  if (!hamburger || !sidebar) return;

  hamburger.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
  });

  // Close sidebar when clicking anywhere outside it
  document.addEventListener('click', e => {
    if (
      sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      sidebar.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
})();

// ─── SEARCH ───────────────────────────────────────────────
(function initSearch() {
  const searchBtn   = document.getElementById('searchBtn');
  const searchBar   = document.getElementById('searchBar');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');
  const rows        = document.querySelectorAll('.project-row');
  if (!searchBtn || !searchBar) return;

  searchBtn.addEventListener('click', () => {
    searchBar.classList.toggle('visible');
    if (searchBar.classList.contains('visible')) {
      setTimeout(() => searchInput && searchInput.focus(), 350);
    }
  });

  searchClose && searchClose.addEventListener('click', () => {
    searchBar.classList.remove('visible');
    if (searchInput) searchInput.value = '';
    rows.forEach(r => r.classList.remove('hidden'));
  });

  searchInput && searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    rows.forEach(row => {
      const title = row.querySelector('.project-row-title')?.textContent.toLowerCase() || '';
      const loc   = row.querySelector('.project-row-location')?.textContent.toLowerCase() || '';
      row.classList.toggle('hidden', q && !title.includes(q) && !loc.includes(q));
    });
  });
})();

// ─── CATEGORY FILTER ──────────────────────────────────────
(function initFilter() {
  const filterLinks = document.querySelectorAll('.top-nav-link[data-filter]');
  const rows        = document.querySelectorAll('.project-row');
  if (!filterLinks.length) return;

  filterLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      filterLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const filter = link.dataset.filter;
      rows.forEach(row => {
        if (filter === 'all') {
          row.classList.remove('hidden');
        } else {
          row.classList.toggle('hidden', row.dataset.category !== filter);
        }
      });
    });
  });
})();

// ─── SCROLL REVEAL ────────────────────────────────────────
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

// ─── COUNTER ANIMATION ────────────────────────────────────
(function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count);
      const step   = Math.ceil(target / 40);
      let count = 0;
      const timer = setInterval(() => {
        count = Math.min(count + step, target);
        el.textContent = count;
        if (count >= target) clearInterval(timer);
      }, 28);
      observer.unobserve(el);
    });
  });
  els.forEach(el => observer.observe(el));
})();

// ─── SMOOTH PAGE TRANSITIONS ──────────────────────────────
(function initTransitions() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .4s ease';

  window.addEventListener('load', () => {
    requestAnimationFrame(() => { document.body.style.opacity = '1'; });
  });

  // Only intercept non-logo, non-download links
  document.querySelectorAll('a[href]').forEach(link => {
    // Skip sidebar-logo links (they're handled by loader)
    if (link.closest('.sidebar-logo')) return;
    const href = link.getAttribute('href');
    if (
      href &&
      !href.startsWith('http') &&
      !href.startsWith('mailto') &&
      !href.startsWith('#') &&
      !link.hasAttribute('download')
    ) {
      link.addEventListener('click', e => {
        e.preventDefault();
        document.body.style.opacity = '0';
        setTimeout(() => { window.location.href = href; }, 360);
      });
    }
  });
})();

// ─── PROJECT ROW HOVER PARALLAX ───────────────────────────
(function initRowParallax() {
  document.querySelectorAll('.project-row-link').forEach(link => {
    const img = link.querySelector('.project-row-image img');
    if (!img) return;

    link.addEventListener('mousemove', e => {
      const rect = link.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width  - 0.5;
      const relY = (e.clientY - rect.top)  / rect.height - 0.5;
      img.style.transform = `scale(1.07) translate(${relX * -8}px, ${relY * -6}px)`;
    });

    link.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
  });
})();
