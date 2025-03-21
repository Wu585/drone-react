import {useEffect, useState, useRef} from "react";
import {cn} from "@/lib/utils.ts";

interface ContextMenuPosition {
  show: boolean;
  x: number;
  y: number;
  longitude: number;
  latitude: number;
}

interface UseRightClickPanelProps {
  containerId: string;  // 容器元素的 ID
  onRightClick?: (movement: any) => void;  // 右键点击的回调
}

export const useRightClickPanel = ({containerId, onRightClick}: UseRightClickPanelProps) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition>({
    show: false,
    x: 0,
    y: 0,
    longitude: 0,
    latitude: 0
  });

  // 添加对菜单的引用
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 阻止浏览器的右键弹出列表的默认行为
    document.addEventListener(
      "contextmenu",
      function (e) {
        e.preventDefault();

      }
    );
    const container = document.getElementById(containerId);
    if (!container) return;

    // 添加 Cesium 右键事件监听
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // 添加左键点击事件监听，用于隐藏菜单
    handler.setInputAction(() => {
      setContextMenu(prev => ({...prev, show: false}));
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 右键点击事件处理
    handler.setInputAction((movement: any) => {
      // 获取 Cesium canvas 的位置信息
      const canvas = viewer.scene.canvas;
      const canvasRect = canvas.getBoundingClientRect();

      // 计算相对于 canvas 的坐标
      const x = movement.position.x;
      const y = movement.position.y;

      const cartesian = viewer.scene.pickPosition(movement.position);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);

        setContextMenu({
          show: true,
          x: x + canvasRect.left,
          y: y + canvasRect.top,
          longitude,
          latitude
        });
        onRightClick?.(movement);
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // 阻止默认右键菜单
    const preventDefault = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // 为容器添加右键事件监听
    container.addEventListener("contextmenu", preventDefault, false);
    viewer.scene.canvas.addEventListener("contextmenu", preventDefault, false);

    // 点击其他地方时隐藏菜单
    const hideMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(prev => ({...prev, show: false}));
      }
    };

    document.addEventListener("mousedown", hideMenu);

    return () => {
      handler.destroy();
      container.removeEventListener("contextmenu", preventDefault, true);
      viewer.scene.canvas.removeEventListener("contextmenu", preventDefault, true);
      document.removeEventListener("mousedown", hideMenu);
      document.removeEventListener(
        "contextmenu",
        function (e) {
          e.preventDefault();
        }
      );
    };
  }, [containerId, onRightClick]);

  // 渲染右键菜单的组件
  const RightClickPanel = ({children}: { children: React.ReactNode }) => {
    if (!contextMenu.show) return null;

    return (
      <div
        ref={menuRef}  // 添加 ref
        className={cn(
          "fixed z-100 bg-[#072E62]/90 text-white",
          "border border-[#43ABFF] rounded shadow-lg"
        )}
        style={{
          left: `${contextMenu.x}px`,
          top: `${contextMenu.y}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-2">
          {children}
        </div>
      </div>
    );
  };

  // 菜单项组件
  const MenuItem = ({
                      onClick,
                      children
                    }: {
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      className="px-4 py-2 text-left hover:bg-[#43ABFF]/20 transition-colors flex flex-col"
      onClick={() => {
        onClick();
        setContextMenu(prev => ({...prev, show: false}));
      }}
    >
      {children}
    </button>
  );

  return {
    contextMenu,
    setContextMenu,
    RightClickPanel,
    MenuItem
  };
};
