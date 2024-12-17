import useSWR from "swr";
import {client} from "@/hooks/bicycles/api.ts";

export interface DoorContact {
  imei: string;
  imsi: string;
  iccid: string;
  signTime: string;
  enabledTime: string | null; // Assuming it can be an empty string or null
  signature: string;
  items: Item[];
  eventName: string;
  nonce: string;
  site: string;
  deviceType: string;
  deviceVersion: string;
  timestamp: string; // Assuming it's a string representation of a timestamp
  conpanyName: string; // Note: "conpanyName" seems to be a typo, should it be "companyName"?
  deviceState: number;
  mqPushType: number;
  dataType: number;
}

interface Item {
  value: string;
  attrName: string;
}

// 门磁设备
export const useDoorContact = () => useSWR("sensor/getDoorContact",
  async (path) => (await client.post<Resource<DoorContact[]>>(path)).data.data);

export interface OlderLonely {
  id: string;
  name: string;
  community: string;
  unit: string;
  imei: string;
  state: boolean;
}

// 独居老人
export const useFpLiveAlone = () => useSWR("fpproject/fp-live-alone/queryAll",
  async (path) => (await client.get<Resource<OlderLonely[]>>(path)).data.data);
