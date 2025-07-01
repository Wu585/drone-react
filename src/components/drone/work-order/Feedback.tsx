import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {cn} from "@/lib/utils.ts";
import UploadButton from "@rpldy/upload-button";
import {Plus} from "lucide-react";
import {
  useBatchFinishListener,
  useBatchProgressListener,
  useBatchStartListener,
  useItemFinishListener
} from "@rpldy/uploady";
import {useAjax} from "@/lib/http.ts";
import {useCallback, useRef, useState} from "react";
import {toast} from "@/components/ui/use-toast.ts";
import {useOperationList, WorkOrder} from "@/hooks/drone";
import dayjs from "dayjs";
import {MediaPreview} from "@/components/drone/MediaPreview.tsx";
import OrderDetail from "@/components/drone/work-order/OrderDetail.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import {PreviewComponentProps, PreviewMethods, UploadPreview} from "@rpldy/upload-preview";
import UploadPreviewItem from "@/components/drone/work-order/UploadPreviewItem.tsx";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import {OrderStatusMap} from "@/components/drone/work-order/order-eventmap.ts";

const feedbackSchema = z.object({
  operate_pic_list: z.array(z.string()).min(1, "请至少上传一张图片"),
  result: z.string().min(1, "请描述处理结果"),
});

interface Props {
  currentOrder?: WorkOrder;
  onSuccess?: () => void;
  type?: "handle" | "preview";
}

const OPERATION_HTTP_PREFIX = "operation/api/v1";

