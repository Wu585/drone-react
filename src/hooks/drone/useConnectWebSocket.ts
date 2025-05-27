import {EBizCode} from "@/types/enum.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {useConnectWebSocket} from "@/lib/websocket/useConnectWebSocket.ts";
import EventBus from "@/lib/event-bus.ts";
import {useEffect} from "react";

export const useInitialConnectWebSocket = () => {
  const {
    setDockInfo,
    setGateWayInfo,
    setDeviceInfo,
    setDeviceOffline,
    setDeviceOnline,
    setHmsInfo,
    setDevicesCmdExecuteInfo,
    clearDeviceState
  } = useSceneStore();

  // 在重新连接时，清理并重新获取设备状态
  /*useEffect(() => {
    return () => {
      // 组件卸载时清理设备状态
      clearDeviceState();
    };
  }, []);*/

  useConnectWebSocket(async (payload: any) => {
    if (!payload) {
      return;
    }
    switch (payload.biz_code) {
      case EBizCode.GatewayOsd: {
        // console.log('payload.data===gateway osd');
        // console.log(payload.data);
        setGateWayInfo(payload.data);
        break;
      }
      case EBizCode.DeviceOsd: {
        setDeviceInfo(payload.data);
        break;
      }
      case EBizCode.DockOsd: {
        setDockInfo(payload.data);
        break;
      }
      case EBizCode.DeviceOnline: {
        setDeviceOnline(payload.data);
        break;
      }
      case EBizCode.DeviceOffline: {
        setDeviceOffline(payload.data);
        break;
      }
      case EBizCode.DeviceHms: {
        setHmsInfo(payload.data);
        break;
      }
      case EBizCode.FlightAreasUpdate: {
        EventBus.emit("flightAreasUpdateWs", payload.data);
        break;
      }
      case EBizCode.DeviceReboot:
      case EBizCode.DroneOpen:
      case EBizCode.DroneClose:
      case EBizCode.CoverOpen:
      case EBizCode.CoverClose:
      case EBizCode.PutterOpen:
      case EBizCode.PutterClose:
      case EBizCode.ChargeOpen:
      case EBizCode.ChargeClose:
      case EBizCode.DeviceFormat:
      case EBizCode.DroneFormat: {
        setDevicesCmdExecuteInfo({
          biz_code: payload.biz_code,
          timestamp: payload.timestamp,
          ...payload.data,
        });
        break;
      }
    }
  });
};
