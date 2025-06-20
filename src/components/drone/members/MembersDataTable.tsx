import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {Fragment, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {useMembers, UserItem, useRoleList, useWorkspaceList} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
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
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {ChevronDown, ChevronRight, Edit} from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "请输入姓名"
  }),
  username: z.string().min(3, {
    message: "请输入用户名"
  }),
  password: z.string().min(3, {
    message: "请输入密码"
  }).optional(),
  workspace_id: z.string(),
  user_type: z.number(),
  mqtt_username: z.string(),
  mqtt_password: z.string(),
  role: z.coerce.number({
    required_error: "请分配角色",
    invalid_type_error: "角色必须是数字"
  }),
  organ: z.array(z.number()).default([])
});

const MANAGE_HTTP_PREFIX = "/manage/api/v1";

const MembersDataTable = () => {
  const {data: roleList} = useRoleList();

  const columns: ColumnDef<UserItem>[] = [
    {
      accessorKey: "username",
      header: "用户名",
    },
    {
      accessorKey: "name",
      header: "姓名",
    },
    {
      accessorKey: "role",
      header: "角色",
      cell: ({row}) => (
        <div>{roleList?.find(item => item.id === row.original.role)?.name}</div>
      ),
    },
    {
      accessorKey: "user_type",
      header: "用户类型",
    },
    {
      accessorKey: "workspace_name",
      header: "组织",
    },
    /*{
      accessorKey: "mqtt_username",
      header: "Mqtt 用户名",
    },
    {
      accessorKey: "mqtt_password",
      header: "Mqtt 密码",
    },*/
    {
      accessorKey: "create_time",
      header: "创建时间",
    },
    {
      header: "操作",
      cell: ({row}) => <div className={"flex"}>
        <Edit
          size={16}
          className="cursor-pointer hover:text-[#43ABFF] transition-colors"
          onClick={() => handleEdit(row.original)}
        />
      </div>
    }
  ];

  const {post} = useAjax();
  const [open, setOpen] = useState(false);
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {data, mutate} = useMembers({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
  });

  const {data: workSpaceList} = useWorkspaceList();

  // 下拉树专用展开收缩状态
  const [treeExpandedIds, setTreeExpandedIds] = useState<number[]>([]);

  // 下拉树切换展开收缩
  const toggleTreeRow = (id: number) => {
    setTreeExpandedIds(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  // 递归渲染组织树选项
  const renderTreeOptions = (parentId: number | null = null, level: number = 0): JSX.Element[] | undefined => {
    // 找出顶级节点（parentId 为 null 时，返回没有父节点的项）
    const items = workSpaceList?.filter(item =>
      parentId === null
        ? !workSpaceList.some(parent => parent.id === item.parent)  // 没有父节点
        : item.parent === parentId                                 // 匹配 parentId
    );

    if (!items?.length) return undefined;

    return items.map(item => {
      const hasChildren = workSpaceList?.some(child => child.parent === item.id);
      const isExpanded = treeExpandedIds.includes(item.id);
      return (
        <Fragment key={item.id}>
          <div className="flex items-center">
            {hasChildren ? (
              <span
                className="p-0 cursor-pointer flex items-center"
                style={{marginLeft: `${level * 16}px`}}
                onClick={e => {
                  e.stopPropagation();
                  toggleTreeRow(item.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 inline-block align-middle"/>
                ) : (
                  <ChevronRight className="h-4 w-4 inline-block align-middle"/>
                )}
              </span>
            ) : (
              <span className="w-4" style={{marginLeft: `${level * 16}px`}}/>
            )}
            <SelectItem value={item.workspace_id} className="pl-6 ml-0">
              {item.workspace_name}
            </SelectItem>
          </div>
          {hasChildren && isExpanded && renderTreeOptions(item.id, level + 1)}
        </Fragment>
      );
    });
  };

  const defaultValues = {
    name: "",
    username: "",
    password: "",
    workspace_id: "",
    user_type: 1,
    mqtt_username: "admin",
    mqtt_password: "admin",
    role: 0,
    organ: []
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setCurrentUser(null);
      form.reset(defaultValues);
    }
  };

  const handleEdit = (user: UserItem) => {
    setCurrentUser(user);
    console.log('user');
    console.log(user);
    form.reset({
      ...user,
      user_type: user.user_type === "Web" ? 1 : 2,
      password: undefined
    });
    setOpen(true);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onError = (errors: any) => {
    console.log("Form errors:", errors);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const body = currentUser ? {
      ...values,
      id: currentUser.id,
      ...(values.password ? {} : { password: undefined })
    } : values;
    console.log('body');
    console.log(body);
    const res: any = await post(`${MANAGE_HTTP_PREFIX}/users/save`, body);
    if (res.data.code === 0) {
      toast({
        description: `${currentUser ? "更新" : "创建"}用户成功！`
      });
      form.reset(defaultValues);
      setOpen(false);
      await mutate();
    }
  };

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

  return (
    <div>
      <div className={"flex justify-between mb-4"}>
        <div className={"flex space-x-4"}>
          {/*<Input placeholder={"请输入用户名"} className={"rounded-none bg-[#072E62]/[.7] border-[#43ABFF]"}/>*/}
          {/*<Button className={"bg-[#43ABFF]"}>查询</Button>*/}
          {/*<Button className={"bg-[#43ABFF]"}>重置</Button>*/}
        </div>
        <div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger>
              <Button className={"bg-[#43ABFF] w-24"}>添加</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>新增用户</DialogTitle>
              </DialogHeader>
              <Form {...form} >
                <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit, onError)}>
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
                  {!currentUser && <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>账号：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入账号"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"username"}
                  />}
                  {!currentUser && <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>密码：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入密码"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"password"}
                  />}
                  <FormField
                    control={form.control}
                    render={({field: {value, onChange, ...field}}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>组织：</FormLabel>
                        <Select
                          {...field}
                          value={String(value)}
                          onValueChange={onChange}
                        >
                          <FormControl>
                            <SelectTrigger className={"col-span-3"}>
                              <SelectValue placeholder="选择所属组织"/>
                            </SelectTrigger>
                          </FormControl>
                          {/*<FormMessage/>*/}
                          <SelectContent>
                            <SelectItem value="0">无</SelectItem>
                            {renderTreeOptions()}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                    name={"workspace_id"}
                  />
                  <FormField
                    control={form.control}
                    render={({field: {value, onChange, ...field}}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>角色：</FormLabel>
                        <Select
                          {...field}
                          value={String(value)}
                          onValueChange={onChange}
                        >
                          <FormControl>
                            <SelectTrigger className={"col-span-3"}>
                              <SelectValue placeholder="分配角色"/>
                            </SelectTrigger>
                          </FormControl>
                          {/*<FormMessage/>*/}
                          <SelectContent>
                            <SelectItem value="0">无</SelectItem>
                            {roleList?.map(item => (
                              <SelectItem key={item.id} value={String(item.id)}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                    name={"role"}
                  />
                  <DialogFooter>
                    <Button type="submit">确认</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="">
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

export default MembersDataTable;

