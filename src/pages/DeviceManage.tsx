import {cn} from "@/lib/utils.ts";
import {useState} from "react";

const DeviceManage = () => {
  const deviceList = [
    {
      name: "飞行器管理"
    },
    {
      name: "机场信息"
    }
  ];

  const [currentDevice, setCurrentDevice] = useState("飞行器管理");

  return (
    <div
      className={"w-full h-full border-[1px] border-[#43ABFF] border-l-0 py-[26px] px-[40px] text-[12px] text-[#D0D0D0] space-y-4"}>
      <div className={"space-x-2"}>
        <span>设备管理</span>
        <span>|</span>
        <span>机场信息</span>
      </div>
      <div className={"flex space-x-8"}>
        {deviceList.map(item =>
          <div style={{
            backgroundSize: "100% 100%"
          }} className={cn("bg-device w-[193px] h-[34px] text-[16px] flex content-center cursor-pointer",
            currentDevice === item.name ? "text-[#A1F4FA]" : "")} onClick={() => setCurrentDevice(item.name)}>
            {item.name}
          </div>)}
      </div>
    </div>
  );
};

export default DeviceManage;

