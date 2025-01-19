import {useEffect, useState} from "react";
import {ControlSource} from "@/types/device.ts";
import {ControlSourceChangeInfo, ControlSourceChangeType} from "@/types/drone-control.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {EBizCode} from "@/types/enum.ts";
import EventBus from "@/lib/event-bus.ts";

export const useDroneControlWsEvent = (sn: string, payloadSn?: string) => {
  const [droneControlSource, setDroneControlSource] = useState(ControlSource.A);
  const [payloadControlSource, setPayloadControlSource] = useState(ControlSource.B);
  const {toast} = useToast();

  const onControlSourceChange = (data: ControlSourceChangeInfo) => {
    if (data.type === ControlSourceChangeType.Flight && data.sn === sn) {
      toast({
        description: `Flight control is changed to ${droneControlSource}`
      });
      return setDroneControlSource(data.control_source);
    }
    if (data.type === ControlSourceChangeType.Payload && data.sn === payloadSn) {
      toast({
        description: `Payload control is changed to ${payloadControlSource}`
      });
      return setPayloadControlSource(data.control_source);
    }
  };

  const handleDroneControlWsEvent = (payload: any) => {
    if (!payload) {
      return;
    }
    switch (payload.biz_code) {
      case EBizCode.ControlSourceChange: {
        onControlSourceChange(payload.data);
        break;
      }
    }
  };

  useEffect(() => {
    EventBus.on("droneControlWs", handleDroneControlWsEvent);
    return () => {
      EventBus.off("droneControlWs", handleDroneControlWsEvent);
    };
  }, []);

  return {
    droneControlSource: droneControlSource,
    payloadControlSource: payloadControlSource
  };
};
