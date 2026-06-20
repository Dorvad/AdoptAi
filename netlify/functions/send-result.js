/* =====================================================================
   Netlify Function: send-result
   ---------------------------------------------------------------------
   Emails the AI Adoption Readiness result via Resend.

   The scorecard (scorecard.js) POSTs the result JSON here; this function
   holds the secret Resend API key (NEVER expose it in client code) and
   sends a branded HTML report to the participant.

   Required environment variables (set in the Netlify dashboard →
   Site settings → Environment variables):
     RESEND_API_KEY   Your Resend API key (starts with "re_")
     RESEND_FROM      Verified sender, e.g.
                      "AiDopt <reports@yourdomain.com>"
   Optional:
     RESEND_REPLY_TO  Reply-to address, e.g. "hello@yourdomain.com"
     RESEND_ADMIN_TO  Comma-separated address(es) to receive a lead
                      notification for each submission.

   Requires Node 18+ (uses the global fetch). See SCORECARD.md for setup.
   ===================================================================== */

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    return json(500, { error: "Email service is not configured." });
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "Invalid request body." });
  }

  const email = String(data.email || "").trim();
  if (!validEmail(email)) return json(400, { error: "A valid email address is required." });
  if (data.consent !== true) return json(400, { error: "Consent is required." });

  const bandTitle = (data.band && data.band.title) ? data.band.title : "Your report";
  const subject = "Your AI Adoption Readiness result: " + bandTitle;

  // Send the report to the participant.
  const sent = await resendSend(apiKey, {
    from: from,
    to: [email],
    subject: subject,
    html: buildEmailHtml(data),
    reply_to: process.env.RESEND_REPLY_TO || undefined
  });
  if (!sent.ok) {
    return json(502, { error: "Could not send the email.", detail: sent.detail });
  }

  // Optional internal lead notification — best-effort, never fails the user.
  const adminTo = process.env.RESEND_ADMIN_TO;
  if (adminTo) {
    try {
      await resendSend(apiKey, {
        from: from,
        to: adminTo.split(",").map(function (s) { return s.trim(); }).filter(Boolean),
        subject: "New scorecard lead: " + (data.name || "Unknown") + " — " + bandTitle,
        html: buildLeadHtml(data, email),
        reply_to: email
      });
    } catch (e) { /* ignore notification failures */ }
  }

  return json(200, { ok: true });
};

/* ------------------------------------------------------------------ */

async function resendSend(apiKey, payload) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const detail = await res.text();
      return { ok: false, detail: detail };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, detail: String(e) };
  }
}

function json(statusCode, obj) {
  return {
    statusCode: statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj)
  };
}

function validEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ""));
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/* ------------------------------------------------------------------ *
 * Email templates (inline styles for email-client compatibility)
 * ------------------------------------------------------------------ */
