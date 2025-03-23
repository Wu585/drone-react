import {useCallback, useEffect, useState} from "react";

interface UseWheelZoomOptions {
  initialValue?: number;
  min?: number;
  max?: number;
  elementId: string;
}

export function useWheelZoom({
  initialValue = 2,
  min = 2,
  max = 200,
  elementId
}: UseWheelZoomOptions) {
  const [zoomValue, setZoomValue] = useState(initialValue);

  // 处理滚轮事件
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();

    // 根据事件的deltaMode来调整deltaY
    let adjustedDelta = event.deltaY;
    switch (event.deltaMode) {
      case WheelEvent.DOM_DELTA_PIXEL:
        adjustedDelta = event.deltaY;
        break;
      case WheelEvent.DOM_DELTA_LINE:
        adjustedDelta = event.deltaY * 8;
        break;
      case WheelEvent.DOM_DELTA_PAGE:
        adjustedDelta = event.deltaY * 24;
        break;
    }

    console.log('调整后的delta:', adjustedDelta);
    console.log('当前zoomValue:', zoomValue);

    // 使用较小的基础步长
    const baseStep = 1;
    // 根据滚动方向决定增加或减少
    const direction = adjustedDelta > 0 ? -1 : 1;

    setZoomValue(prevValue => {
      // 计算新值并限制在范围内
      const newValue = Math.min(max, Math.max(min, prevValue + baseStep * direction));
      console.log('更新后的值:', newValue);
      return newValue;
    });
  }, [min, max, zoomValue]);

  // 添加和移除滚轮事件监听
  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.log('未找到目标元素');
      return;
    }

    console.log('添加滚轮事件监听');
    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      handleWheel(e);
    };

    element.addEventListener("wheel", wheelHandler, { passive: false });

    return () => {
      element.removeEventListener("wheel", wheelHandler);
      console.log('移除滚轮事件监听');
    };
  }, [handleWheel, elementId]);

  // 监听 zoomValue 的变化
  useEffect(() => {
    console.log('zoomValue 已更新:', zoomValue);
  }, [zoomValue]);

  return {
    zoomValue,
    setZoomValue
  };
}
