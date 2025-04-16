import {useEffect} from "react";
import {findMapLayer} from "@/lib/view.ts";

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

const SceneMini = () => {
  const addMapLayer = () => {
    mapLayerList.forEach(item => {
      const layer = new Cesium.SuperMapImageryProvider(item);
      viewer2.imageryLayers.addImageryProvider(layer);
    });
  };

  useEffect(() => {
    window.viewer2 = new Cesium.Viewer("cesiumContainerMini", {
      shadows: false,
      infoBox: false,
      navigation: false, //指南针
      selectionIndicator: false, //绿色选择框
    });

    const {scene} = viewer2;
    scene.fxaa = false;
    scene.postProcessStages.fxaa.enabled = false;
    // viewer._cesiumWidget._creditContainer.style.display = "none";
    scene.globe.depthTestAgainstTerrain = false; // 图标不埋地下

    scene.shadowMap.darkness = 0.3; //设置第二重烘焙纹理的效果（明暗程度）

    scene.debugShowFramesPerSecond = false;
    scene.hdrEnabled = false;
    scene.sun.show = true;

    addMapLayer();
    // resetView();

    const yx = findMapLayer("影像", viewer2);
    yx && (yx.show = false);

  }, []);

  return (
    <div id="cesiumContainerMini" className={"h-full rounded-lg"}></div>
  );
};

export default SceneMini;

