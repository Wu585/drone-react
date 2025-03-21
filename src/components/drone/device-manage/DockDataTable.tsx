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
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import { EditDeviceDialog, EditDeviceFormValues } from "./EditDeviceDialog";

const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

const DockDataTable = () => {
  const [currentDock, setCurrentDock] = useState<Device | null>(null);
  const [open, setOpen] = useState(false);
  const {put} = useAjax();

  const handleEdit = (device: Device) => {
    setCurrentDock(device);
    setOpen(true);
  };

  const handleSubmit = async (values: EditDeviceFormValues) => {
    setOpen(false);
    try {
      await put(`manage/api/v1/devices/${workspaceId}/devices/${currentDock?.device_sn}`, values);
      toast({
        description: "编辑成功"
      });
      await mutate();
    } catch (err: any) {
      toast({
        description: "编辑失败",
        variant: "destructive"
      });
    }
  };

  const columns: ColumnDef<Device>[] = [
    {
      accessorKey: "device_name",
      header: "型号",
      cell: ({row}) => (
        <div className="truncate" title={row.getValue("device_name")}>
          {row.getValue("device_name")}
        </div>
      )
    },
    {
      accessorKey: "device_sn",
      header: "设备SN",
      cell: ({row}) => (
        <div className=" truncate" title={row.getValue("device_sn")}>
          {row.getValue("device_sn")}
        </div>
      )
    },
    {
      accessorKey: "nickname",
      header: "名称",
      cell: ({row}) => (
        <div className=" truncate" title={row.getValue("nickname")}>
          {row.getValue("nickname")}
        </div>
      )
    },
    {
      accessorKey: "firmware_version",
      header: "固件版本",
      cell: ({row}) => (
        <div className="truncate" title={row.getValue("firmware_version")}>
          {row.getValue("firmware_version")}
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({row}) => (
        <div className="">
          <span className={row.original.status ? "text-green-500" : "text-red-500"}>
            {row.original.status ? "在线" : "离线"}
          </span>
        </div>
      )
    },
    {
      accessorKey: "workspace_name",
      header: "组织",
      cell: ({row}) => (
        <div className=" truncate" title={row.getValue("workspace_name")}>
          {row.getValue("workspace_name")}
        </div>
      )
    },
    {
      accessorKey: "login_time",
      header: "最后在线时间",
      cell: ({row}) => (
        <div className=" truncate" title={row.getValue("login_time")}>
          {row.getValue("login_time")}
        </div>
      )
    },
    {
      header: "操作",
      cell: ({row}) => {
        return (
          <div className="">
            <Edit
              size={16}
              className="cursor-pointer hover:text-[#43ABFF] transition-colors"
              onClick={() => handleEdit(row.original)}
            />
          </div>
        );
      }
    },
  ];

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {data, mutate} = useBindingDevice(workspaceId, {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    total: 0,
    domain: EDeviceTypeName.Dock
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
    <div className="flex flex-col h-full">
      <EditDeviceDialog
        open={open}
        onOpenChange={setOpen}
        device={currentDock}
        title="机场编辑"
        label="机场名称："
        placeholder="输入机场名称"
        onSubmit={handleSubmit}
      />

      <div className="flex-1 overflow-hidden border border-[#43ABFF] rounded">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-[#43ABFF]">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-[#0A81E1]/70 text-white font-medium h-12"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-[#0A4088]/70">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-[#43ABFF]/30 hover:bg-[#0A81E1]/10 transition-colors h-14"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-[#D0D0D0] px-4"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-[#43ABFF]"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4 text-[#D0D0D0]">
        <Label className="text-left">
          共 {data?.pagination.total || 0} 条记录，共 {table.getPageCount()} 页
        </Label>
        <div className="space-x-2">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-[#0A81E1] hover:bg-[#0A81E1]/80 disabled:opacity-50"
          >
            上一页
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-[#0A81E1] hover:bg-[#0A81E1]/80 disabled:opacity-50"
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DockDataTable;

