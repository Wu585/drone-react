import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {downloadFile, FileItem, MEDIA_HTTP_PREFIX, useMediaList, WorkOrder} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Download, Edit, FolderClosed, Grid3X3, Loader, Play, SquareMenu, Trash} from "lucide-react";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {CameraType, MediaFileMap, MediaFileType, useDirectory} from "@/hooks/drone/media";
import {useBatchFinishListener} from "@rpldy/uploady";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";
import {cn} from "@/lib/utils.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import DirTree from "@/components/drone/media/DirTree.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import NewCommonDateRangePicker from "@/components/public/NewCommonDateRangePicker.tsx";
import dayjs from "dayjs";
import CreateOrder from "@/components/drone/work-order/CreateOrder.tsx";
import UploadButton from "@rpldy/upload-button";
import {getMediaType} from "@/hooks/drone/order";
import {useNavigate} from "react-router-dom";
import {useMapLoadMedia} from "@/hooks/drone/map-photo";
import PermissionButton from "@/components/drone/public/PermissionButton.tsx";

const OPERATION_HTTP_PREFIX = "operation/api/v1";

const fallbackData: FileItem[] = [];

const GridView = ({
                    data,
                    onClickFolder,
                    onDownload,
                    onUpdateFileName,
                    onDeleteFile
                  }: {
  data: FileItem[];
  onClickFolder: (file: Partial<FileItem>) => void;
  onDownload: (file: FileItem) => void;
  onUpdateFileName: (file: FileItem) => void;
  onDeleteFile: (file: FileItem) => void;
}) => {
  return (
    <div className="grid grid-cols-6 gap-4 p-4">
      {data?.map((file) => (
        <div
          key={file.id}
          className="group relative flex flex-col items-center p-4 rounded-lg hover:bg-[#43ABFF]/10 cursor-pointer"
          onClick={() => file.type === MediaFileType.DIR && onClickFolder(file)}
        >
          {/* 文件图标 */}
          <div className="w-full aspect-square flex items-center justify-center mb-2">
            {file.type === MediaFileType.DIR ? (
              <FolderClosed className="w-16 h-16 text-orange-400"/>
            ) : file.type === MediaFileType.VIDEO ? (
              <div className="relative w-full h-full">
                <img
                  src={`${MEDIA_HTTP_PREFIX}${file.thumbnail_path}`}
                  className="w-full h-full object-cover rounded-lg"
                  alt={file.file_name}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <Play className="w-8 h-8 text-white"/>
                </div>
              </div>
            ) : (
              <img
                src={`${MEDIA_HTTP_PREFIX}${file.thumbnail_path}`}
                className="w-full h-full object-cover rounded-lg"
                alt={file.file_name}
              />
            )}
          </div>

          {/* 文件名 */}
          <span className="text-sm text-gray-300 truncate w-full text-center">
            {file.file_name}
          </span>

          {/* 悬浮操作按钮 */}
          <div className="absolute top-2 right-2 hidden group-hover:flex items-center space-x-1">
            {file.type !== MediaFileType.DIR && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(file);
                }}
              >
                <Download className="h-4 w-4"/>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateFileName(file);
              }}
            >
              <Edit className="h-4 w-4"/>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(file);
              }}
            >
              <Trash className="h-4 w-4"/>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const InfiniteGridView = ({
                            data,
                            hasMore,
                            onLoadMore,
                            onClickFolder,
                            onDownload,
                            onUpdateFileName,
                            onDeleteFile
                          }: {
  data: FileItem[];
  hasMore: boolean;
  onLoadMore: () => void;
  onClickFolder: (file: Partial<FileItem>) => void;
  onDownload: (file: FileItem) => void;
  onUpdateFileName: (file: FileItem) => void;
  onDeleteFile: (file: FileItem) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "20px",
        threshold: 0.1
      }
    );

    // 添加一个加载触发器元素
    const trigger = container.querySelector(".load-more-trigger");
    if (trigger) {
      observer.observe(trigger);
    }

    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  return (
    <div ref={containerRef} className="h-[calc(100vh-300px)] overflow-y-auto">
      <div className="grid grid-cols-8 gap-2 p-4">
        {data?.map((file) => (
          <div
            key={file.id}
            className="group relative flex flex-col items-center p-2 rounded-lg hover:bg-[#43ABFF]/10 cursor-pointer"
            onClick={() => file.type === MediaFileType.DIR && onClickFolder(file)}
          >
            {/* 文件图标 */}
            <div className="w-full aspect-square flex items-center justify-center mb-1">
              {file.type === MediaFileType.DIR ? (
                <FolderClosed className="w-12 h-12 text-orange-400"/>
              ) : file.type === MediaFileType.VIDEO || getMediaType(file.preview_url) ? (
                <div
                  className="relative w-full aspect-square flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
                  <video
                    loop
                    autoPlay
                    muted
                    src={file.preview_url}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <img
                  src={file.preview_url}
                  className="w-full h-full object-cover rounded-lg"
                  alt={file.file_name}
                />
              )}
            </div>

            {/* 文件名 */}
            <span className="text-xs text-gray-300 truncate w-full text-center">
              {file.file_name}
            </span>

            {/* 悬浮操作按钮 */}
            <div className="absolute top-1 right-1 hidden group-hover:flex items-center space-x-0.5">
              {file.type !== MediaFileType.DIR && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(file);
                  }}
                >
                  <Download className="h-3 w-3"/>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateFileName(file);
                }}
              >
                <Edit className="h-3 w-3"/>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(file);
                }}
              >
                <Trash className="h-3 w-3"/>
              </Button>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="load-more-trigger flex justify-center p-4">
          <Loader className="h-6 w-6 animate-spin text-[#43ABFF]"/>
        </div>
      )}
    </div>
  );
};

