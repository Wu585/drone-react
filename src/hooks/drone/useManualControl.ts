import {DeviceTopicInfo, useMqtt} from "@/hooks/drone/use-mqtt.ts";
import {useEffect, useRef, useState} from "react";
import {DRC_METHOD, DroneControlProtocol} from "@/types/drc.ts";
import {toast} from "@/components/ui/use-toast.ts";

export enum KeyCode {
  KEY_W = "KeyW",
  KEY_A = "KeyA",
  KEY_S = "KeyS",
  KEY_D = "KeyD",
  KEY_Q = "KeyQ",
  KEY_E = "KeyE",
  ARROW_UP = "ArrowUp",
  ARROW_DOWN = "ArrowDown",
}

export const useManualControl = (deviceTopicInfo: DeviceTopicInfo, isCurrentFlightController: boolean) => {
  const [activeCodeKey, setActiveCodeKey] = useState<KeyCode | null>(null);
  const mqttHooks = useMqtt(deviceTopicInfo);
  const seqRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>();

  const handlePublish = (params: DroneControlProtocol) => {
    const body = {
      method: DRC_METHOD.DRONE_CONTROL,
      data: params,
    };
    handleClearInterval();
    intervalRef.current = setInterval(() => {
      body.data.seq = seqRef.current++;
      seqRef.current++;
      console.log("keyCode>>>>", activeCodeKey, body);
      mqttHooks?.publishMqtt(deviceTopicInfo.pubTopic, body, {qos: 0});
    }, 50);
  };

  const handleClearInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = undefined;
  };

  const handleKeyup = (keyCode: KeyCode) => {
    if (!deviceTopicInfo.pubTopic) {
      return toast({
        description: "请确保已经建立DRC链路",
        variant: "destructive"
      });
    }
    const SPEED = 5; //  check
    const HEIGHT = 5; //  check
    const W_SPEED = 20; // 机头角速度
    seqRef.current = 0;
    switch (keyCode) {
      case "KeyA":
        if (activeCodeKey === keyCode) return;
        handlePublish({y: -SPEED});
        setActiveCodeKey(keyCode);
        break;
      case "KeyW":
        if (activeCodeKey === keyCode) return;
        handlePublish({x: SPEED});
        setActiveCodeKey(keyCode);
        break;
      case "KeyS":
        if (activeCodeKey === keyCode) return;
        handlePublish({x: -SPEED});
        setActiveCodeKey(keyCode);
        break;
      case "KeyD":
        if (activeCodeKey === keyCode) return;
        handlePublish({y: SPEED});
        setActiveCodeKey(keyCode);
        break;
      case "ArrowUp":
        if (activeCodeKey === keyCode) return;
        handlePublish({h: HEIGHT});
        setActiveCodeKey(keyCode);
        break;
      case "ArrowDown":
        if (activeCodeKey === keyCode) return;
        handlePublish({h: -HEIGHT});
        setActiveCodeKey(keyCode);
        break;
      case "KeyQ":
        if (activeCodeKey === keyCode) return;
        handlePublish({w: -W_SPEED});
        setActiveCodeKey(keyCode);
        break;
      case "KeyE":
        if (activeCodeKey === keyCode) return;
        handlePublish({w: W_SPEED});
        setActiveCodeKey(keyCode);
        break;
      default:
        break;
    }
  };

  const resetControlState = () => {
    setActiveCodeKey(null);
    seqRef.current = 0;
    handleClearInterval();
  };

  const onKeyup = () => {
    resetControlState();
  };

  const onKeydown = (e: KeyboardEvent) => {
    handleKeyup(e.code as KeyCode);
  };

  const startKeyboardManualControl = () => {
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("keyup", onKeyup);
  };

  const closeKeyboardManualControl = () => {
    resetControlState();
    window.removeEventListener("keydown", onKeydown);
    window.removeEventListener("keyup", onKeyup);
  };

  useEffect(() => {
    if (isCurrentFlightController && deviceTopicInfo.pubTopic) {
      startKeyboardManualControl();
    } else {
      closeKeyboardManualControl();
    }
  }, [isCurrentFlightController]);

  useEffect(() => {
    return () => {
      closeKeyboardManualControl();
    };
  }, []);

  const handleEmergencyStop = () => {
    if (!deviceTopicInfo.pubTopic) {
      return toast({
        description: "请确保已经建立DRC链路",
        variant: "destructive"
      });
    }
    const body = {
      method: DRC_METHOD.DRONE_EMERGENCY_STOP,
      data: {}
    };
    resetControlState();
    console.log("handleEmergencyStop>>>>", deviceTopicInfo.pubTopic, body);
    mqttHooks?.publishMqtt(deviceTopicInfo.pubTopic, body, {qos: 1});
  };

  return {
    activeCodeKey,
    handleKeyup,
    handleEmergencyStop,
    resetControlState,
  };
};
