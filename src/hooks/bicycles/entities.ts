import {useEffect} from "react";
import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import bikePng from "@/assets/images/bike.png";
import {useBicycleAllInfo, useBicycleDistributedInfo} from "@/hooks/bicycles/api.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {addRegionMountsEntity} from "@/lib/entity.ts";
import {EntitySize} from "@/assets/datas/enum.ts";

export const useBicycleEntities = () => {
  useEntityCustomSource("bicyclesSource");

  const {data: bicycleAllInfo} = useBicycleAllInfo();

  useEffect(() => {
    if (bicycleAllInfo) {
      getCustomSource("bicyclesSource")?.entities.removeAll();

      bicycleAllInfo.forEach(bike => {
        const {longitude, latitude} = bike;

        // 实体的当前位置
        const currentPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 64);
        // 牵引线的终点位置（示例中使用固定值，根据需要调整）
        const endPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);

        getCustomSource("bicyclesSource")?.entities.add({
          id: bike.bikeId,
          position: currentPosition,
          // 添加牵引线
          polyline: {
            positions: [currentPosition, endPosition],
            width: 2,
            material: new Cesium.PolylineDashMaterialProperty({
              color: new Cesium.Color.fromCssColorString("rgba(61, 170, 255)"),  // 虚线颜色
              dashLength: 16, // 虚线的长度，可以根据需要调整
              gapColor: Cesium.Color.TRANSPARENT // 虚线间隔的颜色，这里设置为透明
            }),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000)
          },
          billboard: {
            image: bikePng,
            width: EntitySize.Width,
            height: EntitySize.Height,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000)
          },
          description: JSON.stringify(bike),
          // customInfo: bike
        });
      });
    }

    return () => getCustomSource("bicyclesSource")?.entities.removeAll();
  }, [bicycleAllInfo]);
};

// 添加重点区域单车总数量图标
export const useKeyAreaCounts = () => {
  useEntityCustomSource("regionSource");
  const {data: distributedInfo} = useBicycleDistributedInfo();
  const {keyAreas} = useSceneStore();

  useEffect(() => {
    if (keyAreas && distributedInfo) {
      getCustomSource("regionSource")?.entities.removeAll();

      keyAreas.forEach(item => {
        const center = item.features[0].geometry.center;
        const regionName = item.datasetInfos[0].datasetName.split(":")[1];

        regionName.length > 10 ?
          addRegionMountsEntity(center.x, center.y, `${regionName === "工业开发区" ? "工业综合开发区" : regionName}:\n ${distributedInfo[regionName === "工业开发区" ? "工业综合开发区" : regionName] || 0}`, [220, -65])
          : addRegionMountsEntity(center.x, center.y, `${regionName === "工业开发区" ? "工业综合开发区" : regionName}:\n ${distributedInfo[regionName === "工业开发区" ? "工业综合开发区" : regionName] || 0}`);
      });
    }

    return () => {
      getCustomSource("regionSource")?.entities.removeAll();
    };
  }, [keyAreas, distributedInfo]);
};
