import {Edit, X} from "lucide-react";
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
import {useEffect, useMemo} from "react";
import {IconButton} from "@/components/drone/public/IconButton.tsx";
import {CommonPopover} from "@/components/drone/public/CommonPopover.tsx";
import {Label} from "@/components/ui/label.tsx";
import {CommonSwitch} from "@/components/drone/public/CommonSwitch.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import {
  DeviceSettingKeyEnum, DistanceLimitStatusEnum,
  initDeviceSetting, initDeviceSettingFormModel,
  NightLightsStateEnum,
  ObstacleAvoidanceStatusEnum, PutDevicePropsBody
} from "@/types/device-setting.ts";
import {useImmer} from "use-immer";
import {DEFAULT_PLACEHOLDER} from "@/constants";
import {isNil} from "@/lib/utils.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";

interface Props {
  sn: string;
  onClose?: () => void;
}

const CMD_API_PREFIX = "/control/api/v1";
const MNG_API_PREFIX = "/manage/api/v1";
const Unit_M = " m";

const DebugPanel = ({sn, onClose}: Props) => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {post, put} = useAjax();
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
        description: mode ? "开启debug模式失败！" : "关闭debug模式失败！",
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
        description: "指令下发失败",
        variant: "destructive"
      });
    }
  };

  const onResetPosition = async () => {
    if (!realTimeDeviceInfo.dock || !realTimeDeviceInfo.dock.basic_osd) {
      return toast({
        description: "机场无OSD数据信息！",
        variant: "destructive"
      });
    }
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

  const [deviceSetting, updateDeviceSetting] = useImmer(initDeviceSetting);
  const [deviceSettingFormModelFromOsd, updateDeviceSettingFormModelFromOsd] = useImmer(initDeviceSettingFormModel);
  const [deviceSettingFormModel, updateDeviceSettingFormModel] = useImmer(initDeviceSettingFormModel);

  useEffect(() => {
    if (!realTimeDeviceInfo) return;
    const {device} = realTimeDeviceInfo;
    if (!device) return;

    // 夜航灯
    const nightLightsState = device?.night_lights_state as any;
    updateDeviceSettingFormModelFromOsd(draft => {
      draft.nightLightsState = !isNil(nightLightsState) && nightLightsState === NightLightsStateEnum.OPEN;
    });

    // 限高
    const heightLimit = device?.height_limit as any;
    if (isNil(heightLimit) || heightLimit === 0) {
      updateDeviceSettingFormModelFromOsd(draft => {
        draft.heightLimit = 120;
      });
    } else {
      updateDeviceSettingFormModelFromOsd(draft => {
        draft.heightLimit = heightLimit;
      });
    }

    // 限远
    const distanceLimitStatus = device?.distance_limit_status?.state as any;
    if (!isNil(distanceLimitStatus) && distanceLimitStatus === DistanceLimitStatusEnum.SET) {
      updateDeviceSettingFormModelFromOsd(draft => {
        draft.distanceLimitStatus.state = true;
        draft.distanceLimitStatus.distanceLimit = device?.distance_limit_status?.distance_limit || 15;
      });
    } else {
      updateDeviceSettingFormModelFromOsd(draft => {
        draft.distanceLimitStatus.state = false;
        draft.distanceLimitStatus.distanceLimit = 15;
      });
    }

    // 避障
    if (isNil(device?.obstacle_avoidance)) {
      updateDeviceSettingFormModelFromOsd(draft => {
        draft.obstacleAvoidanceHorizon = false;
        draft.obstacleAvoidanceUpside = false;
        draft.obstacleAvoidanceDownside = false;
      });
    } else {
      const {horizon, upside, downside} = device.obstacle_avoidance || {};
      updateDeviceSettingFormModelFromOsd(draft => {
        draft.obstacleAvoidanceHorizon = !isNil(horizon) && horizon === ObstacleAvoidanceStatusEnum.OPEN;
        draft.obstacleAvoidanceUpside = !isNil(upside) && upside === ObstacleAvoidanceStatusEnum.OPEN;
        draft.obstacleAvoidanceDownside = !isNil(downside) && downside === ObstacleAvoidanceStatusEnum.OPEN;
      });
    }
  }, [realTimeDeviceInfo, updateDeviceSettingFormModelFromOsd]);

  useEffect(() => {
    if (!realTimeDeviceInfo) return;
    const {device} = realTimeDeviceInfo;
    if (!device) return;

    // 夜航灯
    let nightLightsState = "" as any;
    if (isNil(device.night_lights_state)) {
      updateDeviceSetting(draft => {
        draft[DeviceSettingKeyEnum.NIGHT_LIGHTS_MODE_SET].editable = false;
        draft[DeviceSettingKeyEnum.NIGHT_LIGHTS_MODE_SET].value = DEFAULT_PLACEHOLDER;
      });
      nightLightsState = DEFAULT_PLACEHOLDER;
    } else {
      updateDeviceSetting(draft => {
        draft[DeviceSettingKeyEnum.NIGHT_LIGHTS_MODE_SET].editable = true;
      });
      nightLightsState = device.night_lights_state;
      if (nightLightsState === NightLightsStateEnum.CLOSE) {
        updateDeviceSetting(draft => {
          draft[DeviceSettingKeyEnum.NIGHT_LIGHTS_MODE_SET].value = "关闭";
        });
      } else if (nightLightsState === NightLightsStateEnum.OPEN) {
        updateDeviceSetting(draft => {
          draft[DeviceSettingKeyEnum.NIGHT_LIGHTS_MODE_SET].value = "开启";
        });
      } else {
        updateDeviceSetting(draft => {
          draft[DeviceSettingKeyEnum.NIGHT_LIGHTS_MODE_SET].value = DEFAULT_PLACEHOLDER;
        });
      }
      updateDeviceSetting(draft => {
        draft[DeviceSettingKeyEnum.NIGHT_LIGHTS_MODE_SET].trueValue = nightLightsState;
      });
    }

    // 限高
    let heightLimit = device?.height_limit as any;
    if (isNil(heightLimit) || heightLimit === 0) {
      heightLimit = DEFAULT_PLACEHOLDER;
      updateDeviceSetting(draft => {
        draft[DeviceSettingKeyEnum.HEIGHT_LIMIT_SET].editable = false;
      });
    } else {
      updateDeviceSetting(draft => {
        draft[DeviceSettingKeyEnum.HEIGHT_LIMIT_SET].editable = true;
      });
    }
    updateDeviceSetting(draft => {
      draft[DeviceSettingKeyEnum.HEIGHT_LIMIT_SET].trueValue = heightLimit;
      draft[DeviceSettingKeyEnum.HEIGHT_LIMIT_SET].value = heightLimit + Unit_M;
    });

    // 限远
    let distanceLimitStatus = "" as any;
    if (isNil(device?.distance_limit_status?.state)) {
      distanceLimitStatus = DEFAULT_PLACEHOLDER;
      updateDeviceSetting(draft => {
        draft[DeviceSettingKeyEnum.DISTANCE_LIMIT_SET].editable = false;
        draft[DeviceSettingKeyEnum.DISTANCE_LIMIT_SET].value = DEFAULT_PLACEHOLDER;
      });
    } else {
      updateDeviceSetting(draft => {
        draft[DeviceSettingKeyEnum.DISTANCE_LIMIT_SET].editable = true;
      });
      distanceLimitStatus = device?.distance_limit_status?.state;
      if (distanceLimitStatus === DistanceLimitStatusEnum.UNSET) {
        updateDeviceSetting(draft => {
          draft[DeviceSettingKeyEnum.DISTANCE_LIMIT_SET].value = "关闭";
        });
      } else if (distanceLimitStatus === DistanceLimitStatusEnum.SET) {
        const distanceLimit = device?.distance_limit_status?.distance_limit;
        if (distanceLimit) {
          updateDeviceSetting(draft => {
            draft[DeviceSettingKeyEnum.DISTANCE_LIMIT_SET].value = distanceLimit + Unit_M;
          });
        } else {
          updateDeviceSetting(draft => {
            draft[DeviceSettingKeyEnum.DISTANCE_LIMIT_SET].value = DEFAULT_PLACEHOLDER;
          });
        }
      } else {
        updateDeviceSetting(draft => {
          draft[DeviceSettingKeyEnum.DISTANCE_LIMIT_SET].value = DEFAULT_PLACEHOLDER;
        });
      }
    }
    updateDeviceSetting(draft => {
      draft[DeviceSettingKeyEnum.DISTANCE_LIMIT_SET].trueValue = distanceLimitStatus;
    });

    // 避障
    if (isNil(device?.obstacle_avoidance)) {
      updateDeviceSetting(draft => {
        draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].editable = false;
        draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].value = DEFAULT_PLACEHOLDER;
        draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].trueValue = DEFAULT_PLACEHOLDER;
        draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].editable = false;
        draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].value = DEFAULT_PLACEHOLDER;
        draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].trueValue = DEFAULT_PLACEHOLDER;
        draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].editable = false;
        draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].value = DEFAULT_PLACEHOLDER;
        draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].trueValue = DEFAULT_PLACEHOLDER;
      });
    } else {
      const {horizon, upside, downside} = device.obstacle_avoidance || {};

      // 水平避障
      if (isNil(horizon)) {
        updateDeviceSetting(draft => {
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].editable = false;
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].value = DEFAULT_PLACEHOLDER;
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].trueValue = DEFAULT_PLACEHOLDER;
        });
      } else {
        updateDeviceSetting(draft => {
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].editable = false;
          if (horizon === ObstacleAvoidanceStatusEnum.CLOSE) {
            draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].value = "关闭";
          } else if (horizon === ObstacleAvoidanceStatusEnum.OPEN) {
            draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].value = "开启";
          } else {
            draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].value = DEFAULT_PLACEHOLDER;
          }
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].trueValue = horizon;
        });
      }

      // 上方避障
      if (isNil(upside)) {
        updateDeviceSetting(draft => {
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].editable = false;
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].value = DEFAULT_PLACEHOLDER;
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].trueValue = DEFAULT_PLACEHOLDER;
        });
      } else {
        updateDeviceSetting(draft => {
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].editable = false;
          if (upside === ObstacleAvoidanceStatusEnum.CLOSE) {
            draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].value = "关闭";
          } else if (upside === ObstacleAvoidanceStatusEnum.OPEN) {
            draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].value = "开启";
          } else {
            draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].value = DEFAULT_PLACEHOLDER;
          }
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].trueValue = upside;
        });
      }

      // 下方避障
      if (isNil(downside)) {
        updateDeviceSetting(draft => {
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].editable = false;
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].value = DEFAULT_PLACEHOLDER;
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].trueValue = DEFAULT_PLACEHOLDER;
        });
      } else {
        updateDeviceSetting(draft => {
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].editable = false;
          if (downside === ObstacleAvoidanceStatusEnum.CLOSE) {
            draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].value = "关闭";
          } else if (downside === ObstacleAvoidanceStatusEnum.OPEN) {
            draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].value = "开启";
          } else {
            draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].value = DEFAULT_PLACEHOLDER;
          }
          draft[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].trueValue = downside;
        });
      }
    }
  }, [realTimeDeviceInfo, updateDeviceSetting]);

  const onShowPopForm = () => {
    updateDeviceSettingFormModel(() => deviceSettingFormModelFromOsd);
  };

  const onConfirm = async (settingKey: DeviceSettingKeyEnum) => {
    const body = {} as PutDevicePropsBody;
    if (settingKey === DeviceSettingKeyEnum.NIGHT_LIGHTS_MODE_SET) {
      body.night_lights_state = deviceSettingFormModel.nightLightsState ? NightLightsStateEnum.OPEN : NightLightsStateEnum.CLOSE;
    } else if (settingKey === DeviceSettingKeyEnum.HEIGHT_LIMIT_SET) {
      body.height_limit = deviceSettingFormModel.heightLimit;
    } else if (settingKey === DeviceSettingKeyEnum.DISTANCE_LIMIT_SET) {
      body.distance_limit_status = {};
      if (deviceSettingFormModel.distanceLimitStatus.state) {
        body.distance_limit_status.state = DistanceLimitStatusEnum.SET;
        body.distance_limit_status.distance_limit = deviceSettingFormModel.distanceLimitStatus.distanceLimit;
      } else {
        body.distance_limit_status.state = DistanceLimitStatusEnum.UNSET;
      }
    } else if (settingKey === DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON) {
      body.obstacle_avoidance = {
        horizon: deviceSettingFormModel.obstacleAvoidanceHorizon ? ObstacleAvoidanceStatusEnum.OPEN : ObstacleAvoidanceStatusEnum.CLOSE
      };
    } else if (settingKey === DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE) {
      body.obstacle_avoidance = {
        upside: deviceSettingFormModel.obstacleAvoidanceUpside ? ObstacleAvoidanceStatusEnum.OPEN : ObstacleAvoidanceStatusEnum.CLOSE
      };
    } else if (settingKey === DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE) {
      body.obstacle_avoidance = {
        downside: deviceSettingFormModel.obstacleAvoidanceDownside ? ObstacleAvoidanceStatusEnum.OPEN : ObstacleAvoidanceStatusEnum.CLOSE
      };
    }

    try {
      await put(`${MNG_API_PREFIX}/devices/${workspaceId}/devices/${sn}/property`, body);
      toast({
        description: "设备属性设置成功！"
      });
    } catch (err) {
      toast({
        description: "设备属性设置失败！",
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
        <div className={"p-2 text-[14px] space-y-2"}>
          <div>
            <h3 className={"pb-1"}>设备属性设置</h3>
            <div className={"grid grid-cols-2 gap-x-4 gap-y-3"}>
              {/*夜航灯*/}
              <div className={"flex space-x-2 items-center justify-between border-[1px] border-[#43ABFF] px-2 py-1"}>
                <div className={"flex flex-col items-center whitespace-nowrap text-[12px]"}>
                  <span>{deviceSetting[DeviceSettingKeyEnum.NIGHT_LIGHTS_MODE_SET].label}</span>
                  <span
                    className={"text-[12px]"}>{deviceSetting[DeviceSettingKeyEnum.NIGHT_LIGHTS_MODE_SET].value}</span>
                </div>
                <CommonPopover
                  trigger={<IconButton onClick={onShowPopForm}>
                    <Edit size={16}/>
                  </IconButton>}>
                  <div className={"flex justify-between"}>
                    <div className={"flex items-center space-x-2"}>
                      <Label>{deviceSetting[DeviceSettingKeyEnum.NIGHT_LIGHTS_MODE_SET].label}：</Label>
                      <CommonSwitch checked={deviceSettingFormModel.nightLightsState} onCheckedChange={(checked) => {
                        updateDeviceSettingFormModel(draft => {
                          draft.nightLightsState = checked;
                        });
                      }}/>
                    </div>
                    <CommonButton
                      onClick={() => onConfirm(deviceSetting[DeviceSettingKeyEnum.NIGHT_LIGHTS_MODE_SET].settingKey)}>确认</CommonButton>
                  </div>
                </CommonPopover>
              </div>
              {/*限高*/}
              <div className={"flex space-x-2 items-center justify-between border-[1px] border-[#43ABFF] px-2 py-1"}>
                <div className={"flex flex-col items-center whitespace-nowrap text-[12px]"}>
                  <span>{deviceSetting[DeviceSettingKeyEnum.HEIGHT_LIMIT_SET].label}</span>
                  <span className={"text-[12px]"}>{deviceSetting[DeviceSettingKeyEnum.HEIGHT_LIMIT_SET].value}</span>
                </div>
                <CommonPopover
                  trigger={<IconButton onClick={onShowPopForm}>
                    <Edit size={16}/>
                  </IconButton>}>
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label
                        className="whitespace-nowrap">{deviceSetting[DeviceSettingKeyEnum.HEIGHT_LIMIT_SET].label}：</Label>
                      <div className="flex items-center">
                        <CommonInput
                          className="w-24"  // 控制输入框宽度
                          value={deviceSettingFormModel.heightLimit}
                          type="number"
                          min={20}
                          max={1500}
                          onChange={event => {
                            updateDeviceSettingFormModel(draft => {
                              draft.heightLimit = +event.target.value;
                            });
                          }}
                        />
                        <span className="ml-2">m</span>
                      </div>
                    </div>
                    <CommonButton
                      onClick={() => onConfirm(deviceSetting[DeviceSettingKeyEnum.HEIGHT_LIMIT_SET].settingKey)}
                    >
                      确认
                    </CommonButton>
                  </div>
                </CommonPopover>
              </div>

              {/*限远*/}
              <div className={"flex space-x-2 items-center justify-between border-[1px] border-[#43ABFF] px-2 py-1"}>
                <div className={"flex flex-col items-center whitespace-nowrap text-[12px]"}>
                  <span>{deviceSetting[DeviceSettingKeyEnum.DISTANCE_LIMIT_SET].label}</span>
                  <span
                    className={"text-[12px]"}>{deviceSetting[DeviceSettingKeyEnum.DISTANCE_LIMIT_SET].value}</span>
                </div>
                <CommonPopover
                  contentClassName={"w-[320px]"}
                  trigger={<IconButton onClick={onShowPopForm}>
                    <Edit size={16}/>
                  </IconButton>}>
                  <div className={"flex justify-between"}>
                    <div className={"flex items-center space-x-2"}>
                      <Label
                        className={"flex-shrink-0"}>{deviceSetting[DeviceSettingKeyEnum.DISTANCE_LIMIT_SET].label}：</Label>
                      <CommonSwitch checked={deviceSettingFormModel.distanceLimitStatus.state}
                                    onCheckedChange={(checked) => {
                                      updateDeviceSettingFormModel(draft => {
                                        draft.distanceLimitStatus.state = checked;
                                      });
                                    }}/>
                      <div className="flex items-center">
                        <CommonInput
                          className="w-24"  // 控制输入框宽度
                          value={deviceSettingFormModel.distanceLimitStatus.distanceLimit}
                          type="number"
                          min={10}
                          max={8000}
                          onChange={event => {
                            updateDeviceSettingFormModel(draft => {
                              draft.distanceLimitStatus.distanceLimit = +event.target.value;
                            });
                          }}
                        />
                        <span className="ml-2">m</span>
                      </div>
                      <CommonButton
                        onClick={() => onConfirm(deviceSetting[DeviceSettingKeyEnum.DISTANCE_LIMIT_SET].settingKey)}>确认</CommonButton>
                    </div>
                  </div>
                </CommonPopover>
              </div>

              {/*水平避障*/}
              <div className={"flex space-x-2 items-center justify-between border-[1px] border-[#43ABFF] px-2 py-1"}>
                <div className={"flex flex-col items-center whitespace-nowrap text-[12px]"}>
                  <span>{deviceSetting[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].label}</span>
                  <span
                    className={"text-[12px]"}>{deviceSetting[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].value}</span>
                </div>
                <CommonPopover
                  trigger={<IconButton onClick={onShowPopForm}>
                    <Edit size={16}/>
                  </IconButton>}>
                  <div className={"flex justify-between"}>
                    <div className={"flex items-center space-x-2"}>
                      <Label>{deviceSetting[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].label}：</Label>
                      <CommonSwitch checked={deviceSettingFormModel.obstacleAvoidanceHorizon}
                                    onCheckedChange={(checked) => {
                                      updateDeviceSettingFormModel(draft => {
                                        draft.obstacleAvoidanceHorizon = checked;
                                      });
                                    }}/>
                    </div>
                    <CommonButton
                      onClick={() => onConfirm(deviceSetting[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_HORIZON].settingKey)}>确认</CommonButton>
                  </div>
                </CommonPopover>
              </div>

              {/*上视避障*/}
              <div className={"flex space-x-2 items-center justify-between border-[1px] border-[#43ABFF] px-2 py-1"}>
                <div className={"flex flex-col items-center whitespace-nowrap text-[12px]"}>
                  <span>{deviceSetting[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].label}</span>
                  <span
                    className={"text-[12px]"}>{deviceSetting[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].value}</span>
                </div>
                <CommonPopover
                  trigger={<IconButton onClick={onShowPopForm}>
                    <Edit size={16}/>
                  </IconButton>}>
                  <div className={"flex justify-between"}>
                    <div className={"flex items-center space-x-2"}>
                      <Label>{deviceSetting[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].label}：</Label>
                      <CommonSwitch checked={deviceSettingFormModel.obstacleAvoidanceUpside}
                                    onCheckedChange={(checked) => {
                                      updateDeviceSettingFormModel(draft => {
                                        draft.obstacleAvoidanceUpside = checked;
                                      });
                                    }}/>
                    </div>
                    <CommonButton
                      onClick={() => onConfirm(deviceSetting[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_UPSIDE].settingKey)}>确认</CommonButton>
                  </div>
                </CommonPopover>
              </div>

              {/*下视避障*/}
              <div className={"flex space-x-2 items-center justify-between border-[1px] border-[#43ABFF] px-2 py-1"}>
                <div className={"flex flex-col items-center whitespace-nowrap text-[12px]"}>
                  <span>{deviceSetting[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].label}</span>
                  <span
                    className={"text-[12px]"}>{deviceSetting[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].value}</span>
                </div>
                <CommonPopover
                  trigger={<IconButton onClick={onShowPopForm}>
                    <Edit size={16}/>
                  </IconButton>}>
                  <div className={"flex justify-between"}>
                    <div className={"flex items-center space-x-2"}>
                      <Label>{deviceSetting[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].label}：</Label>
                      <CommonSwitch checked={deviceSettingFormModel.obstacleAvoidanceDownside}
                                    onCheckedChange={(checked) => {
                                      updateDeviceSettingFormModel(draft => {
                                        draft.obstacleAvoidanceDownside = checked;
                                      });
                                    }}/>
                    </div>
                    <CommonButton
                      onClick={() => onConfirm(deviceSetting[DeviceSettingKeyEnum.OBSTACLE_AVOIDANCE_DOWNSIDE].settingKey)}>确认</CommonButton>
                  </div>
                </CommonPopover>
              </div>

            </div>
          </div>
          <div className={"flex items-center space-x-4"}>
            <h3>设备远程调试模式</h3>
            <Switch checked={debugStatus} onCheckedChange={onSwitchDebug}
                    className={"data-[state=checked]:bg-[#43ABFF]"}/>
            {canResetPosition && <Button onClick={onResetPosition} className={"bg-[#43ABFF] h-8"}>一键标定</Button>}
          </div>
          <div className={"grid grid-cols-2 gap-x-4 gap-y-3"}>
            {newCmdList.map(item => <div key={item.cmdKey}
                                         className={"flex space-x-2 items-center justify-between border-[1px] border-[#43ABFF] px-2 py-1"}>
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

