import {ColumnDef} from "@tanstack/react-table";
import {useState} from "react";
import {useMembersPage, UserItem, useRoleList, useWorkspaceList} from "@/hooks/drone";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {Edit} from "lucide-react";
import {CommonTable} from "@/components/drone/public/CommonTable.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import {IconButton} from "@/components/drone/public/IconButton.tsx";
import CommonDialog from "@/components/drone/public/CommonDialog.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import {TreeSelect} from "@/components/drone/public/TreeSelect.tsx";
import {NestedWorkspace, Workspace} from "./OrganizationDataTable";
import {CommonSelect} from "@/components/drone/public/CommonSelect.tsx";

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
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, {
      message: "请输入有效的手机号码"
    })
    .optional()
    .or(z.literal("")), // Allow empty string
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

function nestWorkspaces(workspaces: Workspace[]): NestedWorkspace[] {
  const workspaceMap: { [key: number]: NestedWorkspace } = {};
  const nestedWorkspaces: NestedWorkspace[] = [];

  // 初始化每个工作区
  workspaces.forEach(workspace => {
    workspaceMap[workspace.id] = {
      ...workspace,
      id: workspace.workspace_id, // Replace id with workspace_id here
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

  // 递归处理所有子项的id
  const processNested = (items: NestedWorkspace[]): NestedWorkspace[] => {
    return items.map(item => ({
      ...item,
      id: item.workspace_id,
      children: processNested(item.children)
    }));
  };

  const result = processNested(nestedWorkspaces);
  console.log("nestedWorkspaces", result);
  return result;
}

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
      accessorKey: "phone",
      header: "手机号",
      cell: ({row}) => (
        <div>{row.original.phone || "--"}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "角色",
      cell: ({row}) => (
        <div>{roleList?.find(item => item.id === row.original.role)?.name || "--"}</div>
      ),
    },
    {
      accessorKey: "workspace_name",
      header: "组织",
    },
    {
      accessorKey: "create_time",
      header: "创建时间",
    },
    {
      header: "操作",
      cell: ({row}) => <div className={"flex"}>
        <IconButton onClick={() => handleEdit(row.original)}>
          <Edit size={16}/>
        </IconButton>
      </div>
    }
  ];

  const {post} = useAjax();
  const [open, setOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);

  const initialQueryParams = {
    page: 1,
    page_size: 10
  };

  const [queryParams, setQueryParams] = useState(initialQueryParams);

  const {data, mutate, isLoading} = useMembersPage(queryParams);

  const {data: workSpaceList} = useWorkspaceList();
  const nestedData = nestWorkspaces(workSpaceList || []);

  const defaultValues = {
    name: "",
    username: "",
    password: "",
    workspace_id: "",
    user_type: 1,
    mqtt_username: "admin",
    mqtt_password: "admin",
    role: "",
    organ: [],
    phone: ""
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    setCurrentUser(null);
    form.reset(defaultValues);
  };

  const handleEdit = (user: UserItem) => {
    setCurrentUser(user);
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
      ...(values.password ? {} : {password: undefined})
    } : values;
    console.log("body");
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

  return (
    <>
      <div className={"flex mb-4"}>
        <CommonDialog
          open={open}
          onOpenChange={handleOpenChange}
          title={"新增用户"}
          trigger={<CommonButton className={"ml-auto"}>添加</CommonButton>}
          showCancel={false}
          customFooter={<div className="flex">
            <CommonButton type="submit" form="user-form" className={"ml-auto"}>确认</CommonButton>
          </div>}
        >
          <Form {...form} >
            <form id={"user-form"} className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit, onError)}>
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                    <FormLabel className={"text-right"}>姓名：</FormLabel>
                    <FormControl>
                      <div className="col-span-3 space-y-1">
                        <CommonInput {...field} placeholder={"请输入人员姓名"} className={"col-span-3"}/>
                        <FormMessage/>
                      </div>
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
                      <div className="col-span-3 space-y-1">
                        <CommonInput {...field} placeholder={"请输入账号"} className={"col-span-3"}/>
                        <FormMessage/>
                      </div>
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
                      <div className="col-span-3 space-y-1">
                        <CommonInput type={"password"} {...field} placeholder={"请输入密码"} className={"col-span-3"}/>
                        <FormMessage/>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
                name={"password"}
              />}
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                    <FormLabel className={"text-right"}>手机号：</FormLabel>
                    <FormControl>
                      <div className="col-span-3 space-y-1">
                        <CommonInput
                          {...field}
                          type="tel"
                          pattern="[0-9]*"
                          placeholder={"请输入人员手机号"}
                          maxLength={11}
                          onKeyDown={(e) => {
                            // 只允许数字、退格、删除、Tab和箭头键
                            if (
                              !/[0-9]/.test(e.key) &&
                              e.key !== "Backspace" &&
                              e.key !== "Delete" &&
                              e.key !== "Tab" &&
                              !e.key.startsWith("Arrow")
                            ) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            // 确保输入值只包含数字
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            field.onChange(value);
                          }}
                        />
                        <FormMessage/>
                        {/*{form.formState.errors.phone && (
                              <FormMessage className="text-sm text-red-500">
                                {form.formState.errors.phone.message}
                              </FormMessage>
                            )}*/}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
                name={"phone"}
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                    <FormLabel className={"text-right"}>组织：</FormLabel>
                    <FormControl>
                      <TreeSelect
                        value={field.value}
                        onChange={(workspace_id) => field.onChange(workspace_id)}
                        treeData={nestedData}
                        placeholder="请选择所属组织"
                        className="col-span-3"
                        renderItem={(node) => <span>{node.workspace_name}</span>}
                        renderSelected={(node) => node?.workspace_name}
                      />
                    </FormControl>
                  </FormItem>
                )}
                name={"workspace_id"}
              />
              <FormField
                control={form.control}
                render={({field: {value, onChange}}) => (
                  <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                    <FormLabel className={"text-right"}>角色：</FormLabel>
                    <FormControl>
                      <CommonSelect
                        placeholder={"请选择用户角色"}
                        className={"col-span-3"}
                        value={String(value)}
                        onValueChange={onChange}
                        options={roleList?.map(role => ({
                          value: role.id.toString(),
                          label: role.name
                        }))}
                      />
                    </FormControl>
                  </FormItem>
                )}
                name={"role"}
              />
            </form>
          </Form>
        </CommonDialog>
      </div>
      <CommonTable
        loading={isLoading}
        data={data?.list || []}
        columns={columns}
        allCounts={data?.pagination?.total || 0}
        getRowClassName={(_, index) => index % 2 === 1 ? "bg-[#203D67]/70" : ""}
        onPaginationChange={({pageIndex}) => setQueryParams({
          ...queryParams,
          page: pageIndex + 1
        })}
      />
    </>
  );
};

export default MembersDataTable;

