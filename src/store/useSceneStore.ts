import {create} from "zustand";

interface User {
  username: string;
  password: string;
}

interface SceneStore {
  keyAreas: {
    datasetInfos: {
      datasetName: string
    }[]
    features: {
      geometry: {
        center: {
          x: number
          y: number
        }
        points: {
          x: number
          y: number
        }[]
      }
    }[]
  }[] | null
  setKeyAreas: (keyAreas: any) => void
  isFullScreen: boolean
  setIsFullScreen: (status: boolean) => void,
  user: User
  setUser: (user: User) => void
}

export const useSceneStore = create<SceneStore>((set) => ({
  keyAreas: null,
  isFullScreen: true,
  user: {
    username: "",
    password: ""
  },
  setKeyAreas: (keyAreas: SceneStore["keyAreas"]) => set(() => ({
    keyAreas
  })),
  setIsFullScreen: (isFullScreen) => set(() => ({
    isFullScreen
  })),
  setUser: (user) => set(() => ({
    user
  })),
}));
