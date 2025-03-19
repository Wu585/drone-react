import {create} from "zustand";
import {DeviceHms, DeviceOsd, DeviceStatus, DockOsd, GatewayOsd, OSDVisible} from "@/types/device.ts";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import {immer} from "zustand/middleware/immer";
import {DevicesCmdExecuteInfo} from "@/types/device-cmd.ts";

interface User {
  username: string;
  password: string;
}

interface SceneState {
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
  }[] | null;
  isFullScreen: boolean;
  user: User;
  dronePanelVisible: boolean;
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
  };
  clientId: string;
  osdVisible: Partial<OSDVisible>;
  mqttState: any;
  deviceStatusEvent: {
    deviceOnline: DeviceStatus
    deviceOffline: any
  };
  hmsInfo: {
    [sn: string]: DeviceHms[]
  };
  mapState: {
    aMap: any // Map类
    map: any // 地图对象
    mouseTool: any
  };
  coverMap: {
    [key: string]: any[]
  };
  markerInfo: {
    coverMap: {
      [sn: string]: any
    },
    pathMap: {
      [sn: string]: any[]
    }
  };
  devicesCmdExecuteInfo: DevicesCmdExecuteInfo;
}

interface SceneActions {
  setKeyAreas: (keyAreas: SceneState["keyAreas"]) => void;
  setIsFullScreen: (status: boolean) => void;
  setUser: (user: User) => void;
  setDronePanelVisible: (visible: boolean) => void;
  setGateWayInfo: (info: any) => void;
  setDeviceInfo: (info: any) => void;
  setDockInfo: (info: any) => void;
  setClientId: (clientId: string) => void;
  setOsdVisible: (osdVisible: Partial<OSDVisible>) => void;
  setMqttState: (mqttState: any) => void;
  setDeviceOnline: (info: DeviceStatus) => void;
  setDeviceOffline: (info: any) => void;
  setHmsInfo: (info: any) => void;
  setMapState: (mapState: SceneState["mapState"]) => void;
  setCoverMap: (key: string, value: any[]) => void;
  setMarkerInfoCoverMap: (key: string, value: any) => void;
  deleteMarkerInfoCoverMap: (key: string) => void;
  deleteMarkerInfoPathMap: (key: string) => void;
  setDevicesCmdExecuteInfo: (info: any) => void;
}

export const useSceneStore = create<SceneState & SceneActions>()(
  immer((set) => ({
    // 初始状态
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
    deviceStatusEvent: {
      deviceOnline: {} as DeviceStatus,
      deviceOffline: {}
    },
    hmsInfo: {},
    mapState: {
      aMap: null,
      map: null,
      mouseTool: null
    },
    coverMap: {},
    markerInfo: {
      pathMap: {},
      coverMap: {}
    },
    devicesCmdExecuteInfo: {},
    // Actions
    setKeyAreas: (keyAreas) => set((state) => {
      state.keyAreas = keyAreas;
    }),

    setIsFullScreen: (isFullScreen) => set((state) => {
      state.isFullScreen = isFullScreen;
    }),

    setUser: (user) => set((state) => {
      state.user = user;
    }),

    setDronePanelVisible: (visible) => set((state) => {
      state.dronePanelVisible = visible;
    }),

    setGateWayInfo: (info) => set((state) => {
      state.deviceState.gatewayInfo[info.sn] = info.host;
      state.deviceState.currentSn = info.sn;
      state.deviceState.currentType = EDeviceTypeName.Gateway;
    }),

    setDeviceInfo: (info) => set((state) => {
      state.deviceState.deviceInfo[info.sn] = info.host;
      state.deviceState.currentSn = info.sn;
      state.deviceState.currentType = EDeviceTypeName.Aircraft;
    }),

    setDockInfo: (info) => set((state) => {
      if (Object.keys(info.host).length === 0) return;

      if (!state.deviceState.dockInfo[info.sn]) {
        state.deviceState.dockInfo[info.sn] = {} as DockOsd;
      }

      const dock = state.deviceState.dockInfo[info.sn];
      if (info.host.mode_code !== undefined) {
        dock.basic_osd = info.host;
      } else if (info.host.wireless_link) {
        dock.link_osd = info.host;
      } else if (info.host.job_number !== undefined) {
        dock.work_osd = info.host;
      }

      state.deviceState.currentSn = info.sn;
      state.deviceState.currentType = EDeviceTypeName.Dock;
    }),

    setClientId: (clientId) => set((state) => {
      state.clientId = clientId;
    }),

    setOsdVisible: (osdVisible) => set((state) => {
      state.osdVisible = osdVisible;
    }),

    setMqttState: (mqttState) => set((state) => {
      state.mqttState = mqttState;
    }),

    setDeviceOnline: (info) => set((state) => {
      state.deviceStatusEvent.deviceOnline = info;
    }),

    setDeviceOffline: (info) => set((state) => {
      delete state.deviceState.gatewayInfo[info.sn];
      delete state.deviceState.deviceInfo[info.sn];
      delete state.deviceState.dockInfo[info.sn];
      delete state.hmsInfo[info.sn];
      state.deviceStatusEvent.deviceOffline = info;
    }),
    setHmsInfo: (info) => set((state) => {
      const hmsList: Array<DeviceHms> = state.hmsInfo[info.sn];
      console.log("hmsList");
      console.log(hmsList);
      state.hmsInfo[info.sn] = info.host.concat(hmsList ?? []);
    }),
    setMapState: (mapState) => set((state) => {
      state.mapState = mapState;
    }),
    setCoverMap: (key: string, value: any[]) => set((state) => ({
      coverMap: {
        ...state.coverMap,
        [key]: value
      }
    })),
    setMarkerInfoCoverMap: (key: string, value: any) => set((state) => {
      state.markerInfo.coverMap[key] = value;
    }),
    deleteMarkerInfoCoverMap: (key: string) => set((state) => {
      delete state.markerInfo.coverMap[key];
    }),
    deleteMarkerInfoPathMap: (key: string) => set((state) => {
      delete state.markerInfo.pathMap[key];
    }),
    setDevicesCmdExecuteInfo: (info) => set(state => {
      if (!info.sn) {
        return;
      }
      if (state.devicesCmdExecuteInfo[info.sn]) {
        const index = state.devicesCmdExecuteInfo[info.sn].findIndex(cmdExecuteInfo => cmdExecuteInfo.biz_code === info.biz_code);
        if (index >= 0) {
          // 丢弃前面的消息
          if (state.devicesCmdExecuteInfo[info.sn][index].timestamp > info.timestamp) {
            return;
          }
          state.devicesCmdExecuteInfo[info.sn][index] = info;
        } else {
          state.devicesCmdExecuteInfo[info.sn].push(info);
        }
      } else {
        state.devicesCmdExecuteInfo[info.sn] = [info];
      }
    })
  }))
);
