import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {toast} from "@/components/ui/use-toast.ts";
import {useAjax} from "@/lib/http.ts";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {DateTimePicker} from "@/components/ui/date-time-picker.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import Scene from "@/components/drone/public/Scene.tsx";
import {useEffect, useState} from "react";
import {pickPosition} from "@/components/toolbar/tools";
import {useItemFinishListener} from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import {UploadCloud, X} from "lucide-react";
import {cn} from "@/lib/utils";
import {WorkOrder} from "@/hooks/drone";

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
  found_time: z.coerce.number(),
  order_type: z.number({
    required_error: "请选择事件类型",
    invalid_type_error: "事件类型必须是数字"
  }).refine(
    (val) => Object.keys(eventMap).map(Number).includes(val),
    "请选择有效的事件类型"
  ),
  address: z.string().min(1, "请输入发生地址"),
  contact: z.string().min(1, "请输入联系人"),
  contact_phone: z.string()
    .min(1, "请输入联系电话")
    .regex(/^1[3-9]\d{9}$/, "请输入正确的手机号码"),
  longitude: z.coerce.number({
    invalid_type_error: "经度必须是数字"
  }),
  latitude: z.coerce.number({
    invalid_type_error: "纬度必须是数字"
  }),
  pic_list: z.array(z.string())
    .min(1, "请至少上传一张图片")
    .default([]),
  description: z.string().min(3, "请输入事件内容描述"),
  warning_level: z.coerce.number({
    required_error: "请选择告警类型",
    invalid_type_error: "告警类型必须是数字"
  })
});

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

const OPERATION_HTTP_PREFIX = "operation/api/v1";

interface Props {
  currentOrder?: WorkOrder;
  type?: "create" | "preview" | "edit";
  onSuccess?: () => void;
}

