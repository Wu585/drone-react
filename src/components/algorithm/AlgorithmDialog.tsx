import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useAjax} from "@/lib/http.ts";
import {ALGORITHM_CONFIG_API_PREFIX, useAlgorithmConfigById} from "@/hooks/drone/algorithm";
import {toast} from "@/components/ui/use-toast.ts";
import {eventMap} from "@/hooks/drone";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<void>;
  id?: number;
}

const algorithmFormSchema = z.object({
  algorithm_name: z.string().min(1, "请输入算法名称"),
  contact: z.string().min(1, "请输入联系人"),
  contact_phone: z.string().min(1, "请输入联系电话"),
  order_type: z.coerce.number({
    required_error: "请选择事件类型",
    invalid_type_error: "事件类型必须是数字"
  }).refine(
    (val) => Object.keys(eventMap).map(Number).includes(val),
    "请选择有效的事件类型"
  ),
  description: z.string().min(1, "请输入事件描述"),
  warning_level: z.coerce.number({
    required_error: "请选择告警类型",
    invalid_type_error: "告警类型必须是数字"
  })
});

export type AlgorithmFormValues = z.infer<typeof algorithmFormSchema>;

const AlgorithmDialog = ({open, onOpenChange, onSuccess, id}: Props) => {
  const {post, put} = useAjax();

  const {data: currentConfig} = useAlgorithmConfigById(id);

  const defaultValues: AlgorithmFormValues = {
    algorithm_name: "",
    contact: "",
    contact_phone: "",
    order_type: 0,
    description: "",
    warning_level: 1
  };

  const form = useForm<AlgorithmFormValues>({
    resolver: zodResolver(algorithmFormSchema),
    defaultValues,
    values: currentConfig
  });

  const _onOpenChange = (visible: boolean) => {
    onOpenChange?.(visible);
  };

  const _onSubmit = async (values: AlgorithmFormValues) => {
    console.log(values);
    try {
      if (id) {
        await put(`${ALGORITHM_CONFIG_API_PREFIX}/${id}`, values);
        toast({
          description: "算法配置更新成功"
        });
        await onSuccess?.();
      } else {
        await post(`${ALGORITHM_CONFIG_API_PREFIX}`, values);
        toast({
          description: "算法配置创建成功"
        });
        await onSuccess?.();
      }
    } catch (err: any) {
      toast({
        description: err?.data?.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={_onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            算法配置
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(_onSubmit)} className={""}>
            <div className={"mb-4"}>
              {/*<h1 className={"font-bold"}>算法配置</h1>*/}
              <FormField
                control={form.control}
                name="algorithm_name"
                render={({field}) => (
                  <FormItem>
                    <div className="grid grid-cols-[100px_1fr] items-start">
                      <FormLabel className="leading-[32px]">
                        算法名称
                      </FormLabel>
                      <div className="space-y-2">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={"请输入算法名称"}
                            className="bg-transparent border-[#43ABFF] placeholder:text-gray-400 h-8"
                          />
                        </FormControl>
                        <FormMessage className="text-[#ff4d4f] text-sm"/>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div>
              {/*<h1 className={"font-bold"}>工单配置</h1>*/}
              <div className={"space-y-4"}>
                <FormField
                  control={form.control}
                  render={({field}) =>
                    <FormItem>
                      <div className="grid grid-cols-[100px_1fr] items-start">
                        <FormLabel className="leading-[32px]">
                          事件类型
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger className={"border-[#43ABFF] h-8 w-32"}>
                              <SelectValue placeholder="选择事件类型"/>
                              <FormMessage/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(eventMap).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormItem>}
                  name={"order_type"}
                />
                <FormField
                  control={form.control}
                  render={({field}) =>
                    <FormItem>
                      <div className="grid grid-cols-[100px_1fr] items-start">
                        <FormLabel className="leading-[32px]">
                          告警等级
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className={"border-[#43ABFF] h-8 w-32"}>
                              <SelectValue placeholder="选择告警等级"/>
                              <FormMessage/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem key={"1"} value={"1"} className={"text-blue-500"}>一般告警</SelectItem>
                            <SelectItem key={"2"} value={"2"} className={"text-yellow-500"}>次要告警</SelectItem>
                            <SelectItem key={"3"} value={"3"} className={"text-orange-500"}>主要告警</SelectItem>
                            <SelectItem key={"4"} value={"4"} className={"text-red-500"}>紧急告警</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormItem>}
                  name={"warning_level"}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({field}) => (
                    <FormItem>
                      <div className="grid grid-cols-[100px_1fr] items-start">
                        <FormLabel className="leading-[32px]">
                          联系人
                        </FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={"请输入联系人"}
                              className="bg-transparent border-[#43ABFF] placeholder:text-gray-400 h-8"
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff4d4f] text-sm"/>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({field}) => (
                    <FormItem>
                      <div className="grid grid-cols-[100px_1fr] items-start">
                        <FormLabel className="leading-[32px]">
                          联系电话
                        </FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={"请输入联系电话"}
                              className="bg-transparent border-[#43ABFF] placeholder:text-gray-400 h-8"
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff4d4f] text-sm"/>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({field}) => (
                    <FormItem>
                      <div className="grid grid-cols-[100px_1fr] items-start">
                        <FormLabel className="leading-[32px]">
                          事件描述
                        </FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={"请输入事件描述"}
                              className="resize-none bg-transparent border-[#43ABFF] placeholder:text-gray-400 h-8"
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff4d4f] text-sm"/>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div>
              {/*<h1 className={"font-bold"}>实例配置</h1>
              <div>

              </div>*/}
            </div>
            <DialogFooter className={"mt-4"}>
              <Button type={"submit"}>确认</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AlgorithmDialog;

