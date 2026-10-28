/** Client for the Google Apps Script backend. */

import { CONFIG } from './config.js';

export const isConfigured = () => /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(CONFIG.APPS_SCRIPT_URL);

/**
 * POST a JSON action. The body is sent as text/plain so the browser makes a "simple" request
 * (no CORS preflight), which Apps Script web apps accept.
 */
export async function callBackend(action, payload = {}, { timeoutMs = 20000 } = {}) {
  if (!isConfigured()) throw new Error('Hệ thống ví đang được thiết lập. Vui lòng liên hệ Zalo để được hỗ trợ.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action, ...payload }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Máy chủ trả lỗi ${response.status}.`);
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'Yêu cầu không thành công.');
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Kết nối quá lâu, vui lòng thử lại.');
    if (error instanceof TypeError) throw new Error('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
