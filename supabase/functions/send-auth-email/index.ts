import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Branded email templates ──────────────────────────────────────────────────

const BASE_STYLE = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: #FAF9F7;
  margin: 0;
  padding: 0;
`;

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vintifi</title>
</head>
<body style="${BASE_STYLE}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F7; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%;">

          <!-- Logo / wordmark -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <span style="font-size:26px; font-weight:800; letter-spacing:-1px; color:#1a1a1a;">
                vintifi
              </span>
              <span style="display:inline-block; width:6px; height:6px; background:#E85D42; border-radius:50%; margin-left:2px; vertical-align:middle;"></span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff; border-radius:20px; padding: 40px 40px 36px; box-shadow: 0 1px 3px rgba(0,0,0,0.07);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="font-size:12px; color:#9B9B9B; margin:0;">
                © ${new Date().getFullYear()} Vintifi · 
                <a href="https://vintifi.app" style="color:#9B9B9B; text-decoration:underline;">vintifi.app</a>
              </p>
              <p style="font-size:11px; color:#BBBBBB; margin:6px 0 0;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function primaryButton(href: string, label: string) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin: 28px 0;">
      <tr>
        <td align="center" style="border-radius:50px; background: linear-gradient(135deg, #E85D42 0%, #F5914E 100%);">
          <a href="${href}" target="_blank"
             style="display:inline-block; padding:14px 36px; font-size:15px; font-weight:700;
                    color:#ffffff; text-decoration:none; border-radius:50px; letter-spacing:0.2px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

function fallbackLink(href: string) {
  return `
    <p style="font-size:12px; color:#9B9B9B; margin:20px 0 0; word-break:break-all;">
      Or copy this link into your browser:<br/>
      <a href="${href}" style="color:#E85D42; text-decoration:none;">${href}</a>
    </p>`;
}

function confirmEmailTemplate(confirmUrl: string) {
  return layout(`
    <!-- Icon -->
    <div align="center" style="margin-bottom:24px;">
      <div style="display:inline-flex; width:56px; height:56px; border-radius:16px;
                  background:linear-gradient(135deg,#E85D42,#F5914E);
                  align-items:center; justify-content:center; font-size:26px; line-height:56px; text-align:center;">
        ✉️
      </div>
    </div>

    <h1 style="font-size:24px; font-weight:800; color:#1a1a1a; margin:0 0 10px; text-align:center; letter-spacing:-0.5px;">
      Confirm your email
    </h1>
    <p style="font-size:15px; color:#555; line-height:1.6; margin:0; text-align:center;">
      Welcome to Vintifi! Tap the button below to confirm your address and start selling smarter.
    </p>

    <div align="center">
      ${primaryButton(confirmUrl, "Confirm my email")}
    </div>

    <div style="border-top:1px solid #F0EEE9; padding-top:20px; margin-top:8px;">
      <p style="font-size:13px; color:#888; text-align:center; margin:0;">
        This link expires in <strong>24 hours</strong>.
      </p>
      ${fallbackLink(confirmUrl)}
    </div>
  `);
}

function magicLinkTemplate(magicUrl: string) {
  return layout(`
    <div align="center" style="margin-bottom:24px;">
      <div style="display:inline-flex; width:56px; height:56px; border-radius:16px;
                  background:linear-gradient(135deg,#E85D42,#F5914E);
                  align-items:center; justify-content:center; font-size:26px; line-height:56px; text-align:center;">
        🔗
      </div>
    </div>

    <h1 style="font-size:24px; font-weight:800; color:#1a1a1a; margin:0 0 10px; text-align:center; letter-spacing:-0.5px;">
      Your sign-in link
    </h1>
    <p style="font-size:15px; color:#555; line-height:1.6; margin:0; text-align:center;">
      Click the button below to sign in to Vintifi. This link is single-use and expires in 1 hour.
    </p>

    <div align="center">
      ${primaryButton(magicUrl, "Sign in to Vintifi")}
    </div>

    <div style="border-top:1px solid #F0EEE9; padding-top:20px; margin-top:8px;">
      ${fallbackLink(magicUrl)}
    </div>
  `);
}

function passwordResetTemplate(resetUrl: string) {
  return layout(`
    <div align="center" style="margin-bottom:24px;">
      <div style="display:inline-flex; width:56px; height:56px; border-radius:16px;
                  background:linear-gradient(135deg,#E85D42,#F5914E);
                  align-items:center; justify-content:center; font-size:26px; line-height:56px; text-align:center;">
        🔑
      </div>
    </div>

    <h1 style="font-size:24px; font-weight:800; color:#1a1a1a; margin:0 0 10px; text-align:center; letter-spacing:-0.5px;">
      Reset your password
    </h1>
    <p style="font-size:15px; color:#555; line-height:1.6; margin:0; text-align:center;">
      We received a request to reset your Vintifi password. Click below to choose a new one.
    </p>

    <div align="center">
      ${primaryButton(resetUrl, "Reset my password")}
    </div>

    <div style="border-top:1px solid #F0EEE9; padding-top:20px; margin-top:8px;">
      <p style="font-size:13px; color:#888; text-align:center; margin:0;">
        This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore it.
      </p>
      ${fallbackLink(resetUrl)}
    </div>
  `);
}

function emailChangeTemplate(changeUrl: string) {
  return layout(`
    <div align="center" style="margin-bottom:24px;">
      <div style="display:inline-flex; width:56px; height:56px; border-radius:16px;
                  background:linear-gradient(135deg,#E85D42,#F5914E);
                  align-items:center; justify-content:center; font-size:26px; line-height:56px; text-align:center;">
        📧
      </div>
    </div>

    <h1 style="font-size:24px; font-weight:800; color:#1a1a1a; margin:0 0 10px; text-align:center; letter-spacing:-0.5px;">
      Confirm your new email
    </h1>
    <p style="font-size:15px; color:#555; line-height:1.6; margin:0; text-align:center;">
      You've requested to update your Vintifi email address. Tap below to confirm the change.
    </p>

    <div align="center">
      ${primaryButton(changeUrl, "Confirm new email")}
    </div>

    <div style="border-top:1px solid #F0EEE9; padding-top:20px; margin-top:8px;">
      ${fallbackLink(changeUrl)}
    </div>
  `);
}

// ── Email type routing ────────────────────────────────────────────────────────

function buildEmail(emailType: string, tokenHash: string, redirectTo: string) {
  const params = new URLSearchParams({ token_hash: tokenHash, type: emailType });
  if (redirectTo) params.set("redirect_to", redirectTo);
  const actionUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify?${params}`;

  switch (emailType) {
    case "signup":
    case "email_change":
      return {
        subject: emailType === "signup" ? "Confirm your Vintifi account" : "Confirm your new email — Vintifi",
        html: emailType === "signup"
          ? confirmEmailTemplate(actionUrl)
          : emailChangeTemplate(actionUrl),
      };
    case "magiclink":
      return { subject: "Your Vintifi sign-in link", html: magicLinkTemplate(actionUrl) };
    case "recovery":
      return { subject: "Reset your Vintifi password", html: passwordResetTemplate(actionUrl) };
    default:
      return { subject: "Vintifi — action required", html: confirmEmailTemplate(actionUrl) };
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("RESEND_API_KEY not configured");
    return new Response(JSON.stringify({ error: "Email service not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    console.log("[send-auth-email] payload type:", payload?.email_data?.email_action_type ?? payload?.type);

    // Supabase auth hook payload shape
    const emailType: string =
      payload?.email_data?.email_action_type ??
      payload?.type ??
      "signup";

    const tokenHash: string =
      payload?.email_data?.hashed_token ??
      payload?.token_hash ??
      "";

    const recipientEmail: string =
      payload?.email_data?.email ??
      payload?.email ??
      "";

    const redirectTo: string =
      payload?.email_data?.redirect_to ??
      payload?.redirect_to ??
      "https://vintifi.app";

    if (!recipientEmail || !tokenHash) {
      console.error("[send-auth-email] Missing email or token_hash", { recipientEmail, tokenHash });
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html } = buildEmail(emailType, tokenHash, redirectTo);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Vintifi <hello@vintifi.com>",
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    const resBody = await res.json();

    if (!res.ok) {
      console.error("[send-auth-email] Resend error:", resBody);
      return new Response(JSON.stringify({ error: resBody }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-auth-email] Sent", emailType, "to", recipientEmail, "id:", resBody.id);
    return new Response(JSON.stringify({ success: true, id: resBody.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-auth-email] Unexpected error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
