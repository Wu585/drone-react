import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import NewCommonDateRangePicker from "@/components/public/NewCommonDateRangePicker.tsx";
import {useMemo} from "react";
import {Device, useFileUrl} from "@/hooks/drone";
import {useAjax} from "@/lib/http.ts";
import dayjs from "dayjs";
import {HTTP_PREFIX} from "@/api/manage.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {UploadCloud} from "lucide-react";
import UploadButton from "@rpldy/upload-button";
import {useItemFinishListener} from "@rpldy/uploady";
import {toast} from "@/components/ui/use-toast.ts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: Device;
  onSuccess?: () => void;
}

const insuranceSchema = z.object({
  device_sn: z.string().min(1, {
    message: "请选择设备"
  }),
  insurance: z.string().min(1, {
    message: "请输入保单号"
  }),
  insurance_time: z.object({
    insurance_begin_time: z.string().min(1, {
      message: "请选择开始时间"
    }),
    insurance_end_time: z.string().min(1, {
      message: "请选择截止时间"
    })
  }),
  insurance_file_key: z.string().min(1, {
    message: "请上传保单文件"
  }),
});

type insuranceFormValues = z.infer<typeof insuranceSchema>;

const InsuranceSheet = ({open, onOpenChange, device, onSuccess}: Props) => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {post} = useAjax();

  const defaultValues = {
    device_sn: "",
    insurance: "",
    insurance_time: {
      insurance_begin_time: "",
      insurance_end_time: ""
    },
    insurance_file_key: ""
  };

  const {data: pdfUrl} = useFileUrl(device?.insurance_file_key || "");

  const form = useForm<insuranceFormValues>({
    resolver: zodResolver(insuranceSchema),
    defaultValues,
    values: {
      device_sn: device?.device_sn || "",
      insurance: device?.insurance || "",
      insurance_time: {
        insurance_begin_time: device?.insurance_begin_time ? dayjs(device?.insurance_begin_time).format("YYYY-MM-DD HH:mm:ss") : "",
        insurance_end_time: device?.insurance_end_time ? dayjs(device?.insurance_end_time).format("YYYY-MM-DD HH:mm:ss") : ""
      },
      insurance_file_key: device?.insurance_file_key || ""
    }
  });

  const insurance_time = form.getValues("insurance_time");

  const dateRange = useMemo(() => {
    if (!insurance_time.insurance_begin_time || !insurance_time.insurance_end_time) return;

    const begin_time = dayjs(insurance_time.insurance_begin_time).toDate();
    const end_time = dayjs(insurance_time.insurance_end_time).toDate();
    return [begin_time, end_time];
  }, [insurance_time]);

  const onSelectDate = (dateRange?: Date[]) => {
    if (!dateRange) return;

    const insurance_begin_time = dayjs(dateRange[0]).format("YYYY-MM-DD HH:mm:ss");
    const insurance_end_time = dayjs(dateRange[1]).format("YYYY-MM-DD HH:mm:ss");

    form.setValue("insurance_time", {
      insurance_begin_time,
      insurance_end_time
    });
  };

  useItemFinishListener(async ({uploadResponse}) => {
    if (uploadResponse?.data?.data) {
      form.setValue("insurance_file_key", uploadResponse?.data?.data);
      toast({
        description: "上传成功！"
      });
    }
  });

  const onSubmit = async (values: insuranceFormValues) => {
    console.log("values");
    console.log(values);
    const body = {
      ...values,
      ...values.insurance_time
    };
    console.log("body");
    console.log(body);
    const res: any = await post(`${HTTP_PREFIX}/devices/${workspaceId}/addInsurance`, body);
    if (res.data.code === 0) {
      toast({
        description: "保险信息更新成功！"
      });
      onSuccess?.();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[#072E62] border-l border-[#43ABFF] text-white sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="text-lg font-medium text-white">保险信息</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                render={({field}) =>
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right text-[#D0D0D0]">
                      设备SN
                    </FormLabel>
                    <FormControl>
                      <div className="col-span-3">
                        <Input {...field} 
                          disabled 
                          className="bg-[#0A4088]/70 border-[#43ABFF]/30 text-[#D0D0D0]"
                        />
                        <FormMessage className="text-red-500"/>
                      </div>
                    </FormControl>
                  </FormItem>
                }
                name="device_sn"
              />
              <FormField
                control={form.control}
                render={({field}) =>
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right text-[#D0D0D0]">
                      保单号
                    </FormLabel>
                    <FormControl>
                      <div className="col-span-3">
                        <Input {...field} 
                          className="bg-[#0A4088]/70 border-[#43ABFF]/30 text-[#D0D0D0]"
                        />
                        <FormMessage className="text-red-500"/>
                      </div>
                    </FormControl>
                  </FormItem>
                }
                name="insurance"
              />
              <FormField
                control={form.control}
                render={() =>
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right text-[#D0D0D0]">
                      有效期
                    </FormLabel>
                    <FormControl>
                      <div className="col-span-3">
                        <NewCommonDateRangePicker
                          date={dateRange}
                          setDate={onSelectDate}
                          className="bg-[#0A4088]/70 border-[#43ABFF]/30 text-[#D0D0D0]"
                        />
                        <FormMessage className="text-red-500"/>
                      </div>
                    </FormControl>
                  </FormItem>
                }
                name="insurance_time"
              />
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right text-[#D0D0D0]">
                      保单文件
                    </FormLabel>
                    <FormControl>
                      <div className="col-span-3">
                        <div className="relative">
                          <Input
                            disabled
                            value={field.value}
                            readOnly
                            placeholder="请选择PDF文件"
                            className="bg-[#0A4088]/70 border-[#43ABFF]/30 text-[#D0D0D0] pr-24"
                          />
                          <UploadButton
                            onClick={e => e.preventDefault()}
                            className="absolute right-0 top-0 h-full px-3 bg-[#43ABFF] hover:bg-[#43ABFF]/80 text-white rounded-r"
                          >
                            <div className="flex items-center gap-2">
                              <UploadCloud size={16}/>
                              <span>上传</span>
                            </div>
                          </UploadButton>
                        </div>
                        {pdfUrl && (
                          <div className="mt-2">
                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#43ABFF] hover:text-[#43ABFF]/80 text-sm flex items-center gap-1"
                            >
                              <span>当前保单</span>
                            </a>
                          </div>
                        )}
                        <FormMessage className="text-red-500"/>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
                name="insurance_file_key"
              />
            </div>
            <SheetFooter>
              <Button 
                type="submit"
                className="bg-[#43ABFF] hover:bg-[#43ABFF]/80 text-white"
              >
                保存
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default InsuranceSheet;

