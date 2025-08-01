import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults} from "axios";
import {useNavigate} from "react-router-dom";
import {ELocalStorageKey} from "@/types/enum.ts";
import {CURRENT_CONFIG} from "@/lib/config.ts";

export class Http {
  instance: AxiosInstance;

  constructor(baseURL: string, config?: Omit<CreateAxiosDefaults, "baseURL">) {
    this.instance = axios.create({
      baseURL,
      ...config
    });
  }

  // get
  get<R = unknown>(url: string, query?: Record<string, string | number | boolean>, config?: Omit<AxiosRequestConfig, "params" | "url" | "method">) {
    return this.instance.request<R>({...config, url: url, params: query, method: "get"});
  }

  // create
  post<R = unknown>(url: string, data?: Record<string, JSONValue> | string[], config?: Omit<AxiosRequestConfig, "url" | "data" | "method">) {
    return this.instance.request<R>({...config, url, data, method: "post"});
  }

  // update
  patch<R = unknown>(url: string, data?: Record<string, JSONValue>, config?: Omit<AxiosRequestConfig, "url" | "data">) {
    return this.instance.request<R>({...config, url, data, method: "patch"});
  }

  // update
  put<R = unknown>(url: string, data?: Record<string, JSONValue> | string[], config?: Omit<AxiosRequestConfig, "url" | "data">) {
    return this.instance.request<R>({...config, url, data, method: "put"});
  }

  // destroy
  delete<R = unknown>(url: string, query?: Record<string, string>, data?: Record<string, JSONValue> | string[], config?: Omit<AxiosRequestConfig, "params">) {
    return this.instance.request<R>({...config, url: url, params: query, data, method: "delete"});
  }
}

export function getAuthToken() {
  return localStorage.getItem(ELocalStorageKey.Token);
}

const client = new Http("");

client.instance.interceptors.request.use(
  (config) => {
    config.headers[ELocalStorageKey.Token] = getAuthToken();
    config.baseURL = CURRENT_CONFIG.baseURL;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.instance.interceptors.response.use(
  (response) => {
    if (response.data.code && response.data.code !== 0) {
      return Promise.reject(response);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const useAjax = () => {
  const navigate = useNavigate();
  const onError = (error: AxiosResponse | AxiosError) => {
    console.log("error===");
    console.log(error);
    if ((error as AxiosError).response?.status === 401) {
      navigate("/login");
    } else if ((error as AxiosResponse).data?.code !== 0) {
      /*toast({
        variant: "destructive",
        description: (error as AxiosResponse).data.message
      });*/
    }
    throw error;
  };

  return {
    get: <T>(url: string, query?: Record<string, string | number | boolean>, config?: Omit<AxiosRequestConfig, "params" | "url" | "method">) => {
      return client.get<T>(url, query, config).catch(onError);
    },
    post: <T>(url: string, data?: Record<string, JSONValue> | string[] | undefined, config?: Omit<AxiosRequestConfig, "url" | "data" | "method">) => {
      return client.post<T>(url, data, config).catch(onError);
    },
    patch: <T>(url: string, data?: Record<string, JSONValue>, config?: Omit<AxiosRequestConfig, "url" | "data" | "method">) => {
      return client.patch<T>(url, data, config).catch(onError);
    },
    put: <T>(url: string, data?: Record<string, JSONValue> | string[], config?: Omit<AxiosRequestConfig, "url" | "data" | "method">) => {
      return client.put<T>(url, data, config).catch(onError);
    },
    delete: <T>(url: string, query?: Record<string, string>, data?: Record<string, JSONValue> | string[] | number[], config?: Omit<AxiosRequestConfig, "url" | "data" | "method">) => {
      return client.delete<T>(url, query, data, config).catch(onError);
    },
  };
};
