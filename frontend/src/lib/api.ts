import type { DashboardPayload } from "@property-management/shared";
import { demoDashboard, demoResources } from "../data/demo";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export class AuthError extends Error {
  status: number;
  constructor(message?: string) {
    super(message ?? "Session expired");
    this.name = "AuthError";
    this.status = 401;
  }
}

export interface ListResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

async function request<T>(
  path: string,
  token?: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 401) {
    try {
      window.dispatchEvent(new CustomEvent("auth:expired"));
    } catch (e) {
      // ignore
    }
    throw new AuthError();
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(payload?.message ?? "Request failed");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function getDashboard(token?: string): Promise<DashboardPayload> {
  if (!token) return demoDashboard;
  return request<DashboardPayload>("/dashboard", token).catch(
    () => demoDashboard,
  );
}

export async function listResource<T>(
  resource: string,
  token?: string,
): Promise<ListResponse<T>> {
  if (!token) {
    const data = (demoResources[resource] ?? []) as T[];
    return { data, count: data.length, page: 1, pageSize: 20 };
  }

  // Let real errors propagate — silently falling back to demo data here
  // would hide genuine API failures behind fake-looking real data.
  return request<ListResponse<T>>(`/${resource}`, token);
}

export async function createResource<T>(
  resource: string,
  token: string | undefined,
  payload: Record<string, unknown>,
) {
  if (!token) {
    return {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    } as T;
  }

  return request<T>(`/${resource}`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateResource<T>(
  resource: string,
  id: string,
  token: string | undefined,
  payload: Record<string, unknown>,
) {
  if (!token) {
    return { ...payload, id, created_at: new Date().toISOString() } as T;
  }

  return request<T>(`/${resource}/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteResource(
  resource: string,
  id: string,
  token?: string,
) {
  if (!token) return;

  await request<void>(`/${resource}/${id}`, token, {
    method: "DELETE",
  });
}
