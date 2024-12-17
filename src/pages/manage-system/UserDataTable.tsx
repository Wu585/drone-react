import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useState} from "react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Label} from "@/components/ui/label.tsx";
import {
  Dialog, DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {useAjax} from "@/lib/http.ts";
import {Content, useUsers} from "@/hooks/manage-system/api.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const formSchema = z.object({
  name: z.string().min(4, {
    message: "请输入用户名"
  }),
  password: z.string().min(6, {
    message: "请输入密码"
  }),
});

const UserDataTable = <TData, TValue>({
                                        columns,
                                        data,
                                      }: DataTableProps<TData, TValue>) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      password: ""
    }
  });

  const {post, put} = useAjax();
  const {mutate} = useUsers();
  const {toast} = useToast();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await post("iportal/web/users.rjson", values);
    await mutate();
    toast({
      description: "用户创建成功！"
    });
  };

  const onDeleteUsers = async () => {
    const users = table.getSelectedRowModel().rows.map((item) => (item.original as Content).name);
    await put("iportal/manager/security/users.json", users);
    await mutate();
    toast({
      description: "删除用户成功！"
    });
  };

  return (
    <div>
      <div className={"flex justify-between items-center"}>
        <div className="flex flex-1 items-center py-4 space-x-2">
          <span>筛选：</span>
          <Input
            placeholder="根据用户名称查询"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className={"space-x-2"}>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => form.reset()}>新增用户</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>新增用户</DialogTitle>
              </DialogHeader>
              <Form {...form} >
                <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"flex justify-center items-center space-x-4 whitespace-nowrap"}>
                        <FormLabel>用户名：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入用户名"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"name"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"flex justify-center items-center space-x-4 whitespace-nowrap"}>
                        <FormLabel>密码：</FormLabel>
                        <FormControl>
                          <Input type={"password"} {...field} placeholder={"输入密码"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"password"}
                  />
                  <DialogFooter>
                    <DialogClose>
                      <Button type="submit">创建</Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={table.getSelectedRowModel().rows.length <= 0}>删除用户</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>删除用户</AlertDialogTitle>
                <AlertDialogDescription>
                  确认删除用户吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteUsers}>确定</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={() => table.resetColumnFilters()}>重置</Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={"text-black"}>
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <Label className={"text-left"}>
          共 {table.getFilteredRowModel().rows.length} 条记录，共 {table.getPageCount()} 页
        </Label>
        <div className={"space-x-2"}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
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

export default UserDataTable;

