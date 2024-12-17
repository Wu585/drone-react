import {Cartesian2toDegrees} from "@/lib/view.ts";
// @ts-ignore
import {circle, pointsWithinPolygon, points} from "@turf/turf";

const entityArray: any[] = [];

let handler: any;
let radius = 0; // 半径
let lngLat: number[] = []; // 圆心

let activeShapePoints: any[] = [];  // 存放当前绘制的多边形的点坐标
let activeShape: any = null;  // 存放当前绘制的多边形对象
let floatingPoint: any = null;  //存储第一个点并判断是否开始获取鼠标移动结束位置
let radiusLabel: any = null; // 用于显示半径的标签

export const clearCircle = () => {
  entityArray.forEach((entity: any) => {
    viewer.entities.remove(entity);
  });
  entityArray.length = 0;
};

const createPoint = (worldPosition: any) => {
  const point = viewer.entities.add({
    position: worldPosition,
    point: {
      color: Cesium.Color.WHITE,
      pixelSize: 5,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    }
  });
  entityArray.push(point);
  return point;
};

const drawShape = (positionData: any) => {
  const value = typeof positionData.getValue === "function" ? positionData.getValue(0) : positionData; //当传入的positionData为SampledPositionProperty时，取第一个值
  const circleEntity = viewer.entities.add({
    position: activeShapePoints[0], //圆心
    ellipse: { //椭圆
      semiMinorAxis: new Cesium.CallbackProperty(() => {
        //半径，两点之间的距离
        let r = Cesium.Cartesian3.distance(value[0], value[value.length - 1]); //半径
        radius = r; // Update radius here
        return r ? r : r + 1;
      }, false),
      semiMajorAxis: new Cesium.CallbackProperty(() => {
        //半径，两点之间的距离
        let r = Cesium.Cartesian3.distance(value[0], value[value.length - 1]); //半径
        radius = r; // Update radius here
        return r ? r : r + 1;
      }, false),
      material: Cesium.Color.BLUE.withAlpha(0.5),  //颜色
      outline: true
    }
  });
  entityArray.push(circleEntity);
  return circleEntity;
};

const terminateShape = () => {
  activeShapePoints.pop(); //去除最后一个动态点
  if (activeShapePoints.length) {
    drawShape(activeShapePoints).ellipse._semiMajorAxis.getValue();//绘制最终图
  }
  viewer.entities.remove(floatingPoint); //去除动态点图形（当前鼠标点）
  viewer.entities.remove(activeShape); //去除动态图形
  floatingPoint = undefined;
  activeShape = undefined;
  activeShapePoints = [];
};

export const drawCircle = (generateData?: () => any, callback?: (pointsIn?: any) => void) => {
  handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  viewer.scene.canvas.style.cursor = "crosshair";

  handler.setInputAction((event: any) => {
    const earthPosition = viewer.scene.pickPosition2D(event.position);
    const [longitude, latitude] = Cartesian2toDegrees(earthPosition);
    lngLat.push(longitude, latitude); // 更新圆心坐标

    if (Cesium.defined(earthPosition)) {
      if (activeShapePoints.length === 0) {
        floatingPoint = createPoint(earthPosition);
        activeShapePoints.push(earthPosition);
        const dynamicPositions = new Cesium.CallbackProperty(() => activeShapePoints, false);
        activeShape = drawShape(dynamicPositions);//绘制动态图
        // Create the radius label initially
        radiusLabel = viewer.entities.add({
          position: activeShapePoints[0], // Initially position at the center
          label: {
            text: `范围: 0 米`,
            font: "18px sans-serif",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 1,
            pixelOffset: new Cesium.Cartesian2(15, -15)
          }
        });
        entityArray.push(radiusLabel);
      }
      activeShapePoints.push(earthPosition);
      createPoint(earthPosition);
    }

  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  //鼠标移动
  handler.setInputAction((event: any) => {
    if (Cesium.defined(floatingPoint)) {
      const newPosition = viewer.scene.pickPosition(event.endPosition);
      if (Cesium.defined(newPosition)) {
        floatingPoint.position.setValue(newPosition);
        activeShapePoints.pop();
        activeShapePoints.push(newPosition);

        // Update radius and label position
        radius = Cesium.Cartesian3.distance(activeShapePoints[0], newPosition);
        // radiusLabel.position.setValue(Cesium.Cartesian3.lerp(activeShapePoints[0], newPosition, 0.5));
        radiusLabel.label.text = `范围: ${radius.toFixed(2)} 米`;
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // 结束绘制
  handler.setInputAction(() => {
    const circlePolygon = circle([lngLat[0], lngLat[1]], radius, {steps: 64, units: "meters"});
    if (generateData) {
      const _points = generateData?.();
      const ptsWithin = pointsWithinPolygon(points(_points), circlePolygon);
      callback?.(ptsWithin);
    } else {
      callback?.();
    }
    terminateShape();
    handler.destroy();
    lngLat = [];
    viewer.scene.canvas.style.cursor = "default";    //恢复鼠标形状
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
};
