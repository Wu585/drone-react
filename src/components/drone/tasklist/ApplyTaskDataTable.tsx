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
import {useState} from "react";
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
import {cn} from "@/lib/utils.ts";

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
      size: 160,
      cell: ({row}) => (
        <div className="max-w-[160px] truncate" title={row.original.name}>
          {row.original.name}
        </div>
      )
    },
    {
      accessorKey: "create_time",
      header: "申请时间",
      size: 160,
      cell: ({row}) => <span className="whitespace-nowrap">{dayjs(row.original.create_time).format("YYYY-MM-DD HH:mm:ss")}</span>
    },
    {
      accessorKey: "task_days",
      header: "执行日期",
      size: 160,
      cell: ({row}) => (
        <div className="max-w-[160px] truncate" title={row.original.task_days?.length > 0 ? 
          `${dayjs.unix(row.original.task_days[0]).format("YYYY-MM-DD")}~${dayjs.unix(row.original.task_days[row.original.task_days.length - 1]).format("YYYY-MM-DD")}` : ""}>
          {row.original.task_days?.length > 0 &&
            dayjs.unix(row.original.task_days[0]).format("YYYY-MM-DD") + "~" + dayjs.unix(row.original.task_days[row.original.task_days.length - 1]).format("YYYY-MM-DD")}
        </div>
      )
    },
    {
      accessorKey: "task_periods",
      header: "执行时间",
      size: 160,
      cell: ({row}) => {
        const {task_periods, task_type} = row.original;
        let time;
        if (task_type === TaskType.Timed) {
          time = task_periods.map(item => dayjs.unix(item[0]).format("HH:mm:ss")).join(",");
        } else if (task_type === TaskType.Condition) {
          time = task_periods.map(item => dayjs.unix(item[0]).format("HH:mm:ss") + "-" + dayjs.unix(item[1]).format("HH:mm:ss")).join(",");
        }
        return (
          <div className="max-w-[160px] truncate" title={time}>
            {time}
          </div>
        );
      }
    },
    {
      accessorKey: "task_type",
      header: "类型",
      size: 100,
      cell: ({row}) => <span className="whitespace-nowrap">{TaskTypeMap[row.original.task_type]}</span>
    },
    {
      accessorKey: "wayline_name",
      header: "航线名称",
      size: 160,
      cell: ({row}) => (
        <div className="max-w-[160px] truncate" title={row.original.wayline_name}>
          {row.original.wayline_name ?? "--"}
        </div>
      )
    },
    {
      accessorKey: "dock_name",
      header: "机场",
      size: 140,
      cell: ({row}) => (
        <div className="max-w-[140px] truncate" title={row.original.dock_name}>
          {row.original.dock_name}
        </div>
      )
    },
    {
      accessorKey: "username",
      header: "创建人",
      size: 100,
      cell: ({row}) => (
        <div className="max-w-[100px] truncate" title={row.original.username}>
          {row.original.username}
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "审核状态",
      size: 100,
      cell: ({row}) => <span className={cn("whitespace-nowrap", applyTaskStatusMap[row.original.status].color)}>{applyTaskStatusMap[row.original.status].name}</span>
    },
    {
      header: "操作",
      size: 120,
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
      await post(`${HTTP_PREFIX}/wayline-job-audit/approve`, {
        id,
        status: taskStatus
      });
      if (taskStatus === ApplyTaskStatus.APPROVED) {
        await post(`${HTTP_PREFIX}/workspaces/${workspaceId}/flight-tasks`, selectedTask as any);
        toast({
          description: "审核成功，任务创建成功！"
        });
      } else if (taskStatus === ApplyTaskStatus.REJECTED) {
        toast({
          description: "审核不通过，任务未创建！"
        });
      }
    } catch (err) {
      toast({
        description: "审核失败，任务未创建！",
        variant: "destructive"
      });
    } finally {
      await mutate();
      setCurrentId(undefined);
      setTaskStatus(undefined);
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

      <div className="rounded-md border border-[#0A81E1] bg-[#0A4088]/70">
        <div className="flex flex-col">
          <div className="w-full bg-[#0A81E1]/70">
            <div className="w-full" style={{ paddingRight: '8px' }}>  {/* 补偿滚动条宽度 */}
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-b border-[#0A81E1]">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          style={{ 
                            width: header.getSize(),
                            minWidth: header.getSize(),
                            maxWidth: header.getSize()
                          }}
                          className="text-white h-10 font-medium"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
              </Table>
            </div>
          </div>
          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 430px)' }}>
            <Table>
              <TableBody className="bg-[#0A4088]/70">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "h-[46px]",
                        "border-b border-[#43ABFF]/30",
                        "hover:bg-[#0A81E1]/10 transition-colors duration-200",
                        "data-[state=selected]:bg-transparent"
                      )}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{ 
                            width: cell.column.getSize(),
                            minWidth: cell.column.getSize(),
                            maxWidth: cell.column.getSize()
                          }}
                          className={cn(
                            "py-3",
                            "text-base",
                            "align-middle",
                            "px-4",
                            "leading-none"
                          )}
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
                      className="h-24 text-center text-[#43ABFF] text-base"
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Label className="text-gray-400">
          共 {data?.pagination.total || 0} 条记录，共 {table.getPageCount()} 页
        </Label>
        <div className="space-x-4">
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

export default TaskDataTable;

