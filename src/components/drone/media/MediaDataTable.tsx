import {ColumnDef, PaginationState,} from "@tanstack/react-table";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {FileItem, MEDIA_HTTP_PREFIX, useMediaList, WorkOrder} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {Button} from "@/components/ui/button.tsx";
import {Download, Edit, Eye, FolderClosed, Grid3X3, Loader, SquareMenu, Trash} from "lucide-react";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import {CameraType, MediaFileMap, MediaFileType, useDirectory} from "@/hooks/drone/media";
import {useBatchFinishListener} from "@rpldy/uploady";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";
import {cn} from "@/lib/utils.ts";
import DirTree from "@/components/drone/media/DirTree.tsx";
import dayjs from "dayjs";
import CreateOrder from "@/components/drone/work-order/CreateOrder.tsx";
import UploadButton from "@rpldy/upload-button";
import {getMediaType} from "@/hooks/drone/order";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useMapLoadMedia} from "@/hooks/drone/map-photo";
import {MediaPreview} from "@/components/drone/MediaPreview.tsx";
import {CommonDateRange} from "@/components/drone/public/CommonDateRange.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import {CommonSelect} from "@/components/drone/public/CommonSelect.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import {CommonTable, ReactTableInstance} from "@/components/drone/public/CommonTable.tsx";
import {IconButton} from "@/components/drone/public/IconButton.tsx";
import CommonDialog from "@/components/drone/public/CommonDialog.tsx";
import CommonAlertDialog from "@/components/drone/public/CommonAlertDialog.tsx";

