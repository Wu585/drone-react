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
  } = useSceneStore();

  useConnectWebSocket(async (payload: any) => {
    console.log('payload');
    console.log(payload);
    if (!payload) {
      return;
    }
    switch (payload.biz_code) {
      case EBizCode.GatewayOsd: {
        setGateWayInfo(payload.data);
        break;
      }
      case EBizCode.DeviceOsd: {
        console.log('payload');
        console.log(payload);
        setDeviceInfo(payload.data);
        break;
      }
      case EBizCode.DockOsd: {
        console.log('payload');
        console.log(payload);
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
        console.log("flightAreasUpdateWs===", payload.data);
        EventBus.emit("flightAreasUpdateWs", payload.data);
        break;
      }
    }
  });
};
