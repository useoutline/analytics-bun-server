import { createTransport } from 'nodemailer'
import type SMTPPool from 'nodemailer/lib/smtp-pool'

const transportOptions = {
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  logger: true,
  pool: true
} as SMTPPool.Options

const transporter = createTransport(transportOptions)

type SendMailProps = {
  recipientEmail: string
  subject: string
  text: string
  html: string
  senderName?: string
  senderEmail?: string
}

async function sendMail({
  recipientEmail,
  subject,
  text,
  html,
  senderName,
  senderEmail
}: SendMailProps) {
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
