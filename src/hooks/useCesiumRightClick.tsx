import {useCallback, useEffect, useState} from "react";
import {createPortal} from "react-dom";

interface Position {
  x: number;
  y: number;
}

interface UseCesiumRightClickOptions {
  viewerId?: string;
  onSelect?: (position: Cesium.Cartesian3) => void;
}

export function useCesiumRightClick({viewerId = "cesiumContainer", onSelect}: UseCesiumRightClickOptions = {}) {
  const [menuPosition, setMenuPosition] = useState<Position | null>(null);
  const [clickPosition, setClickPosition] = useState<Cesium.Cartesian3 | null>(null);

  // 处理右键点击
  const handleRightClick = useCallback((event: any) => {
    event.preventDefault();
    
    const viewer = window.viewer;
    if (!viewer) return;

    // 获取点击位置的笛卡尔坐标
    const position = viewer.scene.pickPosition(event.position);
    if (position) {
      setClickPosition(position);
      // 设置菜单显示位置
      setMenuPosition({
        x: event.position.x,
        y: event.position.y
      });
    }
  }, []);

  // 处理其他区域点击，关闭菜单
  const handleOutsideClick = useCallback(() => {
    setMenuPosition(null);
  }, []);

  // 添加事件监听
  useEffect(() => {
    const viewer = window.viewer;
    if (!viewer) return;

    // 添加右键事件监听
    viewer.screenSpaceEventHandler.setInputAction(
      handleRightClick,
      Cesium.ScreenSpaceEventType.RIGHT_CLICK
    );

    // 添加左键点击事件监听，用于关闭菜单
    viewer.screenSpaceEventHandler.setInputAction(
      handleOutsideClick,
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );

    return () => {
      // 清理事件监听
      if (viewer.screenSpaceEventHandler) {
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }
    };
  }, [handleRightClick, handleOutsideClick]);

  // 创建菜单组件
  const RightClickMenu = useCallback(({children}: {children: React.ReactNode}) => {
    if (!menuPosition) return null;

    return createPortal(
      <div
        style={{
          position: 'fixed',
          left: menuPosition.x,
          top: menuPosition.y,
          zIndex: 1000,
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: '4px 0'
        }}
        onClick={() => {
          if (clickPosition && onSelect) {
            onSelect(clickPosition);
          }
          setMenuPosition(null);
        }}
      >
        {children}
      </div>,
      document.body
    );
  }, [menuPosition, clickPosition, onSelect]);

  // 创建菜单项组件
  const MenuItem = useCallback(({children, onClick}: {children: React.ReactNode, onClick?: () => void}) => {
    return (
      <div
        style={{
          padding: '4px 12px',
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
        className="hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) {
            onClick();
          }
          setMenuPosition(null);
        }}
      >
        {children}
      </div>
    );
  }, []);

  return {
    RightClickMenu,
    MenuItem,
    menuPosition,
    clickPosition
  };
} 