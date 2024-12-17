import {useSceneStore} from "@/store/useSceneStore.ts";
import {useRef, useState} from "react";
import {useVisible} from "@/hooks/public/utils.ts";
import {useAddLeftClickListener, useChangeSelectedEntityImage} from "@/hooks/public/event-listen.ts";
import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import Panel from "@/components/garbage-house/Panel.tsx";
import ToolBar from "@/components/toolbar/ToolBar.tsx";
import {cn} from "@/lib/utils.ts";
import {useGarbageHouseEntities} from "@/hooks/garbage-house/entities.ts";
import ljxf from "@/assets/images/ljxf.png";
import {PlusIcon} from "lucide-react";
import DetailPanelLayout from "@/components/public/DetailPanelLayout.tsx";
import {useVideoJS} from "react-hook-videojs";
import {GarbageRoom, useFpGarbageAlarmInfo, useGarbageRoomList, useTrashCanList} from "@/hooks/garbage-house/api.ts";
import {pickPosition} from "@/components/toolbar/tools";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {clearPickPosition} from "@/components/toolbar/tools/pickPosition.ts";
import {client} from "@/hooks/bicycles/api.ts";
import {useToast} from "@/components/ui/use-toast.ts";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "请输入垃圾厢房名称"
  }),
  address: z.string().min(1, {
    message: "请输入垃圾厢房地址"
  }),
  lxr: z.string().min(1, {
    message: "请输入垃圾厢房联系人"
  }),
  lxrPhone: z.string().min(1, {
    message: "请选择垃圾厢房联系方式"
  })
});

