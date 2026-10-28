/**
 * Public site settings. Everything in this file is visible to every visitor,
 * so it must never contain secrets (API keys, admin passwords, tokens).
 *
 * APPS_SCRIPT_URL is the address of the Google Apps Script web app that stores
 * wallets, orders and consultation requests in your Google Sheet. It is not a
 * secret: the script itself validates every request. See docs/HUONG-DAN-GOOGLE-SHEETS.md.
 */
export const CONFIG = {
  APPS_SCRIPT_URL: '',

  BRAND: 'INNER CODE – Mật mã nội tâm',
  EXPERT: 'Sarah Nguyen',
  PHONE: '0909799695',
  PHONE_DISPLAY: '0909 799 695',
  ZALO_URL: 'https://zalo.me/0909799695',

  BANK: {
    name: 'Vietcombank',
    bin: '970436',
    account: '0071001151943',
    holder: 'NGUYEN THI KIM NGAN',
  },
  MOMO: {
    qrImage: 'assets/momo-qr.jpg',
  },
};
