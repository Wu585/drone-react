import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import {useEffect} from "react";
import ggpPng from "@/assets/images/ggp.png";
import {useAirDeviceList} from "@/hooks/flood-prevention/api.ts";
import {EntitySize} from "@/assets/datas/enum.ts";

const devicePoiMap: Record<string, number[]> = {
  61343001: [121.46030433586343, 30.938309430761365],
  61343002: [121.45946563967084, 30.938116858881898],
  61341001: [121.45923531572805, 30.942971997015196],
  61341002: [121.45558597147341, 30.94208330542498],
};

export const useFloodPreventionEntities = () => {
  useEntityCustomSource("floodPreventionSource");

  const {data: airDeviceList} = useAirDeviceList("053607");

  useEffect(() => {
    getCustomSource("floodPreventionSource")?.entities.removeAll();

    if (airDeviceList) {
      const airInfo = airDeviceList.map(device => {
        return {
          ...device,
          type: "kqjc"
        };
      }).filter(device => device.device_name.includes("空气质量检测"));

      airInfo.forEach(poi => {
        const longitude = devicePoiMap[poi.device_id][0];
        const latitude = devicePoiMap[poi.device_id][1];

        // 实体的当前位置
        const currentPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 100);
        // 牵引线的终点位置（示例中使用固定值，根据需要调整）
        const endPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);

        getCustomSource("floodPreventionSource")?.entities.add({
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 100),
          billboard: {
            image: ggpPng,
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

      const waterInfo = airDeviceList.map(device => {
        return {
          ...device,
          type: "szjc"
        };
      }).filter(device => device.device_name.includes("浮标站"));

      waterInfo.forEach(poi => {
        const longitude = devicePoiMap[poi.device_id][0];
        const latitude = devicePoiMap[poi.device_id][1];

        // 实体的当前位置
        const currentPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 100);
        // 牵引线的终点位置（示例中使用固定值，根据需要调整）
        const endPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);

        getCustomSource("floodPreventionSource")?.entities.add({
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 100),
          billboard: {
            image: ggpPng,
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

    return () => getCustomSource("floodPreventionSource")?.entities.removeAll();
  }, [airDeviceList]);
};

export const useBillboardEntities = () => {
  useEntityCustomSource("ggpSource");

  useEffect(() => {
    getCustomSource("ggpSource")?.entities.removeAll();

    const businessInfo = [
      {
        longitude: 121.45165900823591,
        latitude: 30.94097874075786,
        name: "馋谷君满汉全席·蒸羊羔",
        address: "上海市奉贤区韩村路666号",
        businessTime: "周一至周日 10:00-21:00",
        road: "韩村路",
        person: "季**",
        time: "2024年4月",
        metal: "金属",
        note: "广告牌未见生锈，未悬挂中午，无损耗情况"
      }
    ];

    businessInfo.forEach(poi => {
      const {longitude, latitude} = poi;

      // 实体的当前位置
      const currentPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 64);
      // 牵引线的终点位置（示例中使用固定值，根据需要调整）
      const endPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);

      getCustomSource("ggpSource")?.entities.add({
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 64),
        billboard: {
          image: ggpPng,
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

    return () => getCustomSource("ggpSource")?.entities.removeAll();
  }, []);
};
