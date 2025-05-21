import { DeviceTopicInfo, useMqtt } from "@/hooks/drone/use-mqtt.ts";
import { useCallback, useEffect, useRef } from "react";
import { DRC_METHOD, DroneControlProtocol } from "@/types/drc.ts";
import { toast } from "@/components/ui/use-toast.ts";

export enum KeyCode {
  KEY_W = "KeyW",
  KEY_A = "KeyA",
  KEY_S = "KeyS",
  KEY_D = "KeyD",
  KEY_Q = "KeyQ",
  KEY_E = "KeyE",
  ARROW_UP = "ArrowUp",
  ARROW_DOWN = "ArrowDown",
  SPACE = "Space", // 添加空格键枚举
}

// 新增类型：按键与控制参数的映射
type ControlMapping = {
  [key in KeyCode]?: Partial<DroneControlProtocol>;
};

export const useManualControl = (
  deviceTopicInfo: DeviceTopicInfo,
  isCurrentFlightController: boolean
) => {
  const activeKeysRef = useRef<Set<KeyCode>>(new Set()); // 改用 Set 跟踪多个按键
  const mqttHooks = useMqtt(deviceTopicInfo);
  const seqRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>();

  // 控制参数映射表（新增）
  const CONTROL_MAPPING: ControlMapping = {
    [KeyCode.KEY_W]: { x: 5 },
    [KeyCode.KEY_S]: { x: -5 },
    [KeyCode.KEY_A]: { y: -5 },
    [KeyCode.KEY_D]: { y: 5 },
    [KeyCode.ARROW_UP]: { h: 5 },
    [KeyCode.ARROW_DOWN]: { h: -5 },
    [KeyCode.KEY_Q]: { w: -20 },
    [KeyCode.KEY_E]: { w: 20 },
  };

  // 合并多个按键的控制参数（新增）
  const getCombinedParams = (): DroneControlProtocol => {
    const params: DroneControlProtocol = {};
    activeKeysRef.current.forEach((key) => {
      Object.assign(params, CONTROL_MAPPING[key]);
    });
    return params;
  };

  const handleClearInterval = useCallback(() => {
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = undefined;
  }, []);

  // 重构后的发送逻辑
  const startSendingCommands = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      const params = getCombinedParams();
      if (Object.keys(params).length === 0) return;

      const body = {
        method: DRC_METHOD.DRONE_CONTROL,
        data: { ...params, seq: seqRef.current++ },
      };

      mqttHooks?.publishMqtt(deviceTopicInfo.pubTopic!, body, { qos: 0 });
    }, 50);
  };

  // 修改后的键盘事件处理
  const handleKeyEvent = (e: KeyboardEvent, isKeyDown: boolean) => {
    if (!deviceTopicInfo.pubTopic) {
      toast({
        description: "请确保已经建立DRC链路",
        variant: "destructive",
      });
      return;
    }

    const key = e.code as KeyCode;

    // 处理空格键优先
    if (key === KeyCode.SPACE && isKeyDown) {
      e.preventDefault();
      handleEmergencyStop();
      return;
    }

    // 更新按键状态
    if (isKeyDown) {
      activeKeysRef.current.add(key);
    } else {
      activeKeysRef.current.delete(key);
    }

    // 控制指令发送启停
    if (activeKeysRef.current.size > 0) {
      startSendingCommands();
    } else {
      handleClearInterval();
    }
  };

  const resetControlState = useCallback(() => {
    activeKeysRef.current.clear();
    seqRef.current = 0;
    handleClearInterval();
  }, [handleClearInterval]);

  const handleEmergencyStop = () => {
    const body = {
      method: DRC_METHOD.DRONE_EMERGENCY_STOP,
      data: {},
    };
    resetControlState();
    mqttHooks?.publishMqtt(deviceTopicInfo.pubTopic!, body, { qos: 1 });
  };

  useEffect(() => {
    if (!isCurrentFlightController) return;

    const onKeyDown = (e: KeyboardEvent) => handleKeyEvent(e, true);
    const onKeyUp = (e: KeyboardEvent) => handleKeyEvent(e, false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      resetControlState();
    };
  }, [isCurrentFlightController, deviceTopicInfo.pubTopic, resetControlState]);

  return {
    activeKeys: Array.from(activeKeysRef.current),
    handleEmergencyStop,
    resetControlState,
  };
};
