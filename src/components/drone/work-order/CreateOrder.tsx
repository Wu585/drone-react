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
import {useCallback, useEffect, useRef, useState} from "react";
import {pickPosition} from "@/components/toolbar/tools";
import {useItemFinishListener} from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import {UploadCloud, X} from "lucide-react";
import {cn, uuidv4} from "@/lib/utils";
import {eventMap, WorkOrder} from "@/hooks/drone";
import {PreviewMethods, UploadPreview} from "@rpldy/upload-preview";
import {getMediaType} from "@/hooks/drone/order";
import {Button} from "@/components/ui/button.tsx";
import ReviewSheet from "@/components/drone/work-order/ReviewSheet.tsx";
import {MediaPreview} from "@/components/drone/MediaPreview.tsx";
import CreateOrderScene from "@/components/drone/public/CreateOrderScene.tsx";

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
  type?: "create" | "preview" | "edit" | "form-media";
  onSuccess?: () => void;
}

const CreateOrder = ({currentOrder, onSuccess, type = "create"}: Props) => {
  console.log("currentOrder");
  console.log(currentOrder);
  const departId = localStorage.getItem("departId");

  const [open, setOpen] = useState(false);
  const {post} = useAjax();
  const [mediaUrlList, setMediaUrlList] = useState<string[]>([]);
  const [fileList, setFileList] = useState<{ id: string, fileKey: string }[]>([]);
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
  const formattedLatitude = typeof latitude === "number" ? latitude.toFixed(5) : "";
  const formattedLongitude = typeof longitude === "number" ? longitude.toFixed(5) : "";

  useEffect(() => {
    !isPreview && pickPosition(({longitude, latitude}) => {
      form.setValue("longitude", longitude);
      form.setValue("latitude", latitude);
    });
  }, []);

  useEffect(() => {
    if (currentOrder) {
      const initialFileList = currentOrder.pic_list_origin?.map(item => ({
        fileKey: item,
        id: uuidv4()
      })) || [];

      setFileList(initialFileList);
      setMediaUrlList(currentOrder.pic_list || []);

      form.reset({
        ...currentOrder,
        pic_list: initialFileList.map(item => item.fileKey)
      });
    }
  }, [currentOrder, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Form values changed:", value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useItemFinishListener(useCallback(({uploadResponse, id}) => {
    if (uploadResponse?.data?.data) {
      setFileList(prevFileList => {
        const newFileList = [...prevFileList, {
          id,
          fileKey: uploadResponse?.data?.data
        }];
        form.setValue("pic_list", newFileList.map(item => item.fileKey));
        return newFileList;
      });
    }
  }, [form]));

  const onSubmit = async (values: CreateOrderFormValues) => {
    if (isPreview) return;
    const data = {
      ...values,
      found_time: dayjs(values.found_time).format("YYYY-MM-DD HH:mm:ss"),
      street: "",
      street_code: "",
      organ: departId
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

  const previewMethodsRef = useRef<PreviewMethods>(null);

  const onClear = useCallback((id: string) => {
    if (previewMethodsRef.current?.removePreview) {
      previewMethodsRef.current.removePreview(id);
      setFileList(prevFileList => {
        const newFileList = prevFileList.filter(item => item.id !== id);
        form.setValue("pic_list", newFileList.map(item => item.fileKey));
        return newFileList;
      });
    }
  }, [previewMethodsRef, form]);

  const onEditRemove = useCallback((url: string) => {
    const index = mediaUrlList.indexOf(url);
    setMediaUrlList(mediaUrlList.filter(item => item !== url));
    const newPicList = form.getValues("pic_list").filter((_, i) => i !== index);
    form.setValue("pic_list", newPicList);
  }, [form, mediaUrlList]);

  return (
    <Form {...form}>
      <ReviewSheet open={open} setOpen={setOpen} currentOrder={currentOrder}/>
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
                    "border-2 border-dashed border-[#43ABFF] rounded-sm p-4 text-center transition-colors",
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
                        支持图片、视频格式
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
                <div className={"col-span-3 space-y-4 whitespace-nowrap"}>
                  <Input disabled={isPreview} {...field} className="rounded-none bg-[#072E62]/[.7] border-[#43ABFF]"/>
                  <div>
                    <CreateOrderScene currentOrder={currentOrder}/>
                  </div>
                  <span>经纬度：{formattedLongitude}, {formattedLatitude}</span>
                  {isPreview && <Button className={"h-8 ml-2 bg-[#43ABFF]"} type={"button"}
                                        onClick={() => setOpen(true)}>无人机核查</Button>}
                </div>
              </FormControl>
              <FormMessage className="col-span-3 col-start-2"/>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4 mt-4 ml-24 overflow-auto max-h-[168px]">
          {(type === "edit" || type === "form-media") && mediaUrlList.map(url => {
            const fileType = getMediaType(url);
            return <div className="relative group aspect-video" key={url}>
              {fileType === "video" ? <video
                key={url}
                muted
                loop
                controls
                className="w-full h-full object-cover rounded-sm"
                src={url}
              /> : <img
                key={url}
                src={url}
                className="w-full h-full object-cover rounded-sm"
              />}
              <button
                onClick={() => onEditRemove(url)}
                type="button"
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full
                         text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>;
          })}
          <UploadPreview
            previewMethodsRef={previewMethodsRef}
            rememberPreviousBatches
            PreviewComponent={({url, type: fileType, id}) => <div className="relative group aspect-video">
              {fileType === "video" ? (
                <video
                  muted
                  loop
                  controls
                  className="w-full h-full object-cover rounded-sm"
                  src={url}
                />
              ) : (
                <img
                  src={url}
                  className="w-full h-full object-cover rounded-sm"
                />
              )}
              <button
                type="button"
                onClick={() => onClear(id)}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full
                         text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>}
          />
          {type === "preview" && mediaUrlList.map(url => {
            const fileType = getMediaType(url);
            return <div className="relative group aspect-video">
              {fileType === "video" ?
                <MediaPreview
                  src={url}
                  type="video"
                  alt="Example Video"
                  modalWidth="70vw"
                  modalHeight="70vh"
                  triggerElement={<video
                    controls
                    key={url}
                    muted
                    className="w-full h-full object-cover rounded-sm"
                    src={url}
                  />}
                />
                :
                <MediaPreview
                  src={url}
                  type="image"
                  alt="Example Image"
                  modalWidth="1000px"
                  modalHeight="800px"
                  triggerElement={<img
                    key={url}
                    src={url}
                    className="w-full h-full object-cover rounded-sm border-2"
                  />}
                />
              }
            </div>;
          })}
        </div>
      </form>
    </Form>
  );
};

export default CreateOrder;

