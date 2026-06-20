/* =====================================================================
   AI Adoption Readiness Scorecard — Workflow Adoption Lab
   ---------------------------------------------------------------------
   A self-contained, progressively-enhanced interactive scorecard that
   renders into #scorecardApp. Built in the same vanilla pattern as
   script.js and reuses the site's existing components and design tokens.

   See SCORECARD.md for: how scoring works, how to edit questions, how to
   set the kit CTA link, how to replace the mock rewarded-ad flow, and how
   to connect a real email provider.
   ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * CONFIG — change these in one place
   * ------------------------------------------------------------------ */
  // Where the "Get the AI Adoption Workshop Kit" buttons point.
  // Replace with the real checkout/landing URL when available.
  const KIT_CTA_URL = "https://example.com/kit";

  /* ------------------------------------------------------------------ *
   * DATA
   * ------------------------------------------------------------------ */
  const sections = [
    { id: "A", title: "Tool and Policy Clarity",     description: "Whether people know which AI tools they can use and what boundaries apply." },
    { id: "B", title: "Practical Use-Case Clarity",  description: "Whether the team knows where AI can actually help in daily work." },
    { id: "C", title: "Workflow Integration",        description: "Whether AI use is connected to real work processes, not just occasional experiments." },
    { id: "D", title: "Risk and Quality Review",     description: "Whether the team has clear review habits for AI-assisted work." },
    { id: "E", title: "Manager and Team Alignment",  description: "Whether managers and teams share expectations around AI-assisted work." },
    { id: "F", title: "Habit Formation and Follow-Up", description: "Whether AI use is likely to become a repeatable work habit." }
  ];

  const sectionTitleById = sections.reduce(function (m, s) { m[s.id] = s.title; return m; }, {});

  // 24 questions, 4 per section. Edit text here; ids/sectionIds drive scoring.
  const scorecardQuestions = [
    { id: "q1",  sectionId: "A", text: "We know which AI tools we are allowed to use at work." },
    { id: "q2",  sectionId: "A", text: "We understand what types of information should not be entered into AI tools." },
    { id: "q3",  sectionId: "A", text: "We know the difference between approved, unapproved, and unclear AI use." },
    { id: "q4",  sectionId: "A", text: "People know where to go when they have a question about AI policy, privacy, or security." },

    { id: "q5",  sectionId: "B", text: "We can name specific work tasks where AI could be useful." },
    { id: "q6",  sectionId: "B", text: "We can distinguish between low-risk AI use cases and high-risk AI use cases." },
    { id: "q7",  sectionId: "B", text: "We focus on real tasks, not only general AI possibilities." },
    { id: "q8",  sectionId: "B", text: "We have examples of useful AI-assisted work that are relevant to our team." },

    { id: "q9",  sectionId: "C", text: "We discuss AI in relation to workflows, not only tools." },
    { id: "q10", sectionId: "C", text: "We know where AI could fit into existing work processes." },
    { id: "q11", sectionId: "C", text: "We know which parts of the workflow should remain human-led." },
    { id: "q12", sectionId: "C", text: "We can describe what should happen before, during, and after AI is used in a task." },

    { id: "q13", sectionId: "D", text: "We know how to review AI-generated or AI-assisted outputs before using them." },
    { id: "q14", sectionId: "D", text: "We check AI outputs for accuracy, missing context, tone, and quality." },
    { id: "q15", sectionId: "D", text: "We know who is responsible for the final quality of AI-assisted work." },
    { id: "q16", sectionId: "D", text: "We have clear boundaries for when AI output should not be used without expert or manager review." },

    { id: "q17", sectionId: "E", text: "Managers know how to evaluate AI-assisted work." },
    { id: "q18", sectionId: "E", text: "Team members know when AI use should be disclosed or discussed." },
    { id: "q19", sectionId: "E", text: "We have shared expectations about what “good enough” means for AI-assisted work." },
    { id: "q20", sectionId: "E", text: "We can talk openly about AI use without judgment, confusion, or unrealistic expectations." },

    { id: "q21", sectionId: "F", text: "We share useful AI workflows, prompts, or examples with each other." },
    { id: "q22", sectionId: "F", text: "We have a way to decide which AI experiments should continue, change, or stop." },
    { id: "q23", sectionId: "F", text: "We can identify one small AI-assisted habit worth testing in the next 7–30 days." },
    { id: "q24", sectionId: "F", text: "AI use is becoming part of how we improve work, not just something people try individually." }
  ];
  // Attach the section title to each question for convenience (per spec shape).
  scorecardQuestions.forEach(function (q) { q.sectionTitle = sectionTitleById[q.sectionId]; });

  const SCALE = [
    { value: 1, label: "Not true at all" },
    { value: 2, label: "Slightly true" },
    { value: 3, label: "Partly true" },
    { value: 4, label: "Mostly true" },
    { value: 5, label: "Very true" }
  ];

  const resultBands = [
    {
      min: 24, max: 48, title: "Early Awareness",
      description: "Your team is likely at the beginning of the AI adoption journey. People may be curious, but there is probably limited clarity around tools, risks, use cases, and expectations. AI use may be happening informally or inconsistently.",
      recommendedFocus: [
        "Clarify approved tools",
        "Define what information should not be entered into AI",
        "Identify low-risk use cases",
        "Create simple review habits",
        "Choose one safe experiment"
      ]
    },
    {
      min: 49, max: 72, title: "Scattered Experimentation",
      description: "Your team is experimenting with AI, but adoption is not yet consistent. Some people may be using AI effectively, while others are unsure, cautious, or disconnected from the practice.",
      recommendedFocus: [
        "Move from individual use to shared workflows",
        "Identify specific work tasks",
        "Share useful examples",
        "Define human review points",
        "Create team-level discussion"
      ]
    },
    {
      min: 73, max: 96, title: "Emerging Adoption",
      description: "Your team has some useful AI practices and may already be building practical habits. The next challenge is consistency, quality control, and shared expectations.",
      recommendedFocus: [
        "Strengthen quality standards",
        "Clarify manager expectations",
        "Build team AI norms",
        "Track implementation",
        "Turn useful experiments into habits"
      ]
    },
    {
      min: 97, max: 120, title: "Strong Adoption Readiness",
      description: "Your team is well-positioned to turn AI use into responsible, repeatable work habits. The focus should now be on scaling what works, formalizing useful practices, and avoiding overconfidence.",
      recommendedFocus: [
        "Prioritize use cases",
        "Build a workflow library",
        "Create a shared prompt library",
        "Measure what works",
        "Create a 30-day implementation plan"
      ]
    }
  ];

  // Per-section guidance used when a section is the weakest area.
  const WEAKEST_RECS = {
    A: {
      action: "Clarify approved tools, data boundaries, and escalation paths for policy, privacy, and security questions.",
      experiment: "Publish a one-page list of approved AI tools and a short “never paste this” data checklist."
    },
    B: {
      action: "Run a Boring Task Hunt to identify specific, low-risk, repeated work tasks where AI can help.",
      experiment: "Hold a 30-minute Boring Task Hunt and pick three low-risk tasks to test."
    },
    C: {
      action: "Choose one task and map the before/after workflow, including the AI role and the human review step.",
      experiment: "Map one task end-to-end, marking where AI assists and where a person reviews."
    },
    D: {
      action: "Create an AI Output Review Checklist covering accuracy, context, tone, privacy, and final human responsibility.",
      experiment: "Draft a five-point review checklist and use it on every AI-assisted output for two weeks."
    },
    E: {
      action: "Hold a manager and team conversation about expectations, disclosure, quality, and what should remain human-led.",
      experiment: "Run one team conversation to agree what “good enough” means for AI-assisted work."
    },
    F: {
      action: "Choose one 30-day AI workflow experiment with an owner, a review step, and a follow-up date.",
      experiment: "Pick one small AI-assisted habit, assign an owner, and set a 30-day follow-up."
    }
  };

  /* ------------------------------------------------------------------ *
   * STATE
   * ------------------------------------------------------------------ */
  const state = {
    participant: { name: "", role: "", org: "", email: "" },
    answers: {},        // { q1: 1..5 }
    step: 0,            // current section index (0..5) while answering
    result: null,       // computed result object
    emailRecord: null   // optional email capture { email, consent }
  };

  /* ------------------------------------------------------------------ *
   * HELPERS
   * ------------------------------------------------------------------ */
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function h(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function formatDate(d) {
    try {
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return d.toDateString();
    }
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function interpretSection(raw) {
    if (raw >= 18) return { label: "Strong area", tone: "strong" };
    if (raw >= 14) return { label: "Good foundation", tone: "good" };
    if (raw >= 9)  return { label: "Developing", tone: "developing" };
    return { label: "Needs clarity", tone: "needs" };
  }

  /* ------------------------------------------------------------------ *
   * SCORING
   * ------------------------------------------------------------------ */
  function computeResult(answers) {
    const sectionScores = sections.map(function (s) {
      const qs = scorecardQuestions.filter(function (q) { return q.sectionId === s.id; });
      const raw = qs.reduce(function (sum, q) { return sum + (Number(answers[q.id]) || 0); }, 0);
      const pct = Math.round((raw / 20) * 100);
      const interp = interpretSection(raw);
      return { id: s.id, title: s.title, description: s.description, raw: raw, pct: pct, label: interp.label, tone: interp.tone };
    });

    const total = sectionScores.reduce(function (a, s) { return a + s.raw; }, 0);
    const band = resultBands.find(function (b) { return total >= b.min && total <= b.max; }) || resultBands[resultBands.length - 1];

    // Strongest = highest raw (first on tie). Weakest = lowest raw (last on tie),
    // so an all-equal result still reports two distinct sections.
    let strongest = sectionScores[0], weakest = sectionScores[0];
    sectionScores.forEach(function (s) {
      if (s.raw > strongest.raw) strongest = s;
      if (s.raw <= weakest.raw) weakest = s;
    });

    return {
      total: total,
      band: band,
      sectionScores: sectionScores,
      strongest: strongest,
      weakest: weakest,
      rec: WEAKEST_RECS[weakest.id],
      date: formatDate(new Date())
    };
  }

  /* ------------------------------------------------------------------ *
   * REWARDED AD UNLOCK (mock)
   * ------------------------------------------------------------------ *
   * Vanilla equivalent of a React `useRewardedAdUnlock()` hook. It owns the
   * unlocked state and a MOCK ad. To go live, replace `watchMockAd` with a
   * real Google Ad Manager rewarded-web integration: load the rewarded ad,
   * and only call `grant()` from the SDK's genuine reward callback. Never
   * auto-grant, never disguise the ad as a normal button, and never block
   * the basic result behind it.
   */
  function useRewardedAdUnlock() {
    const internal = { unlocked: false };
    const subs = new Set();
    function notify() { subs.forEach(function (fn) { fn(internal.unlocked); }); }
    return {
      isUnlocked: function () { return internal.unlocked; },
      subscribe: function (fn) { subs.add(fn); return function () { subs.delete(fn); }; },
      grant: function () { if (!internal.unlocked) { internal.unlocked = true; notify(); } },
      // MOCK/DEV ONLY: resolves after ~5s, calling onTick(secondsLeft) each second.
      watchMockAd: function (onTick) {
        return new Promise(function (resolve) {
          let left = 5;
          onTick && onTick(left);
          const timer = setInterval(function () {
            left -= 1;
            onTick && onTick(Math.max(left, 0));
            if (left <= 0) { clearInterval(timer); resolve(); }
          }, 1000);
        });
      }
    };
  }
  const adUnlock = useRewardedAdUnlock();

  /* ------------------------------------------------------------------ *
   * RENDER — mount + view switching
   * ------------------------------------------------------------------ */
  let mount;

  function setView(html) {
    mount.innerHTML = html;
    if (!prefersReduced) {
      const view = mount.querySelector(".sc-view");
      if (view) { view.classList.add("sc-fade"); }
    }
  }
  function focusEl(sel) {
    const node = mount.querySelector(sel);
    if (node) { node.setAttribute("tabindex", "-1"); node.focus({ preventScroll: false }); }
  }
  function scrollToTop() {
    const section = document.getElementById("scorecard");
    if (section) {
      const y = section.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
    }
  }

  /* ---- View 1: Intro + participant info form ---- */
  function renderIntro() {
    const p = state.participant;
    const sectionList = sections.map(function (s) {
      return '<li><span class="sc-tick" aria-hidden="true"></span>' + h(s.title) + "</li>";
    }).join("");

    setView(
      '<div class="sc-view">' +
        '<div class="cta-panel sc-intro">' +
          '<div class="cta-panel__copy">' +
            '<span class="eyebrow eyebrow--accent">Free interactive tool · ~5 minutes</span>' +
            '<h2 class="cta-panel__title">AI Adoption Readiness Scorecard</h2>' +
            '<p class="cta-panel__body">Find out whether your team is ready to turn AI experimentation into real work habits. Answer 24 short statements across six areas and get a personalized readiness result with a recommended next step.</p>' +
            '<ul class="sc-intro__list">' + sectionList + "</ul>" +
            '<p class="sc-privacy sc-privacy--light">We do not ask for confidential information. Please don’t include sensitive employee, client, legal, financial, or personal data in your answers.</p>' +
          "</div>" +
          '<div class="sc-card sc-form-card">' +
            '<h3 class="sc-form-card__title">Tell us who’s taking it</h3>' +
            '<form id="scParticipant" novalidate>' +
              field("sc-name", "Name", "text", p.name, true, "Used to personalize your result") +
              field("sc-role", "Role", "text", p.role, false, "e.g. L&D Lead, Manager, Consultant") +
              field("sc-org", "Organization or team", "text", p.org, false, "") +
              field("sc-email", "Email", "email", p.email, false, "Optional — you can add it later to save your result") +
              '<p class="sc-error" id="scParticipantError" role="alert" hidden></p>' +
              '<button type="submit" class="btn btn--primary btn--lg sc-block">Start the scorecard</button>' +
              '<p class="sc-form-card__note">24 questions · rated 1 (not true) to 5 (very true)</p>' +
            "</form>" +
          "</div>" +
        "</div>" +
      "</div>"
    );

    const form = document.getElementById("scParticipant");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = form.querySelector("#sc-name").value.trim();
      const err = document.getElementById("scParticipantError");
      const email = form.querySelector("#sc-email").value.trim();
      if (!name) {
        err.textContent = "Please add a name so we can personalize your result.";
        err.hidden = false;
        form.querySelector("#sc-name").focus();
        return;
      }
      if (email && !validEmail(email)) {
        err.textContent = "That email address doesn’t look right. You can also leave it blank.";
        err.hidden = false;
        form.querySelector("#sc-email").focus();
        return;
      }
      state.participant = {
        name: name,
        role: form.querySelector("#sc-role").value.trim(),
        org: form.querySelector("#sc-org").value.trim(),
        email: email
      };
      state.step = 0;
      renderQuestions(0);
      scrollToTop();
    });
  }

  function field(id, label, type, value, required, help) {
    return (
      '<div class="sc-field">' +
        '<label class="sc-label" for="' + id + '">' + h(label) +
          (required ? '<span class="sc-req" aria-hidden="true"> *</span>' : ' <span class="sc-optional">(optional)</span>') +
        "</label>" +
        '<input class="sc-input" id="' + id + '" name="' + id + '" type="' + type + '" value="' + h(value) + '"' +
          (required ? " required" : "") + (help ? ' aria-describedby="' + id + '-help"' : "") + ' autocomplete="off">' +
        (help ? '<span class="sc-help" id="' + id + '-help">' + h(help) + "</span>" : "") +
      "</div>"
    );
  }

  /* ---- View 2: Multi-step questions ---- */
  function renderQuestions(stepIndex) {
    state.step = stepIndex;
    const section = sections[stepIndex];
    const qs = scorecardQuestions.filter(function (q) { return q.sectionId === section.id; });
    const answeredTotal = scorecardQuestions.filter(function (q) { return state.answers[q.id]; }).length;
    const isLast = stepIndex === sections.length - 1;

    const questionsHtml = qs.map(function (q, i) {
      return renderQuestion(q, stepIndex, i);
    }).join("");

    setView(
      '<div class="sc-view sc-quiz">' +
        '<div class="sc-quiz__head">' +
          '<div class="sc-quiz__meta">' +
            '<span class="eyebrow">Section ' + (stepIndex + 1) + " of " + sections.length + "</span>" +
            '<span class="sc-quiz__count">' + answeredTotal + " of 24 answered</span>" +
          "</div>" +
          '<h2 class="section-title sc-quiz__title" id="scStepTitle">' + h(section.title) + "</h2>" +
          '<p class="sc-quiz__desc">' + h(section.description) + "</p>" +
          '<div class="meter sc-quiz__progress"><div class="meter__track">' +
            '<div class="meter__fill" style="--val:' + Math.round((answeredTotal / 24) * 100) + '%"></div>' +
          "</div></div>" +
          '<p class="sc-scale-legend"><span>1 — Not true at all</span><span>5 — Very true</span></p>' +
        "</div>" +
        '<form id="scStepForm" class="sc-quiz__form">' + questionsHtml + "</form>" +
        '<p class="sc-error" id="scStepError" role="alert" hidden>Please answer all four statements to continue.</p>' +
        '<div class="sc-quiz__nav">' +
          '<button type="button" class="btn btn--ghost" id="scBack">' + (stepIndex === 0 ? "Back to details" : "Back") + "</button>" +
          '<button type="button" class="btn btn--primary" id="scNext">' + (isLast ? "See my result" : "Continue") + "</button>" +
        "</div>" +
        '<p class="sc-privacy">No confidential or personal data is needed to complete this scorecard.</p>' +
      "</div>"
    );

    const form = document.getElementById("scStepForm");
    form.addEventListener("change", function (e) {
      if (e.target && e.target.name && e.target.name.indexOf("q_") === 0) {
        const qid = e.target.name.slice(2);
        state.answers[qid] = Number(e.target.value);
        updateStepProgress();
        document.getElementById("scStepError").hidden = true;
      }
    });

    document.getElementById("scBack").addEventListener("click", function () {
      if (stepIndex === 0) { renderIntro(); } else { renderQuestions(stepIndex - 1); }
      scrollToTop();
    });
    document.getElementById("scNext").addEventListener("click", function () {
      const unanswered = qs.filter(function (q) { return !state.answers[q.id]; });
      if (unanswered.length) {
        const err = document.getElementById("scStepError");
        err.hidden = false;
        const firstId = "q_" + unanswered[0].id;
        const firstInput = form.querySelector('[name="' + firstId + '"]');
        if (firstInput) firstInput.focus();
        return;
      }
      if (isLast) {
        // Defensive: ensure all 24 answered before computing.
        const allAnswered = scorecardQuestions.every(function (q) { return state.answers[q.id]; });
        if (!allAnswered) { renderQuestions(0); return; }
        state.result = computeResult(state.answers);
        renderResult();
      } else {
        renderQuestions(stepIndex + 1);
      }
      scrollToTop();
    });

    updateStepProgress();
    focusEl("#scStepTitle");
  }

  function renderQuestion(q, stepIndex, idx) {
    const name = "q_" + q.id;
    const current = state.answers[q.id];
    const opts = SCALE.map(function (o) {
      const checked = current === o.value ? " checked" : "";
      const aria = "Rate “" + q.text + "” as " + o.value + " of 5 — " + o.label;
      return (
        '<label class="sc-opt">' +
          '<input type="radio" name="' + name + '" value="' + o.value + '"' + checked +
            ' aria-label="' + h(aria) + '">' +
          '<span class="sc-opt__box">' +
            '<span class="sc-opt__num">' + o.value + "</span>" +
            '<span class="sc-opt__cap">' + h(o.label) + "</span>" +
          "</span>" +
        "</label>"
      );
    }).join("");

    return (
      '<fieldset class="sc-question">' +
        '<legend class="sc-question__text"><span class="sc-question__n">' + (stepIndex * 4 + idx + 1) + ".</span> " + h(q.text) + "</legend>" +
        '<div class="sc-scale" role="radiogroup">' + opts + "</div>" +
      "</fieldset>"
    );
  }

  function updateStepProgress() {
    const section = sections[state.step];
    const qs = scorecardQuestions.filter(function (q) { return q.sectionId === section.id; });
    const answeredTotal = scorecardQuestions.filter(function (q) { return state.answers[q.id]; }).length;
    const count = mount.querySelector(".sc-quiz__count");
    if (count) count.textContent = answeredTotal + " of 24 answered";
    const fill = mount.querySelector(".sc-quiz__progress .meter__fill");
    if (fill) fill.style.setProperty("--val", Math.round((answeredTotal / 24) * 100) + "%");
    const next = document.getElementById("scNext");
    const stepDone = qs.every(function (q) { return state.answers[q.id]; });
    if (next) {
      next.disabled = !stepDone;
      next.classList.toggle("btn--disabled", !stepDone);
    }
  }

  /* ---- View 3: Result report ---- */
  function renderResult() {
    const r = state.result;
    const p = state.participant;
    const circumference = 2 * Math.PI * 52;
    const pct = r.total / 120;
    const offset = circumference * (1 - pct);

    const whoLine = [p.role, p.org].filter(Boolean).join(" · ");

    const breakdown = r.sectionScores.map(function (s) {
      const warn = s.tone === "needs" ? " meter__fill--warn" : "";
      return (
        '<div class="card card--soft sc-break">' +
          '<div class="sc-break__head">' +
            '<h4 class="sc-break__title">' + h(s.title) + "</h4>" +
            '<span class="sc-pill sc-pill--' + s.tone + '">' + h(s.label) + "</span>" +
          "</div>" +
          '<div class="meter sc-break__meter">' +
            '<div class="meter__head"><span>' + s.raw + " / 20</span><span>" + s.pct + "%</span></div>" +
            '<div class="meter__track"><div class="meter__fill' + warn + '" style="--val:' + s.pct + '%"></div></div>' +
          "</div>" +
        "</div>"
      );
    }).join("");

    const focusList = r.band.recommendedFocus.map(function (f) {
      return '<li><span class="sc-tick" aria-hidden="true"></span>' + h(f) + "</li>";
    }).join("");

    setView(
      '<div class="sc-view sc-result">' +

        // Header
        '<div class="sc-result__head">' +
          '<span class="eyebrow eyebrow--accent">Your result</span>' +
          '<h2 class="section-title" id="scResultTitle">Your AI Adoption Readiness Result</h2>' +
          '<p class="sc-result__who">' + h(p.name) + (whoLine ? ' <span class="sc-dot">·</span> ' + h(whoLine) : "") +
            ' <span class="sc-dot">·</span> ' + h(r.date) + "</p>" +
        "</div>" +

        // Score summary (ring + band)
        '<div class="sc-summary card">' +
          '<div class="sc-ringwrap">' +
            '<svg class="sc-ring" viewBox="0 0 120 120" role="img" aria-label="Total score ' + r.total + ' out of 120">' +
              '<circle class="sc-ring__bg" cx="60" cy="60" r="52"></circle>' +
              '<circle class="sc-ring__fg" cx="60" cy="60" r="52" stroke-dasharray="' + circumference.toFixed(1) + '" stroke-dashoffset="' + circumference.toFixed(1) + '" data-target="' + offset.toFixed(1) + '"></circle>' +
            "</svg>" +
            '<div class="sc-ring__label"><span class="sc-ring__num">' + r.total + '</span><span class="sc-ring__den">/ 120</span></div>' +
          "</div>" +
          '<div class="sc-summary__copy">' +
            '<span class="sc-band-tag">Readiness band</span>' +
            '<h3 class="sc-band">' + h(r.band.title) + "</h3>" +
            '<p class="sc-band__desc">' + h(r.band.description) + "</p>" +
          "</div>" +
        "</div>" +

        // Strongest / weakest
        '<div class="grid grid--2 sc-highlights">' +
          '<div class="card card--soft sc-high sc-high--strong">' +
            '<span class="sc-high__label">Strongest area</span>' +
            '<h4 class="sc-high__title">' + h(r.strongest.title) + "</h4>" +
            '<p class="sc-high__meta">' + r.strongest.raw + " / 20 — " + h(r.strongest.label) + "</p>" +
          "</div>" +
          '<div class="card card--soft sc-high sc-high--weak">' +
            '<span class="sc-high__label">Area to focus on</span>' +
            '<h4 class="sc-high__title">' + h(r.weakest.title) + "</h4>" +
            '<p class="sc-high__meta">' + r.weakest.raw + " / 20 — " + h(r.weakest.label) + "</p>" +
          "</div>" +
        "</div>" +

        // Section breakdown
        '<div class="sc-block">' +
          '<h3 class="sc-block__title">Section breakdown</h3>' +
          '<div class="grid grid--3 sc-breakdown">' + breakdown + "</div>" +
        "</div>" +

        // Recommended next step
        '<div class="card sc-rec">' +
          '<span class="eyebrow">Recommended next step</span>' +
          '<h3 class="sc-rec__title">Start with: ' + h(r.weakest.title) + "</h3>" +
          '<p class="sc-rec__action">' + h(r.rec.action) + "</p>" +
          '<div class="sc-rec__exp"><span class="sc-rec__exp-label">Suggested first experiment</span><p>' + h(r.rec.experiment) + "</p></div>" +
          '<details class="sc-rec__more"><summary>Focus areas for the ' + h(r.band.title) + " band</summary>" +
            '<ul class="sc-rec__focus">' + focusList + "</ul>" +
          "</details>" +
        "</div>" +

        // Email capture + PDF export (two cards)
        '<div class="grid grid--2 sc-actions">' +
          renderEmailCapture() +
          renderPdfCard() +
        "</div>" +

        // Kit CTA
        '<div class="cta-panel sc-kit">' +
          '<div class="cta-panel__copy">' +
            '<span class="eyebrow eyebrow--accent">Take it further</span>' +
            '<h3 class="cta-panel__title">Run this conversation with your team</h3>' +
            '<p class="cta-panel__body">The full AI Adoption Workshop Kit gives you the facilitator guide, slide deck, participant workbook, activities, templates, and implementation tools to help a team move from AI experimentation to real work habits.</p>' +
            '<a href="' + h(KIT_CTA_URL) + '" class="btn btn--light btn--lg" id="scKitCta">Get the AI Adoption Workshop Kit</a>' +
          "</div>" +
        "</div>" +

        '<div class="sc-result__foot">' +
          '<button type="button" class="btn btn--ghost" id="scRetake">Retake the scorecard</button>' +
          '<p class="sc-privacy">Your answers stay in your browser. We don’t collect confidential information.</p>' +
        "</div>" +

      "</div>"
    );

    // Animate the ring.
    const ring = mount.querySelector(".sc-ring__fg");
    if (ring) {
      if (prefersReduced) {
        ring.style.strokeDashoffset = ring.getAttribute("data-target");
      } else {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { ring.style.strokeDashoffset = ring.getAttribute("data-target"); });
        });
      }
    }

    wireEmailCapture();
    wirePdfCard();
    document.getElementById("scRetake").addEventListener("click", function () {
      state.answers = {};
      state.step = 0;
      state.result = null;
      renderIntro();
      scrollToTop();
    });

    focusEl("#scResultTitle");
  }

  /* ---- Email capture ---- */
  function renderEmailCapture() {
    if (state.emailRecord) {
      return (
        '<div class="card card--soft sc-email sc-email--done" id="scEmailCard">' +
          '<h3 class="sc-card-title">Result saved</h3>' +
          '<p class="sc-success">Thanks — your result has been saved. In the production version, this would also send the report to your email.</p>' +
        "</div>"
      );
    }
    return (
      '<div class="card card--soft sc-email" id="scEmailCard">' +
        '<h3 class="sc-card-title">Send me my result and future practical AI adoption resources</h3>' +
        '<form id="scEmailForm" novalidate>' +
          '<div class="sc-field">' +
            '<label class="sc-label" for="sc-result-email">Email</label>' +
            '<input class="sc-input" id="sc-result-email" name="email" type="email" value="' + h(state.participant.email) + '" autocomplete="email">' +
          "</div>" +
          '<label class="sc-consent"><input type="checkbox" id="sc-consent"> <span>I agree to receive practical resources from Workflow Adoption Lab. I can unsubscribe at any time.</span></label>' +
          '<p class="sc-error" id="scEmailError" role="alert" hidden></p>' +
          '<button type="submit" class="btn btn--primary sc-block">Save my result</button>' +
        "</form>" +
      "</div>"
    );
  }

  function wireEmailCapture() {
    const form = document.getElementById("scEmailForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = form.querySelector("#sc-result-email").value.trim();
      const consent = form.querySelector("#sc-consent").checked;
      const err = document.getElementById("scEmailError");
      if (!validEmail(email)) { err.textContent = "Please enter a valid email address."; err.hidden = false; return; }
      if (!consent) { err.textContent = "Please tick the consent box so we can send your result."; err.hidden = false; return; }

      // Store locally for this MVP.
      state.emailRecord = { email: email, consent: true };
      // TODO (production): send { participant, result, email } to your email
      // provider (Beehiiv, MailerLite, ConvertKit, etc.) via their API or a
      // serverless endpoint. Do not expose API keys in client-side code.
      const card = document.getElementById("scEmailCard");
      card.outerHTML = renderEmailCapture();
    });
  }

  /* ---- PDF card (gated behind the optional rewarded-ad unlock) ---- */
  function renderPdfCard() {
    const unlocked = adUnlock.isUnlocked();
    return (
      '<div class="card card--soft sc-pdf" id="scPdfCard">' +
        '<h3 class="sc-card-title">Personalized PDF report</h3>' +
        '<p class="sc-pdf__body">Download a branded AI Adoption Readiness Report with your scores, strongest and weakest areas, and recommended next steps.</p>' +
        (unlocked
          ? '<button type="button" class="btn btn--primary sc-block" id="scPdfDownload">Download PDF report</button>'
          : '<button type="button" class="btn btn--ghost sc-block" id="scPdfUnlock">Unlock personalized PDF export</button>' +
            '<p class="sc-pdf__note">Optional. Your full result above is always free to view.</p>'
        ) +
      "</div>"
    );
  }

  function wirePdfCard() {
    const unlockBtn = document.getElementById("scPdfUnlock");
    if (unlockBtn) {
      unlockBtn.addEventListener("click", function () {
        openPdfUnlockModal(function () {
          adUnlock.grant();
          const card = document.getElementById("scPdfCard");
          card.outerHTML = renderPdfCard();
          wirePdfCard();
          const dl = document.getElementById("scPdfDownload");
          if (dl) dl.focus();
        });
      });
    }
    const dlBtn = document.getElementById("scPdfDownload");
    if (dlBtn) {
      dlBtn.addEventListener("click", function () { exportPdf(); });
    }
  }

  /* ------------------------------------------------------------------ *
   * PDF UNLOCK MODAL (with mock rewarded ad)
   * ------------------------------------------------------------------ */
  function openPdfUnlockModal(onUnlocked) {
    const lastFocus = document.activeElement;
    const overlay = document.createElement("div");
    overlay.className = "sc-modal-overlay";
    overlay.innerHTML =
      '<div class="sc-modal card" role="dialog" aria-modal="true" aria-labelledby="scModalTitle">' +
        '<div class="sc-modal__body" id="scModalBody"></div>' +
      "</div>";
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    const body = overlay.querySelector("#scModalBody");

    function close() {
      document.body.style.overflow = "";
      overlay.remove();
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) close(); });

    function showChoice() {
      body.innerHTML =
        '<h3 class="sc-modal__title" id="scModalTitle">Unlock the personalized PDF</h3>' +
        '<p class="sc-modal__text">To export your personalized PDF report, you can watch a short sponsored ad. You can skip this and continue viewing your result on this page.</p>' +
        '<div class="sc-modal__actions">' +
          '<button type="button" class="btn btn--primary" id="scWatchAd">Watch ad to unlock PDF</button>' +
          '<button type="button" class="btn btn--ghost" id="scSkipAd">Continue without PDF</button>' +
        "</div>";
      body.querySelector("#scSkipAd").addEventListener("click", close);
      body.querySelector("#scWatchAd").addEventListener("click", showMockAd);
      body.querySelector("#scWatchAd").focus();
    }

    // MOCK/DEV ONLY screen — replace with a real rewarded ad unit.
    function showMockAd() {
      body.innerHTML =
        '<div class="sc-ad">' +
          '<span class="sc-ad__tag">Sponsored ad · mock / dev only</span>' +
          '<div class="sc-ad__screen"><span class="sc-ad__count" id="scAdCount">5</span><span class="sc-ad__hint">Your PDF unlocks when this finishes</span></div>' +
          '<button type="button" class="btn btn--ghost sc-ad__skip" id="scSkipAd2">Continue without PDF</button>' +
        "</div>";
      body.querySelector("#scSkipAd2").addEventListener("click", close);
      const countEl = body.querySelector("#scAdCount");
      adUnlock.watchMockAd(function (left) {
        if (countEl) countEl.textContent = left;
      }).then(function () {
        body.innerHTML =
          '<div class="sc-ad sc-ad--done">' +
            '<div class="sc-ad__check" aria-hidden="true">✓</div>' +
            '<h3 class="sc-modal__title">PDF unlocked</h3>' +
            '<p class="sc-modal__text">Thanks. Your personalized PDF export is now available.</p>' +
            '<button type="button" class="btn btn--primary" id="scAdDone">Continue</button>' +
          "</div>";
        body.querySelector("#scAdDone").addEventListener("click", function () { close(); onUnlocked(); });
        body.querySelector("#scAdDone").focus();
      });
    }

    showChoice();
  }

  /* ------------------------------------------------------------------ *
   * PDF EXPORT
   * ------------------------------------------------------------------ */
  function exportPdf() {
    const r = state.result;
    const p = state.participant;
    const jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) {
      // Fallback: open a print-friendly report if jsPDF hasn't loaded.
      printableFallback();
      return;
    }

    // Brand colors (RGB)
    const SAGE = [49, 92, 84], INK = [31, 41, 51], MUTED = [95, 107, 117],
          AMBER = [201, 144, 74], LINE = [222, 218, 210], SAGE_SOFT = [231, 239, 234];

    const doc = new jsPDFCtor({ unit: "mm", format: "a4" });
    const pageW = 210, M = 18;
    let y = 0;

    function ensure(space) { if (y + space > 282) { doc.addPage(); y = M; } }
    function text(str, x, size, color, font, maxW) {
      doc.setFont("helvetica", font || "normal");
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      if (maxW) {
        const lines = doc.splitTextToSize(str, maxW);
        doc.text(lines, x, y);
        y += lines.length * size * 0.42 + 1.5;
      } else {
        doc.text(str, x, y);
        y += size * 0.42 + 1.5;
      }
    }

    // Header band
    doc.setFillColor(SAGE[0], SAGE[1], SAGE[2]);
    doc.rect(0, 0, pageW, 36, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(231, 239, 234);
    doc.text("WORKFLOW ADOPTION LAB", M, 15);
    doc.setFontSize(19); doc.setTextColor(255, 255, 255);
    doc.text("AI Adoption Readiness Report", M, 26);
    y = 48;

    // Participant line
    const who = [p.name, p.role, p.org].filter(Boolean).join("  ·  ");
    text(who || p.name, M, 12, INK, "bold", pageW - M * 2);
    text(r.date, M, 10, MUTED, "normal");
    y += 3;

    // Total + band
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
    doc.setFillColor(SAGE_SOFT[0], SAGE_SOFT[1], SAGE_SOFT[2]);
    doc.roundedRect(M, y, pageW - M * 2, 26, 3, 3, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(26); doc.setTextColor(SAGE[0], SAGE[1], SAGE[2]);
    doc.text(String(r.total) + " / 120", M + 6, y + 16);
    doc.setFontSize(13); doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(r.band.title, M + 62, y + 11);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(doc.splitTextToSize("Readiness band", pageW - M - (M + 62)), M + 62, y + 18);
    y += 34;

    // Band description
    text(r.band.description, M, 10.5, MUTED, "normal", pageW - M * 2);
    y += 2;

    // Section breakdown
    ensure(16);
    text("Section-by-section breakdown", M, 13, INK, "bold");
    y += 1;
    r.sectionScores.forEach(function (s) {
      ensure(14);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(INK[0], INK[1], INK[2]);
      doc.text(s.title, M, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      doc.text(s.raw + " / 20  ·  " + s.label, pageW - M, y, { align: "right" });
      y += 3;
      // bar
      const barW = pageW - M * 2;
      doc.setFillColor(SAGE_SOFT[0], SAGE_SOFT[1], SAGE_SOFT[2]);
      doc.roundedRect(M, y, barW, 2.6, 1.3, 1.3, "F");
      const fillCol = s.tone === "needs" ? AMBER : SAGE;
      doc.setFillColor(fillCol[0], fillCol[1], fillCol[2]);
      doc.roundedRect(M, y, Math.max(barW * (s.pct / 100), 2), 2.6, 1.3, 1.3, "F");
      y += 9;
    });
    y += 2;

    // Strongest / weakest
    ensure(20);
    text("Strongest area", M, 11, SAGE, "bold");
    text(r.strongest.title + "  (" + r.strongest.raw + " / 20)", M, 10.5, INK, "normal", pageW - M * 2);
    y += 1;
    text("Area to focus on", M, 11, AMBER, "bold");
    text(r.weakest.title + "  (" + r.weakest.raw + " / 20)", M, 10.5, INK, "normal", pageW - M * 2);
    y += 3;

    // Recommended next steps
    ensure(24);
    text("Recommended next step", M, 13, INK, "bold");
    text(r.rec.action, M, 10.5, MUTED, "normal", pageW - M * 2);
    y += 1;
    text("Suggested first experiment", M, 11, INK, "bold");
    text(r.rec.experiment, M, 10.5, MUTED, "normal", pageW - M * 2);
    y += 2;

    ensure(20);
    text("Focus areas for your band", M, 11, INK, "bold");
    r.band.recommendedFocus.forEach(function (f) {
      ensure(7);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      const lines = doc.splitTextToSize("•  " + f, pageW - M * 2 - 2);
      doc.text(lines, M + 1, y);
      y += lines.length * 4.4 + 1;
    });
    y += 3;

    // Kit CTA
    ensure(26);
    doc.setFillColor(SAGE[0], SAGE[1], SAGE[2]);
    doc.roundedRect(M, y, pageW - M * 2, 22, 3, 3, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(11.5); doc.setTextColor(255, 255, 255);
    doc.text("Run this conversation with your team", M + 6, y + 9);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(231, 239, 234);
    doc.text("Get the full AI Adoption Workshop Kit:  " + KIT_CTA_URL, M + 6, y + 16);
    y += 30;

    // Footer on every page
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
      doc.line(M, 288, pageW - M, 288);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      doc.text("Generated by Workflow Adoption Lab — Want to run this conversation with your team? Get the full AI Adoption Workshop Kit.", M, 293, { maxWidth: pageW - M * 2 });
    }

    const safe = (p.name || "report").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    doc.save("AI-Adoption-Readiness-" + (safe || "report") + ".pdf");
  }

  // Fallback print report (used only if jsPDF failed to load).
  function printableFallback() {
    const r = state.result, p = state.participant;
    const w = window.open("", "_blank");
    if (!w) { alert("Please allow pop-ups to export your report, or try again in a moment."); return; }
    const rows = r.sectionScores.map(function (s) {
      return "<tr><td>" + h(s.title) + "</td><td>" + s.raw + " / 20</td><td>" + h(s.label) + "</td></tr>";
    }).join("");
    const focus = r.band.recommendedFocus.map(function (f) { return "<li>" + h(f) + "</li>"; }).join("");
    w.document.write(
      "<!doctype html><html><head><meta charset='utf-8'><title>AI Adoption Readiness Report</title>" +
      "<style>body{font-family:Arial,sans-serif;color:#1F2933;max-width:720px;margin:32px auto;padding:0 20px;line-height:1.5}" +
      "h1{color:#315C54}h2{margin-top:28px}table{width:100%;border-collapse:collapse}td{padding:6px 4px;border-bottom:1px solid #DEDAD2}" +
      ".band{font-size:22px;font-weight:700}.total{font-size:34px;color:#315C54;font-weight:800}" +
      "footer{margin-top:32px;border-top:1px solid #DEDAD2;padding-top:12px;color:#5F6B75;font-size:12px}</style></head><body>" +
      "<p style='letter-spacing:.12em;text-transform:uppercase;color:#315C54;font-weight:700;font-size:12px'>Workflow Adoption Lab</p>" +
      "<h1>AI Adoption Readiness Report</h1>" +
      "<p>" + h([p.name, p.role, p.org].filter(Boolean).join(" · ")) + "<br>" + h(r.date) + "</p>" +
      "<p class='total'>" + r.total + " / 120</p><p class='band'>" + h(r.band.title) + "</p><p>" + h(r.band.description) + "</p>" +
      "<h2>Section breakdown</h2><table>" + rows + "</table>" +
      "<h2>Strongest area</h2><p>" + h(r.strongest.title) + " (" + r.strongest.raw + " / 20)</p>" +
      "<h2>Area to focus on</h2><p>" + h(r.weakest.title) + " (" + r.weakest.raw + " / 20)</p>" +
      "<h2>Recommended next step</h2><p>" + h(r.rec.action) + "</p>" +
      "<h2>Suggested first experiment</h2><p>" + h(r.rec.experiment) + "</p>" +
      "<h2>Focus areas for your band</h2><ul>" + focus + "</ul>" +
      "<footer>Generated by Workflow Adoption Lab — Want to run this conversation with your team? Get the full AI Adoption Workshop Kit: " + h(KIT_CTA_URL) + "</footer>" +
      "<script>window.onload=function(){window.print();}<\/script></body></html>"
    );
    w.document.close();
  }

  /* ------------------------------------------------------------------ *
   * INIT
   * ------------------------------------------------------------------ */
  function init() {
    mount = document.getElementById("scorecardApp");
    if (!mount) return;
    renderIntro();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
