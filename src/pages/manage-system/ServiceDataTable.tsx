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
import {ServiceContent, useServices} from "@/hooks/manage-system/api.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {Progress} from "@/components/ui/progress.tsx";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const formSchema = z.object({
  rootUrl: z.string().url(),
  tags: z.string().optional()
});

const ServiceDataTable = <TData, TValue>({
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
      rootUrl: "",
      tags: ""
    }
  });

  const {post, delete: deleteIportal, get} = useAjax();
  const {toast} = useToast();
  const {mutate} = useServices();

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const res: any = (await get(`iportal/apps/viewer/getUrlResource.json?url=${encodeURIComponent(values.rootUrl)}.json`)).data;
    if (res.length <= 0) {
      return toast({
        description: "当前服务地址不可用！"
      });
    }
    const {succeed, newResourceID} = (await post<{
      succeed: boolean
      newResourceID: string
    }>("iportal/web/services/batchregister.json", {
      authorizeSetting: [{
        entityId: null,
        entityName: "GUEST",
        entityType: "USER",
        permissionType: "SEARCH"
      }],
      rootUrl: values.rootUrl,
      tags: values.tags ? [values.tags] : []
    })).data;

    if (!succeed) return toast({description: "服务注册失败！"});

    let interval = setInterval(async () => {
      setIsRegister(true);
      const {successCount, taskCount} = (await get<{
        successCount: number
        taskCount: number
      }>(`iportal/web/services/batchregister/${newResourceID}.json`)).data;
      setProgress((successCount / taskCount) * 100);
      if (successCount >= taskCount) {
        clearInterval(interval);
        await mutate();
      }
    }, 1000);
  };

  const onDeleteService = async () => {
    const services = table.getSelectedRowModel().rows.map((item) => (item.original as ServiceContent).id);
    await deleteIportal("iportal/manager/iportalconfig/servicesmanage.json", {
      ids: JSON.stringify(services)
    });
    await mutate();
    toast({
      description: "删除服务成功！"
    });
  };

  return (
    <div>
      <div className={"flex justify-between items-center"}>
        <div className="flex flex-1 items-center py-4 space-x-2">
          <span>筛选：</span>
          <Input
            placeholder="根据服务名称查询"
            value={(table.getColumn("resTitle")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("resTitle")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className={"space-x-2"}>
          <Dialog onOpenChange={() => {
            setIsRegister(false);
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => form.reset()}>批量注册</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{isRegister ? progress === 100 ? "注册成功" : "服务注册中..." : "添加目录服务器地址"}</DialogTitle>
              </DialogHeader>
              {
                isRegister ? <Progress value={progress}/> :
                  <Form {...form} >
                    <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit)}>
                      <FormField
                        control={form.control}
                        render={({field}) => (
                          <FormItem className={"flex justify-center items-center space-x-4 whitespace-nowrap"}>
                            <FormLabel>服务地址：</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={`http://<server>:<port>/iserver/services`}/>
                            </FormControl>
                          </FormItem>
                        )}
                        name={"rootUrl"}
                      />
                      <FormField
                        control={form.control}
                        render={({field}) => (
                          <FormItem className={"flex justify-center items-center space-x-4 whitespace-nowrap"}>
                            <FormLabel>标签：</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={"用户服务"}/>
                            </FormControl>
                          </FormItem>
                        )}
                        name={"tags"}
                      />
                      <DialogFooter>
                        <Button type="submit">创建</Button>
                      </DialogFooter>
                    </form>
                  </Form>
              }
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={table.getSelectedRowModel().rows.length <= 0}>删除服务</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>删除服务</AlertDialogTitle>
                <AlertDialogDescription>
                  确认删除服务吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteService}>确定</AlertDialogAction>
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

export default ServiceDataTable;

