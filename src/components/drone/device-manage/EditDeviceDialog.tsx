import {Device} from "@/hooks/drone";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useEffect} from "react";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#072E62] border border-[#43ABFF] text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nickname"
              render={({field}) => (
                <FormItem>
                  <div className="grid grid-cols-[100px_1fr] items-start gap-4">
                    <FormLabel className="text-right leading-[32px] text-[#D0D0D0]">
                      {label}
                    </FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={placeholder}
                          className="bg-transparent border-[#43ABFF] text-white placeholder:text-gray-400 h-8"
                        />
                      </FormControl>
                      <FormMessage className="text-[#ff4d4f] text-sm"/>
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#0A81E1] hover:bg-[#0A81E1]/80 text-white h-8 px-4"
              >
                确认
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
