import MembersDataTable from "@/components/drone/members/MembersDataTable.tsx";
import OrganizationDataTable from "@/components/drone/members/OrganizationDataTable.tsx";
import RoleDataTable from "@/components/drone/members/RoleDataTable.tsx";
import {TabbedLayout} from "@/components/drone/public/TabbedLayout.tsx";
import {Network, User, UserSearch} from "lucide-react";

const OrganDetail = () => {

  const menuList = [
    {
      name: "组织管理",
      icon: <Network size={16}/>,
      content: <OrganizationDataTable/>,
      permission: "Collection_WorkspaceView"
    },
    {
      name: "角色管理",
      icon: <UserSearch size={16}/>,
      content: <RoleDataTable/>,
      permission: "Collection_RoleView"
    },
    {
      name: "用户管理",
      icon: <User size={16}/>,
      content: <MembersDataTable/>,
      permission: "Collection_UserView"
    }
  ];

  return <TabbedLayout title="系统管理" defaultTab="组织管理" tabs={menuList} isFullPage/>;
};

export default OrganDetail;

