import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {EFlightAreaType, EGeometryType, FlightAreaTypeTitleMap} from "@/types/flight-area.ts";
import {cn} from "@/lib/utils.ts";
import {MapDoodleEnum, MapDoodleType} from "@/types/map.ts";
import {useMouseTool} from "@/hooks/drone/map/useMouseTool.ts";
import {useFlightArea} from "@/hooks/drone/map/useFlightArea.ts";
import {useCallback, useEffect, useState} from "react";
import {X} from "lucide-react";

const actionList = [
  {
    type: EFlightAreaType.DFENCE,
    isCircle: true,
    name: "圆形作业区"
  },
  {
    type: EFlightAreaType.DFENCE,
    isCircle: false,
  },
  {
    type: EFlightAreaType.NFZ,
    isCircle: true,
  },
  {
    type: EFlightAreaType.NFZ,
    isCircle: false,
  }
];


const DrawPanel = () => {
  const useMouseToolHook = useMouseTool();
  const [mouseMode, setMouseMode] = useState(false);
  const [state, setState] = useState({
    currentType: "",
    coverIndex: 0,
    isFlightArea: false,
  });

  const {getDrawFlightAreaCallback} = useFlightArea();

  function getDrawCallback(isFlightArea: boolean) {
    return ({obj}: { obj: any }) => {
      console.log("obj", obj);
      if (isFlightArea) {
        getDrawFlightAreaCallback(obj);
        return;
      }
    };
  }

  const draw = (type: MapDoodleType, bool: boolean, flightAreaType?: EFlightAreaType) => {
    const isFlightArea = !!flightAreaType;
    setState({
      ...state,
      currentType: type,
      isFlightArea
    });
    setMouseMode(bool);
    useMouseToolHook.mouseTool(type, getDrawCallback(isFlightArea), flightAreaType);
  };

  const onSelectFlightArea = ({type, isCircle}: { type: EFlightAreaType, isCircle: boolean }) => {
    draw(isCircle ? MapDoodleEnum.CIRCLE : MapDoodleEnum.POLYGON, true, type);
  };
  return (
    <div className={"text-black flex flex-col space-y-4"}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className={"w-[16px] h-[16px] rounded-full border-[3px] border-green-500"}></div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="space-y-[8px] text-[14px] p-4">
          {actionList.map(item =>
            <div
              onClick={() => onSelectFlightArea(item)}
              className={"flex items-center space-x-[8px] whitespace-nowrap cursor-pointer hover:bg-gray-500/[.3]"}>
              <div
                className={cn("w-[16px] h-[16px]  border-[3px]",
                  item.isCircle ? "rounded-full" : "",
                  item.type === EFlightAreaType.DFENCE ? "border-green-500" : "border-red-500")}>
              </div>
              <div>
                {FlightAreaTypeTitleMap[item.type][item.isCircle ? EGeometryType.CIRCLE : EGeometryType.POLYGON]}
              </div>
            </div>)}
        </DropdownMenuContent>
      </DropdownMenu>
      <X onClick={() => draw("off", false)} className={"cursor-pointer"} color={"#EF4444"} size={18}/>
    </div>
  );
};

export default DrawPanel;

