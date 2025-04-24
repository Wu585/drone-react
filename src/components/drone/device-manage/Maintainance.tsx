import {
  Sheet, SheetClose,
  SheetContent, SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MaintainanceSheet = ({open, onOpenChange}: Props) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={"w-[400px] sm:w-[540px]"}>
        <SheetHeader>
          <SheetTitle>保养服务</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4 border-2">
          <div className={"flex justify-between"}>
            <div>机场数据</div>
            <div>sn: 4TADL6A001004A</div>
          </div>
          <div className={"grid grid-cols-3"}>
            <div className={"flex flex-col items-center justify-center"}>
              <span>471天</span>
              <span>累计运行时长</span>
            </div>
            <div className={"flex flex-col items-center justify-center"}>
              <span>367架次</span>
              <span>作业架次</span>
            </div>
            <div className={"flex flex-col items-center justify-center"}>
              <span>2023-12-12</span>
              <span>激活时间</span>
            </div>
          </div>
          <div>
            <div className={"flex items-center"}>
              <h3>保养项目</h3>
              <Button>保养记录</Button>
              <Button>添加记录</Button>
            </div>
            <SheetDescription>为了保障机场的使用安全，请根据保养规则定期进行机场保养服务。</SheetDescription>
            <div className={"grid grid-cols-2"}>
              <div>
                <h3>上次保养</h3>
                <div>
                  <span>保养项目</span>
                  <span>--</span>
                </div>
                <div>
                  <span>保养时间</span>
                  <span>--</span>
                </div>
                <div>
                  <span>保养项目</span>
                  <span>--</span>
                </div>
              </div>
              <div>
                <h3>距离下次保养</h3>
                <div>
                  <span>常规保养</span>
                  <span>已超期 330天</span>
                </div>
                <div>
                  <span>深度保养</span>
                  <span>2570天/875637265架次</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 py-4 border-2">
          <div className={"flex justify-between"}>
          <div>飞行器数据</div>
            <div>sn: 4TADL6A001004A</div>
          </div>
          <div className={"grid grid-cols-4 whitespace-nowrap"}>
            <div className={"flex flex-col items-center justify-center"}>
              <span>55h 0min</span>
              <span>飞行时长</span>
            </div>
            <div className={"flex flex-col items-center justify-center"}>
              <span>367架次</span>
              <span>飞行架次</span>
            </div>
            <div className={"flex flex-col items-center justify-center"}>
              <span>739.7 km</span>
              <span>飞行里程</span>
            </div>
            <div className={"flex flex-col items-center justify-center"}>
              <span>2023-12-12</span>
              <span>激活时间</span>
            </div>
            <div className={"flex flex-col  justify-center col-span-2 text-sm"}>
              <span>左电池</span>
              <span>循环 125次 高电量存储193天</span>
            </div>
            <div className={"flex flex-col justify-center col-span-2 text-sm"}>
              <span>右电池</span>
              <span>循环 125次 高电量存储193天</span>
            </div>
          </div>
          <div>
            <div className={"flex items-center"}>
              <h3>保养项目</h3>
              <Button>保养记录</Button>
              <Button>添加记录</Button>
            </div>
            <SheetDescription>为了保障机场的使用安全，请根据保养规则定期进行机场保养服务。</SheetDescription>
            <div className={"grid grid-cols-2"}>
              <div>
                <h3>上次保养</h3>
                <div>
                  <span>保养项目</span>
                  <span>--</span>
                </div>
                <div>
                  <span>保养时间</span>
                  <span>--</span>
                </div>
                <div>
                  <span>保养项目</span>
                  <span>--</span>
                </div>
              </div>
              <div>
                <h3>距离下次保养</h3>
                <div>
                  <span>常规保养</span>
                  <span>已超期 330天</span>
                </div>
                <div>
                  <span>深度保养</span>
                  <span>2570天/875637265架次</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">保存</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MaintainanceSheet;

