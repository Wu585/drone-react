import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Device, useBindingDevice} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import {Edit} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

const HTTP_PREFIX = "/manage/api/v1";

const formSchema = z.object({
  name: z.string().min(1, "请输入设备名称")
});

type FormValues = z.infer<typeof formSchema>;

const DroneDataTable = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ""
    }
  });

  const columns: ColumnDef<Device>[] = [
    {
      accessorKey: "device_name",
      header: "型号",
    },
    {
      accessorKey: "device_sn",
      header: "SN",
    },
    {
      accessorKey: "nickname",
      header: "名称",
    },
    {
      accessorKey: "firmware_version",
      header: "固件版本",
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({row}) =>
        <span
          className={row.original.status ? "text-green-500" : "text-red-500"}>{row.original.status ? "在线" : "离线"}</span>
    },
    {
      accessorKey: "workspace_name",
      header: "组织",
    },
    {
      accessorKey: "login_time",
      header: "最后在线时间",
    },
    {
      header: "操作",
      cell: () => {
        return <Dialog>
          <DialogTrigger>
            <Edit size={16} className={"cursor-pointer"}/>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>设备编辑</DialogTitle>
            </DialogHeader>
            <div className={"grid grid-cols-4 items-center gap-4"}>
              <span className={"text-right"}>设备名称：</span>
              <Input className={"col-span-3"}/>
            </div>
            <DialogFooter>
              <Button>确认</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>;
      }
    },
  ];

  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {data} = useBindingDevice(workspaceId, {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    total: 0,
    domain: EDeviceTypeName.Aircraft
  });

  const table = useReactTable({
    data: data?.list || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: data?.pagination.total,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: pagination,
    },
  });

  return (
    <div>
      <div className="">
        <Table className={"border-[1px] border-[#0A81E1]"}>
          <TableHeader className={""}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={"border-none"}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={"bg-[#0A81E1]/[.7]"}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className={"bg-[#0A4088]/[.7]"}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className={"border-b-[#0A81E1]"}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-[#43ABFF]">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <Label className={"text-left"}>
          共 {data?.pagination.total || 0} 条记录，共 {table.getPageCount()} 页
        </Label>
        <div className={"space-x-2"}>
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            上一页
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DroneDataTable;

