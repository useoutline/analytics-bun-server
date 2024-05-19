import { createTransport } from 'nodemailer'

const transporter = createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  logger: true
})

async function sendMail({ recipientEmail, subject, text, html, senderName, senderEmail }) {
  const info = await transporter.sendMail({
    to: recipientEmail,
    from: {
      name: senderName ?? 'Outline Analytics',
      address: senderEmail ?? process.env.MAILER_EMAIL
    },
    subject,
    text,
    html
  })
  return info
}

export { sendMail }
