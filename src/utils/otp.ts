export default function generateOTP(numberOfDigits = 6) {
  if (numberOfDigits > 8) {
    throw new Error('OTP length must be less than 8')
  }
  const max = Math.pow(10, numberOfDigits)
  const min = Math.pow(10, numberOfDigits - 1)
  return Math.floor(Math.random() * (max - min) + min)
    .toString()
    .padStart(numberOfDigits, '0')
}
