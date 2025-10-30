import { redirect } from "next/navigation";

import envConfig from "@/config";
import { useAuthStore } from "@/hooks";
import {
  getSessionTokenFromLocalStorage,
  normalizePath,
  removeTokensFromLocalStorage,
  setSessionTokenToLocalStorage,
} from "@/lib/utils";
import { LoginResType } from "@/models";

const ENTITY_ERROR_STATUS = 422 as const;
const AUTHENTICATION_ERROR_STATUS = 401 as const;
type ValidationError = {
  origin?: string;
  code: string;
  format?: string;
  pattern?: string;
  path: string;
  message: string;
  minimum?: number;
  inclusive?: boolean;
};

type EntityErrorPayload = {
  message: ValidationError[];
  error: string;
  statusCode: number;
};

export class HttpError extends Error {
  status: number;
  payload: {
    message: ValidationError[] | string;
    [key: string]: any;
  };

  constructor({
    status,
    payload,
    message = "Lỗi HTTP",
  }: {
    status: number;
    payload: any;
    message?: string;
  }) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export class EntityError extends HttpError {
  status: 422;
  payload: EntityErrorPayload;
  constructor({
    status,
    payload,
  }: {
    status: 422;
    payload: EntityErrorPayload;
  }) {
    super({ status, payload, message: "Lỗi thực thể" });
    this.status = status;
    this.payload = payload;
  }
}

///--------
type CustomOptions = Omit<RequestInit, "method"> & {
  baseUrl?: string | undefined;
};
//--------

let clientLogoutRequest: null | Promise<any> = null;
const isClient = typeof window !== "undefined";

const request = async <Response>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  options?: CustomOptions | undefined
) => {
  let body: FormData | string | undefined = undefined;
  if (options?.body instanceof FormData) {
    body = options.body;
  } else if (options?.body) {
    body = JSON.stringify(options?.body);
  }

  const baseHeaders: {
    [key: string]: string;
  } =
    body instanceof FormData
      ? {}
      : {
          "Content-Type": "application/json",
        };
  if (isClient) {
    const sessionToken = getSessionTokenFromLocalStorage();
    if (sessionToken) {
      baseHeaders.Authorization = `Bearer ${sessionToken}`;
    }
  }
  // Nếu không truyền baseUrl (hoặc baseUrl = undefined) thì lấy từ envConfig.NEXT_PUBLIC_API_ENDPOINT
  // Nếu truyền baseUrl thì lấy giá trị truyền vào, truyền vào '' thì đồng nghĩa với việc chúng ta gọi API đến Next.js Server
  const backendUrl = envConfig.NEXT_PUBLIC_API_ENDPOINT + "/api";
  const baseUrl = options?.baseUrl === undefined ? backendUrl : options.baseUrl;
  const fullUrl = `${baseUrl}/${normalizePath(url)}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
    },
    body,
    method,
  });
  let payload: Response;
  try {
    payload = await res.json();
  } catch (jsonError) {
    // Nếu không parse được JSON, tạo fallback payload
    const textContent = await res.text().catch(() => "Unknown error");

    throw new HttpError({
      status: res.status,
      payload: {
        message: `Invalid response format: ${textContent}`,
        originalError: jsonError,
      },
    });
  }
  const data = {
    status: res.status,
    payload,
  };
  // Interceptor là nơi chúng ta xử lý request và response trước khi trả về cho phía component
  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(
        data as {
          status: 422;
          payload: EntityErrorPayload;
        }
      );
    } else if (res.status === AUTHENTICATION_ERROR_STATUS) {
      if (isClient) {
        if (!clientLogoutRequest) {
          clientLogoutRequest = fetch("/api/auth/logout", {
            method: "POST",
            body: null,
            headers: {
              ...baseHeaders,
            } as any,
          });
          try {
            await clientLogoutRequest;
          } catch (error) {
          } finally {
            removeTokensFromLocalStorage();
            useAuthStore.getState().reset();
            clientLogoutRequest = null;
            const locale = window.location.pathname.split("/")[1];
            location.href = `/${locale}/login`;
          }
        }
      } else {
        const sessionToken = (options?.headers as any)?.Authorization.split(
          "Bearer "
        )[1];
        redirect(`/logout?sessionToken=${sessionToken}`);
      }
    } else {
      throw new HttpError(data);
    }
  }

  // Đảm bảo logic dưới đây chỉ chạy ở phía client (browser)
  if (isClient) {
    const normalizeUrl = normalizePath(url);
    if (["api/auth/login"].includes(normalizeUrl)) {
      const sessionToken = (payload as LoginResType).data;
      setSessionTokenToLocalStorage(sessionToken);
    } else if (normalizeUrl === "api/auth/logout") {
      removeTokensFromLocalStorage();
      useAuthStore.getState().reset();
    }
  }
  return data;
};

const http = {
  get<Response>(
    url: string,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("GET", url, options);
  },
  post<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("POST", url, { ...options, body });
  },
  put<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("PUT", url, { ...options, body });
  },
  patch<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("PATCH", url, { ...options, body });
  },
  delete<Response>(
    url: string,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("DELETE", url, { ...options });
  },
};

export default http;
