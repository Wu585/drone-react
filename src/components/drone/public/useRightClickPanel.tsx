import {useEffect, useState} from "react";
import {cn} from "@/lib/utils.ts";

interface ContextMenuPosition {
  show: boolean;
  x: number;
  y: number;
}

interface UseRightClickPanelProps {
  containerId: string;  // 容器元素的 ID
  onRightClick?: (movement: any) => void;  // 右键点击的回调
}

export const useRightClickPanel = ({containerId, onRightClick}: UseRightClickPanelProps) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition>({
    show: false,
    x: 0,
    y: 0
  });

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 添加 Cesium 右键事件监听
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: any) => {
      setContextMenu({
        show: true,
        x: movement.position.x,
        y: movement.position.y
      });
      onRightClick?.(movement);
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // 阻止默认右键菜单
    const preventDefault = (e: Event) => e.preventDefault();
    container.addEventListener('contextmenu', preventDefault);

    // 点击其他地方时隐藏菜单
    const hideMenu = () => {
      setContextMenu(prev => ({...prev, show: false}));
    };
    document.addEventListener('click', hideMenu);

    return () => {
      handler.destroy();
      container.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('click', hideMenu);
    };
  }, [containerId, onRightClick]);

  // 渲染右键菜单的组件
  const RightClickPanel = ({children}: {children: React.ReactNode}) => {
    if (!contextMenu.show) return null;

    return (
      <div
        className={cn(
          "absolute z-50 bg-[#072E62]/90 text-white",
          "border border-[#43ABFF] rounded shadow-lg"
        )}
        style={{
          left: `${contextMenu.x}px`,
          top: `${contextMenu.y}px`,
        }}
        onClick={(e) => e.stopPropagation()} // 防止点击菜单时被隐藏
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
      className="w-full px-4 py-2 text-left hover:bg-[#43ABFF]/20 transition-colors"
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
