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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {defineStepper} from "@stepperize/react";
import * as React from "react";
import {Separator} from "@/components/ui/separator.tsx";
import {cn} from "@/lib/utils.ts";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";

const {useStepper, steps, utils} = defineStepper(
  {
    id: "1",
    title: "创建工单",
  },
  {
    id: "2",
    title: "处理反馈",
  },
  {
    id: "3",
    title: "处理审核",
    description: "Checkout complete"
  },
  {
    id: "4",
    title: "已归档",
  }
);

const ShippingComponent = () => {
  return (
    <div className="grid gap-4 w-full">
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium text-start">
          Name
        </label>
        <Input id="name" placeholder="John Doe" className="w-full"/>
      </div>
      <div className="grid gap-2">
        <label htmlFor="address" className="text-sm font-medium text-start">
          Address
        </label>
        <Textarea
          id="address"
          placeholder="123 Main St, Anytown USA"
          className="w-full"
        />
      </div>
    </div>
  );
};

const PaymentComponent = () => {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="card-number" className="text-sm font-medium text-start">
          Card Number
        </label>
        <Input
          id="card-number"
          placeholder="4111 1111 1111 1111"
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label
            htmlFor="expiry-date"
            className="text-sm font-medium text-start"
          >
            Expiry Date
          </label>
          <Input id="expiry-date" placeholder="MM/YY" className="w-full"/>
        </div>
        <div className="grid gap-2">
          <label htmlFor="cvc" className="text-sm font-medium text-start">
            CVC
          </label>
          <Input id="cvc" placeholder="123" className="w-full"/>
        </div>
      </div>
    </div>
  );
};

const CompleteComponent = () => {
  return <h3 className="text-lg py-4 font-medium">Stepper complete 🔥</h3>;
};

const WorkOrderDataTable = () => {

  const [downloadingIds] = useState<Set<string>>(new Set());

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
          <span className={`flex items-center ${isDownloading ? "opacity-50" : "cursor-pointer hover:opacity-80"}`}>
            {isDownloading ? (
              <Loader className="h-4 w-4 animate-spin"/>
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


  const stepper = useStepper();

  const currentIndex = utils.getIndex(stepper.current.id);

  return (
    <div>
      <div className={"mb-4 text-right"}>
        <Dialog>
          <DialogTrigger asChild>
            <Button className={"bg-[#43ABFF] w-24"}>创建</Button>
          </DialogTrigger>
          <DialogContent className="max-w-screen-lg bg-[#0A4088]/[.7] text-white border-none">
            <DialogHeader className={""}>
              <DialogTitle>工单创建</DialogTitle>
            </DialogHeader>
            <div className={"border-2 flex p-8"}>
              <ol className="flex flex-col gap-2" aria-orientation="vertical">
                {stepper.all.map((step, index, array) => (
                  <div key={step.id} className={""}>
                    <li className="flex items-center gap-4 flex-shrink-0">
                      <Button
                        type="button"
                        role="tab"
                        variant={index <= currentIndex ? "default" : "secondary"}
                        aria-current={
                          stepper.current.id === step.id ? "step" : undefined
                        }
                        aria-posinset={index + 1}
                        aria-setsize={steps.length}
                        aria-selected={stepper.current.id === step.id}
                        className={cn("flex size-10 items-center justify-center rounded-full", index <= currentIndex ? "bg-[#43ABFF]" : "")}
                        onClick={() => stepper.goTo(step.id)}
                      >
                        {index + 1}
                      </Button>
                      <span className="text-sm font-medium">{step.title}</span>
                    </li>
                    <div className="flex gap-4">
                      {index < array.length - 1 && (
                        <div
                          className="flex justify-center"
                          style={{
                            paddingInlineStart: "1.25rem",
                          }}
                        >
                          <Separator
                            orientation="vertical"
                            className={`w-[2px] h-24`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </ol>
              <div className={"px-4 flex-1 border-2"}>
                {stepper.switch({
                  "1": () => <ShippingComponent/>,
                  "2": () => <PaymentComponent/>,
                  "3": () => <CompleteComponent/>,
                  "4": () => <CompleteComponent/>
                })}
              </div>
            </div>
            <DialogFooter className="">
              <Button type="button" className={"bg-[#43ABFF] w-24"}>
                确认
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
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

export default WorkOrderDataTable;

