import {Bot, Drone, Eye, EyeOff, Grid3x2, Package2} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion.tsx";
import {useOnlineDocks} from "@/hooks/drone";
import DronePanel from "@/components/drone/public/DronePanel.tsx";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {EDockModeCode, EDockModeCodeMap, EModeCode, EModeCodeMap} from "@/types/device.ts";
import {OnlineDevice, useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import TsaScene from "@/components/drone/public/TsaScene.tsx";
import {useRightClickPanel} from "@/components/drone/public/useRightClickPanel.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import {useAjax} from "@/lib/http.ts";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import MapChange from "@/components/drone/public/MapChange.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";
import {useEffect} from "react";
import {Link} from "react-router-dom";

const DRC_API_PREFIX = "/control/api/v1";

const Tsa = () => {
  useInitialConnectWebSocket();

  const {
    deviceState,
    osdVisible,
    setOsdVisible,
    clearDeviceState
  } = useSceneStore();
  const {post} = useAjax();
  const {onlineDocks} = useOnlineDocks();
  const realTime = useRealTimeDeviceInfo(osdVisible.gateway_sn, osdVisible.sn);

  useEffect(() => {
    clearDeviceState();
  }, [clearDeviceState]);

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
    if (!osdVisible.visible) {
      const selectedDock = deviceState.dockInfo[dock.gateway.sn];
      if (selectedDock.basic_osd?.longitude && selectedDock.basic_osd?.latitude) {
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(selectedDock.basic_osd.longitude, selectedDock.basic_osd.latitude, 500),
          orientation: {
            heading: 0,
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0
          }
        });
      }
    }
  };

 /* const {RightClickPanel, MenuItem, contextMenu} = useRightClickPanel({
    containerId: "cesiumContainer",
  });*/

  /*const onFlyTo = async () => {
    if (!realTime.device) return toast({
      description: "当前状态不支持操作",
      variant: "destructive"
    });
    try {
      await post(`${DRC_API_PREFIX}/devices/${osdVisible.gateway_sn}/jobs/fly-to-point`, {
        max_speed: 14,
        points: [
          {
            latitude: contextMenu.latitude,
            longitude: contextMenu.longitude,
            height: realTime.device.height
          }
        ]
      });
      toast({
        description: "飞行成功！"
      });
      getCustomSource("drone-wayline")?.entities.removeAll();
      const longitude = realTime.device?.longitude;
      const latitude = realTime.device?.latitude;
      if (realTime.device && longitude && latitude) {
        getCustomSource("drone-wayline")?.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([longitude, latitude, realTime.device.height,
              contextMenu.longitude, contextMenu.latitude, realTime.device.height]),
            width: 3,  // 设置折线的宽度
            material: Cesium.Color.BLUE,  // 折线的颜色
          }
        });
      }
    } catch (err: any) {
      toast({
        description: "飞行失败！",
        variant: "destructive"
      });
    }
  };*/

  return (
    <div className={"w-full h-full flex space-x-[20px]"}>
      <div
        className={"w-[400px] border-[1px] h-full border-[#43ABFF] bg-gradient-to-l " +
          "from-[#32547E]/[.5] to-[#1F2D4B] rounded-tr-lg rounded-br-lg border-l-0"}>
        <div className={"flex items-center space-x-4 border-b-[1px] border-b-[#265C9A] px-[12px] py-4 text-sm justify-between"}>
          <div className={"h-8 text-base"}>机场</div>
          <Button variant={"link"} className={"p-0 hover:no-underline h-8"}>
            <Link to={"/multi-live"} className={"content-center space-x-2  w-full h-full text-white hover:text-[#43ABFF]"}>
              <Grid3x2 size={16}/>
              <span>多路直播</span>
            </Link>
          </Button>
        </div>
        <div className={"p-[12px] flex-1 h-[calc(100vh-180px)] overflow-y-auto"}>
          {!onlineDocks || onlineDocks.length === 0 && <div className={"content-center py-8 text-[#d0d0d0]"}>
            暂无数据
          </div>}
          {onlineDocks.map(dock =>
            <div style={{
              backgroundSize: "100% 100%"
            }}
                 className={cn("bg-tsa-online h-[140px] flex flex-col justify-center", !deviceState.dockInfo[dock.gateway.sn] && "bg-tsa-offline")}
                 key={dock.gateway.sn}>
              <div className={"flex h-full"}>
                <div className={"flex-1"}>
                  <div className={"pl-[24px] pt-[16px] text-base"}>
                    {dock.gateway.callsign} - {dock.callsign ?? "暂无机器"}
                  </div>
                  <div className={"pl-[24px] space-y-2 mt-2"}>
                    <div className={"grid grid-cols-6"}>
                      <div
                        className={cn("pl-4 w-full bg-[#2E3751]/[.88] text-[#40F2FF] text-base col-span-5 py-[2px] flex items-center space-x-2",
                          deviceState.dockInfo[dock.gateway.sn] && deviceState.dockInfo[dock.gateway.sn].basic_osd?.mode_code !== EDockModeCode.Disconnected ? "text-[#00ee8b]" : "text-[#c0c0c0]")}>
                        <Package2 className={"text-white"} size={15}/>
                        <span>
                              {deviceState.dockInfo[dock.gateway.sn] ? EDockModeCodeMap[deviceState.dockInfo[dock.gateway.sn].basic_osd?.mode_code] : "设备已离线"}
                        </span>
                      </div>
                      {/*<div className={"w-1/3 bg-[#52607D] pl-4"}>*/}
                      {/*  <span>{hmsInfo[dock.gateway.sn]?.length}</span>*/}
                      {/*</div>*/}
                    </div>
                    <div className={"grid grid-cols-6"}>
                      <div
                        className={cn("pl-4 w-full bg-[#2E3751]/[.88] text-[#40F2FF] text-base col-span-5 py-[2px] flex items-center space-x-2",
                          deviceState.deviceInfo[dock.sn] && deviceState.deviceInfo[dock.sn].mode_code !== EModeCode.Disconnected ? "text-[#00ee8b]" : "text-[#c0c0c0]")}>
                        <Drone color={"white"} size={15}/>
                        <span>{deviceState.deviceInfo[dock.sn] ? EModeCodeMap[deviceState.deviceInfo[dock.sn].mode_code] : "飞行器未连接"}</span>
                      </div>
                      {/*<div className={"w-1/3 bg-[#52607D] pl-4"}></div>*/}
                    </div>
                  </div>
                </div>
                <div className={"content-center pr-6"}>
                  <Button
                    disabled={!deviceState.dockInfo[dock.gateway.sn] || deviceState.dockInfo[dock.gateway.sn]?.basic_osd?.mode_code === EModeCode.Disconnected}
                    onClick={() => switchVisible(dock)}
                    className={cn("cursor-pointer p-0 bg-transparent", deviceState.dockInfo[dock.gateway.sn] && deviceState.dockInfo[dock.gateway.sn].basic_osd?.mode_code !== EModeCode.Disconnected ? "" : "cursor-not-allowed")}>
                    {osdVisible.gateway_sn === dock.gateway.sn && osdVisible.visible ? <Eye/> : <EyeOff/>}
                  </Button>
                </div>
              </div>
              {/*<div className={"h-[38px] mb-[18px] ml-[12px] flex items-center font-medium"}>
                      <span className={"p-2 bg-[#43ABFF]"}>
                        待执行
                      </span>
                  </div>*/}
            </div>)}
        </div>
      </div>
      <div className={"flex-1 border-[2px] rounded-lg border-[#43ABFF] relative"}>
        {/*<GMap/>*/}
        <TsaScene dockSn={osdVisible.gateway_sn} deviceSn={osdVisible.sn}/>
        <div className={"absolute right-0 bottom-0 z-100"}>
          <MapChange/>
        </div>
        {/*<RightClickPanel>*/}
        {/*  <MenuItem onClick={onFlyTo}>飞向此处</MenuItem>*/}
        {/*</RightClickPanel>*/}
        <div className={"absolute left-2 top-2"}>
          {osdVisible.visible && <DronePanel/>}
        </div>
      </div>
    </div>
  );
};

export default Tsa;

