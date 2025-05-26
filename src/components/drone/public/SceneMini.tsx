import {useEffect, useMemo, useState} from "react";
import {findMapLayer} from "@/lib/view.ts";
import {Slider} from "@/components/ui/slider.tsx";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import {Bold, Italic, Underline} from "lucide-react";

const mapLayerList = [
  {
    url: "http://36.139.117.52:8090/iserver/services/map-tianditu/rest/maps/Vector%20Base%20Map%20_%20Longitude%20and%20Latitude",
    name: "矢量图"
  },
  {
    url: "http://36.139.117.52:8090/iserver/services/map-tianditu/rest/maps/Image%20Base%20Map%20_%20Longitude%20and%20Latitude",
    name: "影像"
  },
  {
    url: "http://36.139.117.52:8090/iserver/services/map-tianditu/rest/maps/Vector%20Chinese%20Notes%20_%20Longitude%20and%20Latitude",
    name: "中文注记"
  },
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
  onZoomChange?: (value: number) => void;
  onChangeMode?: (mode: string) => void;
}

const SceneMini = ({initialPosition, onCameraChange, hp, onChangeHp, onZoomChange, onChangeMode}: Props) => {
  const [zoomValue, setZoomValue] = useState(5);

  // 计算绿色边框样式
  const greenBorderStyle = useMemo(() => {
    // 宽度映射: zoom 5->20 映射到 width 20->5
    const width = -1 * zoomValue + 25;

    // 位置映射: zoom 5->20 映射到 position 140->170
    // m = (y2-y1)/(x2-x1) = (170-140)/(20-5) = 2
    // b = y1 - mx1 = 140 - (2 * 5) = 130
    const position = 2 * zoomValue + 130;

    return {
      width: `${width}px`,
      height: `${width}px`,
      position: `${position}px`,
    };
  }, [zoomValue]);

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

  const _onZoomChange = (value: number[]) => {
    setZoomValue(value[0]);
    onZoomChange?.(value[0]);
  };

  const _onChangeMode = (value: string) => {
    onChangeMode?.(value);
  };

  return (
    <div className="relative h-full">
      <div id="cesiumContainerMini" className="h-full border-[1px] border-white"></div>

      {/* 红色边框角 - 固定大小和位置 */}
      <div
        className="absolute w-[100px] h-[80px] z-[2] left-[60px] top-[40px] border-t-2 border-l-2 border-red-500 pointer-events-none"/>
      <div
        className="absolute w-[100px] h-[80px] z-[2] right-[60px] top-[40px] border-t-2 border-r-2 border-red-500 pointer-events-none"/>
      <div
        className="absolute w-[100px] h-[80px] z-[2] right-[60px] bottom-[40px] border-b-2 border-r-2 border-red-500 pointer-events-none"/>
      <div
        className="absolute w-[100px] h-[80px] z-[2] left-[60px] bottom-[40px] border-b-2 border-l-2 border-red-500 pointer-events-none"/>

      {/* 绿色边框角 - 动态大小和位置 */}
      <div
        className="absolute z-[2] border-t-2 border-l-2 border-green-500 pointer-events-none"
        style={{
          width: greenBorderStyle.width,
          height: greenBorderStyle.height,
          left: greenBorderStyle.position,
          top: `${parseInt(greenBorderStyle.position) - 25}px`,
        }}
      />
      <div
        className="absolute z-[2] border-t-2 border-r-2 border-green-500 pointer-events-none"
        style={{
          width: greenBorderStyle.width,
          height: greenBorderStyle.height,
          right: greenBorderStyle.position,
          top: `${parseInt(greenBorderStyle.position) - 25}px`,
        }}
      />
      <div
        className="absolute z-[2] border-b-2 border-r-2 border-green-500 pointer-events-none"
        style={{
          width: greenBorderStyle.width,
          height: greenBorderStyle.height,
          right: greenBorderStyle.position,
          bottom: `${parseInt(greenBorderStyle.position) - 25}px`,
        }}
      />
      <div
        className="absolute z-[2] border-b-2 border-l-2 border-green-500 pointer-events-none"
        style={{
          width: greenBorderStyle.width,
          height: greenBorderStyle.height,
          left: greenBorderStyle.position,
          bottom: `${parseInt(greenBorderStyle.position) - 25}px`,
        }}
      />

      {/*<ToggleGroup className={"absolute left-1/2 -translate-x-1/2 top-2 bg-gray-500"}
                   type="single"
                   onValueChange={_onChangeMode}
                   defaultValue={"wide"}
      >
        <ToggleGroupItem value="wide" aria-label="Toggle bold">
          广角
        </ToggleGroupItem>
        <ToggleGroupItem value="zoom" aria-label="Toggle italic">
          变焦
        </ToggleGroupItem>
      </ToggleGroup>*/}

      {/*<Slider
        onValueChange={_onZoomChange}
        min={5}
        max={20}
        defaultValue={[5]}
        orientation={"vertical"}
        className={"absolute right-4 top-12 border-2 h-[200px] w-[12px] bg-gray-500 border-none rounded-lg"}
      />*/}
    </div>
  );
};

export default SceneMini;

