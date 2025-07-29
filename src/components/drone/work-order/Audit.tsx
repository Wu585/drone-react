import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {toast} from "@/components/ui/use-toast";
import {useAjax} from "@/lib/http";
import {useBindingDevice, useOperationList, usePermission, WorkOrder} from "@/hooks/drone";
import {Button} from "@/components/ui/button.tsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useState} from "react";
import WaylineActionList from "@/components/drone/wayline/WaylineActionList.tsx";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import OrderDetail from "@/components/drone/work-order/OrderDetail.tsx";
import {CommonSelect} from "@/components/drone/public/CommonSelect.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import {CommonTextarea} from "@/components/drone/public/CommonTextarea.tsx";
import {cn} from "@/lib/utils.ts";
import {OrderStatusMap} from "@/components/drone/work-order/order-eventmap.ts";

// 定义审核状态枚举
enum AuditStatus {
  PASS = 1,
  REJECT = 2
}

const auditSchema = z.object({
  status: z.coerce.number().refine(
    (val): val is AuditStatus => Object.values(AuditStatus).includes(val),
    "请选择有效的审核结果"
  ),
  reason: z.string()
}).refine(
  (data) => {
    // 如果是不通过状态，则reason必填
    if (data.status === AuditStatus.REJECT) {
      return !!data.reason;
    }
    return true;
  },
  {
    message: "请输入不通过原因",
    path: ["reason"] // 指定错误信息显示在reason字段
  }
);

