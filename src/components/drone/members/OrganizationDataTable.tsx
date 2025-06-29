import {ColumnDef} from "@tanstack/react-table";
import {useState} from "react";
import {useCurrentUser, useWorkspaceList, WorkSpace} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Edit, Trash} from "lucide-react";
import {generateRandomString} from "@/lib/utils.ts";
import {getAuthToken, useAjax} from "@/lib/http.ts";
import {v4 as uuidv4} from "uuid";
import {toast} from "@/components/ui/use-toast.ts";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {CURRENT_CONFIG} from "@/lib/config.ts";
import Uploady from "@rpldy/uploady";
import UploadSingle from "@/components/drone/public/UploadSingle.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import {CommonTable} from "@/components/drone/public/CommonTable.tsx";
import CommonAlertDialog from "@/components/drone/public/CommonAlertDialog.tsx";
import {IconButton} from "@/components/drone/public/IconButton.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import CommonDialog from "@/components/drone/public/CommonDialog.tsx";
import {TreeSelect} from "@/components/drone/public/TreeSelect.tsx";

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

export interface Workspace {
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

export interface NestedWorkspace {
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
          <CommonAlertDialog
            title={"删除组织"}
            trigger={
              <IconButton>
                <Trash size={16}/>
              </IconButton>}
            description={"确认删除组织吗?"}
            onConfirm={() => onDeleteWorkspace(row.original.id)}
          />
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
      setLogoUrl("");
    }
  };

  const [logoUrl, setLogoUrl] = useState("");

  const handleEdit = async (org: WorkSpace) => {
    console.log("org");
    console.log(org);
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
      } else {
        setLogoUrl("");
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
      <CommonDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={`${currentOrg ? "编辑" : "新增"}组织`}
        showCancel={false}
        customFooter={<div className="flex">
          <CommonButton type="submit" form="organ-form" className={"ml-auto"}>确认</CommonButton>
        </div>}
      >
        <Form {...form}>
          <form id="organ-form" className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit, onError)}>
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                  <FormLabel className={"text-right"}>组织名称：</FormLabel>
                  <div className={"col-span-3"}>
                    <FormControl>
                      <CommonInput {...field} placeholder={"输入组织名称"}/>
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
                  <FormControl>
                    <TreeSelect
                      value={+field.value}
                      onChange={(id) => field.onChange(+id)}
                      treeData={nestedData}
                      placeholder="请选择上级组织"
                      className="col-span-3"
                      renderItem={(node) => <span>{node.workspace_name}</span>}
                      renderSelected={(node) => node?.workspace_name}
                    />
                  </FormControl>
                </FormItem>
              )}
              name={"parent"}
            />
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                  <FormLabel className={"text-right"}>Logo：</FormLabel>
                  <UploadSingle picOrigin={logoUrl} onSuccess={field.onChange}/>
                </FormItem>
              )}
              name={"logo"}
            />
          </form>
        </Form>
      </CommonDialog>
      <div className={"flex justify-end mb-4"}>
        <CommonButton onClick={() => handleOpenChange(true)}>创建</CommonButton>
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
    </Uploady>
  );
};

export default OrganizationDataTable;

