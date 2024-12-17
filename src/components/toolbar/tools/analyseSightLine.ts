import {Cartesian2toDegrees} from "@/lib/view.ts";
import {clearAll} from "@/components/toolbar/tools/index.ts";

let addViewFlag = false;//当前点击状态是否是 添加观察点
let addTargetFlag = false;//当前点击状态是否是 添加目标点

let num = 0;//添加的目标点的点号
let couldRemove = false;//是否能移除目标点

let handlerPoint: any;
let handler: any;
let sightline: any;

let clickFlag = false, timer: any;

let handlerPointCb: (result: any) => void;

let handlerLeftClickCb: (result: any) => void;
let handlerMouseMoveCb: (result: any) => void;
let handlerRightClickCb: () => void;

export const clearAnalyseSightLine = () => {
  addViewFlag = false;
  addTargetFlag = false;
  handlerPoint?.clear();
  num = 0;
  if (couldRemove) {
    sightline?.removeAllTargetPoint();
    couldRemove = false;
  }

  handlerPoint && handlerPoint.drawEvt.removeEventListener(handlerPointCb);
  handler && handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  handler && handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler && handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
};

export const analyseSightLine = () => {
  clearAll();
  const scene = viewer.scene;
  sightline = new Cesium.Sightline(scene);
  sightline.build();

  handlerPoint = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Point);

  handlerPointCb = (result) => {
    //添加观察点
    if (addViewFlag) {
      const position = result.object.position;
      //设置观察点
      sightline.viewPosition = Cartesian2toDegrees(position);
      addViewFlag = false;
    }
    handlerPoint.deactivate();

    addViewFlag = false;
    setTimeout(() => {
      addTargetFlag = true;
    }, 200);
  };

  handlerPoint.drawEvt.addEventListener(handlerPointCb);

  //添加通视点
  const addTarget = (CartesianPosition: any) => {
    if (!addViewFlag && addTargetFlag) {
      num += 1;
      //将获取的点的位置转化成经纬度
      const cartographic = Cartesian2toDegrees(CartesianPosition);
      //添加目标点
      const name = "point" + num;
      sightline.addTargetPoint({
        position: cartographic,
        name: name
      });

      couldRemove = true;
    }
  };

  handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

  addViewFlag = true;
  if (handlerPoint.active) {
    return;
  }

  if (couldRemove) {
    sightline.removeAllTargetPoint();
  }
  handlerPoint.activate();

  //鼠标点击事件，添加点
  handlerLeftClickCb = (e: any) => {
    clickFlag = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      clickFlag = false;
    }, 100); //添加点时延迟移动添加目标点

    scene.pickPositionAsync(e.position).then((position: any) => {
      if (addTargetFlag) {
        addTarget(position);
      }
    });
  };
  handler.setInputAction(handlerLeftClickCb, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  //鼠标移动事件，更新点
  handlerMouseMoveCb = (evt: any) => {
    if (clickFlag) return;
    //鼠标移动，更新最后一次添加的目标点的位置
    scene.pickPositionAsync(evt.endPosition).then((position: any) => {
      if (num > 0) {
        sightline.removeTargetPoint("point0");

        const cartographic = Cartesian2toDegrees(position);

        sightline.addTargetPoint({
          position: cartographic,
          name: "point0"
        });
      }
    });
  };
  handler.setInputAction(handlerMouseMoveCb, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  //鼠标右键事件，结束
  handlerRightClickCb = () => {
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };
  handler.setInputAction(handlerRightClickCb, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
};

