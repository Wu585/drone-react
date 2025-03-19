import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {cn} from "@/lib/utils.ts";
import UploadButton from "@rpldy/upload-button";
import {UploadCloud, X} from "lucide-react";
import {useItemFinishListener} from "@rpldy/uploady";
import {useAjax} from "@/lib/http.ts";
import {useState} from "react";
import {toast} from "@/components/ui/use-toast.ts";
import {WorkOrder} from "@/hooks/drone";

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
  const defaultValues = {
    operate_pic_list: [],
    result: ""
  };
  const isPreview = type === "preview";
  const {post} = useAjax();
  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues
  });
  const [imageUrlList, setImageUrlList] = useState<string[]>([]);
  useItemFinishListener(async ({uploadResponse}) => {
    if (uploadResponse?.data?.data) {
      form.setValue("operate_pic_list", [...form.getValues("operate_pic_list"), uploadResponse?.data?.data]);
      const res: any = await post(`${OPERATION_HTTP_PREFIX}/file/getUrl?key=${uploadResponse?.data?.data}`);
      if (res.data.code === 0) {
        setImageUrlList([...imageUrlList, res.data.data]);
      }
    }
  });

  const onSubmit = async (values: z.infer<typeof feedbackSchema>) => {
    console.log("values");
    console.log(values);
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
    <Form {...form}>
      <form id="feedbackForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="result"
          render={({field}) => (
            <FormItem className="">
              <FormLabel className="text-right">处理结果</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isPreview}
                  {...field}
                  className="rounded-none min-h-[150px] bg-[#072E62]/[.7] border-[#43ABFF] resize-none"
                />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="operate_pic_list"
          render={() => (
            <FormItem>
              <FormLabel>处理图片</FormLabel>
              <FormControl>
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
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-8 gap-4 mt-4 overflow-auto max-h-[150px]">
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
                  const newPicList = form.getValues("operate_pic_list").filter((_, i) => i !== index);
                  console.log("newPicList");
                  console.log(newPicList);
                  form.setValue("operate_pic_list", newPicList);
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

export default Feedback;

