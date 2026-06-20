/* =====================================================================
   AI Adoption Workshop Kit — interactions
   ===================================================================== */
(function () {
  "use strict";

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

  /* ---- Reveal on scroll ----------------------------------------------- */
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  revealEls.forEach(function (el) {
    const d = el.getAttribute("data-reveal-delay");
    if (d) el.style.setProperty("--reveal-delay", d);
  });

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
