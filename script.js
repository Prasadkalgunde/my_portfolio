/**
 * ============================================================================
 * PRASAD KALGUNDE - MINIMALIST SOFTWARE ENGINEERING PORTFOLIO
 * Theme Switching, Interactive Canvas Animation, Navigation & Form Handling
 * ============================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. THEME SWITCHER (DARK / LIGHT MODE)
     -------------------------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  // Determine initial theme: stored preference -> system preference -> fallback to dark
  function getPreferredTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  // Initial application
  const currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  // Toggle button event
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const activeTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(activeTheme);
      showToast(`Switched to ${activeTheme === 'light' ? 'Light' : 'Dark'} Mode`);
    });
  }

  // Listen for OS theme changes if user hasn't explicitly set one
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }


  /* --------------------------------------------------------------------------
     2. SLEEK INTERACTIVE CANVAS BACKGROUND ANIMATION
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let animationFrameId = null;

  const mouse = {
    x: -9999,
    y: -9999,
    radius: 120
  };

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    initParticles();
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.8 + 1;
      
      const speed = Math.random() * 0.45 + 0.2;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      this.alpha = Math.random() * 0.45 + 0.25;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse deflection
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < mouse.radius && dist > 0) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 2;
        this.y -= (dy / dist) * force * 2;
      }

      // Boundary loop
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw(isDark) {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      
      if (isDark) {
        ctx.fillStyle = `rgba(99, 102, 241, ${this.alpha * 0.7})`;
      } else {
        ctx.fillStyle = `rgba(79, 70, 229, ${this.alpha * 0.45})`;
      }
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.floor((width * height) / 16000);
    const total = Math.max(40, Math.min(count, 85));
    particles = [];
    for (let i = 0; i < total; i++) {
      particles.push(new Particle());
    }
  }

  function drawLines(isDark) {
    if (!ctx) return;
    const maxDist = 120;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * (isDark ? 0.15 : 0.08);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = isDark
            ? `rgba(99, 102, 241, ${alpha})`
            : `rgba(100, 116, 139, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Proximity line to mouse
      if (mouse.x > 0 && mouse.y > 0) {
        const dmx = mouse.x - particles[i].x;
        const dmy = mouse.y - particles[i].y;
        const distMouse = Math.hypot(dmx, dmy);
        if (distMouse < 140) {
          const alphaMouse = (1 - distMouse / 140) * (isDark ? 0.25 : 0.15);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = isDark
            ? `rgba(6, 182, 212, ${alphaMouse})`
            : `rgba(79, 70, 229, ${alphaMouse})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
    }
  }

  function renderCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const isDark = root.getAttribute('data-theme') !== 'light';

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(isDark);
    }

    drawLines(isDark);

    animationFrameId = requestAnimationFrame(renderCanvas);
  }

  // Mouse move tracking
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  resizeCanvas();
  renderCanvas();


  /* --------------------------------------------------------------------------
     3. NAVBAR SCROLL EFFECT & MOBILE MENU
     -------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 25) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // ScrollSpy active state
    const scrollPosition = window.scrollY + 140;
    const sections = document.querySelectorAll('section[id]');

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  });

  // Mobile drawer toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isOpen.toString());
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }


  /* --------------------------------------------------------------------------
     4. INTERACTIVE CONTACT FORM & TOAST NOTIFICATION
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');
  const toastBubble = document.getElementById('toastBubble');
  let toastTimer = null;

  function showToast(message) {
    if (!toastBubble) return;
    toastBubble.textContent = message;
    toastBubble.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastBubble.classList.remove('show');
    }, 2800);
  }

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName')?.value || '';
      const email = document.getElementById('contactEmail')?.value || '';
      const submitBtn = document.getElementById('btnSubmitMessage');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending...</span>`;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Send Message</span>
            <svg class="btn-icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>`;
        }

        formFeedback.className = 'form-feedback success';
        formFeedback.textContent = `Thank you, ${name}! Your message has been prepared. I'll get back to you at ${email} promptly.`;
        showToast('✉️ Message dispatched!');
        contactForm.reset();
      }, 600);
    });
  }


  /* --------------------------------------------------------------------------
     5. DYNAMIC FOOTER YEAR
     -------------------------------------------------------------------------- */
  const yearSpan = document.getElementById('yearSpan');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

})();
