import {clearAll} from "@/components/toolbar/tools/index.ts";

let handler: any;

export const clearPickPosition = () => {
  handler && handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

const createCallback = (onFinish?: ({longitude, latitude, height}: {
  longitude: number,
  latitude: number,
  height: number
}) => void) => (e: any) => {
  viewer.scene.pickPositionAsync(e.position).then((position: any) => {
    //将笛卡尔坐标转化为经纬度坐标
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    console.log("cartographic");
    console.log(cartographic);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    let height = cartographic.height;
    if (height < 0) {
      height = 0;
    }
    // 调用回调函数
    onFinish?.({longitude, latitude, height});
  });
};

export const pickPosition = (onFinish?: ({longitude, latitude, height}: {
  longitude: number,
  latitude: number,
  height: number
}) => void, isClear = true) => {
  isClear && clearAll();
  handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction(createCallback(onFinish), Cesium.ScreenSpaceEventType.LEFT_CLICK);
};
