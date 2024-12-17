import {useSceneStore} from "@/store/useSceneStore.ts";
import {useRef, useState} from "react";
import {useVisible} from "@/hooks/public/utils.ts";
import {useAddLeftClickListener, useChangeSelectedEntityImage} from "@/hooks/public/event-listen.ts";
import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import Panel from "@/components/shared-warehouse/Panel.tsx";
import ToolBar from "@/components/toolbar/ToolBar.tsx";
import {cn} from "@/lib/utils.ts";
import {useSharedWareHouseEntities} from "@/hooks/shared-warehouse/entities.ts";
import {useVideoJS} from "react-hook-videojs";
import DetailPanelLayout from "@/components/public/DetailPanelLayout.tsx";

const SharedWarehouse = () => {
  const [videoSrc, setVideoSrc] = useState("");
  const {isFullScreen} = useSceneStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const monitorPanelRef = useRef<HTMLDivElement>(null);
  const {visible, show, hide} = useVisible();
  const {visible: monitorPanelVisible, show: showMonitorPanel, hide: hideMonitorPanel} = useVisible();

  const {changeSelectedEntityImage, recoverSelectedEntityImage} = useChangeSelectedEntityImage("xpgxcSource",
    "xpgxc-point", "sygl");

  const handleClickEntity = (description: Record<string, any>) => {
    console.log(description);
    if (description.type === "monitor") {
      setVideoSrc(description.src);
      showMonitorPanel();
    } else {
      show();
    }
    changeSelectedEntityImage(description.id.toString());
  };

  useSharedWareHouseEntities();

  useAddLeftClickListener(panelRef, handleClickEntity, false);
  useAddLeftClickListener(monitorPanelRef, handleClickEntity);

  const onClose = () => {
    hide();
    recoverSelectedEntityImage();
  };

  const {Video} = useVideoJS({
    controls: true,
    autoplay: true,
    preload: "auto",
    fluid: true,
    sources: [{src: videoSrc}],
  });

  return (
    <>
      {
        isFullScreen && <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
          <DisPlayItemLayout title={"共享仓门禁信息"}>
            <NewCommonTable
              data={[
                {
                  device: "1",
                  openTime: "2024.06.02 12:00:13",
                  closeTime: "2024.06.02 12:01:11",
                  status: "正常",
                },
                {
                  device: "2",
                  openTime: "2024.06.03 12:05:13",
                  closeTime: "2024.06.03 12:06:22",
                  status: "正常",
                },
                {
                  device: "3",
                  openTime: "2024.06.04 12:07:22",
                  closeTime: "2024.06.04 12:08:34",
                  status: "正常",
                },
                {
                  device: "4",
                  openTime: "2024.06.05 11:49:43",
                  closeTime: "2024.06.05 11:50:13",
                  status: "正常",
                },
                {
                  device: "5",
                  openTime: "2024.06.10 12:00:36",
                  closeTime: "2024.06.10 12:02:13",
                  status: "正常",
                },
                {
                  device: "6",
                  openTime: "2024.06.14 12:12:13",
                  closeTime: "2024.06.14 12:14:13",
                  status: "正常",
                },
                {
                  device: "7",
                  openTime: "2024.06.19 12:33:13",
                  closeTime: "2024.06.19 12:35:13",
                  status: "正常",
                },
              ]}
              columns={[
                {
                  key: "序号",
                  render: (item) => <>{item.device}</>
                },
                {
                  key: "开门时间",
                  render: (item) => <>{item.openTime}</>
                },
                {
                  key: "关门时间",
                  render: (item) => <>{item.closeTime}</>
                },
                {
                  key: "状态",
                  render: (item) => <span className={"text-[#21D45A]"}>{item.status}</span>
                }
              ]}
            />
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"门禁报警信息"}>
            <NewCommonTable
              data={[
                {
                  device: "AHD219",
                  warnTime: "2024.06.14 12:12:13",
                  warnInfo: "门未关闭",
                },
                {
                  device: "AHD219",
                  warnTime: "2024.06.15 12:22:33",
                  warnInfo: "门未关闭",
                },
                {
                  device: "AHD219",
                  warnTime: "2024.06.18 12:35:43",
                  warnInfo: "门未关闭",
                },
                {
                  device: "AHD219",
                  warnTime: "2024.06.22 12:42:13",
                  warnInfo: "门未关闭",
                },
                {
                  device: "AHD219",
                  warnTime: "2024.07.02 12:22:13",
                  warnInfo: "门未关闭",
                },
              ]}
              columns={[
                {
                  key: "设备名称",
                  render: (item) => <>
                    <span className={"text-[#3DCAFF]"}>{item.device}</span>
                  </>
                },
                {
                  key: "报警时间",
                  render: (item) => <>{item.warnTime}</>
                },
                {
                  key: "异常信息",
                  render: (item) => <><span className={"text-[#FF9125]"}>{item.warnInfo}</span></>
                }
              ]}
            />
          </DisPlayItemLayout>
        </div>
      }
      {monitorPanelVisible && <div ref={monitorPanelRef} className={"absolute w-[500px] h-[504px] z-50"} style={{
        transform: "translate(-50%,-110%)"
      }}>
        <DetailPanelLayout onClose={() => {
          hideMonitorPanel();
          recoverSelectedEntityImage();
        }} title={"视频监控"} size={"large"} contentType={"component"}>
          <Video className={"video-js vjs-default-skin mt-[40px]"}/>
        </DetailPanelLayout>
      </div>}
      {visible && <div ref={panelRef} className={"absolute w-[940px] h-[580px] z-50 left-1/2 top-1/2"} style={{
        transform: "translate(-50%,-50%)"
      }}>
        <Panel onClose={onClose}/>
      </div>
      }
      <div className={"absolute z-20 right-[50px] bottom-[32px]"}>
        <ToolBar/>
      </div>
      <div style={{
        backgroundSize: "100% 100%"
      }} className={cn("bg-side-container bg-no-repeat w-[560px] h-full absolute top-0 left-0 z-5 my-[80px]",
        isFullScreen ? "w-[560px]" : "w-0")}/>
    </>
  );
};

export default SharedWarehouse;

