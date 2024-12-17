import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useNavigate} from "react-router-dom";

const SharedDockMenu = () => {
  const navigate = useNavigate();
  return (
    <Tabs defaultValue="service-shared" className="h-full">
      <TabsList className={"h-full"}>
        <TabsTrigger
          value="service-shared"
          className={"text-[#22px] data-[state=active]:bg-transparent data-[state=active]:text-[#3DCAFF] data-[state=active]:bg-opacity-80 h-full"}
          onClick={() => navigate("/shared-dock/service-shared")}
        >
          服务共享
        </TabsTrigger>
        <TabsTrigger
          value="reource-dock"
          className={"text-[#22px] data-[state=active]:bg-transparent data-[state=active]:text-[#3DCAFF] data-[state=active]:bg-opacity-80 h-full"}
          onClick={() => navigate("/shared-dock/resource-dock")}
        >
          资源对接
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default SharedDockMenu;

