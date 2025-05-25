import {useVisible} from "@/hooks/public/utils.ts";
import {useState} from "react";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useDroneControlWsEvent} from "@/hooks/drone/useDroneControlWsEvent.ts";
import {ControlSource} from "@/types/device.ts";

const workspaceId: string = localStorage.getItem(ELocalStorageKey.WorkspaceId) || "";
// DRC 链路
const DRC_API_PREFIX = "/control/api/v1";

export const useFlightControl = (sn?: string) => {
  const {visible: isRemoteControl, show: enterRemoteControl, hide: outRemoteControl} = useVisible();
  const osdVisible = useSceneStore(state => state.osdVisible);
  const clientId = useSceneStore(state => state.clientId);
  const {post} = useAjax();
  // ws 消息通知
  const {droneControlSource} = useDroneControlWsEvent(osdVisible.gateway_sn || "");
  const [deviceTopicInfo, setDeviceTopicInfo] = useState({
    sn: osdVisible.gateway_sn || sn || "",
    pubTopic: "",
    subTopic: ""
  });

  // 进入飞行控制
  const enterFlightControl = async () => {
    try {
      const res = await post<Resource<any>>(`${DRC_API_PREFIX}/workspaces/${workspaceId}/drc/enter`, {
        client_id: clientId,
        dock_sn: osdVisible.gateway_sn || sn || ""
      });

      if (res.data.code === 0) {
        enterRemoteControl();
        const data = res.data.data;

        // 合并一次性更新所有 topic 信息
        setDeviceTopicInfo(prev => ({
          ...prev,
          subTopic: data.sub?.[0] || "",
          pubTopic: data.pub?.[0] || "",
        }));

        // 获取飞行控制权
        if (droneControlSource !== ControlSource.A) {
          await post(`${DRC_API_PREFIX}/devices/${osdVisible.gateway_sn}/authority/flight`);
        }

        toast({
          description: "获取飞行控制权成功！"
        });
      }
    } catch (error: any) {
      console.log(error);
      toast({
        description: "获取飞行控制权失败！",
        variant: "destructive"
      });
    }
  };

  // 退出飞行控制
  const exitFlightControl = async () => {
    try {
      const res = await post<Resource<any>>(`${DRC_API_PREFIX}/workspaces/${workspaceId}/drc/exit`, {
        client_id: clientId,
        dock_sn: osdVisible.gateway_sn || sn || ""
      });
      if (res.data.code === 0) {
        outRemoteControl();
        setDeviceTopicInfo({
          ...deviceTopicInfo,
          subTopic: "",
          pubTopic: ""
        });
        toast({
          description: "退出飞行控制！",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        description: "退出飞行控制失败！",
        variant: "destructive"
      });
    }
  };

  return {
    isRemoteControl,
    enterFlightControl,
    exitFlightControl,
    deviceTopicInfo,
    setDeviceTopicInfo,
    enterRemoteControl,
    outRemoteControl
  };
};
