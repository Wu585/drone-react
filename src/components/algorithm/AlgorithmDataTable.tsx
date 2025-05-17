import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {eventMap} from "@/hooks/drone";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {AlgorithmConfig, useAlgorithmConfigList} from "@/hooks/drone/algorithm";
import AlgorithmDialog from "@/components/algorithm/AlgorithmDialog.tsx";

const AlgorithmDataTable = () => {
  const [open, setOpen] = useState(false);

  const columns: ColumnDef<AlgorithmConfig>[] = [
    {
      accessorKey: "algorithm_name",
      header: "算法名称",
      cell: ({row}) => (
        <div className="truncate" title={row.getValue("algorithm_name")}>
          {row.getValue("algorithm_name")}
        </div>
      )
    },
    {
      accessorKey: "contact",
      header: "联系人",
      cell: ({row}) => (
        <div className="truncate" title={row.getValue("contact")}>
          {row.getValue("contact")}
        </div>
      )
    },
    {
      accessorKey: "contact_phone",
      header: "联系电话",
      cell: ({row}) => (
        <div className="truncate" title={row.getValue("contact_phone")}>
          {row.getValue("contact_phone")}
        </div>
      )
    },
    {
      accessorKey: "order_type",
      header: "事件类型",
      cell: ({row}) => (
        <div className="truncate" title={row.getValue("order_type")}>
          {eventMap[row.getValue("order_type")]}
        </div>
      )
    },
    {
      accessorKey: "description",
      header: "事件描述",
      cell: ({row}) => (
        <div className="truncate" title={row.getValue("description")}>
          {row.getValue("description")}
        </div>
      )
    },
  ];

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {data: algorithmConfigList, mutate: mutateAlgorithmConfigList} = useAlgorithmConfigList({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
  });

  const table = useReactTable({
    data: algorithmConfigList?.records || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: algorithmConfigList?.total,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: pagination,
    },
  });

  const onSuccess = async () => {
    setOpen(false);
    await mutateAlgorithmConfigList();
  };

  return (
    <div className="flex flex-col h-full">
      <AlgorithmDialog open={open} onOpenChange={setOpen} onSuccess={onSuccess}/>
      <div className={"text-right"}>
        <Button onClick={() => setOpen(true)} className={"bg-[#43ABFF] w-24 mb-2"}>添加</Button>
      </div>
      <div className="flex-1 overflow-hidden border border-[#43ABFF] rounded">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-[#43ABFF]">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-[#0A81E1]/70 text-white font-medium h-12"
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
                  className="border-b border-[#43ABFF]/30 hover:bg-[#0A81E1]/10 transition-colors h-14"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-[#D0D0D0] px-4"
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
      </div>

      <div className="flex items-center justify-between py-4 text-[#D0D0D0]">
        <Label className="text-left">
          共 {algorithmConfigList?.total || 0} 条记录，共 {table.getPageCount()} 页
        </Label>
        <div className="space-x-2">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-[#0A81E1] hover:bg-[#0A81E1]/80 disabled:opacity-50"
          >
            上一页
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-[#0A81E1] hover:bg-[#0A81E1]/80 disabled:opacity-50"
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmDataTable;

