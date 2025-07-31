import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {EFlightAreaType, EGeometryType, FlightAreaTypeTitleMap} from "@/types/flight-area.ts";
import {cn, uuidv4} from "@/lib/utils.ts";
import {useCallback, useRef} from "react";
import {X} from "lucide-react";
import {CircleResult, useDrawCircle} from "@/components/toolbar/tools/drawCircleEle.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import dayjs from "dayjs";
import {DATE_FORMAT} from "@/constants";
import {useDrawPolygon} from "@/components/toolbar/tools/drawPolygon.ts";
import {useFlightAreas} from "@/hooks/drone";

const MAP_API_PREFIX = "/map/api/v1";

interface FlightAreaType {
  type: EFlightAreaType;
  isCircle: boolean;
  name: string;
}

const actionList: FlightAreaType[] = [
  {
    type: EFlightAreaType.DFENCE,
    isCircle: true,
    name: "圆形作业区"
  },
  {
    type: EFlightAreaType.DFENCE,
    isCircle: false,
    name: "多边形作业区"
  },
  {
    type: EFlightAreaType.NFZ,
    isCircle: true,
    name: "圆形禁飞区"
  },
  {
    type: EFlightAreaType.NFZ,
    isCircle: false,
    name: "多边形禁飞区"
  }
];

const DrawPanel = () => {
  const workspaceId: string = localStorage.getItem(ELocalStorageKey.WorkspaceId) || "";
  const {mutate} = useFlightAreas(workspaceId);
  const {post} = useAjax();
  const selectedTypeRef = useRef<FlightAreaType | null>(null);

  const drawCircleCallback = useCallback(async ({center, radius}: CircleResult) => {
    if (!selectedTypeRef.current) return;
    console.log(center);
    try {
      await post(`${MAP_API_PREFIX}/workspaces/${workspaceId}/flight-area`, {
        id: uuidv4(),
        name: `${selectedTypeRef.current.type}-${dayjs().format(DATE_FORMAT)}`,
        type: selectedTypeRef.current.type,
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
      await mutate();
    } catch (error) {
      toast({
        description: "自定义飞行区域创建失败！",
        variant: "destructive",
      });
    }
  }, [workspaceId]);

  const drawPolygonCallback = useCallback(async (positions: {
    longitude: number
    latitude: number
    height: number
  }[]) => {
    if (!selectedTypeRef.current) return;
    const coordinates = [positions.map(item => [item.longitude, item.latitude])];
    try {
      await post(`${MAP_API_PREFIX}/workspaces/${workspaceId}/flight-area`, {
        id: uuidv4(),
        name: `${selectedTypeRef.current.type}-${dayjs().format(DATE_FORMAT)}`,
        type: selectedTypeRef.current.type,
        content: {
          type: "Feature",
          properties: {
            color: "#2D8CF0"
          },
          geometry: {
            type: "Polygon",
            coordinates
          },
        }
      });
      await mutate();
    } catch (error) {
      toast({
        description: "自定义飞行区域创建失败！",
        variant: "destructive",
      });
    }
  }, [workspaceId]);

  const {startDraw: startDrawCircle, clearDraw: clearDrawCircle} = useDrawCircle(drawCircleCallback);

  const {startDraw: startDrawPolygon, clearDraw: clearDrawPolygon} = useDrawPolygon(drawPolygonCallback);

  const clear = () => {
    clearDrawCircle();
    clearDrawPolygon();
    selectedTypeRef.current = null;
  };

  const onSelectFlightArea = (item: FlightAreaType) => {
    const {isCircle} = item;
    selectedTypeRef.current = item;
    if (isCircle) {
      startDrawCircle();
    } else {
      startDrawPolygon();
    }
  };

  return (
    <div className={"text-black flex flex-col space-y-4"}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className={"w-[16px] h-[16px] rounded-full border-[3px] border-green-500"}></div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="text-[14px] py-4">
          {actionList.map(item =>
            <div
              onClick={() => onSelectFlightArea(item)}
              className={"flex items-center space-x-[8px] whitespace-nowrap cursor-pointer hover:bg-gray-500/[.3] px-4 py-2"}>
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

