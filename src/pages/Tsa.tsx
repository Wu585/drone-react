import {Eye, EyeOff} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion.tsx";
import {useOnlineDocks} from "@/hooks/drone";
import GMap from "@/components/drone/public/GMap.tsx";
import DronePanel from "@/components/drone/public/DronePanel.tsx";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {EDockModeCode, EModeCode} from "@/types/device.ts";
import {OnlineDevice} from "@/hooks/drone/device.ts";
import _DronePanel from "@/components/drone/public/_DronePanel.tsx";

const Tsa = () => {
  const {
    deviceState,
    osdVisible,
    hmsInfo,
    setOsdVisible
  } = useSceneStore();

  console.log('deviceState');
  console.log(deviceState);

  const {onlineDocks} = useOnlineDocks();

  const switchVisible = (dock: OnlineDevice) => {
    if (dock.sn === osdVisible.sn) {
      setOsdVisible({
        ...osdVisible,
        sn: dock.sn,
        callsign: dock.callsign,
        model: dock.model,
        gateway_sn: dock.gateway.sn,
        gateway_callsign: dock.gateway.callsign,
        payloads: dock.payload,
        visible: !osdVisible.visible,
        is_dock: true
      });
    } else {
      setOsdVisible({
        sn: dock.sn,
        callsign: dock.callsign,
        model: dock.model,
        visible: true,
        gateway_sn: dock.gateway.sn,
        gateway_callsign: dock.gateway.callsign,
        payloads: dock.payload,
        is_dock: true
      });
    }
  };

  return (
    <div className={"w-full h-full flex space-x-[20px]"}>
      <div
        className={"w-[340px] border-[1px] h-full border-[#43ABFF] bg-gradient-to-r " +
          "from-[#074578]/[.5] to-[#0B142E]/[.9] rounded-tr-lg rounded-br-lg border-l-0"}>
        <Accordion type="single" defaultValue="item-1" collapsible>
          <AccordionItem value="item-1" className={"border-b-[1px] border-b-[#265C9A]"}>
            <AccordionTrigger className={"px-[12px]"}>
              <div className={"flex content-center space-x-4"}>
                <span>机场</span>
                {/*<Info size={14}/>*/}
              </div>
            </AccordionTrigger>
            <AccordionContent className={"p-[12px]"}>
              {onlineDocks.map(dock =>
                <div key={dock.sn} className={"h-[172px] bg-dock-panel bg-full-size flex flex-col"}>
                  <div className={"flex h-full"}>
                    <div className={"flex-1"}>
                      <div className={"pl-[24px] pt-[16px]"}>
                        {dock.gateway.callsign} - {dock.callsign ?? "暂无机器"}
                      </div>
                      <div className={"pl-[24px] pt-[16px] space-y-4"}>
                        <div className={"flex"}>
                          <div
                            className={cn("pl-4 w-2/3 bg-[#2E3751]/[.88] text-[#40F2FF]",
                              deviceState.dockInfo[dock.gateway.sn] && deviceState.dockInfo[dock.gateway.sn].basic_osd?.mode_code !== EDockModeCode.Disconnected ? "text-[#00ee8b]" : "text-red-500")}>
                            {deviceState.dockInfo[dock.gateway.sn] ? EDockModeCode[deviceState.dockInfo[dock.gateway.sn].basic_osd?.mode_code] : EModeCode[EModeCode.Disconnected]}
                          </div>
                          <div className={"w-1/3 bg-[#52607D] pl-4"}>
                            <span>{hmsInfo[dock.gateway.sn]?.length}</span>
                          </div>
                        </div>
                        <div className={"flex"}>
                          <div className={cn("pl-4 w-2/3 bg-[#2E3751]/[.88] text-[#40F2FF]",
                            deviceState.deviceInfo[dock.sn] && deviceState.deviceInfo[dock.sn].mode_code !== EDockModeCode.Disconnected ? "text-[#00ee8b]" : "text-red-500")}>
                            {deviceState.deviceInfo[dock.sn] ? EModeCode[deviceState.deviceInfo[dock.sn].mode_code] : EModeCode[EModeCode.Disconnected]}
                          </div>
                          <div className={"w-1/3 bg-[#52607D] pl-4"}></div>
                        </div>
                      </div>
                    </div>
                    <div className={"px-[20px] content-center"}>
                      <div
                        onClick={() => switchVisible(dock)}
                        className={cn("cursor-pointer", deviceState.dockInfo[dock.gateway.sn] && deviceState.dockInfo[dock.gateway.sn].basic_osd?.mode_code !== EModeCode.Disconnected ? "" : "cursor-not-allowed")}>
                        {osdVisible.gateway_sn === dock.gateway.sn && osdVisible.visible ? <Eye/> : <EyeOff/>}
                      </div>
                    </div>
                  </div>
                  {/*<div className={"h-[38px] mb-[18px] ml-[12px] flex items-center font-medium"}>
                      <span className={"p-2 bg-[#43ABFF]"}>
                        待执行
                      </span>
                  </div>*/}
                </div>)}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className={"flex-1 border-[2px] rounded-lg border-[#43ABFF] relative"}>
        <GMap/>
        <div className={"absolute left-2 top-2"}>
          {osdVisible.visible && <_DronePanel/>}
        </div>
      </div>
    </div>
  );
};

export default Tsa;

