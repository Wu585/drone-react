import {
  ColumnDef,
  ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {useEffect, useMemo, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {
  downloadFile,
  FileItem,
  MEDIA_HTTP_PREFIX, useCurrentUser, useDepartList,
  useGetImageUrl,
  useMediaList, useMembers, useOperationList, UserItem,
  useWorkOrderList, useWorkspaceList,
  WorkOrder
} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {CircleCheckBig, Download, Edit, Eye, Loader, Trash} from "lucide-react";
import {getAuthToken, useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {defineStepper} from "@stepperize/react";
import {Separator} from "@/components/ui/separator.tsx";
import {cn} from "@/lib/utils.ts";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {DateTimePicker} from "@/components/ui/date-time-picker";
import {format} from "date-fns";
import Uploady, {useItemFinishListener} from "@rpldy/uploady";
import {UploadButton} from "@rpldy/upload-button";
import {UploadCloud, X} from "lucide-react";
import {CURRENT_CONFIG} from "@/lib/config.ts";
import dayjs from "dayjs";
import Scene from "@/components/drone/public/Scene.tsx";
import {pickPosition} from "@/components/toolbar/tools";

const eventMap = {
  0: "公共设施",
  1: "道路交通",
  2: "环卫环保",
  3: "园林绿化",
  4: "其它设施",
  5: "环卫市容",
  6: "设施管理",
  7: "突发事件",
  8: "街面秩序",
  9: "市场监管",
  10: "房屋管理",
  11: "农村管理",
  12: "街面治安",
  13: "重点保障",
  14: "其他事件",
} as const;

const createOrderSchema = z.object({
  name: z.string().min(1, "请输入事件名称"),
  found_time: z.string()
    .min(1, "请选择发现时间")
    .refine((value) => {
      // 检查是否符合格式
      const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
      if (!regex.test(value)) return false;

      // 检查是否是有效日期
      const date = new Date(value);
      return !isNaN(date.getTime());
    }, "请输入有效的时间格式（YYYY-MM-DD HH:mm:ss）"),
  order_type: z.number({
    required_error: "请选择事件类型",
    invalid_type_error: "事件类型必须是数字"
  }).refine(
    (val) => Object.keys(eventMap).map(Number).includes(val),
    "请选择有效的事件类型"
  ),
  address: z.string().min(1, "请输入发生地址"),
  contact: z.string().min(1, "请输入联系人"),
  contact_phone: z.string().min(1, "请输入联系电话"),
  longitude: z.coerce.number({
    invalid_type_error: "经度必须是数字"
  }),
  latitude: z.coerce.number({
    invalid_type_error: "纬度必须是数字"
  }),
  pic_list: z.array(z.string()).default([]),
  description: z.string().min(3, "请输入事件内容描述"),
  warn_level: z.coerce.number({
    required_error: "请选择告警类型",
    invalid_type_error: "告警类型必须是数字"
  })
});

const feedbackSchema = z.object({
  operate_pic_list: z.array(z.string()).default([]),
  result: z.string().min(1, "请描述处理结果"),
});

const auditSchema = z.object({
  status: z.coerce.number().refine(
    (val) => val === 1 || val === 2,
    "请选择有效的审核结果"
  )
});

const OPERATION_HTTP_PREFIX = "operation/api/v1";
const MANAGE_HTTP_PREFIX = "/manage/api/v1";

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

const ImageUploader = ({field}: { field: any }) => {
  const {post} = useAjax();
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});

  useItemFinishListener(({uploadResponse}) => {
    if (uploadResponse?.data?.data) {
      field.onChange([...field.value, uploadResponse.data.data]);
    }
  });

  // 获取图片URL
  const getImageUrl = async (path: string) => {
    try {
      const res: any = await post(`${OPERATION_HTTP_PREFIX}/file/getUrl?key=${path}`);
      if (res.data?.data) {
        setImageUrls(prev => ({
          ...prev,
          [path]: res.data.data
        }));
      }
    } catch (error) {
      console.error("Failed to get image URL:", error);
    }
  };

  // 当 field.value 改变时获取新图片的 URL
  useEffect(() => {
    field.value.forEach((path: string) => {
      if (!imageUrls[path]) {
        getImageUrl(path);
      }
    });
  }, [field.value]);

  return (
    <div className="grid gap-4">
      {/* 预览区域 */}
      {field.value.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {field.value.map((path: string, index: number) => (
            <div key={index} className="relative group aspect-video">
              <img
                src={imageUrls[path] || ""}  // 使用获取到的URL
                alt={`上传图片 ${index + 1}`}
                className="w-full h-full object-cover rounded-sm"
              />
              <button
                type="button"
                onClick={() => {
                  const newPaths = [...field.value];
                  newPaths.splice(index, 1);
                  field.onChange(newPaths);
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full
                         text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 上传按钮 */}
      <UploadButton onClick={(e) => e.preventDefault()}>
        <div className="border-2 border-dashed border-[#43ABFF] rounded-sm p-4
                      text-center hover:bg-[#072E62] transition-colors cursor-pointer">
          <UploadCloud className="w-8 h-8 mx-auto mb-2 text-[#43ABFF]"/>
          <div className="text-sm text-[#43ABFF]">
            点击上传
            <br/>
            支持图片格式：JPG、PNG、JPEG
          </div>
        </div>
      </UploadButton>
    </div>
  );
};

const CreateOrderComponent = ({setOpen, currentOrder}: {
  setOpen: (visible: boolean) => void,
  currentOrder?: WorkOrder
}) => {
  const {post} = useAjax();
  const {data: currentUser} = useCurrentUser();
  const urlFix = currentUser?.role === 3 ? "page" : "pageByOperator";
  const {mutate} = useWorkOrderList({
    page: 1,
    page_size: 10,
    tab: 0,
  }, urlFix);
  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      name: currentOrder?.name || "",
      found_time: currentOrder?.found_time || format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      order_type: currentOrder?.order_type,
      address: currentOrder?.address || "",
      contact: currentOrder?.contact || "",
      contact_phone: currentOrder?.contact_phone || "",
      longitude: currentOrder?.longitude || 0,
      latitude: currentOrder?.latitude || 0,
      pic_list: currentOrder?.pic_list || [],
      description: currentOrder?.description || "",
      warn_level: currentOrder?.warn_level
    }
  });

  // 使用 watch 监听经纬度值
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");

  // 格式化经纬度，保留三位小数
  const formattedLatitude = typeof latitude === "number" ? latitude.toFixed(3) : "";
  const formattedLongitude = typeof longitude === "number" ? longitude.toFixed(3) : "";

  useEffect(() => {
    if (currentOrder) {
      form.reset({
        name: currentOrder.name,
        found_time: currentOrder.found_time,
        order_type: currentOrder.order_type,
        address: currentOrder.address,
        contact: currentOrder.contact,
        contact_phone: currentOrder.contact_phone,
        longitude: currentOrder.longitude,
        latitude: currentOrder.latitude,
        pic_list: currentOrder.pic_list,
        description: currentOrder.description
      });
    }
  }, [currentOrder, form]);

  useEffect(() => {
    pickPosition(({longitude, latitude}) => {
      console.log(longitude, latitude);
      form.setValue("longitude", longitude);
      form.setValue("latitude", latitude);
    });
  }, []);

  const onSubmit = async (data: CreateOrderFormValues) => {
    console.log("创建工单数据:", data);
    const res: any = await post(`${OPERATION_HTTP_PREFIX}/order/save`, data);
    if (res.data.code === 0) {
      toast({
        description: "工单创建成功！"
      });
      setOpen(false);
      await mutate();
    }
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
      multiple
      autoUpload
    >
      <Form {...form}>
        <form id="createOrderForm" onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({field}) => (
              <FormItem className="grid grid-cols-4 gap-2 items-center">
                <FormLabel className="text-right">事件名称</FormLabel>
                <FormControl>
                  <Input {...field} className="col-span-3 rounded-none h-[40px] bg-[#072E62]/[.7] border-[#43ABFF]"/>
                </FormControl>
                <FormMessage className="col-span-3 col-start-2"/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="order_type"
            render={({field}) => (
              <FormItem className="grid grid-cols-4 gap-2 items-center">
                <FormLabel className="text-right">事件类型</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger className="col-span-3 rounded-none h-[40px] bg-[#072E62]/[.7] border-[#43ABFF]">
                      <SelectValue placeholder="请选择事件类型"/>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(eventMap).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="col-span-3 col-start-2"/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({field}) => (
              <FormItem className="grid grid-cols-4 gap-2 items-center">
                <FormLabel className="text-right">联系人</FormLabel>
                <FormControl>
                  <Input {...field} className="col-span-3 rounded-none h-[40px] bg-[#072E62]/[.7] border-[#43ABFF]"/>
                </FormControl>
                <FormMessage className="col-span-3 col-start-2"/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_phone"
            render={({field}) => (
              <FormItem className="grid grid-cols-4 gap-2 items-center">
                <FormLabel className="text-right">联系电话</FormLabel>
                <FormControl>
                  <Input {...field} className="col-span-3 rounded-none h-[40px] bg-[#072E62]/[.7] border-[#43ABFF]"/>
                </FormControl>
                <FormMessage className="col-span-3 col-start-2"/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="found_time"
            render={({field}) => (
              <FormItem className="grid grid-cols-4 gap-2 items-center">
                <FormLabel className="text-right">发现时间</FormLabel>
                <div className="col-span-3">
                  <FormControl>
                    <DateTimePicker
                      date={field.value ? new Date(field.value) : new Date()}
                      setDate={(date) => {
                        const formattedDate = format(date, "yyyy-MM-dd HH:mm:ss");
                        field.onChange(formattedDate);
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage className="col-span-3 col-start-2"/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="warn_level"
            render={({field}) => (
              <FormItem className="grid grid-cols-4 gap-2 items-center">
                <FormLabel className="text-right">告警等级</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger className="col-span-3 rounded-none h-[40px] bg-[#072E62]/[.7] border-[#43ABFF]">
                      <SelectValue placeholder="请选择告警等级"/>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem key={"1"} value={"1"} className={"text-blue-500"}>一般告警</SelectItem>
                    <SelectItem key={"2"} value={"2"} className={"text-yellow-500"}>次要告警</SelectItem>
                    <SelectItem key={"3"} value={"3"} className={"text-orange-500"}>主要告警</SelectItem>
                    <SelectItem key={"4"} value={"4"} className={"text-red-500"}>紧急告警</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="col-span-3 col-start-2"/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({field}) => (
              <FormItem className="grid grid-cols-4 gap-2">
                <FormLabel className="text-right mt-4">问题描述</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="col-span-3 rounded-none min-h-[100px] bg-[#072E62]/[.7] border-[#43ABFF]"
                  />
                </FormControl>
                <FormMessage className="col-span-3 col-start-2"/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({field}) => (
              <FormItem className="grid grid-cols-4 gap-2">
                <FormLabel className="text-right mt-4">发生地址</FormLabel>
                <FormControl>
                  <div className={"col-span-3 space-y-4"}>
                    <Input {...field} className="rounded-none bg-[#072E62]/[.7] border-[#43ABFF]"/>
                    <div>
                      <Scene/>
                    </div>
                    <span>经纬度：{formattedLongitude}, {formattedLatitude}</span>
                  </div>
                </FormControl>
                <FormMessage className="col-span-3 col-start-2"/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pic_list"
            render={({field}) => (
              <FormItem className="grid grid-cols-4 gap-2 items-center">
                <FormLabel className="text-right pt-2">照片</FormLabel>
                <div className="col-span-3 space-y-4">
                  <FormControl>
                    <ImageUploader field={field}/>
                  </FormControl>
                  <FormMessage/>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Uploady>
  );
};

const FeedbackComponent = ({currentOrder}: { currentOrder: WorkOrder }) => {
  const {post} = useAjax();
  console.log("currentOrder==");
  console.log(currentOrder);
  const {data: operationList} = useOperationList(currentOrder?.id);
  const {data: currentUser} = useCurrentUser();
  const isGly = currentUser?.role === 3;

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      operate_pic_list: currentOrder?.operate_pic_list || [],
      result: currentOrder?.result || ""
    }
  });

  // 判断是否显示表单：status 为 1(待处理) 或 4(未通过) 时显示
  const showForm = !isGly && (currentOrder?.status === 1 || currentOrder?.status === 4);

  const onSubmit = async (values: z.infer<typeof feedbackSchema>) => {
    const formData = {
      ...values,
      order: currentOrder.id,
    };
    console.log("formData");
    console.log(formData);
    const res = await post(`${OPERATION_HTTP_PREFIX}/orderOperation/save`, formData);
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
      multiple
      autoUpload
    >
      {/* 根据 status 条件显示表单 */}
      {showForm && (
        <Form {...form}>
          <form id="feedbackForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="operate_pic_list"
              render={({field}) => (
                <FormItem>
                  <FormLabel>处理图片</FormLabel>
                  <FormControl>
                    <ImageUploader field={field}/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="result"
              render={({field}) => (
                <FormItem className="">
                  <FormLabel className="text-right">处理结果</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="rounded-none min-h-[100px] bg-[#072E62]/[.7] border-[#43ABFF]"
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}

      {/* 分隔线只在有历史记录且显示表单时显示 */}
      {showForm && operationList?.list && operationList.list.length > 0 && (
        <Separator className="my-8 bg-[#43ABFF]/50"/>
      )}

      {/* 历史记录 */}
      {operationList?.list && operationList.list.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#43ABFF]">历史处理记录</h3>
          <div
            className="space-y-6 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#43ABFF] scrollbar-track-[#072E62]">
            {operationList.list.map((record: any, index: number) => (
              <div key={index} className="p-4 border border-[#43ABFF] rounded-sm bg-[#072E62]/[.7]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      处理时间：{dayjs(record.create_time).format("YYYY-MM-DD HH:mm:ss")}
                    </span>
                    <span className={cn(
                      "px-2 py-1 rounded text-sm",
                      record.status === 0 ? "bg-blue-500/20 text-blue-500" :  // 待审核
                        record.status === 1 ? "bg-green-500/20 text-green-500" : // 已通过
                          "bg-red-500/20 text-red-500"                            // 未通过
                    )}>
                      {record.status === 0 ? "待审核" :
                        record.status === 1 ? "已通过" :
                          "未通过"}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-2">处理结果：</h4>
                  <p className="text-white">{record.result}</p>
                </div>

                {record.operate_pic_list && record.operate_pic_list.length > 0 && (
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">处理图片：</h4>
                    <div className="grid grid-cols-4 gap-4">
                      {record.operate_pic_list.map((pic: string, picIndex: number) => (
                        <div key={picIndex} className="relative aspect-video">
                          <img
                            src={pic}
                            alt={`处理图片 ${picIndex + 1}`}
                            className="w-full h-full object-cover rounded-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Uploady>
  );
};

const AuditComponent = ({currentOrder, setOpen}: { currentOrder: WorkOrder, setOpen: (open: boolean) => void }) => {
  const {post} = useAjax();
  const {data: operationList} = useOperationList(currentOrder?.id);
  const form = useForm<z.infer<typeof auditSchema>>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      status: currentOrder?.status
    }
  });
  const {data: currentUser} = useCurrentUser();
  const urlFix = currentUser?.role === 3 ? "page" : "pageByOperator";
  const {mutate} = useWorkOrderList({
    page: 1,
    page_size: 10,
    tab: 0,
  }, urlFix);
  /* // 当 currentOrder 改变时更新表单值
   useEffect(() => {
     if (currentOrder) {
       form.reset({
         status: currentOrder.status
       });
     }
   }, [currentOrder, form]);*/

  const onSubmit = async (data: z.infer<typeof auditSchema>) => {
    const formVale = {
      ...data,
      order_id: currentOrder.id,
      order_operation_id: operationList?.list[0].id
    };
    console.log("formVale");
    console.log(formVale);
    const res = await post(`${OPERATION_HTTP_PREFIX}/order/approve`, formVale);
    if (res.data.message === "success") {
      toast({
        description: "审核完成！"
      });
      setOpen(false);
      await mutate();
    }
  };

  return (
    <Form {...form}>
      <form id="auditForm" onSubmit={form.handleSubmit(onSubmit)} className="">
        <FormField
          control={form.control}
          name="status"
          render={({field}) => (
            <FormItem className="grid grid-cols-4 gap-2 items-center">
              <FormLabel className="text-right">审核结果</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange}>
                  <SelectTrigger className="col-span-1 rounded-none h-[40px] bg-[#072E62]/[.7] border-[#43ABFF]">
                    <SelectValue placeholder="请选择审核结果"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">通过</SelectItem>
                    <SelectItem value="2">不通过</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="col-span-3 col-start-2"/>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

const CompleteComponent = () => {
  return (
    <div
      className="text-lg py-4 text-green-500 font-semibold content-center h-full flex flex-col items-center space-y-4">
      <CircleCheckBig size={64}/>
      <span className={"text-[32px]"}>已归档</span>
    </div>
  );
};

const {useStepper, steps, utils} = defineStepper(
  {
    id: "1",
    title: "创建工单",
  },
  {
    id: "2",
    title: "处理反馈",
  },
  {
    id: "3",
    title: "处理审核",
    description: "Checkout complete"
  },
  {
    id: "4",
    title: "已归档",
  }
);

// 添加工单状态枚举
const OrderStatusMap = {
  0: "待分配",
  1: "待处理",
  2: "待审核",
  3: "已归档",
  4: "未通过"
} as const;

type OrderStatus = keyof typeof OrderStatusMap;
const currentWorkSpaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

const WorkOrderDataTable = () => {
  const [open, setOpen] = useState(false);
  const [distributeOpen, setDistributeOpen] = useState(false);
  const {data: workSpaceList} = useWorkspaceList();
  const {data: departList} = useDepartList();
  const currentWorkSpace = useMemo(() => {
    return workSpaceList?.find(item => item.workspace_id === currentWorkSpaceId);
  }, [workSpaceList, currentWorkSpaceId]);
  const filterDepartList = useMemo(() => {
    return departList?.filter(item => item.workspace === currentWorkSpace?.id);
  }, [departList, currentWorkSpace]);

  const {data: userList} = useMembers(currentWorkSpaceId, {
    page: 1,
    page_size: 1000,
    total: 0
  });

  const {data: currentUser} = useCurrentUser();
  const isGly = currentUser?.role === 3;
  const urlFix = isGly ? "page" : "pageByOperator";
  console.log("urlFix");
  console.log(urlFix);
  const [currentOrder, setCurrentOrder] = useState<WorkOrder | null>(null);

  const columns: ColumnDef<WorkOrder>[] = [
    {
      header: "序号",
      cell: ({row}) => (
        <span>
          {row.index + 1}
        </span>
      )
    },
    {
      accessorKey: "name",
      header: "事件名称",
    },
    {
      accessorKey: "found_time",
      header: "发现时间",
      cell: ({row}) => (
        <span>{dayjs(row.original.found_time).format("YYYY-MM-DD HH:MM:ss")}</span>
      )
    },
    {
      accessorKey: "street",
      header: "涉及街道",
    },
    {
      accessorKey: "address",
      header: "发生地址",
    },
    {
      accessorKey: "contact",
      header: "联系人",
    },
    {
      accessorKey: "contact_phone",
      header: "联系方式",
    },
    {
      accessorKey: "order_type",
      header: "事件类型",
      cell: ({row}) => <span>{eventMap[row.original.order_type as keyof typeof eventMap]}</span>
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({row}) => (
        <span className={cn(
          "px-2 py-1 rounded text-sm",
          {
            "bg-yellow-500/20 text-yellow-500": row.original.status === 0,
            "bg-blue-500/20 text-blue-500": row.original.status === 1,
            "bg-orange-500/20 text-orange-500": row.original.status === 2,
            "bg-green-500/20 text-green-500": row.original.status === 3,
            "bg-red-500/20 text-red-500": row.original.status === 4,
          }
        )}>
          {OrderStatusMap[row.original.status as OrderStatus]}
        </span>
      )
    },
    {
      header: "操作",
      cell: ({row}) => {
        return (
          <span className={`flex items-center space-x-2`}>
            {isGly && <Edit
              className={"w-4 cursor-pointer"}
              onClick={() => {
                setDistributeOpen(true);
                setCurrentOrder(row.original);
              }}
            />}
            <DistributeDialog
              orderNo={currentOrder?.id}
              open={distributeOpen}
              onOpenChange={setDistributeOpen}
              filterDepartList={filterDepartList || []}
              userList={userList}
            />
            <Eye className={"w-4"} onClick={() => {
              setCurrentOrder(row.original);
              stepper.goTo(getStepByStatus(row.original.status));
              setOpen(true);
            }}/>
            <Trash className={"w-4"}/>
          </span>
        );
      }
    }
  ];
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {data} = useWorkOrderList({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    tab: 0,
  }, urlFix);

  useEffect(() => {
    console.log("data==");
    console.log(data);
  }, [data]);

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

  const stepper = useStepper();

  const currentIndex = utils.getIndex(stepper.current.id);

  return (
    <div>
      <div className={"mb-4 text-right"}>
        <Dialog open={open} onOpenChange={(value) => {
          console.log("Dialog onOpenChange:", value);
          if (!value) {
            setCurrentOrder(null);
          }
          setOpen(value);
        }}>
          <DialogTrigger asChild>
            <Button
              className={"bg-[#43ABFF] w-24"}
              onClick={() => {
                setCurrentOrder(null);
                stepper.goTo("1");
              }}
            >
              创建
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-screen-lg bg-[#0A4088]/[.7] text-white border-none">
            <DialogHeader className={""}>
              <DialogTitle>工单创建</DialogTitle>
            </DialogHeader>
            <div className={"border-[2px] border-[#43ABFF] flex p-8"}>
              <ol className="flex flex-col gap-2" aria-orientation="vertical">
                {stepper.all.map((step, index, array) => (
                  <div key={step.id} className={""}>
                    <li className="flex items-center gap-4 flex-shrink-0">
                      <Button
                        type="button"
                        role="tab"
                        variant={index <= currentIndex ? "default" : "secondary"}
                        aria-current={stepper.current.id === step.id ? "step" : undefined}
                        aria-posinset={index + 1}
                        aria-setsize={steps.length}
                        aria-selected={stepper.current.id === step.id}
                        className={cn(
                          "flex size-10 items-center justify-center rounded-full",
                          index <= currentIndex ? "bg-[#43ABFF]" : "",
                          (!currentOrder && step.id !== "1") ||
                          (currentOrder && parseInt(step.id) > parseInt(getStepByStatus(currentOrder.status)))
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        )}
                        onClick={() => {
                          if (!currentOrder && step.id !== "1") return;
                          if (currentOrder && parseInt(step.id) > parseInt(getStepByStatus(currentOrder.status))) return;
                          stepper.goTo(step.id);
                        }}
                      >
                        {index + 1}
                      </Button>
                      <span className={cn(
                        "text-sm font-medium",
                        (!currentOrder && step.id !== "1") ||
                        (currentOrder && parseInt(step.id) > parseInt(getStepByStatus(currentOrder.status)))
                          ? "opacity-50"
                          : ""
                      )}>
                        {step.title}
                      </span>
                    </li>
                    <div className="flex gap-4">
                      {index < array.length - 1 && (
                        <div
                          className="flex justify-center"
                          style={{
                            paddingInlineStart: "1.25rem",
                          }}
                        >
                          <Separator
                            orientation="vertical"
                            className={`w-[2px] h-24`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </ol>
              <div className={"px-4 flex-1"}>
                {stepper.switch({
                  "1": () => <CreateOrderComponent setOpen={setOpen} currentOrder={currentOrder}/>,
                  "2": () => isGly && (currentOrder?.status === 1 || currentOrder?.status === 4) ?
                    <div
                      className="text-lg py-4 text-blue-500 font-semibold content-center h-full flex flex-col items-center space-y-4">
                      <span className={"text-[32px]"}>待处理...</span>
                    </div> :
                    <FeedbackComponent currentOrder={currentOrder}/>,
                  "3": () => isGly ?
                    <AuditComponent setOpen={setOpen} currentOrder={currentOrder}/> :
                    <div
                      className="text-lg py-4 text-blue-500 font-semibold content-center h-full flex flex-col items-center space-y-4">
                      <span className={"text-[32px]"}>审核中...</span>
                    </div>,
                  "4": () => <CompleteComponent/>
                })}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                form={`${stepper.current.id === "1" ? "createOrderForm" :
                  stepper.current.id === "2" ? "feedbackForm" :
                    stepper.current.id === "3" ? "auditForm" : ""}`}
                className="bg-[#43ABFF] w-24"
              >
                确认
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
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

const DistributeDialog = ({
                            open,
                            onOpenChange,
                            filterDepartList,
                            userList,
                            orderNo
                          }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterDepartList: any[];
  userList: any;
  orderNo?: number
}) => {
  const [selectUserList, setSelectUserList] = useState<UserItem[]>([]);
  const {post} = useAjax();
  const [operator, setOperator] = useState<number>();

  // 添加 currentUser 获取
  const {data: currentUser} = useCurrentUser();
  const urlFix = currentUser?.role === 3 ? "page" : "pageByOperator";

  // 使用正确的 urlFix
  const {mutate} = useWorkOrderList({
    page: 1,
    page_size: 10,
    tab: 0,
  }, urlFix);  // 添加 urlFix 参数

  const onDistribute = async () => {
    if (operator && orderNo) {
      const res: any = await post(`${OPERATION_HTTP_PREFIX}/order/deliver`, {
        id: orderNo,
        operator
      });
      if (res.data.code === 0) {
        toast({
          description: "工单分配成功！"
        });
        onOpenChange(false);
        await mutate();  // 这里的 mutate 现在会使用正确的 urlFix
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>工单分配</DialogTitle>
        </DialogHeader>
        <div className={"space-y-4"}>
          <div className={"grid grid-cols-4 items-center gap-4"}>
            <span className={"text-right"}>分配部门</span>
            <Select onValueChange={(value) => {
              const filterUserList = userList?.list.filter(item => item.organs.includes(+value)) || [];
              setSelectUserList(filterUserList);
            }}>
              <SelectTrigger className={"col-span-3"}>
                <SelectValue placeholder="选择分配部门"/>
              </SelectTrigger>
              <SelectContent>
                {filterDepartList?.map(item =>
                  <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className={"grid grid-cols-4 items-center gap-4"}>
            <span className={"text-right"}>分配人员</span>
            <Select onValueChange={(value) => setOperator(+value)}>
              <SelectTrigger className={"col-span-3"}>
                <SelectValue placeholder="选择人员"/>
              </SelectTrigger>
              <SelectContent>
                {selectUserList.map(user =>
                  <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button className={"bg-[#43ABFF] w-24"} onClick={onDistribute}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 修改工具函数
const getStepByStatus = (status: number) => {
  switch (status) {
    case 0: // 待分配
      return "1";
    case 1: // 已分配/待处理
      return "2";
    case 2: // 已处理/待审核
      return "3";
    case 3: // 处理通过
      return "4";
    case 4: // 处理未通过，返回到处理步骤
      return "2";
    default:
      return "1";
  }
};

export default WorkOrderDataTable;

