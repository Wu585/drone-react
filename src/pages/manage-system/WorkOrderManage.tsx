import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList, BreadcrumbPage,
} from "@/components/ui/breadcrumb.tsx";
import WorkOrderDataTable from "@/pages/manage-system/WorkOrderDataTable.tsx";

const WorkOrderManage = () => {
  return (
    <div className="pt-8 pb-8 px-8 h-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className={"text-[#263339] font-bold"}>工单管理</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className={"bg-white h-full mt-2 py-8 px-10"}>
        <WorkOrderDataTable/>
      </div>
    </div>
  );
};

export default WorkOrderManage;

