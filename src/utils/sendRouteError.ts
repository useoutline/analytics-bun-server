export function sendRouteError(
  code: number,
  message: string,
  data?: {
    error?: string | Record<string, any>
    stack?: any
  }
) {
  return {
    success: false,
    code,
    message,
    error: data?.error,
    stack: data?.stack
  }
}
