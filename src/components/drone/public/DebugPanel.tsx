import {X} from "lucide-react";
import {Switch} from "@/components/ui/switch.tsx";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import {EDockModeCode} from "@/types/device.ts";
import {useAjax} from "@/lib/http.ts";
import {cmdList, DeviceCmd, DeviceCmdItem} from "@/types/device-cmd.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {Button} from "@/components/ui/button.tsx";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {updateDeviceCmdInfoByExecuteInfo, updateDeviceCmdInfoByOsd} from "@/lib/device-cmd.ts";
import {Loader2} from "lucide-react";
import {useDeviceTopo} from "@/hooks/drone";
import {useMemo} from "react";

interface Props {
  sn: string;
  onClose?: () => void;
}

const CMD_API_PREFIX = "/control/api/v1";

const DebugPanel = ({sn, onClose}: Props) => {
  const {post} = useAjax();
  const devicesCmdExecuteInfo = useSceneStore(state => state.devicesCmdExecuteInfo);
  const osdVisible = useSceneStore(state => state.osdVisible);
  const realTimeDeviceInfo = useRealTimeDeviceInfo(osdVisible.gateway_sn, osdVisible.sn);
  const {data: deviceTopo} = useDeviceTopo();

  // 判断是否有一键标定功能
  const canResetPosition = useMemo(() => {
    const device = deviceTopo?.find(item => item.device_sn === sn);
    if (!device) return false;
    return device.type === 3;
  }, [deviceTopo, sn]);
  // console.log("devicesCmdExecuteInfo");
  // console.log(devicesCmdExecuteInfo);
  const newCmdList = cmdList.map(cmdItem => Object.assign({}, cmdItem));
  // console.log("newCmdList===");
  // console.log(newCmdList);

  if (sn && devicesCmdExecuteInfo[sn]) {
    updateDeviceCmdInfoByExecuteInfo(newCmdList, devicesCmdExecuteInfo[sn]);
  }

  updateDeviceCmdInfoByOsd(newCmdList, realTimeDeviceInfo);

  const debugStatus = realTimeDeviceInfo.dock?.basic_osd?.mode_code === EDockModeCode.Remote_Debugging;

  const onSwitchDebug = async (mode: boolean) => {
    try {
      await post(`${CMD_API_PREFIX}/devices/${sn}/jobs/${mode ? DeviceCmd.DebugModeOpen : DeviceCmd.DebugModeClose}`);
      toast({
        description: mode ? "开启debug模式" : "关闭debug模式"
      });
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  const onSendCmd = async (item: DeviceCmdItem) => {
    try {
      const res: any = await post(`${CMD_API_PREFIX}/devices/${sn}/jobs/${item.cmdKey}`, item.action ? {
        action: item.action
      } : undefined);
      if (res.data.code === 0) {
        toast({
          description: "指令下发成功"
        });
      }
    } catch (e: any) {
      toast({
        description: e.data.message,
        variant: "destructive"
      });
    }
  };

  const onResetPosition = async () => {
    const position = {
      longitude: realTimeDeviceInfo.dock.basic_osd.longitude,
      latitude: realTimeDeviceInfo.dock.basic_osd.latitude,
      height: realTimeDeviceInfo.dock.basic_osd.height
    };
    try {
      await post(`${CMD_API_PREFIX}/devices/${sn}/jobs/${DeviceCmd.RtkCalibration}`, {
        devices: [
          {
            sn,
            type: 1,
            module: "3",
            data: {
              longitude: position.longitude,
              latitude: position.latitude,
              height: position.height
            }
          }
        ]
      });
      toast({
        description: "标定成功"
      });
    } catch (err) {
      toast({
        description: "标定失败!",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={"w-[393px] bg-full-size"}>
      <div className={"bg-[#001E37]/[.85]"}>
        <div
          className={"w-[393px] h-[44px] bg-take-off-panel-header bg-full-size flex items-center justify-between px-2"}>
          <h1 className={"pl-6"}>设备控制: {sn}</h1>
          <X onClick={() => onClose?.()} className={"cursor-pointer"}/>
        </div>
        <div className={"p-2 text-[14px] space-y-2 py-4"}>
          <div className={"flex items-center space-x-4"}>
            <h3>设备远程调试模式</h3>
            <Switch checked={debugStatus} onCheckedChange={onSwitchDebug}
                    className={"data-[state=checked]:bg-[#43ABFF]"}/>
            {canResetPosition && <Button onClick={onResetPosition} className={"bg-[#43ABFF] h-8"}>一键标定</Button>}
          </div>
          <div className={"grid grid-cols-2 gap-4"}>
            {newCmdList.map(item => <div key={item.cmdKey}
                                         className={"flex space-x-2 items-center justify-between border-[1px] border-[#43ABFF] p-2"}>
              <div className={"flex flex-col items-center whitespace-nowrap text-[12px]"}>
                <span>{item.label}</span>
                <span className={"text-[12px]"}>{item.status}</span>
              </div>
              <Button
                onClick={() => onSendCmd(item)}
                disabled={!debugStatus || item.disabled || item.loading}
                className={"w-16 h-6 rounded-none bg-[#43ABFF]"}
              >
                {item.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin"/>
                ) : (
                  item.operateText
                )}
              </Button>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;

