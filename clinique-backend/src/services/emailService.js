/**
 * Envoi d'e-mails (SMTP via .env). Si non configuré, log en console uniquement.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return { sent: false, reason: "no_recipient" }

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user) {
    console.log(`[email:dry-run] To: ${to} | ${subject}\n${text}`)
    return { sent: false, reason: "smtp_not_configured" }
  }

  try {
    const nodemailer = require("nodemailer")
    const transporter = nodemailer.createTransport({
      host,
      port:     Number(process.env.SMTP_PORT || 587),
      secure:   process.env.SMTP_SECURE === "true",
      auth:     { user, pass },
    })

    await transporter.sendMail({
      from:    process.env.SMTP_FROM || `"Clinique ABC Marouane" <${user}>`,
      to,
      subject,
      text,
      html:    html || `<p>${text.replace(/\n/g, "<br>")}</p>`,
    })
    return { sent: true }
  } catch (err) {
    console.error("sendEmail:", err.message)
    return { sent: false, reason: err.message }
  }
}

module.exports = { sendEmail }
