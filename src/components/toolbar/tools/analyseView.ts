import {clearAll} from "@/components/toolbar/tools/index.ts";
import {Cartesian2toDegrees} from "@/lib/view.ts";

let handler: any, pointHandler: any;
let viewshed3D: any;

let handlerMousemoveCb: (e: any) => void;
let handlerRightClickCb: () => void;
let pointHandlerCb: (result: any) => void;

export const clearAnalyseView = () => {
  handler && handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  handler && handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  pointHandler && pointHandler.drawEvt.removeEventListener(pointHandlerCb);
  pointHandler?.clear();
  viewshed3D?.clear();
};

export const analyseView = () => {
  clearAll();
  const scene = viewer.scene;
  scene.viewFlag = true;
  viewshed3D = new Cesium.ViewShed3D(scene);

  let viewPosition: any;

  pointHandler = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Point);

  handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

  handlerMousemoveCb = (e) => {
    // 若此标记为false，则激活对可视域分析对象的操作
    if (!scene.viewFlag) {
      //获取鼠标屏幕坐标,并将其转化成笛卡尔坐标
      const windowPosition = e.endPosition;
      scene.pickPositionAsync(windowPosition).then((last: any) => {
        //计算该点与视口位置点坐标的距离
        const distance = Cesium.Cartesian3.distance(viewPosition, last);

        if (distance > 0) {
          // 将鼠标当前点坐标转化成经纬度
          // 通过该点设置可视域分析对象的距离及方向
          viewshed3D.setDistDirByPoint(Cartesian2toDegrees(last));
        }
      });
    }
  };
  // 鼠标移动时间回调
  handler.setInputAction(handlerMousemoveCb, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handlerRightClickCb = () => {
    scene.viewFlag = true;
  };

  handler.setInputAction(handlerRightClickCb, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  pointHandlerCb = (result) => {
    const position = result.object.position;
    viewPosition = position;

    if (scene.viewFlag) {
      // 设置视口位置
      viewshed3D.viewPosition = Cartesian2toDegrees(position);
      viewshed3D.build();
      // 将标记置为false以激活鼠标移动回调里面的设置可视域操作
      scene.viewFlag = false;
    }
  };

  pointHandler.drawEvt.addEventListener(pointHandlerCb);

  viewshed3D.distance = 0.1;
  scene.viewFlag = true;

  //激活绘制点类
  pointHandler.activate();
};
