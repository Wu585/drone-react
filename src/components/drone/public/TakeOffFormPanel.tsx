import {z} from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {X} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  CommanderFlightModeInCommandFlightOptions,
  CommanderModeLostActionInCommandFlightOptions, ECommanderFlightMode,
  ECommanderModeLostAction,
  ERthMode,
  LostControlActionInCommandFLight,
  LostControlActionInCommandFLightOptions, RthModeInCommandFlightOptions,
  WaylineLostControlActionInCommandFlight, WaylineLostControlActionInCommandFlightOptions
} from "@/types/drone.ts";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {FC, useEffect} from "react";
import {toast} from "@/components/ui/use-toast.ts";
import {useAjax} from "@/lib/http.ts";
import {pickPosition} from "@/components/toolbar/tools";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";
import {clearPickPosition} from "@/components/toolbar/tools/pickPosition.ts";
import dayjs from "dayjs";

export const formSchema = z.object({
  target_latitude: z.coerce.number({
    required_error: "Latitude is required",
    invalid_type_error: "Latitude must be a number",
  })
    .finite()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  target_longitude: z.coerce.number({
    required_error: "Longitude is required",
    invalid_type_error: "Longitude must be a number",
  })
    .finite()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  target_height: z.coerce.number(),
  security_takeoff_height: z.string().min(1, {
    message: ""
  }),
  rth_altitude: z.string().min(1, {
    message: ""
  }),
  commander_flight_height: z.string().min(1, {
    message: ""
  }),
  rc_lost_action: z.nativeEnum(LostControlActionInCommandFLight),
  exit_wayline_when_rc_lost: z.nativeEnum(WaylineLostControlActionInCommandFlight),
  rth_mode: z.nativeEnum(ERthMode),
  commander_mode_lost_action: z.nativeEnum(ECommanderModeLostAction),
  commander_flight_mode: z.nativeEnum(ECommanderFlightMode),
});

interface Props {
  sn: string;
  onClose?: () => void;
  type: "take-off" | "fly-to";
}

// DRC 链路
const DRC_API_PREFIX = "/control/api/v1";

