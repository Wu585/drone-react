import {useAjax} from "@/lib/http.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import useSWR from "swr";

const MEDIA_API = "/media/api/v1";

const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

interface Data {
  list: MapPhoto[];
  pagination: Pagination;
}

export interface MapPhoto {
  id: number;
  file_id: string;
  file_name: string;
  file_path: string;
  object_key: string;
  sub_file_type: string;
  is_original: boolean;
  drone: string;
  payload: string;
  tinny_fingerprint: string;
  fingerprint: string;
  create_time: string; // ISO 8601 format
  job_id: string;
  parent: number;
  parent_name: string;
  type: number;
  size: string;
  visual: boolean;
  on_map: boolean;
  preview_url: string;
  label_ids: number[];
  label_names: string[];
  longitude: string;
  latitude: string;
}

interface Pagination {
  page: number;
  total: number;
  page_size: number;
}

export const useMapPhoto = () => {
  const {get} = useAjax();
  const _workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const url = `${MEDIA_API}/files/${_workspaceId}/files?page=1&page_size=1000`;
  return useSWR(url, async (path) => (await get<Resource<Data>>(path)).data.data);
};

export const useMapLoadMedia = () => {
  const {post} = useAjax();

  const loadMedia = (body: { ids: number[] }) =>
    post(`${MEDIA_API}/files/${workspaceId}/addMap`, body);

  const changePhotoVisual = (body: { id: number, visual: boolean }) =>
    post(`${MEDIA_API}/files/${workspaceId}/setVisual`, body);

  return {loadMedia, changePhotoVisual};
};

