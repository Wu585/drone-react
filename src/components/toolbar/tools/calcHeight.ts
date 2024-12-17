import {clearAll} from "@/components/toolbar/tools/index.ts";

let handlerHeight: any;

export const clearHeight = () => {
  handlerHeight && handlerHeight.measureEvt.removeEventListener(callback);
  handlerHeight && handlerHeight.clear();
  handlerHeight && handlerHeight.deactivate();
};

const callback = (result: any) => {
  const distance = result.distance > 1000 ? (result.distance / 1000).toFixed(2) + "km" : result.distance + "m";
  const vHeight = result.verticalHeight > 1000 ? (result.verticalHeight / 1000).toFixed(2) + "km" : result.verticalHeight + "m";
  const hDistance = result.horizontalDistance > 1000 ? (result.horizontalDistance / 1000).toFixed(2) + "km" : result.horizontalDistance + "m";
  handlerHeight.disLabel.text = "空间距离:" + distance;
  handlerHeight.vLabel.text = "垂直高度:" + vHeight;
  handlerHeight.hLabel.text = "水平距离:" + hDistance;
};

export const calcHeight = () => {
  clearAll();
  //初始化测量高度
  handlerHeight = new Cesium.MeasureHandler(viewer, Cesium.MeasureMode.DVH);

  handlerHeight.measureEvt.addEventListener(callback);
  handlerHeight && handlerHeight.activate();
};
