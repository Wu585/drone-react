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
  getExpandedRowModel,
  ExpandedState,
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

export type CommonTableHandle<TData> = {
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
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  allCounts?: number;
  getSubRows?: (row: TData) => TData[] | undefined;
  expandedAll?: boolean;
  renderCustomRows?: (table: ReactTableInstance<TData>) => React.ReactNode;
  getRowId?: (row: TData) => string;
  defaultColumnWidth?: string; // Added default column width
  maxHeight?: string | number; // 修改：控制表格最大滚动高度
  loading?: boolean; // 新增：加载状态
}

const EmptyState = (
  <div className={"content-center flex-col space-y-4 py-4 w-full"}>
    <img src={noDataPng} alt=""/>
    <span className={"text-[#bababa] pr-1.5 text-xs"}>暂无数据</span>
  </div>
);

// 新增：加载状态组件
const LoadingState = (
  <div className={"content-center flex-col space-y-4 py-8 w-full"}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#43ABFF] mx-auto"></div>
    <span className={"text-[#bababa] pr-1.5 text-xs"}>加载中...</span>
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
                                                  enableRowSelection = false,
                                                  enableMultiRowSelection = true,
                                                  allCounts,
                                                  getSubRows,
                                                  expandedAll = false,
                                                  renderCustomRows,
                                                  getRowId,
                                                  defaultColumnWidth = "auto", // Default width if not specified
                                                  maxHeight,
                                                  loading = false, // 新增：加载状态
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

    setUncontrolledRowSelection(newRowSelection);

    if (onRowSelectionChange) {
      const selectedRows = data.filter((_, index) => newRowSelection[index]);
      onRowSelectionChange(selectedRows);
    }
  };

  // Enhanced columns with width support
  const tableColumns = useMemo(() => {
    let enhancedColumns = [...columns];

    if (enableRowSelection) {
      const selectionColumn: ColumnDef<TData> = {
        id: "select",
        size: 60, // Fixed width for selection column
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
                "relative data-[state=indeterminate]:before:content-['-']",
                "data-[state=indeterminate]:before:absolute",
                "data-[state=indeterminate]:before:left-1/2",
                "data-[state=indeterminate]:before:top-1/2",
                "data-[state=indeterminate]:before:-translate-x-1/2",
                "data-[state=indeterminate]:before:-translate-y-1/2",
                "data-[state=indeterminate]:before:text-black"
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
      enhancedColumns = [selectionColumn, ...enhancedColumns];
    }

    return enhancedColumns;
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
    getRowId,
    // Enable column sizing
    columnResizeMode: "onChange",
  });

  useImperativeHandle(ref, () => table, [table]);

  useEffect(() => {
    table.toggleAllRowsExpanded(expandedAll);
  }, [expandedAll, table]);

  // Generate colgroup based on column widths
  const renderColGroup = () => {
    return (
      <colgroup>
        {table.getHeaderGroups()[0]?.headers.map(header => (
          <col
            key={header.id}
            style={{
              width: header.getSize() !== 150 ? `${header.getSize()}px` : defaultColumnWidth,
              minWidth: `${header.column.columnDef.minSize}px` || undefined,
              maxWidth: `${header.column.columnDef.maxSize}px` || undefined,
            }}
          />
        ))}
      </colgroup>
    );
  };

  return (
    <div>
      <div className={"overflow-hidden"}>
        <Table className={className}>
          {renderColGroup()}
          <TableHeader className={headerClassName}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: `${header.getSize()}px`,
                    }}
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
        </Table>
      </div>
      <div
        className={"overflow-auto"}
        style={{
          maxHeight: maxHeight && (typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight)
        }}>
        <Table className={"table-fixed"}>
          {renderColGroup()}
          <TableBody className={bodyClassName}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  {LoadingState}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              renderCustomRows ? (
                renderCustomRows(table)
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={cn(rowClassName, getRowClassName?.(row.original, index))}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn("", cellClassName)}
                        style={{
                          width: `${cell.column.getSize()}px`,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center py-6 relative">
        {manualPagination && <CommonPagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          disabled={loading} // 新增：加载时禁用分页
        />}
        <div className={"absolute right-0"}>
          <Label className="text-[#c0c0c0] whitespace-nowrap">
            {loading ? "加载中..." : `共 ${manualPagination ? (allCounts || 0) : table.getRowModel().rows.length} 条记录，共 ${table.getPageCount()} 页`}
          </Label>
        </div>
      </div>
    </div>
  );
}) as <TData>(
  props: CommonTableProps<TData> & { ref?: React.Ref<ReactTableInstance<TData>> }
) => React.ReactElement;
