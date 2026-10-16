import './style.css';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- Theme Toggle (Circular Explode) ---------------- */
const themeButton = document.querySelector('[data-theme-toggle]');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const rootEl = document.documentElement;

const applyTheme = (theme) => {
  const isLight = theme === 'light';
  if (isLight) {
    rootEl.setAttribute('data-theme', 'light');
  } else {
    rootEl.removeAttribute('data-theme');
  }
  if (themeMeta) {
    themeMeta.setAttribute('content', isLight ? '#f6f2ea' : '#000000');
  }
  if (themeButton) {
    themeButton.setAttribute(
      'aria-label',
      isLight ? 'Switch to dark mode' : 'Switch to light mode'
    );
    themeButton.setAttribute(
      'title',
      isLight ? 'Switch to dark mode' : 'Switch to light mode'
    );
  }

  // Seamless light/dark image swap
  document.querySelectorAll('img[data-light-src]').forEach((img) => {
    if (!img.dataset.darkSrc) {
      img.dataset.darkSrc = img.getAttribute('src');
    }
    img.src = isLight ? img.dataset.lightSrc : img.dataset.darkSrc;
  });

  try {
    localStorage.setItem('aiden-theme', theme);
  } catch {
    // ignore storage errors
  }
};

// Preload light images for instant zero-flicker transitions
const preloadLightImages = () => {
  [
    '/hero-light.jpg',
    '/deck-eyes-light.jpg',
    '/deck-hands-light.jpg',
    '/deck-memory-light.jpg',
    '/aiden-vision-light.jpg',
    '/aiden-controls-light.jpg',
    '/aiden-calendar-light.jpg',
  ].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    preloadLightImages();
  } else {
    window.addEventListener('load', preloadLightImages);
  }
}

try {
  const savedTheme = localStorage.getItem('aiden-theme');
  if (savedTheme === 'light') applyTheme('light');
} catch {
  // ignore storage errors
}

if (themeButton) {
  themeButton.addEventListener('click', (event) => {
    const isLight = rootEl.getAttribute('data-theme') === 'light';
    const nextTheme = isLight ? 'dark' : 'light';

    const rect = themeButton.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    if (document.startViewTransition && !reduceMotion) {
      const transition = document.startViewTransition(() => {
        applyTheme(nextTheme);
      });
      transition.ready.then(() => {
        rootEl.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 680,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else if (!reduceMotion) {
      const ripple = document.createElement('div');
      ripple.className = 'theme-ripple';
      ripple.style.background = nextTheme === 'light' ? '#f6f2ea' : '#000000';
      ripple.style.setProperty('--rx', `${x}px`);
      ripple.style.setProperty('--ry', `${y}px`);
      document.body.appendChild(ripple);
      // Force layout before expanding circle
      ripple.getBoundingClientRect();
      ripple.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
      setTimeout(() => {
        applyTheme(nextTheme);
        ripple.style.transition = 'opacity 0.25s ease';
        ripple.style.opacity = '0';
        setTimeout(() => ripple.remove(), 260);
      }, 360);
    } else {
      applyTheme(nextTheme);
    }
  });
}

/* ---------------- Mobile navigation ---------------- */
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');

if (menuButton && navigation) {
  const setMenu = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('is-open', open);
  };
  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
}

/* ---------------- Smooth anchor scrolling ---------------- */
if (!reduceMotion) {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const start = window.scrollY;
      const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - (targetId === '#top' ? 0 : 64));
      const distance = targetY - start;
      const duration = Math.min(1600, Math.max(700, Math.abs(distance) * 0.5));
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      let startTime;

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        window.scrollTo(0, start + distance * ease(progress));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
      window.history.pushState(null, '', targetId);
    });
  });
}

/* ---------------- Header state + hero parallax ---------------- */
const header = document.querySelector('[data-header]');
const heroImage = document.querySelector('[data-parallax]');
let lastY = window.scrollY;
let ticking = false;

