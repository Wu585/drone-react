import {Device} from "@/hooks/drone";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useEffect} from "react";
import CommonDialog from "@/components/drone/public/CommonDialog.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";

export interface EditDeviceFormValues {
  nickname: string;
}

const editDeviceFormSchema = z.object({
  nickname: z.string().min(1, "请输入设备名称")
});

export interface EditDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: Device;
  title?: string;
  label?: string;
  placeholder?: string;
  onSubmit: (values: EditDeviceFormValues) => Promise<void>;
}

export const EditDeviceDialog = ({
                                   open,
                                   onOpenChange,
                                   device,
                                   title = "设备编辑",
                                   label = "设备名称：",
                                   placeholder = "输入设备名称",
                                   onSubmit
                                 }: EditDeviceDialogProps) => {
  const form = useForm<EditDeviceFormValues>({
    resolver: zodResolver(editDeviceFormSchema),
    defaultValues: {
      nickname: device?.nickname || ""
    }
  });

  useEffect(() => {
    if (device) {
      form.reset({nickname: device.nickname || ""});
    }
  }, [device, form]);

  return (
    <CommonDialog
      title={title}
      open={open}
      onOpenChange={onOpenChange}
      showCancel={false}
      customFooter={
        <div className="flex">
          <CommonButton type="submit" form="edit-device-form" className={"ml-auto"}>确认</CommonButton>
        </div>}
    >
      <Form {...form}>
        <form id="edit-device-form"
              onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="nickname"
            render={({field}) => (
              <FormItem>
                <div className="grid grid-cols-10 items-center">
                  <FormLabel className="col-span-2">
                    {label}
                  </FormLabel>
                  <div className="col-span-8">
                    <FormControl>
                      <CommonInput
                        {...field}
                        placeholder={placeholder}
                      />
                    </FormControl>
                    <FormMessage className="text-[#ff4d4f] text-sm"/>
                  </div>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </CommonDialog>
  );
};
