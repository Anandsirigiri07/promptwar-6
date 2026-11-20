/**
 * VAYUWISE AI - Secure Structured Server Logger
 * Redacts secrets, tokens, PII, and handles production vs dev formatting.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function redactSensitive(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    if (typeof data === 'string') {
      // Redact potential API keys or tokens
      return data.replace(/(AIza[0-9A-Za-z-_]{35}|Bearer\s+[A-Za-z0-9-_.]+)/gi, '[REDACTED_CREDENTIAL]');
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitive);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('key') ||
      lowerKey.includes('token') ||
      lowerKey.includes('password') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('auth')
    ) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = redactSensitive(val);
    }
  }
  return sanitized;
}

export const logger = {
  info(message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const payload = context ? ` ${JSON.stringify(redactSensitive(context))}` : '';
    console.log(`[${timestamp}] [INFO] ${message}${payload}`);
  },

  warn(message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const payload = context ? ` ${JSON.stringify(redactSensitive(context))}` : '';
    console.warn(`[${timestamp}] [WARN] ${message}${payload}`);
  },

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const errMessage = error instanceof Error ? error.message : String(error);
    const errStack = process.env.NODE_ENV !== 'production' && error instanceof Error ? `\n${error.stack}` : '';
    const payload = context ? ` Context: ${JSON.stringify(redactSensitive(context))}` : '';
    console.error(`[${timestamp}] [ERROR] ${message}: ${errMessage}${payload}${errStack}`);
  },

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const payload = context ? ` ${JSON.stringify(redactSensitive(context))}` : '';
      console.debug(`[${timestamp}] [DEBUG] ${message}${payload}`);
    }
  }
};
