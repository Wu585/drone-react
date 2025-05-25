import {z} from "zod";
import {useBindingDevice, WorkOrder} from "@/hooks/drone";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useState} from "react";
import {ELocalStorageKey} from "@/types/enum.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {useAjax} from "@/lib/http.ts";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Input} from "@/components/ui/input.tsx";
import WaylineActionList from "@/components/drone/wayline/WaylineActionList.tsx";
import {Button} from "@/components/ui/button.tsx";

const OPERATION_HTTP_PREFIX = "operation/api/v1";

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

interface Props {
  currentOrder?: WorkOrder;
  onSuccess?: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const ReviewSheet = ({currentOrder, onSuccess, open, setOpen}: Props) => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {post} = useAjax();

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
    if (!longitude || !latitude) return toast({
      description: "没有正确的坐标点位！",
      variant: "destructive",
    });
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
    const map: Record<string, any> = {
      "67-1": {
        payload_type: 53,
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
      await post(`${OPERATION_HTTP_PREFIX}/order/${currentOrder.id}/createWaylineAndJob`, body);
      toast({
        description: "复核任务创建成功！"
      });
      onSuccess?.();
    } catch (err) {
      toast({
        description: "复核任务创建失败！",
        variant: "destructive"
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
  );
};

export default ReviewSheet;

