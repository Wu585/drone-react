// 控制权
import {useEffect, useMemo, useState} from "react";
import {DeviceOsd, DockOsd, GatewayOsd} from "@/types/device.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";

export enum ControlSource {
  A = "A",
  B = "B"
}

export interface PayloadInfo {
  index: number,
  model: string,
  control_source?: ControlSource,
  payload_sn?: string,
  payload_index?: string,
  payload_name?: string,
}

// 设备信息
export interface OnlineDevice {
  model: string,
  callsign: string,
  sn: string,
  mode: number,
  gateway: {
    model: string,
    callsign: string,
    sn: string,
    domain: string,
  },
  payload: PayloadInfo[]
}

export enum EModeCode {
  Standby,
  Preparing,
  Ready,
  Manual,
  Automatic,
  Waypoint,
  Panoramic,
  Active_Track,
  ADS_B,
  Return_To_Home,
  Landing,
  Forced_Landing,
  Three_Blades_Landing,
  Upgrading,
  Disconnected,
}

export enum EDeviceTypeName {
  Aircraft = 0,
  Gateway = 2,
  Dock = 3,
}

export const useRealTimeDeviceInfo = (dockSn?: string, droneSn?: string) => {
  const str: string = "--";
  const deviceState = useSceneStore(state => state.deviceState);

  const [deviceInfo, setDeviceInfo] = useState({
    gateway: {
      capacity_percent: str,
      transmission_signal_quality: str,
    } as GatewayOsd,
    dock: {} as DockOsd,
    device: {
      gear: -1,
      mode_code: EModeCode.Disconnected,
      height: str,
      home_distance: str,
      horizontal_speed: str,
      vertical_speed: str,
      wind_speed: str,
      wind_direction: str,
      elevation: str,
      position_state: {
        gps_number: str,
        is_fixed: 0,
        rtk_number: str
      },
      battery: {
        capacity_percent: str,
        landing_power: str,
        remain_flight_time: 0,
        return_home_power: str,
      },
      latitude: 0,
      longitude: 0,
    } as DeviceOsd
  });

  useEffect(() => {
    const {currentType, currentSn, gatewayInfo, deviceInfo: deviceStateInfo, dockInfo} = deviceState;

    if (currentType === EDeviceTypeName.Gateway && gatewayInfo[currentSn]) {
      if (dockSn) {
        setDeviceInfo(prev => ({
          ...prev,
          gateway: gatewayInfo[dockSn]
        }));
      }
    }

    if (currentType === EDeviceTypeName.Aircraft && deviceStateInfo[currentSn]) {
      if (droneSn) {
        setDeviceInfo(prev => ({
          ...prev,
          device: deviceStateInfo[droneSn]
        }));
      }
    }

    if (currentType === EDeviceTypeName.Dock && dockInfo[currentSn]) {
      if (dockSn) {
        const currentDock = dockInfo[dockSn];
        setDeviceInfo(prev => ({
          ...prev,
          dock: currentDock,
          device: deviceStateInfo[(currentDock?.basic_osd?.sub_device?.device_sn ?? dockSn)!]
        }));
      }
    }
  }, [dockSn, droneSn, deviceState]); // 依赖项包含 deviceState 和 osdVisible

  return deviceInfo;
};
