export type ApiResponse<T = any> = { success: boolean; data?: T; message?: string };

const BASE = (import.meta as any)?.env?.VITE_API_BASE_URL || '';

const jsonHeaders = { 'Content-Type': 'application/json' } as const;

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers: Record<string, string> = {
      ...jsonHeaders,
      ...(opts.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      ...opts,
      headers,
    });

    let data: any = null;
    const contentType = res.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    } else {
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || res.statusText || `Request failed with status ${res.status}`;
      throw new Error(msg);
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body?: any) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(path: string, body?: any) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T = any>(path: string, body?: any) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
};
