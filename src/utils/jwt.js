import jwt from 'jsonwebtoken'

const JWT = {
  ACCESS: {
    privateKey: await Bun.file(`jwtkeys/access/privatekey.pem`).text(),
    publicKey: await Bun.file(`jwtkeys/access/publickey.pem`).text()
  }
}

function signJwt(data) {
  const privateKey = JWT.ACCESS.privateKey
  const expiresIn = '90d'
  return jwt.sign(data, privateKey, { expiresIn, algorithm: 'RS256' })
}

function verifyJwt(token) {
  const publicKey = JWT.ACCESS.publicKey
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] })
}

export { signJwt, verifyJwt }
