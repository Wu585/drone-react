import {
  ColumnDef,
  flexRender,
  PaginationState,
} from "@tanstack/react-table";
import {Fragment, useMemo, useState} from "react";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {HTTP_PREFIX_Wayline, Task, useBindingDevice, useWaylinJobs} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {MediaStatus, TaskStatus, TaskStatusMap, TaskType, TaskTypeMap} from "@/types/task.ts";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {formatMediaTaskStatus, formatTaskStatus, groupTasksByDate, UpdateTaskStatus} from "@/hooks/drone/task";
import {Circle} from "lucide-react";
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
import PermissionButton from "@/components/drone/public/PermissionButton.tsx";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import {CommonSelect} from "@/components/drone/public/CommonSelect.tsx";
import {CommonTable} from "@/components/drone/public/CommonTable.tsx";
import {CommonDateRange} from "@/components/drone/public/CommonDateRange.tsx";

const TaskDataTable = () => {
  const {delete: deleteClient, put, post} = useAjax();
  const departId = localStorage.getItem("departId");
  const navigate = useNavigate();

  const columns: ColumnDef<Task>[] = useMemo(() => {
    return [
      {
        header: "计划时间 | 实际时间",
        size: 250,
        cell: ({row}) => {
          // 格式化时间函数
          const formatTime = (timeStr: string) => {
            if (!timeStr) return "";
            const time = timeStr.split(" ")[1];  // 取空格后的时间部分
            return time ? time.substring(0, 8) : ""; // 只保留时分秒 (HH:mm:ss)
          };

          return (
            <div className="flex gap-0.5 space-x-2 whitespace-nowrap">
              <div className="text-gray-400 text-[13px]">
                {/*[{formatTime(row.original.begin_time)}-{formatTime(row.original.end_time)}]*/}
                [{formatTime(row.original.begin_time)}-{formatTime(row.original.end_time)}]
              </div>
              <div className="text-[#43ABFF] text-[13px]">
                {formatTime(row.original.execute_time) ?
                  `[${formatTime(row.original.execute_time)}-${formatTime(row.original.completed_time)}]` : "--"
                }
              </div>
            </div>
          );
        }
      },
      {
        header: "执行状态",
        size: 100,
        cell: ({row}) =>
          <span style={{
            color: formatTaskStatus(row.original).color
          }} className={"whitespace-nowrap"}>{formatTaskStatus(row.original).text}</span>
      },
      {
        accessorKey: "job_name",
        header: "计划名称",
        size: 120,
        cell: ({row}) => (
          <div className="truncate" title={row.original.job_name}>
            {row.original.job_name}
          </div>
        )
      },
      {
        accessorKey: "task_type",
        header: "类型",
        size: 80,
        cell: ({row}) => <span className="whitespace-nowrap">{TaskTypeMap[row.original.task_type]}</span>
      },
      {
        accessorKey: "file_name",
        header: "航线名称",
        size: 160,
        cell: ({row}) => (
          <div className="max-w-[160px] truncate" title={row.original.file_name}>
            {row.original.file_name}
          </div>
        )
      },
      {
        accessorKey: "dock_name",
        header: "机场",
        size: 120,
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
        header: "媒体上传",
        size: 140,
        cell: ({row}) => {
          return <div
            className={cn("flex items-center ", row.original.uploaded_count > 0 && "cursor-pointer hover:text-green-500")}
            onClick={() => row.original.uploaded_count > 0 && row.original.job_id && navigate(`/media?job_id=${row.original.job_id}`)}>
            <Circle fill={formatMediaTaskStatus(row.original).color} className={"w-4 h-4"}/>
            <span>{formatMediaTaskStatus(row.original).text}
              {formatMediaTaskStatus(row.original).number && `${formatMediaTaskStatus(row.original).number}`}</span>
          </div>;
        }
      },
      {
        header: "操作",
        size: 140,
        cell: ({row}) =>
          <div className={"flex whitespace-nowrap space-x-2"}>
            {row.original.status === TaskStatus.Wait && <AlertDialog>
              <AlertDialogTrigger className={""} asChild>
                <PermissionButton
                  permissionKey={"Collection_PlanDelete"}
                  className={cn("bg-[#43ABFF] h-6 hover:bg-[#43ABFF] rounded-md cursor-pointer")}>
                  取消
                </PermissionButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>取消任务</AlertDialogTitle>
                  <AlertDialogDescription>
                    确认取消任务吗？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeleteTask(row.original.job_id, row.original.workspace_id)}>确认</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>}
            {row.original.status === TaskStatus.Carrying && <AlertDialog>
              <AlertDialogTrigger className={""} asChild>
                <Button
                  type={"submit"}
                  className={cn("bg-[#43ABFF] h-6 hover:bg-[#43ABFF] rounded-md cursor-pointer")}>
                  挂起
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>挂起任务</AlertDialogTitle>
                  <AlertDialogDescription>
                    确认挂起任务吗？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onSuspandTask(row.original.job_id, row.original.workspace_id)}>确认</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>}
            {row.original.status === TaskStatus.Paused && <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type={"submit"}
                  className={cn("bg-[#43ABFF] h-6 hover:bg-[#43ABFF] rounded-md cursor-pointer")}>
                  恢复
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>恢复任务</AlertDialogTitle>
                  <AlertDialogDescription>
                    确认恢复任务吗？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onResumeTask(row.original.job_id, row.original.workspace_id)}>确认</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>}
            {/*{formatMediaTaskStatus(row.original).status === MediaStatus.ToUpload && <AlertDialog>*/}
            {formatMediaTaskStatus(row.original).status === MediaStatus.ToUpload && <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type={"submit"}
                  className={cn("bg-[#43ABFF] h-6 hover:bg-[#43ABFF] rounded-md cursor-pointer")}>
                  媒体续传
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>媒体续传</AlertDialogTitle>
                  <AlertDialogDescription>
                    确认媒体续传吗？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onUploadMediaFile(row.original.job_id)}>确认</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>}
          </div>
      }
    ];
  }, []);

  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const HTTP_PREFIX = "/wayline/api/v1";

  // 媒体续传
  const onUploadMediaFile = async (jobId: string) => {
    try {
      await post(`${HTTP_PREFIX}/workspaces/${workspaceId}/jobs/${jobId}/media-highest`);
      toast({
        description: "媒体续传成功！"
      });
    } catch (err) {
      toast({
        description: "媒体续传失败！",
        variant: "destructive"
      });
    }
  };

  // 删除任务
  const onDeleteTask = async (jobId: string, workspaceId: string) => {
    try {
      await deleteClient(`${HTTP_PREFIX}/workspaces/${workspaceId}/jobs`, {
        job_id: jobId
      });
      toast({
        description: "任务取消成功！"
      });
      await mutateWaylineJobs();
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  // 中止任务
  const onSuspandTask = async (jobId: string, workspaceId: string) => {
    try {
      await put(`${HTTP_PREFIX}/workspaces/${workspaceId}/jobs/${jobId}`, {
        status: UpdateTaskStatus.Suspend
      });
      toast({
        description: "任务中止成功！"
      });
      await mutateWaylineJobs();
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  // 恢复任务
  const onResumeTask = async (jobId: string, workspaceId: string) => {
    try {
      await put(`${HTTP_PREFIX}/workspaces/${workspaceId}/jobs/${jobId}`, {
        status: UpdateTaskStatus.Resume
      });
      toast({
        description: "任务恢复成功！"
      });
      await mutateWaylineJobs();
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  const {data: dockList} = useBindingDevice(workspaceId, {
    page: 1,
    page_size: 1000,
    domain: EDeviceTypeName.Dock,
    organ: departId ? +departId : undefined
  });

  const initialQueryParams = {
    page: 1,
    page_size: 10,
    start_time: "",
    end_time: "",
    task_type: undefined as TaskType | undefined,
    dock_sn: "",
    keyword: "",
    status: undefined as TaskStatus | undefined,
    organs: [departId]
  };

  const [queryParams, setQueryParams] = useState(initialQueryParams);

  const handlePaginationChange = (pagination: PaginationState) => {
    setQueryParams(prev => ({
      ...prev,
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize
    }));
  };

  const {data, mutate: mutateWaylineJobs, isLoading} = useWaylinJobs(workspaceId, queryParams);

  // 处理查询参数变化
  const handleQueryParamsChange = (newParams: Partial<typeof queryParams>) => {
    setQueryParams(prev => ({
      ...prev,
      ...newParams,
      page: 1 // 当筛选条件改变时，重置到第一页
    }));
  };

  const [loading, setLoading] = useState(false);

  const onGenerateReports = async () => {
    try {
      setLoading(true);
      const res: any = await post(
        `${HTTP_PREFIX_Wayline}/workspaces/${workspaceId}/flight-reports/generate`,
        queryParams,
        // 设置响应类型为 blob
        {responseType: "blob"}
      );

      // 创建 Blob 对象
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `飞行报告_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.xlsx`; // 设置文件名

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("下载报告失败:", error);
      toast({
        variant: "destructive",
        description: "下载报告失败"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <CommonDateRange
            value={{
              start: queryParams.start_time,
              end: queryParams.end_time
            }}
            onChange={({start, end}) => handleQueryParamsChange({
              start_time: start,
              end_time: end
            })}
          />
          <CommonInput
            onChange={(e) => handleQueryParamsChange({keyword: e.target.value})}
            placeholder={"请输入任务名称"}
            value={queryParams.keyword}
          />
          <CommonSelect
            onValueChange={(value) => handleQueryParamsChange({
              dock_sn: value === "all" ? undefined : value
            })}
            value={queryParams.dock_sn}
            placeholder={"请选择机场"}
            options={
              dockList?.list.map(dock => ({
                value: dock.device_sn,
                label: dock.nickname
              })) || []
            }
          />
          <CommonSelect
            onValueChange={(value) => handleQueryParamsChange({
              status: Number(value) as TaskStatus
            })}
            value={queryParams.status?.toString()}
            placeholder={"请选择执行状态"}
            options={
              Object.entries(TaskStatusMap).map(([key, value]) => ({
                value: key,
                label: value
              }))
            }
          />
          <CommonSelect
            onValueChange={(value) => handleQueryParamsChange({
              task_type: Number(value) as TaskType
            })}
            value={queryParams.task_type?.toString()}
            placeholder={"请选择任务类型"}
            options={
              Object.entries(TaskTypeMap).map(([key, value]) => ({
                value: key,
                label: value
              }))
            }
          />
          <CommonButton className={"w-36"} onClick={() => handleQueryParamsChange({
            page: 1,
            page_size: 10,
            start_time: "",
            end_time: "",
            task_type: "",
            dock_sn: "",
            keyword: "",
            status: "",
            organs: [departId]
          })}>
            重置
          </CommonButton>
        </div>
        <div className={"flex items-center space-x-4"}>
          <CommonButton disabled={loading} onClick={onGenerateReports} isLoading={loading} className={"w-30"}>
            导出飞行报告
          </CommonButton>
          <CommonButton
            permissionKey={"Collection_PlanCreate"}
            onClick={() => navigate("/task-create-apply")}
          >
            申请任务
          </CommonButton>
          <CommonButton
            permissionKey={"Collection_PlanCreate"}
            onClick={() => navigate("/task-create")}
          >
            创建任务
          </CommonButton>
        </div>
      </div>

      <div className="">
        <div>
          <CommonTable
            loading={isLoading}
            data={data?.list || []}
            columns={columns}
            allCounts={data?.pagination.total || 0}
            getRowId={(row) => row.job_id} // 使用 job_id 作为行ID
            onPaginationChange={handlePaginationChange}
            maxHeight={"calc(100vh - 400px)"}
            renderCustomRows={(table) => (
              <>
                {groupTasksByDate(data?.list || []).map(([date, tasks]) => (
                  <Fragment key={`group-${date}`}>
                    {/* 日期分组行 */}
                    <TableRow className="bg-[#274778] border-none">
                      <TableCell
                        colSpan={columns.length} // 确保跨越所有列
                        className="py-[8px] px-4 font-medium text-[#43ABFF] border-none"
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
                            "border-b-[1px] border-[#192948] text-base bg-[#203D67]/70",
                            "transition-colors duration-200",
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
                      );
                    })}
                  </Fragment>
                ))}
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDataTable;

