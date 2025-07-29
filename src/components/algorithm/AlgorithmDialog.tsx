import {z} from "zod";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {useAjax} from "@/lib/http.ts";
import {
  ALGORITHM_CONFIG_API_PREFIX,
  AlgorithmPlatform, cloudClient,
  useAlgorithmConfigById,
  useTaskList
} from "@/hooks/drone/algorithm";
import {toast} from "@/components/ui/use-toast.ts";
import {eventMap} from "@/hooks/drone";
import {Plus, Trash2} from "lucide-react";
import {useEffect} from "react";
import CommonDialog from "@/components/drone/public/CommonDialog.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import {CommonSelect} from "@/components/drone/public/CommonSelect.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import {CommonTextarea} from "@/components/drone/public/CommonTextarea.tsx";
import {IconButton} from "@/components/drone/public/IconButton.tsx";
import {CommonSwitch} from "@/components/drone/public/CommonSwitch.tsx";

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
      instance_id: z.string().min(1, "实例ID不能为空"),
      task_id: z.string().optional()
    })
  ),
  algorithm_platform: z.coerce.number(z.nativeEnum(AlgorithmPlatform))
});

export type AlgorithmFormValues = z.infer<typeof algorithmFormSchema>;

const AlgorithmDialog = ({open, onOpenChange, onSuccess, id}: Props) => {
  const {post, put} = useAjax();
  const {data: currentConfig, mutate} = useAlgorithmConfigById(id);

  console.log("currentConfig");
  console.log(currentConfig);

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
  });

  // Reset form when opening/closing or when ID changes
  useEffect(() => {
    if (open) {
      if (currentConfig) {
        form.reset({
          ...currentConfig,
          device_list: currentConfig.device_list || []
        });
      } else if (!id) {
        // New form case
        form.reset(defaultValues);
      }
    }
  }, [open, currentConfig, id, form]);

  const algorithm_platform = form.watch("algorithm_platform");

  const {fields, append, remove} = useFieldArray({
    control: form.control,
    name: "device_list",
  });

  const _onOpenChange = (visible: boolean) => {
    if (!visible) {
      // Reset to default only when closing without saving
      form.reset(defaultValues);
    }
    onOpenChange(visible);
  };

  const onError = (error) => {
    console.log("error");
    console.log(error);
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
        await mutate();
        await onSuccess?.();
      } else {
        await post(`${ALGORITHM_CONFIG_API_PREFIX}`, values);
        toast({
          description: "算法配置创建成功"
        });
        await mutate();
        // await mutateTaskList();
        await onSuccess?.();
      }
    } catch (err: any) {
      toast({
        description: err?.data?.message,
        variant: "destructive"
      });
    }
  };

  const {data: taskList, mutate: mutateTaskList} = useTaskList({page: 1, page_size: 100, input_type: "video"});

  const onSwitchTask = async (checked: boolean, task_id?: string) => {
    try {
      await cloudClient.put(`/tasks/${task_id}/${checked ? "start" : "stop"}`);
      toast({
        description: checked ? "任务启用成功！" : "任务停用成功！",
      });
      await mutateTaskList();
    } catch (err) {
      toast({
        description: checked ? "任务启用失败，请联系管理员！" : "任务停用失败，请联系管理员！",
        variant: "destructive"
      });
    }
  };

  return (
    <CommonDialog
      open={open}
      onOpenChange={_onOpenChange}
      title={"算法配置"}
      showCancel={false}
      customFooter={
        <div className="flex">
          <CommonButton type="submit" form="algorithm-form" className={"ml-auto"}>确认</CommonButton>
        </div>}
    >
      <Form {...form}>
        <form id="algorithm-form" onSubmit={form.handleSubmit(_onSubmit, onError)} className="space-y-2">
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="algorithm_name"
              render={({field}) => (
                <FormItem>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <FormLabel className="text-sm font-medium text-white">
                      算法名称
                    </FormLabel>
                    <div className="space-y-1">
                      <FormControl>
                        <CommonInput
                          {...field}
                          placeholder="请输入算法名称"
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
                    <FormLabel className="text-sm font-medium text-white">
                      算法平台
                    </FormLabel>
                    <FormControl>
                      <CommonSelect
                        onValueChange={(value) => field.onChange(+value)}
                        value={field.value.toString()}
                        options={
                          [
                            {
                              value: AlgorithmPlatform.CloudPlatForm.toString(),
                              label: "算法平台"
                            },
                            {
                              value: AlgorithmPlatform.Other.toString(),
                              label: "第三方平台"
                            }
                          ]}
                      />
                    </FormControl>
                    <FormMessage className="col-start-2 text-xs text-red-500"/>
                  </div>
                </FormItem>}
              name={"algorithm_platform"}
            />
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-medium text-white pt-4">工单配置：</h3>
            <div className="space-y-2">
              <FormField
                control={form.control}
                render={({field}) =>
                  <FormItem>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                      <FormLabel className="text-sm font-medium text-white">
                        事件类型
                      </FormLabel>
                      <FormControl>
                        <CommonSelect
                          onValueChange={field.onChange} value={field.value.toString()}
                          options={Object.entries(eventMap).map(([key, value]) => ({
                            value: key,
                            label: value
                          }))}
                        />
                      </FormControl>
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
                      <FormLabel className="text-sm font-medium text-white">
                        告警等级
                      </FormLabel>
                      <FormControl>
                        <CommonSelect
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                          options={[
                            {
                              value: "1",
                              label: "一般告警"
                            },
                            {
                              value: "2",
                              label: "次要告警"
                            },
                            {
                              value: "3",
                              label: "主要告警"
                            },
                            {
                              value: "4",
                              label: "紧急告警"
                            },
                          ]}
                        />
                      </FormControl>
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
                      <FormLabel className="text-sm font-medium text-white">
                        联系人
                      </FormLabel>
                      <div className="space-y-1">
                        <FormControl>
                          <CommonInput
                            {...field}
                            placeholder="请输入联系人"
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
                      <FormLabel className="text-sm font-medium text-white">
                        联系电话
                      </FormLabel>
                      <div className="space-y-1">
                        <FormControl>
                          <CommonInput
                            {...field}
                            placeholder="请输入联系电话"
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
                      <FormLabel className="text-sm font-medium text-white mt-2">
                        事件描述
                      </FormLabel>
                      <div className="space-y-1">
                        <FormControl>
                          <CommonTextarea
                            {...field}
                            placeholder="请输入事件描述"
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

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">实例配置：</h3>
              <CommonButton
                type="button"
                onClick={() => append({device_sn: "", instance_id: "", task_id: ""})}
                size="sm"
                className="h-8 gap-1"
              >
                <Plus className="h-3.5 w-3.5"/>
                <span>添加</span>
              </CommonButton>
            </div>

            {fields.length === 0 ? (
              <div
                className="rounded-md border border-dashed p-4 text-center text-sm text-white border-[#2D5FAC]/[.85]">
                暂无设备配置，点击上方按钮添加
              </div>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {fields.map((field, index) => (
                  <div key={field.id} className="relative rounded p-4 bg-[#223B6F]/[.5]">
                    <div className={"flex justify-between items-center pb-1"}>
                      {form.watch(`device_list.${index}.task_id`) ?
                        <CommonSwitch
                          checked={
                            !!taskList?.items.find(
                              (item) =>
                                item.id === +field.task_id! &&
                                item.status &&
                                item.status !== "not_started"
                            )
                          }
                          onCheckedChange={(checked) =>
                            onSwitchTask(checked, form.watch(`device_list.${index}.task_id`))}
                        /> :
                        <div></div>}
                      <IconButton
                        type="button"
                        onClick={() => remove(index)}
                        size="sm"
                      >
                        <Trash2 size={16}/>
                      </IconButton>
                    </div>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name={`device_list.${index}.device_sn`}
                        render={({field}) => (
                          <FormItem>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                              <FormLabel className="text-sm font-medium text-white">
                                设备序列号
                              </FormLabel>
                              <div className="space-y-1">
                                <FormControl>
                                  <CommonInput
                                    {...field}
                                    placeholder="请输入设备序列号"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs text-red-500"/>
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />

                      {algorithm_platform === 0 && <FormField
                        control={form.control}
                        name={`device_list.${index}.task_id`}
                        render={({field}) => (
                          <FormItem>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                              <FormLabel className="text-sm font-medium text-white">
                                任务ID
                              </FormLabel>
                              <div className="space-y-1">
                                <FormControl>
                                  <CommonInput
                                    {...field}
                                    placeholder="请输入任务ID"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs text-red-500"/>
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />}

                      <FormField
                        control={form.control}
                        name={`device_list.${index}.instance_id`}
                        render={({field}) => (
                          <FormItem>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                              <FormLabel className="text-sm font-medium text-white">
                                {+algorithm_platform === AlgorithmPlatform.CloudPlatForm ? "实例ID" : "视频源"}
                              </FormLabel>
                              <div className="space-y-1">
                                <FormControl>
                                  <CommonInput
                                    {...field}
                                    placeholder={+algorithm_platform === AlgorithmPlatform.CloudPlatForm ? "请输入实例ID" : "请输入视频源"}
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
        </form>
      </Form>
    </CommonDialog>
  );
};

export default AlgorithmDialog;

