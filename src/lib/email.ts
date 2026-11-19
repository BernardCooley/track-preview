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
<html>
<head>
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
    await transporter.sendMail({
        from: `"Phoniquest" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify your email for Phoniquest",
        html: buildEmailHtml({
            heading: "Verify your email",
            body: "Thanks for signing up for Phoniquest! Please verify your email address by clicking the button below.",
            buttonText: "Verify Email",
            buttonUrl: link,
        }),
    });
}

export async function sendPasswordResetEmail(email: string, link: string) {
    await transporter.sendMail({
        from: `"Phoniquest" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Reset your Phoniquest password",
        html: buildEmailHtml({
            heading: "Reset your password",
            body: "We received a request to reset your password. Click the button below to choose a new one.",
            buttonText: "Reset Password",
            buttonUrl: link,
        }),
    });
}
