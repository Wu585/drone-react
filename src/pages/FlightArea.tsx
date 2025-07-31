import {ELocalStorageKey} from "@/types/enum.ts";
import {AreaItem, Device, MAP_API_PREFIX, useBindingDevice, useDeviceStatus, useFlightAreas} from "@/hooks/drone";
import {useCallback, useEffect, useMemo, useState} from "react";
import {ArrowBigRight, Ban, CircleCheck, Drone, MapPin, MonitorDot, Package2, Trash2, X} from "lucide-react";
import dayjs from "dayjs";
import {cn} from "@/lib/utils.ts";
import {
  EGeometryType,
  ESyncStatus,
  FlightAreaSyncProgress,
  FlightAreaTypeTitleMap,
  GetDeviceStatus
} from "@/types/flight-area.ts";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import DrawPanel from "@/components/drone/DrawPanel.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import CommonAlertDialog from "@/components/drone/public/CommonAlertDialog.tsx";
import {IconButton} from "@/components/drone/public/IconButton.tsx";
import FlightAreaScene from "@/components/drone/public/FlightAreaScene.tsx";
import {useAllFlightAreas, useElementsGroup} from "@/hooks/drone/elements";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import EventBus from "@/lib/event-bus.ts";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";

const formSchema = z.object({
  name: z.string().min(1, {message: "请输入飞行区名称"}),
  longitude: z.coerce.number({
    invalid_type_error: "经度必须是数字"
  }).optional(),
  latitude: z.coerce.number({
    invalid_type_error: "纬度必须是数字"
  }).optional(),
});

