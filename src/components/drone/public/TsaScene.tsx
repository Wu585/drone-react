import {useCallback, useEffect, useRef} from "react";
import {findMapLayer, resetView} from "@/lib/view.ts";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import dockPng from "@/assets/images/drone/dock.png";
import dockAlternatePng from "@/assets/images/drone/docker-alternate.png";
import {EntitySize} from "@/assets/datas/enum.ts";
import {useConnectMqtt} from "@/hooks/drone/useConnectMqtt.ts";
import {
  dynamicAddSceneDroneModel,
  removeDroneModel
} from "@/hooks/drone/wayline";
import SearchPositionInput from "@/components/drone/SearchPositionInput.tsx";
import {useDeviceTopo, useWaylinJobs} from "@/hooks/drone";
import {useAddWaylineEntityById} from "@/hooks/drone/useAddWaylineEntityById.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {toast} from "@/components/ui/use-toast.ts";

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
  dockSn?: string;
  deviceSn?: string;
}

const TsaScene = ({dockSn, deviceSn}: Props) => {
  const deviceState = useSceneStore(state => state.deviceState);
  const viewerInitialized = useSceneStore(state => state.viewerInitialized);
  const setViewerInitialized = useSceneStore(state => state.setViewerInitialized);
  const addMapLayer = () => {
    mapLayerList.forEach(item => {
      const layer = new Cesium.SuperMapImageryProvider(item);
      viewer.imageryLayers.addImageryProvider(layer);
    });
  };
  // useInitialConnectWebSocket();
  useConnectMqtt();
  const realTimeDeviceInfo = useRealTimeDeviceInfo(dockSn, deviceSn);

  const {data: deviceTopo} = useDeviceTopo();

  // const [viewerInitialized, setViewerInitialized] = useState(false);

  useEffect(() => {
    window.viewer = new Cesium.Viewer("cesiumContainer", {
      shadows: true,
      infoBox: false,
      navigation: true, //指南针
      selectionIndicator: false, //绿色选择框
      requestRenderMode: false
    });

    const {scene} = viewer;

    scene.postProcessStages.fxaa.enabled = false;
    // viewer._cesiumWidget._creditContainer.style.display = "none";
    scene.globe.depthTestAgainstTerrain = false; // 图标不埋地下

    scene.shadowMap.darkness = 0.3; //设置第二重烘焙纹理的效果（明暗程度）

    scene.debugShowFramesPerSecond = false;
    scene.hdrEnabled = false;
    scene.sun.show = true;

    addMapLayer();
    // const nameMap = findMapLayer("中文注记");
    // viewer.scene.layers.raiseToTop(nameMap);
    resetView();

    const yx = findMapLayer("影像");
    yx && (yx.show = false);
    setViewerInitialized(true);

    return () => {
      setViewerInitialized(false);
      viewer.destroy();
    };
  }, []);

  useEntityCustomSource("dock");
  useEntityCustomSource("drone");
  useEntityCustomSource("drone-wayline");
  useEntityCustomSource("waylines-create");
  useEntityCustomSource("waylines-preview");

  useEffect(() => {
    if (!viewer || !deviceTopo) return;
    deviceTopo.map(device => device.device_sn).forEach(dockSn => {
      const dockInfo = deviceState.dockInfo[dockSn];
      if (dockInfo && dockInfo.basic_osd && dockInfo.basic_osd.longitude && dockInfo.basic_osd.latitude) {
        if (getCustomSource("dock")?.entities.getById(`dock-${dockSn}`)) return;
        const device = deviceTopo?.find(item => item.device_sn === dockSn);
        const nickname = device?.nickname;
        const droneNickname = device?.children?.nickname;
        getCustomSource("dock")?.entities.add({
          id: `dock-${dockSn}`,
          position: Cesium.Cartesian3.fromDegrees(dockInfo.basic_osd.longitude, dockInfo.basic_osd.latitude),
          billboard: {
            image: dockPng,
            width: EntitySize.Width,
            height: EntitySize.Height,
          },
          label: {
            text: `机场: ${nickname || "未知"} \n飞行器: ${droneNickname || "未知"}`,
            font: "14pt sans-serif",
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  // 垂直对齐：底部
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT, // 水平对齐：左对齐
            pixelOffset: new Cesium.Cartesian2(-80, -20),    // 偏移量（向下偏移 20 像素）
            fillColor: Cesium.Color.WHITE,                // 文字颜色
            backgroundColor: new Cesium.Color(0.2, 0.2, 0.2, 0.7), // 背景颜色（灰色，70% 透明度）
            padding: new Cesium.Cartesian2(10, 10),       // 内边距
            showBackground: true                          // 显示背景
          }
        });
      }
    });
  }, [deviceState, deviceTopo]);

  const handlerClickAction = useCallback(() => {
    const selectedEntity: any = viewer.selectedEntity;
    if (!selectedEntity) return;
    const dockSn = selectedEntity.id?.split("-")?.[1];
    if (!dockSn) return;
    const dockInfo = deviceState.dockInfo[dockSn];
    if (!dockInfo) return;
    const alternate_land_point = dockInfo.basic_osd?.alternate_land_point;
    if (alternate_land_point && !alternate_land_point.is_configured) {
      return toast({
        description: "请先配置备降点!",
        variant: "warning",
      });
    }
    if (getCustomSource("dock")?.entities.getById(`dock-alternate-${dockSn}`)) return;
    if (!alternate_land_point) return;
    const device = deviceTopo?.find(item => item.device_sn === dockSn);
    const nickname = device?.nickname;
    getCustomSource("dock")?.entities.add({
      id: `dock-alternate-${dockSn}`,
      // position: Cesium.Cartesian3.fromDegrees(alternate_land_point.longitude, alternate_land_point.latitude, alternate_land_point.safe_land_height),
      position: Cesium.Cartesian3.fromDegrees(alternate_land_point.longitude, alternate_land_point.latitude, 0),
      billboard: {
        image: dockAlternatePng,
        width: EntitySize.Width,
        height: EntitySize.Height,
      },
      label: {
        text: `${nickname || "未知"}备降点`,
        font: "14pt sans-serif",
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  // 垂直对齐：底部
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT, // 水平对齐：左对齐
        pixelOffset: new Cesium.Cartesian2(-50, -20),    // 偏移量（向下偏移 20 像素）
        fillColor: Cesium.Color.WHITE,                // 文字颜色
        backgroundColor: new Cesium.Color(0.2, 0.2, 0.2, 0.7), // 背景颜色（灰色，70% 透明度）
        padding: new Cesium.Cartesian2(10, 10),       // 内边距
        showBackground: true                          // 显示背景
      }
    });
  }, [deviceState, deviceTopo]);

  useEffect(() => {
    const handler: any = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(handlerClickAction, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    return () => {
      handler.destroy();
    };
  }, [handlerClickAction]);

  const dronePositionRef = useRef<{
    longitude: number,
    latitude: number,
    height: number,
    heading?: number
  }>({
    longitude: 0,
    latitude: 0,
    height: 0,
    heading: 0
  });

  useEffect(() => {
    if (realTimeDeviceInfo && realTimeDeviceInfo.device) {
      dronePositionRef.current.longitude = +realTimeDeviceInfo.device.longitude;
      dronePositionRef.current.latitude = +realTimeDeviceInfo.device.latitude;
      dronePositionRef.current.height = +realTimeDeviceInfo.device.height;
      dronePositionRef.current.heading = +realTimeDeviceInfo.device.attitude_head;
    }
  }, [realTimeDeviceInfo]);

  useEffect(() => {
    if (realTimeDeviceInfo.device && realTimeDeviceInfo.device.longitude && realTimeDeviceInfo.device.latitude && realTimeDeviceInfo.device.height) {
      if (dronePositionRef.current) {
        dynamicAddSceneDroneModel(dronePositionRef.current);
      }
    } else {
      removeDroneModel();
      // getCustomSource("waylines-preview")?.entities.removeAll();
    }
  }, [realTimeDeviceInfo]);

  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

  const {data: currentJobList} = useWaylinJobs(workspaceId, {
    page: 1,
    page_size: 10,
    status: 2,
    dock_sn: dockSn
  });

  if (!dockSn && viewerInitialized) {
    getCustomSource("waylines-preview")?.entities.removeAll();
  }

  useAddWaylineEntityById(currentJobList?.list?.[0]?.file_id, viewerInitialized, dockSn, deviceSn);

  useEffect(() => {
    return () => {
      setViewerInitialized(false);
    };
  }, [setViewerInitialized]);

  return (
    <div id="cesiumContainer" className={"h-full relative"}>
      <div className={"absolute right-32 top-8 w-64 z-50"}>
        <SearchPositionInput/>
      </div>
    </div>
  );
};

export default TsaScene;

