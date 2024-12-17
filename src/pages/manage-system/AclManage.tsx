import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList, BreadcrumbPage,
} from "@/components/ui/breadcrumb.tsx";
import {ColumnDef} from "@tanstack/react-table";
import AclDataTable from "@/pages/manage-system/AclDataTable.tsx";

export const aclList: { name: string, value: string }[] =
  [
    {
      "name": "查看有权限访问的服务",
      "value": "portal:user:viewServices"
    },
    {
      "name": "查看有权限访问的地图",
      "value": "portal:user:viewMaps"
    },
    {
      "name": "查看有权限访问的场景",
      "value": "portal:user:viewScenes"
    },
    {
      "name": "查看、下载有权限的数据",
      "value": "portal:user:viewData"
    },
    {
      "name": "查看有权限访问的项目",
      "value": "portal:user:viewApps"
    },
    {
      "name": "查看有权限访问的洞察",
      "value": "portal:user:viewInsights"
    },
    {
      "name": "查看有权限访问的大屏",
      "value": "portal:user:viewDashboards"
    },
    {
      "name": "查看有权限访问的 Notebook",
      "value": "portal:user:viewNotebooks"
    },
    {
      "name": "下载、执行有权限的 GPA 模型",
      "value": "portal:user:viewGPAModels"
    },
    {
      "name": "查看有权限访问的3D设计",
      "value": "portal:user:viewDesign3Ds"
    },
    {
      "name": "注册、更新、删除服务",
      "value": "portal:user:publishServices"
    },
    {
      "name": "创建、更新、删除项目",
      "value": "portal:user:createUpdateDeleteApps"
    },
    {
      "name": "查看有权限访问的洞察",
      "value": "portal:user:createUpdateDeleteInsights"
    },
    {
      "name": "创建、更新、删除大屏",
      "value": "portal:user:createUpdateDeleteDashboards"
    },
    {
      "name": "申请访问授权",
      "value": "portal:user:applyForAccessToResources"
    },
    {
      "name": "创建、更新、删除 GPA 模型",
      "value": "portal:user:createUpdateDeleteGPAModels"
    },
    {
      "name": "创建、更新、删除 Notebook",
      "value": "portal:user:createUpdateDeleteNotebooks"
    },
    {
      "name": "创建、更新、删除3D设计",
      "value": "portal:user:createUpdateDeleteDesign3Ds"
    },
    {
      "name": "注册、更新、删除服务",
      "value": "portal:user:addUpdateDeleteServices"
    },
    {
      "name": "创建、更新、删除地图",
      "value": "portal:user:createUpdateDeleteMaps"
    },
    {
      "name": "添加地图",
      "value": "portal:user:batchAddMaps"
    },
    {
      "name": "创建、更新、删除场景",
      "value": "portal:user:createUpdateDeleteScenes"
    },
    {
      "name": "批量添加场景",
      "value": "portal:user:batchAddScenes"
    },
    {
      "name": "上传、更新、删除数据",
      "value": "portal:user:uploadUpdateDeleteData"
    }
  ];

const columns: ColumnDef<{ name: string, value: string }>[] = [
  {
    accessorKey: "value",
    header: "权限值",
  },
  {
    accessorKey: "name",
    header: "权限名称",
  }
];

const AclManage = () => {
  return (
    <div className="pt-8 pb-8 px-8 h-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className={"text-[#263339] font-bold"}>权限管理</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className={"bg-white h-full mt-2 py-8 px-10"}>
        <AclDataTable columns={columns} data={aclList}/>
      </div>
    </div>
  );
};

export default AclManage;

