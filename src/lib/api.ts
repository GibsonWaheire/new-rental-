import type { EntityMap, ID } from "@/types/entities";

export const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || `${window.location.origin}/api`; // use proxy in dev; override with VITE_API_URL if set

async function request<TResponse>(input: RequestInfo, init?: RequestInit): Promise<TResponse> {
  const resp = await fetch(input, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`API error ${resp.status}: ${text || resp.statusText}`);
  }
  // json-server returns empty body on DELETE
  if (resp.status === 204) return undefined as unknown as TResponse;
  return (await resp.json()) as TResponse;
}

export function buildUrl(resource: keyof EntityMap, id?: ID | string, query?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(`${API_BASE_URL}/${resource}${id ? `/${id}` : ""}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

export const api = {
  list<T extends keyof EntityMap>(resource: T, query?: Record<string, string | number | boolean | undefined>) {
    return request<EntityMap[T][]>(buildUrl(resource, undefined, query));
  },
  get<T extends keyof EntityMap>(resource: T, id: ID) {
    return request<EntityMap[T]>(buildUrl(resource, id));
  },
  create<T extends keyof EntityMap>(resource: T, body: Omit<EntityMap[T], "id">) {
    return request<EntityMap[T]>(buildUrl(resource), {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  update<T extends keyof EntityMap>(resource: T, id: ID, body: Partial<EntityMap[T]>) {
    return request<EntityMap[T]>(buildUrl(resource, id), {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  remove<T extends keyof EntityMap>(resource: T, id: ID) {
    return request<void>(buildUrl(resource, id), { method: "DELETE" });
  },
};

export const queryKeys = {
  all: ["all"] as const,
  resource: <T extends keyof EntityMap>(name: T) => [name] as const,
  byId: <T extends keyof EntityMap>(name: T, id: ID) => [name, id] as const,
};