const TakeOffFormPanel: FC<Props> = ({sn, onClose, type}) => {
  const {post} = useAjax();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target_latitude: undefined,
      target_longitude: undefined,
      target_height: 120,
      security_takeoff_height: "120",
      rth_altitude: "120",
      commander_flight_height: "120",
      rc_lost_action: LostControlActionInCommandFLight.RETURN_HOME,
      exit_wayline_when_rc_lost: WaylineLostControlActionInCommandFlight.EXEC_LOST_ACTION,
      rth_mode: ERthMode.SETTING,
      commander_mode_lost_action: ECommanderModeLostAction.EXEC_LOST_ACTION,
      commander_flight_mode: ECommanderFlightMode.SETTING,
    },
  });

  const realtimeDeviceInfo = useRealTimeDeviceInfo();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!sn) return;
    if (type === "take-off") {
      const body = {
        ...values,
        target_latitude: values.target_latitude,
        target_longitude: values.target_longitude,
        target_height: values.target_height,
        security_takeoff_height: parseFloat(values.security_takeoff_height),
        rth_altitude: parseFloat(values.rth_altitude),
        commanderFlightHeight: parseFloat(values.commander_flight_height),
        rc_lost_action: +values.rc_lost_action,
        exit_wayline_when_rc_lost: +values.exit_wayline_when_rc_lost,
        rth_mode: +values.rth_mode,
        commander_mode_lost_action: +values.commander_mode_lost_action,
        commander_flight_mode: +values.commander_flight_mode,
        max_speed: 12,
      };
      console.log("body");
      console.log(body);
      const resp: any = await post(`${DRC_API_PREFIX}/devices/${sn}/jobs/takeoff-to-point`, body);
      if (resp.data.code === 0) {
        toast({
          description: <span>起飞成功</span>
        });
        // localStorage.setItem("startTime", dayjs().format("yyyy-MM-dd HH:mm:ss"));
        getCustomSource("drone-wayline")?.entities.removeAll();
        const longitude = realtimeDeviceInfo.dock?.basic_osd?.longitude;
        const latitude = realtimeDeviceInfo.dock?.basic_osd?.latitude;
        const height = form.getValues("target_height");
        if (realtimeDeviceInfo.dock && longitude && latitude) {
          getCustomSource("drone-wayline")?.entities.add({
            polyline: {
              // positions: Cesium.Cartesian3.fromDegreesArrayHeights([longitude, latitude, realtimeDeviceInfo.device.height, values.target_longitude, values.target_latitude, realtimeDeviceInfo.device.height]),
              positions: Cesium.Cartesian3.fromDegreesArrayHeights([longitude, latitude, height, values.target_longitude, values.target_latitude, height]),
              width: 3,  // 设置折线的宽度
              material: Cesium.Color.BLUE,  // 折线的颜色
            }
          });
        }
      }
      onClose?.();
    } else {
      await post(`${DRC_API_PREFIX}/devices/${sn}/jobs/fly-to-point`, {
        max_speed: 14,
        points: [
          {
            latitude: values.target_latitude,
            longitude: values.target_longitude,
            height: values.target_height
          }
        ]
      });
      toast({
        description: "飞行成功！"
      });
      getCustomSource("drone-wayline")?.entities.removeAll();
      const longitude = realtimeDeviceInfo.device?.longitude;
      const latitude = realtimeDeviceInfo.device?.latitude;
      if (realtimeDeviceInfo.device && longitude && latitude) {
        getCustomSource("drone-wayline")?.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([longitude, latitude, realtimeDeviceInfo.device.height, values.target_longitude, values.target_latitude, realtimeDeviceInfo.device.height]),
            width: 3,  // 设置折线的宽度
            material: Cesium.Color.BLUE,  // 折线的颜色
          }
        });
      }
      onClose?.();
    }
  };

  const onPickPosition = () => {
    pickPosition(({longitude, latitude}) => {
      form.setValue("target_longitude", longitude);
      form.setValue("target_latitude", latitude);
      viewer.entities.removeById("fly-point");
      // 添加蓝色圆形entity
      viewer.entities.add({
        id: "fly-point",
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
        point: {
          pixelSize: 10,                   // 点的大小（像素）
          color: Cesium.Color.BLUE,        // 蓝色
          outlineColor: Cesium.Color.WHITE, // 白色边框
          outlineWidth: 2,                // 边框宽度
        }
      });
    });
  };

  useEffect(() => {
    return () => {
      // viewer.entities.removeById("fly-point");
      clearPickPosition();
    };
  }, []);

  return (
    <>
      <Form {...form}>
        <form className={"w-[393px] bg-full-size"} onSubmit={form.handleSubmit(onSubmit)}>
          <div className={"bg-[#001E37]/[.85]"}>
            <div
              className={"w-[393px] h-[44px] bg-take-off-panel-header bg-full-size flex items-center justify-between px-2"}>
              <h1 className={"pl-6"}>飞行前检查</h1>
              <X onClick={() => onClose?.()} className={"cursor-pointer"}/>
            </div>
            <div className={"text-[14px] py-4"}>
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem className={"grid grid-cols-6 px-4"}>
                    <FormLabel className={"col-span-3 flex items-center"}>目标经度</FormLabel>
                    <FormControl className={"col-span-3"}>
                      <Input type={"number"} className={"bg-[#072E62]/[.7]"} {...field}
                             placeholder={"填入目标经度信息"}/>
                    </FormControl>
                  </FormItem>
                )}
                name={"target_longitude"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem className={"grid grid-cols-6 px-4"}>
                    <FormLabel className={"col-span-3 flex items-center"}>目标纬度</FormLabel>
                    <FormControl className={"col-span-3"}>
                      <Input type={"number"} className={"bg-[#072E62]/[.7]"} {...field}
                             placeholder={"填入目标纬度信息"}/>
                    </FormControl>
                  </FormItem>
                )}
                name={"target_latitude"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem className={"grid grid-cols-6 px-4"}>
                    <FormLabel className={"col-span-3 flex items-center"}>目标高度</FormLabel>
                    <FormControl className={"col-span-3"}>
                      <Input type={"number"} className={"bg-[#072E62]/[.7]"} {...field}/>
                    </FormControl>
                  </FormItem>
                )}
                name={"target_height"}
              />
              {type === "take-off" && <>
                <FormField
                  control={form.control}
                  render={({field}) => (
                    <FormItem className={"grid grid-cols-6 px-4"}>
                      <FormLabel className={"col-span-3 flex items-center"}>安全起飞高度</FormLabel>
                      <FormControl className={"col-span-3"}>
                        <Input type={"number"} className={"bg-[#072E62]/[.7]"} {...field}/>
                      </FormControl>
                    </FormItem>
                  )}
                  name={"security_takeoff_height"}
                />
                <FormField
                  control={form.control}
                  render={({field}) => (
                    <FormItem className={"grid grid-cols-6 px-4"}>
                      <FormLabel className={"col-span-3 flex items-center"}>返航高度</FormLabel>
                      <FormControl className={"col-span-3"}>
                        <Input type={"number"} className={"bg-[#072E62]/[.7]"} {...field}/>
                      </FormControl>
                    </FormItem>
                  )}
                  name={"rth_altitude"}
                />
                {/*<FormField
                  control={form.control}
                  name={"rc_lost_action"}
                  render={({field}) => (
                    <FormItem className={"grid grid-cols-6 px-4 items-center"}>
                      <FormLabel className={"col-span-3"}>失联动作</FormLabel>
                      <Select value={field.value.toString()} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="col-span-3 bg-[#0C66BF]/[.85] rounded-none border-none">
                            <SelectValue placeholder=""/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={""}>
                          <SelectGroup>
                            {LostControlActionInCommandFLightOptions.map(item =>
                              <SelectItem value={item.value.toString()} key={item.value}>{item.label}</SelectItem>)}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>)}
                />*/}
                {/*<FormField
                  control={form.control}
                  name={"exit_wayline_when_rc_lost"}
                  render={({field}) => (
                    <FormItem className={"grid grid-cols-6 px-4 items-center"}>
                      <FormLabel className={"col-span-3"}>失控动作</FormLabel>
                      <Select value={field.value.toString()} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="col-span-3 bg-[#0C66BF]/[.85] rounded-none border-none">
                            <SelectValue placeholder=""/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={""}>
                          <SelectGroup>
                            {WaylineLostControlActionInCommandFlightOptions.map(item =>
                              <SelectItem value={item.value.toString()} key={item.value}>{item.label}</SelectItem>)}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>)}
                />*/}
                {/*<FormField
                  control={form.control}
                  name={"rth_mode"}
                  render={({field}) => (
                    <FormItem className={"grid grid-cols-6 px-4 items-center"}>
                      <FormLabel className={"col-span-3"}>返航模式</FormLabel>
                      <Select value={field.value.toString()} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="col-span-3 bg-[#0C66BF]/[.85] rounded-none border-none">
                            <SelectValue placeholder=""/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={""}>
                          <SelectGroup>
                            {RthModeInCommandFlightOptions.map(item =>
                              <SelectItem value={item.value.toString()} key={item.value}>{item.label}</SelectItem>)}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>)}
                />
                <FormField
                  control={form.control}
                  name={"commander_mode_lost_action"}
                  render={({field}) => (
                    <FormItem className={"grid grid-cols-6 px-4 items-center"}>
                      <FormLabel className={"col-span-3"}>指令失联动作</FormLabel>
                      <Select value={field.value.toString()} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="col-span-3 bg-[#0C66BF]/[.85] rounded-none border-none">
                            <SelectValue placeholder=""/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={""}>
                          <SelectGroup>
                            {CommanderModeLostActionInCommandFlightOptions.map(item =>
                              <SelectItem value={item.value.toString()} key={item.value}>{item.label}</SelectItem>)}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>)}
                />
                <FormField
                  control={form.control}
                  name={"commander_flight_mode"}
                  render={({field}) => (
                    <FormItem className={"grid grid-cols-6 px-4 items-center"}>
                      <FormLabel className={"col-span-3"}>指令飞行模式</FormLabel>
                      <Select value={field.value.toString()} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="col-span-3 bg-[#0C66BF]/[.85] rounded-none border-none">
                            <SelectValue placeholder=""/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={""}>
                          <SelectGroup>
                            {CommanderFlightModeInCommandFlightOptions.map(item =>
                              <SelectItem value={item.value.toString()} key={item.value}>{item.label}</SelectItem>)}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>)}
                />
                <FormField
                  control={form.control}
                  render={({field}) => (
                    <FormItem className={"grid grid-cols-6 px-4"}>
                      <FormLabel className={"col-span-3 flex items-center"}>指令飞行高度</FormLabel>
                      <FormControl className={"col-span-3"}>
                        <Input type={"number"} className={"bg-[#072E62]/[.7]"} {...field}/>
                      </FormControl>
                    </FormItem>
                  )}
                  name={"commander_flight_height"}
                />*/}
              </>}
              <div className={"flex justify-between mt-2 pl-2 pr-4"}>
                <Button className={"bg-[#43ABFF] hover:bg-[#43ABFF]"} type={"button"}
                        onClick={onPickPosition}>坐标拾取</Button>
                <Button className={"bg-[#43ABFF] hover:bg-[#43ABFF]"} type={"submit"}>立即执行</Button>
              </div>
            </div>
          </div>
          {/*<Button type={"submit"} style={{
          background: "rgba(11,59,125,0.7)",
          boxShadow: "inset 8px -5px 19px 0px #1283FF, inset 15px 5px 25px 0px #2BA1D7, inset 3px -5px 19px 0px #12B0FF",
          borderRadius: "2px",
          borderImage: "linear-gradient(270deg, rgba(103, 187, 246, 1), rgba(97, 190, 245, 1), rgba(108, 233, 254, 1)) 1 1"
        }} className={"border w-full mt-[30px]"}>登录</Button>*/}
        </form>
      </Form>
    </>
  );
};

export default TakeOffFormPanel;

