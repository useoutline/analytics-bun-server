import { HTTPHeaders } from 'elysia/types'

export function setCacheHeaders({ set, value }: { set: { headers: HTTPHeaders }; value?: string }) {
  set.headers['Cache-Control'] = value || 'public, max-age=31536000'
}
