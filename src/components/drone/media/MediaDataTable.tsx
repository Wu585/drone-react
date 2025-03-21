import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useEffect, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {downloadFile, FileItem, MEDIA_HTTP_PREFIX, useMediaList} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Download, Loader} from "lucide-react";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";

const MediaDataTable = () => {
  const {get} = useAjax();

  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

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

  const columns: ColumnDef<FileItem>[] = [
    {
      accessorKey: "file_name",
      header: "文件名",
    },
    {
      accessorKey: "file_path",
      header: "文件路径",
      cell: ({row}) => (
        <div className="max-w-[200px] truncate" title={row.getValue("file_path")}>
          {row.getValue("file_path")}
        </div>
      )
    },
    {
      accessorKey: "drone",
      header: "飞行器",
    },
    {
      accessorKey: "payload",
      header: "负载类型",
    },
    {
      accessorKey: "is_original",
      header: "原创",
      cell: ({row}) => <span>{row.original.is_original ? "是" : "否"}</span>
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
          <span
            className={`flex items-center ${isDownloading ? 'opacity-50' : 'cursor-pointer hover:opacity-80'}`}
            onClick={() => {
              if (!isDownloading) {
                downloadMediaFile(workspaceId, row.original.file_id, row.original.file_name);
              }
            }}
          >
            {isDownloading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Download size={18}/>
            )}
          </span>
        );
      }
    }
  ];

  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {data} = useMediaList(workspaceId, {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    total: 0
  });

  useEffect(() => {
    console.log("data==");
    console.log(data);
  }, [data]);

  const table = useReactTable({
    data: data?.list || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: data?.pagination.total,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: pagination,
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

  return (
    <div>
      <div className="">
        <Table className={"border-[1px] border-[#0A81E1]"}>
          <TableHeader className={""}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={"border-none"}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={"bg-[#0A81E1]/[.7]"}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className={"bg-[#0A4088]/[.7]"}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className={"border-b-[#0A81E1]"}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-[#43ABFF]">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <Label className={"text-left"}>
          共 {data?.pagination.total || 0} 条记录，共 {table.getPageCount()} 页
        </Label>
        <div className={"space-x-2"}>
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            上一页
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MediaDataTable;

