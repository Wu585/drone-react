import {create} from "zustand";
import {DeviceOsd, DockOsd, GatewayOsd, OSDVisible} from "@/types/device.ts";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";

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
  dronePanelVisible: boolean
  setDronePanelVisible: (visible: boolean) => void
  deviceState: {
    gatewayInfo: {
      [sn: string]: GatewayOsd
    }
    deviceInfo: {
      [sn: string]: DeviceOsd
    }
    dockInfo: {
      [sn: string]: DockOsd
    }
    currentSn: string
    currentType: number
  }
  setDeviceState: (info: any) => void
  setDeviceInfo: (info: any) => void
  clientId: string // mqtt 连接 唯一客户端id
  setClientId: (clientId: string) => void
  osdVisible: Partial<OSDVisible>
  setOsdVisible: (osdVisible: Partial<OSDVisible>) => void
  mqttState: any // mqtt 实例
  setMqttState: (mqttState: any) => void
}

export const useSceneStore = create<SceneStore>((set) => ({
  keyAreas: null,
  isFullScreen: true,
  user: {
    username: "",
    password: ""
  },
  dronePanelVisible: false,
  deviceState: {
    gatewayInfo: {},
    deviceInfo: {},
    dockInfo: {},
    currentSn: "",
    currentType: -1
  },
  clientId: "",
  osdVisible: {
    sn: "",
    callsign: "",
    model: "",
    visible: false,
    gateway_sn: "",
    is_dock: false,
    payloads: null
  },
  mqttState: null,
  setKeyAreas: (keyAreas: SceneStore["keyAreas"]) => set(() => ({
    keyAreas
  })),
  setIsFullScreen: (isFullScreen) => set(() => ({
    isFullScreen
  })),
  setUser: (user) => set(() => ({
    user
  })),
  setDronePanelVisible: (dronePanelVisible) => set(() => ({
    dronePanelVisible
  })),
  setDeviceInfo:()=>set(()=>{

  }),
  setDeviceState: (info) => set((state) => {
    if (Object.keys(info.host).length === 0) {
      return state;
    }
    const dockInfo = {...state.deviceState.dockInfo};
    const dock = dockInfo[info.sn] || (dockInfo[info.sn] = {} as DockOsd);

    // 更新当前设备状态
    const newState = {
      ...state.deviceState,
      dockInfo: dockInfo,
      currentSn: info.sn,
      currentType: EDeviceTypeName.Dock,
    };

    // 根据 info.host 更新 dock 的状态
    if (info.host.mode_code !== undefined) {
      dock.basic_osd = info.host;
    } else if (info.host.wireless_link) {
      dock.link_osd = info.host;
    } else if (info.host.job_number !== undefined) {
      dock.work_osd = info.host;
    }

    return {deviceState: newState};
  }),
  setClientId: (clientId) => set(() => ({
    clientId
  })),
  setOsdVisible: (osdVisible) => set(() => ({
    osdVisible
  })),
  setMqttState: (mqttState) => set(() => ({
    mqttState
  }))
}));