const onScroll = () => {
  const y = window.scrollY;
  if (header) {
    header.classList.toggle('is-scrolled', y > 40);
    const menuOpen = navigation?.classList.contains('is-open');
    header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > window.innerHeight * 0.8);
  }
  if (heroImage && !reduceMotion && y < window.innerHeight * 1.2) {
    heroImage.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(${1 + y * 0.00012})`;
  }
  lastY = y;
  ticking = false;
};
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });
onScroll();

// Let the CSS entrance animation finish before JS takes over the transform.
heroImage?.addEventListener('animationend', () => { heroImage.style.animation = 'none'; onScroll(); });

/* ---------------- Active nav link ---------------- */
const navLinks = [...document.querySelectorAll('.primary-nav a')];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && navSections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('is-current', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navSections.forEach((section) => navObserver.observe(section));
}

/* ---------------- Reveal on scroll ---------------- */
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}


/* ---------------- Eyes / Hands / Memory: smooth auto-switcher & interactive deck ---------------- */
const deck = document.querySelector('[data-deck]');
if (deck) {
  const slides = [...deck.querySelectorAll('[data-vision-slide]')];
  const details = [...deck.querySelectorAll('[data-deck-detail]')];
  const chapters = [...deck.querySelectorAll('[data-deck-jump]')];
  const countEl = deck.querySelector('[data-deck-count]');
  const barEl = deck.querySelector('[data-deck-bar]');
  const hintEl = deck.querySelector('[data-deck-hint]');

  const DURATION = 3200; // ~3.2 seconds per capability
  let activeIdx = 0;
  let startTime = null;
  let rafId = null;
  let isVisible = false;
  let isHovered = false;

  const setActive = (index) => {
    activeIdx = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === activeIdx);
    });

    details.forEach((detail, i) => {
      detail.classList.toggle('is-active', i === activeIdx);
    });

    chapters.forEach((btn, i) => {
      btn.classList.toggle('is-active', i === activeIdx);
    });

    if (countEl) {
      countEl.textContent = String(activeIdx + 1).padStart(2, '0');
    }
  };

  const updateProgress = (p) => {
    if (barEl) {
      barEl.style.setProperty('--p', p.toFixed(3));
    }
  };

  const step = (timestamp) => {
    if (!isVisible || isHovered || reduceMotion) {
      startTime = null;
      return;
    }

    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / DURATION, 1);
    updateProgress(progress);

    if (elapsed >= DURATION) {
      setActive(activeIdx + 1);
      startTime = timestamp;
      updateProgress(0);
    }

    rafId = requestAnimationFrame(step);
  };

  const startTimer = () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (!isVisible || isHovered || reduceMotion) return;
    startTime = null;
    rafId = requestAnimationFrame(step);
  };

  const pauseTimer = (paused = true) => {
    isHovered = paused;
    if (hintEl) {
      hintEl.textContent = paused ? 'Paused' : 'Auto-advancing (3s)';
    }
    if (paused) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    } else {
      startTimer();
    }
  };

  // Chapter pill clicks
  chapters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.deckJump);
      setActive(idx);
      updateProgress(0);
      startTime = null;
      if (!isHovered && isVisible && !reduceMotion) {
        startTimer();
      }
    });
  });

  // Pause on hover so the user can easily read the active chapter
  deck.addEventListener('mouseenter', () => pauseTimer(true));
  deck.addEventListener('mouseleave', () => pauseTimer(false));

  // IntersectionObserver to only auto-advance when section is visible in the viewport
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting && entry.intersectionRatio > 0.15;
        if (isVisible) {
          startTimer();
        } else {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = null;
          startTime = null;
        }
      });
    }, { threshold: [0, 0.2, 0.5] });
    observer.observe(deck);
  } else {
    isVisible = true;
    startTimer();
  }

  // Initialize
  setActive(0);
  updateProgress(0);
}

/* ---------------- Pillars: sticky stage sync ---------------- */
const pillars = document.querySelectorAll('[data-pillar]');
const slides = document.querySelectorAll('[data-slide]');
const stageCount = document.querySelector('[data-stage-count]');

const activatePillar = (index) => {
  pillars.forEach((pillar) => pillar.classList.toggle('is-active', Number(pillar.dataset.pillar) === index));
  slides.forEach((slide) => slide.classList.toggle('is-active', Number(slide.dataset.slide) === index));
  if (stageCount) stageCount.textContent = String(index + 1).padStart(2, '0');
};

if ('IntersectionObserver' in window && pillars.length) {
  const pillarObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) activatePillar(Number(entry.target.dataset.pillar));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  pillars.forEach((pillar) => pillarObserver.observe(pillar));
  activatePillar(0);
}

/* ---------------- A Day with AIDEN ---------------- */
const dayMoments = [
  {
    scene: 'You sit down with coffee.',
    prompt: 'Aiden, good morning. What’s on my plate today?',
    reply: 'Morning. Three meetings today — the first is a design sync at 10:00. Four unread emails, one flagged from Alex. Clear skies until evening.',
    chips: ['Google Calendar', 'Gmail', 'Weather'],
  },
  {
    scene: 'You’re deep in a spreadsheet and hit a roadblock.',
    prompt: 'Aiden, look at line 42 on my screen — why is this formula returning null?',
    reply: 'Line 42 references a range that was renamed to “Revenue”. Update the reference in cell D42 and it resolves.',
    chips: ['Screen vision', 'Answered in ~3s'],
  },
  {
    scene: 'You remember a project detail from last week.',
    prompt: 'What were the action items from the design meeting in my Obsidian vault?',
    reply: 'From “Design Review”: finalise the HUD spacing, export the icon set, and send the prototype to Sarah by Friday.',
    chips: ['Obsidian vault', 'Local Markdown'],
  },
  {
    scene: 'Time to leave your desk.',
    prompt: 'Aiden, empty my recycle bin and lock the computer.',
    reply: 'Done — 3.8 GB cleared. Locking your workstation now. Going to sleep until you need me.',
    chips: ['Recycle bin emptied', 'Workstation locked', 'Sleep'],
  },
];

const dayApp = document.querySelector('.day-app');
const dayTabs = [...document.querySelectorAll('.day-tab')];
const scene = document.querySelector('[data-day-scene]');
const prompt = document.querySelector('[data-day-prompt]');
const reply = document.querySelector('[data-day-reply]');
const chips = document.querySelector('[data-day-chips]');
const userBubble = document.querySelector('.bubble-user');
const aidenBubble = document.querySelector('.bubble-aiden');

if (dayApp && dayTabs.length && scene && prompt && reply && chips) {
  const DURATION = 8000;
  dayApp.style.setProperty('--day-duration', `${DURATION}ms`);
  let current = 0;
  let timer;
  let typingRun = 0;
  let inView = false;
  let paused = false;

  const renderChips = (list) => {
    chips.replaceChildren(...list.map((label) => {
      const chip = document.createElement('span');
      chip.textContent = label;
      return chip;
    }));
  };

  const show = async (index, { focus = false } = {}) => {
    current = index;
    const moment = dayMoments[index];
    const run = ++typingRun;

    dayTabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.remove('is-active');
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    // restart the progress bar animation
    void dayTabs[index].offsetWidth;
    dayTabs[index].classList.add('is-active');
    if (focus) dayTabs[index].focus();

    scene.textContent = moment.scene;
    renderChips(moment.chips);

    if (reduceMotion) {
      prompt.textContent = moment.prompt;
      reply.textContent = moment.reply;
    } else {
      aidenBubble.classList.add('is-hidden');
      userBubble.classList.remove('is-hidden');
      prompt.textContent = '';
      for (let i = 1; i <= moment.prompt.length; i += 1) {
        if (run !== typingRun) return;
        prompt.textContent = moment.prompt.slice(0, i);
        await new Promise((resolve) => setTimeout(resolve, 18));
      }
      await new Promise((resolve) => setTimeout(resolve, 350));
      if (run !== typingRun) return;
      reply.textContent = moment.reply;
      aidenBubble.classList.remove('is-hidden');
    }
    schedule();
  };

  const schedule = () => {
    clearTimeout(timer);
    if (!inView || paused || reduceMotion) return;
    timer = setTimeout(() => show((current + 1) % dayMoments.length), DURATION);
  };

  dayTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => show(i));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const dir = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
      show((current + dir + dayMoments.length) % dayMoments.length, { focus: true });
    });
  });

  dayApp.addEventListener('mouseenter', () => { paused = true; dayApp.classList.add('is-paused'); clearTimeout(timer); });
  dayApp.addEventListener('mouseleave', () => { paused = false; dayApp.classList.remove('is-paused'); show(current); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      const wasInView = inView;
      inView = entry.isIntersecting;
      if (inView && !wasInView) show(current);
      if (!inView) clearTimeout(timer);
    }, { threshold: 0.35 }).observe(dayApp);
  }

  show(0);
}

/* ---------------- Persona cursor glow ---------------- */
document.querySelectorAll('.persona').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  });
});
