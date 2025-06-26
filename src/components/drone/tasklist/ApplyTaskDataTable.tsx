import {ColumnDef} from "@tanstack/react-table";
import {useState} from "react";
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
import {CommonTable} from "@/components/drone/public/CommonTable.tsx";

const TaskDataTable = () => {
  const {delete: deleteClient, post} = useAjax();
  const navigate = useNavigate();
  const [taskStatus, setTaskStatus] = useState<ApplyTaskStatus>();
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | undefined>();
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const departId = localStorage.getItem("departId");

  const columns: ColumnDef<ApplyTask>[] = [
    {
      accessorKey: "name",
      header: "计划名称",
      size: 140,
      cell: ({row}) => (
        <div className="max-w-[160px] truncate" title={row.original.name}>
          {row.original.name}
        </div>
      )
    },
    {
      accessorKey: "create_time",
      header: "申请时间",
      size: 180,
      cell: ({row}) => <span className="whitespace-nowrap truncate"
                             title={dayjs(row.original.create_time).format("YYYY-MM-DD HH:mm:ss")}>
        {dayjs(row.original.create_time).format("YYYY-MM-DD HH:mm:ss")}
      </span>
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
      accessorKey: "organ_name",
      header: "部门",
      size: 100,
      cell: ({row}) => (
        <div className="max-w-[100px] truncate" title={row.original.organ_name}>
          {row.original.organ_name}
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "审核状态",
      size: 100,
      cell: ({row}) => <span
        className={cn("whitespace-nowrap", applyTaskStatusMap[row.original.status].color)}>{applyTaskStatusMap[row.original.status].name}</span>
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

  const defaultParams = {
    page: 1,
    page_size: 10,
  };

  const [queryParams, setQueryParams] = useState(defaultParams);

  const {data, mutate, isLoading} = useApplyWaylinJobs(queryParams);

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

      <CommonTable
        data={data?.list || []}
        columns={columns}
        loading={isLoading}
        allCounts={data?.pagination.total}
        getRowClassName={(_, index) => index % 2 === 1 ? "bg-[#203D67]/70" : ""}
        onPaginationChange={(pagination) => setQueryParams({
          ...queryParams,
          page: pagination.pageIndex + 1
        })}
      />
    </div>
  );
};

export default TaskDataTable;

