import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import {useEffect} from "react";
import parkingPng from "@/assets/images/parking-point.png";
import {EntitySize} from "@/assets/datas/enum.ts";

export const useParkingEntities = () => {
  useEntityCustomSource("parkingSource");

  useEffect(() => {
    getCustomSource("parkingSource")?.entities.removeAll();

    const parkingPoints = [
      {
        id: 1,
        longitude: 121.46406880511353,
        latitude: 30.940332612091932,
        name: "八字桥路停车地图",
        url: "https://www.fengpu.danlu.net/app-yixiaossb/parkscreen.html?uuid=47fb67f8-4749-4590-80fd-4762c5455167"
      },
      {
        id: 2,
        longitude: 121.43917040175765,
        latitude: 30.96374282597034,
        name: "肖塘菜场停车地图",
        url: "https://www.fengpu.danlu.net/app-yixiaossb/parkscreen.html?uuid=7590a753-b6d3-4170-8456-a3907a98984d"
      }
    ];

    parkingPoints.forEach(poi => {
      const {longitude, latitude} = poi;

      // 实体的当前位置
      const currentPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 64);
      // 牵引线的终点位置（示例中使用固定值，根据需要调整）
      const endPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);

      getCustomSource("parkingSource")?.entities.add({
        id: poi.id,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 64),
        billboard: {
          image: parkingPng,
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

    return () => getCustomSource("parkingSource")?.entities.removeAll();
  }, []);
};
