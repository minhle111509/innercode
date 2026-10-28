export function sumDigits(value) {
  return String(value)
    .replace(/\D/g, '')
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);
}
