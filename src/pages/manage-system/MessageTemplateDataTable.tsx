import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Label} from "@/components/ui/label.tsx";
import {
  Template,
  useDeviceList,
  useTemplateList,
  useTemplateUserList
} from "@/hooks/manage-system/api.ts";
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

const formSchema = z.object({
  templateId: z.string().min(1, {
    message: "请输入模板Id"
  }),
  templateName: z.string().min(1, {
    message: "请输入模板名称"
  }),
  deviceMatch: z.string().min(1, {
    message: "请选择匹配设备"
  }),
  receiveLetters: z.string().min(1, {
    message: "请选择接收用户"
  }),
});

const MessageTemplateDataTable = () => {
  const {data: deviceList} = useDeviceList();
  const {data: templateUserList} = useTemplateUserList();
  const {data: templateList, mutate} = useTemplateList();

  useEffect(() => {
    console.log("templateList");
    console.log(templateList);
  }, [templateList]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Template | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<Template>[] = [
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
      accessorKey: "templateId",
      header: "模板id",
    },
    {
      accessorKey: "templateName",
      header: "模板名称",
    },
    {
      accessorKey: "deviceMatch",
      header: "匹配设备",
    },
    {
      accessorKey: "receiveLetters",
      header: "接收用户",
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

  const defaultValues = {
    templateId: "",
    templateName: "",
    deviceMatch: "",
    receiveLetters: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const table = useReactTable({
    data: templateList || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: true,
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
      await client.post("fpInfoTemplates/update", {
        ...values,
        id: current.id,
      });
      await mutate();
      setOpen(false);
      toast({
        description: "模板编辑成功！"
      });
    } else {
      await client.post("fpInfoTemplates/create", values);
      await mutate();
      setOpen(false);
      toast({
        description: "人员创建成功！"
      });
    }

  };

  const onDelete = async () => {
    const ids = table.getSelectedRowModel().rows.map((item) => (item.original as Template).id);
    await client.post("fpInfoTemplates/deleteBatch", ids);
    toast({
      description: "模板删除成功！"
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
              }}>新增模板</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{current ? "编辑模板" : "新增模板"}</DialogTitle>
              </DialogHeader>
              <Form {...form} >
                <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>模板Id：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入模板Id"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"templateId"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>模板名称：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入模板名称"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"templateName"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>匹配设备：</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={"col-span-3"}>
                              <SelectValue placeholder="选择匹配设备"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deviceList?.map(item => <SelectItem value={item}>{item}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                    name={"deviceMatch"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>接收用户：</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={"col-span-3"}>
                              <SelectValue placeholder="选择接收用户"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {templateUserList?.map(item => <SelectItem
                              value={item.userName}>{item.userName}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                    name={"receiveLetters"}
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
              <Button variant="outline" disabled={table.getSelectedRowModel().rows.length <= 0}>删除模板</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>删除模板</AlertDialogTitle>
                <AlertDialogDescription>
                  确认删除模板吗？
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
          共 {table.getFilteredRowModel().rows.length || 0} 条记录，共 {table.getPageCount()} 页
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

export default MessageTemplateDataTable;

