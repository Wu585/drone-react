import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useMemo, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {
  useCurrentUser, usePermission,
  useWorkOrderById,
  useWorkOrderList,
  WorkOrder
} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Edit, Eye, Loader2} from "lucide-react";
import {getAuthToken, useAjax} from "@/lib/http.ts";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {defineStepper} from "@stepperize/react";
import {Separator} from "@/components/ui/separator.tsx";
import {cn} from "@/lib/utils.ts";
import Uploady from "@rpldy/uploady";
import {CURRENT_CONFIG} from "@/lib/config.ts";
import dayjs from "dayjs";
import CreateOrder from "@/components/drone/work-order/CreateOrder.tsx";
import DistributeDialog from "@/components/drone/work-order/DistributeDialog.tsx";
import Feedback from "@/components/drone/work-order/Feedback.tsx";
import Audit from "@/components/drone/work-order/Audit.tsx";
import Complete from "@/components/drone/work-order/Complete.tsx";
import PermissionButton from "@/components/drone/public/PermissionButton.tsx";
import NewCommonDateRangePicker from "@/components/public/NewCommonDateRangePicker.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Input} from "@/components/ui/input.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";

// 定义告警等级类型
type WarnLevel = 1 | 2 | 3 | 4;

const warnLevelMap: Record<WarnLevel, string> = {
  1: "一般告警",
  2: "次要告警",
  3: "主要告警",
  4: "紧急告警",
} as const;

const eventMap = {
  0: "公共设施",
  1: "道路交通",
  2: "环卫环保",
  3: "园林绿化",
  4: "其它设施",
  5: "环卫市容",
  6: "设施管理",
  7: "突发事件",
  8: "街面秩序",
  9: "市场监管",
  10: "房屋管理",
  11: "农村管理",
  12: "街面治安",
  13: "重点保障",
  14: "其他事件",
} as const;

type EventMap = keyof typeof eventMap

const OPERATION_HTTP_PREFIX = "operation/api/v1";

const {useStepper, steps, utils} = defineStepper(
  {
    id: "1",
    title: "创建工单",
  },
  {
    id: "2",
    title: "处理反馈",
  },
  {
    id: "3",
    title: "处理审核",
    description: "Checkout complete"
  },
  {
    id: "4",
    title: "已归档",
  }
);

// 添加工单状态枚举
const OrderStatusMap = {
  0: "待分配",
  1: "待处理",
  2: "待审核",
  3: "已归档",
  4: "未通过"
} as const;

type OrderStatus = keyof typeof OrderStatusMap;

