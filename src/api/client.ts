const API_BASE_URL = import.meta.env.VITE_API_URL || "";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl || window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v);
      });
    }
    return url.toString();
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);

    const res = await fetch(url, {
      ...fetchOptions,
      credentials: "include",
      headers: {
        ...(fetchOptions.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...fetchOptions.headers,
      },
    });

    // Handle binary responses (DOCX export)
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/vnd.openxmlformats")) {
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      return blob as unknown as T;
    }

    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(
        data.message || data.error || "Request failed",
        res.status,
        data
      );
    }

    return data as T;
  }

  get<T>(path: string, params?: Record<string, string>) {
    return this.request<T>(path, { method: "GET", params });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body ?? {}),
    });
  }

  delete<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "DELETE",
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const api = new ApiClient(API_BASE_URL);
