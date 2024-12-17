import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import {useEffect} from "react";
import gyPng from "@/assets/images/zdy-gy.png";
import {EntitySize} from "@/assets/datas/enum.ts";

export const useTravelCloudEntities = () => {
  useEntityCustomSource("travelCloudSource");

  useEffect(() => {
    getCustomSource("travelCloudSource")?.entities.removeAll();

    const travelCloudPoiInfo = [
      {
        id: 1,
        longitude: 121.46671687294814,
        latitude: 30.93854058767956,
        name: "露天小剧场",
        url: "https://www.720yun.com/vr/691j5dhaOk7"
      },
      {
        id: 2,
        longitude: 121.46448359487792,
        latitude: 30.93618262448306,
        name: "言子塑像",
        url: "https://www.720yun.com/vr/94fj5dhaOy3"
      },
      {
        id: 3,
        longitude: 121.46421023193463,
        latitude: 30.936393120072772,
        name: "诵贤墙",
        url: "https://www.720yun.com/vr/e94j5dhaOf9"
      },
      {
        id: 4,
        longitude: 121.46506690736402,
        latitude: 30.937896509332855,
        name: "四季生态园",
        url: "https://www.720yun.com/vr/022j5dhaOy8"
      },
      {
        id: 5,
        longitude: 121.46346213095124,
        latitude: 30.93860953151216,
        name: "风车园",
        url: "https://www.720yun.com/vr/b89j5dhaOv9"
      },
      {
        id: 6,
        longitude: 121.46607504943545,
        latitude: 30.938302017860238,
        name: "月季园",
        url: "https://www.720yun.com/vr/402j5dhaOf6"
      }
    ];

    travelCloudPoiInfo.forEach((poi) => {
      const {longitude, latitude} = poi;

      // 实体的当前位置
      const currentPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 64);
      // 牵引线的终点位置（示例中使用固定值，根据需要调整）
      const endPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);

      getCustomSource("travelCloudSource")?.entities.add({
        id: poi.id,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 64),
        billboard: {
          image: gyPng,
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

    return () => getCustomSource("travelCloudSource")?.entities.removeAll();
  }, []);
};
