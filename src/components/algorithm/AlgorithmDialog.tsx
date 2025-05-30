import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {z} from "zod";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useAjax} from "@/lib/http.ts";
import {ALGORITHM_CONFIG_API_PREFIX, AlgorithmPlatform, useAlgorithmConfigById} from "@/hooks/drone/algorithm";
import {toast} from "@/components/ui/use-toast.ts";
import {eventMap} from "@/hooks/drone";
import {Plus, Trash2} from "lucide-react";

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
  }),
  device_list: z.array(
    z.object({
      device_sn: z.string().min(1, "设备序列号不能为空"),
      instance_id: z.string().min(1, "实例ID不能为空")
    })
  ),
  algorithm_platform: z.coerce.number(z.nativeEnum(AlgorithmPlatform))
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
    warning_level: 1,
    device_list: [],
    algorithm_platform: 0
  };

  const form = useForm<AlgorithmFormValues>({
    resolver: zodResolver(algorithmFormSchema),
    defaultValues,
    values: id ? currentConfig : defaultValues
  });

  const algorithm_platform = form.watch("algorithm_platform");

  const {fields, append, remove} = useFieldArray({
    control: form.control,
    name: "device_list",
  });

  const _onOpenChange = (visible: boolean) => {
    onOpenChange?.(visible);
  };

  const _onSubmit = async (values: AlgorithmFormValues) => {
    console.log("values");
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
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            算法配置
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(_onSubmit)} className="space-y-2">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="algorithm_name"
                render={({field}) => (
                  <FormItem>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                      <FormLabel className="text-sm font-medium text-gray-700">
                        算法名称
                      </FormLabel>
                      <div className="space-y-1">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="请输入算法名称"
                            className="h-9 bg-white placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500"/>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                render={({field}) =>
                  <FormItem>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                      <FormLabel className="text-sm font-medium text-gray-700">
                        算法平台
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(+value)} value={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger className="h-9 w-full min-w-[180px]">
                            <SelectValue placeholder="选择算法平台"/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={AlgorithmPlatform.CloudPlatForm.toString()} className="text-sm">
                            算法平台
                          </SelectItem>
                          <SelectItem value={AlgorithmPlatform.Other.toString()} className="text-sm">
                            第三方平台
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="col-start-2 text-xs text-red-500"/>
                    </div>
                  </FormItem>}
                name={"algorithm_platform"}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 border-b pb-2">工单配置</h3>
              <div className="space-y-2 pl-2">
                <FormField
                  control={form.control}
                  render={({field}) =>
                    <FormItem>
                      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          事件类型
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger className="h-9 w-full min-w-[180px]">
                              <SelectValue placeholder="选择事件类型"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(eventMap).map(([key, value]) => (
                              <SelectItem key={key} value={key} className="text-sm">
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="col-start-2 text-xs text-red-500"/>
                      </div>
                    </FormItem>}
                  name={"order_type"}
                />

                <FormField
                  control={form.control}
                  render={({field}) =>
                    <FormItem>
                      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          告警等级
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="h-9 w-full min-w-[180px]">
                              <SelectValue placeholder="选择告警等级"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem key={"1"} value={"1"} className="text-blue-600">一般告警</SelectItem>
                            <SelectItem key={"2"} value={"2"} className="text-yellow-600">次要告警</SelectItem>
                            <SelectItem key={"3"} value={"3"} className="text-orange-600">主要告警</SelectItem>
                            <SelectItem key={"4"} value={"4"} className="text-red-600">紧急告警</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="col-start-2 text-xs text-red-500"/>
                      </div>
                    </FormItem>}
                  name={"warning_level"}
                />

                <FormField
                  control={form.control}
                  name="contact"
                  render={({field}) => (
                    <FormItem>
                      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          联系人
                        </FormLabel>
                        <div className="space-y-1">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="请输入联系人"
                              className="h-9 bg-white placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500"/>
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
                      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          联系电话
                        </FormLabel>
                        <div className="space-y-1">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="请输入联系电话"
                              className="h-9 bg-white placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500"/>
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
                      <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                        <FormLabel className="text-sm font-medium text-gray-700 mt-2">
                          事件描述
                        </FormLabel>
                        <div className="space-y-1">
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="请输入事件描述"
                              className="min-h-[80px] bg-white placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500"/>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-medium text-gray-700">实例配置</h3>
                <Button
                  type="button"
                  onClick={() => append({device_sn: "", instance_id: ""})}
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                >
                  <Plus className="h-3.5 w-3.5"/>
                  <span>添加</span>
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-gray-400">
                  暂无设备配置，点击上方按钮添加
                </div>
              ) : (
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative rounded-md border p-4">
                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        variant="ghost"
                        size="sm"
                        className="absolute right-4 top-6 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-4 w-4"/>
                      </Button>

                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name={`device_list.${index}.device_sn`}
                          render={({field}) => (
                            <FormItem>
                              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  设备序列号
                                </FormLabel>
                                <div className="space-y-1">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="请输入设备序列号"
                                      className="h-9 bg-white placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs text-red-500"/>
                                </div>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`device_list.${index}.instance_id`}
                          render={({field}) => (
                            <FormItem>
                              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  {+algorithm_platform === AlgorithmPlatform.CloudPlatForm ? "实例ID" : "视频源"}
                                </FormLabel>
                                <div className="space-y-1">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder={+algorithm_platform === AlgorithmPlatform.CloudPlatForm ? "请输入实例ID" : "请输入视频源"}
                                      className="h-9 bg-white placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs text-red-500"/>
                                </div>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button type="submit" className="min-w-[80px]">
                确认
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AlgorithmDialog;

