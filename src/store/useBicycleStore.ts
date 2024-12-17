import {create} from "zustand";
import {BicycleOrder, BicyclesInfo} from "@/hooks/bicycles/api.ts";

export interface BicycleMap {
  name: "分布图" | "热力图";
}

interface BicycleStore {
  selectedOrder: BicycleOrder | null;
  setSelectedOrder: (order: BicycleOrder) => void;
  queryParams: Partial<BicyclesInfo>;
  setQueryParams: (queryParams: BicycleStore["queryParams"]) => void;
  selectedMap: BicycleMap,
  setSelectedMap: (map: BicycleMap) => void
}

export const useBicycleStore = create<BicycleStore>((set) => ({
  selectedOrder: null,
  setSelectedOrder: (order: BicycleOrder) => set(() => ({
    selectedOrder: order
  })),
  queryParams: {},
  setQueryParams: (queryParams) => set(() => ({
    queryParams
  })),
  selectedMap: {name: "分布图"},
  setSelectedMap: (map) => set(() => ({
    selectedMap: map
  }))
}));