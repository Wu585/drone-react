// 监听点击机场图标 添加起飞点和线以及高度label
import {useEffect, useState} from "react";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import takeOffPng from "@/assets/images/drone/wayline/takeoff.svg";
import {pickPosition} from "@/components/toolbar/tools";
import {clearPickPosition} from "@/components/toolbar/tools/pickPosition.ts";

export const useAddEventListener =
  (func?: (longitude: number, latitude: number, pickedObject?: any) => void,
   type = Cesium.ScreenSpaceEventType.LEFT_CLICK) => {
    useEffect(() => {
      if (!viewer) return;
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      handler.setInputAction((movement: any) => {
        viewer.scene.pickPositionAsync(movement.position).then((position: any) => {
          //将笛卡尔坐标转化为经纬度坐标
          const cartographic = Cesium.Cartographic.fromCartesian(position);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);
          // 点击的实体，没有则为undefined
          const pickedObject = viewer.scene.pick(movement.position);
          func?.(longitude, latitude, pickedObject);
        });
      }, type);

      return () => {
        if (handler) {
          handler.removeInputAction(type);//移除事件
          handler.destroy();
        }
      };
    }, []);
  };

const addTakeOffPoint = ({longitude, latitude, height, take_off_security_height}: {
  longitude: number,
  latitude: number,
  height: number,
  take_off_security_height: number
}) => {
  // 计算中间点高度
  const middleHeight = (height + take_off_security_height) / 2;

  // 创建一个带凹尖的箭头形状
  const scale = 0.00005; // 缩小整体大小
  const planeHeight = take_off_security_height;

  // 定义箭头形状的顶点（带凹尖的五边形）
  const positions = [
    // 从左后角开始，顺时针定义顶点
    longitude - scale * 1.5, latitude - scale, planeHeight,           // 左后角
    longitude - scale * 0.5, latitude - scale * 0.8, planeHeight,     // 左边中点
    longitude + scale * 2, latitude, planeHeight + scale * 3,         // 前端（稍微抬高）
    longitude - scale * 0.5, latitude + scale * 0.8, planeHeight,     // 右边中点
    longitude - scale * 1.5, latitude + scale, planeHeight,           // 右后角
    longitude - scale, latitude, planeHeight - scale * 2,             // 后部凹尖（朝内且降低）
  ];

  // 创建几何实例
  const geometry = new Cesium.GeometryInstance({
    geometry: new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(
        Cesium.Cartesian3.fromDegreesArrayHeights(positions)
      ),
      perPositionHeight: true,
      extrudedHeight: planeHeight - scale * 8, // 增加厚度
      vertexFormat: Cesium.VertexFormat.ALL,
      arcType: Cesium.ArcType.GEODESIC // 使用大地线连接顶点
    }),
    id: 'arrow'
  });

  // 创建primitive
  const primitive = new Cesium.Primitive({
    geometryInstances: geometry,
    appearance: new Cesium.MaterialAppearance({
      material: new Cesium.Material({
        fabric: {
          type: 'Color',
          uniforms: {
            color: Cesium.Color.fromCssColorString("#43ABFF").withAlpha(0.9)
          }
        }
      }),
      flat: false,
      faceForward: true,
      translucent: true
    }),
    // 确保箭头始终显示在最上层
    depthTest: true,
    depthWrite: false,
    renderState: {
      cull: {
        enabled: true,
        face: Cesium.CullFace.BACK
      }
    }
  });

  viewer.scene.primitives.add(primitive);
  (getCustomSource("waylines-create") as any).arrowPrimitive = primitive;

  // 添加起飞点和虚线
  getCustomSource("waylines-create")?.entities.add({
    id: "takeoff",
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    billboard: {
      image: takeOffPng,
      width: 48,
      height: 48,
    },
    polyline: {
      positions: [
        Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        Cesium.Cartesian3.fromDegrees(longitude, latitude, take_off_security_height)
      ],
      width: 2,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8),
        dashLength: 8.0
      })
    }
  });

  // 添加高度标签
  getCustomSource("waylines-create")?.entities.add({
    id: "takeoff-label",
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, middleHeight),
    label: {
      text: `${take_off_security_height}m`,
      font: "14px sans-serif",
      fillColor: Cesium.Color.BLACK,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      pixelOffset: new Cesium.Cartesian2(10, 0),
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    }
  });

  /*// 添加平行于地面的无人机图标
  getCustomSource("waylines-create")?.entities.add({
    id: "takeoff-drone",
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, take_off_security_height),
    billboard: {
      image: dronePng,
      width: 64,
      height: 64,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      // // rotation: Cesium.Math.toRadians(-90), // 旋转90度使其指向上方
      // alignedAxis: Cesium.Cartesian3.UNIT_Z,
      // disableDepthTestDistance: Number.POSITIVE_INFINITY,
      color: Cesium.Color.fromCssColorString("#43ABFF"), // 使用蓝色,
      alignedToGround: true
    }
  });*/
};

// 修改删除逻辑
const removeTakeoffPoint = () => {
  const takeoffEntity = getCustomSource("waylines-create")?.entities.getById("takeoff");
  const takeoffLabelEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-label");
  const arrowPrimitive = (getCustomSource("waylines-create") as any).arrowPrimitive;

  if (takeoffEntity) {
    getCustomSource("waylines-create")?.entities.remove(takeoffEntity);
  }
  if (takeoffLabelEntity) {
    getCustomSource("waylines-create")?.entities.remove(takeoffLabelEntity);
  }
  if (arrowPrimitive) {
    viewer.scene.primitives.remove(arrowPrimitive);
    (getCustomSource("waylines-create") as any).arrowPrimitive = undefined;
  }
};

// 点击机场设置起飞点
export const useSetTakeOffPoint = (height?: number) => {
  useAddEventListener((longitude, latitude, pickedObject) => {
    if (pickedObject && pickedObject.id._id.includes("dock")) {
      removeTakeoffPoint();
      addTakeOffPoint({
        longitude,
        latitude,
        height: 0,
        take_off_security_height: 120
      });
    }
  });
};

// 主动设置起飞点
export const useManuallySetTakeOffPoint = (take_off_security_height: number) => {
  const [takeoffPoint, setTakeOffPoint] = useState<{
    longitude: number,
    latitude: number,
    height: number
  } | null>(null);
  const onSetTakeoffPoint = () => pickPosition(({longitude, latitude, height}) => {
    removeTakeoffPoint();
    addTakeOffPoint({
      longitude,
      latitude,
      height,
      take_off_security_height
    });
    setTakeOffPoint({longitude, latitude, height});
    clearPickPosition();
  });

  return {takeoffPoint, onSetTakeoffPoint};
};
