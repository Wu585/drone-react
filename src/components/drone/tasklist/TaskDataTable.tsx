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
import {useMemo, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {HTTP_PREFIX_Wayline, Task, useBindingDevice, useWaylinJobs} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {MediaStatus, TaskStatus, TaskStatusMap, TaskType, TaskTypeMap} from "@/types/task.ts";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {cn} from "@/lib/utils.ts";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {formatMediaTaskStatus, formatTaskStatus, groupTasksByDate, UpdateTaskStatus} from "@/hooks/drone/task";
import {Circle, Loader2} from "lucide-react";
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
import NewCommonDateRangePicker from "@/components/public/NewCommonDateRangePicker.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Input} from "@/components/ui/input.tsx";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";

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
          <div className="max-w-[160px] truncate" title={row.original.job_name}>
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
                  <AlertDialogAction onClick={() => onDeleteTask(row.original.job_id)}>确认</AlertDialogAction>
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
                  <AlertDialogAction onClick={() => onSuspandTask(row.original.job_id)}>确认</AlertDialogAction>
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
                  <AlertDialogAction onClick={() => onResumeTask(row.original.job_id)}>确认</AlertDialogAction>
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
  const onDeleteTask = async (jobId: string) => {
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
  const onSuspandTask = async (jobId: string) => {
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
  const onResumeTask = async (jobId: string) => {
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

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const {data: dockList} = useBindingDevice(workspaceId, {
    page: 1,
    page_size: 1000,
    domain: EDeviceTypeName.Dock
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // 处理分页变化
  const handlePaginationChange = (updaterOrValue: PaginationState | ((old: PaginationState) => PaginationState)) => {
    const newPagination = typeof updaterOrValue === "function"
      ? updaterOrValue(pagination)
      : updaterOrValue;

    setPagination(newPagination);
    setQueryParams(prev => ({
      ...prev,
      page: newPagination.pageIndex + 1,
      page_size: newPagination.pageSize
    }));
  };

  const [queryParams, setQueryParams] = useState({
    page: 1,
    page_size: 10,
    start_time: "",
    end_time: "",
    task_type: undefined as TaskType | undefined,
    dock_sn: "",
    keyword: "",
    status: undefined as TaskStatus | undefined,
    organs: [departId]
  });

  const {data, mutate: mutateWaylineJobs} = useWaylinJobs(workspaceId, queryParams);

  const onChangeDateRange = (dateRange?: Date[]) => {
    if (dateRange?.length !== 2) {
      return handleQueryParamsChange({
        start_time: "",
        end_time: "",
      });
    }
    const newParams = {
      start_time: dayjs(dateRange[0]).format("YYYY-MM-DD HH:mm:ss"),
      end_time: dayjs(dateRange[1]).format("YYYY-MM-DD 23:59:59"),
    };

    handleQueryParamsChange(newParams);
  };

  // 处理查询参数变化
  const handleQueryParamsChange = (newParams: Partial<typeof queryParams>) => {
    setQueryParams(prev => ({
      ...prev,
      ...newParams,
      page: 1 // 当筛选条件改变时，重置到第一页
    }));
    setPagination(prev => ({
      ...prev,
      pageIndex: 0 // 重置到第一页
    }));
  };

  const table = useReactTable({
    data: data?.list || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    manualPagination: true,
    rowCount: data?.pagination.total,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
  });

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
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-2">
          <div className={"flex items-center whitespace-nowrap w-80"}>
            <Label>执行时间：</Label>
            <NewCommonDateRangePicker setDate={onChangeDateRange} className={""}/>
          </div>
          <div className={"flex items-center"}>
            <Label>名称：</Label>
            <Input
              className={"bg-transparent w-36 border-[#43ABFF] border-[1px]"}
              onChange={(e) => handleQueryParamsChange({keyword: e.target.value})}
              placeholder={"请输入名称"}
              value={queryParams.keyword}
            />
          </div>
          <div className={"flex items-center whitespace-nowrap"}>
            <Label>机场：</Label>
            <Select
              onValueChange={(value) => handleQueryParamsChange({
                dock_sn: value === "all" ? undefined : value
              })}
              value={queryParams.dock_sn || "all"}
            >
              <SelectTrigger className="w-[150px] bg-transparent border-[#43ABFF] border-[1px]">
                <SelectValue placeholder="机场"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {dockList?.list.map(dock => <SelectItem value={dock.device_sn}>{dock.nickname}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className={"flex items-center whitespace-nowrap"}>
            <Label>执行状态：</Label>
            <Select
              onValueChange={(value) => handleQueryParamsChange({
                status: value === "all" ? undefined : Number(value) as TaskStatus
              })}
              value={queryParams.status?.toString() || "all"}
            >
              <SelectTrigger className="w-[150px] bg-transparent border-[#43ABFF] border-[1px]">
                <SelectValue placeholder="执行状态"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {Object.entries(TaskStatusMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className={"flex items-center whitespace-nowrap"}>
            <Label>任务类型：</Label>
            <Select
              onValueChange={(value) => handleQueryParamsChange({
                task_type: value === "all" ? undefined : Number(value) as TaskType
              })}
              value={queryParams.task_type?.toString() || "all"}
            >
              <SelectTrigger className="w-[150px] bg-transparent border-[#43ABFF] border-[1px]">
                <SelectValue placeholder="任务类型"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {Object.entries(TaskTypeMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className={"bg-[#43ABFF] hover:bg-[#43ABFF]  text-base"}
                  disabled={loading}
                  onClick={onGenerateReports}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" size={16}/>}
            <span>导出飞行报告</span>
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-[#0A81E1] bg-[#0A4088]/70">
        <div className="flex flex-col">
          <div className="w-full bg-[#0A81E1]/70">
            <div className="w-full" style={{paddingRight: "8px"}}>  {/* 补偿滚动条宽度 */}
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
          <div className="overflow-auto" style={{maxHeight: "calc(100vh - 430px)"}}>
            <Table>
              <TableBody className="bg-[#0A4088]/70">
                {table.getRowModel().rows?.length ? (
                  groupTasksByDate(data?.list || []).map(([date, tasks]) => (
                    <>
                      {/* 日期分组行 */}
                      <TableRow key={`date-${date}`} className="bg-[#0A81E1]/20">
                        <TableCell
                          colSpan={columns.length}
                          className="py-[4px] px-4 font-medium text-[#43ABFF] border-b border-[#0A81E1]/30"
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
                              "border-b border-[#0A81E1]/30  text-base",
                              "hover:bg-[#0A4088]/90 transition-colors duration-200",
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
                    </>
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

      <div className="flex items-center justify-between">
        <Label className="text-gray-400">
          共 {data?.pagination.total || 0} 条记录，共 {table.getPageCount()} 页
        </Label>
        <div className="space-x-4 my-2">
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

