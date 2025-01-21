import {useSceneStore} from "@/store/useSceneStore.ts";
import dockIcon from "@/assets/images/drone/dock.png";
import droneIcon from "@/assets/images/drone/drone.png";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import {useRef} from "react";
import {useAjax} from "@/lib/http.ts";
import {ELocalStorageKey} from "@/types/enum.ts";

const HTTP_PREFIX = "/manage/api/v1";

export const useDeviceTsaUpdate = () => {
  const mapState = useSceneStore(state => state.mapState);
  const AMap = mapState.aMap;
  const markerInfo = useSceneStore(state => state.markerInfo);
  const setMarkerInfoCoverMap = useSceneStore(state => state.setMarkerInfoCoverMap);
  const deleteMarkerInfoCoverMap = useSceneStore(state => state.deleteMarkerInfoCoverMap);
  const deleteMarkerInfoPathMap = useSceneStore(state => state.deleteMarkerInfoPathMap);
  const {get} = useAjax();

  const icons = new Map([
    [EDeviceTypeName.Aircraft, droneIcon],
    [EDeviceTypeName.Dock, dockIcon]
  ]);

  const markers = markerInfo.coverMap;

  const trackLineRef = useRef<any>(null);

  const getTrackLineInstance = () => {
    if (!trackLineRef.current) {
      trackLineRef.current = new AMap.Polyline({
        map: mapState.map,
        strokeColor: "#939393" // 线颜色
      });
    }
    return trackLineRef.current;
  };

  function initIcon(type: number) {
    return new AMap.Icon({
      image: icons.get(type),
      imageSize: new AMap.Size(40, 40),
      size: new AMap.Size(40, 40)
    });
  }

  function initMarker(type: number, name: string, sn: string, lng?: number, lat?: number) {
    if (markers[sn]) {
      return;
    }
    if (!AMap) {
      return;
    }

    const marker = new AMap.Marker({
      position: new AMap.LngLat(lng || 113.943225499, lat || 22.577673716),
      icon: initIcon(type),
      title: name,
      anchor: "top-center",
      offset: [0, -20],
    });

    setMarkerInfoCoverMap(sn, marker);
    mapState.map.add(marker);
  }

  const removeMarker = (sn: string) => {
    if (!markers[sn]) {
      return;
    }
    mapState.map.remove(markers[sn]);
    getTrackLineInstance().setPath([]);
    deleteMarkerInfoCoverMap(sn);
    deleteMarkerInfoPathMap(sn);
  };

  const addMarker = (sn: string, lng?: number, lat?: number) => {
    const workspace_id = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
    const url = `${HTTP_PREFIX}/devices/${workspace_id}/devices/${sn}`;
    get(url).then((res: any) => {
      console.log("res");
      console.log(res);
      initMarker(res.data.domain, res.data.nickname, sn, lng, lat);
    });
  };

  const moveTo = (sn: string, lng: number, lat: number) => {
    const marker = markers[sn];
    if (!marker) {
      addMarker(sn, lng, lat);
      return;
    }
    marker.moveTo([lng, lat], {
      duration: 1800,
      autoRotation: true
    });
  };

  return {
    marker: markers,
    initMarker,
    removeMarker,
    moveTo
  };
};
