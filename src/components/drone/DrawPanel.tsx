import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {EFlightAreaType, EGeometryType, FlightAreaTypeTitleMap} from "@/types/flight-area.ts";
import {cn, geographic2Coordinate, uuidv4} from "@/lib/utils.ts";
import {MapDoodleEnum, MapDoodleType} from "@/types/map.ts";
import {useMouseTool} from "@/hooks/drone/map/useMouseTool.ts";
import {useFlightArea} from "@/hooks/drone/map/useFlightArea.ts";
import {useCallback, useEffect, useState} from "react";
import {X} from "lucide-react";
import {CircleResult, useDrawCircle} from "@/components/toolbar/tools/drawCircleEle.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import dayjs from "dayjs";
import {DATE_FORMAT} from "@/constants";

const MAP_API_PREFIX = "/map/api/v1";

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
  const workspaceId: string = localStorage.getItem(ELocalStorageKey.WorkspaceId) || "";
  const {post} = useAjax();
  const {startDraw: startDrawCircle, clearDraw: clearDrawCircle} =
    useDrawCircle(async ({center, radius}: CircleResult) => {
      console.log(center);
      try {
        await post(`${MAP_API_PREFIX}/workspaces/${workspaceId}/flight-area`, {
          id: uuidv4(),
          name: `dfence-${dayjs().format(DATE_FORMAT)}`,
          type: "dfence",
          content: {
            type: "Feature",
            properties: {
              color: "#2D8CF0"
            },
            geometry: {
              type: "Circle",
              coordinates: [center.longitude, center.latitude],
              radius: radius,
            },
          }
        });
      } catch (error) {
        toast({
          description: "自定义飞行区域创建失败！",
          variant: "destructive",
        });
      }
    });

  const clear = () => {
    clearDrawCircle();
  };

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
    // draw(isCircle ? MapDoodleEnum.CIRCLE : MapDoodleEnum.POLYGON, true, type);
    if (isCircle) {
      startDrawCircle();
    }
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
      <X onClick={() => clear()} className={"cursor-pointer"} color={"#EF4444"} size={18}/>
    </div>
  );
};

export default DrawPanel;