function buildEmailHtml(d) {
  const SAGE = "#315C54", INK = "#1F2933", MUTED = "#5F6B75", AMBER = "#C9904A",
        LINE = "#DEDAD2", CREAM = "#F8F6F1", SOFT = "#E7EFEA";

  const name = esc(d.name || "there");
  const who = [d.role, d.org].filter(Boolean).map(esc).join(" &middot; ");
  const date = esc(d.date || "");
  const total = Number(d.total) || 0;
  const bandTitle = esc((d.band && d.band.title) || "");
  const bandDesc = esc((d.band && d.band.description) || "");
  const kit = esc(d.kitUrl || "#");
  const strong = d.strongest || {}, weak = d.weakest || {}, rec = d.rec || {};

  const sections = (Array.isArray(d.sections) ? d.sections : []).map(function (s) {
    const pct = Math.max(0, Math.min(100, Number(s.pct) || 0));
    const fill = s.tone === "needs" ? AMBER : SAGE;
    return (
      '<tr><td style="padding:9px 0 0;">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
          '<td style="font:600 14px Arial,sans-serif;color:' + INK + ';">' + esc(s.title) + "</td>" +
          '<td align="right" style="font:400 13px Arial,sans-serif;color:' + MUTED + ';white-space:nowrap;">' + esc(s.raw) + " / 20 &middot; " + esc(s.label) + "</td>" +
        "</tr></table>" +
        '<div style="background:' + SOFT + ';border-radius:4px;height:8px;margin-top:6px;line-height:8px;font-size:0;">' +
          '<div style="background:' + fill + ';width:' + pct + '%;height:8px;border-radius:4px;"></div>' +
        "</div>" +
      "</td></tr>"
    );
  }).join("");

  const focus = (Array.isArray(d.recommendedFocus) ? d.recommendedFocus : []).map(function (f) {
    return '<li style="margin-bottom:6px;color:' + MUTED + ';font:400 14px Arial,sans-serif;">' + esc(f) + "</li>";
  }).join("");

  return (
    '<!doctype html><html><body style="margin:0;background:' + CREAM + ';">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + CREAM + ';padding:24px 0;"><tr><td align="center">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ' + LINE + ';border-radius:14px;overflow:hidden;">' +

      // Header band
      '<tr><td style="background:' + SAGE + ';padding:26px 32px;">' +
        '<div style="font:700 11px Arial,sans-serif;letter-spacing:2px;color:' + SOFT + ';text-transform:uppercase;">AiDopt</div>' +
        '<div style="font:800 22px Arial,sans-serif;color:#ffffff;margin-top:6px;">AI Adoption Readiness Report</div>' +
      "</td></tr>" +

      // Intro
      '<tr><td style="padding:28px 32px 6px;">' +
        '<p style="margin:0;font:400 15px Arial,sans-serif;color:' + INK + ';">Hi ' + name + ",</p>" +
        '<p style="margin:10px 0 0;font:400 15px Arial,sans-serif;line-height:1.6;color:' + MUTED + ';">Here is your personalized AI Adoption Readiness result' + (who ? " (" + who + ")" : "") + ", completed on " + date + ".</p>" +
      "</td></tr>" +

      // Score + band
      '<tr><td style="padding:18px 32px 0;">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + SOFT + ';border-radius:12px;"><tr>' +
          '<td style="padding:20px 24px;">' +
            '<div style="font:800 30px Arial,sans-serif;color:' + SAGE + ';">' + total + ' <span style="font:600 14px Arial,sans-serif;color:' + MUTED + ';">/ 120</span></div>' +
            '<div style="font:700 11px Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:' + AMBER + ';margin-top:10px;">Readiness band</div>' +
            '<div style="font:800 20px Arial,sans-serif;color:' + INK + ';margin-top:2px;">' + bandTitle + "</div>" +
            '<p style="margin:8px 0 0;font:400 14px Arial,sans-serif;line-height:1.6;color:' + MUTED + ';">' + bandDesc + "</p>" +
          "</td>" +
        "</tr></table>" +
      "</td></tr>" +

      // Section breakdown
      '<tr><td style="padding:24px 32px 0;">' +
        '<div style="font:800 16px Arial,sans-serif;color:' + INK + ';margin-bottom:4px;">Section breakdown</div>' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + sections + "</table>" +
      "</td></tr>" +

      // Strongest / weakest
      '<tr><td style="padding:22px 32px 0;">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
          '<td width="50%" style="padding-right:8px;vertical-align:top;">' +
            '<div style="border-left:3px solid ' + SAGE + ';padding-left:12px;">' +
              '<div style="font:700 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:' + MUTED + ';">Strongest area</div>' +
              '<div style="font:700 15px Arial,sans-serif;color:' + INK + ';margin-top:4px;">' + esc(strong.title || "") + "</div>" +
              '<div style="font:400 13px Arial,sans-serif;color:' + MUTED + ';margin-top:2px;">' + esc(strong.raw) + " / 20 &middot; " + esc(strong.label || "") + "</div>" +
            "</div>" +
          "</td>" +
          '<td width="50%" style="padding-left:8px;vertical-align:top;">' +
            '<div style="border-left:3px solid ' + AMBER + ';padding-left:12px;">' +
              '<div style="font:700 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:' + MUTED + ';">Area to focus on</div>' +
              '<div style="font:700 15px Arial,sans-serif;color:' + INK + ';margin-top:4px;">' + esc(weak.title || "") + "</div>" +
              '<div style="font:400 13px Arial,sans-serif;color:' + MUTED + ';margin-top:2px;">' + esc(weak.raw) + " / 20 &middot; " + esc(weak.label || "") + "</div>" +
            "</div>" +
          "</td>" +
        "</tr></table>" +
      "</td></tr>" +

      // Recommended next step
      '<tr><td style="padding:22px 32px 0;">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ' + LINE + ';border-radius:12px;"><tr><td style="padding:18px 20px;">' +
          '<div style="font:700 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:' + SAGE + ';">Recommended next step</div>' +
          '<div style="font:800 17px Arial,sans-serif;color:' + INK + ';margin:8px 0;">Start with: ' + esc(weak.title || "") + "</div>" +
          '<p style="margin:0;font:400 14px Arial,sans-serif;line-height:1.6;color:' + MUTED + ';">' + esc(rec.action || "") + "</p>" +
          '<div style="background:' + CREAM + ';border-radius:8px;padding:12px 14px;margin-top:12px;">' +
            '<div style="font:700 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:' + SAGE + ';">Suggested first experiment</div>' +
            '<p style="margin:4px 0 0;font:400 14px Arial,sans-serif;line-height:1.55;color:' + INK + ';">' + esc(rec.experiment || "") + "</p>" +
          "</div>" +
          (focus ? '<div style="font:700 13px Arial,sans-serif;color:' + INK + ';margin:14px 0 8px;">Focus areas for your band</div><ul style="margin:0;padding-left:18px;">' + focus + "</ul>" : "") +
        "</td></tr></table>" +
      "</td></tr>" +

      // Kit CTA
      '<tr><td style="padding:24px 32px 8px;">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + SAGE + ';border-radius:12px;"><tr><td style="padding:22px 24px;">' +
          '<div style="font:800 18px Arial,sans-serif;color:#ffffff;">Run this conversation with your team</div>' +
          '<p style="margin:8px 0 16px;font:400 14px Arial,sans-serif;line-height:1.6;color:' + SOFT + ';">The full AI Adoption Workshop Kit gives you the facilitator guide, slide deck, participant workbook, activities, templates, and implementation tools to move a team from AI experimentation to real work habits.</p>' +
          '<a href="' + kit + '" style="display:inline-block;background:#ffffff;color:' + INK + ';font:700 14px Arial,sans-serif;text-decoration:none;padding:12px 22px;border-radius:9px;">Get the AI Adoption Workshop Kit</a>' +
        "</td></tr></table>" +
      "</td></tr>" +

      // Footer
      '<tr><td style="padding:18px 32px 28px;border-top:1px solid ' + LINE + ';">' +
        '<p style="margin:0;font:400 12px Arial,sans-serif;line-height:1.6;color:' + MUTED + ';">Generated by AiDopt. Want to run this conversation with your team? <a href="' + kit + '" style="color:' + SAGE + ';">Get the full AI Adoption Workshop Kit</a>.</p>' +
      "</td></tr>" +

    "</table>" +
    "</td></tr></table></body></html>"
  );
}

// Short internal notification for the team (optional).
function buildLeadHtml(d, email) {
  const rows = [
    ["Name", d.name],
    ["Role", d.role],
    ["Organization / team", d.org],
    ["Email", email],
    ["Total", (Number(d.total) || 0) + " / 120"],
    ["Band", d.band && d.band.title],
    ["Strongest", d.strongest && d.strongest.title],
    ["Focus area", d.weakest && d.weakest.title],
    ["Date", d.date]
  ].map(function (r) {
    return '<tr><td style="padding:4px 12px 4px 0;font:600 13px Arial,sans-serif;color:#1F2933;">' + esc(r[0]) +
      '</td><td style="padding:4px 0;font:400 13px Arial,sans-serif;color:#5F6B75;">' + esc(r[1] || "—") + "</td></tr>";
  }).join("");
  return '<div style="font:400 14px Arial,sans-serif;color:#1F2933;"><p>New AI Adoption Readiness Scorecard submission:</p>' +
    '<table role="presentation" cellpadding="0" cellspacing="0">' + rows + "</table></div>";
}