const FlightArea = () => {
  const departId = localStorage.getItem("departId");
  const workspaceId: string = localStorage.getItem(ELocalStorageKey.WorkspaceId) || "";
  useAllFlightAreas();
  const {data: flightAreas, mutate} = useFlightAreas(workspaceId);
  const {put, delete: deleteClient, post} = useAjax();
  const [currentArea, setCurrentArea] = useState<AreaItem | null>(null);
  const {data: elementsGroups} = useElementsGroup(departId ? +departId : undefined);
  const [sidePanelVisible, setSidePanelVisible] = useState(false);
  useInitialConnectWebSocket();

  useEffect(() => {
    console.log("elementsGroups");
    console.log(elementsGroups);
  }, [elementsGroups]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });

  const locationArea = (area: AreaItem) => {
    const entity = getCustomSource("flight-area")?.entities.getById(area.area_id);
    viewer.flyTo(entity, {
      duration: 1
    });
  };

  const changeAreaStatus = async (status: boolean, areaId: string) => {
    await put(`${MAP_API_PREFIX}/workspaces/${workspaceId}/flight-area/${areaId}`, {status});
    toast({
      description: "修改状态成功！"
    });
    await mutate();
  };

  const onDeleteFlightArea = async (areaId: string) => {
    await deleteClient(`${MAP_API_PREFIX}/workspaces/${workspaceId}/flight-area/${areaId}`);
    toast({
      description: "删除成功！"
    });
    await mutate();
  };

  const onClickArea = (area: AreaItem) => {
    setSidePanelVisible(true);
    setCurrentArea(area);
    if (area.content.geometry.type === "Circle") {
      form.setValue("longitude", area.content.geometry.coordinates[0] as number);
      form.setValue("latitude", area.content.geometry.coordinates[1] as number);
    } else {
      form.setValue("longitude", 0);
      form.setValue("latitude", 0);
    }
    form.setValue("name", area.name);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const flightAreaElement = elementsGroups?.find(item => item.type === 0);
    if (!flightAreaElement) return;
    const selectedArea = flightAreaElement.elements.find(item => item.id === currentArea?.area_id);
    if (!selectedArea) return;
    if (selectedArea.resource.type === 0) {
      const content = {
        geometry: {
          ...selectedArea.resource.content.geometry,
          coordinates: [values.longitude, values.latitude, 0]
        },
        properties: {
          ...selectedArea.resource.content.properties
        },
        type: selectedArea.resource.type
      };
      const body = {
        content,
        name: values.name
      };
      await put(`${MAP_API_PREFIX}/workspaces/` + workspaceId + `/elements/${currentArea?.area_id}`, body);
      toast({
        description: "修改成功！"
      });
      await mutate();
    } else {
      const content = {
        ...selectedArea.resource.content
      };
      const body = {
        content,
        name: values.name
      };
      await put(`${MAP_API_PREFIX}/workspaces/` + workspaceId + `/elements/${currentArea?.area_id}`, body);
      toast({
        description: "修改成功！"
      });
      await mutate();
    }
  };

  const {data: bindingDevices} = useBindingDevice(workspaceId, {
    page: 1,
    page_size: 100,
    domain: EDeviceTypeName.Dock,
    organ: departId ? +departId : undefined,
  });

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const BindDeviceList = useCallback(() => (<>
    {!bindingDevices || bindingDevices.list.length === 0 ? <div className={"content-center py-8 text-[#d0d0d0]"}>
      暂无设备
    </div> : bindingDevices.list.map(device =>
      <div key={device.device_sn}
           onClick={() => {
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
  </>), [bindingDevices, selectedDevice]);

  const {data: deviceStatusList} = useDeviceStatus(workspaceId);
  const [syncDevices, setSyncDevices] = useState<GetDeviceStatus[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);

  const onSyncFlightArea = async () => {
    if (!selectedDevice) {
      return toast({
        description: "请选择设备！",
        variant: "warning"
      });
    }
    if (!selectedDevice.status) {
      return toast({
        description: "设备不在线！",
        variant: "warning"
      });
    }

    try {
      setSyncLoading(true);
      await post(`${MAP_API_PREFIX}/workspaces/${workspaceId}/flight-area/sync`, {
        device_sn: [selectedDevice.device_sn]
      });
    } catch (err) {
      toast({
        description: "同步失败！",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setSyncLoading(false);
      }, 3000);
    }
  };

  useEffect(() => {
    setSyncDevices(deviceStatusList || []);
  }, [deviceStatusList]);

  const syncDevicesCount = useMemo(() =>
      syncDevices.filter(device =>
        device.flight_area_status.sync_status === ESyncStatus.SYNCHRONIZING ||
        device.flight_area_status.sync_status === ESyncStatus.WAIT_SYNC
      ).length,
    [syncDevices]
  );

  const handleSyncProgressEvent = useCallback((data: FlightAreaSyncProgress) => {
    console.log("data===");
    console.log(data);
    let deviceFound = false;

    const status = {
      sync_code: data.result,
      sync_status: data.status,
      sync_msg: data.message
    };

    console.log("syncDevices===");
    console.log(syncDevices);

    const updatedDevices = syncDevices.map(device => {
      if (data.sn === device.device_sn) {
        deviceFound = true;
        return {...device, flight_area_status: status};
      }
      return device;
    });

    if (!deviceFound) {
      return [...syncDevices, {device_sn: data.sn, flight_area_status: status}];
    }

    setSyncDevices(updatedDevices);
    /*setSyncDevices(prevDevices => {
      const status = {
        sync_code: data.result,
        sync_status: data.status,
        sync_msg: data.message
      };

      const updatedDevices = prevDevices.map(device => {
        if (data.sn === device.device_sn) {
          deviceFound = true;
          return {...device, flight_area_status: status};
        }
        return device;
      });

      if (!deviceFound) {
        return [...updatedDevices, {device_sn: data.sn, flight_area_status: status}];
      }

      return updatedDevices;
    });*/

  }, [syncDevices]);

  useEffect(() => {
    EventBus.on("flightAreasSyncProgressWs", handleSyncProgressEvent);

    return () => {
      EventBus.off("flightAreasSyncProgressWs", handleSyncProgressEvent);
    };
  }, [handleSyncProgressEvent]);

  return (
    <div className={"w-full h-full flex text-[16px]"}>
      <div
        className={cn("w-[340px] min-w-[340px] border-[1px] h-full border-[#43ABFF] bg-gradient-to-l from-[#32547E]/[.5] to-[#1F2D4B] border-l-0",
          sidePanelVisible ? "" : "rounded-tr-lg rounded-br-lg")}>
        <div
          className={"flex items-center space-x-4 border-b-[1px] border-b-[#265C9A] px-[12px] py-4 text-sm justify-between"}>
          <h1 className={"h-8 text-base"}>自定义飞行区</h1>
        </div>
        <div className={"px-[12px] py-4 space-y-2 h-[calc(100vh-240px)] overflow-y-auto"}>
          {flightAreas && flightAreas.length > 0 ? flightAreas.map(area =>
            <div key={area.area_id}
                 style={{
                   backgroundSize: "100% 100%"
                 }}
                 className={cn("bg-panel-item text-[14px] p-4 space-y-[6px] cursor-pointer", area.status ? "" : "opacity-60", area.area_id === currentArea?.area_id && "bg-panel-item-active")}
                 onClick={() => onClickArea(area)}
            >
              <div className={"font-bold"}>{area.name}</div>
              <div
                className={"text-sm text-gray-300"}>更新于 {dayjs(area.update_time).format("YYYY-MM-DD HH:mm:ss")}</div>
              <div className={"flex justify-between"}>
                <div className={"content-center space-x-2"}>
                  <div
                    className={cn("w-[16px] h-[16px] border-[3px]",
                      area.type === "dfence" ? "border-green-500" : "border-red-500",
                      area.content.geometry.type === EGeometryType.CIRCLE ? "rounded-full" : ""
                    )}
                  />
                  <div>
                    {FlightAreaTypeTitleMap[area.type]?.[area.content.geometry.type === EGeometryType.CIRCLE ? EGeometryType.CIRCLE : EGeometryType.POLYGON]}
                  </div>
                </div>
                <div className={"content-center space-x-2"}>
                  <CommonAlertDialog
                    title={area.status ? "禁用飞行区" : "启用飞行区"}
                    trigger={
                      area.status ?
                        <IconButton>
                          <Ban size={16}/>
                        </IconButton>
                        : <IconButton>
                          <CircleCheck size={16} className={""}/>
                        </IconButton>
                    }
                    description={area.status ? "确定禁用飞行区吗？" : "确定启用飞行区吗？"}
                    onConfirm={() => changeAreaStatus(!area.status, area.area_id)}
                  />
                  <IconButton onClick={() => locationArea(area)}>
                    <MapPin size={16}/>
                  </IconButton>
                  <CommonAlertDialog
                    title={"删除飞行区"}
                    trigger={
                      <IconButton>
                        <Trash2 size={16}/>
                      </IconButton>
                    }
                    description={"确定删除飞行区吗？"}
                    onConfirm={() => onDeleteFlightArea(area.area_id)}
                  />
                </div>
              </div>
            </div>) : <div className={"content-center py-8 text-[#d0d0d0]"}>暂无数据</div>}
        </div>
        <div
          onClick={() => {
            setCurrentArea(null);
            setSidePanelVisible(true);
          }}
          className={"flex justify-center items-center flex-1 py-4 space-x-2 cursor-pointer border-t-[1px] border-[#43ABFF]"}>
          <MonitorDot/>
          <span>同步到设备</span>
          <ArrowBigRight/>
        </div>
      </div>
      {sidePanelVisible && <div className={"w-[266px] border-[1px] h-full border-[#43ABFF] bg-[#1E3357] " +
        "rounded-tr-lg rounded-br-lg border-l-0 relative text-sm"}>
        <X className={"absolute right-2 top-4 cursor-pointer"} onClick={() => {
          setCurrentArea(null);
          setSidePanelVisible(false);
        }}/>
        <div
          className={"border-b-[#265C9A] border-b-[1px] py-5 px-4 text-base"}>{currentArea ? "飞行区编辑" : "设备列表"}</div>
        {currentArea ? <Form {...form}>
          <form className={"p-4 space-y-2"} onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem className={"space-y-4"}>
                  <FormLabel>飞行区名称：</FormLabel>
                  <FormControl>
                    <CommonInput defaultValue={currentArea?.name} {...field} placeholder={"请输入飞行区名称"}/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
              name={"name"}
            />
            {currentArea?.content.geometry.type === EGeometryType.CIRCLE &&
              <>
                <FormField
                  control={form.control}
                  render={({field}) => (
                    <FormItem className={"space-y-4"}>
                      <FormLabel>经度：</FormLabel>
                      <FormControl>
                        <CommonInput  {...field} placeholder={"请输入中心点经度"}/>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                  name={"longitude"}
                />
                <FormField
                  control={form.control}
                  render={({field}) => (
                    <FormItem className={"space-y-4"}>
                      <FormLabel>纬度：</FormLabel>
                      <FormControl>
                        <CommonInput {...field} placeholder={"请输入中心点纬度"}/>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                  name={"latitude"}
                />
              </>}
            <div className={"text-right py-4"}>
              <CommonButton type={"submit"}>确定</CommonButton>
            </div>
          </form>
        </Form> : <div className={"px-4 my-4 h-[calc(100vh-260px)] overflow-y-auto"}>
          <BindDeviceList/>
        </div>}
        {!currentArea && <div className={"flex justify-end pr-4"}>
          <CommonButton type={"button"} isLoading={syncDevicesCount > 0 || syncLoading}
                        onClick={onSyncFlightArea}>同步</CommonButton>
        </div>}
      </div>}
      <div className={"flex-1 border-[2px] rounded-lg border-[#43ABFF] relative ml-[20px] overflow-hidden"}>
        <FlightAreaScene/>
        <div className={"absolute right-16 top-8"}>
          <DrawPanel/>
        </div>
      </div>
    </div>
  );
};

export default FlightArea;

