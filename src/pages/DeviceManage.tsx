import DroneDataTable from "@/components/drone/device-manage/DroneDataTable.tsx";
import DockDataTable from "@/components/drone/device-manage/DockDataTable.tsx";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";
import {Drone, Package2} from "lucide-react";
import {TabbedLayout} from "@/components/drone/public/TabbedLayout.tsx";

const DeviceManage = () => {
  useInitialConnectWebSocket();

  const tabs = [
    {
      name: "飞行器信息",
      icon: <Drone size={16} />,
      content: <DroneDataTable />,
    },
    {
      name: "机场信息",
      icon: <Package2 size={16} />,
      content: <DockDataTable />,
    },
  ];

  return <TabbedLayout title="设备管理" defaultTab="飞行器信息" tabs={tabs} />;
};

export default DeviceManage;

