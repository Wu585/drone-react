import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList, BreadcrumbPage,
} from "@/components/ui/breadcrumb.tsx";
import {ServiceContent, useServices} from "@/hooks/manage-system/api.ts";
import {ColumnDef} from "@tanstack/react-table";
import ServiceDataTable from "@/pages/manage-system/ServiceDataTable.tsx";
import {format} from "date-fns";
import {Button} from "@/components/ui/button.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";

const columns: ColumnDef<ServiceContent>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "resTitle",
    header: "名称",
  },
  {
    accessorKey: "enable",
    header: "启用状态",
    cell: ({row}) => <span>{row.original.enable ? "启用" : "未启用"}</span>
  },
  {
    accessorKey: "linkPage",
    header: "地址",
    cell: ({row}) => <Button
      variant={"link"}
      onClick={() => window.open(row.original.linkPage)}>
      {row.original.linkPage}
    </Button>
  },
  {
    accessorKey: "type",
    header: "类型",
  },
  {
    accessorKey: "userName",
    header: "所有者",
  },
  {
    accessorKey: "createTime",
    header: "注册时间",
    cell: ({row}) => <span>{format(new Date(row.original.createTime), "yyyy-MM-dd HH:mm:ss")}</span>
  }
];

const ServiceManage = () => {
  const {data: serviceList} = useServices();

  return (
    <div className="pt-8 pb-8 px-8 h-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className={"text-[#263339] font-bold"}>服务管理</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className={"bg-white h-full mt-2 py-8 px-10"}>
        <ServiceDataTable columns={columns} data={serviceList?.content || []}/>
      </div>
    </div>
  );
};

export default ServiceManage;

