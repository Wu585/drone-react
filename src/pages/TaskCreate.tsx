import {Camera, CircleMinus, CirclePlus, Drone, Minus, Package2, Rocket, User, X} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {Input} from "@/components/ui/input.tsx";
import {useVisible} from "@/hooks/public/utils.ts";
import {cn} from "@/lib/utils.ts";
import {useEffect, useState} from "react";
import {ELocalStorageKey} from "@/types/enum.ts";
import {
  CreatePlan,
  Device, HTTP_PREFIX_Wayline,
  useBindingDevice,
  useDeleteWalineFile,
  useDownloadWayline, useWaylineById,
  useWaylines,
  WaylineItem
} from "@/hooks/drone";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {DEVICE_NAME} from "@/types/device.ts";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {z} from "zod";
import {OutOfControlAction, OutOfControlActionOptions, TaskType, TaskTypeOptions} from "@/types/task.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import NewCommonDateRangePicker from "@/components/public/NewCommonDateRangePicker.tsx";
import {DateRange} from "react-day-picker";
import {TimePickerDemo} from "@/components/public/TimePickerDemo.tsx";
import {useAjax} from "@/lib/http.ts";
import Scene from "@/components/drone/public/Scene.tsx";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import {waylinePointConfig} from "@/lib/wayline.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {useSetViewByWaylineData} from "@/hooks/drone/wayline/useSetViewByWaylineData.ts";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";

const formSchema = z.object({
  name: z.string()
    .min(1, {message: "请输入任务名称"})
    .max(20, {message: "长度应为1到20"}),
  file_id: z.string().nonempty({message: "请选择路线"}),
  dock_sn: z.string().nonempty({message: "请选择设备"}),
  task_type: z.nativeEnum(TaskType, {message: "请选择任务策略"}),
  select_execute_date: z.union([
    z.array(z.date()).length(2),
    z.undefined()
  ]),
  select_time: z.array(z.array(z.date())).min(1, {message: "请至少选择一个时间"}),
  select_time_number: z.number(),
  // rth_altitude: z.string().regex(/^[0-9]+$/, {message: "RTH高度需要为数字"}),
  rth_altitude: z.coerce.number()
    .min(2, {message: "返航高度不能低于20米"})
    .max(200, {message: "安全起飞高度不能超过200米"}),
  out_of_control_action: z.nativeEnum(OutOfControlAction, {message: "请选择失控动作"}),
  min_battery_capacity: z.coerce.number()
    .min(50, {message: "电量不能小于50%"})
    .max(100, {message: "电量不能大于100%"}),
  min_storage_capacity: z.coerce.number().optional()
}).refine(
  (data) => {
    // 如果是定时或连续任务，必须选择日期
    if (data.task_type === TaskType.Timed || data.task_type === TaskType.Condition) {
      return data.select_execute_date && data.select_execute_date.length === 2;
    }
    // 其他情况返回 true
    return true;
  },
  {
    message: "请选择日期范围",
    path: ["select_execute_date"], // 指定错误消息显示在哪个字段下
  }
);

const defaultValue = {
  name: "",
  file_id: "", // Initially empty, will be set later
  dock_sn: "", // Initially empty, will be set later
  task_type: TaskType.Immediate,
  select_execute_date: [new Date(), new Date()],
  select_time_number: 1,
  select_time: [[]],
  rth_altitude: 100,
  out_of_control_action: OutOfControlAction.ReturnToHome,
  min_battery_capacity: 90,
  min_storage_capacity: undefined,
};

