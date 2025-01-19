import {useVisible} from "@/hooks/public/utils.ts";
import {DeviceCmd, DeviceCmdItemAction} from "@/types/device-cmd.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {useAjax} from "@/lib/http.ts";

const CMD_API_PREFIX = "/control/api/v1";

export const useDockControl = () => {
  const {
    visible: dockControlPanelVisible,
    show: showDockControlPanelVisible,
    hide: hideDockControlPanelVisible
  } = useVisible();
  const {toast} = useToast();
  const {post} = useAjax();

  // 发送指令
  const sendDockControlCmd = async (params: {
    sn: string,
    cmd: DeviceCmd
    action?: DeviceCmdItemAction
  }, tip = true) => {
    try {
      await post(`${CMD_API_PREFIX}/devices/${params.sn}/jobs/${params.cmd}`, params.action ? {action: params.action} : undefined);
      toast({
        description: "指令发送成功！"
      });
    } catch (err: any) {
      tip && toast({
        description: `${err.data.message} 指令发送失败！`,
        variant: "destructive"
      });
      throw err.data.message;
    }
  };

  // 远程调试开关
  const dockDebugOnOff = async (sn: string, on: boolean) => {
    return await sendDockControlCmd({sn, cmd: on ? DeviceCmd.DebugModeOpen : DeviceCmd.DebugModeClose}, false);
  };

  // 控制面板关闭
  const onCloseControlPanel = async (sn: string, debugging: boolean) => {
    if (debugging) {
      await dockDebugOnOff(sn, false);
    }
    hideDockControlPanelVisible();
  };

  return {
    dockControlPanelVisible,
    showDockControlPanelVisible,
    hideDockControlPanelVisible,
    sendDockControlCmd,
    dockDebugOnOff,
    onCloseControlPanel
  };
};
