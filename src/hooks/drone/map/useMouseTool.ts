import {useSceneStore} from "@/store/useSceneStore.ts";
import {useState} from "react";
import {EFlightAreaType} from "@/types/flight-area.ts";
import pin2d8cf0 from "@/assets/icons/pin-2d8cf0.svg";
import {MapDoodleEnum, MapDoodleType} from "@/types/map.ts";
import {toast} from "@/components/ui/use-toast";

export const useMouseTool = () => {
  const mapState = useSceneStore(state => state.mapState);
  const mouseTool = mapState.mouseTool;

  const [state, setState] = useState({
    pinNum: 0,
    polylineNum: 0,
    PolygonNum: 0,
    currentType: "",
  });

  const flightAreaColorMap = {
    [EFlightAreaType.DFENCE]: "#19be6b",
    [EFlightAreaType.NFZ]: "#ff0000",
  };

  const drawPin = (type: MapDoodleType, getDrawCallback: Function) => {
    if (!mouseTool) return;
    mouseTool.marker({
      title: type + state.pinNum,
      icon: pin2d8cf0,
    });
    setState(prev => ({
      ...prev,
      pinNum: prev.pinNum + 1
    }));
    mouseTool.on("draw", getDrawCallback);
  };

  const drawPolyline = (type: MapDoodleType, getDrawCallback: Function) => {
    if (!mouseTool) return;
    mouseTool.polyline({
      strokeColor: "#2d8cf0",
      strokeOpacity: 1,
      strokeWeight: 2,
      strokeStyle: "solid",
      title: type + state.polylineNum
    });
    setState(prev => ({
      ...prev,
      polylineNum: prev.polylineNum + 1
    }));
    mouseTool.on("draw", getDrawCallback);
  };

  const drawPolygon = (type: MapDoodleType, getDrawCallback: Function) => {
    if (!mouseTool) return;
    mouseTool.polygon({
      strokeColor: "#2d8cf0",
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: "#1791fc",
      fillOpacity: 0.4,
      title: type + state.PolygonNum
    });
    setState(prev => ({
      ...prev,
      PolygonNum: prev.PolygonNum + 1
    }));
    mouseTool.on("draw", getDrawCallback);
  };

  const drawOff = () => {
    if (!mouseTool) return;
    mouseTool.close();
    mouseTool.off("draw");
  };

  const drawFlightAreaPolygon = (type: EFlightAreaType, getDrawFlightAreaCallback: Function) => {
    if (!mouseTool) return;
    mouseTool.polygon({
      strokeColor: flightAreaColorMap[type],
      strokeOpacity: 1,
      strokeWeight: 4,
      extData: {
        type: type,
        mapType: "polygon",
      },
      strokeStyle: "dashed",
      strokeDasharray: EFlightAreaType.NFZ === type ? [10, 2] : [10, 1, 2],
      fillColor: flightAreaColorMap[type],
      fillOpacity: EFlightAreaType.NFZ === type ? 0.3 : 0,
    });
    mouseTool.on("draw", getDrawFlightAreaCallback);
  };

  const drawFlightAreaCircle = (type: EFlightAreaType, getDrawFlightAreaCallback: Function) => {
    if (!mouseTool) return;
    mouseTool.circle({
      strokeColor: flightAreaColorMap[type],
      strokeOpacity: 1,
      strokeWeight: 6,
      extData: {
        type: type,
        mapType: "circle",
      },
      strokeStyle: "dashed",
      strokeDasharray: EFlightAreaType.NFZ === type ? [10, 2] : [10, 1, 2],
      fillColor: flightAreaColorMap[type],
      fillOpacity: EFlightAreaType.NFZ === type ? 0.3 : 0,
    });
    mouseTool.on("draw", getDrawFlightAreaCallback);
  };

  const handleMouseTool = (type: MapDoodleType, getDrawCallback: Function, flightAreaType?: EFlightAreaType) => {
    setState(prev => ({
      ...prev,
      currentType: type
    }));

    if (flightAreaType) {
      switch (type) {
        case MapDoodleEnum.POLYGON:
          drawFlightAreaPolygon(flightAreaType, getDrawCallback);
          return;
        case MapDoodleEnum.CIRCLE:
          drawFlightAreaCircle(flightAreaType, getDrawCallback);
          return;
        default:
          toast({
            variant: "destructive",
            description: `Invalid type: ${flightAreaType}`
          });
          return;
      }
    }

    switch (type) {
      case MapDoodleEnum.PIN:
        drawPin(type, getDrawCallback);
        break;
      case MapDoodleEnum.POLYLINE:
        drawPolyline(type, getDrawCallback);
        break;
      case MapDoodleEnum.POLYGON:
        drawPolygon(type, getDrawCallback);
        break;
      case MapDoodleEnum.Close:
        drawOff();
        break;
    }
  };

  return {
    mouseTool: handleMouseTool
  };
};
