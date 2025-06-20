import {Button} from "@/components/ui/button.tsx";
import GMap from "@/components/drone/public/GMap.tsx";
import {useMemo, useState, useEffect} from "react";
import {LogInIcon, Pencil, Plus, Trash2, X} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {
  Depart,
  useBindingDevice, useCurrentUser,
  useDepartList,
  useEditDepart,
  useMembers, User,
  useWorkspaceList, useWorkspaceManager
} from "@/hooks/drone";
import {useNavigate, useSearchParams} from "react-router-dom";
import {ELocalStorageKey} from "@/types/enum.ts";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import {useAjax} from "@/lib/http.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import dayjs from "dayjs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import DepartScene from "@/components/drone/public/DepartScene.tsx";

const OPERATION_HTTP_PREFIX = "/operation/api/v1";

const formSchema = z.object({
  name: z.string().min(1, {message: "请输入部门名称"}),
  lead_user: z.coerce.number({
    required_error: "请选择负责人",
    invalid_type_error: "负责人必须是数字"
  }),
  workspace: z.coerce.number({
    required_error: "请选择组织",
    invalid_type_error: "组织必须是数字"
  }),
  users: z.array(z.coerce.number()).default([]),
  devices: z.array(z.coerce.number()).default([])
});

const DepartPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentWorkSpaceId = localStorage.getItem(ELocalStorageKey.SelectedWorkspaceId) || localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const tmpWorkspaceId = searchParams.get("id") || undefined;

  const [visible, setVisible] = useState(false);
  const {post, delete: deleteClient} = useAjax();
  const {data: departList, mutate: mutateDepartList} = useDepartList(tmpWorkspaceId ? +tmpWorkspaceId : undefined);

  const {departId, setDepartId, data: currentDepart} = useEditDepart();
  const {data: workSpaceList} = useWorkspaceList();
  const {data: currentUser} = useCurrentUser();
  const currentWorkSpace = useMemo(() => {
    return workSpaceList?.find(item => item.workspace_id === currentWorkSpaceId);
  }, [workSpaceList, currentWorkSpaceId]);


  const {data: _userList} = useMembers({
    page: 1,
    page_size: 1000,
    reqWorkSpaceId: currentWorkSpaceId
  });

  const userList = useMemo(() => {
      if (!_userList) return [];
      if (currentDepart) {
        return _userList.list.filter(user => user.workspace_id === currentDepart?.workspace_id);
      } else {
        return _userList.list.filter(user => user.workspace_id === currentWorkSpaceId);
      }
    }
    , [_userList, currentDepart, currentWorkSpaceId]);

  const {data: _droneList} = useBindingDevice(currentWorkSpaceId, {
    page: 1,
    page_size: 1000,
    total: 0,
    domain: EDeviceTypeName.Dock
  });

  const droneList = useMemo(() => {
      if (!_droneList) return [];
      if (currentDepart) {
        return _droneList?.list.filter(item => item.workspace_id === currentDepart?.workspace_id);
      } else {
        return _droneList?.list.filter(item => item.workspace_id === currentWorkSpaceId);
      }
    }
    , [_droneList, currentDepart, currentWorkSpaceId]);

  const defaultValues = {
    name: "",
    lead_user: 0,
    workspace: currentWorkSpace?.id || 0,
    users: [],
    devices: []
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    if (currentDepart) {
      form.setValue("name", currentDepart.name);
      form.setValue("lead_user", currentDepart.lead_user || 0);
      form.setValue("users", currentDepart.users.map((item) => (item as User).id) || []);
      form.setValue("devices", currentDepart.devices.map(item => item.id) || []);
    }
  }, [currentDepart, form]);

  const onError = (errors: any) => {
    console.log("Form errors:", errors);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formValue = departId === 0 ? {
      ...values,
      workspace: currentWorkSpace?.id || 0,
    } : {
      ...values,
      workspace: currentDepart?.workspace || 0,
      id: departId
    };
    const res: any = await post(`${OPERATION_HTTP_PREFIX}/organ/save`, formValue);
    if (res.data.code === 0) {
      toast({
        description: departId === 0 ? "部门创建成功！" : "部门编辑成功！"
      });
      await mutateDepartList();
      // setVisible(false);
      // form.reset(defaultValues);
    }
  };

  // 是否有权限进入部门
  const hasPermission = (depart: Depart) => {
    // 检查当前工作区和用户是否存在
    if (!currentUser) {
      return false; // 如果当前用户不存在，直接返回 false
    }

    // 检查是否在当前工作区，并且用户是否在部门用户列表中
    return depart.user_ids.includes(currentUser.id);
  };

  const permission = useWorkspaceManager();
  console.log('permission');
  console.log(permission);
  const onDeleteDepart = async (id: number) => {
    await deleteClient(`${OPERATION_HTTP_PREFIX}/organ/delete?id=${id}`);
    toast({
      description: "删除部门成功！"
    });
    await mutateDepartList();
  };

  return (
    <div className={"w-full h-full flex"}>
      <div
        className={cn("w-[340px] border-[1px] h-full border-[#43ABFF] bg-gradient-to-r from-[#074578]/[.5] to-[#0B142E]/[.9] rounded-lg",
          visible && "rounded-r-none")}>
        <div
          className={"flex items-center space-x-4 border-b-[1px] border-b-[#265C9A] px-[12px] py-4 justify-between"}>
          <span>部门信息</span>
          <Plus onClick={() => {
            setVisible(true);
            setDepartId(0);
            form.reset(defaultValues);
          }}/>
          {/*<Button className={"bg-[#43ABFF] w-20"} onClick={() => setVisible(true)}>创建</Button>*/}
        </div>
        <div className={"px-[12px] py-4 space-y-2 h-[calc(100vh-180px)] overflow-y-auto"}>
          {!departList || departList.length === 0 &&
            <div className={"content-center py-8 text-[#d0d0d0]"}>暂无数据</div>}
          {departList?.map(item =>
            <div key={item.id}
                 className={"bg-panel-item bg-full-size text-[14px] p-4 space-y-2"}>
              <div>
                <span>部门名称：</span>
                <span>{item.name}</span>
              </div>
              <div>
                <span>所属组织：</span>
                <span>{item.workspace_name}</span>
              </div>
              <div className={"flex justify-between"}>
                <div>
                  <span>创建时间：</span>
                  <span>{dayjs(item.create_time).format("YYYY-MM-DD HH:MM:ss")}</span>
                </div>
                <div className={"flex space-x-2 items-center"}>
                  {permission && <>
                    <Pencil
                      size={16}
                      className={"cursor-pointer"}
                      onClick={() => {
                        setVisible(true);
                        setDepartId(item.id);
                      }}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Trash2 size={16} className={"cursor-pointer"}/>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>删除部门</AlertDialogTitle>
                          <AlertDialogDescription>
                            确认删除部门吗？
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteDepart(item.id)}>确认</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>}
                  {(permission || hasPermission(item)) && <LogInIcon
                    size={16}
                    // className={`${!permission ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    className={"cursor-pointer"}
                    onClick={() => {
                      navigate(`/tsa?workspace=${item?.workspace_id}`);
                      localStorage.setItem("departId", item.id.toString());
                    }}
                  />}
                </div>
              </div>
            </div>)}
        </div>
      </div>
      {visible && <div className={"w-[266px] border-[1px] h-full border-[#43ABFF] bg-gradient-to-r " +
        "from-[#074578]/[.5] to-[#0B142E]/[.9] rounded-tr-lg rounded-br-lg border-l-0 relative"}>
        <X className={"absolute right-2 top-4 cursor-pointer"} onClick={() => setVisible(false)}/>
        <div className={"border-b-[#265C9A] border-b-[1px] p-4"}>{departId === 0 ? "创建部门" : "编辑部门"}</div>
        <Form {...form}>
          <form className={"p-4 space-y-2"} onSubmit={form.handleSubmit(onSubmit, onError)}>
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem className={"space-y-4"}>
                  <FormLabel>部门名称：</FormLabel>
                  <FormControl>
                    <Input  {...field} placeholder={"请输入部门名称"}
                            className={"rounded-none h-[28px] bg-[#072E62]/[.7] border-[#43ABFF]"}/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
              name={"name"}
            />
            <FormField
              control={form.control}
              render={({field: {value, onChange, ...field}}) => (
                <FormItem className={"space-y-4"}>
                  <FormLabel>负责人：</FormLabel>
                  <Select
                    {...field}
                    value={String(value)}
                    onValueChange={onChange}
                  >
                    <FormControl>
                      <SelectTrigger className={"text-white h-[28px] rounded-none bg-[#072E62]/[.7] border-[#43ABFF]"}>
                        <SelectValue placeholder="选择负责人"/>
                      </SelectTrigger>
                    </FormControl>
                    {/*<FormMessage/>*/}
                    <SelectContent>
                      <SelectItem value="0">无</SelectItem>
                      {userList.map(item => (
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
            <FormField
              control={form.control}
              name="users"
              render={() => (
                <FormItem className={"space-y-2"}>
                  <div className={"py-2"}>
                    <FormLabel>人员列表：</FormLabel>
                  </div>
                  <div className={"space-y-2 max-h-[200px] overflow-auto"}>
                    {userList.length > 0 ? userList.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="users"
                        render={({field}) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item.id])
                                      : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {item.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    )) : <div className={"text-sm text-gray-500"}>当前组织下暂无人员</div>}
                  </div>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="devices"
              render={() => (
                <FormItem className={"space-y-2"}>
                  <div className={"py-2"}>
                    <FormLabel>设备列表：</FormLabel>
                  </div>
                  <div className={"space-y-2 max-h-[200px] overflow-auto"}>
                    {droneList.length > 0 ? droneList.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="devices"
                        render={({field}) => {
                          // 检查父设备和子设备是否都被选中
                          const isChecked = field.value?.includes(item.id) &&
                            field.value?.includes(item.children?.id);

                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      // 添加父设备和子设备的ID
                                      field.onChange([
                                        ...field.value,
                                        item.id,
                                        item.children?.id
                                      ]);
                                    } else {
                                      // 移除父设备和子设备的ID
                                      field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id && value !== item.children?.id
                                        )
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {item.nickname} - {item.children?.device_name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    )) : <div className={"text-sm text-gray-500"}>当前组织下暂无设备</div>}
                  </div>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <div className={"text-right"}>
              <Button className={"bg-[#43ABFF] px-4 my-4"} type={"submit"}>确定</Button>
            </div>
          </form>
        </Form>
      </div>}
      <div className={"flex-1 border-[2px] rounded-lg border-[#43ABFF] relative ml-[20px]"}>
        <DepartScene/>
      </div>
    </div>
  );
};

export default DepartPage;

