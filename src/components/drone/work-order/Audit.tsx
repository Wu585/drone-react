import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "@/components/ui/use-toast";
import {useAjax} from "@/lib/http";
import {useOperationList, WorkOrder} from "@/hooks/drone";
import {Button} from "@/components/ui/button.tsx";

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
  const {post} = useAjax();
  const {data: operationList} = useOperationList(currentOrder?.id);

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

  return (
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
              <Button className="bg-[#43ABFF] w-24">无人机复核</Button>
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
  );
};

export default Audit;

