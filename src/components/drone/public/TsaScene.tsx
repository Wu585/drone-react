import {useEffect} from "react";
import {findMapLayer, resetView} from "@/lib/view.ts";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import dockPng from "@/assets/images/drone/dock.png";
import dronePng from "@/assets/images/drone/drone.png";
import {EntitySize} from "@/assets/datas/enum.ts";
import {useConnectMqtt} from "@/hooks/drone/useConnectMqtt.ts";
import {addDroneModel, addHeightPolyline, moveDroneToTarget, removeDroneModel} from "@/hooks/drone/wayline";

const mapLayerList = [
  {
    url: "http://36.139.117.52:8090/iserver/services/map-tianditu/rest/maps/Vector%20Base%20Map%20_%20Longitude%20and%20Latitude",
    name: "矢量图"
  },
  {
    url: "http://36.139.117.52:8090/iserver/services/map-tianditu/rest/maps/Vector%20Chinese%20Notes%20_%20Longitude%20and%20Latitude",
    name: "中文注记"
  },
  {
    url: "http://36.139.117.52:8090/iserver/services/map-tianditu/rest/maps/Image%20Base%20Map%20_%20Longitude%20and%20Latitude",
    name: "影像"
  }
];


const TsaScene = () => {
  const deviceState = useSceneStore(state => state.deviceState);
  const addMapLayer = () => {
    mapLayerList.forEach(item => {
      const layer = new Cesium.SuperMapImageryProvider(item);
      viewer.imageryLayers.addImageryProvider(layer);
    });
  };
  useInitialConnectWebSocket();
  useConnectMqtt();
  const realTimeDeviceInfo = useRealTimeDeviceInfo();

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
    resetView();

    const yx = findMapLayer("影像");
    yx && (yx.show = false);

  }, []);

  useEntityCustomSource("dock");
  useEntityCustomSource("drone");
  useEntityCustomSource("drone-wayline");
  useEntityCustomSource("waylines-create");

  useEffect(() => {
    if (!viewer) return;
    Object.keys(deviceState.dockInfo).forEach(dockSn => {
      const dockInfo = deviceState.dockInfo[dockSn];
      // console.log("dockInfo");
      // console.log(dockInfo);
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
  }, [deviceState]);

  useEffect(() => {
    if (realTimeDeviceInfo.device && realTimeDeviceInfo.device.longitude && realTimeDeviceInfo.device.latitude && realTimeDeviceInfo.device.height) {
      // getCustomSource("drone")?.entities.removeAll();
      const longitude = +realTimeDeviceInfo.device.longitude;
      const latitude = +realTimeDeviceInfo.device.latitude;
      const height = +realTimeDeviceInfo.device.height;
      // addHeightPolyline(longitude, latitude, height);
      addDroneModel(longitude, latitude, height);
      moveDroneToTarget({
        longitude,
        latitude,
        height
      });
    } else {
      removeDroneModel();
    }
  }, [realTimeDeviceInfo]);

  return (
    <div id="cesiumContainer" className={"h-full"}></div>
  );
};

export default TsaScene;