const InfiniteGridView = ({
                            data,
                            hasMore,
                            onLoadMore,
                            onClickFolder,
                            onUpdateFileName,
                            onDeleteFile
                          }: {
  data: FileItem[];
  hasMore: boolean;
  onLoadMore: () => void;
  onClickFolder: (file: Partial<FileItem>) => void;
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
    <div ref={containerRef} className="h-[calc(100vh-300px)] overflow-y-auto bg-[#1E3762]/70 rounded">
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
              ) : getMediaType(file.preview_url) === "video" ? (
                <MediaPreview src={file.preview_url}
                              type="video"
                              alt="Example Video"
                              modalWidth="70vw"
                              modalHeight="70vh"
                              triggerElement={<div
                                className="relative w-full aspect-square flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
                                <video
                                  muted
                                  src={file.preview_url}
                                  className="max-h-full max-w-full object-fill"
                                />
                              </div>}
                />
              ) : (
                <MediaPreview src={file.preview_url}
                              type="image"
                              alt="Example Image"
                              modalWidth="900px"
                              modalHeight="600px"
                              triggerElement={
                                <div
                                  className="relative w-full aspect-square flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
                                  <img
                                    src={file.preview_url}
                                    className="object-contain rounded-lg border-2 p-4"
                                    alt={file.file_name}
                                  />
                                </div>
                              }
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
                <Button size="icon"
                        variant="ghost"
                        className="h-6 w-6">
                  <a href={file.preview_url} download>
                    <Download className="h-3 w-3"/>
                  </a>
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
                size="icon"
                variant="ghost"
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
  const departId = localStorage.getItem("departId");
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const [searchParams] = useSearchParams();
  const job_id = searchParams.get("job_id");
  const {post} = useAjax();
  const navigate = useNavigate();
  const [displayType, setDisplayType] = useState<0 | 1>(0);
  const tableRef = useRef<ReactTableInstance<FileItem>>(null);

  const [selectedRows, setSelectedRows] = useState<FileItem[]>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const defaultParams = {
    types: [] as number[],
    payloads: [] as string[],
    begin_time: "",
    end_time: "",
    search: "",
    wayline_name: "",
    parent: 0,
    page: 1,
    page_size: 10,
    organ: departId ? departId : undefined,
  };

  const [queryParams, setQueryParams] = useState(defaultParams);

  const updateQuery = useCallback((updates: Partial<typeof queryParams>) => {
    setQueryParams(prev => ({
      ...prev,
      ...updates,
      page: 1
    }));
  }, []);

  // 处理分页变化
  const handlePaginationChange = (pagination: PaginationState) => {
    setQueryParams(prev => ({
      ...prev,
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize
    }));
  };

  const {data, mutate, isLoading} = useMediaList(workspaceId, queryParams);

  // 从任务页面过来的
  const {data: defaultData, isLoading: defaultIsLoading} = useMediaList(workspaceId, job_id ? {
    page: 1,
    page_size: 10,
    job_id
  } : undefined);

  const {
    setName,
    name,
    createDir,
    removeFile,
    moveFile,
    updateFile,
  } = useDirectory(() => mutate());

  // 添加面包屑状态
  const [breadcrumbList, setBreadcrumbList] = useState<Partial<FileItem>[]>([
    {
      id: 0,
      file_name: "全部文件夹",
      type: MediaFileType.DIR
    }
  ]);

  useEffect(() => {
    if (!defaultData) return;
    updateQuery({parent: defaultData.list?.[0]?.id});
    setBreadcrumbList([...breadcrumbList, {
      id: 660,
      file_name: defaultData.list?.[0]?.file_name,
      type: MediaFileType.DIR
    }]);
  }, [defaultData, updateQuery]);

  // 创建工单面板控制
  const [createOrderVisible, setCreateOrderVisible] = useState(false);

  const onClickCreateOrder = () => {
    const selections = selectedRows.map(item => item.type);
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
    tableRef.current?.resetRowSelection();
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
        updateQuery({
          parent: 0,
        });
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
      const canLoad = !selectedRows.find(file => [MediaFileType.DIR, MediaFileType.ZIP, MediaFileType.VIDEO, MediaFileType.MANUAL].includes(file.type));
      if (canLoad) {
        await post(`${MEDIA_HTTP_PREFIX}/files/${workspaceId}/cancelMap`, {
          ids: [file.id]
        });
      }
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
        name: inputName,
        organ: departId ? +departId : undefined
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
      accessorKey: "file_name",
      header: "文件名",
      size: 240,
      cell: ({row}) => {
        const current = row.original;
        const fileType = current.type;
        const isDir = fileType === MediaFileType.DIR;

        return (
          <div
            className="cursor-pointer flex items-center gap-1 min-w-0"
            onClick={() => onClickFolder(current)}
            title={row.original.file_name}
          >
            {isDir && <FolderClosed size={16} fill={"orange"} className="flex-shrink-0"/>}
            <span className="truncate">{row.original.file_name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "wayline_name",
      header: "航线名称",
      size: 180,
      cell: ({row}) => <div className={"truncate"} title={row.original.wayline_name || "--"}>
        {row.original.wayline_name || "--"}
      </div>
    },
    {
      accessorKey: "drone",
      header: "飞行器",
      size: 160,
      cell: ({row}) => <div className={"truncate"} title={row.original.drone || "--"}>
        {row.original.drone || "--"}
      </div>
    },
    {
      accessorKey: "payload",
      header: "负载类型",
      size: 100,
      cell: ({row}) => <div className={"truncate"} title={row.original.payload || "--"}>
        {row.original.payload || "--"}
      </div>
    },
    {
      accessorKey: "size",
      header: "大小",
      size: 80,
      cell: ({row}) => <div>
        {row.original.size || "--"}
      </div>
    },
    {
      accessorKey: "create_time",
      header: "创建时间",
      size: 140,
      cell: ({row}) => <div className={"truncate"} title={row.original.create_time || "--"}>
        {row.original.create_time || "--"}
      </div>
    },
    {
      header: "操作",
      cell: ({row}) => {
        const isDir = row.original.type === MediaFileType.DIR;
        return (
          <div className={"flex items-center space-x-2"}>
            {!isDir && getMediaType(row.original.preview_url) === "image" &&
              <MediaPreview src={row.original.preview_url}
                            type="image"
                            alt="Example Image"
                            modalWidth="900px"
                            modalHeight="600px"
                            triggerElement={
                              <IconButton>
                                <Eye size={18}/>
                              </IconButton>
                            }
              />}
            {!isDir && getMediaType(row.original.preview_url) === "video" &&
              <MediaPreview src={row.original.preview_url}
                            type="video"
                            alt="Example Video"
                            modalWidth="70vw"
                            modalHeight="70vh"
                            triggerElement={
                              <IconButton>
                                <Eye size={18}/>
                              </IconButton>}
              />}
            {row.original.type !== MediaFileType.DIR && <IconButton
              permissionKey={"Collection_MediaDownload"}
            >
              <a href={row.original.preview_url} download>
                <Download size={18}/>
              </a>
            </IconButton>}
            <IconButton
              permissionKey={"Collection_MediaOperation"}
              onClick={() => {
                setEditingFile(row.original);
                setInputName(row.original.file_name);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit size={18}/>
            </IconButton>

            <CommonAlertDialog
              title={"删除文件"}
              trigger={
                <IconButton permissionKey={"Collection_MediaOperation"}>
                  <Trash size={18}/>
                </IconButton>
              }
              description={"删除后地图加载图片也会同步删除，确认删除吗？"}
              onConfirm={() => onDeleteFile(row.original)}
            />
          </div>
        );
      }
    }
  ], []);

  const getSelectedFileIds = selectedRows.map(row => row.id);

  const [selectMoveDirId, setSelectMoveDirId] = useState(0);

  const handleBatchDelete = async () => {
    if (getSelectedFileIds.length === 0) {
      toast({
        description: "请选择要删除的文件",
        variant: "destructive"
      });
      return;
    }

    try {
      await removeFile({ids: getSelectedFileIds});
      toast({
        description: "删除文件成功"
      });
      tableRef.current?.resetRowSelection();
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
    if (getSelectedFileIds.length === 0) {
      toast({
        description: "请选择要移动的文件",
        variant: "destructive"
      });
      return;
    }
    try {
      await moveFile({
        ids: getSelectedFileIds,
        target_dir_id: selectMoveDirId
      });
      toast({
        description: "移动文件成功"
      });
      tableRef.current?.resetRowSelection();
      setSelectMoveDirId(0);
      await mutate();
    } catch (err) {
      toast({
        description: "移动文件失败",
        variant: "destructive"
      });
    }
  };

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
    mutate();
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
  }, [data, displayType, pagination]);

  const loadMore = useCallback(() => {
    if (displayType === 1 && data?.pagination?.total && data.pagination.total > allItems.length) {
      setPagination(prev => ({
        ...prev,
        pageIndex: prev.pageIndex + 1
      }));
      setQueryParams(prev => ({
        ...prev,
        page: pagination.pageIndex + 2 // 因为 pageIndex 是从 0 开始的
      }));
    }
  }, [displayType, data?.pagination?.total, allItems.length, pagination.pageIndex]);

  useBatchFinishListener(async () => {
    await mutate();
  });

  const pic_list_origin = selectedRows.map(row => row.object_key);
  const pic_list = selectedRows.map(row => row.preview_url);
  const longitude = selectedRows[0]?.longitude || "0.0";
  const latitude = selectedRows[0]?.latitude || "0.0";

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
    const canLoad = !selectedRows.find(file => [MediaFileType.DIR, MediaFileType.ZIP, MediaFileType.VIDEO, MediaFileType.MANUAL].includes(file.type));
    if (!canLoad) return toast({
      description: "请选择正确的文件类型",
      variant: "warning"
    });
    try {
      await loadMedia({ids: getSelectedFileIds});
      toast({
        description: "地图加载图片成功"
      });
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  }, [selectedRows]);

  const onReset = () => {
    setQueryParams(defaultParams);
    // tableRef.current?.resetRowSelection();
    tableRef.current?.resetPagination();
    setBreadcrumbList([
      {
        id: 0,
        file_name: "全部文件夹",
        type: MediaFileType.DIR
      }
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 justify-between mb-6">
        <div
          className="col-span-4 pr-4 max-w-[50%] overflow-hidden"  // 添加 max-w 限制宽度
          title={breadcrumbList.map(file => file.file_name).join(" / ")}
        >
          <Breadcrumb className="overflow-hidden">
            <BreadcrumbList className="flex flex-nowrap overflow-hidden">
              {breadcrumbList.map((file, index) => (
                <BreadcrumbItem
                  key={file.id}
                  className="flex overflow-hidden flex-shrink min-w-0 max-w-full"  // 添加 max-w-full
                >
                  <BreadcrumbLink
                    onClick={() => onClickFolder(file)}
                    className={cn(
                      "text-gray-400 hover:text-gray-300 truncate whitespace-nowrap",  // 添加 truncate 和 whitespace-nowrap
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
        <div className="flex items-center space-x-2 col-span-8">
          <CommonDateRange
            value={{
              start: queryParams.begin_time,
              end: queryParams.end_time
            }}
            onChange={({start, end}) => updateQuery({
              begin_time: start,
              end_time: end
            })}
          />
          <CommonInput
            className={"min-w-24"}
            placeholder={"请输入航线名称"}
            value={queryParams.wayline_name}
            onChange={e => updateQuery({
              wayline_name: e.target.value
            })}
          />
          <CommonSelect
            value={queryParams.types[0]?.toString() || ""}
            placeholder={"请选择文件类型"}
            options={Object.entries(MediaFileMap).map(([key, value]) => ({
              value: key,
              label: value
            }))}
            onValueChange={(value) => updateQuery({
              types: [+value]
            })}
          />
          <CommonSelect
            value={queryParams.payloads[0]?.toString() || ""}
            placeholder={"请选择负载类型"}
            options={Object.values(CameraType).map((value) => ({
              value: value,
              label: value
            }))}
            onValueChange={(value) => updateQuery({
              payloads: [value]
            })}
          />
          <CommonButton onClick={onReset}>重置</CommonButton>
          {getSelectedFileIds.length > 0 && <>
            <CommonAlertDialog
              title={"删除文件"}
              description={"确认删除文件吗？"}
              trigger={<CommonButton
                permissionKey={"Collection_MediaOperation"}
                disabled={selectedRows.length === 0}
              >
                删除
              </CommonButton>}
              onConfirm={handleBatchDelete}
            />
            <CommonDialog
              title={"移动文件"}
              trigger={<CommonButton
                permissionKey={"Collection_MediaOperation"}
                disabled={selectedRows.length === 0}
              >
                移动
              </CommonButton>}
              onConfirm={handleBatchMove}
            >
              <DirTree onSelect={(id) => setSelectMoveDirId(id)}/>
            </CommonDialog>

            <Dialog open={createOrderVisible} onOpenChange={setCreateOrderVisible}>
              <CommonButton
                permissionKey={"Button_CreateTicket"}
                onClick={onClickCreateOrder}
              >
                创建工单
              </CommonButton>
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
            <CommonButton
              permissionKey={"Collection_MediaVisual"}
              onClick={onLoadMap}>
              地图加载
            </CommonButton>
          </>}
          <CommonButton permissionKey={"Collection_MediaUpload"}>
            <UploadButton>
              上传文件
            </UploadButton>
          </CommonButton>

          <CommonDialog
            title={"创建文件夹"}
            trigger={
              <CommonButton permissionKey={"Collection_MediaOperation"}>
                创建文件夹
              </CommonButton>}
            onConfirm={() => createDir({
              name,
              parent: breadcrumbList[breadcrumbList.length - 1].id || 0,
              organ: departId ? +departId : undefined
            })}
          >
            <div className="grid grid-cols-10 items-center">
              <span className="col-span-2">文件夹名称：</span>
              <CommonInput
                defaultValue={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-8"
              />
            </div>
          </CommonDialog>

          <CommonButton className={"bg-transparent px-0"} onClick={() => setDisplayType(0)}>
            <SquareMenu size={18} color={displayType === 0 && "#1997e6" || "white"}/>
          </CommonButton>
          <CommonButton className={"bg-transparent px-0"} onClick={() => setDisplayType(1)}>
            <Grid3X3 color={displayType === 1 && "#1997e6" || "white"} size={18}/>
          </CommonButton>
        </div>
      </div>

      {displayType === 0 ? (
        <CommonTable
          loading={job_id ? defaultIsLoading : isLoading}
          ref={tableRef}
          data={data?.list || []}
          columns={columns}
          allCounts={data?.pagination.total || 0}
          onPaginationChange={handlePaginationChange}
          enableRowSelection={true}
          onRowSelectionChange={setSelectedRows}
          getRowClassName={(_, index) => index % 2 === 1 ? "bg-[#203D67]/70" : ""}
        />
      ) : (
        <InfiniteGridView
          data={allItems}
          hasMore={(data?.pagination?.total || 0) > allItems.length}
          onLoadMore={loadMore}
          onClickFolder={onClickFolder}
          onUpdateFileName={(file) => {
            setEditingFile(file);
            setInputName(file.file_name);
            setIsEditDialogOpen(true);
          }}
          onDeleteFile={onDeleteFile}
        />
      )}

      {/* 重命名对话框 */}
      <CommonDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title={"重命名"}
        onConfirm={() => editingFile && onUpdateFileName(editingFile)}
      >
        <div className="grid grid-cols-10 items-center">
          <span className="col-span-2">文件名称：</span>
          <CommonInput
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="col-span-8"
          />
        </div>
      </CommonDialog>
    </div>
  );
};

export default MediaDataTable;

