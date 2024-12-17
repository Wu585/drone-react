import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList, BreadcrumbPage,
} from "@/components/ui/breadcrumb.tsx";
import {Content, useUsers} from "@/hooks/manage-system/api.ts";
import {ColumnDef} from "@tanstack/react-table";
import UserDataTable from "@/pages/manage-system/UserDataTable.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";

export const columns: ColumnDef<Content>[] = [
  {
    id: "select",
    header: ({table}) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({row}) => (
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
    header: "用户名称",
  },
  {
    accessorKey: "nickname",
    header: "用户昵称",
  },
  {
    accessorKey: "ownRoles",
    header: "关联角色",
  },
  {
    accessorKey: "isLocked",
    header: "状态",
    cell: ({row}) => <span>{row.original.isLocked ? "锁定" : "正常"}</span>
  },
  {
    accessorKey: "maxDataCapacity",
    header: "最大数据容量(MB)",
    cell: ({row}) => <span>{(row.original.maxDataCapacity / 1000000).toFixed(2)}</span>
  },
];

const UserManage = () => {
  const {data: userList} = useUsers();

  return (
    <div className="pt-8 pb-8 px-8 h-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className={"text-[#263339] font-bold"}>用户管理</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className={"bg-white h-full mt-2 py-8 px-10"}>
        <UserDataTable columns={columns} data={userList?.content || []}/>
      </div>
    </div>
  );
};

export default UserManage;

