import {useAjax} from "@/lib/http.ts";
import useSWR from "swr";

export enum AlgorithmPlatform {
  CloudPlatForm,
  Other
}

export interface AlgorithmConfig {
  algorithm_name: string;
  contact: string;
  contact_phone: string;
  order_type: number;
  description: string;
  id: number;
  warning_level: number;
  device_list: {
    device_sn: string;
    instance_id: string;
  }[];
  algorithm_platform: AlgorithmPlatform;
}

export const ALGORITHM_CONFIG_API_PREFIX = "/algorithm-config/api/v1";

export const useAlgorithmConfigList = (params: {
  page: number
  size: number
}) => {
  const key = params ? [`${ALGORITHM_CONFIG_API_PREFIX}/page`, params] as const : null;
  const {get} = useAjax();
  return useSWR(key, async ([path, params]) => (await get<Resource<{
    records: AlgorithmConfig[]
    total: number
  }>>(path, params)).data.data);
};

export const useAlgorithmConfigById = (id?: number) => {
  const key = id ? [`${ALGORITHM_CONFIG_API_PREFIX}/${id}`, id] as const : null;
  const {get} = useAjax();
  return useSWR(key, async ([path]) => (await get<Resource<AlgorithmConfig>>(path)).data.data);
};
