import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList, BreadcrumbPage,
} from "@/components/ui/breadcrumb.tsx";
import {Role, useRoles} from "@/hooks/manage-system/api.ts";
import {useEffect} from "react";
import {ColumnDef} from "@tanstack/react-table";
import RoleDataTable from "@/pages/manage-system/RoleDataTable.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";

const columns: ColumnDef<Role>[] = [
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
    accessorKey: "name",
    header: "角色名称",
  },
  {
    accessorKey: "description",
    header: "角色描述",
  },
];

const RoleManage = () => {
  const {data: roleList} = useRoles();

  useEffect(() => {
    if (!roleList) return;
    console.log(roleList);
  }, [roleList]);

  return (
    <div className="pt-8 pb-8 px-8 h-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className={"text-[#263339] font-bold"}>角色管理</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className={"bg-white h-full mt-2 py-8 px-10"}>
        <RoleDataTable columns={columns} data={roleList || []}/>
      </div>
    </div>
  );
};

export default RoleManage;

