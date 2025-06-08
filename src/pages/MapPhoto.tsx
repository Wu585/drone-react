import {
  ChevronRight, Circle,
  DiamondIcon, Eye, EyeOff,
  Folder,
  FolderOpen,
  Pencil,
  Spline,
  Square,
  Trash2,
  Video,
  Image, ImageIcon,
  Loader, BookText
} from "lucide-react";
import Scene from "@/components/drone/public/Scene.tsx";
import MapChange from "@/components/drone/public/MapChange.tsx";
import {ElementParam, generateLabelConfig, Layer} from "@/hooks/drone/elements";
import {cn} from "@/lib/utils";
import {useMemo, useState, useCallback, useEffect} from "react";
import {
  Dialog, DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import DrawPanel from "@/components/drone/elements/DrawPanel.tsx";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ElementInfo, {Element} from "@/components/drone/elements/ElementInfo.tsx";
import {MapElementEnum} from "@/types/map.ts";
import {MapPhoto as MapPhotoType, useMapLoadMedia, useMapPhoto} from "@/hooks/drone/map-photo";
import {MediaFileType} from "@/hooks/drone/media";
import {getMediaType} from "@/hooks/drone/order";
import ggpPng from "@/assets/images/ggp.png";
import {EntitySize} from "@/assets/datas/enum.ts";
import {flyToDegree} from "@/lib/view.ts";
import {useOrderListVisual} from "@/hooks/drone/order/useOrderToMap.ts";
import {MEDIA_HTTP_PREFIX, useWorkOrderByRealTimeId, WorkOrder} from "@/hooks/drone";
import {useAjax} from "@/lib/http.ts";
import {ELocalStorageKey} from "@/types/enum.ts";

const GroupItem = ({
                     group,
                     level = 0,
                     selected,
                     onSelect,
                     onUpdate,
                     onDelete,
                     onDeleteElement,
                     onClickEdit,
                     onVisibleChange
                   }: {
  group: Layer;
  level?: number;
  selected: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDeleteElement: (id: string) => Promise<void>;
  onClickEdit: (element?: ElementParam) => void
  onVisibleChange?: (groupId: string, elementId: string, visible: boolean) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(group.name);

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center h-9 cursor-pointer hover:bg-[#43ABFF]/10 group relative",
          selected === group.id && "bg-[#43ABFF]/20",
          level > 0 && "ml-4"
        )}
        onClick={() => onSelect(group.id)}
      >
        <div className="w-6 flex items-center justify-center shrink-0">
          {(group.elements?.length > 0) && (
            <ChevronRight
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={cn(
                "h-4 w-4 transition-transform text-gray-500",
                isExpanded && "rotate-90"
              )}
            />
          )}
        </div>

        <div className="w-6 flex items-center justify-center shrink-0">
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-orange-400"/>
          ) : (
            <Folder className="h-4 w-4 text-orange-400"/>
          )}
        </div>

        <span className="text-sm text-white truncate flex-1">{group.name}</span>

        {/* 操作按钮组 */}
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 absolute right-2">
          <Dialog open={showEdit} onOpenChange={setShowEdit}>
            <DialogTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditName(group.name);
                }}
                className="p-1 hover:bg-[#43ABFF]/20 rounded"
              >
                <Pencil className="h-4 w-4 text-white"/>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑文件夹</DialogTitle>
              </DialogHeader>
              <div className="flex space-x-2 items-center">
                <Label className="mr-4 whitespace-nowrap">文件夹名称</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <DialogClose>
                  <Button
                    onClick={async () => {
                      await onUpdate(group.id, editName);
                    }}
                  >
                    确认
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 删除按钮 */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-1 hover:bg-red-500/20 rounded"
              >
                <Trash2 className="h-4 w-4 text-red-500"/>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>删除文件夹</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-gray-500">
                  确定要删除文件夹 "{group.name}" 吗？此操作不可恢复。
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">取消</Button>
                </DialogClose>
                <DialogClose>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await onDelete(group.id);
                    }}
                  >
                    删除
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-1">
          {group.elements.map(element => (
            <div
              key={element.id}
              className={cn(
                "flex items-center h-9 cursor-pointer hover:bg-[#43ABFF]/10 relative group",
                selected === element.id && "bg-[#43ABFF]/20",
                level > 0 ? "ml-8" : "ml-4"
              )}
            >
              <div className="w-6 flex items-center justify-center shrink-0"/>
              <div className="w-6 flex items-center justify-center shrink-0">
                {element.resource.type === MapElementEnum.PIN && <DiamondIcon className="h-4 w-4 text-[#43ABFF]"/>}
                {element.resource.type === MapElementEnum.LINE && <Spline className="h-4 w-4 text-[#43ABFF]"/>}
                {element.resource.type === MapElementEnum.POLY && <Square className="h-4 w-4 text-[#43ABFF]"/>}
                {element.resource.type === MapElementEnum.CIRCLE && <Circle className="h-4 w-4 text-[#43ABFF]"/>}
              </div>
              <span onClick={() => onSelect(element.id)}
                    className="w-40 text-sm text-white truncate">{element.name}</span>
              <div
                className={"opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 absolute right-2"}>
                {element.visual ? <Eye className="p-1 hover:bg-[#43ABFF]/20 rounded" onClick={() => {
                    onVisibleChange?.(group.id, element.id, false);
                  }}/> :
                  <EyeOff className="p-1 hover:bg-[#43ABFF]/20 rounded" onClick={() => {
                    onVisibleChange?.(group.id, element.id, true);
                  }}/>}
                {/* 编辑按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="p-1 hover:bg-[#43ABFF]/20 rounded"
                >
                  <Pencil onClick={() => onClickEdit(element as ElementParam)} className="h-4 w-4 text-white"/>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-1 hover:bg-red-500/20 rounded"
                >
                  <Trash2 onClick={() => onDeleteElement(element.id)} className="h-4 w-4 text-red-500"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 修改 FolderItem 组件，添加 onVisibleChange 属性
const FolderItem = ({folder, onVisibleChange, onClickFile}: {
  folder: any,
  onVisibleChange?: (id: number, visible: boolean) => void
  onClickFile?: (file: any) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2 py-1.5 hover:bg-white/5 rounded-md cursor-pointer group"
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {isOpen ? <FolderOpen className="w-4 h-4 text-orange-400 shrink-0"/> :
            <Folder className="w-4 h-4 text-orange-400 shrink-0"/>}
          <span className="text-white truncate text-base" title={folder.file_name}>{folder.file_name}</span>
        </div>
        <ChevronRight className={cn(
          "w-4 h-4 text-white/60 transition-transform shrink-0",
          isOpen && "rotate-90"
        )}/>
      </div>

      {/* 文件列表 */}
      {isOpen && folder.children.length > 0 && (
        <div className="ml-4 space-y-1 mt-1">
          {folder.children.map((file: any) => (
            <div
              key={file.id}
              className="flex items-center space-x-2 px-2 py-1.5 hover:bg-white/5 rounded-md group min-w-0"
            >
              {/* 根据文件类型显示不同图标 */}
              {file.type === MediaFileType.DIR ? (
                <Folder className="w-4 h-4 shrink-0 text-orange-400"/>
              ) : getMediaType(file.preview_url) === "video" ? (
                <Video className="w-4 h-4 text-orange-400 shrink-0"/>
              ) : (
                <Image className="w-4 h-4 text-orange-400 shrink-0"/>
              )}
              <span className="text-base text-white truncate flex-1"
                    onClick={() => onClickFile?.(file)}
                    title={file.file_name}>
                {file.file_name}
              </span>
              {/* 可见性切换按钮 */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onVisibleChange?.(file.id, !file.visual);
                }}
                className="p-1 hover:bg-[#43ABFF]/20 rounded cursor-pointer"
              >
                {file.visual ? (
                  <Eye className="h-4 w-4 text-[#43ABFF]"/>
                ) : (
                  <EyeOff className="h-4 w-4 text-white/60"/>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 添加图片加载状态组件
const ImagePreview = ({url}: { url?: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 当 url 改变时重置状态
  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [url]);

  return (
    <div className="relative w-full h-[300px] bg-black/20 rounded-lg overflow-hidden">
      {url && (
        <img
          src={url}
          alt=""
          className={cn(
            "w-full h-full object-contain transition-opacity duration-300",
            loading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
        />
      )}

      {/* 加载状态 */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin">
            <Loader className="w-6 h-6 text-[#43ABFF]"/>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-white/60"/>
        </div>
      )}
    </div>
  );
};

const OPERATION_HTTP_PREFIX = "operation/api/v1";

const MapPhoto = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const {changePhotoVisual} = useMapLoadMedia();
  const {data: mapPhotoData, mutate} = useMapPhoto();
  const {post} = useAjax();
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  // 处理可见性变化
  const handleVisibleChange = useCallback(async (id: number, visible: boolean) => {
    console.log("Visibility changed:", id, visible);
    // TODO: 在这里处理可见性变化的逻辑
    try {
      await changePhotoVisual({id, visual: visible});
      await mutate();
    } catch (error: any) {
      toast({
        description: error.data.message
      });
    }
  }, []);

  // 构建文件夹-文件结构
  const getDirList = useMemo(() => {
    if (!mapPhotoData?.list) return [];

    // 先找出所有文件夹
    const folders = mapPhotoData.list.filter(item => item.type === MediaFileType.DIR);

    // 找出所有 onMap 为 true 的文件的父文件夹 ID
    const onMapFileParentIds = new Set(
      mapPhotoData.list
        .filter(item => item.on_map)
        .map(item => item.parent)
    );

    // 过滤文件夹，只保留包含 onMap 文件的文件夹
    const filteredFolders = folders.filter(folder =>
      onMapFileParentIds.has(folder.id)
    );

    // 为每个文件夹添加其直接子文件，但只包含 onMap 为 true 的文件
    return filteredFolders.map(folder => ({
      ...folder,
      children: mapPhotoData.list.filter(item =>
        item.parent === folder.id && item.on_map
      )
    }));

  }, [mapPhotoData]);

  console.log("包含地图文件的文件夹:", getDirList);

  useEffect(() => {
    const source = getCustomSource("map-photos");
    if (source) {
      source.entities.removeAll();
      getDirList.forEach(dir => {
        dir.children.forEach(item => {
          if (item.visual) {
            source.entities.add({
              id: `photo-${item.id}`,
              position: Cesium.Cartesian3.fromDegrees(+item.longitude, +item.latitude, 0),
              billboard: {
                image: ggpPng,
                width: EntitySize.Width,
                height: EntitySize.Height,
                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
              },
              label: generateLabelConfig(item.file_name)
            });
          }
        });
      });
    }
  }, [getDirList]);

  const onFlyTo = (file: MapPhotoType) => {
    flyToDegree(+file.longitude, +file.latitude);
  };

  const [currentPhoto, setCurrentPhoto] = useState<MapPhotoType | null>(null);

  const [currentType, setCurrentType] = useState<"photo" | "order">();

  const [currentOrderId, setCurrentOrderId] = useState<number>();
  const {data: currentOrder} = useWorkOrderByRealTimeId(currentOrderId);

  useEffect(() => {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: any) => {
      viewer.scene.pickPositionAsync(movement.position).then(() => {
        const pickedObject = viewer.scene.pick(movement.position);
        if (!pickedObject) return;
        if (pickedObject.id.id && pickedObject.id.id.includes("photo")) {
          const selected = mapPhotoData?.list.find(item => item.id === +pickedObject.id.id.split("-")[1]);
          setCurrentPhoto(selected || null);
          setSheetOpen(true);
          setCurrentType("photo");
        } else if (pickedObject.id.id && pickedObject.id.id.includes("order")) {
          setSheetOpen(true);
          setCurrentType("order");
          const id = pickedObject.id.id.split("-")[1];
          setCurrentOrderId(id);
        }
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);//移除事件
      handler.destroy();
    };

  }, [mapPhotoData]);

  const {data: orderListVisual, mutate: mutateOrderListVisual} = useOrderListVisual();

  const flyToOrder = (order: WorkOrder) => {
    if (order.longitude && order.latitude) {
      flyToDegree(order.longitude, order.latitude);
    }
  };

  const onOrderCancelLoadMap = async (id?: number) => {
    if (!id) return;
    try {
      await post(`${OPERATION_HTTP_PREFIX}/order/setVisual`, {
        ids: [id],
        visual: false
      });
      toast({
        description: "地图取消加载工单成功！",
      });
      await mutateOrderListVisual();
      setSheetOpen(false);
    } catch (err) {
      toast({
        description: "地图取消加载工单失败！",
        variant: "destructive"
      });
    }
  };

  const onMediaCancelLoadMap = async (id: string) => {
    try {
      await post(`${MEDIA_HTTP_PREFIX}/files/${workspaceId}/cancelMap`, {
        ids: [id]
      });
      toast({
        description: "地图取消加载图片成功！",
      });
      await mutate();
    } catch (err) {
      toast({
        description: "地图取消加载图片失败！",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-full flex">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-[#072E62] border border-[#43ABFF] text-white">
          <SheetHeader>
            <SheetTitle
              className="text-white mb-4 truncate"
              title={currentOrder?.name}>{currentType === "photo" ? currentPhoto?.file_name : "工单信息"}</SheetTitle>
          </SheetHeader>
          {currentType === "photo" &&
            <div>
              <div className={"grid grid-cols-6 gap-2"}>
                <h3 className={"col-span-1"}>时间：</h3>
                <div className={"col-span-5 text-[#43ABFF]"}>{currentPhoto?.create_time}</div>
                <h3 className={"col-span-6"}>坐标经度：</h3>
                <div className={"text-[#43ABFF]"}>{currentPhoto?.longitude}</div>
                <h3 className={"col-span-6"}>坐标纬度：</h3>
                <div className={"text-[#43ABFF]"}>{currentPhoto?.latitude}</div>
              </div>
              <div className={"my-4"}>
                <ImagePreview url={currentPhoto?.preview_url}/>
              </div>
              <div className={"flex"}>
                <Button className={"ml-auto bg-[#43ABFF]"}
                        onClick={() => onMediaCancelLoadMap(currentPhoto?.id)}>取消地图加载</Button>
              </div>
            </div>}

          {currentType === "order" &&
            <div className={""}>
              <div className={"grid grid-cols-6 gap-2 gap-y-4"}>
                <h3 className={"col-span-2"}>工单名称：</h3>
                <div className={"col-span-4 text-[#43ABFF]"}>{currentOrder?.name}</div>
                <h3 className={"col-span-2"}>发现时间：</h3>
                <div className={"col-span-4 text-[#43ABFF]"}>{currentOrder?.found_time}</div>
                <h3 className={"col-span-2"}>发现地址：</h3>
                <div className={"text-[#43ABFF] col-span-4"}>{currentOrder?.address}</div>
                <h3 className={"col-span-2"}>坐标经度：</h3>
                <div className={"text-[#43ABFF] col-span-4"}>{currentOrder?.longitude}</div>
                <h3 className={"col-span-2"}>坐标纬度：</h3>
                <div className={"text-[#43ABFF] col-span-4"}>{currentOrder?.latitude}</div>
                <h3 className={"col-span-2"}>联系人：</h3>
                <div className={"text-[#43ABFF] col-span-4"}>{currentOrder?.contact}</div>
                <h3 className={"col-span-2"}>联系电话：</h3>
                <div className={"text-[#43ABFF] col-span-4"}>{currentOrder?.contact_phone}</div>
                <h3 className={"col-span-2"}>事件描述：</h3>
                <div className={"text-[#43ABFF] col-span-4"}>{currentOrder?.description}</div>
              </div>
              <div className={"my-4 space-y-4 max-h-[calc(100vh-500px)] overflow-auto"}>
                {currentOrder?.pic_list.map(url => {
                  const type = getMediaType(url);
                  return type === "image" ? <ImagePreview url={url}/> :
                    <video controls className={"h-[300px] aspect-video object-fill"} src={url}></video>;
                })}
              </div>
              <div className={"flex"}>
                <Button className={"ml-auto bg-[#43ABFF]"}
                        onClick={() => onOrderCancelLoadMap(currentOrder?.id)}>取消地图加载</Button>
              </div>
            </div>}
        </SheetContent>
      </Sheet>
      <div className="w-[340px] min-w-[340px] border-[1px] border-[#43ABFF] bg-gradient-to-r
        from-[#074578]/[.5] to-[#0B142E]/[.9] border-l-0 rounded-tr-lg rounded-br-lg flex flex-col">
        <div
          className="flex items-center space-x-4 border-b-[1px] border-b-[#265C9A] px-[12px] py-4 text-sm justify-between">
          <div className={"h-8 text-base"}>媒体/工单照片</div>
        </div>
        <div className="flex-1 px-[12px] py-4 space-y-2 overflow-y-auto">
          {getDirList?.length === 0 && orderListVisual?.length === 0 ? <div className={"text-center py-4 text-[#d0d0d0]"}>暂无数剧</div> :
            <>
              {/* 渲染文件夹列表 */}
              {getDirList.map(folder => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  onVisibleChange={handleVisibleChange}
                  onClickFile={onFlyTo}
                />
              ))}
              <div className={""}>
                {orderListVisual?.map(order =>
                  <div className={"flex items-center px-2 py-1.5 space-x-2"} key={order.id}
                       onClick={() => flyToOrder(order)}>
                    <BookText className="w-4 h-4 text-orange-400 shrink-0"/>
                    <span className={"truncate"} title={order.name}>{order.name}</span>
                  </div>)}
              </div>
            </>}
        </div>
      </div>
      <div className="flex-1 min-w-0 ml-[20px] border-[2px] rounded-lg border-[#43ABFF] relative">
        <Scene/>
        <div className="absolute right-0 bottom-0 z-[30]">
          <MapChange/>
        </div>
      </div>
    </div>
  );
};

export default MapPhoto;

