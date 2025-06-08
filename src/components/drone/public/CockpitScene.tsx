import {useEffect, useMemo, useRef, useState} from "react";
import {findMapLayer, resetView} from "@/lib/view.ts";
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

const mapLayerList = [
  {
    url: "http://36.139.117.52:8090/iserver/services/map-tianditu/rest/maps/Vector%20Base%20Map%20_%20Longitude%20and%20Latitude",
    name: "矢量图"
  },
  {
    url: "http://36.139.117.52:8090/iserver/services/map-tianditu/rest/maps/Image%20Base%20Map%20_%20Longitude%20and%20Latitude",
    name: "影像"
  },
  {
    url: "http://36.139.117.52:8090/iserver/services/map-tianditu/rest/maps/Vector%20Chinese%20Notes%20_%20Longitude%20and%20Latitude",
    name: "中文注记"
  },
];

const CockpitScene = () => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

  const addMapLayer = () => {
    mapLayerList.forEach(item => {
      const layer = new Cesium.SuperMapImageryProvider(item);
      viewer.imageryLayers.addImageryProvider(layer);
    });
  };
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

  const [viewerInitialized, setViewerInitialized] = useState(false);

  // const dock = realTimeDeviceInfo
  useEffect(() => {
    window.viewer = new Cesium.Viewer("cesiumContainer", {
      shadows: true,
      infoBox: false,
      navigation: false, //指南针
      selectionIndicator: false, //绿色选择框
    });

    const {scene} = viewer;

    scene.postProcessStages.fxaa.enabled = false;
    // viewer._cesiumWidget._creditContainer.style.display = "none";
    scene.globe.depthTestAgainstTerrain = false; // 图标不埋地下

    scene.shadowMap.darkness = 0.3; //设置第二重烘焙纹理的效果（明暗程度）

    scene.debugShowFramesPerSecond = false;
    scene.hdrEnabled = false;
    scene.sun.show = true;

    addMapLayer();
    // resetView();

    const yx = findMapLayer("影像");
    yx && (yx.show = false);

    setViewerInitialized(true);

    return () => {
      setViewerInitialized(false);
    };
  }, []);

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

  const {data: currentJobList} = useWaylinJobs(workspaceId, {
    page: 1,
    page_size: 10,
    status: 2,
    dock_sn: dockSn
  });

  useAddWaylineEntityById(currentJobList?.list?.[0]?.file_id, viewerInitialized);

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
    <div id="cesiumContainer" className={"h-full"}></div>
  );
};

export default CockpitScene;

