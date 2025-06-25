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
  OnChangeFn, getExpandedRowModel, ExpandedState,
} from "@tanstack/react-table";
import {forwardRef, useEffect, useImperativeHandle, useMemo, useState} from "react";
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
import {Label} from "@/components/ui/label.tsx";
import {CommonPagination} from "@/components/drone/public/CommonPagination.tsx";

export type ReactTableInstance<TData> = ReturnType<typeof useReactTable<TData>>;

// 类型定义
export type CommonTableHandle<TData> = {
  // 可以暴露其他你需要的方法
  getSelectedData: () => TData[];
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
  onRowSelectionChange?: (selectedRows: TData[]) => void;
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
  allCounts?: number;
  getSubRows?: (row: TData) => TData[] | undefined;
  expandedAll?: boolean;
}

const EmptyState = (
  <div className={"content-center flex-col space-y-4 py-4 w-full"}>
    <img src={noDataPng} alt=""/>
    <span className={"text-[#bababa] pr-1.5 text-xs"}>暂无数据</span>
  </div>
);

export const CommonTable = forwardRef(<TData, >({
                                                  data,
                                                  columns,
                                                  pagination: controlledPagination,
                                                  onPaginationChange,
                                                  columnVisibility: controlledColumnVisibility,
                                                  onColumnVisibilityChange,
                                                  onRowSelectionChange,
                                                  className,
                                                  headerClassName = "bg-[#4284D7]/70 text-white h-10 font-medium text-base",
                                                  bodyClassName = "bg-[#1E3762]/70",
                                                  rowClassName = "h-[50px] border-none",
                                                  cellClassName = "text-base py-3 align-middle px-4 leading-none text-sm",
                                                  getRowClassName,
                                                  emptyState = EmptyState,
                                                  manualPagination = true,
                                                  enableRowSelection = false, // 默认不启用
                                                  enableMultiRowSelection = true, // 默认允许多选,
                                                  allCounts,
                                                  getSubRows,
                                                  expandedAll = false
                                                }: CommonTableProps<TData>,
                                                ref: React.Ref<ReactTableInstance<TData>>) => {
  const [uncontrolledPagination, setUncontrolledPagination] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const [uncontrolledColumnVisibility, setUncontrolledColumnVisibility] =
    useState<VisibilityState>({});

  const [uncontrolledRowSelection, setUncontrolledRowSelection] =
    useState<RowSelectionState>({});

  const [expanded, setExpanded] = useState<ExpandedState>({});

  const pagination = controlledPagination ?? uncontrolledPagination;
  const setPagination: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const newPagination = typeof updaterOrValue === "function"
      ? updaterOrValue(pagination)
      : updaterOrValue;

    setUncontrolledPagination(newPagination);
    table.resetRowSelection();
    if (onPaginationChange) {
      onPaginationChange(newPagination);
    }
  };

  const columnVisibility = controlledColumnVisibility ?? uncontrolledColumnVisibility;
  const setColumnVisibility: OnChangeFn<VisibilityState> = (updaterOrValue) => {
    const newVisibility = typeof updaterOrValue === "function"
      ? updaterOrValue(columnVisibility)
      : updaterOrValue;

    setUncontrolledColumnVisibility(newVisibility);

    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(newVisibility);
    }
  };

  const setRowSelection: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newRowSelection = typeof updaterOrValue === "function"
      ? updaterOrValue(uncontrolledRowSelection)
      : updaterOrValue;

    // 更新内部状态
    setUncontrolledRowSelection(newRowSelection);

    // 如果有回调函数，传递选中的数据
    if (onRowSelectionChange) {
      // 使用新的选择状态直接从 data 中过滤选中的行
      const selectedRows = data.filter((_, index) => newRowSelection[index]);
      onRowSelectionChange(selectedRows);
    }
  };

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
              "transition-colors duration-200",
              "relative data-[state=indeterminate]:before:content-['-']", // 添加伪元素
              "data-[state=indeterminate]:before:absolute", // 绝对定位
              "data-[state=indeterminate]:before:left-1/2", // 水平居中
              "data-[state=indeterminate]:before:top-1/2", // 垂直居中
              "data-[state=indeterminate]:before:-translate-x-1/2", // 调整居中位置
              "data-[state=indeterminate]:before:-translate-y-1/2", // 调整居中位置
              "data-[state=indeterminate]:before:text-black" // 文字颜色
            )}
          />
        ) : null,
      cell: ({row}) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className={cn(
            "border-[#43ABFF] data-[state=checked]:bg-[#43ABFF]",
            "h-4 w-4",
            "transition-colors duration-200"
          )}
        />
      ),
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
    enableMultiRowSelection,
    onPaginationChange: setPagination,
    manualPagination,
    rowCount: allCounts,
    state: {
      pagination,
      columnVisibility,
      rowSelection: uncontrolledRowSelection,
      expanded
    },
    onExpandedChange: setExpanded,
    getSubRows: getSubRows || ((row: any) => row.children),
    getExpandedRowModel: getExpandedRowModel(),
  });

  // 暴露方法给父组件
  useImperativeHandle(ref, () => table, [table]);

  useEffect(() => {
    table.toggleAllRowsExpanded(expandedAll);
  }, [expandedAll, table]);

  return (
    <div>
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
              <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                {emptyState}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center py-6 relative">
        <CommonPagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
        <div className={"absolute right-0"}>
          <Label className="text-[#c0c0c0] whitespace-nowrap">
            共 {allCounts || 0} 条记录，共 {table.getPageCount()} 页
          </Label>
        </div>
      </div>
    </div>
  )
    ;
}) as <TData>(
  props: CommonTableProps<TData> & { ref?: React.Ref<ReactTableInstance<TData>> }
) => React.ReactElement;
