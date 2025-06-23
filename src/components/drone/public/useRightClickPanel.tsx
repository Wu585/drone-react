import {useEffect, useState, useRef, memo, useMemo, useCallback} from "react";
import {cn} from "@/lib/utils.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";

interface ContextMenuPosition {
  show: boolean;
  x: number;
  y: number;
  longitude: number;
  latitude: number;
}

interface UseRightClickPanelProps {
  containerId: string;
  onRightClick?: (movement: any) => void;
}

// Move MenuItem component outside the hook for better memoization
const MenuItem = memo(({
                         onClick,
                         children
                       }: {
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    className="px-4 py-2 text-left hover:bg-[#43ABFF]/20 transition-colors flex flex-col"
    onClick={onClick}
  >
    {children}
  </button>
));

export const useRightClickPanel = ({containerId, onRightClick}: UseRightClickPanelProps) => {
  const viewerInitialized = useSceneStore(state => state.viewerInitialized);

  const [contextMenu, setContextMenu] = useState<ContextMenuPosition>({
    show: false,
    x: 0,
    y: 0,
    longitude: 0,
    latitude: 0
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Memoized handler for hiding the menu
  const hideMenu = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setContextMenu(prev => ({...prev, show: false}));
    }
  }, []);

  // Memoized handler for right click
  const handleRightClick = useCallback((movement: any) => {
    if (!viewerInitialized) return;
    const canvas = viewer.scene.canvas;
    const canvasRect = canvas.getBoundingClientRect();
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
  }, [onRightClick, viewerInitialized]);

  useEffect(() => {
    if (!viewerInitialized) return;

    // Prevent default context menu behavior
    const preventDefault = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("contextmenu", preventDefault);

    const container = document.getElementById(containerId);
    if (!container) return;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction(() => {
      setContextMenu(prev => ({...prev, show: false}));
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(handleRightClick, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    container.addEventListener("contextmenu", preventDefault);
    viewer.scene.canvas.addEventListener("contextmenu", preventDefault);
    document.addEventListener("mousedown", hideMenu);

    return () => {
      handler.destroy();
      container.removeEventListener("contextmenu", preventDefault);
      viewer.scene.canvas.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("mousedown", hideMenu);
      document.removeEventListener("contextmenu", preventDefault);
    };
  }, [containerId, handleRightClick, hideMenu, viewerInitialized]);

  // Memoized RightClickPanel component
  const RightClickPanel = useMemo(() => memo(({children}: { children: React.ReactNode }) => {
    if (!contextMenu.show) return null;
    console.log('contextMenu==');
    console.log(contextMenu);
    return (
      <div
        ref={menuRef}
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
  }), [contextMenu.show, contextMenu.x, contextMenu.y]);

  // Memoized MenuItem with proper click handling
  const MemoizedMenuItem = useMemo(() => (props: {
    onClick: () => void;
    children: React.ReactNode;
  }) => {
    const handleClick = () => {
      props.onClick();
      setContextMenu(prev => ({...prev, show: false}));
    };

    return <MenuItem onClick={handleClick}>{props.children}</MenuItem>;
  }, []);

  // Return memoized values
  return useMemo(() => ({
    contextMenu,
    setContextMenu,
    RightClickPanel,
    MenuItem: MemoizedMenuItem
  }), [contextMenu, RightClickPanel, MemoizedMenuItem]);
};
