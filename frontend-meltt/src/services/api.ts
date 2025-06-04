import axios, { AxiosInstance, AxiosRequestConfig, Method } from "axios";
import { baseAcademicURL, baseAuthURL } from "../utils/baseURL";
import toast from "react-hot-toast";

const getBaseURL = (serviceType: string): string => {
  switch (serviceType) {
    case "authentication":
      return baseAuthURL;
    case "academic":
      return baseAcademicURL;
    default:
      throw new Error("Unknown service type");
  }
};

const createApiInstance = (serviceType: string): AxiosInstance => {
  const api = axios.create({
    baseURL: getBaseURL(serviceType),
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    }
  });

  api.interceptors.request.use(
    (config) => {
      const melttToken = localStorage.getItem("@meltt-user-token");
      const blingToken = localStorage.getItem("bling-access-token");

      if (config.url?.includes("bling") && blingToken) {
        config.headers.Authorization = `Bearer ${blingToken}`;
      } else if (melttToken) {
        config.headers.Authorization = `Bearer ${melttToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Trata erros de rede
      if (!error.response) {
        toast.error("Erro de conexão com o servidor");
        return Promise.reject(error);
      }

      const status = error.response.status;
      const isBlingRequest = error.config.url.includes("bling");

      // Tratamento específico para Bling
      if (status === 401 && isBlingRequest) {
        localStorage.removeItem("bling-access-token");
        localStorage.removeItem("bling-refresh-token");
        
        toast.error("Sessão do Bling expirada. Faça login novamente no Bling!", {
          duration: 10000,
          icon: '🔒'
        });
        
        window.location.href = "/configuracoes-bling"; // Ajuste para sua rota
        return Promise.reject(error);
      }

      // Tratamento geral para 401
      if (status === 401) {
        localStorage.removeItem("@meltt-user-token");
        
        toast.error("Sessão expirada. Redirecionando para login...", {
          duration: 4000,
          icon: "🔒"
        });

        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }

      return Promise.reject(error);
    }
  );

  return api;
};


export const apiRequest = async (
  serviceType: string,
  method: Method,
  url: string,
  data?: any,
  params?: any,
  headers?: any
) => {
  const api = createApiInstance(serviceType);

  const config: AxiosRequestConfig = {
    method,
    url,
    data,
    params,
    headers,
  };

  try {
    const response = await api(config);
    return response?.data ? response.data : response;
  } catch (error: any) {
    console.error("API request error:", error);
    throw error;
  }
};

export const apiGetData = (serviceType: string, url: string, params?: any, headers?: any) =>
  apiRequest(serviceType, "GET", url, null, params, headers);

export const apiPostData = (serviceType: string, url: string, data: any, headers?: any) =>
  apiRequest(serviceType, "POST", url, data, null, headers);

export const apiPatchData = (serviceType: string, url: string, data: any, headers?: any) =>
  apiRequest(serviceType, "PATCH", url, data, null, headers);

export const apiPutData = (serviceType: string, url: string, data?: any, headers?: any) =>
  apiRequest(serviceType, "PUT", url, data, null, headers);

export const apiDeleteData = (serviceType: string, url: string, data?: any, headers?: any) =>
  apiRequest(serviceType, "DELETE", url, data, null, headers);


