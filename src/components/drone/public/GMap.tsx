import {useConnectMqtt} from "@/hooks/drone/useConnectMqtt.ts";
import {useGMapManage} from "@/hooks/drone/map/useGMapManage.ts";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";
import {useDeviceTsaUpdate} from "@/hooks/drone/map/useDeviceTsaUpdate.ts";
import {useEffect} from "react";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import {wgs84togcj02} from "@/vendor/coordtransform.ts";
import {DeviceStatus} from "@/types/device.ts";
import {GeojsonCoordinate} from "@/types/map.ts";

const getGcj02 = <T extends GeojsonCoordinate | GeojsonCoordinate[]>(coordinate: T): T => {
  if (coordinate[0] instanceof Array) {
    return (coordinate as GeojsonCoordinate[]).map(c => wgs84togcj02(c[0], c[1])) as T;
  }
  return wgs84togcj02(coordinate[0], coordinate[1]);
};

const GMap = () => {
  useInitialConnectWebSocket();
  useConnectMqtt();
  useGMapManage("g-container");
  const deviceStatusEvent = useSceneStore(state => state.deviceStatusEvent);
  const deviceState = useSceneStore(state => state.deviceState);
  const setDeviceOnline = useSceneStore(state => state.setDeviceOnline);
  const setDeviceOffline = useSceneStore(state => state.setDeviceOffline);

  const deviceTsaUpdateHook = useDeviceTsaUpdate();
  useEffect(() => {
    if (deviceState.currentType === EDeviceTypeName.Aircraft && deviceState.deviceInfo[deviceState.currentSn]) {
      const coordinate = wgs84togcj02(deviceState.deviceInfo[deviceState.currentSn].longitude, deviceState.deviceInfo[deviceState.currentSn].latitude);
      deviceTsaUpdateHook.moveTo(deviceState.currentSn, coordinate[0], coordinate[1]);
    }
    if (deviceState.currentType === EDeviceTypeName.Dock && deviceState.dockInfo[deviceState.currentSn]) {
      const coordinate = getGcj02([deviceState.dockInfo[deviceState.currentSn].basic_osd?.longitude, deviceState.dockInfo[deviceState.currentSn].basic_osd?.latitude]);
      // const coordinate = wgs84togcj02(deviceState.dockInfo[deviceState.currentSn].basic_osd?.longitude, deviceState.dockInfo[deviceState.currentSn].basic_osd?.latitude);
      deviceTsaUpdateHook.initMarker(EDeviceTypeName.Dock, EDeviceTypeName[EDeviceTypeName.Dock], deviceState.currentSn, coordinate[0], coordinate[1]);
    }
  }, [deviceState]);

  useEffect(() => {
    if (Object.keys(deviceStatusEvent.deviceOnline).length !== 0) {
      deviceTsaUpdateHook.initMarker(deviceStatusEvent.deviceOnline.domain, deviceStatusEvent.deviceOnline.device_callsign, deviceStatusEvent.deviceOnline.sn);
      setDeviceOnline({} as DeviceStatus);
    }
    if (Object.keys(deviceStatusEvent.deviceOffline).length !== 0) {
      deviceTsaUpdateHook.removeMarker(deviceStatusEvent.deviceOffline.sn);
      setDeviceOffline({});
    }
  }, [deviceStatusEvent]);

  return (
    <div id="g-container" className={"w-full h-full rounded-lg relative"}>
    </div>
  );
};

export default GMap;

