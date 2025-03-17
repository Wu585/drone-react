import {Camera, Plus, Rocket, Upload, User} from "lucide-react";
import UploadButton from "@rpldy/upload-button";
import Uploady from "@rpldy/uploady";
import GMap from "@/components/drone/public/GMap.tsx";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useDeleteWalineFile, useDownloadWayline, useWaylineById, useWaylines} from "@/hooks/drone";
import {useEffect} from "react";
import {DEVICE_NAME} from "@/types/device.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
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

const HTTP_PREFIX_Wayline = "wayline/api/v1";

const WayLine = () => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const navigate = useNavigate()

  const {downloadWayline} = useDownloadWayline(workspaceId);
  const {deleteWaylineFile} = useDeleteWalineFile(workspaceId);

  const {data: waylines, mutate} = useWaylines(workspaceId, {
    order_by: "update_time desc",
    page: 1,
    page_size: 10
  });

  useEffect(() => {
    console.log("waylines");
    console.log(waylines);
  }, [waylines]);

  const onComplete = (xhr: XMLHttpRequest) => {

    console.log("xhr");
    console.log(xhr);
    const response = JSON.parse(xhr.response);
    console.log("response");
    console.log(response);
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
  // const {data: currentWaylineData} = useWaylineById("3dce9002-97da-4f98-822d-440beec6c171" || "");
  return (
    <div className={"w-full h-full flex space-x-[20px]"}>
      <div
        className={"w-[340px] border-[1px] h-full border-[#43ABFF] bg-gradient-to-r " +
          "from-[#074578]/[.5] to-[#0B142E]/[.9] border-l-0 rounded-tr-lg rounded-br-lg"}>
        <div
          className={"flex items-center space-x-4 border-b-[1px] border-b-[#265C9A] px-[12px] py-4 text-sm justify-between"}>
          <span>航线列表</span>
          <div className={"flex space-x-2"}>
            <Plus onClick={()=>navigate("/create-wayline")} size={16} className={"cursor-pointer"}/>
            <Uploady
              isSuccessfulCall={(x) => onComplete(x)}
              destination={{
                url: `${CURRENT_CONFIG.baseURL}${HTTP_PREFIX_Wayline}/workspaces/${workspaceId}/waylines/file/upload`,
                headers: {
                  [ELocalStorageKey.Token]: getAuthToken()
                }
              }}>
              <UploadButton>
                <Upload className={"cursor-pointer"} size={16}/>
              </UploadButton>
            </Uploady>
          </div>
        </div>
        <div className={"px-[12px] py-4 space-y-2 h-[calc(100vh-180px)] overflow-y-auto"}>
          {!waylines || waylines.list.length === 0 ? <div className={"content-center py-8 text-[#d0d0d0]"}>
            暂无数据
          </div> : waylines.list.map(line => <div className={"bg-panel-item bg-full-size text-[14px] p-4"}
                                                  key={line.id}>
            <div className={"grid grid-cols-6 space-x-8 relative"}>
              <span className={"col-span-2"}>{line.name}</span>
              <span className={"space-x-4 text-[12px] text-[#d0d0d0] grid grid-cols-6 items-center"}>
                <User className={"col-span-2"} size={16}/>
                <span>{line.user_name}</span>
              </span>
              <Popover>
                <PopoverTrigger className={"col-span-2 absolute right-0"}>
                  <span className={"cursor-pointer"}>...</span>
                </PopoverTrigger>
                <PopoverContent className={"w-24 flex flex-col "}>
                  <Button variant={"ghost"} onClick={() => navigate(`/create-wayline?id=${line.id}`)}>编辑</Button>
                  <Button variant={"ghost"} onClick={() => downloadWayline(line.id, line.name)}>下载</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant={"ghost"}>删除</Button>
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
                </PopoverContent>
              </Popover>
            </div>
            <div className={"grid grid-cols-6 space-x-8 text-[12px] text-[#d0d0d0]"}>
              <div className={"col-span-2 space-x-2 grid grid-cols-6 items-center"}>
                <Rocket className={"col-span-1"} size={14}/>
                <span>{DEVICE_NAME[line.drone_model_key]}</span>
              </div>
              <div className={"col-span-2 space-x-2 whitespace-nowrap grid grid-cols-6 items-center"}>
                <Camera className={"col-span-1"} size={14}/>
                {line.payload_model_keys.map(payload => <span key={payload}>{DEVICE_NAME[payload]}</span>)}
              </div>
            </div>
            <div className={"text-[12px] text-[#d0d0d0]"}>
              更新于 {new Date(line.update_time).toLocaleString()}
            </div>
          </div>)}
        </div>
      </div>
      <div className={"flex-1 border-[2px] rounded-lg border-[#43ABFF] relative"}>
        <GMap/>
      </div>
    </div>
  );
};

export default WayLine;

