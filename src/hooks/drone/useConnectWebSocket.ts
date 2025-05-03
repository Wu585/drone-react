import {EBizCode} from "@/types/enum.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {useConnectWebSocket} from "@/lib/websocket/useConnectWebSocket.ts";
import EventBus from "@/lib/event-bus.ts";

export const useInitialConnectWebSocket = () => {
  const {
    setDockInfo,
    setGateWayInfo,
    setDeviceInfo,
    setDeviceOffline,
    setDeviceOnline,
    setHmsInfo,
    setDevicesCmdExecuteInfo
  } = useSceneStore();

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
        // console.log('payload.data===device osd');
        // console.log(payload.data);
        setDeviceInfo(payload.data);
        break;
      }
      case EBizCode.DockOsd: {
        // console.log('payload.data==dock osd');
        // console.log(payload.data);
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
