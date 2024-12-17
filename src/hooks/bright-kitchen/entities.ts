import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import {useEffect} from "react";
import syglPng from "@/assets/images/sygl.png";
import {EntitySize} from "@/assets/datas/enum.ts";

export const useBKEntities = () => {
  useEntityCustomSource("businessSource");

  useEffect(() => {
    getCustomSource("businessSource")?.entities.removeAll();

    const businessInfo = [
      /*{
        id: "bus1",
        longitude: 121.451125,
        latitude: 30.938708
      },*/
      {
        id: "monitor1",
        longitude: 121.45510327885053,
        latitude: 30.930368909556066,
        src: "https://open.ys7.com/v3/openlive/FE4724701_1_1.m3u8?expire=1757060003&id=753649335266807808&t=3d92e7198735ffbfc00d78af5b072535a92f252328f7f7703738ec8172fc6627&ev=100"
      },
      {
        id: "monitor2",
        longitude: 121.43036720042703,
        latitude: 30.964668259208945,
        src: "https://open.ys7.com/v3/openlive/FE5809352_1_1.m3u8?expire=1757130002&id=753942931865341952&t=c3e77fb3a4cd2eaab5f6a9159083a35ec412a1830466b8501fe8e6d6e490fead&ev=100"
      },
      {
        id: "monitor3",
        longitude: 121.43071947277103,
        latitude: 30.96504564443936,
        src: "https://open.ys7.com/v3/openlive/FE5809359_1_1.m3u8?expire=1757130139&id=753943506357768192&t=e48102220c755319c0f626c158b4da975adfae043e58b56f9dd2d3c89faf28fe&ev=100"
      },
      {
        id: "health",
        longitude: 121.45826698202342,
        latitude: 30.932366613606998,
      },
    ];

    businessInfo.forEach(poi => {
      const {longitude, latitude, id} = poi;

      // 实体的当前位置
      const currentPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 100);

      // 牵引线的终点位置（示例中使用固定值，根据需要调整）
      const endPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);

      getCustomSource("businessSource")?.entities.add({
        id,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 100),
        billboard: {
          image: syglPng,
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

    return () => getCustomSource("businessSource")?.entities.removeAll();
  }, []);
};
