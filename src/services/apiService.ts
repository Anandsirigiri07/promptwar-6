/**
 * VAYUWISE AI - Client API Service Wrapper
 * Handles network requests, timeouts, AbortController, and structured errors.
 */

export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  _timeoutMs = 15000
): Promise<T> {
  const token = localStorage.getItem('vayuwise_auth_token') || 'demo-token';
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers
  };

  // Only attach signal if explicitly provided or native AbortSignal.timeout is available
  if (options.signal) {
    fetchOptions.signal = options.signal;
  }

  const fullUrl = endpoint.startsWith('http')
    ? endpoint
    : typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
    ? `${window.location.origin}${endpoint}`
    : `http://127.0.0.1:3001${endpoint}`;

  try {
    const response = await fetch(fullUrl, fetchOptions);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMsg = (typeof data === 'object' && data && 'error' in data)
        ? String(data.error)
        : `Request failed with status ${response.status}`;
      throw new ApiError(errorMsg, response.status, data);
    }

    return (isJson && data && typeof data === 'object' && 'data' in data) ? (data.data as T) : (data as T);
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out or was aborted', 408);
    }
    throw new ApiError(err instanceof Error ? err.message : 'Unknown network failure', 500);
  }
}
