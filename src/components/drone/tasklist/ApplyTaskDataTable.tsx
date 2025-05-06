import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useEffect, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Task, useApplyWaylinJobs} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {TaskStatus, TaskTypeMap} from "@/types/task.ts";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {cn} from "@/lib/utils.ts";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {formatMediaTaskStatus, formatTaskStatus, groupTasksByDate, UpdateTaskStatus} from "@/hooks/drone/task";
import {Circle, Edit} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {useNavigate} from "react-router-dom";

const TaskDataTable = () => {
  const {delete: deleteClient, put} = useAjax();
  const navigate = useNavigate();

  const columns: ColumnDef<Task>[] = [
    {
      header: "计划时间 | 实际时间",
      cell: ({row}) => {
        // 格式化时间函数
        const formatTime = (timeStr: string) => {
          if (!timeStr) return "";
          const time = timeStr.split(" ")[1];  // 取空格后的时间部分
          return time ? time.substring(0, 8) : ""; // 只保留时分秒 (HH:mm:ss)
        };

        return (
          <div className="flex gap-0.5 space-x-2">
            <div className="text-gray-400 text-[13px]">
              [{formatTime(row.original.begin_time)}-{formatTime(row.original.end_time)}]
            </div>
            <div className="text-[#43ABFF] text-[13px]">
              {formatTime(row.original.execute_time) ?
                `[${formatTime(row.original.execute_time)}-${formatTime(row.original.completed_time)}]` : "已取消"
              }
            </div>
          </div>
        );
      }
    },
    {
      header: "执行状态",
      cell: ({row}) =>
        <span style={{
          color: formatTaskStatus(row.original).color
        }} className={""}>{formatTaskStatus(row.original).text}</span>
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
    /*{
      header: "媒体上传",
      cell: ({row}) => {
        return <div className={"flex items-center whitespace-nowrap"}>
          <Circle fill={formatMediaTaskStatus(row.original).color} size={16}/>
          <span>{formatMediaTaskStatus(row.original).text}
            {formatMediaTaskStatus(row.original).number && `${formatMediaTaskStatus(row.original).number}`}</span>
        </div>;
      }
    },*/
    {
      header: "操作",
      cell: ({row}) =>
        <div className={"flex whitespace-nowrap space-x-2"}>
          <Button className={"p-0 h-4 bg-transparent"}
                  onClick={() => navigate(`/task-create-apply?id=${1}`)}>
            <Edit size={16}/>
          </Button>
        </div>
    }
  ];

  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const HTTP_PREFIX = "/wayline/api/v1";

  // 删除任务
  const onDeleteTask = async (jobId: string) => {
    try {
      await deleteClient(`${HTTP_PREFIX}/workspaces/${workspaceId}/jobs`, {
        job_id: jobId
      });
      toast({
        description: "任务取消成功！"
      });
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  // 中止任务
  const onSuspandTask = async (jobId: string) => {
    try {
      await put(`${HTTP_PREFIX}/workspaces/${workspaceId}/jobs/${jobId}`, {
        status: UpdateTaskStatus.Suspend
      });
      toast({
        description: "任务中止成功！"
      });
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  // 恢复任务
  const onResumeTask = async (jobId: string) => {
    try {
      await put(`${HTTP_PREFIX}/workspaces/${workspaceId}/jobs/${jobId}`, {
        status: UpdateTaskStatus.Resume
      });
      toast({
        description: "任务恢复成功！"
      });
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
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

  const {data} = useApplyWaylinJobs({
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
    <div className="space-y-2">
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
                          "h-[46px]",
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

      <div className="flex items-center justify-between">
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

