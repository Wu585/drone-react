import {clearAll} from "@/components/toolbar/tools/index.ts";

let handlerDis: any;

export const clearCalcDistance = () => {
  handlerDis && handlerDis.measureEvt.removeEventListener(callback);
  handlerDis && handlerDis.clear();
  handlerDis && handlerDis.deactivate();
};

const callback = (result: any) => {
  const dis = Number(result.distance);
  const distance = dis > 1000 ? (dis / 1000).toFixed(2) + "km" : dis.toFixed(2) + "m";
  handlerDis.disLabel.text = "距离:" + distance;
};

export const calcDistance = () => {
  clearAll();
  handlerDis = new Cesium.MeasureHandler(viewer, Cesium.MeasureMode.Distance, 0);

  //注册测距功能事件
  handlerDis.measureEvt.addEventListener(callback);
  handlerDis && handlerDis.activate();
};
