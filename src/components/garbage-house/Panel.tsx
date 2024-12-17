import closePng from "@/assets/images/panel-close.png";
import {Button} from "@/components/ui/button.tsx";
import {useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {client} from "@/hooks/bicycles/api.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {GarbageRoom, TrashCan, useTrashCanList} from "@/hooks/garbage-house/api.ts";

interface PanelProps {
  onClose?: () => void;
  garbageRoom?: Partial<GarbageRoom>;
  onEditGarbageRoom?: (garbageRoom?: Partial<GarbageRoom>) => void;
  onDeleteGarbageRoom?: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "请输入垃圾桶名称"
  }),
  type: z.string({
    required_error: "请选择垃圾桶类型",
  }).min(1),
  capacity: z.string().min(1, {
    message: "请输入垃圾桶容量"
  }),
  status: z.string({
    required_error: "请选择垃圾桶状态",
  }).min(1)
});

const Panel = ({
                 onClose,
                 onEditGarbageRoom,
                 onDeleteGarbageRoom,
                 garbageRoom = {name: "", address: "", lxr: "", lxrPhone: ""}
               }: PanelProps) => {
  const {name, address, lxr, lxrPhone} = garbageRoom;
  const [open, setOpen] = useState(false);
  const {toast} = useToast();
  const [current, setCurrent] = useState<TrashCan | null>(null);
  const {
    data: trashCanList,
    mutate
  } = useTrashCanList();

  const defaultValues = {
    name: "",
    type: "",
    capacity: "",
    status: ""
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (current) {
      await client.post("fpTrashCan/update", {
        ...values,
        id: current.id
      });
      toast({
        description: "编辑垃圾桶成功"
      });
    } else {
      await client.post("fpTrashCan/create", {
        ...values,
        belongTo: garbageRoom.id || "",
      });
      toast({
        description: "创建垃圾桶成功"
      });
    }
    await mutate();
    setOpen(false);
    form.reset(defaultValues);
  };

  const onEdit = (item: TrashCan) => {
    setOpen(true);
    setCurrent(item);
    form.reset(item);
  };

  const onDelete = async (id: string) => {
    await client.post("fpTrashCan/deleteBatch", [id]);
    toast({
      description: "删除垃圾桶成功"
    });
    await mutate();
  };

  return (
    <div style={{
      backgroundSize: "100% 100%"
    }} className={"bg-facilities-panel h-full w-full bg-100% relative"}>
      <div className={"absolute top-[28px] left-[32px] text-[22px] font-semibold"}>{name}</div>
      <img onClick={onClose} className={"absolute right-[24px] top-[48px] cursor-pointer"} src={closePng} alt=""/>
      <div className={"flex absolute top-[68px] left-[48px] space-x-8"}>
        <div>
          <span>位置：</span>
          <span className={"text-[#3ADEFF]"}>{address}</span>
        </div>
        <div>
          <span>垃圾桶数量：</span>
          <span className={"text-[#3ADEFF]"}>{trashCanList?.filter(item => item.belongTo === garbageRoom.id).length || 0}</span>
        </div>
        <div>
          <span>联系人：</span>
          <span className={"text-[#3ADEFF]"}>{lxr}</span>
        </div>
        <div>
          <span>联系方式：</span>
          <span className={"text-[#3ADEFF]"}>{lxrPhone}</span>
        </div>
        <div className={"cursor-pointer space-x-2"}>
          <span onClick={() => onEditGarbageRoom?.(garbageRoom)} className={"text-[#3ADEFF]"}>编辑</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <span className={"text-[#3ADEFF]"}>删除</span>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>删除垃圾厢房</AlertDialogTitle>
                <AlertDialogDescription>
                  确认删除垃圾厢房吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteGarbageRoom?.()}>确定</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className={"absolute top-[110px] w-full px-8 py-4"}>
        <div className={"flex justify-between mb-4"}>
          <span>垃圾桶列表</span>
          <Dialog open={open} onOpenChange={setOpen}>
            <div className={"flex justify-end"}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setCurrent(null);
                    form.reset(defaultValues);
                  }}
                  className={"border-[#3DCAFF] border-2 text-[#3DCAFF] mr-2 flex justify-center items-center px-2 cursor-pointer bg-transparent"}>
                  + 新增垃圾桶
                </Button>
              </DialogTrigger>
            </div>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>垃圾桶</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 whitespace-nowrap">
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>垃圾桶名称：</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={"输入垃圾桶名称"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"name"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>垃圾桶类型：</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={"col-span-3"}>
                              <SelectValue placeholder="选择垃圾桶类型"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="干垃圾">干垃圾</SelectItem>
                            <SelectItem value="湿垃圾">湿垃圾</SelectItem>
                            <SelectItem value="可回收垃圾">可回收垃圾</SelectItem>
                            <SelectItem value="其他垃圾">其他垃圾</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                    name={"type"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>垃圾桶容量：</FormLabel>
                        <FormControl>
                          <Input type={"number"} {...field} placeholder={"输入垃圾桶容量"} className={"col-span-3"}/>
                        </FormControl>
                      </FormItem>
                    )}
                    name={"capacity"}
                  />
                  <FormField
                    control={form.control}
                    render={({field}) => (
                      <FormItem className={"grid grid-cols-4 items-center gap-4"}>
                        <FormLabel className={"text-right"}>垃圾桶状态：</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={"col-span-3"}>
                              <SelectValue placeholder="选择垃圾桶状态"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="未满">未满</SelectItem>
                            <SelectItem value="已满">已满</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                    name={"status"}
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
          data={trashCanList?.filter(item => item.belongTo === garbageRoom.id) || []}
          columns={[
            {
              key: "垃圾桶名称",
              render: (item) => <>{item.name}</>
            },
            {
              key: "垃圾桶类型",
              render: (item) => <>{item.type}</>
            },
            {
              key: "垃圾桶容量(L)",
              render: (item) => <>{item.capacity}</>
            },
            {
              key: "垃圾桶状态",
              render: (item) => <>{item.status}</>
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
                      <AlertDialogTitle>删除垃圾桶</AlertDialogTitle>
                      <AlertDialogDescription>
                        确认删除垃圾桶吗？
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
    </div>
  );
};

export default Panel;

