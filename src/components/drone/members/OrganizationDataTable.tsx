import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {Fragment, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {useCurrentUser, useWorkspaceList, WorkSpace} from "@/hooks/drone";
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
import {ChevronRight, ChevronDown, Edit, Trash, UploadCloud, X, Plus} from "lucide-react";
import {cn, generateRandomString} from "@/lib/utils.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {getAuthToken, useAjax} from "@/lib/http.ts";
import {v4 as uuidv4} from "uuid";
import {toast} from "@/components/ui/use-toast.ts";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {CURRENT_CONFIG} from "@/lib/config.ts";
import Uploady, {useItemFinishListener} from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import {UploadPreview} from "@rpldy/upload-preview";
import UploadAvatar from "@/components/drone/public/UploadAvatar.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import {CommonTable} from "@/components/drone/public/CommonTable.tsx";
import {Icon} from "@/components/public/Icon.tsx";

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
  // lead_user: z.coerce.number({
  //   required_error: "请选择负责人",
  //   invalid_type_error: "负责人必须是数字"
  // }),
  workspace_code: z.string().min(6).optional(),
  logo: z.string().optional()
});

const MANAGE_HTTP_PREFIX = "/manage/api/v1";

interface Workspace {
  id: number;
  workspace_id: string;
  workspace_name: string;
  workspace_desc: string;
  platform_name: string;
  bind_code: string;
  parent: number;
  lead_user: number;
  lead_user_name: string;
  workspace_code: string;
  logo: string;
  create_time: number;
}

interface NestedWorkspace {
  id: number;
  workspace_id: string;
  workspace_name: string;
  workspace_desc: string;
  platform_name: string;
  bind_code: string;
  lead_user: number;
  lead_user_name: string;
  workspace_code: string;
  logo: string;
  create_time: number;
  children: NestedWorkspace[];
}

function nestWorkspaces(workspaces: Workspace[]): NestedWorkspace[] {
  const workspaceMap: { [key: number]: NestedWorkspace } = {};
  const nestedWorkspaces: NestedWorkspace[] = [];

  // 初始化每个工作区
  workspaces.forEach(workspace => {
    workspaceMap[workspace.id] = {
      ...workspace,
      children: []
    };
  });

  // 构建嵌套结构
  workspaces.forEach(workspace => {
    if (workspace.parent === 0) {
      // 如果没有父级，添加到根级别
      nestedWorkspaces.push(workspaceMap[workspace.id]);
    } else {
      // 否则，将其添加到父级的 children 中
      const parentWorkspace = workspaceMap[workspace.parent];
      if (parentWorkspace) {
        parentWorkspace.children.push(workspaceMap[workspace.id]);
      } else {
        // 如果找不到父级，将其视为一级组织
        nestedWorkspaces.push(workspaceMap[workspace.id]);
      }
    }
  });

  return nestedWorkspaces;
}

