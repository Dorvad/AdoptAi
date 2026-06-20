/* =====================================================================
   AI Adoption Workshop Kit — interactions
   ===================================================================== */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- FAQ accordion ---------------------------------------------------
     One panel open at a time, fully keyboard/screen-reader accessible. */
  const faq = document.getElementById("faq");
  if (faq) {
    const triggers = Array.from(faq.querySelectorAll(".faq__trigger"));

    triggers.forEach(function (trigger) {
      const panel = trigger.closest(".faq__item").querySelector(".faq__panel");

      trigger.addEventListener("click", function () {
        const willOpen = trigger.getAttribute("aria-expanded") !== "true";

        // Close everything first (single-open behaviour).
        triggers.forEach(function (other) {
          other.setAttribute("aria-expanded", "false");
          const otherPanel = other.closest(".faq__item").querySelector(".faq__panel");
          otherPanel.hidden = true;
        });

        if (willOpen) {
          trigger.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });
    });
  }

  /* ---- Mobile navigation ---------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    const closeNav = function () {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
      mobileNav.hidden = true;
    };

    navToggle.addEventListener("click", function () {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      if (open) {
        closeNav();
      } else {
        navToggle.setAttribute("aria-expanded", "true");
        navToggle.setAttribute("aria-label", "Close menu");
        mobileNav.hidden = false;
      }
    });

    // Close after following a link or pressing Escape.
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---- Hero: cursor-repel on floating icons ---------------------------
     Icons drift away from the pointer when it comes within ~150px, then
     ease back. Mirrors the framer-motion spring behaviour of the original
     component using a CSS transition + a single rAF-throttled handler. */
  const heroIcons = document.getElementById("heroIcons");
  const hero = heroIcons ? heroIcons.closest(".hero") : null;
  if (hero && heroIcons && !prefersReduced && window.matchMedia("(hover: hover)").matches) {
    const repels = Array.from(heroIcons.querySelectorAll(".float-chip__repel"));
    const RADIUS = 150;
    const FORCE = 50;
    let mx = 0, my = 0, ticking = false;

    const reset = function () {
      repels.forEach(function (el) {
        el.style.setProperty("--rx", "0px");
        el.style.setProperty("--ry", "0px");
      });
    };

    const update = function () {
      ticking = false;
      repels.forEach(function (el) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < RADIUS && dist > 0) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - dist / RADIUS) * FORCE;
          el.style.setProperty("--rx", (-Math.cos(angle) * force).toFixed(1) + "px");
          el.style.setProperty("--ry", (-Math.sin(angle) * force).toFixed(1) + "px");
        } else {
          el.style.setProperty("--rx", "0px");
          el.style.setProperty("--ry", "0px");
        }
      });
    };

    hero.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    });
    hero.addEventListener("mouseleave", reset);
  }

  /* ---- Hero: sparkles on "real work habits" --------------------------
     Vanilla port of the SparklesText component. Twinkling SVG stars are
     scattered over the phrase; each respawns at a new spot when its
     lifespan runs out. Uses the brand palette (amber + sage) rather than
     the component's default purple/pink, and is skipped under reduced
     motion. The text itself stays part of the gradient headline. */
  (function initSparkles() {
    const container = document.getElementById("heroSparkles");
    if (!container || prefersReduced) return;

    const SVG_NS = "http://www.w3.org/2000/svg";
    const STAR_PATH = "M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z";
    const COLORS = ["#C9904A", "#315C54"]; // amber, sage
    const COUNT = 11;

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function reset(s) {
      s.lifespan = rand(5, 15);
      s.el.style.left = rand(0, 100) + "%";
      s.el.style.top = rand(0, 100) + "%";
      s.el.style.setProperty("--sp-scale", rand(0.4, 1.1).toFixed(2));
      s.el.style.animationDelay = rand(0, 2).toFixed(2) + "s";
      s.path.setAttribute("fill", Math.random() > 0.5 ? COLORS[0] : COLORS[1]);
    }

    function make() {
      const el = document.createElementNS(SVG_NS, "svg");
      el.setAttribute("class", "sparkle");
      el.setAttribute("viewBox", "0 0 21 21");
      el.setAttribute("width", "18");
      el.setAttribute("height", "18");
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("focusable", "false");
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", STAR_PATH);
      el.appendChild(path);
      container.appendChild(el);
      const s = { el: el, path: path, lifespan: 0 };
      reset(s);
      return s;
    }

    const sparkles = [];
    for (let i = 0; i < COUNT; i++) sparkles.push(make());

    // Tick lifespans; respawn (reposition) expired sparkles, like the original.
    setInterval(function () {
      sparkles.forEach(function (s) {
        s.lifespan -= 0.1;
        if (s.lifespan <= 0) reset(s);
      });
    }, 100);
  })();

  /* ---- Reveal on scroll ----------------------------------------------- */
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  revealEls.forEach(function (el) {
    const d = el.getAttribute("data-reveal-delay");
    if (d) el.style.setProperty("--reveal-delay", d);
  });

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { observer.observe(el); });
  }
})();
