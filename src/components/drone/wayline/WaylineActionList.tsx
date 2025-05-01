import {AlignJustify, Trash2} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Slider} from "@/components/ui/slider.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";

export interface Action {
  name: string;
  func: string;
  isGlobal?: boolean;
  param?: number | string[];
  type?: string;
}

const actionList: Action[] = [
  {
    name: "开始录像",
    func: "startRecord",
    isGlobal: true,
    param: ["zoom", "wide", "ir"]
  },
  {
    name: "停止录像",
    func: "stopRecord",
  },
  {
    name: "悬停",
    func: "hover",
    param: 5
  },
  {
    name: "飞行器偏航角",
    func: "rotateYaw",
    param: 0
  },
  {
    name: "云台偏航角",
    func: "gimbalRotate",
    type: "gimbal_yaw_rotate_angle",
    param: 0
  },
  {
    name: "云台俯仰角",
    func: "gimbalRotate",
    type: "gimbal_pitch_rotate_angle",
    param: 0
  },
  {
    name: "拍照",
    func: "takePhoto",
    isGlobal: true,
    param: ["zoom", "wide", "ir"]
  },
  {
    name: "变焦",
    func: "zoom",
    param: 5
  },
  {
    name: "全景拍照",
    func: "panoShot",
    isGlobal: true,
    param: ["zoom", "wide", "ir"]
  },
  /*{
    name: "创建文件夹"
  },
  {
    name: "开始等时间隔拍照"
  },
  {
    name: "开始等距间隔拍照"
  },
  {
    name: "结束间隔拍照"
  }*/
];

interface Props {
  selectedActionList: Action[];
  setSelectedActionList: (value: Action[] | ((prevState: Action[]) => Action[])) => void;
}

const WaylineActionList = ({selectedActionList, setSelectedActionList}: Props) => {

  return (
    <>
      <div className="mt-4 flex items-center justify-between">
        <div>抵达目标点动作</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={"bg-[#3c3c3c]"} type={"button"}>添加动作</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {actionList.map(action =>
              <DropdownMenuItem
                key={action.name}
                onClick={() => setSelectedActionList([...selectedActionList, action])}>
                {action.name}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 调整容器样式 */}
      <ScrollArea className={"h-[360px] overflow-auto"}>
        <div className={"space-y-2 my-2 pr-4"}>
          {selectedActionList.map((action, index) => {
            const commonItemStyles = "flex justify-between items-center p-2 bg-gray-800/10 rounded-md";
            const commonLabelStyles = "flex items-center space-x-3 min-w-[100px]";
            const commonInputGroupStyles = "flex items-center space-x-3";
            const commonInputStyles = "w-20 h-8 text-center";
            const commonTrashStyles = "cursor-pointer";

            const unit = action.name === "悬停" ? "秒" :
              action.name === "变焦" ? "X" : "度";
            const sliderProps = {
              "悬停": { min: 1, max: 900 },
              "云台俯仰角": { min: -120, max: 45 },
              "云台偏航角": { min: -180, max: 180 },
              "飞行器偏航角": { min: -180, max: 180 },
              "变焦": { min: 2, max: 200 }
            }[action.name];

            switch (action.name) {
              case "开始录像":
              case "停止录像":
              case "拍照":
              case "全景拍照":
                return (
                  <div key={index} className={commonItemStyles}>
                    <div className={commonLabelStyles}>
                      <AlignJustify size={16}/>
                      <span>{action.name}</span>
                    </div>
                    <Trash2
                      onClick={() => setSelectedActionList((prevState: Action[]) =>
                        prevState.filter((_: Action, idx: number) => idx !== index))}
                      size={16}
                      className={commonTrashStyles}
                    />
                  </div>
                );

              case "悬停":
              case "云台俯仰角":
              case "云台偏航角":
              case "飞行器偏航角":
              case "变焦":
                return (
                  <div key={index} className="space-y-2">
                    <div className={commonItemStyles}>
                      <div className={commonLabelStyles}>
                        <AlignJustify size={16}/>
                        <span className="whitespace-nowrap">{action.name}</span>
                      </div>
                      <div className={commonInputGroupStyles}>
                        <Input
                          type="number"
                          value={action.param as number}
                          className={commonInputStyles}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value)) {
                              setSelectedActionList((prevState: Action[]) =>
                                prevState.map((item, idx) =>
                                  idx === index ? {...item, param: value} : item
                                )
                              );
                            }
                          }}
                        />
                        <span className="min-w-[20px]">{unit}</span>
                        <Trash2
                          onClick={() => setSelectedActionList((prevState: Action[]) =>
                            prevState.filter((_: Action, idx: number) => idx !== index))}
                          size={16}
                          className={commonTrashStyles}
                        />
                      </div>
                    </div>
                    <div className="px-2">
                      <Slider
                        {...sliderProps}
                        value={[action.param as number]}
                        onValueChange={(value) => {
                          setSelectedActionList((prevState: Action[]) =>
                            prevState.map((item, idx) =>
                              idx === index ? {...item, param: value[0]} : item
                            )
                          );
                        }}
                      />
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
      </ScrollArea>
    </>
  );
};

export default WaylineActionList;

