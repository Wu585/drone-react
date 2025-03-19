import {useEffect} from "react";
import {findMapLayer, resetView} from "@/lib/view.ts";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import {getImageUrl} from "@/lib/utils.ts";
import {selfFacilityList} from "@/components/facilities/FacilityProperty.tsx";
import bmssPoint from "@/assets/images/bmss-point.png";
import dockPng from "@/assets/images/drone/dock.png";
import {EntitySize} from "@/assets/datas/enum.ts";
import {useConnectMqtt} from "@/hooks/drone/useConnectMqtt.ts";

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


const Scene = () => {
  const deviceState = useSceneStore(state => state.deviceState);
  const addMapLayer = () => {
    mapLayerList.forEach(item => {
      const layer = new Cesium.SuperMapImageryProvider(item);
      viewer.imageryLayers.addImageryProvider(layer);
    });
  };
  useInitialConnectWebSocket();
  useConnectMqtt();

  useEffect(() => {
    window.viewer = new Cesium.Viewer("cesiumContainer", {
      shadows: false,
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
  useEntityCustomSource("waylines-preview");
  useEntityCustomSource("waylines-create");

  useEffect(() => {
    if (!viewer) return;
    getCustomSource("dock")?.entities.removeAll();
    // console.log("Object.keys(deviceState.deviceInfo)");
    // console.log(Object.keys(deviceState.deviceInfo));
    Object.keys(deviceState.dockInfo).forEach(dockSn => {
      const dockInfo = deviceState.dockInfo[dockSn];
      // console.log("dockInfo");
      // console.log(dockInfo);
      if (dockInfo.basic_osd && dockInfo.basic_osd.longitude && dockInfo.basic_osd.latitude) {
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

  return (
    <div id="cesiumContainer" className={"h-full"}></div>
  );
};

export default Scene;