const OrganizationDataTable = () => {
  const OPERATION_HTTP_PREFIX = "operation/api/v1";

  const [open, setOpen] = useState(false);
  const {post, delete: deleteClient} = useAjax();
  const [currentOrg, setCurrentOrg] = useState<WorkSpace | null>(null);

  // 下拉树专用展开收缩状态
  const [treeExpandedIds, setTreeExpandedIds] = useState<number[]>([]);

  const navigate = useNavigate();

  const onClickWorkspaceName = (workspace: WorkSpace) => {
    navigate(`/depart?id=${workspace.id}`);
    localStorage.setItem(ELocalStorageKey.WorkspacePrimaryKey, workspace.id.toString());
    localStorage.setItem(ELocalStorageKey.SelectedWorkspaceId, workspace.workspace_id);
  };

  const columns: ColumnDef<WorkSpace>[] = [
    {
      accessorKey: "workspace_name",
      header: () => <div className="text-left pl-4">组织名</div>,
      size: 120,
      cell: ({row}) => (
        <div
          className="truncate flex items-center gap-2"
          style={{paddingLeft: `${row.depth * 2}rem`}}
          title={row.getValue("workspace_name")}
        >
          {row.getCanExpand() &&
            <button
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: {cursor: "pointer"},
              }}
              className="w-4 h-4 flex items-center justify-center"
            >
              {row.getIsExpanded() ? "▼" : "▶"}
            </button>
          }
          <CommonButton
            variant={"link"}
            onClick={() => onClickWorkspaceName(row.original)}
            className="truncate px-0 h-6 bg-transparent">{row.getValue("workspace_name")}
          </CommonButton>
        </div>
      ),
    },
    {
      accessorKey: "lead_user_name",
      header: () => <div className="text-center">创建人</div>,
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
    },
    {
      accessorKey: "create_time",
      header: () => <div className="text-center">创建时间</div>,
      cell: ({row}) => (
        <div className="text-center">{dayjs(row.getValue("create_time")).format("YYYY-MM-DD HH:mm:ss")}</div>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: () => <div className="text-center">操作</div>,
      cell: ({row}) => (
        <div className="content-center space-x-2">
          <Edit
            size={16}
            className="cursor-pointer hover:text-[#43ABFF] transition-colors inline-block"
            onClick={() => handleEdit(row.original)}
          />
          <AlertDialog>
            <AlertDialogTrigger>
              <Trash
                size={16}
                className="cursor-pointer hover:text-[#43ABFF] transition-colors inline-block"
              />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>删除组织</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>确认删除组织吗?</AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className={"text-primary-foreground text-black"}>取消</AlertDialogCancel>
                <AlertDialogCancel
                  className={"bg-primary text-primary-foreground"}
                  onClick={() => onDeleteWorkspace(row.original.id)}>确认</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
      size: 80,
    }
  ];

  const onDeleteWorkspace = async (id: number) => {
    try {
      await deleteClient(`${MANAGE_HTTP_PREFIX}/workspaces/${id}`);
      toast({
        description: "删除成功！"
      });
      await mutateWorkSpaceList();
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  const {data: currentUser} = useCurrentUser();

  const {data: workSpaceList, mutate: mutateWorkSpaceList} = useWorkspaceList();

  const nestedData = nestWorkspaces(workSpaceList || []);

  const defaultValues = {
    workspace_id: "",
    workspace_name: "",
    workspace_code: generateRandomString(),
    workspace_desc: "",
    platform_name: "",
    bind_code: generateRandomString(),
    parent: 0,
    logo: ""
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setCurrentOrg(null);
      form.reset(defaultValues);
    }
  };

  const [logoUrl, setLogoUrl] = useState("");

  const handleEdit = async (org: WorkSpace) => {
    setCurrentOrg(org);
    form.reset({
      workspace_id: org.workspace_id,
      workspace_name: org.workspace_name,
      workspace_desc: org.workspace_desc,
      platform_name: org.platform_name,
      // bind_code: org.bind_code,
      // workspace_code: org.workspace_code,
      parent: org.parent,
      logo: org.logo
    });
    try {
      if (org.logo) {
        const res: any = await post(`${OPERATION_HTTP_PREFIX}/file/getUrl?key=${org.logo}`);
        console.log("res");
        console.log(res.data);
        setLogoUrl(res.data.data);
      }
    } catch (err) {
      setLogoUrl("");
    } finally {
      setOpen(true);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("onSubmit values:", values);
    if (!currentUser) return;
    const formData = {
      ...values,
      workspace_id: currentOrg ? undefined : uuidv4(),
      lead_user: currentUser?.id,
      id: currentOrg?.id
    };
    console.log("formData", formData);

    try {
      await post(`${MANAGE_HTTP_PREFIX}/workspaces/save`, formData);
      toast({
        description: `${currentOrg ? "更新" : "创建"}组织成功！`
      });
      setOpen(false);
      form.reset(defaultValues);
      await mutateWorkSpaceList();
    } catch (err) {
      toast({
        description: `${currentOrg ? "更新" : "创建"}组织失败！`,
        variant: "destructive"
      });
    }
  };

  const onError = (errors: any) => {
    console.log("Form errors:", errors);
  };

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
            <SelectItem value={String(item.id)} className="pl-6 ml-0">
              {item.workspace_name}
            </SelectItem>
          </div>
          {hasChildren && isExpanded && renderTreeOptions(item.id, level + 1)}
        </Fragment>
      );
    });
  };

  return (
    <Uploady
      destination={{
        url: `${CURRENT_CONFIG.baseURL}${OPERATION_HTTP_PREFIX}/file/upload`,
        headers: {
          [ELocalStorageKey.Token]: getAuthToken()
        }
      }}
      accept="image/*"
      multiple={false}
      autoUpload>
      <div>
        <div className={"flex justify-between mb-4"}>
          <div className={"flex space-x-4"}>
            {/*<Input placeholder={"请输入组织名称"} className={"rounded-none bg-[#072E62]/[.7] border-[#43ABFF]"}/>*/}
            {/*<Button className={"bg-[#43ABFF]"}>查询</Button>*/}
            {/*<Button className={"bg-[#43ABFF]"}>重置</Button>*/}
          </div>
          <div>
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger>
                <CommonButton>创建</CommonButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{currentOrg ? "编辑" : "新增"}组织</DialogTitle>
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
                      render={({field}) => (
                        <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                          <FormLabel className={"text-right"}>上级组织：</FormLabel>
                          <div className={"col-span-3"}>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger className={"col-span-3"}>
                                  <SelectValue placeholder="选择上级组织"/>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">无</SelectItem>
                                {renderTreeOptions()}
                              </SelectContent>
                            </Select>
                            <FormMessage/>
                          </div>
                        </FormItem>
                      )}
                      name={"parent"}
                    />
                    <FormField
                      control={form.control}
                      render={({field}) => (
                        <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                          <FormLabel className={"text-right"}>Logo：</FormLabel>
                          <UploadAvatar picOrigin={logoUrl} onSuccess={field.onChange}/>
                        </FormItem>
                      )}
                      name={"logo"}
                    />
                    {/*<FormField*/}
                    {/*  control={form.control}*/}
                    {/*  render={({field: {value, onChange, ...field}}) => (*/}
                    {/*    <FormItem className={"grid grid-cols-4 items-center gap-4"}>*/}
                    {/*      <FormLabel className={"text-right"}>负责人：</FormLabel>*/}
                    {/*      <Select*/}
                    {/*        {...field}*/}
                    {/*        value={String(value)}*/}
                    {/*        onValueChange={onChange}*/}
                    {/*      >*/}
                    {/*        <FormControl>*/}
                    {/*          <SelectTrigger className={"col-span-3"}>*/}
                    {/*            <SelectValue placeholder="选择负责人"/>*/}
                    {/*          </SelectTrigger>*/}
                    {/*        </FormControl>*/}
                    {/*        /!*<FormMessage/>*!/*/}
                    {/*        <SelectContent>*/}
                    {/*          <SelectItem value="0">无</SelectItem>*/}
                    {/*          {data?.list.map(item => (*/}
                    {/*            <SelectItem key={item.id} value={String(item.id)}>*/}
                    {/*              {item.name}*/}
                    {/*            </SelectItem>*/}
                    {/*          ))}*/}
                    {/*        </SelectContent>*/}
                    {/*      </Select>*/}
                    {/*    </FormItem>*/}
                    {/*  )}*/}
                    {/*  name={"lead_user"}*/}
                    {/*/>*/}
                    <DialogFooter>
                      <Button type="submit">确认</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <CommonTable
          data={nestedData}
          columns={columns}
          getRowClassName={(_, index) => index % 2 === 1 ? "bg-[#203D67]/70" : ""}
          expandedAll
          allCounts={workSpaceList?.length || 0}
          maxHeight={"calc(100vh - 400px)"}
          manualPagination={false}
          pagination={{
            pageIndex: 0,
            pageSize: workSpaceList?.length || 10
          }}
        />
      </div>
    </Uploady>
  );
};

export default OrganizationDataTable;

