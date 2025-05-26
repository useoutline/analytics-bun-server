import { sign, verify } from 'jsonwebtoken'

const JWT = {
  ACCESS: {
    privateKey: await Bun.file(`jwtkeys/access/privatekey.pem`).text(),
    publicKey: await Bun.file(`jwtkeys/access/publickey.pem`).text()
  },
  REFRESH: {
    privateKey: await Bun.file(`jwtkeys/refresh/privatekey.pem`).text(),
    publicKey: await Bun.file(`jwtkeys/refresh/publickey.pem`).text()
  }
}

function signJwt(data: { id: string; email: string }, type: 'ACCESS' | 'REFRESH' = 'ACCESS') {
  const privateKey = type === 'ACCESS' ? JWT.ACCESS.privateKey : JWT.REFRESH.privateKey
  const expiresIn = type === 'ACCESS' ? '15m' : '30d'
  return sign(Buffer.from(JSON.stringify(data)), privateKey, { expiresIn, algorithm: 'RS256' })
}

function verifyJwt(token: string, type: 'ACCESS' | 'REFRESH' = 'ACCESS') {
  const publicKey = type === 'ACCESS' ? JWT.ACCESS.publicKey : JWT.REFRESH.publicKey
  return verify(token, publicKey, { algorithms: ['RS256'] }) as { id: string; email: string }
}

export { signJwt, verifyJwt }
