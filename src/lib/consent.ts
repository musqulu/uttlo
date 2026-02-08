/** Google Analytics Measurement ID */
export const GA_ID = "G-DLXRKTGKE0";

/** localStorage key for cookie consent */
const CONSENT_KEY = "analytics-consent";

/**
 * Get the current consent state.
 * Returns `true` if accepted, `false` if rejected, `null` if not yet decided.
 */
export function getConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

/**
 * Save the consent decision to localStorage.
 */
export function setConsent(value: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, String(value));
}
