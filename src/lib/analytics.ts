import { getConsent, GA_ID } from "./consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Track a tool usage event in Google Analytics.
 * Only fires if user has given cookie consent.
 *
 * @param toolId - The tool identifier (e.g. "bmi-calculator")
 * @param category - The tool category (e.g. "calculators")
 * @param action - "use" for main action, "copy" for copying results
 */
export function trackToolEvent(
  toolId: string,
  category: string,
  action: "use" | "copy"
) {
  if (getConsent() !== true) return;
  window.gtag?.("event", "tool_used", {
    tool_id: toolId,
    tool_category: category,
    action,
    send_to: GA_ID,
  });
}
