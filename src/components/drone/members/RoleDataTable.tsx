import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Role, useMembers, useRoleList} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {useAjax} from "@/lib/http.ts";
import dayjs from "dayjs";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "请输入角色名称"
  }),
});

export const rolesData = [
  {
    id: 0,
    name: "超级管理员"
  },
  {
    id: 1,
    name: "组织管理员"
  },
  {
    id: 2,
    name: "组织成员"
  },
  {
    id: 3,
    name: "部门管理员"
  },
  {
    id: 4,
    name: "部门成员"
  },
  {
    id: 5,
    name: "设备维护员"
  }
];

const OPERATION_HTTP_PREFIX = "/operation/api/v1";

const RoleDataTable = () => {
  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: () => <div className="text-left pl-6">角色名称</div>,
      cell: ({row}) => (
        <div className="text-left pl-6">{row.getValue("name")}</div>
      ),
      size: 120
    },
    {
      accessorKey: "create_time",
      header: () => <div className="text-center">创建时间</div>,
      cell: ({row}) => (
        <div className="text-center">{dayjs(row.getValue("create_time")).format("YYYY-MM-DD HH:MM:ss")}</div>
      ),
      size: 120
    },
  ];

  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {post} = useAjax();
  const [open, setOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {data} = useMembers(workspaceId, {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    total: 0
  });

  const {data: roleList} = useRoleList();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("values");
    console.log(values);
    const res = await post(`${OPERATION_HTTP_PREFIX}/role/save`, {
      ...values,
      menu_ids: []
    });
  };

  const table = useReactTable({
    data: roleList || [],
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

  return (
    <div>
      <div className={"flex justify-between mb-4"}>
        <div className={"flex space-x-4"}>
          {/*<Input placeholder={"请输入组织名称"} className={"rounded-none bg-[#072E62]/[.7] border-[#43ABFF]"}/>*/}
          {/*<Button className={"bg-[#43ABFF]"}>查询</Button>*/}
          {/*<Button className={"bg-[#43ABFF]"}>重置</Button>*/}
        </div>
        <div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button className={"bg-[#43ABFF] w-24"}>添加</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>新增角色</DialogTitle>
              </DialogHeader>
              <Form {...form} >
                <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>角色名：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入角色名"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"name"}
                  />
                  <DialogFooter>
                    <Button type="submit">创建</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="relative">
        <Table className={"border-[1px] border-[#0A81E1] w-full table-fixed"}>
          <TableHeader className={"bg-[#0A81E1]/[.7]"}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={"border-none"}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{width: header.getSize()}}
                    className="p-0 h-10"
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
        <div className="h-[calc(100vh-460px)] overflow-auto">
          <Table className={"border-[1px] border-[#0A81E1] border-t-0 w-full table-fixed"}>
            <TableBody className={"bg-[#0A4088]/[.7]"}>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className={"border-b-[#0A81E1]"}
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{width: cell.column.getSize()}}
                        className="p-0 h-10"
                      >
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

export default RoleDataTable;

