import {useEffect} from "react";
import {useS3mLayerList} from "@/hooks/public/layers.ts";
import {allRange} from "@/assets/datas/range.ts";
import {findMapLayer, resetView} from "@/lib/view.ts";
import {useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";

export const mapLayerList = [
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
  const {isFullScreen} = useSceneStore();
  const {data: s3mLayerList1} = useS3mLayerList("iserver/services/3D-local3DCache-Config3/rest/realspace/datas.json");
  const {data: s3mLayerList2} = useS3mLayerList("iserver/services/3D-local3DCache-Config4/rest/realspace/datas.json");

  const addMapLayer = () => {
    mapLayerList.forEach(item => {
      const layer = new Cesium.SuperMapImageryProvider(item);
      viewer.imageryLayers.addImageryProvider(layer);
    });
  };

  useEffect(() => {
    window.viewer = new Cesium.Viewer("cesiumContainer", {
      shadows: true,
      infoBox: false,
      navigation: true, //指南针
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

  useEntityCustomSource("polygonSource");

  useEffect(() => {
    if (s3mLayerList1 && s3mLayerList1 instanceof Array) {
      s3mLayerList1.forEach((layer) => {
        const {path} = layer;
        const promise = viewer.scene.addS3MTilesLayerByScp(path + "/config", {name: "倾斜1"});
        promise.then((layer: any) => {
          layer.visible = false;
        });
      });
    }
  }, [s3mLayerList1]);

  useEffect(() => {
    if (s3mLayerList2 && s3mLayerList2 instanceof Array) {
      s3mLayerList2.forEach((layer) => {
        const {path} = layer;
        const promise = viewer.scene.addS3MTilesLayerByScp(path + "/config", {name: "倾斜2"}) as Promise<any>;
        promise.then((layer: any) => {
          layer.visible = false;
        });
      });
    }
  }, [s3mLayerList2]);

  // 添加围栏线
  useEffect(() => {
    const poiArray: number[] = [];
    allRange.forEach((poi: [number, number]) => {
      poiArray.push(...poi);
    });

    viewer.entities.add({
      name: "Polyline",
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(poiArray),
        width: 5,  // 设置折线的宽度
        material: Cesium.Color.CYAN,  // 折线的颜色
        clampToGround: true  // 如果需要折线贴地渲染，设置为true
      },
      // 添加一个发光材质
      material: new Cesium.PolylineGlowMaterialProperty({
        color: Cesium.Color.BLUE.withAlpha(0.5),
        glowPower: 0.5, // 发光强度，值越大越亮
        glowSize: 10 // 发光大小，值越大发光范围越大
      }),
      // 添加边框毛玻璃效果
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      outlineMaterial: new Cesium.PolylineOutlineMaterialProperty({
        color: Cesium.Color.WHITE.withAlpha(0.5), // 设置边框颜色，并添加透明度
        // 设置边框模糊程度，值越大越模糊
        glowPower: 0.5,
        glowSize: 5
      })
    });
  }, []);

  useEffect(() => {
    const compass = document.querySelector(".supermap3d-viewer-navigationContainer");
    if (compass && !isFullScreen) {
      compass.classList.remove("compass-not-fullscreen");
      compass.classList.add("compass-fullscreen");
    } else if (compass && isFullScreen) {
      compass.classList.remove("compass-fullscreen");
      compass.classList.add("compass-not-fullscreen");
    }
  }, [isFullScreen]);

  return (
    <div id="cesiumContainer" className={"h-full"}></div>
  );
};

export default Scene;

