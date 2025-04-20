// 监听点击机场图标 添加起飞点和线以及高度label
import {useEffect, useState} from "react";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import takeOffPng from "@/assets/images/drone/wayline/takeoff.svg";
import {pickPosition} from "@/components/toolbar/tools";
import {clearPickPosition} from "@/components/toolbar/tools/pickPosition.ts";
// import gltfJson from "@/assets/datas/drone-gltf.json";

export const useAddEventListener =
  (func?: ({longitude, latitude, pickedObject}: { longitude?: number, latitude?: number, pickedObject?: any }) => void,
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
          func?.({longitude, latitude, pickedObject});
        });
      }, type);

      return () => {
        if (handler) {
          handler.removeInputAction(type);//移除事件
          handler.destroy();
        }
      };
    }, [func, type]);
  };

// 添加无人机图标
export const addDroneModel = (longitude: number, latitude: number, height: number, sourceName = "waylines-create") => {
  const takeoffDroneEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-drone");
  if (takeoffDroneEntity) return;
  getCustomSource(sourceName)?.entities.add({
    id: "takeoff-drone",
    position: new Cesium.CallbackProperty(() => {
      return Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
    }, false),
    model: {
      uri: "/models/untitled2.glb",
      scale: 0.1,
      minimumPixelSize: 64,
      maximumScale: 64,
      runAnimations: true,
      // color: Cesium.Color.fromCssColorString("#43ABFF").withAlpha(0.9),
      // colorBlendMode: Cesium.ColorBlendMode.REPLACE,
      // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
    }
  });
};

// 添加无人机模型
export const dynamicAddDroneModel = (dronePosition: {
  longitude: number,
  latitude: number,
  height: number,
  heading?: number // 添加航向角属性
}, sourceName = "waylines-create") => {
  const takeoffDroneEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-drone");
  if (takeoffDroneEntity) {
    getCustomSource(sourceName)?.entities.remove(takeoffDroneEntity);
  }

  getCustomSource(sourceName)?.entities.add({
    id: "takeoff-drone",
    position: new Cesium.CallbackProperty(() => {
      const {longitude, latitude, height} = dronePosition;
      return Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
    }, false),
    orientation: new Cesium.CallbackProperty(() => {
      // 根据航向角计算四元数
      const heading = Cesium.Math.toRadians(dronePosition.heading || 0);
      return Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(dronePosition.longitude, dronePosition.latitude, dronePosition.height),
        new Cesium.HeadingPitchRoll(heading, 0, 0)
      );
    }, false),
    model: {
      uri: "/models/untitled2.glb",
      scale: 0.1,
      minimumPixelSize: 64,
      maximumScale: 64,
      runAnimations: true,
    }
  });
};

export const removeDroneModel = () => {
  const takeoffDroneEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-drone");
  if (takeoffDroneEntity) {
    getCustomSource("waylines-create")?.entities.remove(takeoffDroneEntity);
  }
};

// 移除棱锥体和中心线
export const removePyramid = () => {
  const entityIds = [
    "center-line",
    "bottom-polygon",
    "left-polygon",
    "right-polygon",
    "front-polygon",
    "top-polygon"
  ];

  entityIds.forEach(id => {
    const entity = getCustomSource("waylines-create")?.entities.getById(id);
    if (entity) {
      getCustomSource("waylines-create")?.entities.remove(entity);
    }
  });
};