const WorkOrderDataTable = () => {
  const [open, setOpen] = useState(false);
  const departId = localStorage.getItem("departId");

  const {data: currentUser} = useCurrentUser();
  const {post} = useAjax();
  const {hasPermission} = usePermission();
  const isGly = hasPermission("Collection_TicketAssign");

  console.log('isGly');
  console.log(isGly);
  const urlFix = isGly ? "page" : "pageByOperator";
  const [currentOrder, setCurrentOrder] = useState<WorkOrder | null>(null);

  const columns: ColumnDef<WorkOrder>[] = useMemo(() => {
    return [
      {
        id: "id",
        header: ({table}) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className={cn(
              "border-[#43ABFF] data-[state=checked]:bg-[#43ABFF]",
              "h-4 w-4",
              "transition-colors duration-200"
            )}
          />
        ),
        cell: ({row}) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className={cn(
              "border-[#43ABFF] data-[state=checked]:bg-[#43ABFF]",
              "h-4 w-4",
              "transition-colors duration-200"
            )}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "事件名称",
        cell: ({row}) => (
          <div className={"w-[150px] whitespace-nowrap overflow-hidden text-ellipsis"}
               title={row.original.name}>{row.original.name}</div>
        )
      },
      {
        accessorKey: "warning_level",
        header: "告警等级",
        cell: ({row}) => (
          <span>{warnLevelMap[row.original.warning_level as WarnLevel]}</span>
        )
      },
      {
        accessorKey: "found_time",
        header: "发现时间",
        cell: ({row}) => (
          <span>{dayjs(row.original.found_time).format("YYYY-MM-DD HH:mm:ss")}</span>
        )
      },
      {
        accessorKey: "address",
        header: "发生地址",
      },
      {
        accessorKey: "contact",
        header: "联系人",
      },
      {
        accessorKey: "contact_phone",
        header: "联系方式",
      },
      {
        accessorKey: "organ_name",
        header: "部门",
      },
      {
        accessorKey: "order_type",
        header: "事件类型",
        cell: ({row}) => <span>{eventMap[row.original.order_type as keyof typeof eventMap]}</span>
      },
      {
        accessorKey: "status",
        header: "状态",
        cell: ({row}) => (
          <span className={cn(
            "px-2 py-1 rounded text-sm",
            {
              "bg-yellow-500/20 text-yellow-500": row.original.status === 0,
              "bg-blue-500/20 text-blue-500": row.original.status === 1,
              "bg-orange-500/20 text-orange-500": row.original.status === 2,
              "bg-green-500/20 text-green-500": row.original.status === 3,
              "bg-red-500/20 text-red-500": row.original.status === 4,
            }
          )}>
          {OrderStatusMap[row.original.status as OrderStatus]}
        </span>
        )
      },
      {
        header: "操作",
        // 管理员 && 待分配 才可编辑
        cell: ({row}) => {
          return (
            <span className={`flex items-center space-x-2`}>
            {isGly && row.original.status === 0 && <PermissionButton
              permissionKey={"Collection_TicketCreateEdit"}
              className={"h-4 bg-transparent px-0"}
              onClick={() => {
                // setDistributeOpen(true);
                stepper.goTo(getStepByStatus(row.original.status));
                setCurrentOrder(row.original);
                setOpen(true);
                setOrderType("edit");
              }}
            >
              <Edit className={"w-4"}/>
            </PermissionButton>}
              {(isGly && row.original.status === 0) &&
                <DistributeDialog onConfirm={mutate} currentWorkOrderId={row.original.id}/>}
              <Eye className={"w-4"} onClick={() => {
                isGly ? setOrderHandleType("preview") : setOrderHandleType("handle");
                setOrderType("preview");
                setCurrentOrder(row.original);
                stepper.goTo(getStepByStatus(row.original.status));
                setOpen(true);
              }}/>
              {/*<Trash className={"w-4"}/>*/}
          </span>
          );
        }
      }
    ];
  }, [isGly]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [queryParams, setQueryParams] = useState({
    page: 1,
    page_size: 10,
    tab: 0,
    warning_level: undefined as WarnLevel | undefined,
    name: "",
    status: undefined as OrderStatus | undefined,
    order_type: undefined as EventMap | undefined,
    found_time_begin: "",
    found_time_end: "",
    organs: [departId]
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

  const onChangeDateRange = (dateRange?: Date[]) => {
    if (dateRange?.length !== 2) {
      return handleQueryParamsChange({
        found_time_begin: "",
        found_time_end: "",
      });
    }
    const newParams = {
      found_time_begin: dayjs(dateRange[0]).format("YYYY-MM-DD HH:mm:ss"),
      found_time_end: dayjs(dateRange[1]).format("YYYY-MM-DD 23:59:59"),
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

  const {data, mutate} = useWorkOrderList(queryParams, urlFix);

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
      pagination: pagination,
    },
  });

  const stepper = useStepper();

  const currentIndex = utils.getIndex(stepper.current.id);

  const {data: currentOrderData, mutate: mutateCurrentOrder} = useWorkOrderById(currentOrder?.id);
  console.log("currentOrderData=====");
  console.log(currentOrderData);
  const [orderType, setOrderType] = useState<"create" | "edit" | "preview">("create");
  const [orderHandleType, setOrderHandleType] = useState<"handle" | "preview">("handle");

  const [loading, setLoading] = useState(false);

  const onExportOrder = async () => {
    console.log("currentUser");
    console.log(currentUser);
    try {
      setLoading(true);
      const res: any = await post(
        `${OPERATION_HTTP_PREFIX}/order/${departId}/exportReport`,
        queryParams,
        // 设置响应类型为 blob
        {responseType: "blob"}
      );

      // 创建 Blob 对象
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `工单报告_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.docx`; // 设置文件名

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        description: "导出工单失败！",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedFileIds = (): number[] => {
    return table.getSelectedRowModel().rows.map(row => row.original.id);
  };

  const onLoadOrderToMap = async () => {
    const ids = getSelectedFileIds();
    try {
      await post(`${OPERATION_HTTP_PREFIX}/order/setVisual`, {
        ids,
        visual: true
      });
      toast({
        description: "地图加载工单成功！",
      });
    } catch (err) {
      toast({
        description: "地图加载工单失败！",
        variant: "destructive"
      });
    }
  };

  return (
    <Uploady
      destination={{
        url: `${CURRENT_CONFIG.baseURL}${OPERATION_HTTP_PREFIX}/file/upload`,
        headers: {
          [ELocalStorageKey.Token]: getAuthToken()
        }
      }}
      accept="image/*,video/*"
      multiple
      autoUpload>
      <div className="space-y-4">
        <div className="mb-4 text-right space-x-2 flex justify-end items-center">
          <div className={"flex items-center whitespace-nowrap w-80"}>
            <Label>日期范围：</Label>
            <NewCommonDateRangePicker setDate={onChangeDateRange} className={""}/>
          </div>
          <div className={"flex items-center"}>
            <Label>事件名称：</Label>
            <Input
              className={"bg-transparent w-36 border-[#43ABFF] border-[1px]"}
              onChange={(e) => handleQueryParamsChange({name: e.target.value})}
              placeholder={"请输入事件名称"}
              value={queryParams.name}
            />
          </div>
          <div className={"flex items-center whitespace-nowrap"}>
            <Label>事件状态：</Label>
            <Select
              onValueChange={(value) => handleQueryParamsChange({
                status: value === "all" ? undefined : Number(value) as OrderStatus
              })}
              value={queryParams.status?.toString() || "all"}
            >
              <SelectTrigger className="w-[120px] bg-transparent border-[#43ABFF] border-[1px]">
                <SelectValue placeholder="事件状态"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {Object.entries(OrderStatusMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className={"flex items-center whitespace-nowrap"}>
            <Label>事件类型：</Label>
            <Select
              onValueChange={(value) => handleQueryParamsChange({
                order_type: value === "all" ? undefined : Number(value) as EventMap
              })}
              value={queryParams.order_type?.toString() || "all"}
            >
              <SelectTrigger className="w-[120px] bg-transparent border-[#43ABFF] border-[1px]">
                <SelectValue placeholder="事件类型"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {Object.entries(eventMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className={"flex items-center whitespace-nowrap"}>
            <Label>告警等级：</Label>
            <Select
              onValueChange={(value) => handleQueryParamsChange({
                warning_level: value === "all" ? undefined : Number(value) as WarnLevel
              })}
              value={queryParams.warning_level?.toString() || "all"}
            >
              <SelectTrigger className="w-[120px] bg-transparent border-[#43ABFF] border-[1px]">
                <SelectValue placeholder="告警等级"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {Object.entries(warnLevelMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {getSelectedFileIds().length > 0 &&
            <Button className={"bg-[#43ABFF] w-20"} onClick={onLoadOrderToMap}>地图加载</Button>}
          {/*<Button className={"bg-[#43ABFF] w-24"}>取消地图加载</Button>*/}

          <Dialog open={open} onOpenChange={(value) => {
            console.log("Dialog onOpenChange:", value);
            if (!value) {
              setCurrentOrder(null);
            }
            setOpen(value);
          }}>
            <DialogTrigger asChild>
              <PermissionButton
                permissionKey={"Collection_TicketCreateEdit"}
                className={"bg-[#43ABFF] w-20"}
                onClick={() => {
                  setCurrentOrder(null);
                  setOrderType("create");
                  stepper.goTo("1");
                }}
              >
                创建
              </PermissionButton>
            </DialogTrigger>
            <DialogContent className="max-w-screen-lg bg-[#20355f]/[.8] text-white border-none">
              <DialogHeader className={""}>
                <DialogTitle>工单管理</DialogTitle>
              </DialogHeader>
              <div className={" border-[#43ABFF] flex p-8 rounded-md bg-[#1b233c] opacity-80"}>
                <ol className="flex flex-col gap-2" aria-orientation="vertical">
                  {stepper.all.map((step, index, array) => (
                    <div key={step.id} className={""}>
                      <li className="flex items-center gap-4 flex-shrink-0">
                        <Button
                          type="button"
                          role="tab"
                          variant={index <= currentIndex ? "default" : "secondary"}
                          aria-current={stepper.current.id === step.id ? "step" : undefined}
                          aria-posinset={index + 1}
                          aria-setsize={steps.length}
                          aria-selected={stepper.current.id === step.id}
                          className={cn(
                            "flex size-10 items-center justify-center rounded-full",
                            index <= currentIndex ? "bg-[#43ABFF]" : "",
                            (!currentOrder && step.id !== "1") ||
                            (currentOrder && parseInt(step.id) > parseInt(getStepByStatus(currentOrder.status)))
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          )}
                          onClick={() => {
                            if (!currentOrder && step.id !== "1") return;
                            if (currentOrder && parseInt(step.id) > parseInt(getStepByStatus(currentOrder.status))) return;
                            stepper.goTo(step.id);
                          }}
                        >
                          {index + 1}
                        </Button>
                        <span className={cn(
                          "text-sm font-medium",
                          (!currentOrder && step.id !== "1") ||
                          (currentOrder && parseInt(step.id) > parseInt(getStepByStatus(currentOrder.status)))
                            ? "opacity-50"
                            : ""
                        )}>
                          {step.title}
                        </span>
                      </li>
                      <div className="flex gap-4">
                        {index < array.length - 1 && (
                          <div
                            className="flex justify-center"
                            style={{
                              paddingInlineStart: "1.25rem",
                            }}
                          >
                            <Separator
                              orientation="vertical"
                              className={`w-[2px] h-24`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </ol>
                <div className={"px-4 flex-1"}>
                  {stepper.switch({
                    "1": () =>
                      <CreateOrder
                        type={orderType}
                        onSuccess={() => {
                          setOpen(false);
                          mutate();
                          mutateCurrentOrder();
                        }}
                        currentOrder={currentOrderData}/>,
                    "2": () => isGly && (currentOrder?.status === 1 || currentOrder?.status === 4) ?
                      <div
                        className="text-lg py-4 text-blue-500 font-semibold content-center h-full flex flex-col items-center space-y-4">
                        <span className={"text-[32px]"}>待处理...</span>
                      </div> :
                      <Feedback
                        type={orderHandleType}
                        onSuccess={() => {
                          setOpen(false);
                          mutate();
                          mutateCurrentOrder();
                        }}
                        currentOrder={currentOrderData}
                      />,
                    "3": () => isGly || currentOrderData?.status === 3 ?
                      <Audit
                        currentOrder={currentOrderData}
                        onSuccess={() => {
                          setOpen(false);
                          mutate();
                          mutateCurrentOrder();
                        }}
                      /> : <div
                        className="text-lg py-4 text-blue-500 font-semibold content-center h-full flex flex-col items-center space-y-4">
                        <span className={"text-[32px]"}>审核中...</span>
                      </div>,
                    "4": () => <Complete/>
                  })}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  form={`${stepper.current.id === "1" ? "createOrderForm" :
                    stepper.current.id === "2" ? "feedbackForm" :
                      stepper.current.id === "3" ? "auditForm" : ""}`}
                  className="bg-[#43ABFF] w-24"
                >
                  确认
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <PermissionButton
            permissionKey={"Collection_TicketExport"}
            className={"bg-[#43ABFF] w-32"}
            disabled={loading}
            onClick={onExportOrder}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" size={16}/>}
            导出工单报告
          </PermissionButton>
        </div>

        <div className="rounded-md border border-[#0A81E1] overflow-hidden">
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
                          "text-base",
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
    </Uploady>
  );
};

// 修改工具函数
const getStepByStatus = (status: number) => {
  switch (status) {
    case 0: // 待分配
      return "1";
    case 1: // 已分配/待处理
      return "2";
    case 2: // 已处理/待审核
      return "3";
    case 3: // 处理通过
      return "4";
    case 4: // 处理未通过，返回到处理步骤
      return "2";
    default:
      return "1";
  }
};

export default WorkOrderDataTable;

