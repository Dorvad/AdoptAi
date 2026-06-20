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
