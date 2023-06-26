import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: "application/json",
  },
});

const apiClient = <T = any, D = any>(config: AxiosRequestConfig<D>) =>
  instance.request<T, AxiosResponse<T, D>, D>(config);

export default apiClient;
