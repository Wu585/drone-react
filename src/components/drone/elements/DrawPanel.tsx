import {pickPosition} from "@/components/toolbar/tools";
import {
  ElementParam,
  generateLabelConfig,
  useAddAllElements,
  useElementActions,
  useElementsGroup
} from "@/hooks/drone/elements";
import {uuidv4} from "@/lib/utils.ts";
import {MapElementEnum} from "@/types/map.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {useCallback, useEffect, useRef} from "react";
import {clearPickPosition} from "@/components/toolbar/tools/pickPosition.ts";
import {useDrawLine} from "@/components/toolbar/tools/drawLine.ts";
import {useDrawPolygon} from "@/components/toolbar/tools/drawPolygon.ts";
import {CircleResult, useDrawCircle} from "@/components/toolbar/tools/drawCircleEle.ts";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import dayjs from "dayjs";
import * as turf from "@turf/turf";
import {Circle, DiamondIcon, Spline, Square} from "lucide-react";

interface Props {
  groupId: string;
  onSuccess?: () => void;
}

const DrawPanel = ({groupId, onSuccess}: Props) => {
  const departId = localStorage.getItem("departId");
  const {addElement} = useElementActions();
  const {data: groups} = useElementsGroup(departId ? +departId : undefined);
  // 使用 ref 来保存最新的 groupId
  const groupIdRef = useRef(groupId);
  // 更新 ref
  useEffect(() => {
    groupIdRef.current = groupId;
  }, [groupId]);

  // 清理上一次的事件监听
  useEffect(() => {
    return () => {
      clearPickPosition();
    };
  }, []);

  useAddAllElements();

  const handlePickPosition = useCallback(async ({longitude, latitude, height}: {
    longitude: number,
    latitude: number,
    height: number
  }) => {
    const id = uuidv4();
    const geojsonParam: ElementParam = {
      id,
      name: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      resource: {
        content: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude, height]
          },
          properties: {
            clampToGround: false,
            color: "#2D8CF0"
          }
        },
        type: MapElementEnum.PIN
      }
    };

    try {
      // 使用 ref 中的值而不是闭包中的 groupId
      await addElement(groupIdRef.current, geojsonParam);
      clearPickPosition();
      onSuccess?.();
    } catch (err: any) {
      toast({
        description: err.data.message || "添加失败",
        variant: "destructive"
      });
    }
  }, [addElement, onSuccess]); // 移除 groupId 依赖，因为我们使用 ref

  const onDrawPoint = useCallback(() => {
    if (!groupIdRef.current) {
      return toast({
        description: "请选择层级",
        variant: "destructive"
      });
    }
    pickPosition(handlePickPosition);
  }, [handlePickPosition]);

  const {startDraw} = useDrawLine(useCallback(async (positions) => {
    const id = uuidv4();
    const geojsonParam: ElementParam = {
      id,
      name: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      resource: {
        content: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: positions.map(pos => [pos.longitude, pos.latitude, pos.height])
          },
          properties: {
            clampToGround: false,
            color: "#2D8CF0"
          }
        },
        type: MapElementEnum.LINE
      }
    };

    try {
      await addElement(groupIdRef.current, geojsonParam);
      onSuccess?.();
    } catch (err: any) {
      toast({
        description: err.data.message || "添加失败",
        variant: "destructive"
      });
    }
  }, [addElement, onSuccess]));

  const onDrawLine = useCallback(() => {
    if (!groupIdRef.current) {
      return toast({
        description: "请选择层级",
        variant: "destructive"
      });
    }
    startDraw();
  }, [startDraw]);

  const {startDraw: startDrawPolygon} = useDrawPolygon(useCallback(async (positions) => {
    const id = uuidv4();
    const geojsonParam: ElementParam = {
      id,
      name: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      resource: {
        content: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [positions.map(pos => [pos.longitude, pos.latitude, pos.height])]
          },
          properties: {
            clampToGround: false,
            color: "#2D8CF0"
          }
        },
        type: MapElementEnum.POLY
      }
    };

    try {
      await addElement(groupIdRef.current, geojsonParam);
      onSuccess?.();
    } catch (err: any) {
      toast({
        description: err.data.message || "添加失败",
        variant: "destructive"
      });
    }
  }, [addElement, onSuccess]));

  const onDrawPolygon = useCallback(() => {
    if (!groupIdRef.current) {
      return toast({
        description: "请选择层级",
        variant: "destructive"
      });
    }
    startDrawPolygon();
  }, [startDrawPolygon]);

  const {startDraw: startDrawCircle} = useDrawCircle(useCallback(async ({center, radius}: CircleResult) => {
    const id = uuidv4();
    const geojsonParam: ElementParam = {
      id,
      name: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      resource: {
        content: {
          type: "Feature",
          geometry: {
            type: "Circle",
            coordinates: [center.longitude, center.latitude, center.height],
            radius: +radius.toFixed(2)
          },
          properties: {
            clampToGround: false,
            color: "#2D8CF0"
          }
        },
        type: MapElementEnum.CIRCLE
      }
    };
    try {
      await addElement(groupIdRef.current, geojsonParam);
      onSuccess?.();
    } catch (err: any) {
      toast({
        description: err.data.message || "添加失败",
        variant: "destructive"
      });
    }
  }, [addElement, onSuccess]));

  const onDrawCircle = () => {
    if (!groupIdRef.current) {
      return toast({
        description: "请选择层级",
        variant: "destructive"
      });
    }
    startDrawCircle();
  };

  return (
    <div className="text-white bg-[#0A81E1]/80 rounded p-2 space-y-2">
      <DiamondIcon
        className="cursor-pointer hover:bg-white/50 p-2 rounded"
        onClick={onDrawPoint}
        size={30}
      />
      <Spline
        className="cursor-pointer hover:bg-white/50 p-2 rounded"
        onClick={onDrawLine}
        size={30}
      />
      <Square
        className="cursor-pointer hover:bg-white/50 p-2 rounded"
        onClick={onDrawPolygon}
        size={30}
      />
      <Circle
        className="cursor-pointer hover:bg-white/50 p-2 rounded"
        onClick={onDrawCircle}
        size={30}
      />
    </div>
  );
};

export default DrawPanel;

