import {useEffect, useMemo, useRef} from "react";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import dockPng from "@/assets/images/drone/dock.png";
import {EntitySize} from "@/assets/datas/enum.ts";
import {useConnectMqtt} from "@/hooks/drone/useConnectMqtt.ts";
import {
  dynamicAddSceneDroneModel,
  removeDroneModel
} from "@/hooks/drone/wayline";
import {useSearchParams} from "react-router-dom";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useWaylinJobs} from "@/hooks/drone";
import {useAddWaylineEntityById} from "@/hooks/drone/useAddWaylineEntityById.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {useAddAllElements} from "@/hooks/drone/elements";
import {useAddScene} from "@/hooks/drone/useAddScene.ts";

const CockpitScene = () => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const viewerInitialized = useSceneStore(state => state.viewerInitialized);
  // const setViewerInitialized = useSceneStore(state => state.setViewerInitialized);

  // useInitialConnectWebSocket();
  useConnectMqtt(true);
  const [searchParams] = useSearchParams();
  const dockSn = searchParams.get("gateway_sn") || "";
  const deviceSn = searchParams.get("sn") || "";
  const realTimeDeviceInfo = useRealTimeDeviceInfo(dockSn, deviceSn);

  const dronePositionRef = useRef<{
    longitude: number,
    latitude: number,
    height: number,
    heading?: number
  }>({
    longitude: 0,
    latitude: 0,
    height: 0,
    heading: 0
  });

  useAddScene();

  // useSetViewToCurrentDepart();

  // 机场坐标字符串
  const dockPoiStr = useMemo(() => {
    if (realTimeDeviceInfo && realTimeDeviceInfo.dock && realTimeDeviceInfo.dock.basic_osd) {
      const {longitude, latitude, height} = realTimeDeviceInfo.dock.basic_osd;
      return JSON.stringify({
        longitude, latitude, height
      });
    }
  }, [realTimeDeviceInfo]);

  // 定位机场视角
  useEffect(() => {
    if (dockPoiStr) {
      const {longitude, latitude, height} = JSON.parse(dockPoiStr);
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 200),
        orientation: {
          heading: 0,
          pitch: Cesium.Math.toRadians(-90),
          roll: 0.0
        }
      });
      if (getCustomSource("dock")?.entities.getById(`dock-${dockSn}`)) return;
      getCustomSource("dock")?.entities.add({
        id: `dock-${dockSn}`,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        billboard: {
          image: dockPng,
          width: EntitySize.Width,
          height: EntitySize.Height,
        },
      });
    }
  }, [dockPoiStr, dockSn]);

  useEntityCustomSource("dock");
  useEntityCustomSource("drone");
  useEntityCustomSource("elements");
  useEntityCustomSource("drone-wayline");
  useEntityCustomSource("waylines-create");
  useEntityCustomSource("waylines-preview");

  useEffect(() => {
    if (realTimeDeviceInfo && realTimeDeviceInfo.device) {
      dronePositionRef.current.longitude = +realTimeDeviceInfo.device.longitude;
      dronePositionRef.current.latitude = +realTimeDeviceInfo.device.latitude;
      dronePositionRef.current.height = +realTimeDeviceInfo.device.height;
      dronePositionRef.current.heading = +realTimeDeviceInfo.device.attitude_head;
    }
  }, [realTimeDeviceInfo]);

  useEffect(() => {
    if (realTimeDeviceInfo.device && realTimeDeviceInfo.device.longitude && realTimeDeviceInfo.device.latitude && realTimeDeviceInfo.device.height) {
      if (dronePositionRef.current) {
        dynamicAddSceneDroneModel(dronePositionRef.current);
      }
    } else {
      removeDroneModel();
      // getCustomSource("waylines-preview")?.entities.removeAll();
    }
  }, [realTimeDeviceInfo]);

  useAddAllElements();

  const {data: currentJobList} = useWaylinJobs(workspaceId, {
    page: 1,
    page_size: 10,
    status: 2,
    dock_sn: dockSn
  });

  useAddWaylineEntityById(currentJobList?.list?.[0]?.file_id, viewerInitialized);

  /*useEffect(() => {
    return () => {
      setViewerInitialized(false);
      console.log("set false");
      viewer.destroy();
    };
  }, [setViewerInitialized]);*/

  /*useEffect(() => {
    dynamicAddSceneDroneModel(dronePositionRef.current);
  }, []);*/

  /*  useEffect(() => {
      if (!viewer) return;
      Object.keys(deviceState.dockInfo).forEach(dockSn => {
        const dockInfo = deviceState.dockInfo[dockSn];
        if (dockInfo.basic_osd && dockInfo.basic_osd.longitude && dockInfo.basic_osd.latitude) {
          if (getCustomSource("dock")?.entities.getById(`dock-${dockSn}`)) return;
          getCustomSource("dock")?.entities.add({
            id: `dock-${dockSn}`,
            position: Cesium.Cartesian3.fromDegrees(dockInfo.basic_osd.longitude, dockInfo.basic_osd.latitude),
            billboard: {
              image: dockPng,
              width: EntitySize.Width,
              height: EntitySize.Height,
            },
          });
        }
      });
    }, [deviceState]);*/

  return (
    <div id="cesiumContainer" className={"h-full w-full relative"}></div>
  );
};

export default CockpitScene;

