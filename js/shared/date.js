const MIN_YEAR = 1900;

/**
 * Parse "YYYY-MM-DD" (the value of <input type="date">).
 * Throws an Error with a user-facing Vietnamese message on invalid input.
 */
export function parseBirthDate(input, today = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(input ?? '').trim());
  if (!match) throw new Error('Vui lòng nhập ngày sinh hợp lệ.');

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  // Date.UTC silently rolls over invalid dates (e.g. 31/02 → 03/03), so compare back.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error('Ngày sinh không tồn tại.');
  }
  if (year < MIN_YEAR) throw new Error(`Năm sinh phải từ ${MIN_YEAR} trở đi.`);

  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (date.getTime() > todayUtc) throw new Error('Ngày sinh không được ở tương lai.');

  return { day, month, year };
}

export function formatDate({ day, month, year }) {
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}