const TaskCreate = () => {
  const departId = localStorage.getItem("departId");

  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const {visible: selectPanelVisible, show, hide} = useVisible();
  const {post} = useAjax();
  const [selectedWayline, setSelectedWayline] = useState<WaylineItem | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

  const {downloadWayline} = useDownloadWayline(workspaceId);
  const {deleteWaylineFile} = useDeleteWalineFile(workspaceId);
  const {data: waylines, mutate} = useWaylines(workspaceId, {
    order_by: "update_time desc",
    page: 1,
    page_size: 1000,
    organ: departId ? +departId : undefined,
  });

  const {data: bindingDevices} = useBindingDevice(workspaceId, {
    page: 1,
    page_size: 100,
    domain: EDeviceTypeName.Dock,
    organ: departId ? +departId : undefined,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValue
  });

  useEffect(() => {
    console.log("bindingDevices");
    console.log(bindingDevices);
  }, [bindingDevices]);

  const onerr = (err) => {
    console.log("err===");
    console.log(err);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("values");
    console.log(values);
    const createPlanBody = {...values} as unknown as CreatePlan;

    // 处理执行日期
    if (values.select_execute_date?.length === 2) {
      createPlanBody.task_days = [];
      // 遍历日期范围内的每一天
      for (let i = values.select_execute_date[0]; i <= values.select_execute_date[1]; i.setDate(i.getDate() + 1)) {
        createPlanBody.task_days.push(Math.floor(i.getTime() / 1000));
      }
    }

    createPlanBody.select_execute_date = values.select_execute_date?.map(item => item.toISOString()) || [];
    createPlanBody.select_time = values.select_time.map(arr => arr.map(item => item.toISOString()));
    // 处理执行时间
    createPlanBody.task_periods = [];
    if (values.task_type !== TaskType.Immediate) {
      for (let i = 0; i < values.select_time.length; i++) {
        const result = [];
        // 添加开始时间
        result.push(Math.floor(values.select_time[i][0].getTime() / 1000));
        // 如果是连续任务，还需要添加结束时间
        if (values.task_type === TaskType.Condition) {
          result.push(Math.floor(values.select_time[i][1].getTime() / 1000));
        }
        createPlanBody.task_periods.push(result);
      }
    }

    // 如果有航线模板类型，添加到请求体
    if (selectedWayline?.template_types && selectedWayline.template_types.length > 0) {
      createPlanBody.wayline_type = selectedWayline.template_types[0];
    }

    console.log("createPlanBody");
    console.log(createPlanBody);

    createPlanBody.organ = departId || 0;

    const device = bindingDevices?.list.find(item => item.device_sn === createPlanBody.dock_sn);
    if (!device) return;

    try {
      await post(`${HTTP_PREFIX_Wayline}/workspaces/${device.workspace_id}/flight-tasks`, createPlanBody as any);
    } catch (error: any) {
      console.error("Create plan failed:", error);
      toast({
        description: error.data.message,
        variant: "destructive"
      });
    } finally {
      navigate("/task-list");
    }
  };

  const [date, setDate] = useState<DateRange | undefined>();

  useEffect(() => {
    console.log("date");
    console.log(date);
  }, [date]);

  const handleAddTime = () => {
    const currentTimes = form.getValues("select_time");
    const currentNumber = form.getValues("select_time_number");
    form.setValue("select_time", [...currentTimes, []]);
    form.setValue("select_time_number", currentNumber + 1);
  };

  const handleRemoveTime = () => {
    const currentTimes = form.getValues("select_time");
    const currentNumber = form.getValues("select_time_number");
    if (currentTimes.length > 1) {
      form.setValue("select_time", currentTimes.slice(0, -1));
      form.setValue("select_time_number", currentNumber - 1);
    }
  };

  const {data: currentWaylineData} = useWaylineById(selectedWayline?.id || "");

  useSetViewByWaylineData(selectedWayline?.id || "");

  useEffect(() => {
    console.log("currentWaylineData");
    console.log(currentWaylineData);
    if (currentWaylineData && currentWaylineData.route_point_list && currentWaylineData.route_point_list.length > 0) {
      getCustomSource("waylines-preview")?.entities.removeAll();
      currentWaylineData.route_point_list.forEach((point, index) => {
        getCustomSource("waylines-preview")?.entities.add(waylinePointConfig({
          longitude: point.longitude,
          latitude: point.latitude,
          height: point.height || currentWaylineData.global_height,
          text: (index + 1).toString()
        }));
        getCustomSource("waylines-preview")?.entities.add({
          polyline: currentWaylineData.route_point_list[index + 1] ? {
            positions: [
              Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, point.height || currentWaylineData.global_height),
              Cesium.Cartesian3.fromDegrees(currentWaylineData.route_point_list[index + 1].longitude,
                currentWaylineData.route_point_list[index + 1].latitude,
                currentWaylineData.route_point_list[index + 1].height || currentWaylineData.global_height)
            ],
            width: 2,
            material: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8)
          } : {}
        });
        getCustomSource("waylines-preview")?.entities.add({
          polyline: {
            positions: [
              Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, 0),
              Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, point.height || currentWaylineData.global_height)
            ],
            width: 2,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8),
              dashLength: 8.0
            })
          }
        });
      });
    }
  }, [currentWaylineData]);

  const onSelectWayline = (line: WaylineItem) => {
    form.setValue("file_id", line.id);
    setSelectedWayline(line);
  };

  const WaylineList = () => (
    <>
      {!waylines || waylines.list.length === 0 ? <div className={"content-center py-8 text-[#d0d0d0]"}>
        暂无数据
      </div> : waylines.list.map(line =>
        <div onClick={() => onSelectWayline(line)}
             className={"bg-panel-item bg-full-size text-[14px] p-4 cursor-pointer"}
             key={line.id}>
          <div className={"grid grid-cols-6 space-x-8 relative"}>
            <span className={"col-span-2"}>{line.name}</span>
            <span className={"space-x-4 text-[12px] text-[#d0d0d0] grid grid-cols-6 items-center"}>
                <User className={"col-span-2"} size={16}/>
                <span>{line.user_name}</span>
              </span>
            <Popover>
              <PopoverTrigger className={"col-span-2 absolute right-0"}>
                <span className={"cursor-pointer"}>...</span>
              </PopoverTrigger>
              <PopoverContent className={"w-24 flex flex-col "}>
                <Button variant={"ghost"} onClick={() => downloadWayline(line.id, line.name)}>下载</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant={"ghost"}>删除</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>删除航线</AlertDialogTitle>
                      <AlertDialogDescription>
                        确认删除航线吗？
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={async () => {
                        await deleteWaylineFile(line.id);
                        await mutate();
                      }}>确定</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </PopoverContent>
            </Popover>
          </div>
          <div className={"grid grid-cols-6 space-x-8 text-[12px] text-[#d0d0d0]"}>
            <div className={"col-span-2 space-x-2 grid grid-cols-6 items-center"}>
              <Rocket className={"col-span-1"} size={14}/>
              <span>{DEVICE_NAME[line.drone_model_key]}</span>
            </div>
            <div className={"col-span-2 space-x-2 whitespace-nowrap grid grid-cols-6 items-center"}>
              <Camera className={"col-span-2"} size={14}/>
              {line.payload_model_keys.map(payload => <span key={payload}>{DEVICE_NAME[payload]}</span>)}
            </div>
          </div>
          <div className={"text-[12px] text-[#d0d0d0]"}>
            更新于 {new Date(line.update_time).toLocaleString()}
          </div>
        </div>)}
    </>
  );
  const BindDeviceList = () => (<>
    {!bindingDevices || bindingDevices.list.length === 0 ? <div className={"content-center py-8 text-[#d0d0d0]"}>
      暂无设备
    </div> : bindingDevices.list.map(device =>
      <div key={device.device_sn}
           onClick={() => {
             form.setValue("dock_sn", device.device_sn);
             setSelectedDevice(device);
           }}
           style={{
             backgroundSize: "100% 100%"
           }}
           className={cn("bg-panel-item text-[14px] p-4 cursor-pointer space-y-1 mb-2", selectedDevice?.device_sn === device.device_sn && "bg-panel-item-active")}>
        <div className={"flex items-center space-x-2"}>
          <Package2 className={"text-white"} size={15}/>
          <span>{device.nickname}</span>
        </div>
        <div className={"flex items-center space-x-2"}>
          <Drone color={"white"} size={15}/>
          <span>{device.children?.nickname ?? "无设备"}</span>
        </div>
      </div>)}
  </>);

  // 在 TaskCreate 组件中添加时间验证函数
  const validateTimeRange = (startDate: Date, endDate: Date) => {
    return startDate.getTime() < endDate.getTime();
  };

  return (
    <div className={"w-full h-full flex text-[16px]"}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onerr)}
          className={cn("w-[340px] border-[1px] h-full border-[#43ABFF] bg-gradient-to-l from-[#32547E]/[.5] to-[#1F2D4B] border-l-0", selectPanelVisible ? "" : "rounded-tr-lg rounded-br-lg")}>
          <div
            className={"flex items-center space-x-4 border-b-[1px] border-b-[#265C9A] px-[12px] py-[14px] justify-between text-[14px]"}>
            <span>任务列表</span>
            <Minus onClick={() => navigate("/task-list")}/>
          </div>
          <div className={"px-[12px] py-[14px]"}>
            <div className={"pb-4 text-sm"}>
              创建任务：
            </div>
            <div className={"px-4 text-[14px] space-y-4 h-[calc(100vh-240px)] overflow-y-auto"}>
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem className={"space-y-4"}>
                    <FormLabel>任务名称：</FormLabel>
                    <FormControl>
                      <CommonInput {...field} placeholder={"请输入任务名称"}/>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
                name={"name"}
              />
              <div className={"flex justify-between"}>
                <span>飞行路线：</span>
                <span
                  className={"text-[#4BB5FF] cursor-pointer hover:text-[#6BC9FF] border-b-[1px] border-b-[#4BB5FF]"}
                  onClick={() => {
                    show();
                    setTitle("航线库");
                  }}>选择路线</span>
              </div>
              <FormField
                control={form.control}
                name="file_id"
                render={() => (
                  <FormItem>
                    {selectedWayline && <div className={"bg-panel-item bg-full-size text-[14px] p-4 cursor-pointer"}>
                      <div className={"grid grid-cols-6 space-x-8 relative"}>
                        <span className={"col-span-2"}>{selectedWayline.name}</span>
                        <span className={"space-x-4 text-[12px] text-[#d0d0d0] grid grid-cols-6 items-center"}>
                          <User className={"col-span-2"} size={16}/>
                          <span>{selectedWayline.user_name}</span>
                        </span>
                      </div>
                      <div className={"grid grid-cols-6 space-x-8 text-[12px] text-[#d0d0d0]"}>
                        <div className={"col-span-2 space-x-2 grid grid-cols-6 items-center"}>
                          <Rocket className={"col-span-1"} size={14}/>
                          <span>{DEVICE_NAME[selectedWayline.drone_model_key]}</span>
                        </div>
                        <div className={"col-span-2 space-x-2 whitespace-nowrap grid grid-cols-6 items-center"}>
                          <Camera className={"col-span-2"} size={14}/>
                          {selectedWayline.payload_model_keys.map(payload => <span
                            key={payload}>{DEVICE_NAME[payload]}</span>)}
                        </div>
                      </div>
                      <div className={"text-[12px] text-[#d0d0d0]"}>
                        更新于 {new Date(selectedWayline.update_time).toLocaleString()}
                      </div>
                    </div>}
                    {!selectedWayline && <FormMessage/>}
                  </FormItem>
                )}
              />
              <div className={"flex justify-between"}>
                <span>设备：</span>
                <span
                  className={"text-[#4BB5FF] cursor-pointer hover:text-[#6BC9FF] border-b-[1px] border-b-[#4BB5FF]"}
                  onClick={() => {
                    show();
                    setTitle("设备列表");
                  }}>选择设备</span>
              </div>
              <FormField
                control={form.control}
                name="dock_sn"
                render={() => (
                  <FormItem>
                    {selectedDevice && <div className={"bg-panel-item bg-full-size text-[14px] p-4 cursor-pointer"}>
                      <div>{selectedDevice.nickname}</div>
                      <div>{selectedDevice.children.nickname ?? "No Drone"}</div>
                    </div>}
                    {!selectedDevice && <FormMessage/>}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={"task_type"}
                render={({field}) => {
                  return <FormItem>
                    <FormLabel>任务策略：</FormLabel>
                    <FormControl>
                      <ToggleGroup defaultValue={field.value.toString()}
                                   onValueChange={(value) => {
                                     field.onChange(+value);
                                   }} type="single"
                                   className={"bg-[#0076B0]/[.4] flex"}>
                        {TaskTypeOptions.map(type =>
                          <FormItem className={"flex-1"}>
                            <FormControl>
                              <ToggleGroupItem
                                className={"w-full rounded-none text-white data-[state=on]:text-white data-[state=on]:col-span-1  data-[state=on]:bg-[#43ABFF] hover:bg-transparent"}
                                key={type.value}
                                value={type.value.toString()}>{type.label}</ToggleGroupItem>
                            </FormControl>
                          </FormItem>
                        )}
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>;
                }}
              />
              {(form.getValues("task_type") === TaskType.Timed || form.getValues("task_type") === TaskType.Condition) &&
                <FormField
                  control={form.control}
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>日期：</FormLabel>
                      <FormControl>
                        <div>
                          <NewCommonDateRangePicker date={field.value} setDate={field.onChange}/>
                        </div>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                  name={"select_execute_date"}
                />}
              {
                (form.getValues("task_type") === TaskType.Timed || form.getValues("task_type") === TaskType.Condition) &&
                <FormField
                  control={form.control}
                  name="select_time"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        <div className={"flex justify-between"}>
                          <span>时间：</span>
                          <span className={"flex"}>
                          <CirclePlus
                            onClick={handleAddTime}
                            className="ml-2 h-4 w-4 cursor-pointer"
                          />
                          <CircleMinus
                            onClick={handleRemoveTime}
                            className="ml-2 h-4 w-4 cursor-pointer"
                          />
                        </span>
                        </div>
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {form.watch("select_time").map((timeGroup, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <TimePickerDemo
                                date={timeGroup[0]}
                                setDate={(newDate) => {
                                  if (!newDate) return;

                                  const times = form.getValues("select_time");
                                  // 如果是连续任务且已有结束时间，验证时间范围
                                  if (form.watch("task_type") === TaskType.Condition && times[index][1]) {
                                    if (!validateTimeRange(newDate, times[index][1])) {
                                      toast({
                                        description: "开始时间必须早于结束时间",
                                        variant: "destructive"
                                      });
                                      // 不要直接返回，而是重置为原来的值
                                      newDate = times[index][0];
                                    }
                                  }
                                  times[index][0] = newDate;
                                  form.setValue("select_time", times);
                                }}
                              />
                              {form.watch("task_type") === TaskType.Condition && (
                                <>
                                  <span className="text-white">-</span>
                                  <TimePickerDemo
                                    date={timeGroup[1]}
                                    setDate={(newDate) => {
                                      if (!newDate) return;

                                      const times = form.getValues("select_time");
                                      times[index][1] = newDate; // 先设置新值

                                      // 如果时间范围无效，显示提示但不阻止设置
                                      if (!validateTimeRange(times[index][0], newDate)) {
                                        toast({
                                          description: "结束时间必须晚于开始时间",
                                          variant: "destructive"
                                        });
                                      }

                                      form.setValue("select_time", times);
                                    }}
                                  />
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
              }
              {form.getValues("task_type") === TaskType.Condition && <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem className={"space-y-4"}>
                    <FormLabel>当存储级别达到时启动任务（MB）:</FormLabel>
                    <FormControl>
                      <CommonInput {...field} placeholder={""}/>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
                name={"min_storage_capacity"}
              />
              }
              {form.getValues("task_type") === TaskType.Condition && <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem className={"space-y-4"}>
                    <FormLabel>任务开始执行的电量（%）：</FormLabel>
                    <FormControl>
                      <CommonInput {...field} placeholder={""}/>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
                name={"min_battery_capacity"}
              />}
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem className={"space-y-4"}>
                    <FormLabel>RTH相对高度（m）：</FormLabel>
                    <FormControl>
                      <CommonInput {...field} placeholder={"请输入返航高度"}/>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
                name={"rth_altitude"}
              />
              <FormField
                control={form.control}
                name={"out_of_control_action"}
                render={({field}) => {
                  return <FormItem>
                    <FormLabel>失控动作：</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        defaultValue={field.value.toString()}
                        onValueChange={(value) => {
                          field.onChange(+value);
                        }} type="single"
                        className={"bg-[#0076B0]/[.4] flex"}>
                        {OutOfControlActionOptions.map(action =>
                          <FormItem className={"flex-1"}>
                            <FormControl>
                              <ToggleGroupItem
                                className={"w-full rounded-none text-white data-[state=on]:text-white data-[state=on]:col-span-1  data-[state=on]:bg-[#43ABFF] hover:bg-transparent"}
                                key={action.value}
                                value={action.value.toString()}>{action.label}</ToggleGroupItem>
                            </FormControl>
                          </FormItem>
                        )}
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>;
                }}
              />
              <div className={"text-right"}>
                <CommonButton type={"submit"}>创建</CommonButton>
              </div>
            </div>
          </div>
        </form>
      </Form>
      {selectPanelVisible && <div className={"w-[266px] border-[1px] h-full border-[#43ABFF] bg-[#1E3357] " +
        "rounded-tr-lg rounded-br-lg border-l-0 relative text-sm"}>
        <X className={"absolute right-2 top-2 cursor-pointer"} onClick={hide}/>
        <div className={"border-b-[#265C9A] border-b-[1px] p-4"}>{title}</div>
        <div className={"p-4 space-y-2 h-[calc(100vh-180px)] overflow-y-auto"}>
          {title === "航线库" ? <WaylineList/> : <BindDeviceList/>}
        </div>
      </div>}
      <div
        className={cn("flex-1 border-[2px] rounded-lg border-[#43ABFF] relative ml-[20px] overflow-hidden")}>
        <Scene/>
      </div>
    </div>
  );
};

export default TaskCreate;

