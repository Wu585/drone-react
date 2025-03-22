// 监听点击机场图标 添加起飞点和线以及高度label
import {useEffect, useState} from "react";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import takeOffPng from "@/assets/images/drone/wayline/takeoff.svg";
import {pickPosition} from "@/components/toolbar/tools";
import {clearPickPosition} from "@/components/toolbar/tools/pickPosition.ts";
import gltfJson from "@/assets/datas/drone-gltf.json";

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

const addTakeOffPoint = ({
                           longitude,
                           latitude,
                           height,
                           endHeight,
                         }: {
  longitude: number,
  latitude: number,
  height: number,
  endHeight: number,
  heading?: number
}) => {
  // 计算中间点高度
  const middleHeight = (height + endHeight) / 2;

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
        Cesium.Cartesian3.fromDegrees(longitude, latitude, endHeight)
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
      text: `${endHeight}m`,
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

  // 添加无人机图标
  const droneEntity = getCustomSource("waylines-create")?.entities.add({
    id: "takeoff-drone",
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, endHeight),
    model: {
      uri: "data:application/gltf+json," + JSON.stringify(gltfJson),
      scale: 1,
      minimumPixelSize: 32,
      maximumScale: 32,
      color: Cesium.Color.fromCssColorString("#43ABFF").withAlpha(0.9),
      colorBlendMode: Cesium.ColorBlendMode.REPLACE,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,

    }
  });
  console.log('droneEntity===');
  console.log(droneEntity);

};

// 修改删除逻辑
const removeTakeoffPoint = () => {
  const takeoffEntity = getCustomSource("waylines-create")?.entities.getById("takeoff");
  const takeoffLabelEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-label");
  const takeoffDroneEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-drone");
  const arrowPrimitive = (getCustomSource("waylines-create") as any).arrowPrimitive;

  if (takeoffEntity) {
    getCustomSource("waylines-create")?.entities.remove(takeoffEntity);
  }
  if (takeoffLabelEntity) {
    getCustomSource("waylines-create")?.entities.remove(takeoffLabelEntity);
  }
  if (takeoffDroneEntity) {
    getCustomSource("waylines-create")?.entities.remove(takeoffDroneEntity);
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
        endHeight: 120
      });
    }
  });
};

// 主动设置起飞点，参数为垂直线的高度，建议用全局高度
export const useManuallySetTakeOffPoint = (endHeight: number) => {
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
      endHeight
    });
    setTakeOffPoint({longitude, latitude, height});
    clearPickPosition();
  });

  return {takeoffPoint, onSetTakeoffPoint};
};

// 添加一个函数来更新无人机朝向
export const updateDroneDirection = (heading: number) => {
  const droneEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-drone");
  if (droneEntity && droneEntity.model) {
    // 将角度转换为弧度
    const headingRadians = Cesium.Math.toRadians(heading);

    // 更新 glTF 模型，使用固定的属性值
    droneEntity.model = new Cesium.ModelGraphics({
      uri: "data:application/gltf+json," + JSON.stringify({
        ...gltfJson,
        nodes: [{
          ...gltfJson.nodes[0],
          rotation: [0, Math.sin(headingRadians/2), 0, Math.cos(headingRadians/2)]
        }]
      }),
      scale: 1,
      minimumPixelSize: 32,
      maximumScale: 32,
      color: Cesium.Color.fromCssColorString("#43ABFF").withAlpha(0.9),
      colorBlendMode: Cesium.ColorBlendMode.REPLACE,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
    });
  }
};

// 计算两点之间的方位角并更新无人机朝向
export const updateDroneDirectionToPoint = (targetPosition: { longitude: number, latitude: number }) => {
  const droneEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-drone");
  if (droneEntity && droneEntity.model) {
    const dronePosition = droneEntity.position?.getValue(Cesium.JulianDate.now());
    if (dronePosition) {
      // 获取无人机的位置矩阵
      const transform = Cesium.Transforms.eastNorthUpToFixedFrame(dronePosition);

      // 创建目标点的笛卡尔坐标
      const targetCartesian = Cesium.Cartesian3.fromDegrees(
        targetPosition.longitude,
        targetPosition.latitude,
        0
      );

      // 计算方向向量
      const direction = Cesium.Cartesian3.subtract(
        targetCartesian,
        dronePosition,
        new Cesium.Cartesian3()
      );

      // 将方向向量转换到局部坐标系
      const localDirection = Cesium.Matrix4.multiplyByPointAsVector(
        Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
        direction,
        new Cesium.Cartesian3()
      );

      // 计算水平面上的朝向角
      const heading = Math.atan2(localDirection.x, localDirection.y);
      const headingDegrees = Cesium.Math.toDegrees(heading);

      // 更新无人机朝向
      updateDroneDirection(headingDegrees);
    }
  }
};

// 使用示例：
// updateDroneDirectionToPoint({
//   longitude: 目标经度,
//   latitude: 目标纬度
// });

// 让无人机指向目标点
export const pointToTarget = (targetPosition: { longitude: number, latitude: number }) => {
  const droneEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-drone");
  if (!droneEntity?.position) return;

  // 获取无人机当前位置
  const dronePosition = droneEntity.position.getValue(Cesium.JulianDate.now());
  if (!dronePosition) return;

  // 创建目标点的笛卡尔坐标
  const targetCartesian = Cesium.Cartesian3.fromDegrees(
    targetPosition.longitude,
    targetPosition.latitude,
    0
  );

  // 计算无人机到目标点的方向
  const direction = Cesium.Cartesian3.subtract(
    targetCartesian,
    dronePosition,
    new Cesium.Cartesian3()
  );
  Cesium.Cartesian3.normalize(direction, direction);

  // 计算朝向角度
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(dronePosition);
  const localDirection = Cesium.Matrix4.multiplyByPointAsVector(
    Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
    direction,
    new Cesium.Cartesian3()
  );

  // 计算水平面上的朝向角
  const heading = Math.atan2(localDirection.x, localDirection.y);
  
  // 创建朝向四元数
  const hpr = new Cesium.HeadingPitchRoll(heading, 0, 0);
  const quaternion = Cesium.Quaternion.fromHeadingPitchRoll(hpr);
  const rotationMatrix = Cesium.Matrix3.fromQuaternion(quaternion);

  // 更新模型
  droneEntity.model = new Cesium.ModelGraphics({
    uri: "data:application/gltf+json," + JSON.stringify({
      ...gltfJson,
      nodes: [{
        ...gltfJson.nodes[0],
        rotation: [
          rotationMatrix[0],  // x
          rotationMatrix[1],  // y
          rotationMatrix[2],  // z
          -1                  // w
        ]
      }]
    }),
    scale: 1,
    minimumPixelSize: 32,
    maximumScale: 32,
    color: Cesium.Color.fromCssColorString("#43ABFF").withAlpha(0.9),
    colorBlendMode: Cesium.ColorBlendMode.REPLACE,
    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
  });
};

// 使用示例：
// pointToTarget({
//   longitude: 目标经度,
//   latitude: 目标纬度
// });