// 无人机复核 schema
const reviewSchema = z.object({
  global_height: z.coerce.number()
    .min(20, {message: "航线高度不能低于20米"})
    .max(150, {message: "航线高度不能超过150米"}),
  auto_flight_speed: z.coerce.number()
    .min(1, {message: "全局航线速度不能小于1米/s"})
    .max(15, {message: "全局航线速度不能大于15米/s"}),
  rth_altitude: z.coerce.number()
    .min(80, {message: "航线高度不能低于20米"})
    .max(150, {message: "航线高度不能超过150米"}),
  dock_sn: z.string().min(1, {
    message: "请选择设备"
  })
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const auditStatusMap: Record<AuditStatus, string> = {
  [AuditStatus.PASS]: "通过",
  [AuditStatus.REJECT]: "不通过"
};

type AuditFormValues = z.infer<typeof auditSchema>;

interface Props {
  currentOrder?: WorkOrder;
  onSuccess?: () => void;
}

const OPERATION_HTTP_PREFIX = "operation/api/v1";

const Audit = ({currentOrder, onSuccess}: Props) => {
  const {hasPermission} = usePermission();
  const isGly = hasPermission("Collection_TicketAssign");

  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

  const {post} = useAjax();
  const {data: operationList} = useOperationList(currentOrder?.id);
  const [sheetVisible, setSheetVisible] = useState(false);

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      status: operationList?.list[0]?.status || AuditStatus.PASS,
      reason: ""
    }
  });

  const isPreview = currentOrder?.status === 3;
  const status = form.watch("status");

  const onSubmit = async (values: AuditFormValues) => {
    if (isPreview) return;
    const formValue = {
      ...values,
      order_id: currentOrder?.id,
      order_operation_id: operationList?.list[0].id
    };
    console.log("formValue");
    console.log(formValue);
    try {
      const res: any = await post(`${OPERATION_HTTP_PREFIX}/order/approve`, formValue);
      if (res.data.code === 0) {
        toast({
          description: "审核成功！"
        });
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        description: error.data.message,
        variant: "destructive"
      });
    }
  };

  // 无人机复核
  const {data: bindingDevices} = useBindingDevice(workspaceId, {
    page: 1,
    total: -1,
    page_size: 100,
    domain: EDeviceTypeName.Dock
  });

  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      global_height: 100,
      auto_flight_speed: 12,
      rth_altitude: 100,
      dock_sn: ""
    }
  });

  const [reviewActionList, setReviewActionList] = useState<{
    name: string
    func: string
    isGlobal?: boolean
    param?: any
    type?: string
  }[]>([]);

  const reviewError = (err: any) => {
    console.log("表单验证错误:", err);
  };

  const onReviewSubmit = async (values: ReviewFormValues) => {
    if (!currentOrder || !bindingDevices) return;
    const {longitude, latitude} = currentOrder;
    const actions = reviewActionList.map((action, index) => {
      const base = {
        action_index: index,
        action_actuator_func: action.func
      };
      if (action.func === "hover") {
        return {
          ...base,
          hover_time: action.param
        };
      }
      if (action.func === "rotateYaw") {
        return {
          ...base,
          aircraft_heading: action.param
        };
      }
      if (action.func === "gimbalRotate" && action.type && action.type === "gimbal_yaw_rotate_angle") {
        return {
          ...base,
          gimbal_yaw_rotate_angle: action.param
        };
      }
      if (action.func === "gimbalRotate" && action.type && action.type === "gimbal_pitch_rotate_angle") {
        return {
          ...base,
          gimbal_pitch_rotate_angle: action.param
        };
      }
      if (action.func === "zoom") {
        return {
          ...base,
          zoom: action.param * 24
        };
      }
      if (action.func === "stopRecord") {
        return {
          ...base,
        };
      }
      if (action.func === "takePhoto" || action.func === "startRecord" || action.func === "panoShot") {
        return {
          ...base,
          use_global_image_format: 1,
          image_format: ["zoom", "wide", "ir"].join(","),
        };
      }
    });
    const device = bindingDevices.list.find(item => item.device_sn === values.dock_sn);
    console.log('device===');
    console.log(device);
    const map: Record<string, any> = {
      "67-1": {
        payload_type: 53,
        payload_position: 0
      },
      "91-1": {
        payload_type: 81,
        payload_position: 0
      },
      "100-1": {
        payload_type: 99,
        payload_position: 0
      },
    };
    if (!device) return;
    const key = `${device.children.type}-${device.children.sub_type}`;
    const body = {
      req: {
        fly_to_wayline_mode: "safely",
        take_off_security_height: 100,
        global_transitional_speed: 15,
        template_type: "waypoint",
        drone_type: device.children.type,
        sub_drone_type: device.children.sub_type,
        payload_type: map[key].payload_type,
        payload_position: map[key].payload_position,
        image_format: ["zoom", "wide", "ir"].join(","),
        finish_action: "goHome",
        exit_on_rc_lost_action: "goBack",
        global_height: values.global_height,
        auto_flight_speed: values.auto_flight_speed,
        waypoint_heading_req: {
          waypoint_heading_mode: "followWayline"
        },
        waypoint_turn_req: {
          waypoint_turn_mode: "toPointAndStopWithDiscontinuityCurvature"
        },
        gimbal_pitch_mode: "manual",
        route_point_list: [
          {
            route_point_index: 0,
            longitude,
            latitude,
            action_trigger_req: {
              action_trigger_type: "reach_point",
            },
            actions
          }
        ],
        rth_altitude: values.rth_altitude
      },
      dock_sn: values.dock_sn
    };

    try {
      const res: any = await post(`${OPERATION_HTTP_PREFIX}/order/${currentOrder.id}/createWaylineAndJob`, body);
      if (res.data.code === 0) {
        toast({
          description: "复核任务创建成功！"
        });
      }
    } catch (err) {
      toast({
        description: "复核任务创建失败！",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Sheet open={sheetVisible} onOpenChange={setSheetVisible}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>无人机复核</SheetTitle>
            <SheetDescription>
              配置无人机复核参数
            </SheetDescription>
          </SheetHeader>
          <Form {...reviewForm}>
            <form onSubmit={reviewForm.handleSubmit(onReviewSubmit, reviewError)} className="space-y-4">
              <div className="py-4">
                <FormField
                  control={reviewForm.control}
                  render={({field}) => (
                    <FormItem className={"flex flex-col"}>
                      <FormLabel className="mt-4">选择设备</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value)}
                              value={field.value}>
                        <FormControl>
                          <SelectTrigger
                            className="text-black col-span-3 rounded-none h-[40px]">
                            <SelectValue placeholder="请选择选择设备"/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bindingDevices?.list.map((device) => (
                            <SelectItem key={device.device_sn}
                                        value={device.device_sn}>
                              {device.device_name} - {device?.children?.nickname || "暂无"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                    </FormItem>
                  )}
                  name={"dock_sn"}
                />
                <FormField
                  control={reviewForm.control}
                  render={({field}) => (
                    <FormItem className={"flex flex-col"}>
                      <FormLabel className="mt-4">默认飞行高度（m）</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none h-[40px]"/>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                  name={"global_height"}
                />
                <FormField
                  control={reviewForm.control}
                  render={({field}) => (
                    <FormItem className={"flex flex-col"}>
                      <FormLabel className="mt-4">默认飞行速度（m/s）</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none h-[40px]"/>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                  name={"auto_flight_speed"}
                />
                <FormField
                  control={reviewForm.control}
                  render={({field}) => (
                    <FormItem className={"flex flex-col"}>
                      <FormLabel className="mt-4">返航高度（m）</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none h-[40px]"/>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                  name={"rth_altitude"}
                />
                <WaylineActionList selectedActionList={reviewActionList} setSelectedActionList={setReviewActionList}/>
              </div>
              <SheetFooter>
                <Button type="submit">执行</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
      <OrderDetail currentOrder={currentOrder}/>
      <div className={"flex space-x-2 mt-4"}>
        <h1 className={"text-blue-500 font-semibold text-lg "}>工单状态：</h1>
        <div className={cn({
          "text-yellow-500": currentOrder?.status === 0,
          "text-blue-500": currentOrder?.status === 1,
          "text-orange-500": currentOrder?.status === 2,
          "text-green-500": currentOrder?.status === 3,
          "text-red-500": currentOrder?.status === 4,
        }, "text-lg font-semibold")}>
          <span className={"text-lg"}>{OrderStatusMap[currentOrder?.status]}</span>
        </div>
      </div>
      {isGly && <Form {...form}>
        <form id="auditForm" onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
          <FormField
            control={form.control}
            name="status"
            render={({field}) => (
              <FormItem className="grid grid-cols-12 gap-4">
                <FormLabel className="text-left mt-4 col-span-2">审核结果：</FormLabel>
                <FormControl>
                  <CommonSelect
                    className={"col-span-4"}
                    disabled={isPreview}
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(Number(value))}
                    placeholder={"请选择审核结果"}
                    options={Object.entries(auditStatusMap).map(([key, value]) => ({
                      value: key,
                      label: value
                    }))}
                  />
                </FormControl>
                <FormMessage className="col-span-3 col-start-2"/>
                <CommonButton
                  disabled={currentOrder?.status === 3}
                  className={"col-span-2"}
                  type={"button"}
                  onClick={() => setSheetVisible(true)}>无人机复核</CommonButton>
              </FormItem>
            )}
          />

          {status === AuditStatus.REJECT && (
            <FormField
              control={form.control}
              name="reason"
              render={({field}) => (
                <FormItem className="grid grid-cols-12 gap-4">
                  <FormLabel className="col-span-2 mt-4">不通过原因：</FormLabel>
                  <div className="col-span-10">
                    <FormControl>
                      <CommonTextarea
                        disabled={isPreview}
                        placeholder="请输入不通过原因"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </div>
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>}
    </>
  );
};

export default Audit;

