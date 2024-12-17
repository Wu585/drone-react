import {clearAll} from "@/components/toolbar/tools/index.ts";

let handlerArea: any;

export const clearCalcArea = () => {
  handlerArea && handlerArea.measureEvt.removeEventListener(callback);
  handlerArea && handlerArea.clear();
  handlerArea && handlerArea.deactivate();
};

const callback = (result: any) => {
  const mj = Number(result.area);
  const area = mj > 1000000 ? (mj / 1000000).toFixed(2) + "km²" : mj.toFixed(2) + "㎡";
  handlerArea.areaLabel.text = "面积:" + area;
};

export const calcArea = () => {
  clearAll();
  handlerArea = new Cesium.MeasureHandler(viewer, Cesium.MeasureMode.Area, 0);
  handlerArea.measureEvt.addEventListener(callback);
  handlerArea && handlerArea.activate();
};
