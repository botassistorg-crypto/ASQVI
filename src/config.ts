/**
 * ========================================
 *  SECURE CONFIGURATION
 * ========================================
 * 
 * This file contains your Apps Script URL.
 * It is hardcoded here so it CANNOT be changed 
 * from the browser console or Settings panel.
 * 
 * TO UPDATE: Change the URL below and push to GitHub.
 * 
 * HOW TO GET YOUR URL:
 * 1. Go to your Google Apps Script
 * 2. Click Deploy → Manage deployments
 * 3. Copy the Web App URL
 * 4. Paste it below
 * ========================================
 */

// 👇 PASTE YOUR APPS SCRIPT WEB APP URL HERE 👇
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyRAD1GHA7s7U14Ap0gg4qKK3hPrVYQTeT42OIdAYgQJ0NPRO-3FUnoWK4LUYkvYtTybg/exec';
// Example: export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';

/**
 * Fallback OTP — ONLY used when APPS_SCRIPT_URL is empty.
 * Once you set a real URL, this is completely ignored.
 */
export const OFFLINE_OTP = '123456';

/**
 * Check if a real Apps Script URL is configured
 */
export function isScriptConfigured(): boolean {
  return APPS_SCRIPT_URL.length > 0 && APPS_SCRIPT_URL.startsWith('https://script.google.com');
}
