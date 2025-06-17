import {Http, useAjax} from "@/lib/http.ts";
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
  device_list?: {
    device_sn: string;
    instance_id: string;
    task_id?: string
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

export const cloudClient = new Http("http://218.78.133.200:9090/api/inflet/v1", {
  headers: {
    Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjEsImV4cCI6NDg2OTEwMjE4M30._ZpDlaUdHMz4gyPije6fhOANi8OgEAGl23eRv6JWprA"
  }
});

interface AlarmEffect {
  content: string;
  duration: string;
  enable: boolean;
}

interface CronJob {
  duration: string;
  start_at: string;
}

interface SelectedFeatureLib {
  group_ids: number[];
  id: number;
}

interface Statistics {
  limit: number;
  usage: number;
}

interface Instance {
  alarm_effect: AlarmEffect;
  app_config: string;
  app_config_url: string;
  app_id: number;
  app_label: string;
  app_module_definitions: string;
  app_module_definitions_url: string;
  app_name: string;
  cronjob: CronJob;
  fps: number;
  has_app_update: boolean;
  id: string;
  preview_url: string;
  reason: string;
  report_url: string;
  roi_state: string;
  selected_feature_lib: SelectedFeatureLib;
  sn: string;
  st_state: string;
  statistics: Statistics;
  status: string;
}

interface Item {
  cover: string;
  created_at: number;
  id: number;
  input_from: string;
  input_id: string;
  input_type: string;
  input_url: string;
  instances: Instance[];
  loop: boolean;
  name: string;
  scheduler_type: string;
  status: string;
  updated_at: number;
}

interface Response {
  items: Item[];
  total: number;
}

// 三方平台任务列表查询
// http://218.78.133.200:9090/api/inflet/v1/tasks?page=1&page_size=50&input_type=video
export const useTaskList = (params: {
  page: number
  page_size: number
  input_type: string
}) => {
  const key = params ? [`tasks`] : null;
  return useSWR(key, async ([path]) => (await cloudClient.get<Response>(path, params)).data);
};
