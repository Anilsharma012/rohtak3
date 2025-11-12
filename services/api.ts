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

    // Parse response safely using a clone to avoid "body stream already read" errors
    try {
      const contentType = res.headers.get('content-type') || '';
      const clone = res.clone();

      if (contentType.includes('application/json')) {
        try {
          data = await clone.json();
        } catch {
          try {
            const txt = await clone.text();
            data = txt ? JSON.parse(txt) : null;
          } catch {
            data = null;
          }
        }
      } else {
        try {
          const txt = await clone.text();
          try {
            data = txt ? JSON.parse(txt) : null;
          } catch {
            data = txt;
          }
        } catch {
          data = null;
        }
      }
    } catch (parseErr) {
      data = null;
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
