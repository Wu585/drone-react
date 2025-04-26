import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {buildTree, Role, useMembers, useResourceList, useRoleList} from "@/hooks/drone";
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
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {useAjax} from "@/lib/http.ts";
import dayjs from "dayjs";
import {Edit, Trash2} from "lucide-react";
import {TreeSelect} from "@/components/ui/tree-select.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "请输入角色名称"
  }),
  resource_ids: z.array(z.number()).default([])
});

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
        <div className="text-center">{dayjs(row.getValue("create_time")).format("YYYY-MM-DD HH:mm:ss")}</div>
      ),
      size: 120
    },
    {
      accessorKey: "x",
      header: () => <div className="text-center">操作</div>,
      cell: ({row}) => (
        <div className={"flex items-center justify-center space-x-2"}>
          <Edit
            size={16}
            className="cursor-pointer hover:text-[#43ABFF] transition-colors"
            onClick={() => handleEdit(row.original)}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Trash2 size={16} className="cursor-pointer hover:text-[#43ABFF] transition-colors"/>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>删除角色</AlertDialogTitle>
                <AlertDialogDescription>
                  确认删除该角色吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteRole(row.original.id)}>确认</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {post, delete: deleteClient} = useAjax();
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

  const {data: roleList, mutate: mutateRoleList} = useRoleList();
  const {data: _resourceList} = useResourceList();

  const resourceList = buildTree(_resourceList?.filter(item => item.type === 1 || item.type === 2) || []);
  console.log("resourceList");
  console.log(resourceList);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      resource_ids: []
    }
  });

  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setCurrentRole(null);
      form.reset({name: "", resource_ids: []});
    }
  };

  const handleEdit = (role: Role) => {
    setCurrentRole(role);
    form.reset({
      name: role.name,
      resource_ids: role.resource_ids || []
    });
    setOpen(true);
  };

  const onDeleteRole = async (id: number) => {
    const res: any = await deleteClient(`${OPERATION_HTTP_PREFIX}/role/delete?id=${id}`);
    if (res.data.code === 0) {
      toast({
        description: `删除角色成功！`
      });
      await mutateRoleList();
    }
  };
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const body = currentRole ? {
      ...values,
      menu_ids: [],
      id: currentRole.id,
    } : {
      ...values,
      menu_ids: []
    };

    const res: any = await post(`${OPERATION_HTTP_PREFIX}/role/save`, body);

    if (res.data.code === 0) {
      toast({
        description: `${currentRole ? "更新" : "创建"}角色成功！`
      });
      await mutateRoleList();
      setOpen(false);
    }
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
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className={"bg-[#43ABFF] w-24"}>添加</Button>
              {/*<Button className={"bg-[#43ABFF] w-24"} onClick={createRole}>创建</Button>*/}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>{currentRole ? "编辑" : "新增"}角色</DialogTitle>
              </DialogHeader>
              <Form {...form} >
                <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>角色名：</FormLabel>
                        <div className={"col-span-3 space-y-2"}>
                          <FormControl>
                            <Input {...field} placeholder={"输入角色名"} className={"col-span-3"}/>
                          </FormControl>
                          <FormMessage/>
                        </div>
                      </FormItem>
                    )}
                    name={"name"}
                  />
                  <FormField
                    control={form.control}
                    name="resource_ids"
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-start gap-4"}>
                        <FormLabel className={"text-right pt-2"}>资源权限：</FormLabel>
                        <div className="col-span-3 border border-black/[.5] rounded-md">
                          <FormControl>
                            <TreeSelect
                              value={field.value}
                              onChange={field.onChange}
                              treeData={resourceList}
                            />
                          </FormControl>
                          <FormMessage/>
                        </div>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">确定</Button>
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