interface Props {
  onChangeDir: (currentDir: FileItem, isUploadOrder: boolean) => void;
}

const MediaDataTable = ({onChangeDir}: Props) => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

  const {get} = useAjax();
  const navigate = useNavigate();
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [displayType, setDisplayType] = useState<0 | 1>(0);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [date, setDate] = useState<Date[] | undefined>(undefined);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [queryParams, setQueryParams] = useState({
    types: [] as number[],
    payloads: [] as string[],
    begin_time: "",
    end_time: "",
    search: "",
    parent: 0,
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize
  });

  useEffect(() => {
    setQueryParams(prev => ({
      ...prev,
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize
    }));
  }, [pagination]);

  const updateQuery = useCallback((updates: Partial<typeof queryParams>) => {
    setQueryParams(prev => ({
      ...prev,
      ...updates,
      page: 1
    }));
    setPagination(prev => ({
      ...prev,
      pageIndex: 0
    }));
  }, []);

  const {data, mutate} = useMediaList(workspaceId, queryParams);

  const {
    setName,
    name,
    createDir,
    removeFile,
    moveFile,
    updateFile,
  } = useDirectory(() => mutate());

  const addDownloadingId = (id: string) => {
    setDownloadingIds(prev => new Set(prev).add(id));
  };

  const removeDownloadingId = (id: string) => {
    setDownloadingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // 添加面包屑状态
  const [breadcrumbList, setBreadcrumbList] = useState<Partial<FileItem>[]>([
    {
      id: 0,
      file_name: "全部文件夹",
      type: MediaFileType.DIR
    }
  ]);

  // 创建工单面板控制
  const [createOrderVisible, setCreateOrderVisible] = useState(false);

  const onClickCreateOrder = () => {
    const selections = table.getSelectedRowModel().rows.map(item => item.original.type);
    if (selections.includes(MediaFileType.DIR)) {
      return toast({
        description: "请选择正确的文件类型",
        variant: "warning"
      });
    }
    setCreateOrderVisible(true);
  };

  useEffect(() => {
    createOrderVisible ? onChangeDir?.(breadcrumbList[breadcrumbList.length - 1] as FileItem, true)
      : onChangeDir?.(breadcrumbList[breadcrumbList.length - 1] as FileItem, false);
  }, [breadcrumbList, createOrderVisible]);

  // 修改 onClickFolder 函数，添加面包屑处理
  const onClickFolder = (file: Partial<FileItem>) => {
    if (file.type === MediaFileType.DIR) {
      // 重置数据
      setAllItems([]);

      updateQuery({
        parent: file.id || 0,
        page: 1
      });
      setPagination(prev => ({
        ...prev,
        pageIndex: 0
      }));

      // 更新面包屑
      if (file.id === 0) {
        // 点击"全部文件夹"，重置为初始状态
        setBreadcrumbList([{
          id: 0,
          file_name: "全部文件夹",
          type: MediaFileType.DIR
        }]);
      } else {
        // 如果点击的是已存在的面包屑项
        const existingIndex = breadcrumbList.findIndex(item => item.id === file.id);
        if (existingIndex !== -1) {
          // 截取到当前点击项
          setBreadcrumbList(breadcrumbList.slice(0, existingIndex + 1));
        } else {
          // 添加新的面包屑项
          setBreadcrumbList(prev => [...prev, file]);
        }
      }
    }
  };

  const onDeleteFile = async (file: FileItem) => {
    try {
      await removeFile({ids: [file.id]});
      toast({
        description: "删除文件成功"
      });
      await mutate();
    } catch (err) {
      toast({
        description: "删除文件失败",
        variant: "destructive"
      });
    }
  };

  const [inputName, setInputName] = useState("");
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const onUpdateFileName = async (file: FileItem) => {
    try {
      await updateFile({
        id: file.id,
        name: inputName
      });
      toast({
        description: "更新文件成功"
      });
      setIsEditDialogOpen(false);
      await mutate();
    } catch (err) {
      toast({
        description: "重命名失败",
        variant: "destructive"
      });
    }
  };

  const columns: ColumnDef<FileItem>[] = useMemo(() => [
    {
      id: "id",
      header: ({table}) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className={cn(
            "border-[#43ABFF] data-[state=checked]:bg-[#43ABFF]",
            "h-4 w-4",
            "transition-colors duration-200"
          )}
        />
      ),
      cell: ({row}) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className={cn(
            "border-[#43ABFF] data-[state=checked]:bg-[#43ABFF]",
            "h-4 w-4",
            "transition-colors duration-200"
          )}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "file_name",
      header: "文件名",
      cell: ({row}) => {
        const current = row.original;
        const fileType = current.type;
        const isDir = fileType === MediaFileType.DIR;
        const isVideo = fileType === MediaFileType.VIDEO ||
          (fileType === MediaFileType.MANUAL && getMediaType(current.preview_url) === "video");
        const isPhoto = fileType !== MediaFileType.ZIP && fileType !== MediaFileType.VIDEO
          && fileType !== MediaFileType.DIR && getMediaType(current.preview_url) === "image";

        return (
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onClickFolder(current)}>
            {isDir && <FolderClosed className={"w-4 h-4"} fill={"orange"}/>}

            {isVideo && current.preview_url && (
              <HoverCard>
                <HoverCardTrigger>
                  <div className="relative w-4 h-4">
                    <video
                      src={current.preview_url}
                      className="w-full h-full object-cover rounded"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent side={"right"} className="w-80 p-0">
                  <video
                    src={current.preview_url}
                    className="w-full rounded"
                    controls
                    autoPlay
                    loop
                    muted
                  />
                </HoverCardContent>
              </HoverCard>
            )}

            {isPhoto && current.preview_url && (
              <HoverCard>
                <HoverCardTrigger>
                  <img
                    src={current.preview_url}
                    alt={current.file_name}
                    className="w-4 h-4 object-cover rounded border-2"
                  />
                </HoverCardTrigger>
                <HoverCardContent side={"right"} className="w-80 p-0">
                  <img
                    src={current.preview_url}
                    alt={current.file_name}
                    className="w-full rounded"
                  />
                </HoverCardContent>
              </HoverCard>
            )}

            <span>{current.file_name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "drone",
      header: "飞行器",
      cell: ({row}) => <div>
        {row.original.drone || "--"}
      </div>
    },
    {
      accessorKey: "payload",
      header: "负载类型",
      cell: ({row}) => <div>
        {row.original.payload || "--"}
      </div>
    },
    {
      accessorKey: "size",
      header: "大小",
      cell: ({row}) => <div>
        {row.original.size || "--"}
      </div>
    },
    {
      accessorKey: "create_time",
      header: "创建时间",
    },
    {
      header: "操作",
      cell: ({row}) => {
        const isDownloading = downloadingIds.has(row.original.file_id);
        return (
          <div className={"flex items-center space-x-2"}>
            {row.original.type !== MediaFileType.DIR && <PermissionButton
              permissionKey={"Collection_MediaDownload"}
              className={`flex items-center px-0 bg-transparent h-4 ${isDownloading ? "opacity-50" : "cursor-pointer hover:opacity-80"}`}
              onClick={() => {
                if (!isDownloading) {
                  downloadMediaFile(workspaceId, row.original.file_id, row.original.file_name);
                }
              }}
            >
              {isDownloading ? (
                <Loader className="h-4 w-4 animate-spin"/>
              ) : (
                <Download size={18}/>
              )}
            </PermissionButton>}
            <PermissionButton
              permissionKey={"Collection_MediaOperation"}
              className={"bg-transparent h-4 px-0"}
              onClick={() => {
                setEditingFile(row.original);
                setInputName(row.original.file_name);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit
                className="hover:opacity-80"
                size={18}
              />
            </PermissionButton>

            <Dialog>
              <DialogTrigger asChild>
                <PermissionButton
                  className={"bg-transparent h-4 px-0"}
                  permissionKey={"Collection_MediaOperation"}
                >
                  <Trash className={"hover:opacity-80"} size={18}/>
                </PermissionButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>删除文件</DialogTitle>
                </DialogHeader>
                <div>确认删除文件吗？</div>
                <DialogFooter>
                  <DialogClose>
                    <Button onClick={() => onDeleteFile(row.original)}>确认</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      }
    }
  ], []);

  const table = useReactTable({
    data: data?.list ?? [],
    columns,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    pageCount: Math.ceil((data?.pagination.total || 0) / pagination.pageSize),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  const downloadMediaFile = async (workspaceId: string, fileId: string, fileName: string) => {
    try {
      addDownloadingId(fileId);
      const url = `${MEDIA_HTTP_PREFIX}/files/${workspaceId}/file/${fileId}/url`;
      const result: any = await get(url, {}, {responseType: "blob"});
      if (!result.data) return;

      if (result.data.type === "application/json") {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          const result = JSON.parse(text);
          toast({
            description: result.data.message,
            variant: "destructive"
          });
        };
        reader.readAsText(result.data, "utf-8");
      } else {
        const data = new Blob([result.data]);
        downloadFile(data, fileName);
      }
    } finally {
      removeDownloadingId(fileId);
    }
  };

  const getSelectedFileIds = (): number[] => {
    return table.getSelectedRowModel().rows.map(row => row.original.id);
  };

  const [selectMoveDirId, setSelectMoveDirId] = useState(0);

  const handleBatchDelete = async () => {
    const selectedIds = getSelectedFileIds();
    if (selectedIds.length === 0) {
      toast({
        description: "请选择要删除的文件",
        variant: "destructive"
      });
      return;
    }

    try {
      await removeFile({ids: selectedIds});
      toast({
        description: "删除文件成功"
      });
      table.resetRowSelection();
      await mutate();
    } catch (err) {
      toast({
        description: "删除文件失败",
        variant: "destructive"
      });
    }
  };

  const handleBatchMove = async () => {
    if (selectMoveDirId === 0) return toast({
      description: "请选择文件夹",
      variant: "destructive"
    });
    const selectedIds = getSelectedFileIds();
    if (selectedIds.length === 0) {
      toast({
        description: "请选择要移动的文件",
        variant: "destructive"
      });
      return;
    }
    try {
      await moveFile({
        ids: selectedIds,
        target_dir_id: selectMoveDirId
      });
      toast({
        description: "移动文件成功"
      });
      table.resetRowSelection();
      setSelectMoveDirId(0);
      await mutate();
    } catch (err) {
      toast({
        description: "移动文件失败",
        variant: "destructive"
      });
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const [allItems, setAllItems] = useState<FileItem[]>([]);

  useEffect(() => {
    // 切换显示类型时，重置所有状态
    setAllItems([]); // 清空列表
    setPagination({
      pageIndex: 0,
      pageSize: displayType === 0 ? 10 : 30
    });
    // 重置查询参数
    setQueryParams(prev => ({
      ...prev,
      page: 1,
      page_size: displayType === 0 ? 10 : 30
    }));
  }, [displayType]);

  useEffect(() => {
    if (data?.list && displayType === 1) {
      if (pagination.pageIndex === 0) {
        // 如果是第一页，直接设置数据
        setAllItems(data.list);
      } else {
        // 如果是加载更多，追加数据
        setAllItems(prev => [...prev, ...data.list]);
      }
    }
  }, [data?.list, displayType]);

  const loadMore = useCallback(() => {
    if (displayType === 1 && !isLoading && data?.pagination.total > allItems.length) {
      setPagination(prev => ({
        ...prev,
        pageIndex: prev.pageIndex + 1
      }));
      setQueryParams(prev => ({
        ...prev,
        page: pagination.pageIndex + 2 // 因为 pageIndex 是从 0 开始的
      }));
    }
  }, [displayType, isLoading, data?.pagination.total, allItems.length, pagination.pageIndex]);

  useBatchFinishListener(async () => {
    await mutate();
  });

  const pic_list_origin = useMemo(() =>
    table.getSelectedRowModel().rows.map(row => row.original.object_key), [rowSelection]);
  const pic_list = useMemo(() =>
    table.getSelectedRowModel().rows.map(row => row.original.preview_url), [rowSelection]);
  const longitude = useMemo(() =>
    table.getSelectedRowModel().rows[0]?.original.longitude || "0.0", [rowSelection]);
  const latitude = useMemo(() =>
    table.getSelectedRowModel().rows[0]?.original.latitude || "0.0", [rowSelection]);
  const currentOrder: Partial<WorkOrder> = useMemo(() => ({
    name: "",
    found_time: dayjs().valueOf(),
    order_type: 0,
    address: "",
    contact: "",
    contact_phone: "",
    longitude: parseFloat(longitude) || 0.0,
    latitude: parseFloat(latitude) || 0.0,
    pic_list,
    description: "",
    warning_level: 1,
    pic_list_origin,
  }), [pic_list_origin, pic_list, longitude, latitude]);

  const {loadMedia} = useMapLoadMedia();

  const onLoadMap = useCallback(async () => {
    const files = table.getSelectedRowModel().rows.map(row => row.original);
    const canLoad = !files.find(file => [MediaFileType.DIR, MediaFileType.ZIP, MediaFileType.VIDEO, MediaFileType.MANUAL].includes(file.type));
    if (!canLoad) return toast({
      description: "请选择正确的文件类型",
      variant: "warning"
    });
    const ids = getSelectedFileIds();
    try {
      await loadMedia({ids});
      toast({
        description: "地图加载图片成功"
      });
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  }, [rowSelection]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbList.map((file, index) => (
                <BreadcrumbItem key={file.id}>
                  <BreadcrumbLink
                    onClick={() => onClickFolder(file)}
                    className={cn(
                      "text-gray-400 hover:text-gray-300",
                      index === breadcrumbList.length - 1
                        ? "cursor-default pointer-events-none"
                        : "cursor-pointer"
                    )}
                  >
                    {file.file_name}
                  </BreadcrumbLink>
                  {index < breadcrumbList.length - 1 && <BreadcrumbSeparator/>}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center space-x-2">
          <div className={"flex items-center space-x-2 whitespace-nowrap"}>
            <span>日期</span>
            <NewCommonDateRangePicker date={date} setDate={(date) => {
              setDate(date);
              updateQuery({
                begin_time: date ? dayjs(date[0]).format("YYYY-MM-DD HH:mm:ss") : "",
                end_time: date ? dayjs(date[1]).format("YYYY-MM-DD 23:59:59") : ""
              });
            }} className={"bg-[#0A81E1] border-[#0A81E1] hover:bg-[#0A81E1] h-[36px]"}/>
          </div>
          <div className={"flex items-center space-x-2"}>
            <span>文件类型</span>
            <Select onValueChange={(value) => updateQuery({
              types: value === "all" ? [] : [+value]
            })}>
              <SelectTrigger className="w-[120px] h-[36px] bg-[#0A81E1]/70 border-[#0A81E1]">
                <SelectValue placeholder="所有类型"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"all"}>所有类型</SelectItem>
                {Object.keys(MediaFileMap).map(item =>
                  <SelectItem value={item} key={item}>{MediaFileMap[item]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className={"flex items-center space-x-2"}>
            <span>负载类型</span>
            <Select onValueChange={(value) => updateQuery({
              payloads: value === "all" ? [] : [value]
            })}>
              <SelectTrigger className="w-[120px] h-[36px] bg-[#0A81E1]/70 border-[#0A81E1]">
                <SelectValue placeholder="所有类型"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"all"}>所有负载</SelectItem>
                {Object.values(CameraType).map(item =>
                  <SelectItem value={item} key={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {getSelectedFileIds().length > 0 && <>
            <Dialog>
              <DialogTrigger disabled={table.getSelectedRowModel().rows.length === 0}>
                <PermissionButton
                  permissionKey={"Collection_MediaOperation"}
                  disabled={table.getSelectedRowModel().rows.length === 0}
                  className="bg-[#43ABFF] hover:bg-[#43ABFF]/90 h-[36px]"
                >
                  删除
                </PermissionButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>删除文件</DialogTitle>
                </DialogHeader>
                <div>
                  确认删除文件吗？
                </div>
                <DialogFooter>
                  <DialogClose>
                    <Button type={"button"} onClick={handleBatchDelete}>确认</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger disabled={table.getSelectedRowModel().rows.length === 0}>
                <PermissionButton
                  permissionKey={"Collection_MediaOperation"}
                  disabled={table.getSelectedRowModel().rows.length === 0}
                  className="bg-[#43ABFF] hover:bg-[#43ABFF]/90 h-[36px]"
                >
                  移动
                </PermissionButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>移动文件</DialogTitle>
                </DialogHeader>
                <DirTree onSelect={(id) => setSelectMoveDirId(id)}/>
                <DialogFooter>
                  <DialogClose>
                    <Button onClick={handleBatchMove} type={"button"}>确认</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={createOrderVisible} onOpenChange={setCreateOrderVisible}>
              <PermissionButton
                permissionKey={"Button_CreateTicket"}
                onClick={onClickCreateOrder}
                className={"bg-[#43ABFF] w-24 h-[36px]"}
              >
                创建工单
              </PermissionButton>
              <DialogContent className="max-w-screen-lg bg-[#0A4088]/[.7] text-white border-none">
                <DialogHeader className={""}>
                  <DialogTitle>创建工单</DialogTitle>
                </DialogHeader>
                <div className={"border-[2px] border-[#43ABFF] flex p-8 border-opacity-35 rounded-lg"}>
                  <CreateOrder
                    onSuccess={() => {
                      setCreateOrderVisible(false);
                      navigate("/work-order");
                    }}
                    type={"form-media"}
                    currentOrder={currentOrder as WorkOrder}/>
                </div>
                <DialogFooter>
                  <Button form={"createOrderForm"} className="bg-[#43ABFF] w-24" type="submit">确认</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <PermissionButton
              permissionKey={"Collection_MediaVisual"}
              className={"bg-[#43ABFF] hover:bg-[#43ABFF]/90 h-[36px]"}
              onClick={onLoadMap}>
              地图加载
            </PermissionButton>
          </>}
          <PermissionButton permissionKey={"Collection_MediaUpload"} className={"bg-[#43ABFF] h-[36px]"}>
            <UploadButton>
              上传文件
            </UploadButton>
          </PermissionButton>
          <Dialog>
            <DialogTrigger asChild>
              <PermissionButton
                permissionKey={"Collection_MediaOperation"}
                className="bg-[#43ABFF] hover:bg-[#43ABFF]/90 h-[36px]"
              >
                创建文件夹
              </PermissionButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建文件夹</DialogTitle>
              </DialogHeader>
              <div className={"grid grid-cols-6 items-center gap-4"}>
                <span className={"text-right"}>名称</span>
                <Input defaultValue={name}
                       onChange={(e) => setName(e.target.value)} className={"col-span-5"}/>
              </div>
              <DialogFooter>
                <DialogClose>
                  <Button onClick={() => createDir({
                    name,
                    parent: breadcrumbList[breadcrumbList.length - 1].id || 0
                  })}>确认</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <SquareMenu onClick={() => setDisplayType(0)} size={18} color={displayType === 0 && "#1997e6" || "white"}
                      className={cn("cursor-pointer")}/>
          <Grid3X3 onClick={() => setDisplayType(1)} size={18} color={displayType === 1 && "#1997e6" || "white"}
                   className={"cursor-pointer"}/>
        </div>
      </div>

      <div className="rounded-md border border-[#0A81E1] overflow-hidden bg-[#0A4088]/70">
        {displayType === 0 ? (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-[#0A81E1]">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="bg-[#0A81E1]/70 text-white h-10 font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="bg-[#0A4088]/70">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "h-[50px]",
                      "border-b border-[#0A81E1]/30",
                      "hover:bg-[#0A4088]/90 transition-colors duration-200",
                      "data-[state=selected]:bg-transparent"
                    )}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-3",
                          "align-middle",
                          "px-4",
                          "leading-none"
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-[#43ABFF]"
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <InfiniteGridView
            data={allItems}
            hasMore={(data?.pagination.total || 0) > allItems.length}
            onLoadMore={loadMore}
            onClickFolder={onClickFolder}
            onDownload={async (file) => {
              addDownloadingId(file.id.toString());
              try {
                await downloadMediaFile(workspaceId, file.file_id, file.file_name);
              } finally {
                removeDownloadingId(file.id.toString());
              }
            }}
            onUpdateFileName={onUpdateFileName}
            onDeleteFile={onDeleteFile}
          />
        )}
      </div>

      {displayType === 0 && (
        <div className="flex items-center justify-between py-2">
          <Label className="text-gray-400">
            共 {data?.pagination.total || 0} 条记录，共 {Math.ceil((data?.pagination.total || 0) / pagination.pageSize)} 页
          </Label>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-[#43ABFF] text-[#43ABFF] hover:bg-[#43ABFF]/10"
            >
              上一页
            </Button>
            <Button
              variant="outline"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-[#43ABFF] text-[#43ABFF] hover:bg-[#43ABFF]/10"
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 重命名对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名</DialogTitle>
            <div className="grid grid-cols-6 items-center gap-4">
              <span className="text-right">名称</span>
              <Input
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="col-span-5"
              />
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => editingFile && onUpdateFileName(editingFile)}
              type="submit"
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaDataTable;

