import {
  ColumnDef,
} from "@tanstack/react-table";
import {useState} from "react";
import {buildTree, Role, useResourceList, useRoleList} from "@/hooks/drone";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {useAjax} from "@/lib/http.ts";
import dayjs from "dayjs";
import {Edit, Trash2} from "lucide-react";
import {TreeSelect} from "@/components/ui/tree-select.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import {CommonTable} from "@/components/drone/public/CommonTable.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import CommonDialog from "@/components/drone/public/CommonDialog.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import CommonAlertDialog from "@/components/drone/public/CommonAlertDialog.tsx";
import {IconButton} from "../public/IconButton";

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
          {row.original.name !== "组织管理员" && row.original.name !== "组织成员" && <CommonAlertDialog
            title={"删除角色"}
            trigger={
              <IconButton>
                <Trash2 size={16}/>
              </IconButton>
            }
            description={"确认删除该角色吗？"}
            onConfirm={() => onDeleteRole(row.original.id)}
          />}
        </div>
      ),
    },
  ];

  const {post, delete: deleteClient} = useAjax();
  const [open, setOpen] = useState(false);

  const {data: roleList, mutate: mutateRoleList, isLoading} = useRoleList();
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

  return (
    <>
      <CommonDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={`${currentRole ? "编辑" : "新增"}角色`}
        showCancel={false}
        customFooter={<div className="flex">
          <CommonButton type="submit" form="role-form" className={"ml-auto"}>确认</CommonButton>
        </div>}
      >
        <Form {...form} >
          <form id="role-form" className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem className={"grid grid-cols-10 items-center gap-x-4 space-y-0"}>
                  <FormLabel className={"col-span-2 text-right"}>角色名：</FormLabel>
                  <div className={"col-span-8"}>
                    <FormControl>
                      <CommonInput {...field} placeholder={"输入角色名"} className={"col-span-3"}/>
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
                <FormItem className={"grid grid-cols-10 space-y-0 gap-x-4"}>
                  <FormLabel className={"col-span-2 text-right"}>资源权限：</FormLabel>
                  <div className="col-span-8 rounded-[2px]">
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
          </form>
        </Form>
      </CommonDialog>
      <div className={"flex justify-end mb-4"}>
        <CommonButton
          onClick={() => {
            setOpen(true);
            form.reset();
          }}>添加</CommonButton>
      </div>
      <CommonTable
        loading={isLoading}
        manualPagination={false}
        data={roleList || []}
        columns={columns}
        allCounts={roleList?.length || 0}
        getRowClassName={(_, index) => index % 2 === 1 ? "bg-[#203D67]/70" : ""}
        pagination={{
          pageIndex: 0,
          pageSize: roleList?.length || 10
        }}
      />
    </>
  );
};

export default RoleDataTable;

