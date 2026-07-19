import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  
  // ----------------------------------------------------
  // 1. ENTRY ANIMATION (Frame 1 Load)
  // ----------------------------------------------------
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

  tl.to("#hero-image", {
    opacity: 1,
    scale: 1.1,
    duration: 2.2,
    ease: "power3.out",
  })
    .to("#block-1", {
      opacity: 1,
      y: 0,
      startAt: { y: -20 },
      duration: 1.4,
    }, "-=1.4")
    .to("#block-2", {
      opacity: 1,
      x: 0,
      duration: 1.6,
    }, "-=1.2");

  // ----------------------------------------------------
  // 2. BACKGROUND FADE & IMAGE PAN
  // ----------------------------------------------------
  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#transition-track",
      start: "top 75%",        
      end: "top 0px",     
      scrub: 1,                
    }
  });

  scrollTl.to("#hero-image", { 
    y: "-20vh", 
    ease: "none" 
  }, 0);
  
  scrollTl.to("#scroll-fade", { 
    opacity: 1, 
    y: 0, 
    ease: "none" 
  }, 0);

  // ----------------------------------------------------
  // 3. MASTER PIN & TEXT SLIDE
  // ----------------------------------------------------
  const pinTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#transition-track",
      start: "top top",      
      end: "+=80%",         
      pin: "#master-pin",    
      scrub: 1,
    }
  });

  pinTl.fromTo("#text-block", 
    { y: "50vh", opacity: 0 }, 
    { y: "0vh", opacity: 1, duration: 1, ease: "power2.out" }
  )
  .to(".log-line", {
    opacity: 1,
    duration: 0.1,
    stagger: 0.15,
    ease: "none"
  })
  .call(() => {
    startConfidenceTracker();
  })
  .to({}, { duration: 0.4 }); 

  // TERMINAL LIVE CONFIDENCE TRACKER
  let confidenceInterval;
  function startConfidenceTracker() {
    const numberSpan = document.getElementById("confidence-number");
    if (!numberSpan || confidenceInterval) return;

    confidenceInterval = setInterval(() => {
      const randomConfidence = (Math.random() * (0.0099 - 0.0001) + 0.0001).toFixed(4);
      numberSpan.innerText = randomConfidence;
    }, 400);
  }

  // ----------------------------------------------------
  // 4. FRAME 2 IMAGE TRANSITION
  // ----------------------------------------------------
  gsap.fromTo("#frame-2-image", 
    { 
      scale: 1.35, // Starts at 135% zoom
      opacity: 0   // Starts completely invisible
    },
    {
      scrollTrigger: {
        trigger: "#frame-2",      
        start: "top 90%",         
        end: "top top",           
        scrub: 1,                 
      },
      scale: 1,      // Shrinks to perfectly fit the screen (100%)
      opacity: 0.9,  // Fades up to 90% opacity
      ease: "none"
    }
  );

  // ----------------------------------------------------
  // 11. FRAME 3 IMAGE TRANSITION (Scale & Pan)
  // ----------------------------------------------------
  gsap.fromTo("#frame-3-image", 
    { 
      scale: 1.35,     // Massive starting scale
      xPercent: 5,     // Starts slightly shifted to the right (5%)
      opacity: 0       // Faded out initially
    },
    {
      scrollTrigger: {
        trigger: "#frame-3",      
        start: "top 90%",         // Starts animating when Frame 3 enters the bottom of the screen
        end: "top top",           // Finishes when Frame 3 reaches the top of the screen
        scrub: 1.5,               // 1.5 adds a slightly heavier, smoother resistance to the scroll
      },
      scale: 1.07,     // Shrinks down to 107%
      xPercent: 0,     // Pans slowly to the left until perfectly centered
      opacity: 0.9,    // Fades in beautifully
      ease: "none"
    }
  );

  // ----------------------------------------------------
  // 5. TOOLTIP LOGIC
  // ----------------------------------------------------
  const pill = document.getElementById('nav-pill');
  const spotlight = document.getElementById('pill-glow');

  if (pill && spotlight) {
    gsap.set(spotlight, { xPercent: -50, yPercent: -50 });
    pill.addEventListener('mousemove', (e) => {
      const rect = pill.getBoundingClientRect();
      const targetX = e.clientX - rect.left;
      const targetY = e.clientY - rect.top;
      gsap.to(spotlight, { x: targetX, y: targetY, opacity: 1, duration: 0.4, ease: "power3.out" });
    });
    pill.addEventListener('mouseleave', () => {
      gsap.to(spotlight, { opacity: 0, duration: 0.6, ease: "power2.out" });
    });
  }

  const tooltip = document.getElementById('trait-tooltip');
  const tooltipTitle = document.getElementById('tooltip-title');
  const tooltipDesc = document.getElementById('tooltip-desc');
  const traitNodes = document.querySelectorAll('.trait-node');
  let hoverTimer;

  gsap.set(tooltip, { opacity: 0, y: -15, scale: 0.9 });

  traitNodes.forEach(node => {
    node.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        tooltipTitle.textContent = node.getAttribute('data-title');
        tooltipDesc.textContent = node.getAttribute('data-desc');
        const rect = node.getBoundingClientRect();
        const tooltipX = rect.left + (rect.width / 2);
        const tooltipY = rect.bottom + 26; 
        gsap.set(tooltip, { left: tooltipX, top: tooltipY });
        gsap.to(tooltip, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" });
      }, 200);
    });

    node.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      gsap.to(tooltip, { opacity: 0, y: -15, scale: 0.9, duration: 0.3, ease: "power2.in" });
    });
  });

  // ----------------------------------------------------
  // 6. SHIMMER BORDER MOUSE TRACKING
  // ----------------------------------------------------
  const shimmerCards = document.querySelectorAll('.shimmer-card');
  
  shimmerCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ----------------------------------------------------
  // 7. FRAME 2: BRAIN INITIALIZATION ANIMATION
  // ----------------------------------------------------
  // This hides them the millisecond the page loads so they don't flash on screen early
  gsap.set(".brain-card", { opacity: 0 });

  const frame2Tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#frame-2",
      start: "top 65%", // Starts the animation when Frame 2 is 65% down the screen
      toggleActions: "play none none reverse" // Reverses if you scroll back up!
    }
  });

  // Top Left: Starts 50px further top/left, slides inward
  frame2Tl.fromTo(".module-tl", 
    { x: -50, y: -50, opacity: 0 }, 
    { x: 0, y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, 
    0
  )
  // Top Right: Starts 50px further top/right, slides inward
  .fromTo(".module-tr", 
    { x: 50, y: -50, opacity: 0 }, 
    { x: 0, y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, 
    0.15 // Slight delay for a cascading effect
  )
  // Bottom Left: Starts 50px further bottom/left, slides inward
  .fromTo(".module-bl", 
    { x: -50, y: 50, opacity: 0 }, 
    { x: 0, y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, 
    0.30
  )
  // Bottom Right: Starts 50px further bottom/right, slides inward
  .fromTo(".module-br", 
    { x: 50, y: 50, opacity: 0 }, 
    { x: 0, y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, 
    0.45
  );

  // ----------------------------------------------------
  // 8. MAGNETIC HOVER PHYSICS (FRAME 2 CARDS)
  // ----------------------------------------------------
  const brainCards = document.querySelectorAll('.brain-card');

  brainCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (card.classList.contains('is-expanded')) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const moveX = (e.clientX - centerX) * 0.15;
      const moveY = (e.clientY - centerY) * 0.15;
      
      gsap.to(card, { x: moveX, y: moveY, duration: 0.4, ease: "power2.out" });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
    });
  });

  // ----------------------------------------------------
  // 9. GRID-BASED INTERACTIVE PARTICLE SYSTEM
  // ----------------------------------------------------
  function initMagneticGrid(canvasId, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    
    // Grid settings
    const gridSize = 40; 
    let particles = [];
    let mouse = { x: null, y: null, radius: 350 };

    // Set defaults or use custom positions for the "hole"
    const holeX = options.holeX || 0.5; // Defaults to center (50%)
    const holeY = options.holeY || 0.5; // Defaults to center (50%)
    const holeRadiusMultiplier = options.holeRadius || 0.35;

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      particles = [];
      for (let x = gridSize / 2; x < width; x += gridSize) {
        for (let y = gridSize / 2; y < height; y += gridSize) {
          particles.push({ x, y, baseRadius: 1 });
        }
      }
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function draw() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        // 1. Distance from the dynamic "hole" center
        const dxCenter = p.x - (width * holeX);
        const dyCenter = p.y - (height * holeY);
        const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        const bodyRadius = height * holeRadiusMultiplier;

        // 2. Distance from mouse
        const dxMouse = p.x - (mouse.x || -999);
        const dyMouse = p.y - (mouse.y || -999);
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        // 3. BULGE PHYSICS
        let offsetX = 0;
        let offsetY = 0;
        let scale = 1;

        if (distMouse < mouse.radius) {
          const pushStrength = (1 - distMouse / mouse.radius) * 20; 
          const angle = Math.atan2(dyMouse, dxMouse);
          
          offsetX = Math.cos(angle) * pushStrength;
          offsetY = Math.sin(angle) * pushStrength;
          
          scale = 2; 
        }

        // 4. Opacity logic (hides dots inside the bodyRadius)
        let alpha = 0;
        if (distCenter > bodyRadius) {
          alpha = Math.min(1, (distCenter - bodyRadius) / 200);
        }

        ctx.beginPath();
        ctx.arc(p.x + offsetX, p.y + offsetY, p.baseRadius * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }
    
    draw();
  }

  // Fire up the grids with custom hole placements!
  initMagneticGrid('particle-canvas', { 
    holeX: 0.5, 
    holeY: 0.5, 
    holeRadius: 0.35 
  }); 

  initMagneticGrid('particle-canvas-f4', { 
    holeX: 0.25, // Shifts the hole to the left (25% of screen width)
    holeY: 0.5,  // Keeps it vertically centered
    holeRadius: 0.45 // Makes the hole slightly larger to cover both the calendar and mail
  });

  // ----------------------------------------------------
  // 10. FRAME 2: CLICK-TO-EXPAND LOGIC
  // ----------------------------------------------------
  const overlay = document.getElementById('frame-2-overlay');
  
  brainCards.forEach(card => {
    const closeBtn = card.querySelector('.card-close');
    const shortDesc = card.querySelector('.short-desc');
    const expandedContent = card.querySelector('.expanded-content');

    // EXPAND THE CARD
    card.addEventListener('click', () => {
      // Ignore if it's already expanded
      if (card.classList.contains('is-expanded')) return;
      card.classList.add('is-expanded');

      // 1. Fade in the background overlay and fade out all OTHER cards
      gsap.to(overlay, { opacity: 1, pointerEvents: "auto", duration: 0.5 });
      gsap.to('.brain-card:not(.is-expanded)', { opacity: 0, pointerEvents: "none", duration: 0.4 });

      // 2. Save its exact current position so we know where to send it back later
      const rect = card.getBoundingClientRect();
      card.dataset.origTop = rect.top + "px";
      card.dataset.origLeft = rect.left + "px";
      card.dataset.origWidth = rect.width + "px";
      card.dataset.origHeight = rect.height + "px";

      // 3. Freeze its current position in absolute pixels so it doesn't jump
      gsap.set(card, {
        top: card.dataset.origTop,
        left: card.dataset.origLeft,
        right: "auto", 
        bottom: "auto",
        zIndex: 60
      });

      // 4. Animate to the exact center of the screen and expand
      gsap.to(card, {
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        width: window.innerWidth > 768 ? "800px" : "90vw", // massive on desktop, safe on mobile
        height: "auto",
        duration: 0.7,
        ease: "power4.out",
        onStart: () => {
          // Crossfade the text
          gsap.to(shortDesc, { opacity: 0, height: 0, duration: 0.3 });
          gsap.set(expandedContent, { display: "block" });
          gsap.to(expandedContent, { opacity: 1, duration: 0.5, delay: 0.3 });
          gsap.to(closeBtn, { opacity: 1, pointerEvents: "auto", duration: 0.5, delay: 0.4 });
        }
      });
    });

    // CLOSE THE CARD
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevents the click from instantly re-triggering the card expansion
      card.classList.remove('is-expanded');

      // 1. Crossfade the text back to normal
      gsap.to(closeBtn, { opacity: 0, pointerEvents: "none", duration: 0.2 });
      gsap.to(expandedContent, { opacity: 0, duration: 0.2, onComplete: () => {
        gsap.set(expandedContent, { display: "none" });
      }});
      gsap.to(shortDesc, { opacity: 1, height: "auto", duration: 0.4, delay: 0.2 });

      // 2. Animate back to its original corner
      gsap.to(card, {
        top: card.dataset.origTop,
        left: card.dataset.origLeft,
        width: card.dataset.origWidth,
        height: card.dataset.origHeight,
        xPercent: 0,
        yPercent: 0,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          // Once it lands, clear all the inline GSAP styles so Tailwind CSS takes control again!
          gsap.set(card, { clearProps: "all" });
        }
      });

      // 3. Fade the overlay out and bring the other cards back
      gsap.to(overlay, { opacity: 0, pointerEvents: "none", duration: 0.5, delay: 0.1 });
      gsap.to('.brain-card:not(.is-expanded)', { opacity: 1, pointerEvents: "auto", duration: 0.5, delay: 0.2 });
    });
  });

  // ----------------------------------------------------
  // OVERLAY CLICK-AWAY LISTENER
  // ----------------------------------------------------
  if (overlay) {
    overlay.addEventListener('click', () => {
      // Find whichever card currently has the 'is-expanded' class
      const activeCard = document.querySelector('.brain-card.is-expanded');
      if (activeCard) {
        // Find its close button and simulate a click
        const closeBtn = activeCard.querySelector('.card-close');
        if (closeBtn) closeBtn.click();
      }
    });
  }

  // ----------------------------------------------------
  // 12. FRAME 3: TEXT SLIDE-IN ANIMATION
  // ----------------------------------------------------
  const frame3Tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#frame-3",
      start: "top 55%", // Triggers the moment Frame 3 is slightly past halfway up the screen
      toggleActions: "play none none reverse" // Will slide back out if you scroll up!
    }
  });

  // Staggers the animation so the Title, Subtitle, Text, and Buttons slide in one after another
  frame3Tl.fromTo(".f3-stagger", 
    { 
      x: -150,      // Starts 150px off to the left
      opacity: 0    // Completely invisible
    },
    { 
      x: 0,         // Glides exactly to its resting left-aligned position
      opacity: 1,   // Fades to fully visible
      duration: 1.2, 
      stagger: 0.15, // Creates the beautiful 1-2-3-4 cascading effect
      ease: "power4.out" 
    }
  );

  // ----------------------------------------------------
  // 14. FRAME 4: PLANNER TITLE REVEAL
  // ----------------------------------------------------
  gsap.to(".f4-reveal", {
    scrollTrigger: {
      trigger: "#frame-4",
      start: "top 100%",      // Triggers when Frame 4 is 25% up the screen
      toggleActions: "play none none reverse"
    },
    y: 0,
    opacity: 1,
    duration: 1.2,
    ease: "power4.out"
  });

  // ----------------------------------------------------
  // 15. FRAME 4: CARDS ENTRANCE & MERGE ANIMATION
  // ----------------------------------------------------
  
  // 1. The Entrance Animation (Bottom-Up)
  // FIX: We now animate the '.entrance-card' wrapper so it doesn't fight the melt animation!
  gsap.set(".entrance-card", { opacity: 0, y: 60 });
  gsap.set([".master-anim-header", ".master-anim-text"], { opacity: 0, y: 40 });

  const f4EntranceTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#frame-4",
      start: "top 45%", 
      toggleActions: "play none none reverse"
    }
  });

  f4EntranceTl.to(".entrance-card", { 
    y: 0, 
    opacity: 1, 
    duration: 1, 
    stagger: 0.15, 
    ease: "power3.out" 
  });

  // 2. The Pin & Merge Animation
  // This completely locks the screen in place while the user scrolls!
  const mergeTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#frame-4",
      start: "top top", // Triggers the exact moment Frame 4 touches the top of the monitor
      end: "+=150%",    // Keeps the screen pinned for 1.5x the height of the screen
      pin: true,        // Locks the frame in place
      scrub: 1,         // Ties the animation directly to the mouse wheel smoothly
    }
  });

  mergeTl
    // Add a tiny buffer so the user has a moment to read before it merges
    .to({}, { duration: 0.1 })
    
    // The 4 boxes shrink and melt away into the background
    .to(".grid-card", {
      scale: 0.85,
      opacity: 0,
      duration: 1,
      stagger: 0.05, 
      ease: "power2.inOut"
    })
    
    // The Master Box expands and brightens from the exact center
    .to("#master-box", {
      scale: 1,
      opacity: 1,
      pointerEvents: "auto", // Allow hover interactions once fully expanded
      duration: 1.2,
      ease: "power2.out"
    }, "<0.3") // The "<0.3" tells GSAP to start this halfway through the melting animation
    
    // The "AIDEN Calendar" header slides up
    .to(".master-anim-header", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.6") // Start slightly before the box expansion finishes
    
    // The paragraph texts elegantly stagger upwards right after the header
    .to(".master-anim-text", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2, // Cascades the paragraphs nicely
      ease: "power3.out"
    }, "-=0.5");

}); // <-- Final closing bracket for DOMContentLoaded