import {RefObject, useCallback, useEffect, useRef} from "react";
import {getSelectedEntity} from "@/lib/entity.ts";
import {getImageUrl} from "@/lib/utils.ts";

export const useAddLeftClickListener = (panelRef: RefObject<HTMLDivElement>, fn?: (description: any) => void, isSetBubblePosition = true) => {
  const scenePosition = useRef(null);
  const handler = useRef<any>(null);

  // Define setBubblePosition and movementHandler outside useEffect
  const setBubblePosition = useCallback(() => {
    if (scenePosition.current) {
      const windowPosition = new Cesium.Cartesian2();
      Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, scenePosition.current, windowPosition);
      if (panelRef.current) {
        panelRef.current.style.top = windowPosition.y + "px";
        panelRef.current.style.left = windowPosition.x + "px";
      }
    }
  }, []);

  const movementHandler = useCallback((movement: any) => {
    const pick = viewer.scene.pick(movement.position);

    if (pick && pick.id && pick.id._description) {
      const description = JSON.parse(pick.id._description) as any;
      scenePosition.current = viewer.scene.pickPosition(movement.position);
      fn?.(description);
    }
  }, []);

  useEffect(() => {
    handler.current = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.current.setInputAction(movementHandler, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    isSetBubblePosition && viewer.scene.postRender.addEventListener(setBubblePosition);

    return () => {
      if (handler.current) {
        handler.current.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }
      isSetBubblePosition && viewer.scene.postRender.removeEventListener(setBubblePosition);
    };
  }, [movementHandler, setBubblePosition]);

  const removeListener = () => {
    if (handler.current) {
      handler.current.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    isSetBubblePosition && viewer.scene.postRender.removeEventListener(setBubblePosition);
  };

  const addListener = () => {
    if (handler.current) {
      handler.current.setInputAction(movementHandler, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    isSetBubblePosition && viewer.scene.postRender.addEventListener(setBubblePosition);
  };

  return {
    removeListener,
    addListener,
  };
};

export const useChangeSelectedEntityImage = (sourceName: string, ...imageTypeName: string[]) => {
  const lastSelectedEntity = useRef<any>(null);

  const recoverSelectedEntityImage = () => {
    if (lastSelectedEntity.current && imageTypeName.some(name => lastSelectedEntity.current.billboard.image._value.indexOf(name) >= 0)) {
      const name = imageTypeName.find(item => lastSelectedEntity.current.billboard.image._value.indexOf(item) >= 0);
      if (name) {
        lastSelectedEntity.current.billboard.image._value = getImageUrl(name);
        if (lastSelectedEntity.current.polyline && lastSelectedEntity.current.polyline.material) {
          lastSelectedEntity.current.polyline.material.color = new Cesium.Color.fromCssColorString("rgba(61, 170, 255)");
        }
        lastSelectedEntity.current = null;
      }
    }
  };

  const changeSelectedEntityImage = (id: string) => {
    recoverSelectedEntityImage();

    const selectedEntity = getSelectedEntity(sourceName, id);

    if (!selectedEntity) {
      console.error("Selected entity is undefined");
      return;
    }

    lastSelectedEntity.current = selectedEntity;
    if (selectedEntity && imageTypeName.some(name => selectedEntity?.billboard?.image._value?.indexOf(name) >= 0)) {
      const name = imageTypeName.find(item => selectedEntity?.billboard?.image?._value?.indexOf(item) >= 0);
      if (name) {
        selectedEntity.billboard.image._value = getImageUrl(`${name}_active`);
        if (selectedEntity.polyline && selectedEntity.polyline.material) {
          selectedEntity.polyline.material.color = new Cesium.Color.fromCssColorString("rgba(255, 128, 0,0.8)");
        }
      }
    }
  };

  return {lastSelectedEntity, changeSelectedEntityImage, recoverSelectedEntityImage};
};
