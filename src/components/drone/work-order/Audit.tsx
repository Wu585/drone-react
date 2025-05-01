import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "@/components/ui/use-toast";
import {useAjax} from "@/lib/http";
import {useBindingDevice, useOperationList, WorkOrder} from "@/hooks/drone";
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
import WaylineActionList, {Action} from "@/components/drone/wayline/WaylineActionList.tsx";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import {ELocalStorageKey} from "@/types/enum.ts";

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
  global_rth_height: z.coerce.number()
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

const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

const Audit = ({currentOrder, onSuccess}: Props) => {
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
      global_rth_height: 100
    }
  });

  const [reviewActionList, setReviewActionList] = useState<{
    name: string
    func: string
    isGlobal?: boolean
    param?: Action
    type?: string
  }[]>([]);

  const reviewError = (err: any) => {
    console.log("表单验证错误:", err);
  };

  const onReviewSubmit = async (values: ReviewFormValues) => {
    console.log("values");
    console.log(values);
    console.log("reviewActionList");
    console.log(reviewActionList);
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
                                        value={device.device_name}>
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
                  name={"global_rth_height"}
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
      <Form {...form}>
        <form id="auditForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="status"
            render={({field}) => (
              <FormItem className="grid grid-cols-4 gap-4">
                <FormLabel className="text-right mt-4">审核结果</FormLabel>
                <Select
                  disabled={isPreview}
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <FormControl>
                    <SelectTrigger className="col-span-1 rounded-none h-[40px] bg-[#072E62]/[.7] border-[#43ABFF]">
                      <SelectValue placeholder="请选择审核结果"/>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(auditStatusMap).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="col-span-3 col-start-2"/>
                <Button className="bg-[#43ABFF] w-24" onClick={() => setSheetVisible(true)}>无人机复核</Button>
              </FormItem>
            )}
          />

          {status === AuditStatus.REJECT && (
            <FormField
              control={form.control}
              name="reason"
              render={({field}) => (
                <FormItem className="grid grid-cols-4 gap-4">
                  <FormLabel className="text-right mt-4">不通过原因</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Textarea
                        disabled={isPreview}
                        placeholder="请输入不通过原因"
                        className="resize-none h-[100px] rounded-none bg-[#072E62]/[.7] border-[#43ABFF]"
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
      </Form>
    </>
  );
};

export default Audit;

