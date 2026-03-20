"use client";

import { frontendEnv } from "@/lib/env";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import type { AuthTokens } from "@/types/domain";

type Primitive = string | number | boolean | null | undefined;

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  tenantId?: string;
  query?: Record<string, Primitive>;
  allowRefresh?: boolean;
  headers?: HeadersInit;
}

function buildUrl(path: string, query?: Record<string, Primitive>) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${frontendEnv.backendApiBase}${normalizedPath}`, window.location.origin);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function mapTokens(payload: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}): AuthTokens {
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresIn: payload.expires_in,
  };
}

async function parseError(response: Response) {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = await response.text();
  }

  const message = formatErrorMessage(payload, response.status);

  return new ApiError(message, response.status, payload);
}

function formatValidationItem(item: unknown) {
  if (typeof item !== "object" || item === null) {
    return String(item);
  }

  const entry = item as {
    loc?: unknown[];
    msg?: string;
    type?: string;
  };
  const location = Array.isArray(entry.loc)
    ? entry.loc
        .map((part) => String(part))
        .filter((part) => part !== "body" && part !== "payload")
        .join(".")
    : "";

  if (location && entry.msg) {
    return `${location}: ${entry.msg}`;
  }

  return entry.msg || entry.type || JSON.stringify(item);
}

function formatErrorMessage(payload: unknown, status: number) {
  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload !== "object" || payload === null) {
    return `Request failed with status ${status}.`;
  }

  const candidate = payload as {
    detail?: unknown;
    message?: unknown;
  };

  if (typeof candidate.message === "string" && candidate.message.trim()) {
    return candidate.message;
  }

  if (typeof candidate.detail === "string" && candidate.detail.trim()) {
    return candidate.detail;
  }

  if (Array.isArray(candidate.detail) && candidate.detail.length) {
    return candidate.detail.map(formatValidationItem).join(" | ");
  }

  return `Request failed with status ${status}.`;
}

async function refreshAccessToken() {
  const authState = useAuthStore.getState();

  if (!authState.tokens?.refreshToken) {
    throw new ApiError("Session expired.", 401, null);
  }

  const response = await fetch(buildUrl("/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: authState.tokens.refreshToken,
    }),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const payload = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  const tokens = mapTokens(payload);
  authState.updateTokens(tokens);
  return tokens;
}

export function clearClientSession() {
  useAuthStore.getState().clearSession();
  useTenantStore.getState().clearTenantContext();
}

export async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const authState = useAuthStore.getState();
  const tenantId =
    options.tenantId ||
    authState.tenantId ||
    useTenantStore.getState().tenantContext?.id ||
    "";
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (tenantId) {
    headers.set("X-Tenant-ID", tenantId);
  }

  if (options.auth !== false && authState.tokens?.accessToken) {
    headers.set("Authorization", `Bearer ${authState.tokens.accessToken}`);
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method || (options.body ? "POST" : "GET"),
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 401 && options.auth !== false && options.allowRefresh !== false) {
    try {
      const nextTokens = await refreshAccessToken();
      headers.set("Authorization", `Bearer ${nextTokens.accessToken}`);

      const retryResponse = await fetch(buildUrl(path, options.query), {
        method: options.method || (options.body ? "POST" : "GET"),
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });

      if (!retryResponse.ok) {
        throw await parseError(retryResponse);
      }

      if (retryResponse.status === 204) {
        return undefined as T;
      }

      return (await retryResponse.json()) as T;
    } catch (error) {
      clearClientSession();
      throw error;
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export { mapTokens };
