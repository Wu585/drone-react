// @ts-ignore
import {points, pointsWithinPolygon, polygon} from "@turf/turf";
import {clearAll} from "@/components/toolbar/tools/index.ts";

let handlerQuery: any;
let currentCallback: (result: any) => void;

export const clearFrameSelectionQuery = () => {
  handlerQuery && handlerQuery.drawEvt.removeEventListener(currentCallback);
  handlerQuery && handlerQuery.clear();
  handlerQuery && handlerQuery.deactivate();
};

const callback = (generateData: () => any, onFinish?: (ptsWithin: any) => void) => (result: any) => {
  // result.object 是绘制完成的多边形
  const _polygon = result.object;
  // 获取多边形的顶点坐标
  const positions = _polygon.positions;
  const transformPositions = positions.map((cartesian3: any) => {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    return [longitude, latitude];
  });
  transformPositions.push(transformPositions[0]);
  const searchWithin = polygon([[...transformPositions]]);
  const _points = generateData();
  const ptsWithin = pointsWithinPolygon(points(_points), searchWithin);
  onFinish?.(ptsWithin);
};

export const frameSelectionQuery = (generateData: () => any, onFinish?: (ptsWithin: any) => void) => {
  clearAll();
  currentCallback = callback(generateData, onFinish);
  handlerQuery = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Polygon, {clampToGround: true});
  handlerQuery.drawEvt.addEventListener(currentCallback);
  handlerQuery.activate();
};