// 添加棱锥和中心线
export const addPyramid = ({position, direction}: {
  position: {
    longitude: number, latitude: number, height: number
  }
  direction: {
    x: number,
    y: number
    z: number
  }
}) => {
  // 零锥体的参数
  const distance = 200;  // 长度
  const side = 50; // 边长
  const centerLineEntity = getCustomSource("waylines-create")?.entities.getById("center-line");
  if (!centerLineEntity)
    getCustomSource("waylines-create")?.entities.add({
      id: "center-line",
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          const {longitude, latitude, height} = position;
          const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
          // let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(forwardPosition, topPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3())  // 方向单位向量
          const centerPosition = Cesium.Cartesian3.add(topPosition, Cesium.Cartesian3.multiplyByScalar(direction, distance, new Cesium.Cartesian3()), new Cesium.Cartesian3());  // 锥体底部中心
          return [topPosition, centerPosition];
        }, false),
        // positions: [topPosition, centerPosition, centerTopPosition, centerBottomPosition, leftTopPosition, leftBottomPosition, rightTopPosition, rightBottomPosition],
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString("#06BB8B").withAlpha(0.2)
        }),
      },  // 顶点和底部中心连线
    });
  const bottomEntity = getCustomSource("waylines-create")?.entities.getById("bottom-polygon");
  if (!bottomEntity)
    getCustomSource("waylines-create")?.entities.add({
      id: "bottom-polygon",
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          const positions = [];
          const {longitude, latitude, height} = position;
          const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
          const centerPosition = Cesium.Cartesian3.add(topPosition, Cesium.Cartesian3.multiplyByScalar(direction, distance, new Cesium.Cartesian3()), new Cesium.Cartesian3());  // 锥体底部中心
          /*start 计算四个角点*/
          const cross = Cesium.Cartesian3.cross(centerPosition, direction, new Cesium.Cartesian3());
          let nCross = Cesium.Cartesian3.normalize(cross, new Cesium.Cartesian3());
          nCross = Cesium.Cartesian3.multiplyByScalar(nCross, side / 2, new Cesium.Cartesian3());
          const carto = Cesium.Cartographic.fromCartesian(centerPosition);
          carto.height = carto.height + side / 2;
          carto.height = carto.height - side;
          const centerBottomPosition = Cesium.Cartographic.toCartesian(carto);
          const leftBottomPosition = Cesium.Cartesian3.add(centerBottomPosition, nCross, new Cesium.Cartesian3());
          nCross = Cesium.Cartesian3.multiplyByScalar(nCross, -1, new Cesium.Cartesian3());
          const rightBottomPosition = Cesium.Cartesian3.add(centerBottomPosition, nCross, new Cesium.Cartesian3());
          /*end 计算四个角点*/
          positions.push(topPosition, leftBottomPosition, rightBottomPosition);
          return new Cesium.PolygonHierarchy(positions);
        }, false),
        perPositionHeight: true,
        material: Cesium.Color.fromCssColorString("#06BB8B").withAlpha(0.2),
      }
    });
  const leftEntity = getCustomSource("waylines-create")?.entities.getById("left-polygon");
  if (!leftEntity)
    getCustomSource("waylines-create")?.entities.add({
      id: "left-polygon",
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          let positions = [];
          const {longitude, latitude, height} = position;
          const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
          let centerPosition = Cesium.Cartesian3.add(topPosition, Cesium.Cartesian3.multiplyByScalar(direction, distance, new Cesium.Cartesian3()), new Cesium.Cartesian3());  // 锥体底部中心
          /*start 计算四个角点*/
          let cross = Cesium.Cartesian3.cross(centerPosition, direction, new Cesium.Cartesian3());
          let nCross = Cesium.Cartesian3.normalize(cross, new Cesium.Cartesian3());
          nCross = Cesium.Cartesian3.multiplyByScalar(nCross, side / 2, new Cesium.Cartesian3());
          let centerTopPosition;
          let carto = Cesium.Cartographic.fromCartesian(centerPosition);
          carto.height = carto.height + side / 2;
          centerTopPosition = Cesium.Cartographic.toCartesian(carto);
          let centerBottomPosition;
          carto.height = carto.height - side;
          centerBottomPosition = Cesium.Cartographic.toCartesian(carto);
          // eslint-disable-next-line no-unused-vars
          let leftTopPosition = Cesium.Cartesian3.add(centerTopPosition, nCross, new Cesium.Cartesian3());
          // eslint-disable-next-line no-unused-vars
          let leftBottomPosition = Cesium.Cartesian3.add(centerBottomPosition, nCross, new Cesium.Cartesian3());
          nCross = Cesium.Cartesian3.multiplyByScalar(nCross, -1, new Cesium.Cartesian3());
          // eslint-disable-next-line no-unused-vars
          let rightTopPosition = Cesium.Cartesian3.add(centerTopPosition, nCross, new Cesium.Cartesian3());
          // eslint-disable-next-line no-unused-vars
          let rightBottomPosition = Cesium.Cartesian3.add(centerBottomPosition, nCross, new Cesium.Cartesian3());
          /*end 计算四个角点*/

          positions.push(topPosition, leftTopPosition, leftBottomPosition);
          return new Cesium.PolygonHierarchy(positions);
        }, false),
        perPositionHeight: true,
        material: Cesium.Color.fromCssColorString("#06BB8B").withAlpha(0.2),
      }
    });
  const rightEntity = getCustomSource("waylines-create")?.entities.getById("right-polygon");
  if (!rightEntity)
    getCustomSource("waylines-create")?.entities.add({
      id: "right-polygon",
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          let positions = [];
          const {longitude, latitude, height} = position;
          const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
          let centerPosition = Cesium.Cartesian3.add(topPosition, Cesium.Cartesian3.multiplyByScalar(direction, distance, new Cesium.Cartesian3()), new Cesium.Cartesian3());  // 锥体底部中心
          /*start 计算四个角点*/
          let cross = Cesium.Cartesian3.cross(centerPosition, direction, new Cesium.Cartesian3());
          let nCross = Cesium.Cartesian3.normalize(cross, new Cesium.Cartesian3());
          nCross = Cesium.Cartesian3.multiplyByScalar(nCross, side / 2, new Cesium.Cartesian3());
          let centerTopPosition;
          let carto = Cesium.Cartographic.fromCartesian(centerPosition);
          carto.height = carto.height + side / 2;
          centerTopPosition = Cesium.Cartographic.toCartesian(carto);
          let centerBottomPosition;
          carto.height = carto.height - side;
          centerBottomPosition = Cesium.Cartographic.toCartesian(carto);
          // eslint-disable-next-line no-unused-vars
          let leftTopPosition = Cesium.Cartesian3.add(centerTopPosition, nCross, new Cesium.Cartesian3());
          // eslint-disable-next-line no-unused-vars
          let leftBottomPosition = Cesium.Cartesian3.add(centerBottomPosition, nCross, new Cesium.Cartesian3());
          nCross = Cesium.Cartesian3.multiplyByScalar(nCross, -1, new Cesium.Cartesian3());
          // eslint-disable-next-line no-unused-vars
          let rightTopPosition = Cesium.Cartesian3.add(centerTopPosition, nCross, new Cesium.Cartesian3());
          // eslint-disable-next-line no-unused-vars
          let rightBottomPosition = Cesium.Cartesian3.add(centerBottomPosition, nCross, new Cesium.Cartesian3());
          /*end 计算四个角点*/

          positions.push(topPosition, rightTopPosition, rightBottomPosition);
          return new Cesium.PolygonHierarchy(positions);
        }, false),
        perPositionHeight: true,
        material: Cesium.Color.fromCssColorString("#06BB8B").withAlpha(0.2),
      }
    });
  const frontEntity = getCustomSource("waylines-create")?.entities.getById("front-polygon");
  if (!frontEntity)
    getCustomSource("waylines-create")?.entities.add({
      id: "front-polygon",
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          let positions = [];
          const {longitude, latitude, height} = position;
          const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
          let centerPosition = Cesium.Cartesian3.add(topPosition, Cesium.Cartesian3.multiplyByScalar(direction, distance, new Cesium.Cartesian3()), new Cesium.Cartesian3());  // 锥体底部中心
          /*start 计算四个角点*/
          let cross = Cesium.Cartesian3.cross(centerPosition, direction, new Cesium.Cartesian3());
          let nCross = Cesium.Cartesian3.normalize(cross, new Cesium.Cartesian3());
          nCross = Cesium.Cartesian3.multiplyByScalar(nCross, side / 2, new Cesium.Cartesian3());
          let centerTopPosition;
          let carto = Cesium.Cartographic.fromCartesian(centerPosition);
          carto.height = carto.height + side / 2;
          centerTopPosition = Cesium.Cartographic.toCartesian(carto);
          let centerBottomPosition;
          carto.height = carto.height - side;
          centerBottomPosition = Cesium.Cartographic.toCartesian(carto);
          // eslint-disable-next-line no-unused-vars
          let leftTopPosition = Cesium.Cartesian3.add(centerTopPosition, nCross, new Cesium.Cartesian3());
          // eslint-disable-next-line no-unused-vars
          let leftBottomPosition = Cesium.Cartesian3.add(centerBottomPosition, nCross, new Cesium.Cartesian3());
          nCross = Cesium.Cartesian3.multiplyByScalar(nCross, -1, new Cesium.Cartesian3());
          // eslint-disable-next-line no-unused-vars
          let rightTopPosition = Cesium.Cartesian3.add(centerTopPosition, nCross, new Cesium.Cartesian3());
          // eslint-disable-next-line no-unused-vars
          let rightBottomPosition = Cesium.Cartesian3.add(centerBottomPosition, nCross, new Cesium.Cartesian3());
          /*end 计算四个角点*/

          positions.push(rightTopPosition, rightBottomPosition, leftBottomPosition, leftTopPosition);
          return new Cesium.PolygonHierarchy(positions);
        }, false),
        perPositionHeight: true,
        material: Cesium.Color.fromCssColorString("#06BB8B").withAlpha(0.2),
      }
    });
  const topEntity = getCustomSource("waylines-create")?.entities.getById("top-polygon");
  if (!topEntity)
    getCustomSource("waylines-create")?.entities.add({
      id: "top-polygon",
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          let positions = [];
          const {longitude, latitude, height} = position;
          const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
          // let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(forwardPosition, topPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3())  // 方向单位向量
          let centerPosition = Cesium.Cartesian3.add(topPosition, Cesium.Cartesian3.multiplyByScalar(direction, distance, new Cesium.Cartesian3()), new Cesium.Cartesian3());  // 锥体底部中心
          /*start 计算四个角点*/
          let cross = Cesium.Cartesian3.cross(centerPosition, direction, new Cesium.Cartesian3());
          let nCross = Cesium.Cartesian3.normalize(cross, new Cesium.Cartesian3());
          nCross = Cesium.Cartesian3.multiplyByScalar(nCross, side / 2, new Cesium.Cartesian3());
          let centerTopPosition;
          let carto = Cesium.Cartographic.fromCartesian(centerPosition);
          carto.height = carto.height + side / 2;
          centerTopPosition = Cesium.Cartographic.toCartesian(carto);
          let centerBottomPosition;
          carto.height = carto.height - side;
          centerBottomPosition = Cesium.Cartographic.toCartesian(carto);
          let leftTopPosition = Cesium.Cartesian3.add(centerTopPosition, nCross, new Cesium.Cartesian3());
          // eslint-disable-next-line no-unused-vars
          let leftBottomPosition = Cesium.Cartesian3.add(centerBottomPosition, nCross, new Cesium.Cartesian3());
          nCross = Cesium.Cartesian3.multiplyByScalar(nCross, -1, new Cesium.Cartesian3());
          let rightTopPosition = Cesium.Cartesian3.add(centerTopPosition, nCross, new Cesium.Cartesian3());
          // eslint-disable-next-line no-unused-vars
          let rightBottomPosition = Cesium.Cartesian3.add(centerBottomPosition, nCross, new Cesium.Cartesian3());
          /*end 计算四个角点*/

          positions.push(topPosition, leftTopPosition, rightTopPosition);
          return new Cesium.PolygonHierarchy(positions);
        }, false),
        perPositionHeight: true,
        material: Cesium.Color.fromCssColorString("#06BB8B").withAlpha(0.2),
      }
    });
};

