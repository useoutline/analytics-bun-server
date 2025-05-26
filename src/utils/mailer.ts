import { createTransport, Transporter } from 'nodemailer'
import type SMTPPool from 'nodemailer/lib/smtp-pool'

export type SendMailProps = {
  recipientEmail: string
  subject: string
  text: string
  html: string
  senderName?: string
  senderEmail?: string
}

class Mailer {
  private transporter: Transporter
  private transportOptions: SMTPPool.Options

  constructor() {
    this.transportOptions = {
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
    }
    this.transporter = createTransport(this.transportOptions)
  }

  async send({ recipientEmail, subject, text, html, senderName, senderEmail }: SendMailProps) {
    const info = await this.transporter.sendMail({
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
}

export default new Mailer()
