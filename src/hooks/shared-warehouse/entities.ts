import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import {useEffect} from "react";
import xpgxcPng from "@/assets/images/xpgxc-point.png";
import syglPng from "@/assets/images/sygl.png";
import {EntitySize} from "@/assets/datas/enum.ts";

export const useSharedWareHouseEntities = () => {
  useEntityCustomSource("xpgxcSource");

  useEffect(() => {
    getCustomSource("xpgxcSource")?.entities.removeAll();

    const businessInfo = [
      {
        longitude: 121.451125,
        latitude: 30.938708,
        id: "xpgxc-1",
        type: "point",
      },
      {
        longitude: 121.452125,
        latitude: 30.938708,
        id: "xpgxc-monitor-1",
        type: "monitor",
        src: "https://open.ys7.com/v3/openlive/FE4724701_1_1.m3u8?expire=1757060003&id=753649335266807808&t=3d92e7198735ffbfc00d78af5b072535a92f252328f7f7703738ec8172fc6627&ev=100"
      }
    ];

    businessInfo.forEach(poi => {
      const {longitude, latitude, id, type} = poi;

      // 实体的当前位置
      const currentPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 64);
      // 牵引线的终点位置（示例中使用固定值，根据需要调整）
      const endPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);

      getCustomSource("xpgxcSource")?.entities.add({
        id,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 64),
        billboard: {
          image: type === "monitor" ? syglPng : xpgxcPng,
          width: EntitySize.Width,
          height: EntitySize.Height,
        },
        description: JSON.stringify(poi),
        // 添加牵引线
        polyline: {
          positions: [currentPosition, endPosition],
          width: 2,
          material: new Cesium.PolylineDashMaterialProperty({
            color: new Cesium.Color.fromCssColorString("rgba(61, 170, 255)"),  // 虚线颜色
            dashLength: 16, // 虚线的长度，可以根据需要调整
            gapColor: Cesium.Color.TRANSPARENT // 虚线间隔的颜色，这里设置为透明
          })
        }
      });
    });

    return () => getCustomSource("xpgxcSource")?.entities.removeAll();
  }, []);
};
