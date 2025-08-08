import {useMqtt} from "@/hooks/drone/use-mqtt.ts";
import {useEffect, useState} from "react";
import {uuidv4} from "@/lib/utils.ts";
import dayjs from "dayjs";
import {toast} from "@/components/ui/use-toast.ts";

// 红外相机类型
export enum IrHeatType {
  WhiteHot = 0,      // 白热
  BlackHot = 1,      // 黑热
  RedOutline = 2,    // 描红
  Medical = 3,       // 医疗
  Rainbow1 = 5,      // 彩虹 1
  IronRed = 6,       // 铁红
  Arctic = 8,        // 北极
  Lava = 11,         // 熔岩
  HotIron = 12,      // 热铁
  Rainbow2 = 13      // 彩虹 2
}

export const HeatTypeChinese = {
  [IrHeatType.WhiteHot]: "白热",
  [IrHeatType.BlackHot]: "黑热",
  [IrHeatType.RedOutline]: "描红",
  [IrHeatType.Medical]: "医疗",
  [IrHeatType.Rainbow1]: "彩虹 1",
  [IrHeatType.IronRed]: "铁红",
  [IrHeatType.Arctic]: "北极",
  [IrHeatType.Lava]: "熔岩",
  [IrHeatType.HotIron]: "热铁",
  [IrHeatType.Rainbow2]: "彩虹 2"
} as const;

export const useIrMode = (dockSn: string) => {
  const [irMode, setIrMode] = useState<IrHeatType | undefined>();
  const {publishMqtt, subscribeMqtt} = useMqtt({
    sn: "",
    pubTopic: "",
    subTopic: ""
  });

  useEffect(() => {
    subscribeMqtt(`thing/product/${dockSn}/property/set_reply`, (message) => {
      const payloadStr = new TextDecoder("utf-8").decode(message?.payload);
      const payloadObj = JSON.parse(payloadStr);
      if (payloadObj.data["53-0-0"] && payloadObj.data["53-0-0"].thermal_current_palette_style.result === 0) {
        toast({
          description: "红外调色盘设置成功！"
        });
      } else if (payloadObj.data["53-0-0"] && payloadObj.data["53-0-0"].thermal_current_palette_style.result !== 0) {
        toast({
          description: "红外调色盘设置成功失败！",
          variant: "destructive"
        });
      }
    });
  }, [dockSn, subscribeMqtt]);

  const onChangeIrMode = (mode: IrHeatType) => {
    setIrMode(mode);
    publishMqtt(`thing/product/${dockSn}/property/set`, {
      bid: uuidv4(),
      data: {
        "53-0-0": {
          thermal_current_palette_style: mode
        }
      },
      tid: uuidv4(),
      timestamp: dayjs().valueOf()
    });
  };

  return {
    irMode,
    onChangeIrMode
  };
};
