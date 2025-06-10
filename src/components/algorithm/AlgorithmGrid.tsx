import {ALGORITHM_CONFIG_API_PREFIX, useAlgorithmConfigList} from "@/hooks/drone/algorithm";
import {Button} from "@/components/ui/button.tsx";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import {useAjax} from "@/lib/http.ts";
import AlgorithmDialog from "@/components/algorithm/AlgorithmDialog.tsx";
import {useState} from "react";

// 定义告警等级类型
type WarnLevel = 1 | 2 | 3 | 4;

const warnLevelMap: Record<WarnLevel, string> = {
  1: "一般告警",
  2: "次要告警",
  3: "主要告警",
  4: "紧急告警",
} as const;

const warnLevelColorMap: Record<WarnLevel, string> = {
  1: "#4BB5FF",
  2: "#F7B500",
  3: "#FA6400",
  4: "#F53F3F",
};

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

const AlgorithmGrid = () => {
  const {data: algorithmConfigList, mutate: mutateAlgorithmConfigList} = useAlgorithmConfigList({
    page: 0,
    size: 1000,
  });
  const [open, setOpen] = useState(false);
  const [configId, setConfigId] = useState<number>();
  const {delete: deleteClient} = useAjax();

  const handleEdit = (id: number) => {
    setOpen(true);
    setConfigId(id);
  };

  const onDeleteConfig = async (id: number) => {
    try {
      await deleteClient(`${ALGORITHM_CONFIG_API_PREFIX}/${id}`);
      toast({
        description: "删除配置成功"
      });
      await mutateAlgorithmConfigList();
    } catch (err: any) {
      toast({
        description: "删除配置失败！"
      });
    }
  };
  const onSuccess = async () => {
    setOpen(false);
    await mutateAlgorithmConfigList();
  };

  return (
    <div className="relative ">
      <div className="flex justify-end mb-4">
        <Button className={" w-20 bg-[#43ABFF] "}
                onClick={() => {
                  setOpen(true);
                  setConfigId(undefined);
                }}>添加</Button>
      </div>
      <div className={"grid grid-cols-6 gap-4 h-[calc(100vh-250px)] overflow-auto"}>
        <AlgorithmDialog open={open} onOpenChange={setOpen} onSuccess={onSuccess} id={configId}/>
        {algorithmConfigList?.records.map((record) => (
          <div
            className={"bg-algorithm-panel bg-full-size flex flex-col justify-between items-center py-4 relative space-y-8"}
            key={record.id}>
            <div style={{
              background: `${warnLevelColorMap[record.warning_level]}`,
            }} className={"absolute -left-[2px] top-4 rounded-tl-md text-sm px-4 py-[4px]"}>
              {warnLevelMap[record.warning_level]}
            </div>
            <div></div>
            <div className={"flex flex-col justify-center items-center space-y-2"}>
              <span className="max-w-[220px] truncate text-center" title={record.algorithm_name}>
                {record.algorithm_name}
              </span>
              <span className={"text-[#9F9F9F]"}>
              {eventMap[record.order_type]}
            </span>
              <div className={"text-sm text-[#9F9F9F]"}>
                <span>来源：</span>
                <span>{record.algorithm_platform === 0 ? "算法平台" : "第三方平台"}</span>
              </div>
            </div>
            <div className={"grid grid-cols-2 gap-4"}>
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button className={"bg-[#646876] px-6"}>删除</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除配置</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription>确认删除配置吗?</AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className={"bg-primary text-primary-foreground"}>取消</AlertDialogCancel>
                    <AlertDialogCancel
                      className={"bg-primary text-primary-foreground"}
                      onClick={() => onDeleteConfig(record.id)}>确认</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button className={"bg-[#43ABFF] px-6"} onClick={() => handleEdit(record.id)}>编辑</Button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AlgorithmGrid;

