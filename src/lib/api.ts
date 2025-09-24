export type ApiResult<T> = { data: T; status: number };

const DEFAULT_TIMEOUT_MS = 20000;

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
}

export async function apiPost<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
  init?: RequestInit,
): Promise<ApiResult<TResponse>> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(body),
    credentials: "include",
    signal: controller.signal,
    ...init,
  });
  clearTimeout(id);
  if (!res.ok) {
    const message = await safeError(res);
    throw new Error(message);
  }
  return { data: (await res.json()) as TResponse, status: res.status };
}

export const AuthApi = {
  async login(payload: { email: string; password: string }) {
    return apiPost<
      {
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; role: string };
      },
      { email: string; password: string }
    >("/auth/login", payload);
  },
  googleUrl() {
    return `${getBaseUrl()}/auth/google`;
  },
};

async function safeError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return (data as any)?.message || res.statusText || "Request failed";
  } catch {
    return res.statusText || "Request failed";
  }
}


