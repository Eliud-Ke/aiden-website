import './style.css';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

/* ---------------- Hero voice-command typer ---------------- */
const typer = document.querySelector('[data-typer]');
const heroCommands = [
  'Aiden, look at this screen — why did the build fail?',
  'Dim the screen to 40% and play my focus playlist.',
  'What does my morning look like, and who emailed me?',
  'Append this idea to my Startup Concepts note.',
  'Kill the frozen Blender process.',
];

if (typer && !reduceMotion) {
  let commandIndex = 0;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const type = async (text) => {
    for (let i = 1; i <= text.length; i += 1) {
      typer.textContent = text.slice(0, i);
      await wait(28 + Math.random() * 40);
    }
  };
  const erase = async () => {
    const text = typer.textContent;
    for (let i = text.length; i >= 0; i -= 1) {
      typer.textContent = text.slice(0, i);
      await wait(12);
    }
  };
  (async () => {
    await wait(2600);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await wait(2600);
      await erase();
      commandIndex = (commandIndex + 1) % heroCommands.length;
      await wait(350);
      await type(heroCommands[commandIndex]);
    }
  })();
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
