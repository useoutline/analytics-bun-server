import { t } from 'elysia'

export type HandlerError = (code: number, response: Record<string, any>) => void

export const ErrorResponseTypebox = t.Object(
  {
    success: t.Boolean(),
    code: t.Number(),
    message: t.String()
  },
  {
    additionalProperties: false
  }
)

export const GenericErrorResponseTypebox = {
  404: ErrorResponseTypebox,
  422: ErrorResponseTypebox,
  500: ErrorResponseTypebox
}
