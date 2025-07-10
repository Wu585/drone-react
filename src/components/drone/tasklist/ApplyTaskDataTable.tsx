import {ColumnDef} from "@tanstack/react-table";
import {useState} from "react";
import {ApplyTask, ApplyTaskStatus, applyTaskStatusMap, useApplyWaylinJobs, useBindingDevice} from "@/hooks/drone";
import {TaskType, TaskTypeMap} from "@/types/task.ts";
import {Label} from "@/components/ui/label.tsx";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {Edit, ReceiptText, Trash} from "lucide-react";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {ELocalStorageKey} from "@/types/enum.ts";
import {cn} from "@/lib/utils.ts";
import {CommonTable} from "@/components/drone/public/CommonTable.tsx";
import {IconButton} from "@/components/drone/public/IconButton.tsx";
import CommonDialog from "@/components/drone/public/CommonDialog.tsx";
import {CommonSelect} from "@/components/drone/public/CommonSelect.tsx";
import CommonAlertDialog from "@/components/drone/public/CommonAlertDialog.tsx";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";

const TaskDataTable = () => {
  const {delete: deleteClient, post} = useAjax();
  const navigate = useNavigate();
  const [taskStatus, setTaskStatus] = useState<ApplyTaskStatus>();
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | undefined>();
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const departId = localStorage.getItem("departId");

  const defaultParams = {
    page: 1,
    page_size: 10,
  };

  const [queryParams, setQueryParams] = useState(defaultParams);
  const {data, mutate, isLoading} = useApplyWaylinJobs(queryParams);

  const {data: bindingDevices} = useBindingDevice(workspaceId, {
    page: 1,
    page_size: 100,
    domain: EDeviceTypeName.Dock,
    organ: departId ? +departId : undefined,
  });

  const columns: ColumnDef<ApplyTask>[] = [
    {
      accessorKey: "name",
      header: "计划名称",
      size: 140,
      cell: ({row}) => (
        <div className="truncate" title={row.original.name}>
          {row.original.name}
        </div>
      )
    },
    {
      accessorKey: "create_time",
      header: "申请时间",
      size: 180,
      cell: ({row}) => <span className="truncate"
                             title={dayjs(row.original.create_time).format("YYYY-MM-DD HH:mm:ss")}>
        {dayjs(row.original.create_time).format("YYYY-MM-DD HH:mm:ss")}
      </span>
    },
    {
      accessorKey: "task_days",
      header: "执行日期",
      size: 160,
      cell: ({row}) => (
        <div className="truncate" title={row.original.task_days?.length > 0 ?
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
          <div className="truncate" title={time}>
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
        <div className="truncate" title={row.original.wayline_name}>
          {row.original.wayline_name ?? "--"}
        </div>
      )
    },
    {
      accessorKey: "dock_name",
      header: "机场",
      size: 120,
      cell: ({row}) => (
        <div className="truncate" title={row.original.dock_name}>
          {row.original.dock_name}
        </div>
      )
    },
    {
      accessorKey: "username",
      header: "创建人",
      size: 100,
      cell: ({row}) => (
        <div className="truncate" title={row.original.username}>
          {row.original.username}
        </div>
      )
    },
    {
      accessorKey: "organ_name",
      header: "部门",
      size: 120,
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
          {row.original.status === ApplyTaskStatus.PENDING_REVIEW &&
            <IconButton onClick={() => navigate(`/task-create-apply?id=${row.original.id}`)}>
              <Edit size={16}/>
            </IconButton>}
          {row.original.status === ApplyTaskStatus.PENDING_REVIEW && <IconButton onClick={() => {
            setOpen(true);
            setCurrentId(row.original.id);
          }}>
            <ReceiptText size={16}/>
          </IconButton>}
          <CommonAlertDialog
            title={"删除申请任务"}
            trigger={<IconButton>
              <Trash size={16}/>
            </IconButton>}
            description={<span>确认删除这条申请任务吗？</span>}
            onConfirm={async () => {
              await onDeleteTask(row.original.id);
              toast({
                description: "删除成功！"
              });
              await mutate();
            }}
          />
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
    if (!selectedTask) return toast({
      description: "找不到任务！",
      variant: "destructive"
    });
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
        const device = bindingDevices?.list.find(item => item.device_sn === selectedTask.dock_sn);

        if (!device) return toast({
          description: "该部门下找不到该设备！",
          variant: "destructive"
        });

        await post(`${HTTP_PREFIX}/workspaces/${device.workspace_id}/flight-tasks`, selectedTask as any);
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* 保持原有的工具栏内容 */}
        </div>
      </div>

      <CommonDialog
        open={open} onOpenChange={setOpen}
        title={"飞行任务审核"}
        onConfirm={async () => {
          await onAuditTask(currentId!);
          setOpen(false);
        }}
      >
        <div className="grid grid-cols-10 items-center px-2">
          <Label className="col-span-2">
            审核结果：
          </Label>
          <CommonSelect
            value={taskStatus?.toString() || ""}
            onValueChange={(value) => setTaskStatus(+value)}
            className={"col-span-8"}
            placeholder={"请选择审核结果"}
            options={[
              {
                value: ApplyTaskStatus.APPROVED.toString(),
                label: "通过"
              },
              {
                value: ApplyTaskStatus.REJECTED.toString(),
                label: "驳回"
              }
            ]}
          />
        </div>
      </CommonDialog>

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

