import { APPS_SCRIPT_URL } from '../config/env';

export async function postToAppsScript(
  payload,
  timeoutMs = 30000,
  endpoint = APPS_SCRIPT_URL,
) {
  if (!endpoint) throw new Error('configuration_error');

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    // text/plain evita preflight CORS e mantém compatibilidade com Web Apps do Apps Script.
    const response = await fetch(endpoint, {
      method: 'POST',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return JSON.parse(await response.text());
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('request_timeout');
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}