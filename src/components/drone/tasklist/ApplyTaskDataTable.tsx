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
import {ApplyTask, ApplyTaskStatus, applyTaskStatusMap, useApplyWaylinJobs} from "@/hooks/drone";
import {TaskType, TaskTypeMap} from "@/types/task.ts";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {Edit, ReceiptText, Trash} from "lucide-react";
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
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import dayjs from "dayjs";
import {ELocalStorageKey} from "@/types/enum.ts";

const TaskDataTable = () => {
  const {delete: deleteClient, post} = useAjax();
  const navigate = useNavigate();
  const [taskStatus, setTaskStatus] = useState<ApplyTaskStatus>();
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | undefined>();
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

  const columns: ColumnDef<ApplyTask>[] = [
    {
      accessorKey: "name",
      header: "计划名称",
    },
    {
      accessorKey: "create_time",
      header: "申请时间",
      cell: ({row}) => <span>{dayjs(row.original.create_time).format("YYYY-MM-DD HH:mm:ss")}</span>
    },
    {
      accessorKey: "task_days",
      header: "执行日期",
      cell: ({row}) => <span>{row.original.task_days.length > 0 &&
        dayjs.unix(row.original.task_days[0]).format("YYYY-MM-DD") + "~" + dayjs.unix(row.original.task_days[row.original.task_days.length - 1]).format("YYYY-MM-DD")}</span>
    },
    {
      accessorKey: "task_periods",
      header: "执行时间",
      cell: ({row}) => {
        const {task_periods, task_type} = row.original;
        let time;
        if (task_type === TaskType.Timed) {
          time = task_periods.map(item => dayjs.unix(item[0]).format("HH:mm:ss")).join(",");
        } else if (task_type === TaskType.Condition) {
          time = task_periods.map(item => dayjs.unix(item[0]).format("HH:mm:ss") + "-" + dayjs.unix(item[1]).format("HH:mm:ss")).join(",");
        }
        return <span>{time}</span>;
      }
    },
    {
      accessorKey: "task_type",
      header: "类型",
      cell: ({row}) => <span>{TaskTypeMap[row.original.task_type]}</span>
    },
    {
      accessorKey: "wayline_name",
      header: "航线名称",
      cell: ({row}) => <span>{row.original.wayline_name ?? "--"}</span>
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
      accessorKey: "status",
      header: "审核状态",
      cell: ({row}) => <span
        className={applyTaskStatusMap[row.original.status].color}>{applyTaskStatusMap[row.original.status].name}</span>
    },
    {
      header: "操作",
      cell: ({row}) =>
        <div className={"flex whitespace-nowrap space-x-2"}>
          <Button className={"p-0 h-4 bg-transparent"}
                  onClick={() => navigate(`/task-create-apply?id=${row.original.id}`)}>
            <Edit size={16}/>
          </Button>
          <Button className={"p-0 h-4 bg-transparent"} onClick={() => {
            setOpen(true);
            setCurrentId(row.original.id);
          }}>
            <ReceiptText size={16}/>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger className={""} asChild>
              <Button
                className={"p-0 h-4 bg-transparent"}>
                <Trash size={16}/>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>删除申请任务</AlertDialogTitle>
                <AlertDialogDescription>
                  确认删除这条申请任务吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={async () => {
                  await onDeleteTask(row.original.id);
                  toast({
                    description: "删除成功！"
                  });
                  await mutate();
                }}>确认</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
    }
  ];

  const HTTP_PREFIX = "/wayline/api/v1";

  // 删除任务
  const onDeleteTask = async (jobId: number) => {
    try {
      await deleteClient(`${HTTP_PREFIX}/wayline-job-audit/${jobId}`);
      toast({
        description: "任务删除成功！"
      });
      await mutate();
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  const onAuditTask = async (id: number) => {
    if (!taskStatus) return toast({
      description: "请选择审核结果！",
      variant: "destructive"
    });
    const selectedTask = data?.list.find(item => item.id === currentId);
    if (!selectedTask) return;
    if (!selectedTask.file_id && taskStatus === ApplyTaskStatus.APPROVED) return toast({
      description: "还未绑定航线！",
      variant: "destructive"
    });
    try {
      const res: any = await post(`${HTTP_PREFIX}/wayline-job-audit/approve`, {
        id,
        status: taskStatus
      });
      if (res.data.code === 0) {
        await post(`${HTTP_PREFIX}/workspaces/${workspaceId}/flight-tasks`, selectedTask as any);
        toast({
          description: "审核成功，任务创建成功！"
        });
        await mutate();
        setCurrentId(undefined);
        setTaskStatus(undefined);
      }
    } catch (err) {
      toast({
        description: "审核失败！",
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

  const {data, mutate} = useApplyWaylinJobs({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    total: 0,
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>飞行任务审核</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                审核结果
              </Label>
              <Select value={taskStatus?.toString() || ""} onValueChange={(value) => setTaskStatus(+value)}>
                <SelectTrigger className={"col-span-3"}>
                  <SelectValue placeholder="选择审核结果"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ApplyTaskStatus.APPROVED.toString()}>通过</SelectItem>
                  <SelectItem value={ApplyTaskStatus.REJECTED.toString()}>驳回</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button type="submit" onClick={() => onAuditTask(currentId!)}>确认</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-[#43ABFF]/30 hover:bg-[#0A81E1]/10 transition-colors h-[46px]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-[#D0D0D0] px-4 align-middle leading-none"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
              /*groupTasksByDate(data?.list || []).map(([date, tasks]) => (
                <>
                  {/!* 日期分组行 *!/}
                  <TableRow key={`date-${date}`} className="bg-[#0A81E1]/20">
                    <TableCell
                      colSpan={columns.length}
                      className="py-2 px-4 font-medium text-[#43ABFF] border-b border-[#0A81E1]/30"
                    >
                      {date}
                    </TableCell>
                  </TableRow>
                  {/!* 任务数据行 *!/}
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
              ))*/
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