const CreateOrder = ({currentOrder, onSuccess, type = "create"}: Props) => {
  const {post} = useAjax();
  const [imageUrlList, setImageUrlList] = useState<string[]>([]);
  const isPreview = type === "preview";

  const defaultValues = {
    name: "",
    found_time: dayjs().valueOf(),
    order_type: 0,
    address: "",
    contact: "",
    contact_phone: "",
    longitude: 0,
    latitude: 0,
    pic_list: [],
    description: "",
    warning_level: 1
  };

  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: defaultValues
  });

  // 使用 watch 监听经纬度值
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");

  // 格式化经纬度，保留三位小数
  const formattedLatitude = typeof latitude === "number" ? latitude.toFixed(3) : "";
  const formattedLongitude = typeof longitude === "number" ? longitude.toFixed(3) : "";

  useEffect(() => {
    !isPreview && pickPosition(({longitude, latitude}) => {
      form.setValue("longitude", longitude);
      form.setValue("latitude", latitude);
    });
  }, []);

  useEffect(() => {
    if (currentOrder) {
      form.reset(currentOrder);
      setImageUrlList(currentOrder.pic_list || []);
    }
  }, [currentOrder]);

  useItemFinishListener(async ({uploadResponse}) => {
    if (uploadResponse?.data?.data) {
      form.setValue("pic_list", [...form.getValues("pic_list"), uploadResponse?.data?.data]);
      const res: any = await post(`${OPERATION_HTTP_PREFIX}/file/getUrl?key=${uploadResponse?.data?.data}`);
      if (res.data.code === 0) {
        setImageUrlList([...imageUrlList, res.data.data]);
      }
    }
  });

  const onSubmit = async (values: CreateOrderFormValues) => {
    if (isPreview) return;
    const data = {
      ...values,
      found_time: dayjs(values.found_time).format("YYYY-MM-DD HH:mm:ss"),
      street: "",
      street_code: ""
    };
    console.log("data===");
    console.log(data);
    try {
      if (currentOrder && type === "edit") {
        const res: any = await post(`${OPERATION_HTTP_PREFIX}/order/save`, {
          ...data,
          id: currentOrder.id
        });
        if (res.data.code === 0) {
          toast({
            description: "工单更新成功！"
          });
          onSuccess?.();
          form.reset(defaultValues);
        }
      } else {
        const res: any = await post(`${OPERATION_HTTP_PREFIX}/order/save`, data);
        if (res.data.code === 0) {
          toast({
            description: "工单创建成功！"
          });
          onSuccess?.();
          form.reset(defaultValues);
        }
      }
    } catch (error: any) {
      toast({
        description: error.data.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form id="createOrderForm" onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem className="grid grid-cols-4 gap-2">
              <FormLabel className="text-right mt-4">事件名称</FormLabel>
              <FormControl>
                <div className={"flex flex-col col-span-3"}>
                  <Input disabled={isPreview} {...field}
                         className="rounded-none h-[40px] bg-[#072E62]/[.7] border-[#43ABFF]"/>
                  <FormMessage className="col-span-3 col-start-2"/>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order_type"
          render={({field}) => (
            <FormItem className="grid grid-cols-4 gap-2">
              <FormLabel className="text-right mt-4">事件类型</FormLabel>
              <Select disabled={isPreview} onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}>
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
            <FormItem className="grid grid-cols-4 gap-2">
              <FormLabel className="text-right mt-4">联系人</FormLabel>
              <FormControl>
                <div className={"flex flex-col col-span-3"}>
                  <Input disabled={isPreview} {...field}
                         className="rounded-none h-[40px] bg-[#072E62]/[.7] border-[#43ABFF]"/>
                  <FormMessage className="col-span-3 col-start-2"/>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_phone"
          render={({field}) => (
            <FormItem className="grid grid-cols-4 gap-2">
              <FormLabel className="text-right mt-4">联系电话</FormLabel>
              <FormControl>
                <div className={"flex flex-col col-span-3"}>
                  <Input disabled={isPreview} {...field}
                         className="rounded-none h-[40px] bg-[#072E62]/[.7] border-[#43ABFF]"/>
                  <FormMessage className="col-span-3 col-start-2"/>
                </div>
              </FormControl>
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
                    disabled={isPreview}
                    date={field.value ? new Date(field.value) : new Date()}
                    setDate={(date) => {
                      const found_time = dayjs(date).valueOf();
                      field.onChange(found_time);
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
          name="warning_level"
          render={({field}) => (
            <FormItem className="grid grid-cols-4 gap-2 items-center">
              <FormLabel className="text-right">告警等级</FormLabel>
              <Select disabled={isPreview} onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}>
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
                <div className={"flex flex-col col-span-3"}>
                  <Textarea
                    disabled={isPreview}
                    {...field}
                    className="rounded-none min-h-[100px] bg-[#072E62]/[.7] border-[#43ABFF] resize-none"
                  />
                  <FormMessage className="col-span-3 col-start-2"/>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pic_list"
          render={() => (
            <FormItem className="grid grid-cols-4 gap-2">
              <FormLabel className="text-right mt-4">照片上传</FormLabel>
              <FormControl>
                <div className={"col-span-3"}>
                  <div className={cn(
                    "w-full h-full border-2 border-dashed border-[#43ABFF] rounded-sm p-4 text-center transition-colors",
                    isPreview
                      ? "opacity-50 cursor-not-allowed pointer-events-none bg-[#072E62]/[.7]"
                      : "hover:bg-[#072E62] cursor-pointer"
                  )}>
                    <UploadButton
                      className="w-full"
                      onClick={(e) => e.preventDefault()}
                    >
                      <UploadCloud className={cn("w-8 h-8 mx-auto", isPreview ? "text-[#43ABFF]/50" : "text-[#43ABFF]"
                      )}/>
                      <div className={cn("text-sm", isPreview ? "text-[#43ABFF]/50" : "text-[#43ABFF]")}>
                        点击上传
                        <br/>
                        支持图片格式：JPG、PNG、JPEG
                      </div>
                    </UploadButton>
                  </div>
                  <FormMessage/>
                </div>
              </FormControl>
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
                  <Input disabled={isPreview} {...field} className="rounded-none bg-[#072E62]/[.7] border-[#43ABFF]"/>
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

        <div className="grid grid-cols-4 gap-4 mt-4 ml-24 overflow-auto max-h-[150px]">
          {imageUrlList?.map((url, index) => (
            <div key={url} className="relative group aspect-video">
              <img
                src={url}
                alt={`上传图片 ${index + 1}`}
                className="w-full h-full object-fill rounded-sm"
              />
              {!isPreview && <button
                type="button"
                onClick={() => {
                  const newUrls = imageUrlList?.filter((_, i) => i !== index);
                  setImageUrlList(newUrls);
                  console.log("form.getValues(\"pic_list\")");
                  console.log(form.getValues("pic_list"));
                  const newPicList = form.getValues("pic_list").filter((_, i) => i !== index);
                  console.log("newPicList");
                  console.log(newPicList);
                  form.setValue("pic_list", newPicList);
                }}
                className="absolute top-[2px] right-[2px] p-1 bg-red-500 rounded-full
                         text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4"/>
              </button>}
            </div>
          ))}
        </div>

      </form>
    </Form>
  );
};

export default CreateOrder;

