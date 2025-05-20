import {
  Sheet, SheetClose,
  SheetContent, SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Device, useMaintainanceList} from "@/hooks/drone";
import {useSceneStore} from "@/store/useSceneStore.ts";
import dayjs from "dayjs";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import DatePicker from "@/components/public/DatePicker.tsx";
import {useAjax} from "@/lib/http.ts";
import {HTTP_PREFIX} from "@/api/manage.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {useMemo} from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: Device;
}

enum Maintainance {
  RoutineMaintenance = 1,
  DeepMaintenance
}

const MaintainanceType = {
  [Maintainance.RoutineMaintenance]: "常规保养",
  [Maintainance.DeepMaintenance]: "深度保养",
};

const formSchema = z.object({
  maintenance_type: z.coerce.number(z.nativeEnum(Maintainance)),
  maintenance_time: z.date({
    required_error: "请选择保养时间",
  }),
});

type MaintainanceFormValues = z.infer<typeof formSchema>;

const MaintainanceSheet = ({open, onOpenChange, device}: Props) => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {post} = useAjax();
  const deviceState = useSceneStore(state => state.deviceState);
  // console.log("deviceState");
  // console.log(deviceState);
  console.log("device");
  console.log(device);
  const deviceSn = device?.device_sn;
  const currentDock = deviceSn ? deviceState.dockInfo[deviceSn] : null;
  // console.log("currentDock");
  // console.log(currentDock);
  const dockAccDays = currentDock ? Math.floor(currentDock?.work_osd.acc_time / 3600 / 24) : 0;

  const defaultValues: MaintainanceFormValues = {
    maintenance_type: Maintainance.RoutineMaintenance,
    maintenance_time: new Date()
  };

  const form = useForm<MaintainanceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (values: MaintainanceFormValues) => {
    console.log("values");
    console.log(values);
    const maintenanceTime = dayjs(values.maintenance_time).valueOf();
    console.log("maintenanceTime");
    console.log(maintenanceTime);
    const flightCount = currentDock ? currentDock.work_osd.job_number : 0;
    const body = {
      device_sn: deviceSn,
      maintenance_type: values.maintenance_type,
      maintenance_time: maintenanceTime,
      flight_count: flightCount
    };
    try {
      const res: any = await post(`${HTTP_PREFIX}/devices/${workspaceId}/maintenance`, body);
      if (res.data.code === 0) {
        toast({
          description: "保养记录创建成功！"
        });
        await mutateDeviceMaintainanceList();
      }
    } catch (err) {

    }
  };

  const onSubmitChild = async (values: MaintainanceFormValues) => {
    console.log("values");
    console.log(values);
    const maintenanceTime = dayjs(values.maintenance_time).valueOf();
    console.log("maintenanceTime");
    console.log(maintenanceTime);
    const flightCount = currentDock ? currentDock.work_osd.job_number : 0;
    const body = {
      device_sn: device?.children?.device_sn,
      maintenance_type: values.maintenance_type,
      maintenance_time: maintenanceTime,
      flight_count: flightCount
    };
    try {
      const res: any = await post(`${HTTP_PREFIX}/devices/${workspaceId}/maintenance`, body);
      if (res.data.code === 0) {
        toast({
          description: "保养记录创建成功！"
        });
        await mutateChildDeviceMaintainanceList();
      }
    } catch (err) {

    }
  };

  // 机场保养记录
  const {data: deviceMaintainanceList, mutate: mutateDeviceMaintainanceList} = useMaintainanceList({
    device_sn: deviceSn || "",
    workspace_id: workspaceId,
    page: 1,
    page_size: 1000
  });

  // 机场最新一次保养记录
  const lastMaintainance = useMemo(() => {
    if (!deviceMaintainanceList || deviceMaintainanceList.list.length <= 0) return;
    return deviceMaintainanceList.list[0];
  }, [deviceMaintainanceList]);

  // 机场最新一次常规保养记录
  const lastDeviceRoutineMaintainance = useMemo(() => {
    if (!deviceMaintainanceList) return;
    return deviceMaintainanceList.list.find(item => item.maintenance_type === Maintainance.RoutineMaintenance);
  }, [deviceMaintainanceList]);

  // 机场最新一次深度保养记录
  const lastDeviceDeepMaintainance = useMemo(() => {
    if (!deviceMaintainanceList) return;
    return deviceMaintainanceList.list.find(item => item.maintenance_type === Maintainance.DeepMaintenance);
  }, [deviceMaintainanceList]);

  // 机场常规保养超期天数
  const deviceMaintainanceOverTime = useMemo(() => {
    const currentDate = dayjs();
    if (!lastDeviceRoutineMaintainance) {
      if (currentDock) {
        const activation_time = dayjs.unix(currentDock.work_osd.activation_time);
        return currentDate.diff(activation_time, "day");
      } else {
        return "--";
      }
    }
    const lastDate = dayjs(lastDeviceRoutineMaintainance.maintenance_time);
    return currentDate.diff(lastDate, "day");
  }, [lastDeviceRoutineMaintainance, currentDock]);

  // 机场深度保养超期天数
  const deviceDeepMaintainanceOverTime = useMemo(() => {
    const currentDate = dayjs();
    if (!lastDeviceDeepMaintainance) {
      if (currentDock) {
        const activation_time = dayjs.unix(currentDock.work_osd.activation_time);
        return currentDate.diff(activation_time, "day");
      } else {
        return "--";
      }
    }
    const lastDate = dayjs(lastDeviceDeepMaintainance.maintenance_time);
    return currentDate.diff(lastDate, "day");
  }, [lastDeviceDeepMaintainance, currentDock]);

  // 飞行器保养记录
  const {data: deviceChildrenMaintainanceList, mutate: mutateChildDeviceMaintainanceList} = useMaintainanceList({
    device_sn: device?.children?.device_sn || "",
    workspace_id: workspaceId,
    page: 1,
    page_size: 1000
  });

  // 飞行器最新一次保养记录
  const lastDroneMaintainance = useMemo(() => {
    if (!deviceChildrenMaintainanceList || deviceChildrenMaintainanceList.list.length <= 0) return;
    return deviceChildrenMaintainanceList.list[0];
  }, [deviceChildrenMaintainanceList]);


  /*const lastDeviceDeepMaintainance = useMemo(() => {
    if (!deviceChildrenMaintainanceList) return null;
    return deviceChildrenMaintainanceList.list.find(item => item.maintenance_type === Maintainance.DeepMaintenance);
  }, [deviceChildrenMaintainanceList]);

  // 深度保养超期天数
  const deviceMaintainanceDeepOverTime = useMemo(() => {
    if (!lastDeviceDeepMaintainance) return 0;
    const currentDate = dayjs();
    const lastDate = dayjs(lastDeviceDeepMaintainance.maintenance_time);
    return currentDate.diff(lastDate, "day");
  }, [lastDeviceDeepMaintainance]);*/

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[#072E62] border-l border-[#43ABFF] text-white sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="text-lg font-medium text-white">保养服务</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="bg-[#0A4088]/70 rounded-md p-4 border border-[#43ABFF]/30">
            <div className="flex justify-between mb-4">
              <div className="text-[#D0D0D0]">机场数据</div>
              <div className="text-[#D0D0D0]">sn: {deviceSn}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center text-[#D0D0D0]">
                <span className="text-lg font-medium">{dockAccDays}天</span>
                <span className="text-sm">累计运行时长</span>
              </div>
              <div className="flex flex-col items-center justify-center text-[#D0D0D0]">
                <span className="text-lg font-medium">{currentDock ? currentDock.work_osd.job_number : 0}架次</span>
                <span className="text-sm">作业架次</span>
              </div>
              <div className="flex flex-col items-center justify-center text-[#D0D0D0]">
                <span className="text-lg font-medium">
                  {currentDock ? dayjs.unix(currentDock.work_osd.activation_time).format("YYYY-MM-DD") : "--"}
                </span>
                <span className="text-sm">激活时间</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-4">
                <h3 className="text-[#D0D0D0] text-lg">保养项目</h3>
                <Dialog>
                  <DialogTrigger>
                    <Button variant="link" className="text-[#43ABFF] hover:text-[#43ABFF]/80">添加记录</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#072E62] border border-[#43ABFF] text-white">
                    <DialogTitle>添加记录</DialogTitle>
                    <Form {...form}>
                      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                          control={form.control}
                          render={({field}) =>
                            <FormItem className="grid grid-cols-4 items-center gap-x-4 space-y-0">
                              <FormLabel className="text-right">
                                保养类型
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger className={"col-span-3 bg-[#072E62]"}>
                                    <SelectValue placeholder="选择保养类型"/>
                                    <FormMessage/>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={Maintainance.RoutineMaintenance.toString()}>常规保养</SelectItem>
                                  <SelectItem value={Maintainance.DeepMaintenance.toString()}>深度保养</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>}
                          name={"maintenance_type"}
                        />
                        <FormField
                          control={form.control}
                          name="maintenance_time"
                          render={({field}) => (
                            <FormItem className="grid grid-cols-4 items-center gap-x-4 space-y-0">
                              <FormLabel className="text-right">保养时间</FormLabel>
                              <div className={"col-span-3"}>
                                <DatePicker className={"text-white hover:text-white justify-center"}
                                            date={field.value}
                                            setDate={field.onChange}/>
                              </div>
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <DialogClose>
                            <Button type={"submit"}>确认</Button>
                          </DialogClose>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                {/*<Button className={"text-blue-500"} variant={"link"}>保养记录</Button>*/}
              </div>
              <SheetDescription className="text-gray-400 my-4">
                为了保障机场的使用安全，请根据保养规则定期进行机场保养服务。
              </SheetDescription>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-[#D0D0D0] font-medium">上次保养</h3>
                  <div className="flex justify-between text-[#D0D0D0]">
                    <span>保养项目 </span>
                    <span>{lastMaintainance ? MaintainanceType[lastMaintainance.maintenance_type as Maintainance] : "--"}</span>
                  </div>
                  <div className="flex justify-between text-[#D0D0D0]">
                    <span>保养时间 </span>
                    <span>{lastMaintainance ? dayjs(lastMaintainance.maintenance_time).format("YYYY-MM-DD") : "--"}</span>
                  </div>
                </div>
                {/*<div>
                  <h3>距离下次保养</h3>
                  <div>
                    <span>常规保养</span>
                    <span>{deviceMaintainanceOverTime <= 180 ? deviceMaintainanceOverTime + "天" : `已超期 ${deviceMaintainanceOverTime - 180}天`}</span>
                  </div>
                  <div>
                    <span>深度保养</span>
                    <span>{deviceMaintainanceOverTime <= 365 ? deviceMaintainanceOverTime + "天" : `已超期 ${deviceMaintainanceOverTime - 365}天`}</span>
                  </div>
                </div>*/}
              </div>
            </div>
          </div>

          {/* 飞行器数据部分 */}
          <div className="bg-[#0A4088]/70 rounded-md p-4 border border-[#43ABFF]/30">
            <div className="flex justify-between mb-4">
              <div className="text-[#D0D0D0]">飞行器数据</div>
              <div className="text-[#D0D0D0]">sn: {device?.children?.device_sn}</div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col items-center justify-center text-[#D0D0D0]">
                <span className="text-lg font-medium">--</span>
                <span className="text-sm">飞行时长</span>
              </div>
              <div className="flex flex-col items-center justify-center text-[#D0D0D0]">
                <span className="text-lg font-medium">--</span>
                <span className="text-sm">飞行架次</span>
              </div>
              <div className="flex flex-col items-center justify-center text-[#D0D0D0]">
                <span className="text-lg font-medium">--</span>
                <span className="text-sm">飞行里程</span>
              </div>
              <div className="flex flex-col items-center justify-center text-[#D0D0D0]">
                <span className="text-lg font-medium">--</span>
                <span className="text-sm">激活时间</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-4">
                <h3 className="text-[#D0D0D0] text-lg">保养项目</h3>
                <Dialog>
                  <DialogTrigger>
                    <Button variant="link" className="text-[#43ABFF] hover:text-[#43ABFF]/80">添加记录</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#072E62] border border-[#43ABFF] text-white">
                    <DialogTitle>添加记录</DialogTitle>
                    <Form {...form}>
                      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmitChild)}>
                        <FormField
                          control={form.control}
                          render={({field}) =>
                            <FormItem className="grid grid-cols-4 items-center gap-x-4 space-y-0">
                              <FormLabel className="text-right">
                                保养类型
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger className={"col-span-3 bg-[#072E62]"}>
                                    <SelectValue placeholder="选择保养类型"/>
                                    <FormMessage/>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={Maintainance.RoutineMaintenance.toString()}>常规保养</SelectItem>
                                  <SelectItem value={Maintainance.DeepMaintenance.toString()}>深度保养</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>}
                          name={"maintenance_type"}
                        />
                        <FormField
                          control={form.control}
                          name="maintenance_time"
                          render={({field}) => (
                            <FormItem className="grid grid-cols-4 items-center gap-x-4 space-y-0">
                              <FormLabel className="text-right">保养时间</FormLabel>
                              <div className={"col-span-3"}>
                                <DatePicker className={"text-white hover:text-white justify-center"}
                                            date={field.value}
                                            setDate={field.onChange}/>
                              </div>
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <DialogClose>
                            <Button type={"submit"}>确认</Button>
                          </DialogClose>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                {/*<Button className={"text-blue-500"} variant={"link"}>保养记录</Button>*/}
              </div>
              <SheetDescription className="text-gray-400 my-4">
                为了保障无人机的飞行安全，请根据保养规则定期将无人机寄回DJI 大疆进行保养服务。未到保养建议时间时，您可以根据当前无人机状态对无人机进行基础保养。
              </SheetDescription>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-[#D0D0D0] font-medium">上次保养</h3>
                  <div className="flex justify-between text-[#D0D0D0]">
                    <span>保养项目 </span>
                    <span>{lastDroneMaintainance ? MaintainanceType[lastDroneMaintainance.maintenance_type as Maintainance] : "--"}</span>
                  </div>
                  <div className="flex justify-between text-[#D0D0D0]">
                    <span>保养时间 </span>
                    <span>{lastDroneMaintainance ? dayjs(lastDroneMaintainance.maintenance_time).format("YYYY-MM-DD") : "--"}</span>
                  </div>
                </div>
                {/*<div>
                  <h3>距离下次保养</h3>
                  <div>
                    <span>常规保养</span>
                    <span>{deviceMaintainanceDeepOverTime <= 180 ? deviceMaintainanceDeepOverTime + "天" : `已超期 ${deviceMaintainanceDeepOverTime - 180}天`}</span>
                  </div>
                  <div>
                    <span>深度保养</span>
                    <span>{deviceMaintainanceDeepOverTime <= 365 ? deviceMaintainanceDeepOverTime + "天" : `已超期 ${deviceMaintainanceDeepOverTime - 365}天`}</span>
                  </div>
                </div>*/}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MaintainanceSheet;

