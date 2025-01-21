import {useSceneStore} from "@/store/useSceneStore.ts";
import {useCallback, useEffect} from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import {AMapConfig} from "@/constants";

export const useGMapManage = (container: string) => {
  const setMapState = useSceneStore(state => state.setMapState);

  const initMap = useCallback(() => {
    AMapLoader.load({
      ...AMapConfig
    }).then((AMap) => {
      const map = new AMap.Map(container, {
        center: [121.44556, 30.891961],
        zoom: 20
      });

      setMapState({
        aMap: AMap,
        map,
        mouseTool: new AMap.MouseTool(map)
      });
    });
  }, [container, setMapState]);

  useEffect(() => {
    initMap();
  }, [initMap]);
};
