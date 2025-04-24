import {useEffect} from "react";
import {findMapLayer} from "@/lib/view.ts";

const mapLayerList = [
  {
    url: "http://36.139.117.52:8090/iserver/services/map-tianditu/rest/maps/Vector%20Base%20Map%20_%20Longitude%20and%20Latitude",
    name: "矢量图"
  },
  {
    url: "http://36.139.117.52:8090/iserver/services/map-tianditu/rest/maps/Vector%20Chinese%20Notes%20_%20Longitude%20and%20Latitude",
    name: "中文注记"
  },
  {
    url: "http://36.139.117.52:8090/iserver/services/map-tianditu/rest/maps/Image%20Base%20Map%20_%20Longitude%20and%20Latitude",
    name: "影像"
  }
];

interface Props {
  initialPosition: {
    longitude: number
    latitude: number
    height: number
  };
  onCameraChange?: (direction: any) => void;
  hp?: {
    heading: number
    pitch: number
  };
  onChangeHp?: (hp: Props["hp"]) => void;
}

const SceneMini = ({initialPosition, onCameraChange, hp, onChangeHp}: Props) => {
  useEffect(() => {
    window.viewer2 = new Cesium.Viewer("cesiumContainerMini", {
      shadows: false,
      infoBox: false,
      navigation: false,
      selectionIndicator: false,
    });

    const {scene} = viewer2;
    scene.fxaa = false;
    scene.postProcessStages.fxaa.enabled = false;
    scene.globe.depthTestAgainstTerrain = false;
    scene.shadowMap.darkness = 0.3;
    scene.debugShowFramesPerSecond = false;
    scene.hdrEnabled = false;
    scene.sun.show = true;

    // 添加地图图层
    mapLayerList.forEach(item => {
      const layer = new Cesium.SuperMapImageryProvider(item);
      viewer2.imageryLayers.addImageryProvider(layer);
    });

    // 禁用鼠标控制
    viewer2.scene.screenSpaceCameraController.tiltEventTypes = [];
    viewer2.scene.screenSpaceCameraController.enableRotate = false;
    viewer2.scene.screenSpaceCameraController.enableTranslate = false;
    viewer2.scene.screenSpaceCameraController.enableZoom = false;
    viewer2.scene.screenSpaceCameraController.enableTilt = false;

    // 隐藏影像图层
    const yx = findMapLayer("影像", viewer2);
    yx && (yx.show = false);

    /*// 清理函数
    return () => {
      if (viewer2) {
        viewer2.destroy();
        delete window.viewer2;
      }
    };*/
  }, []);

  useEffect(() => {
    if (!viewer2) return;

    const {longitude, latitude, height} = initialPosition;
    const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
    viewer2.camera.flyTo({
      destination: topPosition,
      duration: 0,
      orientation: {
        heading: hp?.heading || 0,
        pitch: hp?.pitch || 0,
        roll: 0
      }
    });
  }, [initialPosition, hp]);

  useEffect(() => {
    if (!viewer2) return;

    const cameraChangeListener = () => {
      onCameraChange?.(viewer2.camera.direction);
      onChangeHp?.({
        heading: viewer2.camera.heading,
        pitch: viewer2.camera.pitch,
      });
    };

    viewer2.camera.changed.addEventListener(cameraChangeListener);

    return () => {
      viewer2.camera.changed.removeEventListener(cameraChangeListener);
    };
  }, [onCameraChange, onChangeHp]);

  useEffect(() => {
    if (!viewer2) return;

    const {longitude, latitude, height} = initialPosition;
    const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
    const handler = new Cesium.ScreenSpaceEventHandler(viewer2.scene.canvas);
    let moving = false;

    handler.setInputAction((movement: any) => {
      if (!moving) return;
      const {startPosition, endPosition} = movement;
      const xdt = (endPosition.x - startPosition.x) * 0.02;
      const ydt = (endPosition.y - startPosition.y) * 0.02;

      viewer2.camera.flyTo({
        destination: topPosition,
        duration: 0,
        orientation: {
          heading: viewer2.camera.heading + xdt,
          pitch: viewer2.camera.pitch - ydt,
          roll: viewer2.camera.roll
        }
      });
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(() => {
      moving = true;
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    handler.setInputAction(() => {
      moving = false;
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    return () => {
      handler.destroy();
    };
  }, [initialPosition]);

  useEffect(() => {
    return () => {
      if (viewer2) {
        viewer2.destroy();
        delete window.viewer2;
      }
    };
  }, []);

  return (
    <div className="relative h-full">
      <div id="cesiumContainerMini" className="h-full rounded-lg border-[1px] border-white"></div>

      {/* 红色边框角 */}
      <div
        className="absolute w-[100px] h-[80px] z-[2] left-[60px] top-[40px] border-t-2 border-l-2 border-red-500 pointer-events-none"></div>
      <div
        className="absolute w-[100px] h-[80px] z-[2] right-[60px] top-[40px] border-t-2 border-r-2 border-red-500 pointer-events-none"></div>
      <div
        className="absolute w-[100px] h-[80px] z-[2] right-[60px] bottom-[40px] border-b-2 border-r-2 border-red-500 pointer-events-none"></div>
      <div
        className="absolute w-[100px] h-[80px] z-[2] left-[60px] bottom-[40px] border-b-2 border-l-2 border-red-500 pointer-events-none"></div>

      {/* 绿色边框角 */}
      <div
        className="absolute w-[50px] h-[40px] z-[2] left-[120px] top-[100px] border-t-2 border-l-2 border-green-500 pointer-events-none"></div>
      <div
        className="absolute w-[50px] h-[40px] z-[2] right-[120px] top-[100px] border-t-2 border-r-2 border-green-500 pointer-events-none"></div>
      <div
        className="absolute w-[50px] h-[40px] z-[2] right-[120px] bottom-[100px] border-b-2 border-r-2 border-green-500 pointer-events-none"></div>
      <div
        className="absolute w-[50px] h-[40px] z-[2] left-[120px] bottom-[100px] border-b-2 border-l-2 border-green-500 pointer-events-none"></div>
    </div>
  );
};

export default SceneMini;

