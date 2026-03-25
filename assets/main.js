/* =========================================================
   main.js — Sidebar, Cursor, Filter, Search, Reveal, Loader
   ========================================================= */

// ─── LOADER ───────────────────────────────────────────────
(function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  // Reliable dismiss: CSS transition (.exiting) → hide after transition ends
  function dismissLoader(callback) {
    document.body.style.overflow = '';
    loader.classList.add('exiting');
    // setTimeout is 100% reliable — no dependency on animationend
    setTimeout(() => {
      loader.classList.add('hide');
      if (callback) callback();
    }, 700);
  }

  function showLoader(onDone) {
    loader.classList.remove('hide', 'exiting');
    void loader.offsetWidth; // force reflow — restarts CSS keyframe animations
    document.body.style.overflow = 'hidden';
    setTimeout(() => dismissLoader(onDone), 2300);
  }

  // Show loader for first visit only (sessionStorage flag)
  if (sessionStorage.getItem('bb_loader_seen')) {
    // Already seen this session — hide instantly, no flash
    loader.classList.add('hide');
    document.body.style.overflow = '';
  } else {
    // First visit — run full loader sequence
    sessionStorage.setItem('bb_loader_seen', '1');
    showLoader();
  }

  // Home links in sidebar: navigate home (standard behavior)
  document.querySelectorAll('.sidebar-link[href="index.html"], .sidebar-link[href="../index.html"]').forEach(el => {
    // We let these stay as standard links, or maybe show loader only if explicitly desired.
    // The user asked to REMOVE loader on logo click, so we'll ensure the topbar logo only toggles.
  });

  // Dev helper: call resetLoader() in console to replay
  window.resetLoader = function() {
    sessionStorage.removeItem('bb_loader_seen');
    showLoader();
  };
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
  const filterBtns = document.querySelectorAll('.filter-btn');
  const rows       = document.querySelectorAll('.project-row');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Manage active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      rows.forEach(row => {
        if (filter === 'all') {
          row.classList.remove('hidden');
        } else {
          // If project row data-category exactly matches the filter button's data-filter
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
