/**
 * VAYUWISE AI - Prompt Injection and Payload Sanitization Guard
 * Treats untrusted inputs strictly as literal string values.
 * Neutralizes prompt delimiters, limits length, and strips control characters.
 */

export function sanitizeUserInput(input: string, maxLength = 500): string {
  if (typeof input !== 'string') return '';

  // Remove ASCII control characters except \t, \n, \r
  let sanitized = '';
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if ((code >= 32 && code !== 127) || code === 9 || code === 10 || code === 13) {
      sanitized += input[i];
    }
  }

  sanitized = sanitized
    .trim()
    // Neutralize common system prompt delimiter hijacking tokens
    .replace(/(```system|```instruction|<\|im_start\|>|<\|im_end\|>|<system>|<\/system>)/gi, '[FILTERED_TOKEN]');

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

export function sanitizeTextObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeUserInput(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeTextObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
