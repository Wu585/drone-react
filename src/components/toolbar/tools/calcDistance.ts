import {clearAll} from "@/components/toolbar/tools/index.ts";

let handlerDis: any;

export const clearCalcDistance = () => {
  handlerDis && handlerDis.measureEvt.removeEventListener();
  handlerDis && handlerDis.clear();
  handlerDis && handlerDis.deactivate();
};

// 创建回调函数工厂
const createCallback = (onFinish?: (positions: Array<{
  longitude: number,
  latitude: number,
  height: number
}>) => void) => (result: any) => {
  // 获取所有点的笛卡尔坐标
  const positions = result.positions;

  // 转换所有点的坐标
  const coordinates = positions.map((position: any) => {
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    let height = cartographic.height;
    if (height < 0) {
      height = 0;
    }
    return {longitude, latitude, height};
  });

  // 调用回调函数，传递所有点的坐标
  onFinish?.(coordinates);

  // 清理测量工具
  clearCalcDistance();
};

export const calcDistance = (onFinish?: (positions: Array<{
  longitude: number,
  latitude: number,
  height: number
}>) => void, isClear = true) => {
  isClear && clearAll();
  handlerDis = new Cesium.MeasureHandler(viewer, Cesium.MeasureMode.Distance, 0);

  // 注册测距功能事件，使用创建的回调函数
  handlerDis.measureEvt.addEventListener(createCallback(onFinish));
  handlerDis && handlerDis.activate();
};
