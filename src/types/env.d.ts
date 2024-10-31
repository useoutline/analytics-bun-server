export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MAXMIND_LICENSE_KEY: string
      MONGO_URL: string
      MAXMIND_DB_URL: string
      PORT: number
      CONSOLE_APIS_ALLOWED_ORIGIN: string
      ADMIN_APIS_ALLOWED_ORIGIN: string
      NODE_ENV: 'development' | 'production'
      MAILER_EMAIL: string
      MAILER_PASSWORD: string
      MAILER_HOST: string
      MAILER_PORT: number
    }
  }
}
