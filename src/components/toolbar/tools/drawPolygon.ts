import {useCallback, useEffect, useRef} from "react";

interface Position {
  longitude: number;
  latitude: number;
  height: number;
}

export const useDrawPolygon = (onFinish?: (positions: Position[]) => void) => {
  const handlerPolygonRef = useRef<any>(null);

  // 清理函数
  const clearDrawPolygon = useCallback(() => {
    if (handlerPolygonRef.current) {
      handlerPolygonRef.current.clear();
      handlerPolygonRef.current.deactivate();
      handlerPolygonRef.current = null;
    }
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearDrawPolygon();
    };
  }, [clearDrawPolygon]);

  // 开始绘制
  const startDraw = useCallback(() => {
    handlerPolygonRef.current = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Polygon);

    // 处理鼠标样式
    handlerPolygonRef.current.activeEvt.addEventListener((isActive: boolean) => {
      if (isActive) {
        viewer.enableCursorStyle = false;
        viewer._element.style.cursor = "";
      } else {
        viewer.enableCursorStyle = true;
      }
    });

    // 处理绘制结果
    handlerPolygonRef.current.drawEvt.addEventListener((result: any) => {
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

      // 调用回调
      onFinish?.(coordinates);
      
      // 清理绘制工具
      clearDrawPolygon();
    });

    handlerPolygonRef.current.activate();
  }, [clearDrawPolygon, onFinish]);

  return {
    startDraw,
    clearDraw: clearDrawPolygon
  };
};
