import titleArrowPng from "@/assets/images/drone/title-arrow.png";
import MembersDataTable from "@/components/drone/members/MembersDataTable.tsx";
import {useState} from "react";
import OrganizationDataTable from "@/components/drone/members/OrganizationDataTable.tsx";
import RoleDataTable from "@/components/drone/members/RoleDataTable.tsx";
import {cn} from "@/lib/utils.ts";

const OrganDetail = () => {

  const menuList = [
    {
      name: "组织管理",
      table: <OrganizationDataTable/>
    },
    // {
    //   name: "部门管理",
    //   table: <DepartDataTable/>
    // },
    {
      name: "角色管理",
      table: <RoleDataTable/>
    },
    {
      name: "用户管理",
      table: <MembersDataTable/>
    }
  ];

  const [currentMenu, setCurrentMenu] = useState(menuList[0].name);

  return (
    <div className={"w-full h-full bg-gradient-to-r from-[#172A4F]/[.6] to-[#233558]/[.6]"}>
      <div className={"flex-1 border-[#43ABFF] border-[1px] flex flex-col h-full rounded-[8px]"}>
        <h1 className={"flex justify-between items-center"}>
          <div className={"py-4 px-4 flex space-x-4"}>
            <img src={titleArrowPng} alt=""/>
            <div className={"space-x-2"}>
              <span>{currentMenu}</span>
            </div>
          </div>
        </h1>
        <div className={"flex space-x-4 px-4"}>
          {menuList.map(item =>
            <div style={{
              backgroundSize: "100% 100%"
            }} className={cn("bg-device w-[193px] h-[34px] text-[16px] flex content-center cursor-pointer",
              currentMenu === item.name ? "text-[#A1F4FA]" : "")} onClick={() => setCurrentMenu(item.name)}>
              {item.name}
            </div>)}
        </div>
        <div className={"flex-1 p-4"}>
          {menuList.find(item => item.name === currentMenu)?.table}
        </div>
      </div>
    </div>
  );
};

export default OrganDetail;

