import swagger from '@elysiajs/swagger'

export function setSwagger(data?: {
  path?: string
  documentation?: {
    info?: {
      title?: string
      version?: string
      description?: string
    }
  }
  exclude?: (string | RegExp)[]
  excludeTags?: string[]
}) {
  return swagger({
    path: data?.path || '/',
    version: '1.0.0',
    scalarConfig: {
      darkMode: false
    },
    swaggerOptions: {
      syntaxHighlight: {
        activate: true
      }
    },
    documentation: {
      info: {
        title: data?.documentation?.info?.title || 'Outline Analytics API',
        version: data?.documentation?.info?.version || '1.0.0',
        description:
          data?.documentation?.info?.description || 'API documentation for the application'
      }
    },
    exclude: data?.exclude,
    excludeTags: data?.excludeTags
  })
}
