import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useEffect, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Task, useWaylinJobs} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {OutOfControlActionMap, TaskStatus, TaskStatusColor, TaskStatusMap, TaskTypeMap} from "@/types/task.ts";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {cn} from "@/lib/utils.ts";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";

function formatTaskStatus(task: Task) {
  const statusObj = {
    text: "",
    color: ""
  };
  const {status} = task;
  statusObj.text = TaskStatusMap[status];
  statusObj.color = TaskStatusColor[status];
  return statusObj;
}

const TaskDataTable = () => {
  const {delete: deleteClient} = useAjax();

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "job_name",
      header: "任务名",
    },
    {
      accessorKey: "task_type",
      header: "任务类型",
      cell: ({row}) => <span>{TaskTypeMap[row.original.task_type]}</span>
    },
    {
      accessorKey: "task_type",
      header: "任务类型",
      cell: ({row}) =>
        <span className={`text-[${formatTaskStatus(row.original).color}]`}>{formatTaskStatus(row.original).text}</span>
    },
    {
      accessorKey: "file_name",
      header: "线路名称",
    },
    {
      accessorKey: "dock_name",
      header: "机场",
    },
    {
      accessorKey: "rth_altitude",
      header: "RTH高度",
    },
    {
      accessorKey: "out_of_control_action",
      header: "失联动作",
      cell: ({row}) => <span>{OutOfControlActionMap[row.original.out_of_control_action]}</span>
    },
    {
      accessorKey: "username",
      header: "用户",
    },
    {
      header: "操作",
      cell: ({row}) =>
        <span
          onClick={() => onDeleteTask(row.original.job_id)}
          className={cn("bg-[#43ABFF] hover:bg-[#43ABFF] py-2 px-4 rounded-md cursor-pointer", row.original.status === TaskStatus.Wait ? "" : "bg-transparent")}>
        {row.original.status === TaskStatus.Wait && "删除"}
      </span>
    }
  ];

  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const HTTP_PREFIX = "/wayline/api/v1";
  const onDeleteTask = async (jobId: string) => {
    await deleteClient(`${HTTP_PREFIX}/workspaces/${workspaceId}/jobs`, {
      job_id: jobId
    });
    toast({
      description: "任务取消成功！"
    });
  };

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {data} = useWaylinJobs(workspaceId, {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    total: 0
  });

  useEffect(() => {
    console.log("data==");
    console.log(data);
  }, [data]);

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

export default TaskDataTable;

