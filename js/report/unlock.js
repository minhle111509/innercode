/**
 * Opening paid readings. The server (apps-script/Code.gs) decides what was already paid for;
 * localStorage only remembers unlocks on this device to skip asking for the PIN again.
 */

import { purchase } from '../shop/ui.js';
import { unlockKey, coveredItems } from '../shop/catalog.js';

const STORE_KEY = 'innercode-unlocks';

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
}

export function isUnlocked(item, input) {
  return Boolean(load()[`${item}::${unlockKey(item, input)}`]);
}

export function markUnlocked(item, input) {
  const store = load();
  for (const covered of coveredItems(item)) store[`${covered}::${unlockKey(covered, input)}`] = true;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* storage unavailable */ }
}

/** Resolves true when the reading is open: already unlocked here, or the server confirmed (or found an earlier) payment. */
export async function requestUnlock(item, input, { title, description } = {}) {
  if (isUnlocked(item, input)) return true;
  const ok = await purchase(item, { title, description, input });
  if (ok) markUnlocked(item, input);
  return ok;
}
