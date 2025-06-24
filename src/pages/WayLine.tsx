import {ArrowDownToLine, Camera, Drone, Edit, Plus, Rocket, Trash, Upload, User} from "lucide-react";
import UploadButton from "@rpldy/upload-button";
import Uploady from "@rpldy/uploady";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useDeleteWalineFile, useDownloadWayline, useWaylineById, useWaylines, WaylineItem} from "@/hooks/drone";
import {useEffect, useState} from "react";
import {DEVICE_NAME} from "@/types/device.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import {CURRENT_CONFIG} from "@/lib/config.ts";
import {getAuthToken} from "@/lib/http.ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {useNavigate} from "react-router-dom";
import Scene from "@/components/drone/public/Scene.tsx";
import {calculateHaversineDistance, cn} from "@/lib/utils.ts";
import MapChange from "@/components/drone/public/MapChange.tsx";
import PermissionButton from "@/components/drone/public/PermissionButton.tsx";
import {useAddWaylineEntityById} from "@/hooks/drone/useAddWaylineEntityById.ts";
import {useSetViewByWaylineData} from "@/hooks/drone/wayline/useSetViewByWaylineData.ts";

const HTTP_PREFIX_Wayline = "wayline/api/v1";

const WayLine = () => {
  const departId = localStorage.getItem("departId");
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const navigate = useNavigate();

  const {downloadWayline} = useDownloadWayline(workspaceId);
  const {deleteWaylineFile} = useDeleteWalineFile(workspaceId);

  const {data: waylines, mutate} = useWaylines(workspaceId, {
    order_by: "update_time desc",
    page: 1,
    page_size: 1000,
    organ: departId ? +departId : undefined,
  });

  const onComplete = (xhr: XMLHttpRequest) => {
    const response = JSON.parse(xhr.response);
    if (response.code === 0) {
      toast({
        description: "上传成功！"
      });
      mutate();
    } else {
      toast({
        description: response.message,
        variant: "destructive"
      });
    }
    return response.code === 0;
  };

  const [currentWayline, setCurrentWayline] = useState("");
  const {data: currentWaylineData} = useWaylineById(currentWayline);
  useAddWaylineEntityById(currentWayline, true);

  // 计算航线长度
  useEffect(() => {
    if (!currentWaylineData) return;
    const takeoffPoint = currentWaylineData.take_off_ref_point?.split(",");
    const posArr = [];
    if (takeoffPoint && takeoffPoint.length > 1) {
      posArr.push({longitude: +takeoffPoint[1], latitude: +takeoffPoint[0]});
    }
    currentWaylineData.route_point_list?.forEach(point => posArr.push({
      longitude: point.longitude,
      latitude: point.latitude,
    }));
    if (posArr.length < 2) return;
    let length = 0;
    for (let i = 0; i < posArr.length - 1; i++) {
      length += calculateHaversineDistance([posArr[i].longitude, posArr[i].latitude],
        [posArr[i + 1].longitude, posArr[i + 1].latitude]);
    }
    console.log("length==");
    console.log(length);
  }, [currentWaylineData]);

  /*viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(deviceInfo.dock.basic_osd.longitude, deviceInfo.dock.basic_osd.latitude, 100),
    duration: 1
  });*/

  useSetViewByWaylineData(currentWayline);

  const onClickWayline = (wayline: WaylineItem) => {
    setCurrentWayline(wayline.id);
  };

  return (
    <div className={"w-full h-full flex space-x-[20px]"}>
      <div
        className={"w-[340px] border-[1px] h-full border-[#43ABFF] bg-gradient-to-l " +
          "from-[#32547E]/[.5] to-[#1F2D4B] border-l-0 rounded-tr-lg rounded-br-lg"}>
        <div
          className={"flex items-center space-x-4 border-b-[1px] border-b-[#265C9A] px-[12px] py-4 justify-between"}>
          <span className={"text-base h-8 "}>航线列表</span>
          <div className={"flex space-x-4 h-8 items-center"}>
            <PermissionButton
              permissionKey={"Collection_WaylineCreateEdit"}
              onClick={() => navigate("/create-wayline")}
              className={"bg-transparent px-0"}
            >
              <Plus size={16}/>
            </PermissionButton>
            <PermissionButton permissionKey={"Collection_WaylineImport"} className={"bg-transparent px-0"}>
              <Uploady
                isSuccessfulCall={(x) => onComplete(x)}
                destination={{
                  url: `${CURRENT_CONFIG.baseURL}${HTTP_PREFIX_Wayline}/workspaces/${workspaceId}/waylines/file/upload/${departId}`,
                  headers: {
                    [ELocalStorageKey.Token]: getAuthToken()
                  }
                }}>
                <UploadButton>
                  <Upload size={16}/>
                </UploadButton>
              </Uploady>
            </PermissionButton>
          </div>
        </div>
        <div className={"px-[12px] py-4 space-y-2 h-[calc(100vh-180px)] overflow-y-auto"}>
          {!waylines || waylines.list.length === 0 ? <div className={"content-center py-8 text-[#d0d0d0]"}>
            暂无数据
          </div> : waylines.list.map(line =>
            <div
              style={{
                backgroundSize: "100% 100%"
              }}
              className={cn("text-base px-4 py-3 cursor-pointer whitespace-nowrap",
                line.id === currentWayline ? "bg-panel-item-active" : "bg-panel-item")}
              key={line.id}
              onClick={() => onClickWayline(line)}
            >
              <div className={"flex items-center justify-between"}>
                <span className={"col-span-2 w-28 truncate"} title={line.name}>{line.name}</span>
                <div className={"space-x-4 text-[#d0d0d0]"}>
                  <PermissionButton
                    className={"px-0 hover:bg-transparent hover:text-white"}
                    permissionKey={"Collection_WaylineCreateEdit"}
                    variant={"ghost"}
                    onClick={() => navigate(`/create-wayline?id=${line.id}`)}
                  >
                    <Edit size={16}/>
                  </PermissionButton>
                  <PermissionButton
                    className={"px-0 hover:bg-transparent hover:text-white"}
                    permissionKey={"Collection_WaylineDownload"}
                    variant={"ghost"}
                    onClick={() => downloadWayline(line.id, line.name)}>
                    <ArrowDownToLine size={16}/>
                  </PermissionButton>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <PermissionButton
                        className={"px-0 hover:bg-transparent hover:text-white"}
                        permissionKey={"Collection_WaylineDelete"}
                        variant={"ghost"}>
                        <Trash size={16}/>
                      </PermissionButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>删除航线</AlertDialogTitle>
                        <AlertDialogDescription>
                          确认删除航线吗？
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => {
                          await deleteWaylineFile(line.id);
                          await mutate();
                        }}>确定</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className={"grid grid-cols-6 space-x-4 text-[12px] text-[#d0d0d0] text-sm"}>
                <div className={"col-span-2 space-x-2 grid grid-cols-6 items-center"}>
                  <Drone className={"col-span-1"} size={16}/>
                  <span className={""}>{DEVICE_NAME[line.drone_model_key]}</span>
                </div>
                <div className={"col-span-2 space-x-2 whitespace-nowrap grid grid-cols-6 items-center"}>
                  <Camera className={"col-span-1"} size={14}/>
                  {line.payload_model_keys.map(payload => <span key={payload}>{DEVICE_NAME[payload]}</span>)}
                </div>
              </div>
              <div className={"text-sm text-[#d0d0d0] pt-2 pb-2 flex justify-between items-center"}>
                <span>更新于 {new Date(line.update_time).toLocaleString()}</span>
                <div className={"content-center space-x-2"}>
                  <User size={14}/>
                  <span>{line.user_name}</span>
                </div>
              </div>
            </div>)}
        </div>
      </div>
      <div className={"flex-1 border-[2px] rounded-lg border-[#43ABFF] relative overflow-hidden"}>
        <Scene/>
        <div className={"absolute right-0 bottom-0 z-100"}>
          <MapChange/>
        </div>
      </div>
    </div>
  );
};

export default WayLine;

