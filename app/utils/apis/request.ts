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
    console.log("request error", error);
    return Promise.reject(error);
  }
);

const checkIsAuthorized = (response: AxiosResponse) => {
  console.log("handleUnauthorized", response);
  const { data } = response;
  if (data.code === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
  }
};

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    checkIsAuthorized(response);
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error("response error", error);
    }
    return Promise.reject(error);
  }
);

export const apiRequest = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return request.get(url, config);
  },
  post: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return request.post(url, data, config);
  },
  put: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return request.put(url, data, config);
  },
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return request.delete(url, config);
  },
};

export default apiRequest;
