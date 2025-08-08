import {useEffect} from "react";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import dockPng from "@/assets/images/drone/dock.png";
import {EntitySize} from "@/assets/datas/enum.ts";
import {useOrderToMap} from "@/hooks/drone/order/useOrderToMap.ts";
import {useSetViewToCurrentDepart} from "@/hooks/drone/depart/useAddDepartEntity.ts";
import {useAddScene} from "@/hooks/drone/useAddScene.ts";

const Scene = () => {
  const deviceState = useSceneStore(state => state.deviceState);
  // useConnectMqtt();

  useAddScene();

  useSetViewToCurrentDepart();

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
  // 自定义飞行区的集合
  useEntityCustomSource("flight-area");

  useEffect(() => {
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
  }, [deviceState]);

  // useAddAllElements();
  useOrderToMap();

  return (
    <div id="cesiumContainer" className={"h-full rounded-lg"}></div>
  );
};

export default Scene;

