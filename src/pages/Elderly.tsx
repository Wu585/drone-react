import {useEffect, useRef, useState} from "react";
import {useAddLeftClickListener} from "@/hooks/public/event-listen.ts";
import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import {cn} from "@/lib/utils.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {useElderlyEntities} from "@/hooks/elderly/entities.ts";
import elderlyHouse from "@/assets/images/elderly-house.png";
import CommonPieChart from "@/components/public/CommonPieChart.tsx";
import ToolBarWithPosition from "@/components/public/ToolBarWithPosition.tsx";
import {OlderLonely, useDoorContact, useFpLiveAlone} from "@/hooks/elderly/api.ts";
import {Button} from "@/components/ui/button.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useToast} from "@/components/ui/use-toast.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {client} from "@/hooks/bicycles/api.ts";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "请输入老人姓名"
  }),
  community: z.string().min(1, {
    message: "请输入居住小区"
  }),
  unit: z.string().min(1, {
    message: "请输入楼栋单元"
  }),
  imei: z.string().min(1, {
    message: "请绑定门磁设备"
  })
});

const Elderly = () => {
  const {isFullScreen} = useSceneStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const {data: olderLonelyList, mutate} = useFpLiveAlone();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<OlderLonely | null>(null);
  const {toast} = useToast();
  const defaultValues = {
    name: "",
    community: "",
    unit: "",
    imei: ""
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const handleClickEntity = (description: Record<string, any>) => {
    console.log(description);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (current) {
      await client.put(`fpproject/fp-live-alone/update/${current.id}`, values);
      toast({description: "编辑成功"});
    } else {
      await client.post("fpproject/fp-live-alone/save", values);
      toast({description: "新增成功"});
    }
    await mutate();
    setOpen(false);
    form.reset(defaultValues);
  };

  useElderlyEntities();

  useAddLeftClickListener(panelRef, handleClickEntity);

  const {data: doorConcatList} = useDoorContact();
  useEffect(() => {
    console.log("doorConcatList");
    console.log(doorConcatList);
  }, [doorConcatList]);
  useEffect(() => {
    console.log("olderLonelyList");
    console.log(olderLonelyList);
  }, [olderLonelyList]);
  const onEdit = (item: OlderLonely) => {
    setOpen(true);
    setCurrent(item);
    form.reset(item);
  };

  const onDelete = async (id: string) => {
    await client.delete(`fpproject/fp-live-alone/delete/${id}`);
    toast({
      description: "删除成功"
    });
    await mutate();
  };

  return (
    <>
      {
        isFullScreen &&
        <>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout
              title={"独居老人门磁信息列表"}
              action={<Dialog open={open} onOpenChange={setOpen}>
                <div className={"flex justify-end"}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        form.reset(defaultValues);
                        setCurrent(null);
                      }}
                      className={"border-[#3DCAFF] text-[#3DCAFF] mr-2 flex justify-center items-center px-2 cursor-pointer bg-transparent"}>
                      + 新增老人
                    </Button>
                  </DialogTrigger>
                </div>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>独居老人</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                      <FormField
                        control={form.control}
                        render={({field}) => (
                          <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                            <FormLabel className={"text-right"}>老人姓名：</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={"输入老人姓名"} className={"col-span-3"}/>
                            </FormControl>
                          </FormItem>
                        )}
                        name={"name"}
                      />
                      <FormField
                        control={form.control}
                        render={({field}) => (
                          <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                            <FormLabel className={"text-right"}>居住小区：</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={"输入居住小区"} className={"col-span-3"}/>
                            </FormControl>
                          </FormItem>
                        )}
                        name={"community"}
                      />
                      <FormField
                        control={form.control}
                        render={({field}) => (
                          <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                            <FormLabel className={"text-right"}>楼栋单元：</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={"输入楼栋单元"} className={"col-span-3"}/>
                            </FormControl>
                          </FormItem>
                        )}
                        name={"unit"}
                      />
                      <FormField
                        control={form.control}
                        render={({field}) => (
                          <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                            <FormLabel className={"text-right"}>设备编号：</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className={"col-span-3"}>
                                  <SelectValue placeholder="绑定门磁设备"/>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="861178062546272">物业监控室1（大厦1楼）</SelectItem>
                                <SelectItem value="861178062242609">机房（大厦1楼）</SelectItem>
                                <SelectItem value="861178062724861">弱电间（大厦2楼）</SelectItem>
                                <SelectItem value="861178062634003">弱电间（大厦3楼）</SelectItem>
                                <SelectItem value="861178062590809">仓库（大厦320室）</SelectItem>
                                <SelectItem value="861178062111044">仓库（大厦319室）</SelectItem>
                                <SelectItem value="861178062349933">仓库（大厦309室）</SelectItem>
                                <SelectItem value="861178062162393">弱电间（大厦4楼）</SelectItem>
                                <SelectItem value="861178063301313">弱电间（大厦5楼）</SelectItem>
                                <SelectItem value="861178063394888">弱电间（大厦6楼）</SelectItem>
                                <SelectItem value="861178060180595">机要弱电间（大厦7楼）</SelectItem>
                                <SelectItem value="861178062931094">人事档案室（大厦704室）</SelectItem>
                                <SelectItem value="861178062686342">机要阅览室（大厦709室）</SelectItem>
                                <SelectItem value="861178062242526">弱电间（大厦8楼）</SelectItem>
                                <SelectItem value="861178062105855">弱电间（大厦9楼）</SelectItem>
                                <SelectItem value="861178062576196">档案室（大厦1007室）</SelectItem>
                                <SelectItem value="861178062715000">档案室（大厦1006室）</SelectItem>
                                <SelectItem value="861178062613189">阅档室（大厦1003室）</SelectItem>
                                <SelectItem value="861178062634011">弱电间（大厦10楼）</SelectItem>
                                <SelectItem value="861178061760197">弱电间（大厦11楼）</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                        name={"imei"}
                      />
                      <DialogFooter>
                        <Button type="submit">保存</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>}>
              <div className={"bg-rain-time flex justify-center items-center space-x-16 py-4"}>
                <img src={elderlyHouse} alt=""/>
                <div className={"flex flex-col space-y-2"}>
                  <span className={"text-[30px] font-bold text-[#FFB24D]"}>126</span>
                  <span>独居老人总数</span>
                </div>
                <div className={"flex flex-col space-y-2"}>
                  <span className={"text-[30px] font-bold text-[#4DFFF9]"}>{olderLonelyList?.length || 0}</span>
                  <span>已装门磁独居老人</span>
                </div>
              </div>
              <NewCommonTable
                data={olderLonelyList || []}
                columns={[
                  {
                    key: "独居老人姓名",
                    render: (item) => <>{item.name}</>
                  },
                  {
                    key: "小区",
                    render: (item) => <>{item.community}</>
                  },
                  {
                    key: "单元楼栋",
                    render: (item) => <>{item.unit}</>
                  },
                  {
                    key: "门磁状态",
                    render: (item) => <>{doorConcatList?.find(door => door.imei === item.imei)?.items[0].value || "未绑定门磁"}</>
                  },
                  {
                    key: "操作",
                    render: (item) => <div className={"space-x-4 text-[#3DCAFF]"}>
                      <span onClick={() => onEdit(item)}>编辑</span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <span>删除</span>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>删除老人</AlertDialogTitle>
                            <AlertDialogDescription>
                              确认删除老人吗？
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(item.id)}>确定</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  }
                ]}
              />
            </DisPlayItemLayout>
          </div>
          <div className={"z-10 absolute top-[100px] right-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"独居老人危险告警"}>
              <div className={"w-full h-[300px]"}>
                <CommonPieChart
                  labelLine={true}
                  labelPosition={"outside"}
                  color={
                    ["#2AB3B8", "#FFA551", "#FFD956", "#9EEBFF", "#2B74D3"]
                  } data={[
                  {name: "健康情况1", value: 30},
                  {name: "健康情况2", value: 200},
                  {name: "健康情况3", value: 80},
                  {name: "健康情况4", value: 40},
                  {name: "健康情况5", value: 80},
                ]}/>
              </div>
              <NewCommonTable
                data={[
                  {
                    address: "秀枫苑3栋201",
                    name: "郁**",
                    warnType: "健康问题",
                    handleStatus: "未处理"
                  },
                  {
                    address: "秀枫苑4栋201",
                    name: "李**",
                    warnType: "健康问题",
                    handleStatus: "未处理"
                  },
                  {
                    address: "九华新园1栋301",
                    name: "范**",
                    warnType: "健康问题",
                    handleStatus: "未处理"
                  },
                  {
                    address: "九华新园12栋201",
                    name: "王**",
                    warnType: "健康问题",
                    handleStatus: "未处理"
                  },
                  {
                    address: "九华苑13栋201",
                    name: "金**",
                    warnType: "健康问题",
                    handleStatus: "未处理"
                  },
                  {
                    address: "九华苑15栋201",
                    name: "宋**",
                    warnType: "健康问题",
                    handleStatus: "未处理"
                  },
                  {
                    address: "景河苑20栋201",
                    name: "李**",
                    warnType: "健康问题",
                    handleStatus: "未处理"
                  },
                  {
                    address: "景河苑21栋201",
                    name: "王**",
                    warnType: "健康问题",
                    handleStatus: "未处理"
                  },
                ]}
                columns={[
                  {
                    key: "位置",
                    render: (item) => <>{item.address}</>
                  },
                  {
                    key: "老人姓名",
                    render: (item) => <>{item.name}</>
                  },
                  {
                    key: "告警类型",
                    render: (item) => <>{item.warnType}</>
                  },
                  {
                    key: "处理情况",
                    render: (item) => <>{item.handleStatus}</>
                  }
                ]}
              />
            </DisPlayItemLayout>
          </div>
        </>
      }
      <ToolBarWithPosition/>
      <div style={{
        backgroundSize: "100% 100%"
      }} className={cn("bg-side-container bg-no-repeat w-[560px] h-full absolute top-0 left-0 z-5 my-[80px]",
        isFullScreen ? "w-[560px]" : "w-0")}/>
      <div style={{
        backgroundSize: "100% 100%"
      }} className={cn("bg-side-container bg-no-repeat w-[560px] h-full absolute top-0 right-0 z-5 my-[80px]",
        isFullScreen ? "w-[560px]" : "w-0")}/>
    </>
  );
};

export default Elderly;

