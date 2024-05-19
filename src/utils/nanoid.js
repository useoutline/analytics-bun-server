import { customAlphabet } from 'nanoid'

const customNanoId = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  12
)

export { customNanoId }
