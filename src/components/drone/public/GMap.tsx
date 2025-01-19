import {useEffect} from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import {AMapConfig} from "@/constants";
import {useConnectMqtt} from "@/hooks/drone/useConnectMqtt.ts";

const GMap = () => {
  useConnectMqtt();

  useEffect(() => {
    AMapLoader.load({
      ...AMapConfig
    }).then((AMap) => {
      new AMap.Map("g-container", {
        center: [113.943225499, 22.577673716],
        zoom: 20
      });
    });
  }, []);

  return (
    <div id="g-container" className={"w-full h-full rounded-lg"}></div>
  );
};

export default GMap;

