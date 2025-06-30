import {
  ColumnDef,
  PaginationState,
} from "@tanstack/react-table";
import {useMemo, useRef, useState} from "react";
import {
  useCurrentUser, usePermission,
  useWorkOrderById,
  useWorkOrderList,
  WorkOrder
} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {Edit, Eye} from "lucide-react";
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
import {toast} from "@/components/ui/use-toast.ts";
import {CommonTable, ReactTableInstance} from "@/components/drone/public/CommonTable.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import {CommonSelect} from "@/components/drone/public/CommonSelect.tsx";
import {Button} from "@/components/drone/public/Button.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import {CommonDateRange} from "@/components/drone/public/CommonDateRange.tsx";
import CommonDialog from "@/components/drone/public/CommonDialog.tsx";
import CreateOrder0630 from "@/components/drone/work-order/CreateOrder0630.tsx";

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

  const urlFix = isGly ? "page" : "pageByOperator";
  const [currentOrder, setCurrentOrder] = useState<WorkOrder | null>(null);
  const [selectedRows, setSelectedRows] = useState<WorkOrder[]>([]);

  const tableRef = useRef<ReactTableInstance<WorkOrder>>(null);

  const columns: ColumnDef<WorkOrder>[] = useMemo(() => {
    return [
      {
        accessorKey: "name",
        header: "事件名称",
        size: 200,
        cell: ({row}) => (
          <div className={"truncate"} title={row.original.name}>{row.original.name}</div>
        )
      },
      {
        accessorKey: "warning_level",
        header: "告警等级",
        size: 100,
        cell: ({row}) => (
          <span>{warnLevelMap[row.original.warning_level as WarnLevel]}</span>
        )
      },
      {
        accessorKey: "found_time",
        header: "发现时间",
        size: 180,
        cell: ({row}) => (
          <div className={"truncate"}>{dayjs(row.original.found_time).format("YYYY-MM-DD HH:mm:ss")}</div>
        )
      },
      {
        accessorKey: "address",
        header: "发生地址",
        size: 160,
        cell: ({row}) => (
          <div className={"truncate"} title={row.original.address}>{row.original.address}</div>
        )
      },
      {
        accessorKey: "contact",
        header: "联系人",
        size: 80
      },
      {
        accessorKey: "contact_phone",
        header: "联系方式",
        size: 110
      },
      {
        accessorKey: "organ_name",
        header: "部门",
        size: 100
      },
      {
        accessorKey: "order_type",
        header: "事件类型",
        size: 110,
        cell: ({row}) => <span>{eventMap[row.original.order_type as keyof typeof eventMap]}</span>
      },
      {
        accessorKey: "status",
        header: "状态",
        size: 120,
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

  const initialQueryParams = {
    page: 1,
    page_size: 10,
    tab: 0,
    warning_level: "",
    name: "",
    status: "",
    order_type: "",
    found_time_begin: "",
    found_time_end: "",
    organs: [departId]
  };

  const [queryParams, setQueryParams] = useState(initialQueryParams);

  const handleReset = () => {
    setQueryParams(initialQueryParams);
    tableRef.current?.resetPagination();
  };

  // 处理分页变化
  const handlePaginationChange = (pagination: PaginationState) => {
    setQueryParams(prev => ({
      ...prev,
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize
    }));
  };

  // 处理查询参数变化
  const handleQueryParamsChange = (newParams: Partial<typeof queryParams>) => {
    setQueryParams(prev => ({
      ...prev,
      ...newParams,
      page: 1, // 当筛选条件改变时，重置到第一页
    }));
  };

  const {data, mutate, isLoading} = useWorkOrderList(queryParams, urlFix);

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


  const onLoadOrderToMap = async () => {
    const ids = selectedRows.map(row => row.id);
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
      <div className={"grid grid-cols-8 gap-x-6 items-center mt-4 mb-6"}>
        <div className="col-span-6 text-right space-x-4 flex justify-end items-center">
          <CommonDateRange
            placeholder={"请选择日期范围"}
            value={{
              start: queryParams.found_time_begin,
              end: queryParams.found_time_end,
            }}
            onChange={({start, end}) => handleQueryParamsChange({
              found_time_begin: start,
              found_time_end: end
            })}
          />
          <CommonInput
            placeholder={"请输入事件名称"}
            value={queryParams.name}
            onChange={(e) => handleQueryParamsChange({name: e.target.value})}
          />
          <CommonSelect
            placeholder={"请选择工单状态"}
            options={Object.entries(OrderStatusMap).map(([key, value]) => ({
              value: key,
              label: value
            }))}
            value={queryParams.status?.toString()}
            onValueChange={(value) => handleQueryParamsChange({
              status: Number(value) as OrderStatus
            })}
          />
          <CommonSelect
            placeholder={"请选择事件类型"}
            options={Object.entries(eventMap).map(([key, value]) => ({
              value: key,
              label: value
            }))}
            value={queryParams.order_type?.toString()}
            onValueChange={(value) => handleQueryParamsChange({
              order_type: Number(value) as EventMap
            })}
          />
          <CommonSelect
            placeholder={"请选择告警等级"}
            options={Object.entries(warnLevelMap).map(([key, value]) => ({
              value: key,
              label: value
            }))}
            value={queryParams.warning_level?.toString()}
            onValueChange={(value) => handleQueryParamsChange({
              warning_level: Number(value) as WarnLevel
            })}
          />
          <CommonButton onClick={handleReset}>重置</CommonButton>
        </div>
        <div className={"col-span-2 flex items-center text-right justify-end space-x-4"}>
          {selectedRows.length > 0 &&
            <CommonButton onClick={onLoadOrderToMap}>地图加载</CommonButton>}

          <CommonDialog
            showCancel={false}
            contentClassName={"max-w-[1016px] py-0"}
            titleClassname={"pl-8"}
            childrenClassname={"pb-0"}
            open={open}
            onOpenChange={(value) => {
              if (!value) {
                setCurrentOrder(null);
              }
              setOpen(value);
            }}
            title={"工单管理"}
            trigger={<CommonButton
              permissionKey={"Collection_TicketCreateEdit"}
              onClick={() => {
                setCurrentOrder(null);
                setOrderType("create");
                stepper.goTo("1");
              }}
            >创建</CommonButton>}
            customFooter={
              <CommonButton
                type="submit"
                form={`${stepper.current.id === "1" ? "createOrderForm" :
                  stepper.current.id === "2" ? "feedbackForm" :
                    stepper.current.id === "3" ? "auditForm" : ""}`}
              >
                确认
              </CommonButton>}
          >
            <div className={"flex"}>
              <ol className="flex flex-col" aria-orientation="vertical">
                {stepper.all.map((step, index, array) => (
                  <div key={step.id} className={""}>
                    <li className="flex items-center gap-4 flex-shrink-0">
                      <Button
                        type="button"
                        variant={index <= currentIndex ? "default" : "secondary"}
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
                            className={`w-[2px] h-12 bg-[#9f9f9f]`}
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
                    <CreateOrder0630
                      type={orderType}
                      onSuccess={() => {
                        setOpen(false);
                        mutate();
                        mutateCurrentOrder();
                      }}
                      currentOrder={currentOrderData}
                    />,
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
          </CommonDialog>

          <Dialog>
            <DialogTrigger asChild>
              <CommonButton
                permissionKey={"Collection_TicketCreateEdit"}
                onClick={() => {
                  setCurrentOrder(null);
                  setOrderType("create");
                  stepper.goTo("1");
                }}
              >
                创建
              </CommonButton>
            </DialogTrigger>
            <DialogContent className="max-w-screen-lg bg-[#20355f]/[.8] text-white border-none">
              <DialogHeader className={""}>
                <DialogTitle>工单管理</DialogTitle>
              </DialogHeader>
              <div className={"border-[#43ABFF] flex p-8 rounded-md bg-[#1b233c] opacity-80"}>
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
          <CommonButton
            permissionKey={"Collection_TicketExport"}
            disabled={loading}
            onClick={onExportOrder}
            isLoading={loading}
          >
            导出工单报告
          </CommonButton>
        </div>
      </div>

      <CommonTable<WorkOrder>
        loading={isLoading}
        ref={tableRef}
        data={data?.list || []}
        columns={columns}
        getRowClassName={(_, index) => index % 2 === 1 ? "bg-[#203D67]/70" : ""}
        enableRowSelection={true}
        onRowSelectionChange={setSelectedRows}
        allCounts={data?.pagination.total || 0}
        onPaginationChange={handlePaginationChange}
      />
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

