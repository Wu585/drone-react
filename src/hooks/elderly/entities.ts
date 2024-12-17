import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import {useEffect} from "react";
import elderlyPng from "@/assets/images/elderly-point.png";
import {EntitySize} from "@/assets/datas/enum.ts";

export const useElderlyEntities = () => {
  useEntityCustomSource('elderlySource')

  useEffect(() => {
    getCustomSource('elderlySource')?.entities.removeAll()

    const parkingPoints = [{
      longitude: 121.451125,
      latitude: 30.938708
    }]

    parkingPoints.forEach(poi => {
      const {longitude, latitude} = poi

      // 实体的当前位置
      const currentPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 64);
      // 牵引线的终点位置（示例中使用固定值，根据需要调整）
      const endPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);

      getCustomSource('elderlySource')?.entities.add({
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 64),
        billboard: {
          image: elderlyPng,
          width: EntitySize.Width,
          height: EntitySize.Height,
        },
        description: JSON.stringify(poi),
        // 添加牵引线
        polyline: {
          positions: [currentPosition, endPosition],
          width: 2,
          material: new Cesium.PolylineDashMaterialProperty({
            color: new Cesium.Color.fromCssColorString('rgba(61, 170, 255)'),  // 虚线颜色
            dashLength: 16, // 虚线的长度，可以根据需要调整
            gapColor: Cesium.Color.TRANSPARENT // 虚线间隔的颜色，这里设置为透明
          })
        }
      })
    })

    return () => getCustomSource('elderlySource')?.entities.removeAll()
  }, [])
}
