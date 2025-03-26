import {useCallback, useEffect, useRef} from "react";

interface Position {
  longitude: number;
  latitude: number;
  height: number;
}

export interface CircleResult {
  center: Position;
  radius: number;
}

export const useDrawCircle = (onFinish?: (result: CircleResult) => void) => {
  const handlerRef = useRef<any>(null);
  const activeShapePoints = useRef<any[]>([]);
  const floatingPointRef = useRef<any>(null);
  const activeShapeRef = useRef<any>(null);
  const radiusLabelRef = useRef<any>(null);
  const entityArrayRef = useRef<any[]>([]);

  // 清理函数
  const clearDrawCircle = useCallback(() => {
    // 清理所有实体
    entityArrayRef.current.forEach(entity => {
      viewer.entities.remove(entity);
    });
    entityArrayRef.current = [];

    // 清理事件处理器
    if (handlerRef.current) {
      handlerRef.current.destroy();
      handlerRef.current = null;
    }

    // 重置状态
    activeShapePoints.current = [];
    floatingPointRef.current = null;
    activeShapeRef.current = null;
    radiusLabelRef.current = null;
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearDrawCircle();
    };
  }, [clearDrawCircle]);

  // 创建点实体
  const createPoint = useCallback((worldPosition: any) => {
    const point = viewer.entities.add({
      position: worldPosition,
      point: {
        color: Cesium.Color.WHITE,
        pixelSize: 5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    });
    entityArrayRef.current.push(point);
    return point;
  }, []);

  // 创建圆形实体
  const drawShape = useCallback((positionData: any) => {
    const value = typeof positionData.getValue === "function" ? positionData.getValue(0) : positionData;
    const circleEntity = viewer.entities.add({
      position: activeShapePoints.current[0],
      ellipse: {
        semiMinorAxis: new Cesium.CallbackProperty(() => {
          const r = Cesium.Cartesian3.distance(value[0], value[value.length - 1]);
          return r || 1;
        }, false),
        semiMajorAxis: new Cesium.CallbackProperty(() => {
          const r = Cesium.Cartesian3.distance(value[0], value[value.length - 1]);
          return r || 1;
        }, false),
        material: Cesium.Color.fromCssColorString("#2D8CF0").withAlpha(0.5),
        outline: true
      }
    });
    entityArrayRef.current.push(circleEntity);
    return circleEntity;
  }, []);

  // 结束绘制
  const terminateShape = useCallback(() => {
    if (activeShapePoints.current.length > 0) {
      // 获取中心点和边缘点
      const centerCartesian = activeShapePoints.current[0];
      const edgeCartesian = activeShapePoints.current[1];

      // 计算半径
      const radius = Cesium.Cartesian3.distance(centerCartesian, edgeCartesian);

      // 转换中心点坐标
      const centerCartographic = Cesium.Cartographic.fromCartesian(centerCartesian);
      const center: Position = {
        longitude: Cesium.Math.toDegrees(centerCartographic.longitude),
        latitude: Cesium.Math.toDegrees(centerCartographic.latitude),
        height: centerCartographic.height < 0 ? 0 : centerCartographic.height
      };

      // 调用回调
      onFinish?.({center, radius});
    }

    clearDrawCircle();
  }, [clearDrawCircle, onFinish]);

  // 开始绘制
  const startDraw = useCallback(() => {
    clearDrawCircle();

    handlerRef.current = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    viewer.scene.canvas.style.cursor = "crosshair";

    // 左键点击事件
    handlerRef.current.setInputAction((event: any) => {
      const earthPosition = viewer.scene.pickPosition(event.position);
      if (Cesium.defined(earthPosition)) {
        if (activeShapePoints.current.length === 0) {
          floatingPointRef.current = createPoint(earthPosition);
          activeShapePoints.current.push(earthPosition);
          const dynamicPositions = new Cesium.CallbackProperty(() => activeShapePoints.current, false);
          activeShapeRef.current = drawShape(dynamicPositions);

          // 创建半径标签
          radiusLabelRef.current = viewer.entities.add({
            position: earthPosition,
            label: {
              text: '半径: 0 米',
              font: '14px sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1,
              pixelOffset: new Cesium.Cartesian2(0, -20)
            }
          });
          entityArrayRef.current.push(radiusLabelRef.current);
        }
        activeShapePoints.current.push(earthPosition);
        createPoint(earthPosition);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 鼠标移动事件
    handlerRef.current.setInputAction((event: any) => {
      if (Cesium.defined(floatingPointRef.current)) {
        const newPosition = viewer.scene.pickPosition(event.endPosition);
        if (Cesium.defined(newPosition)) {
          floatingPointRef.current.position.setValue(newPosition);
          activeShapePoints.current.pop();
          activeShapePoints.current.push(newPosition);

          // 更新半径标签
          if (activeShapePoints.current.length >= 2) {
            const radius = Cesium.Cartesian3.distance(
              activeShapePoints.current[0],
              activeShapePoints.current[1]
            );
            if (radiusLabelRef.current) {
              radiusLabelRef.current.label.text = `半径: ${radius.toFixed(2)} 米`;
            }
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 右键点击完成绘制
    handlerRef.current.setInputAction(() => {
      terminateShape();
      viewer.scene.canvas.style.cursor = "default";
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }, [createPoint, drawShape, terminateShape]);

  return {
    startDraw,
    clearDraw: clearDrawCircle
  };
};
