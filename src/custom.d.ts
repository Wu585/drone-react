declare interface Window {
  Cesium: any;
  bicyclesSource: any;
  regionSource: any;
  polygonSource: any;
  getPosition: () => void;
}

declare let Cesium: Window.Cesium;
declare var viewer: Window.viewer;
declare var CesiumHeatmap: Window.SuperMap3DHeatmap;
declare var SuperMap3DHeatmap: Window.SuperMap3DHeatmap;
declare var SuperMap3D: Window.SuperMap3D;

type JSONValue = string | number | boolean | null | { [k: string | number]: JSONValue } | JSONValue[]

type Resource<T> = {
  data: T
  code?: number;
  message?: string;
}

declare module 'mqtt/dist/mqtt.min' {
  import MQTT from 'mqtt'
  export = MQTT
}
