import {ELocalStorageKey} from "@/types/enum.ts";
import {AreaItem, MAP_API_PREFIX, useElementsGroups, useFlightAreas} from "@/hooks/drone";
import {useEffect, useState} from "react";
import {Ban, CircleCheck, MapPin, Trash2, X} from "lucide-react";
import dayjs from "dayjs";
import {cn} from "@/lib/utils.ts";
import {EGeometryType, FlightAreaTypeTitleMap} from "@/types/flight-area.ts";
import {useFlightArea} from "@/hooks/drone/map/useFlightArea.ts";
import {useGMapCover} from "@/hooks/drone/map/useGMapCover.ts";
import {useMapTool} from "@/hooks/drone/map/useMapTool.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
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
  const workspaceId: string = localStorage.getItem(ELocalStorageKey.WorkspaceId) || "";

  const {data: flightAreas, mutate} = useFlightAreas(workspaceId);
  const {getGcj02} = useFlightArea();
  const useGMapCoverHook = useGMapCover();
  const useMapToolHook = useMapTool();
  const {put, delete: deleteClient} = useAjax();
  const [currentArea, setCurrentArea] = useState<AreaItem | null>(null);
  const {data: elementsGroups} = useElementsGroups(workspaceId);

  useEffect(() => {
    console.log("elementsGroups");
    console.log(elementsGroups);
  }, [elementsGroups]);

  const mapState = useSceneStore(state => state.mapState);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });

  useEffect(() => {
    if (flightAreas && mapState.map) {
      console.log("flightAreas=====xxxxxxxxxxxxxxx");
      console.log(flightAreas);
      initMapFlightArea();
    }

    return () => {
      flightAreas?.forEach(area => useGMapCoverHook.removeCoverFromMap(area.area_id));
    };
  }, [flightAreas, mapState.map]);

  const locationArea = (area: AreaItem) => {
    if (!mapState.map) return;

    let coordinate: any;
    switch (area.content.geometry.type) {
      case EGeometryType.CIRCLE:
        coordinate = getGcj02(area.content.geometry.coordinates);
        break;
      case "Polygon":
        coordinate = useGMapCoverHook.calcPolygonPosition(getGcj02(area.content.geometry.coordinates[0]));
        break;
    }
    useMapToolHook.panTo(coordinate);
  };

  const initMapFlightArea = () => {
    console.log("=========initMapFlightArea=============");
    if (!mapState.map) return;
    console.log("=========flightAreas init====----1111=============");

    flightAreas?.forEach(area => {
      updateMapFlightArea(area);
    });
  };

  const updateMapFlightArea = (area: AreaItem) => {
    if (!mapState.map) return;
    console.log("area update area");
    console.log(area);
    switch (area.content.geometry.type) {
      case EGeometryType.CIRCLE:
        useGMapCoverHook.updateFlightAreaCircle(
          area.area_id,
          area.name,
          area.content.geometry.radius,
          getGcj02(area.content.geometry.coordinates),
          area.status,
          area.type
        );
        break;
      case "Polygon":
        useGMapCoverHook.updateFlightAreaPolygon(
          area.area_id,
          area.name,
          getGcj02(area.content.geometry.coordinates[0]),
          area.status,
          area.type
        );
        break;
    }
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
    useGMapCoverHook.removeCoverFromMap(areaId);
    toast({
      description: "删除成功！"
    });
    await mutate();
  };

  const onClickArea = (area: AreaItem) => {
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

  return (
    <div className={"w-full h-full flex"}>
      <div
        className={cn("w-[340px] min-w-[340px] border-[1px] h-full border-[#43ABFF] bg-gradient-to-l from-[#32547E]/[.5] to-[#1F2D4B] border-l-0",
          currentArea ? "" : "rounded-tr-lg rounded-br-lg")}>
        <div
          className={"flex items-center space-x-4 border-b-[1px] border-b-[#265C9A] px-[12px] py-4 text-sm justify-between"}>
          <h1 className={"h-8 text-base"}>自定义飞行区</h1>
        </div>
        <div className={"px-[12px] py-4 space-y-2 h-[calc(100vh-180px)] overflow-y-auto"}>
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
                    {FlightAreaTypeTitleMap[area.type][area.content.geometry.type === EGeometryType.CIRCLE ? EGeometryType.CIRCLE : EGeometryType.POLYGON]}
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
      </div>
      {currentArea && <div className={"w-[266px] border-[1px] h-full border-[#43ABFF] bg-gradient-to-r " +
        "from-[#074578]/[.5] to-[#0B142E]/[.9] rounded-tr-lg rounded-br-lg border-l-0 relative text-base"}>
        <X className={"absolute right-2 top-2 cursor-pointer"} onClick={() => setCurrentArea(null)}/>
        <div className={"border-b-[#265C9A] border-b-[1px] p-4"}>飞行区编辑</div>
        <Form {...form}>
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
        </Form>
      </div>}
      <div className={"flex-1 border-[2px] rounded-lg border-[#43ABFF] relative ml-[20px]"}>
        <FlightAreaScene/>
        <div className={"absolute right-16 top-8"}>
          <DrawPanel/>
        </div>
      </div>
    </div>
  );
};

export default FlightArea;

