import dayjs from "dayjs";
import {clearAll} from "@/components/toolbar/tools/index.ts";
import {Cartesian2toDegrees} from "@/lib/view.ts";

let shadowQuery: any;
let handlerPolygon: any;
let points = [];
let handlerPolygonCb: (result: any) => void;

export const clearAnalyseShadow = () => {
  handlerPolygon && handlerPolygon.drawEvt.removeEventListener(handlerPolygonCb)
  handlerPolygon?.deactivate();
  handlerPolygon?.clear();
  shadowQuery?.clear();
};

export const analyseShadow = () => {
  clearAll();
  const scene = viewer.scene;
  //创建阴影查询对象
  shadowQuery = new Cesium.ShadowQueryPoints(scene);
  handlerPolygon = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Polygon, 0);

  handlerPolygonCb = (result: any) => {
    points.length = 0;
    const polygon = result.object;
    if (!polygon) {
      return;
    }
    polygon.show = false;
    handlerPolygon.polyline.show = false;
    let positions: any = [].concat(polygon.positions);
    positions = Cesium.arrayRemoveDuplicates(positions, Cesium.Cartesian3.equalsEpsilon);

    //遍历多边形，取出所有点
    for (let i = 0, len = positions.length; i < len; i++) {
      //转化为经纬度，并加入至临时数组
      const [longitude, latitude] = Cartesian2toDegrees(polygon.positions[i]);
      points.push(longitude);
      points.push(latitude);
    }

    const dateValue = dayjs().format("YYYY-MM-DD");

    const startTime = new Date(dateValue);
    startTime.setHours(10);
    shadowQuery.startTime = Cesium.JulianDate.fromDate(startTime);
    const endTime = new Date(dateValue);
    endTime.setHours(12);
    shadowQuery.endTime = Cesium.JulianDate.fromDate(endTime);

    shadowQuery.spacing = 10;
    shadowQuery.timeInterval = 60;

    //设置分析区域、底部高程和拉伸高度
    shadowQuery.qureyRegion({
      position: points,
      bottom: 20,
      extend: 20
    });
    shadowQuery.build();
  };

  handlerPolygon.drawEvt.addEventListener(handlerPolygonCb);

  handlerPolygon.activate();
};
