import useSWR from "swr";
import {client} from "@/hooks/bicycles/api.ts";

export interface ViewPoint {
  "id": string,
  "locationX": string,
  "locationY": string,
  "locationZ": string,
  "rotaionPitch": string,
  "rotaionHeading": string,
  "rotationRoll": string,
  "locationName": string,
  "locationUrl": string
}

export const useViewPointList = () => useSWR(`viewpointLocalization/queryAll`,
  async (path) => (await client.get<Resource<ViewPoint[]>>(path)).data.data);

export const addViewPoint = (data: Partial<ViewPoint>) => {
  return client.post("viewpointLocalization/create", data);
};

export const deleteViewPoint = (id: string) => {
  return client.post(`viewpointLocalization/deleteBatch`, [id]);
};

export const updateViewPoint = (data: Partial<ViewPoint>) => {
  return client.post("viewpointLocalization/update", data);
};
