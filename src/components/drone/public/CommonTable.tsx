import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState,
  RowSelectionState,
  OnChangeFn,
} from "@tanstack/react-table";
import {forwardRef, useImperativeHandle, useMemo, useState} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {cn} from "@/lib/utils";
import {Checkbox} from "@/components/ui/checkbox";
import noDataPng from "@/assets/images/drone/no-data.png";

export type ReactTableInstance<TData> = ReturnType<typeof useReactTable<TData>>;

// 类型定义
export type CommonTableHandle<TData> = {
  getSelectedData: () => TData[];
  // 可以暴露其他你需要的方法
  tableInstance: ReturnType<typeof useReactTable<TData>>;
};

interface CommonTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  totalCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string;
  getRowClassName?: (row: TData, index: number) => string;
  cellClassName?: string;
  emptyState?: React.ReactNode;
  manualPagination?: boolean;
  enableRowSelection?: boolean; // 新增：是否启用行选择
  enableMultiRowSelection?: boolean; // 新增：是否允许多选
}

const EmptyState = (
  <div className={"content-center flex-col space-y-4 py-4"}>
    <img src={noDataPng} alt=""/>
    <span className={"text-[#bababa] pr-1.5 text-xs"}>暂无数据</span>
  </div>
);

export const CommonTable = forwardRef(<TData, >({
                                                  data,
                                                  columns,
                                                  totalCount = 0,
                                                  pagination: controlledPagination,
                                                  onPaginationChange,
                                                  columnVisibility: controlledColumnVisibility,
                                                  onColumnVisibilityChange,
                                                  rowSelection: controlledRowSelection,
                                                  onRowSelectionChange,
                                                  className,
                                                  headerClassName = "bg-[#4284D7]/70 text-white h-10 font-medium",
                                                  bodyClassName = "bg-[#1E3762]/70",
                                                  rowClassName = "h-[50px] border-none",
                                                  cellClassName = "text-base py-3 align-middle px-4 leading-none",
                                                  getRowClassName,
                                                  emptyState = EmptyState,
                                                  manualPagination = false,
                                                  enableRowSelection = false, // 默认不启用
                                                  enableMultiRowSelection = true, // 默认允许多选
                                                }: CommonTableProps<TData>,
                                                ref: React.Ref<CommonTableHandle<TData>>) => {
  const [uncontrolledPagination, setUncontrolledPagination] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const [uncontrolledColumnVisibility, setUncontrolledColumnVisibility] =
    useState<VisibilityState>({});

  const [uncontrolledRowSelection, setUncontrolledRowSelection] =
    useState<RowSelectionState>({});

  const pagination = controlledPagination ?? uncontrolledPagination;
  const setPagination = onPaginationChange ?? setUncontrolledPagination;

  const columnVisibility = controlledColumnVisibility ?? uncontrolledColumnVisibility;
  const setColumnVisibility = onColumnVisibilityChange ?? setUncontrolledColumnVisibility;

  const rowSelection = controlledRowSelection ?? uncontrolledRowSelection;
  const setRowSelection = onRowSelectionChange ?? setUncontrolledRowSelection;

  // 添加选择列到columns
  const tableColumns = useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectionColumn: ColumnDef<TData> = {
      id: "select",
      header: ({table}) =>
        enableMultiRowSelection ? (
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
        ) : null,
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
    };

    return [selectionColumn, ...columns];
  }, [columns, enableRowSelection, enableMultiRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination,
    rowCount: totalCount,
    state: {
      pagination,
      columnVisibility,
      rowSelection,
    },
    enableMultiRowSelection,
  });

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getSelectedData: () => {
      return table.getSelectedRowModel().rows.map(row => row.original);
    },
    tableInstance: table, // 如果需要完整实例
  }), [table]);

  return (
    <Table className={className}>
      <TableHeader className={headerClassName}>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="border-none">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
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
      <TableBody className={bodyClassName}>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, index) => (
            <TableRow
              key={row.id}
              className={cn(rowClassName, getRowClassName?.(row.original, index))}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className={cellClassName}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              {emptyState}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}) as <TData>(
  props: CommonTableProps<TData> & { ref?: React.Ref<CommonTableHandle<TData>> }
) => React.ReactElement;
