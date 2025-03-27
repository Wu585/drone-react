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
import {useMemo, useState, useRef, useEffect, useCallback} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {downloadFile, FileItem, MEDIA_HTTP_PREFIX, useMediaList} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Download, Edit, FolderClosed, Grid3X3, Loader, SquareMenu, Trash, Play} from "lucide-react";
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
import Uploady from "@rpldy/uploady";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import NewCommonDateRangePicker from "@/components/public/NewCommonDateRangePicker.tsx";
import dayjs from "dayjs";

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
              ) : file.type === MediaFileType.VIDEO ? (
                <div className="relative w-full h-full">
                  <video
                    src={file.preview_url}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <Play className="w-6 h-6 text-white"/>
                  </div>
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

const MediaDataTable = () => {
  const {get} = useAjax();
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [displayType, setDisplayType] = useState<0 | 1>(0);

  const [breadcrumbList, setBreadcrumbList] = useState<Partial<FileItem>[]>([
    {
      id: 0,
      file_name: "全部文件夹",
      type: MediaFileType.DIR
    }
  ]);

  // 分开管理两种视图的分页参数
  const [listPagination, setListPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [gridPagination, setGridPagination] = useState({
    page: 1,
    pageSize: 30,
  });

  // 合并查询参数
  const [queryParams, setQueryParams] = useState({
    types: [] as number[],
    payloads: [] as string[],
    begin_time: "",
    end_time: "",
    parent: 0,
  });

  // 根据当前视图类型获取正确的分页参数
  const getCurrentPagination = () => {
    if (displayType === 0) {
      return {
        page: listPagination.pageIndex + 1,
        page_size: listPagination.pageSize,
      };
    }
    return {
      page: gridPagination.page,
      page_size: gridPagination.pageSize,
    };
  };

  // 使用 SWR 获取数据
  const {data, mutate} = useMediaList(workspaceId, {
    ...getCurrentPagination(),
    ...queryParams,
  });

  const {
    setName,
    name,
    createDir,
    removeFile,
    moveFile,
    updateFile,
    updateName,
    setUpdateName
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

  // 点击文件夹时更新 parent
  const onClickFolder = (file: Partial<FileItem>) => {
    if (file.type === MediaFileType.DIR) {
      setQueryParams(prev => ({
        ...prev,
        parent: file.id || 0,
        page: 1
      }));
      setListPagination(prev => ({
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

  // 搜索文件
  const onSearch = (value: string) => {
    setQueryParams(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
    setListPagination(prev => ({
      ...prev,
      pageIndex: 0
    }));
  };

  // 过滤文件类型
  const onFilterType = (type: string) => {
    setQueryParams(prev => ({
      ...prev,
      type,
      page: 1
    }));
    setListPagination(prev => ({
      ...prev,
      pageIndex: 0
    }));
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

  const onUpdateFileName = async (file: FileItem) => {
    try {
      await updateFile({
        id: file.id,
        name: updateName
      });
      toast({
        description: "更新文件成功"
      });
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
        const isVideo = fileType === MediaFileType.VIDEO;
        const isPhoto = fileType !== MediaFileType.ZIP && fileType !== MediaFileType.VIDEO && fileType !== MediaFileType.DIR;

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
            {row.original.type !== MediaFileType.DIR && <span
              className={`flex items-center ${isDownloading ? "opacity-50" : "cursor-pointer hover:opacity-80"}`}
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
            </span>}
            <Dialog>
              <DialogTrigger asChild>
                <Edit
                  className="cursor-pointer hover:opacity-80"
                  size={18}
                />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>重命名</DialogTitle>
                  <div className="grid grid-cols-6 items-center gap-4">
                    <span className="text-right">名称</span>
                    <Input
                      value={updateName}
                      onChange={(e) => setUpdateName(e.target.value)}
                      className="col-span-5"
                    />
                  </div>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose>
                    <Button onClick={() => onUpdateFileName(row.original)} type="submit">确认</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Trash className={"cursor-pointer hover:opacity-80"} size={18}/>
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
    data: data?.list ?? fallbackData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setListPagination,
    manualPagination: true,
    rowCount: data?.pagination.total,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: listPagination,
    },
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

  // 获取选中的文件 ID 数组
  const getSelectedFileIds = (): number[] => {
    return table.getSelectedRowModel().rows.map(row => row.original.id);
  };

  const [selectMoveDirId, setSelectMoveDirId] = useState(0);

  // 批量删除示例
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
      // 清除选中状态
      table.resetRowSelection();
      await mutate();
    } catch (err) {
      toast({
        description: "删除文件失败",
        variant: "destructive"
      });
    }
  };

  // 批量移动示例
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
      // 清除选中状态
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

  const [date, setDate] = useState<Date[] | undefined>(undefined);


  // 添加一个状态记录所有加载的数据
  const [allItems, setAllItems] = useState<FileItem[]>([]);

  // 监听显示类型变化
  useEffect(() => {
    // 切换视图时重置状态
    setAllItems([]); // 清空已加载的数据
    if (displayType === 0) {
      setListPagination({pageIndex: 0, pageSize: 10});
    } else {
      setGridPagination({page: 1, pageSize: 30});
    }
  }, [displayType]);

  // 更新网格视图数据
  useEffect(() => {
    if (data?.list && displayType === 1) {
      if (gridPagination.page === 1) {
        setAllItems(data.list);
      } else {
        setAllItems(prev => [...prev, ...data.list]);
      }
    }
  }, [data?.list, displayType, gridPagination.page]);

  // 加载更多数据
  const loadMore = useCallback(() => {
    if (displayType === 1 && !isLoading) {
      setGridPagination(prev => ({
        ...prev,
        page: prev.page + 1
      }));
    }
  }, [displayType, isLoading]);

  // 处理查询参数变化
  const handleQueryChange = useCallback((newParams: Partial<typeof queryParams>) => {
    setQueryParams(prev => ({
      ...prev,
      ...newParams,
    }));

    // 重置分页
    if (displayType === 0) {
      setListPagination({pageIndex: 0, pageSize: 10});
    } else {
      setGridPagination({page: 1, pageSize: 30});
      setAllItems([]); // 清空已加载数据
    }
  }, [displayType]);

  return (
    <Uploady>
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
            {/* 显示选中数量 */}
            {/*{table.getSelectedRowModel().rows.length > 0 && (
              <span className="text-gray-400">
                已选择 {table.getSelectedRowModel().rows.length} 项
              </span>
            )}*/}
            {/* 批量操作按钮 */}
            <div className={"flex items-center space-x-2 whitespace-nowrap"}>
              <span>日期</span>
              <NewCommonDateRangePicker date={date} setDate={(date) => {
                console.log("date==");
                console.log(date);
                setDate(date);
                if (!date || date.length !== 2) {
                  setQueryParams(prevState => ({
                    ...prevState,
                    page: 1,
                    page_size: 10,
                    begin_time: "",
                    end_time: "",
                  }));
                } else {
                  setQueryParams(prevState => ({
                    ...prevState,
                    page: 1,
                    page_size: 10,
                    begin_time: dayjs(date[0]).format("YYYY-MM-DD HH:mm:ss"),
                    end_time: dayjs(date[1]).format("YYYY-MM-DD HH:mm:ss"),
                  }));
                }
              }} className={"bg-[#0A81E1]/70 border-[#0A81E1] hover:bg-[#0A81E1]/70 "}/>
            </div>
            <div className={"flex items-center space-x-2"}>
              <span>文件类型</span>
              <Select onValueChange={(value) => handleQueryChange({
                types: value === "all" ? [] : [+value]
              })}>
                <SelectTrigger className="w-[180px] bg-[#0A81E1]/70 border-[#0A81E1]">
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
              <Select onValueChange={(value) => setQueryParams(prevState => ({
                ...prevState,
                payloads: value === "all" ? [] : [value],
                page: 1,
                page_size: 10
              }))}>
                <SelectTrigger className="w-[180px] bg-[#0A81E1]/70 border-[#0A81E1]">
                  <SelectValue placeholder="所有类型"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"all"}>所有负载</SelectItem>
                  {Object.values(CameraType).map(item =>
                    <SelectItem value={item} key={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Dialog>
              <DialogTrigger disabled={table.getSelectedRowModel().rows.length === 0}>
                <Button
                  disabled={table.getSelectedRowModel().rows.length === 0}
                  className="bg-[#43ABFF] hover:bg-[#43ABFF]/90"
                >
                  删除
                </Button>
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
                <Button
                  // onClick={() => handleBatchMove(86)} // 这里的 86 替换为实际的目标文件夹 ID
                  disabled={table.getSelectedRowModel().rows.length === 0}
                  className="bg-[#43ABFF] hover:bg-[#43ABFF]/90"
                >
                  移动
                </Button>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#43ABFF] hover:bg-[#43ABFF]/90">创建文件夹</Button>
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
              共 {data?.pagination.total || 0} 条记录，共 {table.getPageCount()} 页
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
      </div>
    </Uploady>
  );
};

export default MediaDataTable;

