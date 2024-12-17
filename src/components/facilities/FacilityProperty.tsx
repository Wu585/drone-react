import closePng from "@/assets/images/panel-close.png";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {FacilityInfo, patchFacility, saveFacility, useAllFacilities} from "@/hooks/facilities/api.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Switch} from "@/components/ui/switch.tsx";

const selfFacilityList_ = ["宝宝屋", "共享打印机", "党群阵地", "卫生服务", "敬老院", "公园", "文化活动中心",
  "老年活动室", "会议室", "图书馆", "生活驿站", "社区食堂", "老年认知支持中心", "日间照料中心", "长者运动之家"];

console.log(selfFacilityList_);

export const selfFacilityList = [
  {
    type: "partyPosition",
    name: "党群阵地",
    image: "zdy-dqzd"
  },
  {
    type: "healthServices",
    name: "卫生服务",
    image: "zdy-wsfw"
  },
  {
    type: "nursingHome",
    name: "敬老院",
    image: "zdy-jly"
  },
  {
    type: "park",
    name: "公园",
    image: "zdy-gy"
  },
  {
    type: "culturalActivityCenter",
    name: "文化活动中心",
    image: "zdy-whhdzx"
  },
  {
    type: "elderlyActivityRoom",
    name: "老年活动室",
    image: "zdy-lnhds"
  },
  {
    type: "meetingRoom",
    name: "会议室",
    image: "zdy-hys"
  },
  {
    type: "library",
    name: "图书馆",
    image: "zdy-tsg"
  },
  {
    type: "lifeStation",
    name: "生活驿站",
    image: "zdy-shyz"
  },
  {
    type: "communityCafeteria",
    name: "社区食堂",
    image: "zdy-sqst"
  },
  {
    type: "dayCareCenters",
    name: "日间照料中心",
    image: "zdy-rjzlzx"
  },
  {
    type: "elderlySportsHome",
    name: "长者运动之家",
    image: "zdy-zzydzj"
  },
];

const formSchema = z.object({
  facilitiesType: z.string({
    required_error: "请选择设施类型",
  }).min(1),
  name: z.string().min(1, {
    message: "请输入设施名称"
  }),
  address: z.string().min(1, {
    message: "请输入设施地址"
  }),
  reservationNums: z.string().min(1, {
    message: "请输入预约人数"
  }),
  serviceScope: z.string().min(1, {
    message: "请输入服务范围"
  }),
  enable: z.union([z.boolean(), z.string()]).default(false).optional(),
});

