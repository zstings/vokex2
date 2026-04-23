import vokexCall from "./vokexCall";

/**
 * RequestOptions HTTP 请求选项（与 fetch API 一致）
 */
export interface RequestOptions {
  /** 请求方法 */
  method?: string;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 请求体 */
  body?: string;
  /** 超时时间（秒） */
  timeout?: number;
}

/**
 * HttpResponse HTTP 响应
 */
export interface HttpResponse {
  /** 状态码 */
  statusCode: number;
  /** 状态文本 */
  statusText: string;
  /** 响应头 */
  headers: Record<string, string>;
  /** 响应体 */
  body: string;
  /** 是否成功 (2xx) */
  ok: boolean;
}

/**
 * HTTP API 接口
 */
export interface HttpAPI {
  /** 发送 HTTP 请求 */
  request: (url: string, options?: RequestOptions) => Promise<HttpResponse>;
  /** GET 请求 */
  get: (url: string, options?: RequestOptions) => Promise<HttpResponse>;
  /** POST 请求 */
  post: (url: string, data?: string, options?: RequestOptions) => Promise<HttpResponse>;
  /** PUT 请求 */
  put: (url: string, data?: string, options?: RequestOptions) => Promise<HttpResponse>;
  /** DELETE 请求 */
  delete: (url: string, options?: RequestOptions) => Promise<HttpResponse>;
}

/**
 * HTTP 请求 API（后端代理，绕过 CORS）
 */
export const http: HttpAPI = {
  /**
   * 发送 HTTP 请求
   * @param url 请求地址
   * @param options 请求选项
   */
  request: (url: string, options?: RequestOptions): Promise<HttpResponse> =>
    vokexCall('http.request', { url, ...options }),

  /**
   * GET 请求
   * @param url 请求地址
   * @param options 请求选项
   */
  get: (url: string, options?: RequestOptions): Promise<HttpResponse> =>
    vokexCall('http.request', { url, method: 'GET', ...options }),

  /**
   * POST 请求
   * @param url 请求地址
   * @param data 请求体
   * @param options 请求选项
   */
  post: (url: string, data?: string, options?: RequestOptions): Promise<HttpResponse> =>
    vokexCall('http.request', { url, method: 'POST', body: data, ...options }),

  /**
   * PUT 请求
   * @param url 请求地址
   * @param data 请求体
   * @param options 请求选项
   */
  put: (url: string, data?: string, options?: RequestOptions): Promise<HttpResponse> =>
    vokexCall('http.request', { url, method: 'PUT', body: data, ...options }),

  /**
   * DELETE 请求
   * @param url 请求地址
   * @param options 请求选项
   */
  delete: (url: string, options?: RequestOptions): Promise<HttpResponse> =>
    vokexCall('http.request', { url, method: 'DELETE', ...options }),
};