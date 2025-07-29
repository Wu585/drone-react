import departPng from "@/assets/images/drone/depart.png";
import {useDepartById} from "@/hooks/drone";
import {useEffect} from "react";
import {resetView} from "@/lib/view.ts";

export const addDepartEntity = (longitude: number, latitude: number, name: string) => {
  viewer.entities.removeById("depart-png");
  return viewer.entities.add({
    id: "depart-png",
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
    billboard: {
      image: departPng,
      width: 64,
      height: 64,
    },
    label: {
      text: name,
      font: "14pt sans-serif",
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  // Anchor to bottom of label
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 水平对齐：左对齐
      pixelOffset: new Cesium.Cartesian2(0, -30),
      fillColor: Cesium.Color.WHITE,                // 文字颜色
      backgroundColor: new Cesium.Color(0.2, 0.2, 0.2, 0.7), // 背景颜色（灰色，70% 透明度）
      padding: new Cesium.Cartesian2(10, 10),       // 内边距
      showBackground: true                          // 显示背景
    }
  });
};

export const useSetViewToCurrentDepart = () => {
  const departId = localStorage.getItem("departId");
  const {data: departData} = useDepartById(departId ? +departId : 0);
  useEffect(() => {
    if (!departData || !departData.longitude || !departData.latitude) return resetView();
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(+departData.longitude, +departData.latitude, 500),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0
      }
    });
  }, [departData]);
};
