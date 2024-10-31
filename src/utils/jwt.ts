import { sign, verify } from 'jsonwebtoken'

const JWT = {
  ACCESS: {
    privateKey: await Bun.file(`jwtkeys/access/privatekey.pem`).text(),
    publicKey: await Bun.file(`jwtkeys/access/publickey.pem`).text()
  }
}

function signJwt(data: string | object) {
  const privateKey = JWT.ACCESS.privateKey
  const expiresIn = '90d'
  return sign(data, privateKey, { expiresIn, algorithm: 'RS256' })
}

function verifyJwt(token: string) {
  const publicKey = JWT.ACCESS.publicKey
  return verify(token, publicKey, { algorithms: ['RS256'] })
}

export { signJwt, verifyJwt }
