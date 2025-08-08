import {useEffect} from "react";
import {useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import {WorkOrder} from "@/hooks/drone";
import {useAddScene} from "@/hooks/drone/useAddScene.ts";

interface Props {
  currentOrder?: WorkOrder;
}

const Scene = ({currentOrder}: Props) => {
  // const deviceState = useSceneStore(state => state.deviceState);
  // useConnectMqtt();

  useAddScene();

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
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 500),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0
      }
    });
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 150),
      label: {
        text: currentOrder.address,
        font: "13pt sans-serif",
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  // Anchor to bottom of label
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 水平对齐：左对齐
        pixelOffset: new Cesium.Cartesian2(0, -20),    // 偏移量（向下偏移 20 像素）
        fillColor: Cesium.Color.WHITE,                // 文字颜色
        backgroundColor: new Cesium.Color(0.2, 0.2, 0.2, 0.7), // 背景颜色（灰色，70% 透明度）
        padding: new Cesium.Cartesian2(10, 10),       // 内边距
        showBackground: true                          // 显示背景
      },
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          longitude, latitude, 0,  // 地面点
          longitude, latitude, 150  // 标记点
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
    <div id="cesiumContainer" className={"h-[150px] rounded-lg"}></div>
  );
};

export default Scene;