const Feedback = ({currentOrder, onSuccess, type = "handle"}: Props) => {
  const previewMethodsRef = useRef<PreviewMethods>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileList, setFileList] = useState<{ id: string, fileKey: string }[]>([]);
  const defaultValues = {
    operate_pic_list: [],
    result: ""
  };
  console.log("type");
  console.log(type);
  const isPreview = type === "preview" || (currentOrder?.status !== 1 && currentOrder?.status !== 4);
  console.log("isPreview");
  console.log(isPreview);
  const {post} = useAjax();
  const {data: operationList} = useOperationList(currentOrder?.id);
  console.log("operationList");
  console.log(operationList);
  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues
  });

  useItemFinishListener(async ({uploadResponse, id}) => {
    const fileKey = uploadResponse?.data?.data;
    if (fileKey) {
      setFileList(prevFileList => {
        const newFileList = [...prevFileList, {id, fileKey}];
        form.setValue("operate_pic_list", newFileList.map(({fileKey}) => fileKey));
        return newFileList;
      });
    }
  });

  useBatchStartListener(() => {
    setIsUploading(true);
    setProgress(0);
  });

  useBatchProgressListener((batch) => {
    setProgress(batch.completed * 100);
  });

  useBatchFinishListener(() => {
    setIsUploading(false);
    toast({
      description: "上传成功！"
    });
  });

  const onClear = useCallback((id: string) => {
    if (previewMethodsRef.current?.removePreview) {
      previewMethodsRef.current.removePreview(id);
      setFileList(prevFileList => {
        const newFileList = prevFileList.filter(item => item.id !== id);
        form.setValue("operate_pic_list", newFileList.map(item => item.fileKey));
        return newFileList;
      });
    }
  }, [previewMethodsRef, form]);

  const PreviewComponent = useCallback(({url, type, id}: PreviewComponentProps) => {
    return url ? (
      <UploadPreviewItem classname={"w-20 h-20"} url={url} type={type} id={id} onClear={() => onClear(id)}/>
    ) : undefined;
  }, [onClear]);

  const onSubmit = async (values: z.infer<typeof feedbackSchema>) => {
    if (isPreview) return;
    if (isUploading) {
      return toast({
        description: "文件还未上传完成！",
        variant: "destructive"
      });
    }
    const formData = {
      ...values,
      order: currentOrder?.id
    };
    console.log("formData");
    console.log(formData);
    try {
      const res: any = await post(`${OPERATION_HTTP_PREFIX}/orderOperation/save`, formData);
      if (res.data.code === 0) {
        toast({
          description: "工单处理成功！"
        });
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        description: error.data.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className={"max-h-[420px] overflow-auto space-y-4"}>
      <OrderDetail currentOrder={currentOrder}/>
      <div className={"flex space-x-2"}>
        <h1 className={"text-blue-500 font-semibold text-lg "}>工单状态：</h1>
        <div className={cn({
          "text-yellow-500": currentOrder?.status === 0,
          "text-blue-500": currentOrder?.status === 1,
          "text-orange-500": currentOrder?.status === 2,
          "text-green-500": currentOrder?.status === 3,
          "text-red-500": currentOrder?.status === 4,
        }, "text-lg font-semibold")}>
          <span className={"text-lg"}>{OrderStatusMap[currentOrder?.status]}</span>
        </div>
      </div>
      {isPreview ? operationList?.list && operationList.list.length > 0 &&
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#43ABFF]">历史处理记录</h3>
          <div
            className="space-y-6 scrollbar-thin scrollbar-thumb-[#43ABFF] scrollbar-track-[#072E62]">
            {operationList.list.map((record, index: number) => (
              <div key={index} className="p-4 border bg-[#223B6F]/[.5] rounded border-none space-y-2">
                <div className="flex items-center justify-between">
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

                {record.status === 2 && <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      未通过原因：
                    </span>
                    <span className={"text-sm text-red-500"}>
                      {record.reason}
                    </span>
                  </div>
                </div>}

                <div className="flex">
                  <h4 className="text-sm text-gray-400">处理结果：</h4>
                  <p className="text-white">{record.result}</p>
                </div>

                {record.operate_pic_list && record.operate_pic_list.length > 0 && (
                  <div className={"flex"}>
                    <h4 className="text-sm text-gray-400 mb-2 shrink-0">处理图片：</h4>
                    <div className="grid grid-cols-8 gap-4">
                      {record.operate_pic_list?.map((pic: string, picIndex: number) => (
                        <div key={picIndex} className="relative aspect-video">
                          <MediaPreview
                            src={pic}
                            type="image"
                            alt="Example Image"
                            modalWidth="1000px"
                            modalHeight="800px"
                            triggerElement={<img
                              src={pic}
                              alt={`处理图片 ${picIndex + 1}`}
                              className="w-full h-full object-fill rounded-sm"
                            />}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div> : <Form {...form}>
        <form id="feedbackForm" onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4">
          {operationList && operationList?.list?.length > 0 && operationList?.list[0].reason &&
            <div className={"flex text-sm space-x-2"}>
              <span className={"text-red-500"}>未通过原因：</span>
              <span className={"text-red-500"}>{operationList?.list[0].reason}</span>
            </div>}
          <FormField
            control={form.control}
            name="result"
            render={({field}) => (
              <FormItem className="grid grid-cols-[auto_1fr] gap-x-4 space-y-0">
                {/* 第一行：标签 + 输入框 */}
                <FormLabel className="self-center">处理结果：</FormLabel>
                <FormControl>
                  <CommonInput
                    className="w-full"
                    disabled={isPreview}
                    {...field}
                  />
                </FormControl>

                {/* 第二行：错误信息（自动对齐到第 2 列） */}
                <div/>
                {/* 占位，确保错误信息在第 2 列 */}
                <FormMessage/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            render={() =>
              <FormItem className="flex items-center space-x-4 space-y-0">
                <FormLabel className="text-left shrink-0">处理图片：</FormLabel>
                <FormControl>
                  <ScrollArea className={""}>
                    <div className={"flex space-x-2"}>
                      <UploadButton
                        extraProps={{
                          type: "button",
                          disabled: isUploading || isPreview,
                        }}
                        className={cn("border-[#2D5FAC]/[.85] border-[1px] w-20 h-20 rounded-[2px] shrink-0 relative", (isUploading || isPreview) && "opacity-50")}
                      >
                        {!isUploading ? <div className={"h-full content-center"}>
                          <Plus/>
                        </div> : <div className="absolute inset-0 flex items-center justify-center">
                          <Progress value={progress} className="w-[60%] h-2"/>
                        </div>}
                      </UploadButton>
                      <UploadPreview
                        previewMethodsRef={previewMethodsRef}
                        rememberPreviousBatches
                        PreviewComponent={PreviewComponent}
                      />

                    </div>
                    <ScrollBar orientation="horizontal"/>
                  </ScrollArea>
                </FormControl>
                <FormMessage className={"col-start-3 col-span-8"}/>
              </FormItem>}
            name={"operate_pic_list"}
          />
        </form>
      </Form>
      }
    </div>
  );
};

export default Feedback;

