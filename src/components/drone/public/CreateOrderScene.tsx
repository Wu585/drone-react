import {useEffect} from "react";
import {findMapLayer, resetView} from "@/lib/view.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import dockPng from "@/assets/images/drone/dock.png";
import {EntitySize} from "@/assets/datas/enum.ts";
import {useOrderToMap} from "@/hooks/drone/order/useOrderToMap.ts";
import {WorkOrder} from "@/hooks/drone";
import {generateLabelConfig} from "@/hooks/drone/elements";

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

interface Props {
  currentOrder?: WorkOrder;
}

const Scene = ({currentOrder}: Props) => {
  const deviceState = useSceneStore(state => state.deviceState);
  const addMapLayer = () => {
    mapLayerList.forEach(item => {
      const layer = new Cesium.SuperMapImageryProvider(item);
      viewer.imageryLayers.addImageryProvider(layer);
    });
  };
  // useConnectMqtt();

  useEffect(() => {
    window.viewer = new Cesium.Viewer("cesiumContainer", {
      shadows: false,
      infoBox: false,
      navigation: false, //指南针
      selectionIndicator: false, //绿色选择框
    });

    const {scene} = viewer;
    scene.fxaa = false;
    scene.postProcessStages.fxaa.enabled = false;
    // viewer._cesiumWidget._creditContainer.style.display = "none";
    scene.globe.depthTestAgainstTerrain = true; // 图标不埋地下

    scene.shadowMap.darkness = 0.3; //设置第二重烘焙纹理的效果（明暗程度）

    scene.debugShowFramesPerSecond = false;
    scene.hdrEnabled = false;
    scene.sun.show = true;

    addMapLayer();
    resetView();

    const yx = findMapLayer("影像");
    yx && (yx.show = false);

  }, []);

  // 机场图标的集合
  useEntityCustomSource("dock");
  // 航线列表的集合
  useEntityCustomSource("waylines-preview");
  // 航线创建的集合
  useEntityCustomSource("waylines-create");
  // 航线相关点位、连接线、垂直线的集合
  useEntityCustomSource("waylines-update");
  // 标注相关的集合
  useEntityCustomSource("elements");
  // 地图加载的图片的结合
  useEntityCustomSource("map-photos");
  // 地图加载工单的entity集合
  useEntityCustomSource("map-orders");

  /*useEffect(() => {
    getCustomSource("dock")?.entities.removeAll();
    Object.keys(deviceState.dockInfo).forEach(dockSn => {
      const dockInfo = deviceState.dockInfo[dockSn];
      if (dockInfo.basic_osd && dockInfo.basic_osd.longitude && dockInfo.basic_osd.latitude) {
        getCustomSource("dock")?.entities.add({
          id: `dock-${dockSn}`,
          position: Cesium.Cartesian3.fromDegrees(dockInfo.basic_osd.longitude, dockInfo.basic_osd.latitude),
          billboard: {
            image: dockPng,
            width: EntitySize.Width,
            height: EntitySize.Height,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
        });
      }
    });
  }, [deviceState]);*/

  // useAddAllElements();
  // useOrderToMap();

  useEffect(() => {
    if (!currentOrder) return;
    const {longitude, latitude} = currentOrder;
    if (!longitude || !latitude) return;
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 100),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0
      }
    });
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 5),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          longitude, latitude, 0,  // 地面点
          longitude, latitude, 5  // 标记点
        ]),
        width: 1,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString("#2D8CF0").withAlpha(0.6),
          dashLength: 8
        })
      },
      billboard: {
        image: (() => {
          // 创建一个 canvas 来绘制菱形
          const canvas = document.createElement("canvas");
          canvas.width = 16;
          canvas.height = 16;
          const context = canvas.getContext("2d");
          if (context) {
            // 开始绘制菱形
            context.beginPath();
            // 移动到顶点
            context.moveTo(8, 0);
            // 绘制右边
            context.lineTo(16, 8);
            // 绘制底边
            context.lineTo(8, 16);
            // 绘制左边
            context.lineTo(0, 8);
            // 闭合路径
            context.closePath();

            // 填充颜色
            context.fillStyle = "#2D8CF0";
            context.fill();
          }
          return canvas;
        })(),
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        width: 16,
        height: 32
      }
    });
  }, [currentOrder]);

  return (
    <div id="cesiumContainer" className={"h-full rounded-lg"}></div>
  );
};

export default Scene;

