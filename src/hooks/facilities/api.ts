import {client} from "@/hooks/bicycles/api.ts";
import useSWRImmutable from "swr/immutable";

export interface FacilityInfo {
  id: number;
  address: string;
  longitude: string;
  latitude: string;
  partyPosition: string;
  healthServices: string | null;
  nursingHome: string | null;
  park: string | null;
  culturalActivityCenter: string | null;
  neighborhoodCommittee: string;
  elderlyActivityRoom: string;
  meetingRoom: string;
  library: string | null;
  lifeStation: string | null;
  communityCafeteria: string | null;
  elderlyCenter: string | null;
  dayCareCenters: string | null;
  elderlySportsHome: string | null;
  type?: string;
  personNumber?: string;
  name?: string;
  facilitiesType?: string;
  reservationNums?: string;
  status?: "edit" | "change" | "add";
  image?: string;
  serviceScope: string;
  enable: string | boolean;
}

export const useAllFacilities = () => useSWRImmutable(`fpproject/fp-service-facilities/queryAll`, async (path) =>
  (await client.get<Resource<FacilityInfo[]>>(path)).data.data);

export const saveFacility = (data: Partial<FacilityInfo>) => client.post("fpproject/fp-service-facilities/save", data);

export const deleteFacility = (id: string) => client.delete(`fpproject/fp-service-facilities/delete/${id}`);

export const patchFacility = (id: number, data: Partial<FacilityInfo>) => client.put(`fpproject/fp-service-facilities/update/${id}`, data);
