import {cn} from "@/lib/utils.ts";
import {useState} from "react";
import titleArrowPng from "@/assets/images/drone/title-arrow.png";
import DroneDataTable from "@/components/drone/device-manage/DroneDataTable.tsx";
import DockDataTable from "@/components/drone/device-manage/DockDataTable.tsx";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";

const DeviceManage = () => {
  useInitialConnectWebSocket();

  const deviceList = [
    {
      name: "飞行器信息"
    },
    {
      name: "机场信息"
    }
  ];

  const [currentDevice, setCurrentDevice] = useState("飞行器信息");

  return (
    <div className={"w-full h-full flex bg-gradient-to-r from-[#172A4F]/[.6] to-[#233558]/[.6]"}>
      <div className={"flex-1 border-[#43ABFF] border-[1px] border-l-0 flex flex-col rounded-r-lg"}>
        <h1 className={"flex justify-between items-center"}>
          <div className={"py-4 px-4 flex space-x-4"}>
            <img src={titleArrowPng} alt=""/>
            <div className={"space-x-2"}>
              <span>设备管理</span>
              <span>|</span>
              <span>{currentDevice}</span>
            </div>
          </div>
        </h1>
        <div className={"flex space-x-8 px-4"}>
          {deviceList.map(item =>
            <div key={item.name} style={{
              backgroundSize: "100% 100%"
            }} className={cn("bg-device w-[193px] h-[34px] text-[16px] flex content-center cursor-pointer",
              currentDevice === item.name ? "text-[#A1F4FA]" : "")} onClick={() => setCurrentDevice(item.name)}>
              {item.name}
            </div>)}
        </div>
        <div className={"flex-1 p-4"}>
          {currentDevice === "飞行器信息" ? <DroneDataTable/> : <DockDataTable/>}
        </div>
      </div>
    </div>
  );
};

export default DeviceManage;

