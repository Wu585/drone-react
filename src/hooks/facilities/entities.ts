import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import {useEffect} from "react";
import bmssPoint from "@/assets/images/bmss-point.png";
/*import babyHousePoint from "@/assets/images/baby-house-point.png";
import toiletPoint from "@/assets/images/toilet-point.png";
import printerPoint from "@/assets/images/printer-point.png";
import parkPoint from "@/assets/images/park-point.png";*/
import {useAllFacilities} from "@/hooks/facilities/api.ts";
import {EntitySize} from "@/assets/datas/enum.ts";
import {getImageUrl} from "@/lib/utils.ts";
import {selfFacilityList} from "@/components/facilities/FacilityProperty.tsx";

export const useFacilitiesEntities = () => {
  useEntityCustomSource("facilitiesSource");
  const {data: facilities} = useAllFacilities();

  useEffect(() => {
    getCustomSource("facilitiesSource")?.entities.removeAll();

    if (facilities) {
      facilities.forEach(poi => {
        const {longitude, latitude, id, reservationNums, facilitiesType, enable, serviceScope} = poi;

        // 实体的当前位置
        const currentPosition = Cesium.Cartesian3.fromDegrees(+longitude, +latitude, 100);
        // 牵引线的终点位置（示例中使用固定值，根据需要调整）
        const endPosition = Cesium.Cartesian3.fromDegrees(+longitude, +latitude, 0);

        if (enable !== "false" && serviceScope) {
          getCustomSource("facilitiesSource")?.entities.add({
            position: Cesium.Cartesian3.fromDegrees(+longitude, +latitude),
            ellipse: {
              semiMinorAxis: +serviceScope, // 半径
              semiMajorAxis: +serviceScope, // 半径
              material: Cesium.Color.BLUE.withAlpha(0.5), // 圆的颜色和透明度
            }
          });
        }

        getCustomSource("facilitiesSource")?.entities.add({
          id,
          position: Cesium.Cartesian3.fromDegrees(+longitude, +latitude, 100),
          billboard: {
            image: reservationNums ? getImageUrl(selfFacilityList.find(item => item?.type === facilitiesType)?.image || "") : bmssPoint,
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
    }
    return () => getCustomSource("facilitiesSource")?.entities.removeAll();
  }, [facilities]);
};
