import {DeviceTopicInfo, useMqtt} from "@/hooks/drone/use-mqtt.ts";
import {useCallback, useEffect, useRef} from "react";
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
  const activeCodeKeyRef = useRef<KeyCode | null>(null);
  const mqttHooks = useMqtt(deviceTopicInfo);
  const seqRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>();
  const isKeyDownRef = useRef(false);

  const handleClearInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const handlePublish = (params: DroneControlProtocol) => {
    const body = {
      method: DRC_METHOD.DRONE_CONTROL,
      data: params,
    };
    
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(() => {
      body.data.seq = seqRef.current++;
      seqRef.current++;
      window.console.log('keyCode>>>>', activeCodeKeyRef.current, body);
      mqttHooks?.publishMqtt(deviceTopicInfo.pubTopic, body, {qos: 0});
    }, 50);
  };

  const handleKeyup = (keyCode: KeyCode) => {
    if (!deviceTopicInfo.pubTopic) {
      return toast({
        description: "请确保已经建立DRC链路",
        variant: "destructive"
      });
    }

    if (!isKeyDownRef.current) return;

    const SPEED = 5;
    const HEIGHT = 5;
    const W_SPEED = 20;

    switch (keyCode) {
      case KeyCode.KEY_A:
        handlePublish({y: -SPEED});
        activeCodeKeyRef.current = keyCode;
        break;
      case KeyCode.KEY_W:
        handlePublish({x: SPEED});
        activeCodeKeyRef.current = keyCode;
        break;
      case KeyCode.KEY_S:
        handlePublish({x: -SPEED});
        activeCodeKeyRef.current = keyCode;
        break;
      case KeyCode.KEY_D:
        handlePublish({y: SPEED});
        activeCodeKeyRef.current = keyCode;
        break;
      case "ArrowUp":
        handlePublish({h: HEIGHT});
        activeCodeKeyRef.current = keyCode;
        break;
      case "ArrowDown":
        handlePublish({h: -HEIGHT});
        activeCodeKeyRef.current = keyCode;
        break;
      case KeyCode.KEY_Q:
        handlePublish({w: -W_SPEED});
        activeCodeKeyRef.current = keyCode;
        break;
      case KeyCode.KEY_E:
        handlePublish({w: W_SPEED});
        activeCodeKeyRef.current = keyCode;
        break;
      default:
        break;
    }
  };

  const resetControlState = useCallback(() => {
    activeCodeKeyRef.current = null;
    seqRef.current = 0;
    isKeyDownRef.current = false;
    handleClearInterval();
  }, []);

  useEffect(() => {
    if (isCurrentFlightController && deviceTopicInfo.pubTopic) {
      const handleKeyDown = (e: KeyboardEvent) => {
        isKeyDownRef.current = true;
        handleKeyup(e.code as KeyCode);
      };

      const handleKeyUp = () => {
        isKeyDownRef.current = false;
        resetControlState();
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        resetControlState();
      };
    }
  }, [isCurrentFlightController, deviceTopicInfo.pubTopic, resetControlState]);

  return {
    activeCodeKey: activeCodeKeyRef.current,
    handleKeyup,
    handleEmergencyStop: () => {
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
      mqttHooks?.publishMqtt(deviceTopicInfo.pubTopic, body, {qos: 1});
    },
    resetControlState,
  };
};