export const addTakeOffPoint = ({
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
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    },
    polyline: {
      positions: [
        Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        Cesium.Cartesian3.fromDegrees(longitude, latitude, endHeight)
      ],
      width: 2,
      material: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8)
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
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
    }
  });

  // addDroneModel(longitude, latitude, endHeight);
  // addDroneKeyboardControl();
};

// 修改删除逻辑
export const removeTakeoffPoint = () => {
  const takeoffEntity = getCustomSource("waylines-create")?.entities.getById("takeoff");
  const takeoffLabelEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-label");

  if (takeoffEntity) {
    getCustomSource("waylines-create")?.entities.remove(takeoffEntity);
  }
  if (takeoffLabelEntity) {
    getCustomSource("waylines-create")?.entities.remove(takeoffLabelEntity);
  }
};

// 点击机场设置起飞点
export const useSetTakeOffPoint = (height?: number) => {
  useAddEventListener(({longitude, latitude, pickedObject}) => {
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

// 定义方向键映射
const DIRECTION = {
  UP: "w",
  DOWN: "s",
  LEFT: "a",
  RIGHT: "d",
  SPEED_UP: "q",
  SPEED_DOWN: "e",
} as const;

// 键盘状态
const keyboardMap = {
  [DIRECTION.UP]: false,
  [DIRECTION.DOWN]: false,
  [DIRECTION.LEFT]: false,
  [DIRECTION.RIGHT]: false,
  [DIRECTION.SPEED_UP]: false,
  [DIRECTION.SPEED_DOWN]: false,
};

// 添加键盘控制
export const addDroneKeyboardControl = () => {
  const droneEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-drone");
  if (!droneEntity?.position) return;

  // 获取无人机当前位置
  const dronePosition = droneEntity.position.getValue(Cesium.JulianDate.now());
  if (!dronePosition) return;

  // 转换为经纬度
  const cartographic = Cesium.Cartographic.fromCartesian(dronePosition);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  const altitude = cartographic.height;

  // 使用无人机当前位置初始化飞行参数
  const flightParams = {
    lng: longitude,
    lat: latitude,
    altitude: altitude,
    heading: 0,
    pitch: 0,
    roll: 0,
    correction: 1,
    speed: 0,
  };

  // 键盘事件监听
  const handleKeyDown = (e: KeyboardEvent) => {
    if (Object.keys(keyboardMap).includes(e.key)) {
      keyboardMap[e.key] = true;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (Object.keys(keyboardMap).includes(e.key)) {
      keyboardMap[e.key] = false;
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // 调整飞行参数
  const adjustParams = () => {
    // 速度控制
    if (keyboardMap[DIRECTION.SPEED_UP]) {
      flightParams.speed += 100;
    }
    if (keyboardMap[DIRECTION.SPEED_DOWN] && flightParams.speed >= 500) {
      flightParams.speed -= 100;
    }

    // 俯仰控制
    if (keyboardMap[DIRECTION.UP] && flightParams.pitch <= 0.3) {
      flightParams.pitch += 0.005;
      if (flightParams.pitch > 0) {
        const temp = (flightParams.speed / 60 / 60 / 60) * 110;
        flightParams.altitude += temp * Math.sin(flightParams.pitch);
      }
    }
    if (keyboardMap[DIRECTION.DOWN] && flightParams.pitch >= -0.3) {
      flightParams.pitch -= 0.006;
      if (flightParams.pitch < 0) {
        const temp = (flightParams.speed / 60 / 60 / 60) * 110;
        flightParams.altitude += temp * Math.sin(flightParams.pitch);
      }
    }

    // 转向控制
    if (keyboardMap[DIRECTION.LEFT]) {
      flightParams.heading -= 0.005;
      if (flightParams.roll > -0.785) {
        flightParams.roll -= 0.005;
      }
    }
    if (keyboardMap[DIRECTION.RIGHT]) {
      flightParams.heading += 0.005;
      if (flightParams.roll < 0.785) {
        flightParams.roll += 0.005;
      }
    }

    // 姿态自动回正
    const {abs} = Math;
    flightParams.correction = abs(Math.cos(flightParams.heading) * Math.cos(flightParams.pitch));
    if (abs(flightParams.heading) < 0.001) flightParams.heading = 0;
    if (abs(flightParams.roll) < 0.001) flightParams.roll = 0;
    if (abs(flightParams.pitch) < 0.001) flightParams.pitch = 0;

    if (flightParams.roll > 0) flightParams.roll -= 0.003;
    if (flightParams.roll < 0) flightParams.roll += 0.003;
    if (flightParams.pitch < 0) flightParams.pitch += 0.005;
    if (flightParams.pitch > 0) flightParams.pitch -= 0.003;
  };

  // 调整飞行姿态
  const adjustAttitude = () => {
    const droneEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-drone");
    if (!droneEntity) return;

    const temp = flightParams.speed / 60 / 60 / 60 / 110;
    flightParams.lng += temp * Math.cos(flightParams.heading);
    flightParams.lat -= temp * Math.sin(flightParams.heading);
    flightParams.altitude += temp * Math.sin(flightParams.pitch) * 110 * 1000 * 10;

    // 更新无人机位置和姿态
    const position = Cesium.Cartesian3.fromDegrees(
      flightParams.lng,
      flightParams.lat,
      flightParams.altitude
    );
    const hpr = new Cesium.HeadingPitchRoll(
      flightParams.heading,
      flightParams.pitch,
      flightParams.roll
    );
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

    droneEntity.orientation = orientation;
    droneEntity.position = position;
  };

  let animationFrameId: number;
  // 动画循环
  const animate = () => {
    adjustParams();
    adjustAttitude();
    animationFrameId = requestAnimationFrame(animate);
  };

  // 开始动画
  animate();

  // 返回清理函数
  return () => {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
};

export const pointDroneToTarget = (targetPosition: { longitude: number, latitude: number }) => {
  const droneEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-drone");
  if (!droneEntity?.position) return;

  // 获取无人机当前位置
  const dronePosition = droneEntity.position.getValue(Cesium.JulianDate.now());
  if (!dronePosition) return;

  // 转换为经纬度
  const cartographic = Cesium.Cartographic.fromCartesian(dronePosition);
  const droneLongitude = Cesium.Math.toDegrees(cartographic.longitude);
  const droneLatitude = Cesium.Math.toDegrees(cartographic.latitude);
  const droneAltitude = cartographic.height;

  // 计算目标点相对于无人机的方位角
  const deltaLon = targetPosition.longitude - droneLongitude;
  const deltaLat = targetPosition.latitude - droneLatitude;

  // 调整方位角计算，使机头朝向目标点
  const heading = Math.atan2(deltaLon, deltaLat) - Math.PI / 2; // 头部对准目标点

  // 更新无人机姿态
  const position = Cesium.Cartesian3.fromDegrees(
    droneLongitude,
    droneLatitude,
    droneAltitude
  );
  const hpr = new Cesium.HeadingPitchRoll(
    heading,  // 朝向角
    0,       // 俯仰角保持水平
    0        // 翻滚角保持水平
  );

  // 应用新的朝向
  droneEntity.orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
};

// 计算两点间的直线距离（米）
export const calcDistance = ({start, end}: {
  start: { longitude: number, latitude: number, height: number },
  end: { longitude: number, latitude: number, height: number }
}): number => {
  // 将起点和终点转换为笛卡尔坐标
  const startCartesian = Cesium.Cartesian3.fromDegrees(
    start.longitude,
    start.latitude,
    start.height
  );
  const endCartesian = Cesium.Cartesian3.fromDegrees(
    end.longitude,
    end.latitude,
    end.height
  );

  // 计算两点间的直线距离
  return Number(Cesium.Cartesian3.distance(startCartesian, endCartesian).toFixed(2));
};

// 让无人机移动到指定经纬度，并返回直线距离（米）
export const moveDroneToTarget = (targetPosition: { longitude: number, latitude: number, height: number }): number => {
  const droneEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-drone");
  if (!droneEntity?.position) return 0;

  // 获取无人机当前位置
  const dronePosition = droneEntity.position.getValue(Cesium.JulianDate.now());
  if (!dronePosition) return 0;

  // 转换为经纬度
  const cartographic = Cesium.Cartographic.fromCartesian(dronePosition);
  const startLongitude = Cesium.Math.toDegrees(cartographic.longitude);
  const startLatitude = Cesium.Math.toDegrees(cartographic.latitude);

  // 计算总距离
  const deltaLon = targetPosition.longitude - startLongitude;
  const deltaLat = targetPosition.latitude - startLatitude;

  // 计算直线距离
  const distance = calcDistance({
    start: {
      longitude: startLongitude,
      latitude: startLatitude,
      height: cartographic.height
    },
    end: targetPosition
  });

  // 目标高度
  const targetHeight = targetPosition.height;

  // 动画参数
  let progress = 0;
  const duration = 2;
  const startTime = performance.now();

  // 让无人机朝向目标点
  // pointDroneToTarget(targetPosition);

  // 动画函数
  const animate = () => {
    const currentTime = performance.now();
    progress = (currentTime - startTime) / (duration * 1000);

    if (progress < 1) {
      const easeProgress = easeInOutQuad(progress);
      const currentLongitude = startLongitude + deltaLon * easeProgress;
      const currentLatitude = startLatitude + deltaLat * easeProgress;

      droneEntity.position = Cesium.Cartesian3.fromDegrees(
        currentLongitude,
        currentLatitude,
        targetHeight
      );

      requestAnimationFrame(animate);
    } else {
      droneEntity.position = Cesium.Cartesian3.fromDegrees(
        targetPosition.longitude,
        targetPosition.latitude,
        targetHeight
      );
    }
  };

  // 开始动画
  animate();

  // 返回距离（米）
  return distance;
};

// 缓动函数
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export const addConnectLines = (
  poi1: [number, number, number], poi2: [number, number, number]) => {
  getCustomSource("waylines-update")?.entities.add({
    polyline: {
      positions: [
        Cesium.Cartesian3.fromDegrees(...poi1),
        Cesium.Cartesian3.fromDegrees(...poi2)
      ],
      width: 2,
      material: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8)
    }
  });
};

// 添加航点图标，带点位数字
export const addWayPointWithIndex = ({longitude, latitude, height, text, id}: {
  longitude: number,
  latitude: number,
  height: number,
  text: number,
  id: string
}) => {
  getCustomSource("waylines-update")?.entities.add({
    id,
    position: new Cesium.CallbackProperty(() => {
      return Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
    }, false),
    billboard: {
      image: (() => {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext("2d");
        if (context) {
          context.beginPath();
          context.moveTo(16, 28);
          context.lineTo(4, 4);
          context.lineTo(28, 4);
          context.closePath();
          context.fillStyle = "#4CAF50";
          context.fill();

          context.font = "bold 16px Arial";
          context.fillStyle = "white";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(text.toString(), 16, 14);
        }
        return canvas;
      })(),
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      width: 32,
      height: 32,
      color: Cesium.Color.WHITE,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    },
    polyline: {
      positions: new Cesium.CallbackProperty(() => {
        return [
          Cesium.Cartesian3.fromDegrees(longitude, latitude, 0),
          Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
        ];
      }, false),
      width: 2,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8),
        dashLength: 8.0
      })
    }
  });
};

export const addHeightPolyline = (longitude: number, latitude: number, height: number) => {
  const entity = getCustomSource("waylines-create")?.entities.getById("height-polyline");
  if (entity) return;
  getCustomSource("waylines-create")?.entities.add({
    id: "height-polyline",
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height / 2),
    label: {
      text: `${height}m`,
      font: "14px sans-serif",
      fillColor: Cesium.Color.BLACK,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      pixelOffset: new Cesium.Cartesian2(10, 0),
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    },
    polyline: {
      // positions: [
      //   Cesium.Cartesian3.fromDegrees(longitude, latitude, 0),
      //   Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
      // ],
      positions: new Cesium.CallbackProperty(() => {
        return [
          Cesium.Cartesian3.fromDegrees(longitude, latitude, 0),
          Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
        ];
      }, false),
      width: 2,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8),
        dashLength: 8.0
      })
    }
  });
};

// 在两点之间添加标签
export const addLabelWithin = (start: [number, number, number], end: [number, number, number]) => {
  // 计算中点坐标
  const midLongitude = (start[0] + end[0]) / 2;
  const midLatitude = (start[1] + end[1]) / 2;
  const midHeight = (start[2] + end[2]) / 2;
  const distance = calcDistance({
    start: {longitude: start[0], latitude: start[1], height: start[2]},
    end: {longitude: end[0], latitude: end[1], height: end[2]}
  });
  // 添加标签实体
  getCustomSource("waylines-update")?.entities.add({
    position: Cesium.Cartesian3.fromDegrees(midLongitude, midLatitude, midHeight),
    label: {
      text: `${distance}m`,
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
  return distance;
};
