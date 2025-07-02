import {useMemo, useState, useEffect, useCallback} from "react";
import {LogInIcon, Pencil, Plus, Trash2, X} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {
  Depart,
  useBindingDevice, useCurrentUser,
  useDepartList,
  useEditDepart,
  useMembersPage, User,
  useWorkspaceList, useWorkspaceManager
} from "@/hooks/drone";
import {useNavigate, useSearchParams} from "react-router-dom";
import {ELocalStorageKey} from "@/types/enum.ts";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import dayjs from "dayjs";
import DepartScene from "@/components/drone/public/DepartScene.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import {CommonSelect} from "@/components/drone/public/CommonSelect.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import CommonAlertDialog from "@/components/drone/public/CommonAlertDialog.tsx";
import {IconButton} from "@/components/drone/public/IconButton.tsx";
import {Label} from "@/components/ui/label.tsx";
import {pickPosition} from "@/components/toolbar/tools";
import {clearPickPosition} from "@/components/toolbar/tools/pickPosition.ts";
import {addDepartEntity} from "@/hooks/drone/depart/useAddDepartEntity.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";

const OPERATION_HTTP_PREFIX = "/operation/api/v1";

const formSchema = z.object({
  name: z.string().min(1, {message: "请输入部门名称"}),
  lead_user: z.coerce.number({
    required_error: "请选择负责人",
    invalid_type_error: "负责人必须是数字"
  }),
  longitude: z.coerce.number().optional(),
  latitude: z.coerce.number().optional(),
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
  const viewerInitialized = useSceneStore(state => state.viewerInitialized);
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

  const {data: userList} = useMembersPage({
    page: 1,
    page_size: 1000,
    workspace_id: currentWorkSpaceId
  });

  const {data: _droneList} = useBindingDevice(currentWorkSpaceId, {
    page: 1,
    page_size: 1000,
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
    devices: [],
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    if (currentDepart) {
      form.setValue("name", currentDepart.name);
      form.setValue("longitude", currentDepart.longitude ? +currentDepart.longitude : undefined);
      form.setValue("latitude", currentDepart.latitude ? +currentDepart.latitude : undefined);
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
      if (values.longitude && values.latitude) {
        viewer.entities.removeById("depart-position");
        addDepartEntity(values.longitude, values.latitude, values.name);
        clearPickPosition();
      }
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
  console.log("permission");
  console.log(permission);
  const onDeleteDepart = async (id: number) => {
    await deleteClient(`${OPERATION_HTTP_PREFIX}/organ/delete?id=${id}`);
    toast({
      description: "删除部门成功！"
    });
    await mutateDepartList();
  };

  const longitude = form.watch("longitude");
  const latitude = form.watch("latitude");

  const onSetPosition = useCallback(() => {
    clearPickPosition();
    pickPosition(({longitude, latitude}) => {
      viewer.entities.removeById("depart-position");
      // 添加蓝色圆形entity
      console.log(111);
      viewer.entities.add({
        id: "depart-position",
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
        point: {
          pixelSize: 10,                   // 点的大小（像素）
          color: Cesium.Color.BLUE,        // 蓝色
          outlineColor: Cesium.Color.WHITE, // 白色边框
          outlineWidth: 2,                // 边框宽度
        }
      });
      form.setValue("longitude", longitude);
      form.setValue("latitude", latitude);
    });
  }, [viewerInitialized]);

  useEffect(() => {
    if (departId <= 0) return;
    if (!currentDepart || !currentDepart.longitude || !currentDepart.latitude) return;
    viewer.entities.removeById("depart-position");
    addDepartEntity(+currentDepart.longitude, +currentDepart.latitude, currentDepart.name);
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(+currentDepart.longitude, +currentDepart.latitude, 200),
      duration: 1
    });
  }, [departId, currentDepart]);

  useEffect(() => {
    return () => {
      viewer.entities.removeById("depart-position");
      clearPickPosition();
    };
  }, []);

  return (
    <div className={"w-full h-full flex"}>
      <div
        className={cn("w-[360px] border-[1px] h-full border-[#43ABFF] bg-gradient-to-l from-[#32547E]/[.5] to-[#1F2D4B] rounded-lg",
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
            <div
              onClick={() => setDepartId(item.id)}
              style={{
                backgroundSize: "100% 100%"
              }}
              key={item.id}
              className={cn("bg-full-size text-[14px] p-4 space-y-2 cursor-pointer", item.id === departId ? "bg-panel-item-active" : "bg-panel-item")}>
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
                    <IconButton onClick={() => {
                      setVisible(true);
                      setDepartId(item.id);
                    }}>
                      <Pencil size={16}/>
                    </IconButton>
                    <CommonAlertDialog
                      title={"删除部门"}
                      trigger={
                        <IconButton>
                          <Trash2 size={16}/>
                        </IconButton>
                      }
                      description={<div>确认删除部门吗？</div>}
                      onConfirm={() => {
                        onDeleteDepart(item.id);
                        form.reset();
                        setVisible(false);
                      }}
                    />
                  </>}
                  {(permission || hasPermission(item)) &&
                    <IconButton
                      onClick={() => {
                        navigate(`/tsa?workspace=${item?.workspace_id}`);
                        localStorage.setItem("departId", item.id.toString());
                      }}>
                      <LogInIcon size={16}/>
                    </IconButton>}
                </div>
              </div>
            </div>)}
        </div>
      </div>
      {visible && <div className={"w-[266px] border-[1px] h-full border-[#43ABFF] bg-[#1E3357] " +
        "rounded-tr-lg rounded-br-lg border-l-0 relative"}>
        <X className={"absolute right-2 top-4 cursor-pointer"}
           onClick={() => {
             setVisible(false);
             setDepartId(0);
           }}/>
        <div className={"border-b-[#265C9A] border-b-[1px] p-4"}>{departId === 0 ? "创建部门" : "编辑部门"}</div>
        <Form {...form}>
          <form className={"p-4 space-y-2"} onSubmit={form.handleSubmit(onSubmit, onError)}>
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem className={"space-y-4"}>
                  <FormLabel>部门名称：</FormLabel>
                  <FormControl>
                    <CommonInput className={"bg-custom-input"}  {...field} placeholder={"请输入部门名称"}/>
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
                  <FormControl>
                    <CommonSelect
                      className={"bg-custom-input"}
                      placeholder={"请选择负责人"}
                      {...field}
                      value={value.toString()}
                      onValueChange={onChange}
                      options={userList?.list.map(user => ({
                        value: user.id.toString(),
                        label: user.name
                      }))}
                    />
                  </FormControl>
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
                    {userList && userList?.list?.length > 0 ? userList?.list.map((item) => (
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

            <div className={"flex justify-between items-center"}>
              <Label>部门中心点：</Label>
              <CommonButton type={"button"} onClick={onSetPosition}>设置中心点</CommonButton>
            </div>

            <div className={"text-sm text-[#d0d0d0]"}>
              <Label>经纬度：</Label>
              <span>{longitude && latitude && `${longitude.toFixed(6)} , ${latitude.toFixed(6)}`}</span>
            </div>

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
            <div className={"text-right py-4"}>
              <CommonButton type={"submit"}>确定</CommonButton>
            </div>
          </form>
        </Form>
      </div>}
      <div className={"flex-1 border-[2px] rounded-lg border-[#43ABFF] relative ml-[20px] overflow-hidden"}>
        <DepartScene/>
      </div>
    </div>
  );
};

export default DepartPage;

