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
  Dialog,
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
import {useRoles} from "@/hooks/manage-system/api.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {aclList} from "@/pages/manage-system/AclManage.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const formSchema = z.object({
  name: z.string().min(4, {
    message: "请输入角色名"
  }),
  acls: z.array(z.string()),
});

const AclDataTable = <TData, TValue>({
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
      acls: []
    }
  });

  const {put, get} = useAjax();
  const {data: roleList} = useRoles();
  const {toast} = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const onChangeRole = async () => {
    const res = (await get<string[]>(`iportal/manager/security/roles/${form.getValues().name}/moduleauthorization2.json`)).data;
    form.setValue("acls", res);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const {succeed} = (await put<{
      succeed: boolean
    }>(`iportal/manager/security/roles/${values.name}/moduleauthorization2.json`, values.acls)).data;
    if (!succeed) return toast({description: "权限分配失败！"});
    toast({description: "权限分配成功！"});
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className={"flex justify-between items-center"}>
        <div className="flex flex-1 items-center py-4 space-x-2">
          <span>筛选：</span>
          <Input
            placeholder="根据权限值查询"
            value={(table.getColumn("value")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("value")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className={"space-x-2"}>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild onClick={() => setIsDialogOpen(true)}>
              <Button variant="outline" onClick={() => form.reset()}>分配权限</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>分配权限</DialogTitle>
              </DialogHeader>
              <Form {...form} >
                <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"flex justify-center items-center space-x-4 whitespace-nowrap"}>
                        <FormLabel>角色列表：</FormLabel>
                        <Select defaultValue={field.value}
                                onValueChange={async (e) => {
                                  field.onChange(e);
                                  await onChangeRole();
                                }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择角色"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {roleList?.map(({name}) =>
                                <SelectItem value={name} key={name}>{name}</SelectItem>)}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                    name={"name"}
                  />
                  <FormItem className={"flex"}>
                    <FormLabel>权限列表：</FormLabel>
                    <div>
                      {aclList.map(acl => (
                        <FormField control={form.control} key={acl.value} render={({field}) => {
                          return (
                            <FormItem key={acl.value} className={"flex items-center space-x-2"}>
                              <FormControl className={""}>
                                <Checkbox
                                  checked={field.value?.includes(acl.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, acl.value])
                                      : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== acl.value
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="">
                                {acl.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }} name={"acls"}/>
                      ))}
                    </div>
                  </FormItem>
                  <DialogFooter>
                    <Button type="submit">确定</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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

export default AclDataTable;