const FacilityProperty = ({onClose, location, facilityParams, onDelete, onChangeLocation}: {
  onClose?: () => void,
  location: { longitude: string, latitude: string },
  facilityParams?: Partial<FacilityInfo>,
  onDelete: () => void
  onChangeLocation: () => void
}) => {
  const {mutate} = useAllFacilities();
  const {toast} = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: facilityParams || {
      facilitiesType: "",
      name: "",
      address: "",
      reservationNums: "",
      serviceScope: "",
      enable: true
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("submit");
    console.log(values);
    if (!facilityParams) return;
    if (facilityParams.status === "add") {
      await saveFacility({
        longitude: location.longitude,
        latitude: location.latitude,
        facilitiesType: values.facilitiesType,
        reservationNums: values.reservationNums,
        address: values.address,
        enable: values.enable?.toString(),
        serviceScope: values.serviceScope,
        [values.facilitiesType!]: values.name,
      });
      toast({
        description: "添加设施成功"
      });
      await mutate();
      onClosePanel();
    } else if (facilityParams.status === "change") {
      await patchFacility(facilityParams.id!, {
        longitude: location.longitude,
        latitude: location.latitude,
      });
      toast({
        description: "更改位置成功"
      });
      await mutate();
      onClosePanel();
    } else if (facilityParams.status === "edit") {
      await patchFacility(facilityParams.id!, {
        ...values,
        enable: values.enable?.toString(),
        [values.facilitiesType!]: values.name,
      });
      toast({
        description: "编辑信息成功"
      });
      await mutate();
      onClosePanel();
    }
  };

  const onClosePanel = () => {
    onClose?.();
  };

  return (
    <div className={"bg-add-facility-property w-full h-full"}>
      <img onClick={onClosePanel} className={"absolute right-[24px] top-[48px] cursor-pointer"} src={closePng} alt=""/>
      <div className={"absolute left-[48px] top-[24px] text-[20px] font-semibold"}>添加设施</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className={"absolute left-[48px] top-[100px] flex flex-col space-y-6"}>
            <FormField
              control={form.control}
              name={"facilitiesType"}
              render={({field}) => (
                <FormItem className={"flex justify-center items-center space-x-4 whitespace-nowrap"}>
                  <FormLabel>设施类型：</FormLabel>
                  <Select disabled={facilityParams?.status === "change"} defaultValue={field.value}
                          onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-[180px] h-full bg-transparent">
                        <SelectValue placeholder="选择设施类型"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {selfFacilityList.map(({type, name}) =>
                          <SelectItem value={type} key={type}>{name}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>)}
            />
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem className={"flex justify-center items-center space-x-4 whitespace-nowrap"}>
                  <FormLabel>设施名称：</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={facilityParams?.status === "change"} placeholder={"输入设施名称"}
                           className={"bg-transparent text-white"}/>
                  </FormControl>
                </FormItem>
              )}
              name={"name"}
            />
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem className={"flex justify-center items-center space-x-4 whitespace-nowrap"}>
                  <FormLabel>设施地址：</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={facilityParams?.status === "change"} placeholder={"输入设施地址"}
                           className={"bg-transparent text-white"}/>
                  </FormControl>
                </FormItem>
              )}
              name={"address"}
            />
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem className={"flex justify-center items-center space-x-4 whitespace-nowrap"}>
                  <FormLabel>预约人数：</FormLabel>
                  <FormControl>
                    <Input type={"number"} {...field} disabled={facilityParams?.status === "change"}
                           placeholder={"输入预约人数"}
                           className={"bg-transparent text-white"}/>
                  </FormControl>
                </FormItem>
              )}
              name={"reservationNums"}
            />
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem className={"flex justify-center items-center space-x-4 whitespace-nowrap"}>
                  <FormLabel>服务范围：</FormLabel>
                  <FormControl>
                    <Input type={"number"} {...field} disabled={facilityParams?.status === "change"}
                           placeholder={"输入服务范围"}
                           className={"bg-transparent text-white"}/>
                  </FormControl>
                </FormItem>
              )}
              name={"serviceScope"}
            />
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem className={"flex items-center space-x-4 whitespace-nowrap"}>
                  <FormLabel>展示范围：</FormLabel>
                  <FormControl>
                    <Switch className={"data-[state=checked]:bg-[#3DCAFF]"} disabled={facilityParams?.status === "change"} checked={field.value as boolean} onCheckedChange={field.onChange}/>
                  </FormControl>
                </FormItem>
              )}
              name={"enable"}/>
          </div>
          <div className={"flex absolute right-[36px] bottom-[48px] space-x-4"}>
            {facilityParams?.status !== "add" && <>
              <Button style={{background: "rgba(255,255,255,0.2)"}} onClick={onDelete}>删除点位</Button>
              <Button type={"button"} style={{background: "rgba(255,255,255,0.2)"}}
                      onClick={onChangeLocation}>更改位置</Button>
            </>}
            <Button onClick={onClosePanel} style={{background: "rgba(255,255,255,0.2)"}}
                    className={"px-[24px]"}>取消</Button>
            <Button type={"submit"} className={"bg-[#3DCAFF] px-[24px] hover:bg-[#3DCAFF]"}>确定</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FacilityProperty;

