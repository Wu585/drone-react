import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {Fragment, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {useCurrentUser, useMembers, useWorkspaceList, WorkSpace} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {Button} from "@/components/ui/button.tsx";
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
import {ChevronRight, ChevronDown} from "lucide-react";
import {generateRandomString} from "@/lib/utils.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useAjax} from "@/lib/http.ts";
import {v4 as uuidv4} from "uuid";
import {toast} from "@/components/ui/use-toast.ts";

const formSchema = z.object({
  workspace_id: z.string(),
  workspace_desc: z.string().optional(),
  platform_name: z.string().optional(),
  bind_code: z.string().min(6).optional(),
  workspace_name: z.string().min(3, {
    message: "请输入组织名称"
  }),
  parent: z.coerce.number({
    required_error: "请选择上级组织",
    invalid_type_error: "上级组织必须是数字"
  }),
  lead_user: z.coerce.number({
    required_error: "请选择负责人",
    invalid_type_error: "负责人必须是数字"
  }),
  workspace_code: z.string().min(6).optional(),
});

const MANAGE_HTTP_PREFIX = "/manage/api/v1";

const OrganizationDataTable = () => {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const {post} = useAjax();
  const toggleRow = (id: number) => {
    setExpandedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const getRowLevel = (row: WorkSpace) => {
    if (row.parent === 0) return 0;
    let level = 1;
    let currentParentId = row.parent;
    while (currentParentId) {
      const parent = workSpaceList?.find(item => item.id === currentParentId);
      if (!parent || parent.parent === null) break;
      level++;
      currentParentId = parent.parent;
    }
    return level;
  };

  const shouldShowRow = (row: WorkSpace) => {
    if (row.parent === 0) return true;
    let currentParentId = row.parent;
    while (currentParentId) {
      if (!expandedRows.includes(currentParentId)) return false;
      const parent = workSpaceList?.find(item => item.id === currentParentId);
      if (!parent) break;
      currentParentId = parent.parent;
    }
    return true;
  };

  const columns: ColumnDef<WorkSpace>[] = [
    {
      accessorKey: "workspace_name",
      header: () => <div className="text-left pl-4">组织名</div>,
      cell: ({row}) => {
        const level = getRowLevel(row.original);
        const hasChildren = workSpaceList?.some(item => item.parent === row.original.id);
        const isExpanded = expandedRows.includes(row.original.id);

        return (
          <div
            className="flex items-center"
            style={{paddingLeft: `${level * 16 + 16}px`}}
          >
            {hasChildren && (
              <button
                onClick={() => toggleRow(row.original.id)}
                className="mr-1 p-1 hover:bg-gray-100/10 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4"/>
                ) : (
                  <ChevronRight className="h-4 w-4"/>
                )}
              </button>
            )}
            {!hasChildren && <span className="w-6"/>}
            <span className="truncate">{row.original.workspace_name}</span>
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "lead_user_name",
      header: () => <div className="text-center">负责人</div>,
      cell: ({row}) => (
        <div className="text-center">{row.original.lead_user_name}</div>
      ),
      size: 120,
    },
    {
      accessorKey: "workspace_code",
      header: () => <div className="text-center">组织编码</div>,
      cell: ({row}) => (
        <div className="text-center">{row.getValue("workspace_code")}</div>
      ),
      size: 120,
    },
    {
      accessorKey: "bind_code",
      header: () => <div className="text-center">绑定码</div>,
      cell: ({row}) => (
        <div className="text-center">{row.getValue("bind_code")}</div>
      ),
      size: 120,
    }
  ];

  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {data: currentUser} = useCurrentUser();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 1000,
  });

  const {data} = useMembers(workspaceId, {
    page: pagination.pageIndex + 1,
    page_size: 1000,
    total: 0
  });

  const {data: workSpaceList, mutate: mutateWorkSpaceList} = useWorkspaceList();

  const defaultValues = {
    workspace_id: "",
    workspace_name: "",
    workspace_code: generateRandomString(),
    workspace_desc: "",
    platform_name: "",
    bind_code: generateRandomString(),
    parent: 0,
    lead_user: currentUser?.id
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("onSubmit values:", values);
    const formData = {
      ...values,
      workspace_id: uuidv4(),
    };
    console.log("formData", formData);
    const res: any = await post(`${MANAGE_HTTP_PREFIX}/workspaces/save`, formData);
    if (res.data.code === 0) {
      toast({
        description: "组织创建成功！"
      });
      setOpen(false);
      form.reset(defaultValues);
      await mutateWorkSpaceList();
    }
  };

  const onError = (errors: any) => {
    console.log("Form errors:", errors);
  };

  const formatTableData = (data: WorkSpace[]) => {
    const result: WorkSpace[] = [];

    const topLevel = data.filter(item => item.parent === 0);

    const addChildren = (parentId: number) => {
      const children = data.filter(item => item.parent === parentId);
      children.forEach(child => {
        result.push(child);
        if (expandedRows.includes(child.id)) {
          addChildren(child.id);
        }
      });
    };

    topLevel.forEach(item => {
      result.push(item);
      if (expandedRows.includes(item.id)) {
        addChildren(item.id);
      }
    });

    return result;
  };

  // 递归渲染组织树选项
  const renderTreeOptions = (parentId: number = 0, level: number = 0): JSX.Element[] | undefined => {
    const indent = "\u00A0\u00A0\u00A0\u00A0".repeat(level);
    return workSpaceList?.filter(item => item.parent === parentId).map(item => (
      <Fragment key={item.id}>
        <SelectItem value={String(item.id)}>
          {indent + item.workspace_name}
        </SelectItem>
        {renderTreeOptions(item.id, level + 1)}
      </Fragment>
    ));
  };

  const table = useReactTable({
    data: formatTableData(workSpaceList?.filter(shouldShowRow) || []),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: workSpaceList?.length || 0,
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
              <Button className={"bg-[#43ABFF] w-24"}>创建</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>新增组织</DialogTitle>
              </DialogHeader>
              <Form {...form} >
                <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit, onError)}>
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>组织名称：</FormLabel>
                        <div className={"col-span-3"}>
                          <FormControl>
                            <Input {...field} placeholder={"输入组织名称"} className={""}/>
                          </FormControl>
                          <FormMessage/>
                        </div>
                      </FormItem>
                    )}
                    name={"workspace_name"}
                  />
                  <FormField
                    control={form.control}
                    render={({field: {value, onChange, ...field}}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>上级组织：</FormLabel>
                        <Select
                          {...field}
                          value={String(value)}
                          onValueChange={onChange}
                        >
                          <FormControl>
                            <SelectTrigger className={"col-span-3"}>
                              <SelectValue placeholder="选择上级组织"/>
                            </SelectTrigger>
                          </FormControl>
                          <FormMessage/>
                          <SelectContent>
                            <SelectItem value="0">无</SelectItem>
                            {renderTreeOptions()}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                    name={"parent"}
                  />
                  <FormField
                    control={form.control}
                    render={({field: {value, onChange, ...field}}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>负责人：</FormLabel>
                        <Select
                          {...field}
                          value={String(value)}
                          onValueChange={onChange}
                        >
                          <FormControl>
                            <SelectTrigger className={"col-span-3"}>
                              <SelectValue placeholder="选择负责人"/>
                            </SelectTrigger>
                          </FormControl>
                          {/*<FormMessage/>*/}
                          <SelectContent>
                            <SelectItem value="0">无</SelectItem>
                            {data?.list.map(item => (
                              <SelectItem key={item.id} value={String(item.id)}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                    name={"lead_user"}
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
      {/*<div className="flex items-center justify-between space-x-2 py-4">
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
      </div>*/}
    </div>
  );
};

export default OrganizationDataTable;

