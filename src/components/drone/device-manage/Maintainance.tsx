import {
  Sheet, SheetClose,
  SheetContent, SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Device} from "@/hooks/drone";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import dayjs from "dayjs";
import {Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import DatePicker from "@/components/public/DatePicker.tsx";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: Device;
}

enum Maintainance {
  RoutineMaintenance = 1,
  DeepMaintenance
}

const formSchema = z.object({
  maintenance_type: z.coerce.number(z.nativeEnum(Maintainance)),
  maintenance_time: z.date({
    required_error: "请选择保养时间",
  }),
});

type MaintainanceFormValues = z.infer<typeof formSchema>;

const MaintainanceSheet = ({open, onOpenChange, device}: Props) => {
  useInitialConnectWebSocket();
  const deviceState = useSceneStore(state => state.deviceState);
  // console.log("deviceState");
  // console.log(deviceState);
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
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={"sm:max-w-[500px]"}>
        <SheetHeader>
          <SheetTitle>保养服务</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4 border-2 px-2">
          <div className={"flex justify-between"}>
            <div>机场数据</div>
            <div>sn: {device?.device_sn}</div>
          </div>
          <div className={"grid grid-cols-3"}>
            <div className={"flex flex-col items-center justify-center"}>
              <span>{dockAccDays}天</span>
              <span>累计运行时长</span>
            </div>
            <div className={"flex flex-col items-center justify-center"}>
              <span>{currentDock ? currentDock.work_osd.job_number : 0}架次</span>
              <span>作业架次</span>
            </div>
            <div className={"flex flex-col items-center justify-center"}>
              <span>{currentDock ? dayjs.unix(currentDock.work_osd.activation_time).format("YYYY-MM-DD") : ""}</span>
              <span>激活时间</span>
            </div>
          </div>
          <div>
            <div className={"flex items-center"}>
              <h3>保养项目</h3>
              <Dialog>
                <DialogTrigger>
                  <Button className={"text-blue-500"} variant={"link"}>添加记录</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>添加记录</DialogTitle>
                  <Form {...form}>
                    <form className={"space-y-4"} onSubmit={form.handleSubmit(onSubmit)}>
                      <FormField
                        control={form.control}
                        render={({field}) =>
                          <FormItem className="grid grid-cols-4 items-center gap-x-4 space-y-0">
                            <FormLabel className="text-right">
                              保养类型
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value.toString()}>
                              <FormControl>
                                <SelectTrigger className={"col-span-3"}>
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
                              <DatePicker className={"text-black hover:text-black justify-center"}
                                          date={field.value}
                                          setDate={field.onChange}/>
                            </div>
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type={"submit"}>确认</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Button className={"text-blue-500"} variant={"link"}>保养记录</Button>
            </div>
            <SheetDescription>为了保障机场的使用安全，请根据保养规则定期进行机场保养服务。</SheetDescription>
            <div className={"grid grid-cols-2"}>
              <div>
                <h3>上次保养</h3>
                <div>
                  <span>保养项目</span>
                  <span>--</span>
                </div>
                <div>
                  <span>保养时间</span>
                  <span>--</span>
                </div>
                <div>
                  <span>保养项目</span>
                  <span>--</span>
                </div>
              </div>
              <div>
                <h3>距离下次保养</h3>
                <div>
                  <span>常规保养</span>
                  <span>已超期 330天</span>
                </div>
                <div>
                  <span>深度保养</span>
                  <span>2570天/875637265架次</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 py-4 border-2 px-2">
          <div className={"flex justify-between"}>
            <div>飞行器数据</div>
            <div>sn: {currentDock?.basic_osd.sub_device?.device_sn}</div>
          </div>
          <div className={"grid grid-cols-4 whitespace-nowrap"}>
            <div className={"flex flex-col items-center justify-center"}>
              <span>55h 0min</span>
              <span>飞行时长</span>
            </div>
            <div className={"flex flex-col items-center justify-center"}>
              <span>367架次</span>
              <span>飞行架次</span>
            </div>
            <div className={"flex flex-col items-center justify-center"}>
              <span>739.7 km</span>
              <span>飞行里程</span>
            </div>
            <div className={"flex flex-col items-center justify-center"}>
              <span>2023-12-12</span>
              <span>激活时间</span>
            </div>
            <div className={"flex flex-col  justify-center col-span-2 text-sm"}>
              <span>左电池</span>
              <span>循环 125次 高电量存储193天</span>
            </div>
            <div className={"flex flex-col justify-center col-span-2 text-sm"}>
              <span>右电池</span>
              <span>循环 125次 高电量存储193天</span>
            </div>
          </div>
          <div>
            <div className={"flex items-center"}>
              <h3>保养项目</h3>
              <Button>保养记录</Button>
              <Button>添加记录</Button>
            </div>
            <SheetDescription>为了保障机场的使用安全，请根据保养规则定期进行机场保养服务。</SheetDescription>
            <div className={"grid grid-cols-2"}>
              <div>
                <h3>上次保养</h3>
                <div>
                  <span>保养项目</span>
                  <span>--</span>
                </div>
                <div>
                  <span>保养时间</span>
                  <span>--</span>
                </div>
                <div>
                  <span>保养项目</span>
                  <span>--</span>
                </div>
              </div>
              <div>
                <h3>距离下次保养</h3>
                <div>
                  <span>常规保养</span>
                  <span>已超期 330天</span>
                </div>
                <div>
                  <span>深度保养</span>
                  <span>2570天/875637265架次</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">保存</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MaintainanceSheet;