const GarbageHouse = () => {
  const [videoSrc, setVideoSrc] = useState("");
  const {isFullScreen} = useSceneStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const monitorPanelRef = useRef<HTMLDivElement>(null);
  const {visible, show, hide} = useVisible();
  const {visible: monitorPanelVisible, show: showMonitorPanel, hide: hideMonitorPanel} = useVisible();
  const {data: trashCanList, mutate: mutateTrashCan} = useTrashCanList();
  const [open, setOpen] = useState(false);
  const [currentGarbageRoom, setCurrentGarbageRoom] = useState<GarbageRoom | undefined>(undefined);
  const {toast} = useToast();
  const {data: garBageRoomList, mutate} = useGarbageRoomList();
  const {data: alarmInfoList} = useFpGarbageAlarmInfo()
  const [location, setLocation] = useState({
    lontitude: "",
    latitude: "",
  });

  const defaultValues = {
    name: "",
    address: "",
    lxr: "",
    lxrPhone: ""
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (currentGarbageRoom) {
      await client.post("fpGarbageRoom/update", {
        id: currentGarbageRoom.id,
        ...values,
      });
      toast({
        description: "编辑垃圾厢房成功"
      });
      setCurrentGarbageRoom({
        ...values,
        id: currentGarbageRoom.id,
        ...location
      });
    } else {
      await client.post("fpGarbageRoom/create", {
        ...values,
        ...location
      });
      toast({
        description: "添加垃圾厢房成功"
      });
    }
    setOpen(false);
    await mutate();
    form.reset(defaultValues);
  };

  const {changeSelectedEntityImage, recoverSelectedEntityImage} = useChangeSelectedEntityImage("garbageHouseSource",
    "ljxf-point", "sygl");

  const handleClickEntity = (description: GarbageRoom & {
    src: string
  }) => {
    console.log(description);
    if (description.type === "monitor") {
      setVideoSrc(description.src);
      showMonitorPanel();
    } else {
      show();
      setCurrentGarbageRoom(description);
    }
    changeSelectedEntityImage(description.id.toString());
  };

  const {Video} = useVideoJS({
    controls: true,
    autoplay: true,
    preload: "auto",
    fluid: true,
    sources: [{src: videoSrc}],
  });

  useAddLeftClickListener(panelRef, handleClickEntity, false);
  useAddLeftClickListener(monitorPanelRef, handleClickEntity);

  useGarbageHouseEntities();

  const onAddGarbageRoom = () => {
    setCurrentGarbageRoom(undefined);
    hide();
    pickPosition(({longitude, latitude}) => {
      form.reset(defaultValues);
      setLocation({
        lontitude: longitude.toString(),
        latitude: latitude.toString(),
      });
      setOpen(true);
      clearPickPosition();
    }, false);
  };

  const onDeleteGarbageRoom = async () => {
    hide();
    const ids = trashCanList?.filter(item => item.belongTo === currentGarbageRoom?.id).map(item => item.id) || [];
    await client.post("fpTrashCan/deleteBatch", ids);
    await client.post("fpGarbageRoom/deleteBatch", [currentGarbageRoom?.id || ""]);
    await mutate();
    await mutateTrashCan();
  };

  return (
    <>
      {
        isFullScreen &&
        <>
          <div onClick={onAddGarbageRoom} className={"z-10 absolute top-[150px] right-[600px] cursor-pointer" +
            " w-[152px] h-[42px] border rounded-full bg-[#3DCAFF] flex items-center justify-center space-x-2"}>
            <PlusIcon/>
            <span className={"text-[18px]"}>添加垃圾厢房</span>
          </div>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"垃圾厢房管理"}>
              <div className={"bg-rain-time flex justify-center items-center space-x-16 py-4"}>
                <img src={ljxf} alt=""/>
                <div className={"flex flex-col space-y-2"}>
                  <span className={"text-[30px] font-bold text-[#FFB24D]"}>{garBageRoomList?.length || 0}</span>
                  <span>垃圾厢房总数</span>
                </div>
                <div className={"flex flex-col space-y-2"}>
                  <span className={"text-[30px] font-bold text-[#4DFFF9]"}>{trashCanList?.length || 0}</span>
                  <span>垃圾桶总数</span>
                </div>
              </div>
              <NewCommonTable
                height={300}
                data={garBageRoomList || []}
                columns={[
                  {
                    key: "垃圾厢房名称",
                    render: (item) => <>{item.name}</>
                  },
                  {
                    key: "垃圾桶数量",
                    render: (trashCan) => <>{
                      trashCanList?.filter(item => item.belongTo === trashCan.id).length || 0
                    }</>
                  },
                  {
                    key: "位置",
                    render: (item) => <>{item.address}</>
                  }
                ]}
              />
            </DisPlayItemLayout>

            <DisPlayItemLayout title={"告警信息"}>
              <NewCommonTable
                data={alarmInfoList || []}
                columns={[
                  {
                    key: "告警厢房",
                    render: (item) => <>{item.canName}</>
                  },
                  {
                    key: "告警类型",
                    render: (item) => <>{item.type}</>
                  },
                  {
                    key: "告警时间",
                    render: (item) => <>{item.createTime}</>
                  },
                  {
                    key: "处理状态",
                    render: (item) => <>{item.state}</>
                  }
                ]}
              />
            </DisPlayItemLayout>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>垃圾厢房</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 whitespace-nowrap">
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>名称：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入垃圾厢房名称"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"name"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>地址：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入垃圾厢房地址"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"address"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>联系人：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入垃圾厢房联系人"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"lxr"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>联系方式：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入垃圾厢房联系方式"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"lxrPhone"}
                  />
                  <DialogFooter>
                    <Button type="submit">保存</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </>
      }
      {monitorPanelVisible && <div ref={monitorPanelRef} className={"absolute w-[500px] h-[504px] z-50"} style={{
        transform: "translate(-50%,-110%)"
      }}>
        <DetailPanelLayout onClose={() => {
          hideMonitorPanel();
          recoverSelectedEntityImage();
        }} title={"视频监控"} size={"large"} contentType={"component"}>
          <Video className={"video-js vjs-default-skin mt-[40px]"}/>
        </DetailPanelLayout>
      </div>}
      {visible && <div ref={panelRef} className={"absolute w-[940px] h-[580px] z-50 left-1/2 top-1/2"} style={{
        transform: "translate(-50%,-50%)"
      }}>
        <Panel
          onDeleteGarbageRoom={onDeleteGarbageRoom}
          garbageRoom={currentGarbageRoom}
          onEditGarbageRoom={() => {
            setOpen(true);
            form.reset(currentGarbageRoom);
          }}
          onClose={() => {
            hide();
            recoverSelectedEntityImage();
          }}/>
      </div>
      }
      <div className={"absolute z-20 right-[50px] bottom-[32px]"}>
        <ToolBar/>
      </div>
      <div style={{
        backgroundSize: "100% 100%"
      }} className={cn("bg-side-container bg-no-repeat w-[560px] h-full absolute top-0 left-0 z-5 my-[80px]",
        isFullScreen ? "w-[560px]" : "w-0")}/>
    </>
  );
};

export default GarbageHouse;

