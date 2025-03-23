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

const groupTasksByDate = (tasks: Task[]) => {
  const groups: { [key: string]: Task[] } = {};

  tasks.forEach(task => {
    const date = task.begin_time.split(' ')[0]; // 获取日期部分
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
  });

  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])); // 按日期倒序排列
};

const TaskDataTable = () => {
  const {delete: deleteClient} = useAjax();

  const columns: ColumnDef<Task>[] = [
    {
      header: "计划 | 实际时间",
      cell: ({row}) => <span>
        {row.original.begin_time}-{row.original.end_time}
        |
        {row.original.execute_time}-{row.original.completed_time}
      </span>
    },
    {
      accessorKey: "job_name",
      header: "计划名称",
    },
    {
      accessorKey: "task_type",
      header: "类型",
      cell: ({row}) => <span>{TaskTypeMap[row.original.task_type]}</span>
    },
    {
      header: "任务类型",
      cell: ({row}) =>
        <span className={`text-[${formatTaskStatus(row.original).color}]`}>{formatTaskStatus(row.original).text}</span>
    },
    {
      accessorKey: "file_name",
      header: "航线名称",
    },
    {
      accessorKey: "dock_name",
      header: "机场",
    },
    {
      accessorKey: "username",
      header: "创建人",
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* 保持原有的工具栏内容 */}
        </div>
      </div>

      <div className="rounded-md border border-[#0A81E1] overflow-hidden bg-[#0A4088]/70">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-[#0A81E1]">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-[#0A81E1]/70 text-white h-10 font-medium"
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
              groupTasksByDate(data?.list || []).map(([date, tasks]) => (
                <>
                  {/* 日期分组行 */}
                  <TableRow key={`date-${date}`} className="bg-[#0A81E1]/20">
                    <TableCell
                      colSpan={columns.length}
                      className="py-2 px-4 font-medium text-[#43ABFF] border-b border-[#0A81E1]/30"
                    >
                      {date}
                    </TableCell>
                  </TableRow>
                  {/* 任务数据行 */}
                  {tasks.map((task) => {
                    const row = table.getRowModel().rows.find(
                      r => r.original.job_id === task.job_id
                    );
                    if (!row) return null;

                    return (
                      <TableRow
                        key={row.id}
                        className={cn(
                          "h-[50px]",
                          "border-b border-[#0A81E1]/30",
                          "hover:bg-[#0A4088]/90 transition-colors duration-200",
                          "data-[state=selected]:bg-transparent"
                        )}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "py-3",
                              "align-middle",
                              "px-4",
                              "leading-none"
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </>
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

      <div className="flex items-center justify-between py-2">
        <Label className="text-gray-400">
          共 {data?.pagination.total || 0} 条记录，共 {table.getPageCount()} 页
        </Label>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-[#43ABFF] text-[#43ABFF] hover:bg-[#43ABFF]/10"
          >
            上一页
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-[#43ABFF] text-[#43ABFF] hover:bg-[#43ABFF]/10"
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskDataTable;

