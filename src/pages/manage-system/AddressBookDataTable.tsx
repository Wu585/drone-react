import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Label} from "@/components/ui/label.tsx";
import {AddressBook, useAddressBookList} from "@/hooks/manage-system/api.ts";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useToast} from "@/components/ui/use-toast.ts";
import {client} from "@/hooks/bicycles/api.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import dayjs from "dayjs";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "请输入人员姓名"
  }),
  phone: z.string().min(11, {
    message: "请输入联系电话"
  }),
  dept: z.string().min(1, {
    message: "请输入部门"
  }),
  gender: z.string().min(1, {
    message: "请选择性别"
  }),
  email: z.string().min(5, {
    message: "请输入邮箱"
  }),
});

const AddressBookDataTable = () => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<AddressBook | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<AddressBook>[] = [
    {
      id: "select",
      header: ({table}) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({row}) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "姓名",
    },
    {
      accessorKey: "phone",
      header: "联系电话",
    },
    {
      accessorKey: "dept",
      header: "部门",
    },
    {
      accessorKey: "gender",
      header: "性别",
    },
    {
      accessorKey: "email",
      header: "邮箱",
    },
    {
      accessorKey: "createTime",
      header: "创建时间",
      cell: ({row}) => <span>{dayjs(row.original.createTime).format("YYYY-MM-DD HH:MM:ss")}</span>
    },
    {
      header: "操作",
      cell: ({row}) => <span className={"cursor-pointer"} onClick={() => {
        setOpen(true);
        setCurrent(row.original);
        form.reset(row.original);
      }}>编辑</span>
    },
  ];

  const {data, mutate} = useAddressBookList(pagination.pageIndex + 1, pagination.pageSize);

  const defaultValues = {
    name: "",
    phone: "",
    dept: "",
    gender: "",
    email: ""
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const table = useReactTable({
    data: data?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: data?.total,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
  });

  const {toast} = useToast();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (current) {
      console.log("values");
      console.log(values);
      await client.post("fpAddressBook/update", {
        ...values,
        id: current.id,
      });
      await mutate();
      setOpen(false);
      toast({
        description: "人员编辑成功！"
      });
    } else {
      await client.post("fpAddressBook/create", values);
      await mutate();
      setOpen(false);
      toast({
        description: "人员创建成功！"
      });
    }

  };

  const onDelete = async () => {
    const ids = table.getSelectedRowModel().rows.map((item) => (item.original as AddressBook).id);
    await client.post("fpAddressBook/deleteBatch", ids);
    toast({
      description: "人员删除成功！"
    });
    await mutate();
  };

  return (
    <div>
      <div className={"flex justify-end mb-4"}>
        <div className={"space-x-2"}>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => {
                setCurrent(null);
                form.reset(defaultValues);
              }}>新增人员</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{current ? "编辑人员" : "新增人员"}</DialogTitle>
              </DialogHeader>
              <Form {...form} >
                <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>姓名：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入人员姓名"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"name"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>电话：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入联系电话"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"phone"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>性别：</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={"col-span-3"}>
                              <SelectValue placeholder="选择性别"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="男">男</SelectItem>
                            <SelectItem value="女">女</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                    name={"gender"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>部门：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入部门"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"dept"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>邮箱：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入邮箱"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"email"}
                  />
                  <DialogFooter>
                    <Button type="submit">{current ? "保存" : "创建"}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={table.getSelectedRowModel().rows.length <= 0}>删除人员</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>删除人员</AlertDialogTitle>
                <AlertDialogDescription>
                  确认删除人员吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>确定</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
          共 {data?.total || 0} 条记录，共 {table.getPageCount()} 页
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

export default AddressBookDataTable;

