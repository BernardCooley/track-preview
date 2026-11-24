import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

function buildPlainText({
    heading,
    body,
    buttonText,
    buttonUrl,
}: {
    heading: string;
    body: string;
    buttonText: string;
    buttonUrl: string;
}) {
    return `${heading}\n\n${body}\n\n${buttonText}: ${buttonUrl}\n\nIf you didn't request this, you can safely ignore this email.\n\nPhoniquest — Discover new music`;
}

function buildEmailHtml({
    heading,
    body,
    buttonText,
    buttonUrl,
}: {
    heading: string;
    body: string;
    buttonText: string;
    buttonUrl: string;
}) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Phoniquest</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px; background-color:#ffffff; border-radius:12px; overflow:hidden;">
          <tr>
            <td style="padding:40px 32px 24px; text-align:center; background-color:#1a1a2e;">
              <h1 style="margin:0; font-size:24px; font-weight:700; letter-spacing:6px; color:#ffffff; font-family:'Allerta Stencil', monospace, sans-serif;">PHONIQUEST</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 16px;">
              <h2 style="margin:0 0 16px; font-size:20px; font-weight:600; color:#1a1a2e;">${heading}</h2>
              <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#555555;">${body}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:8px; background-color:#1a1a2e;">
                    <a href="${buttonUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;">
              <p style="margin:0; font-size:13px; line-height:1.5; color:#999999;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px; text-align:center; background-color:#fafafa; border-top:1px solid #eeeeee;">
              <p style="margin:0; font-size:12px; color:#bbbbbb;">Phoniquest &mdash; Discover new music</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(email: string, link: string) {
    const content = {
        heading: "Verify your email",
        body: "Thanks for signing up for Phoniquest! To get started discovering and previewing new music, please verify your email address by clicking the button below. This helps us keep your account secure and ensures you receive important updates about your account.",
        buttonText: "Verify Email",
        buttonUrl: link,
    };
    await transporter.sendMail({
        from: `"Phoniquest" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify your email for Phoniquest",
        text: buildPlainText(content),
        html: buildEmailHtml(content),
    });
}

export async function sendGenreAlertEmail(
    email: string,
    genreSummary: { genre: string; count: number }[]
) {
    const lines = genreSummary.map((g) => `• ${g.genre}: ${g.count} new release${g.count === 1 ? "" : "s"}`).join("\n");
    const htmlLines = genreSummary.map((g) =>
        `<li style="margin:0 0 6px; font-size:15px; color:#555555;">${g.genre}: <strong>${g.count}</strong> new release${g.count === 1 ? "" : "s"}</li>`
    ).join("");

    const content = {
        heading: "New releases in your genres",
        body: `New releases have dropped in genres you follow:\n\n${lines}`,
        buttonText: "Start Listening",
        buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://phoniquest.com"}/new-tracks`,
    };

    const htmlBody = `New releases have dropped in genres you follow:<ul style="margin:12px 0 0; padding-left:20px;">${htmlLines}</ul>`;

    await transporter.sendMail({
        from: `"Phoniquest" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "New releases in your genres — Phoniquest",
        text: buildPlainText(content),
        html: buildEmailHtml({ ...content, body: htmlBody }),
    });
}

export async function sendPasswordResetEmail(email: string, link: string) {
    const content = {
        heading: "Reset your password",
        body: "We received a request to reset the password for your Phoniquest account. Click the button below to choose a new one. If you didn't make this request, you can safely ignore this email and your password will remain unchanged.",
        buttonText: "Reset Password",
        buttonUrl: link,
    };
    await transporter.sendMail({
        from: `"Phoniquest" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Reset your Phoniquest password",
        text: buildPlainText(content),
        html: buildEmailHtml(content),
    });
}
