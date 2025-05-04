import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// http://43.134.99.111:8888/swagger-ui/

const request = axios.create({
  baseURL: "",
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        // 处理未授权错误
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(data);
    }
    return Promise.reject(error);
  }
);

export const apiRequest = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return request.get(url, config);
  },
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return request.post(url, data, config);
  },
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return request.put(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return request.delete(url, config);
  },
};

export default apiRequest;
