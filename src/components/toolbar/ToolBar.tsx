import {ReactElement, useState} from "react";
import {getImageUrl} from "@/lib/utils.ts";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import * as tools from "./tools/index.ts";
import {clearAll} from "./tools/index.ts";
import {BicyclesInfo, useBicycleAllInfo} from "@/hooks/bicycles/api.ts";
import ViewManage from "@/components/toolbar/ViewManage.tsx";
import {useVisible} from "@/hooks/public/utils.ts";
import {Portal} from "react-portal";
import DetailPanelLayout from "@/components/public/DetailPanelLayout.tsx";
import CommonTable from "@/components/public/CommonTable.tsx";
import {BicycleRideStateMap, BicycleTypeMap, BikeStatusMap} from "@/assets/datas/enum.ts";
import {findMapLayer, findS3mLayer} from "@/lib/view.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {drawCircle} from "@/components/toolbar/tools/drawCircle.ts";

const toolMap = {
  "swmx": "三维模型",
  "tcgl": "影像服务",
  "dwsq": "点位拾取",
  "sdgl": "视点管理",
  "jlcl": "距离测量",
  "gdcl": "高度测量",
  "mjcl": "面积测量",
  "qxcx": "圈选查询",
  "kxcx": "框选查询",
  "tsfx": "通视分析",
  "ksyfx": "可视域分析",
  "rzfx": "阴影分析",
  "clear": "清除",
} as const;

type ToolKeys = keyof typeof toolMap

const toolFunMap = {
  "三维模型": "",
  "影像服务": "",
  "视点管理": "",
  "点位拾取": "",
  "距离测量": "calcDistance",
  "高度测量": "calcHeight",
  "面积测量": "calcArea",
  "框选查询": "",
  "圈选查询": "",
  "通视分析": "analyseSightLine",
  "可视域分析": "analyseView",
  "阴影分析": "analyseShadow",
  "清除": "clearAll",
};

const ToolBar = () => {
  const [selectedTool, setSelectedTool] = useState("");
  const {visible: viewManageVisible, show, hide} = useVisible();
  const {visible: portalVisible, show: showPortal, hide: hidePortal} = useVisible();

  const [portalTableData, setPortalTableData] = useState<BicyclesInfo[]>([]);
  const [portalTableColumns, setPortalTableColumns] = useState<{
    key: string,
    render: (item: any) => ReactElement;
  }[]>([]);

  const {data} = useBicycleAllInfo();
  const {toast} = useToast();

  const onSelect = (item: ToolKeys) => {
    if (item === selectedTool) {
      if (item === "swmx") {
        findS3mLayer("倾斜1").visible = false;
        findS3mLayer("倾斜2").visible = false;
      }
      if (item === "tcgl") {
        findMapLayer("矢量图").show = true;
        findMapLayer("中文注记").show = true;
        findMapLayer("影像").show = false;
      }
      clearAll();
      setSelectedTool("");
      return;
    }
    if (item === "kxcx") {
      tools.frameSelectionQuery(
        () => data?.map(item => [item.longitude, item.latitude, item]),
        (ptsWithin) => {
          console.log("ptsWithin");
          console.log(ptsWithin);
          showPortal();
          setPortalTableData(ptsWithin.features.map((item: any) => item.geometry.coordinates[2]));
          setPortalTableColumns([
            {
              key: "单车编号",
              render: (item: BicyclesInfo) => <>{item.bikeId}</>
            },
            {
              key: "单车类型",
              render: (item: BicyclesInfo) => <>{BicycleTypeMap[item.bikeType]}</>
            },
            {
              key: "骑行状态",
              render: (item: BicyclesInfo) => <>{BicycleRideStateMap[item.rideState]}</>
            },
            {
              key: "车辆状态",
              render: (item: BicyclesInfo) => <>{BikeStatusMap[item.bikeStatus]}</>
            },
          ]);
        });
    } else if (item === "qxcx") {
      drawCircle(() => data?.map(item => [item.longitude, item.latitude, item]), (ptsWithin) => {
        showPortal();
        setPortalTableData(ptsWithin.features.map((item: any) => item.geometry.coordinates[2]));
        setPortalTableColumns([
          {
            key: "单车编号",
            render: (item: BicyclesInfo) => <>{item.bikeId}</>
          },
          {
            key: "单车类型",
            render: (item: BicyclesInfo) => <>{BicycleTypeMap[item.bikeType]}</>
          },
          {
            key: "骑行状态",
            render: (item: BicyclesInfo) => <>{BicycleRideStateMap[item.rideState]}</>
          },
          {
            key: "车辆状态",
            render: (item: BicyclesInfo) => <>{BikeStatusMap[item.bikeStatus]}</>
          },
        ]);
      });
    } else if (item === "swmx") {
      findS3mLayer("倾斜1").visible = true;
      findS3mLayer("倾斜2").visible = true;
    } else if (item === "tcgl") {
      findMapLayer("矢量图").show = false;
      findMapLayer("中文注记").show = false;
      findMapLayer("影像").show = true;
    } else if (item === "sdgl") {
      show();
    } else if (item === "dwsq") {
      tools.pickPosition(({longitude, latitude}) => {
        toast({
          description: `x:${longitude},y:${latitude}`,
        });
      });
    } else {
      (tools as any)[toolFunMap[toolMap[item]]]?.();
    }
    setSelectedTool(item);
  };

  return (
    <div className={"flex flex-col"}>
      {viewManageVisible &&
        <div className={"absolute right-[64px] top-0"}>
          <ViewManage onClose={hide}/>
        </div>}
      {
        portalVisible && <Portal node={document && document.getElementById("root")}>
          <div style={{
            transform: "translate(-50%,-50%)"
          }} className={"absolute left-1/2 top-1/2"}>
            <div className={"w-[500px]"}>
              <DetailPanelLayout onClose={hidePortal} title={"框选查询列表"} contentType={"component"}>
                <div className={"min-h-[200px] max-h-[300px] overflow-auto my-[16px]"}>
                  <CommonTable data={portalTableData} columns={portalTableColumns}/>
                </div>
              </DetailPanelLayout>
            </div>
          </div>
        </Portal>
      }
      <TooltipProvider>
        {(Object.keys(toolMap) as ToolKeys[]).map((item) =>
          <Tooltip key={item}>
            <TooltipTrigger className={"mb-2"}>
              {/*<Icon onClick={() => onSelect(item)} style={{
                width: "38px",
                height: "38px",
              }} name={item} className={cn("", selectedTool === item ? "bg-blue-500" : "")}/>*/}
              <div onClick={() => onSelect(item)}>
                {selectedTool === item ? <img src={getImageUrl(item + "_active")} alt=""/> :
                  <img src={getImageUrl(item)} alt=""/>}
              </div>
            </TooltipTrigger>
            <TooltipContent side={"left"}>
              <p>{toolMap[item]}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};

export default ToolBar;

