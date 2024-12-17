import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import CommonPieChart from "@/components/public/CommonPieChart.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {client} from "@/hooks/bicycles/api.ts";
import {EmergencyPlan as EmergencyPlanType, useEmergencyPlan} from "@/hooks/flood-prevention/api.ts";
import {useState} from "react";
import {useToast} from "@/components/ui/use-toast.ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {Document, Packer, Paragraph, TextRun} from "docx";
import {saveAs} from "file-saver";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "请输入预案名称"
  }),
  scene: z.string().min(1, {
    message: "请输入适用场景"
  }),
  people: z.string().min(1, {
    message: "请输入编制人员"
  }),
  /*time: z.string().min(1, {
    message: "请输入编制时间"
  }),*/
  content: z.string()
    .min(10, {
      message: "预案内容至少十个字符"
    }).max(160, {
      message: "预案内容至多160个字符"
    }),
});

const EmergencyPlan = () => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<EmergencyPlanType | null>(null);
  const {toast} = useToast();
  const {data: emergencyList, mutate} = useEmergencyPlan();

  const defaultValues = {
    name: "",
    people: "",
    scene: "",
    content: ""
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (current) {
      await client.put(`fpproject/emergency-plan/update/${current.id}`, values);
      toast({
        description: "编辑预案成功"
      });
    } else {
      await client.post("fpproject/emergency-plan/save", values);
      toast({
        description: "添加预案成功"
      });
    }
    setOpen(false);
    form.reset(defaultValues);
    await mutate();
  };

  const onDelete = async (id: string) => {
    await client.delete(`fpproject/emergency-plan/delete/${id}`);
    toast({
      description: "删除预案成功"
    });
    await mutate();
  };

  const onEdit = (item: EmergencyPlanType) => {
    setOpen(true);
    setCurrent(item);
    form.reset(item); // 手动重置表单值
  };

  const onExport = (item: EmergencyPlanType) => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "预案名称：",
                  bold: true, // 将标题加粗
                }),
              ]
            }),
            new Paragraph({
              children: [
                new TextRun(item.name), // 内容
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "适用场景：",
                  bold: true, // 将标题加粗
                }),
              ]
            }),
            new Paragraph({
              children: [
                new TextRun(item.scene), // 内容
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "编制人员：",
                  bold: true, // 将标题加粗
                }),
              ]
            }),
            new Paragraph({
              children: [
                new TextRun(item.people), // 内容
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "预案内容：",
                  bold: true, // 将标题加粗
                }),
              ]
            }),
            new Paragraph({
              children: [
                new TextRun(item.content), // 内容
              ]
            }),
          ]
        }
      ]
    });
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "应急预案.docx");
    });
  };

  return (
    <div>
      <div className={"text-[20px] font-semibold px-4 py-[12px]"}>应急人员储备</div>
      <div className={"w-full h-[350px]"}>
        <CommonPieChart
          labelLine={true}
          labelPosition={"outside"}
          color={
            ["#36B0FF", "#77FF79", "#FF9E82"]
          } data={[
          {name: "应急人员", value: 30},
          {name: "街道人员", value: 200},
          {name: "社区人员", value: 80},
        ]}/>
      </div>
      <div className={"flex items-center justify-between mb-4"}>
        <div className={"text-[20px] font-semibold px-4 py-[12px]"}>应急预案列表</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <div className={"flex justify-end"}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  form.reset(defaultValues);
                  setCurrent(null);
                }}
                className={"border-[#3DCAFF] border-2 text-[#3DCAFF] mr-2 flex justify-center items-center px-2 cursor-pointer bg-transparent"}>
                + 新增预案
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>应急预案</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  render={({field}) => (
                    <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                      <FormLabel className={"text-right"}>预案名称：</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={"输入预案名称"} className={"col-span-3"}/>
                      </FormControl>
                    </FormItem>
                  )}
                  name={"name"}
                />
                <FormField
                  control={form.control}
                  render={({field}) => (
                    <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                      <FormLabel className={"text-right"}>适用场景：</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={"输入适用场景"} className={"col-span-3"}/>
                      </FormControl>
                    </FormItem>
                  )}
                  name={"scene"}
                />
                <FormField
                  control={form.control}
                  render={({field}) => (
                    <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                      <FormLabel className={"text-right"}>编制人员：</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={"输入编制人员"} className={"col-span-3"}/>
                      </FormControl>
                    </FormItem>
                  )}
                  name={"people"}
                />
                {/*<FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>编制时间：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入编制时间"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"time"}
                  />*/}
                <FormField
                  control={form.control}
                  render={({field}) => (
                    <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                      <FormLabel className={"text-right"}>预案内容：</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="输入预案内容"
                          className="resize-none col-span-3"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                  name={"content"}
                />
                <DialogFooter>
                  <Button type="submit">保存</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <NewCommonTable
        height={350}
        data={emergencyList || []}
        columns={[
          {
            key: "预案名称",
            render: (item) => <>{item.name}</>
          },
          {
            key: "适用场景",
            render: (item) => <>{item.name}</>
          },
          {
            key: "操作",
            render: (item) => <div className={"space-x-4 text-[#3DCAFF]"}>
              <span onClick={() => onEdit(item)}>编辑</span>
              <span onClick={() => onExport(item)}>导出</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <span>删除</span>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除预案</AlertDialogTitle>
                    <AlertDialogDescription>
                      确认删除预案吗？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(item.id)}>确定</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          },
        ]}
      />
    </div>
  );
};

export default EmergencyPlan;

