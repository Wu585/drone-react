import {useNavigate} from "react-router-dom";
import TaskDataTable from "@/components/drone/tasklist/TaskDataTable.tsx";
import titleArrowPng from "@/assets/images/drone/title-arrow.png";
import {cn} from "@/lib/utils.ts";
import {useState} from "react";
import ApplyTaskDataTable from "@/components/drone/tasklist/ApplyTaskDataTable.tsx";
import PermissionButton from "@/components/drone/public/PermissionButton.tsx";
import {Button} from "@/components/drone/public/Button.tsx";
import {AppWindowMac, Dock} from "lucide-react";

const TaskList = () => {
  const navigate = useNavigate();

  const taskTypes = [
    {
      name: "普通任务",
      icon: <AppWindowMac size={16}/>
    },
    {
      name: "申请任务",
      icon: <Dock size={16}/>
    }
  ];

  const [currentType, setCurrentType] = useState("普通任务");

  return (
    <div className={"w-full h-full flex bg-gradient-to-r from-[#172A4F]/[.6] to-[#233558]/[.6]"}>
      <div className={"flex-1 border-[#43ABFF] border-[1px] border-l-0 flex flex-col rounded-r-lg"}>
        <h1 className={"flex justify-between items-center"}>
          <div className={"py-4 px-4 flex space-x-4 text-base"}>
            <img src={titleArrowPng} alt=""/>
            <span className={"text-base"}>任务计划库</span>
          </div>
        </h1>
        <div className={"flex space-x-8 px-4 items-center justify-between"}>
          <div className={"flex space-x-6"}>
            {taskTypes.map(item =>
              <Button
                key={item.name}
                style={{
                  backgroundSize: "100% 100%"
                }}
                className={cn("w-[211px] h-[38px] text-sm cursor-pointer justify-start pl-8 space-x-2 rounded-none",
                  currentType === item.name ? "bg-tab-active" : "bg-tab")}
                onClick={() => setCurrentType(item.name)}>
                <span className={cn(currentType === item.name && "text-[#A1F4FA]")}>{item.icon}</span>
                <span
                  className={cn(currentType === item.name && "bg-gradient-to-b from-[#E8FFFE] via-[#A1F4FA] to-[#589AE4] bg-clip-text text-transparent")}>{item.name}</span>
              </Button>)}
          </div>
          {/*<div className={"flex items-center space-x-4"}>
            <PermissionButton
              permissionKey={"Collection_PlanCreate"}
              onClick={() => navigate("/task-create-apply")}
              className={"mt-2 bg-[#43ABFF] hover:bg-[#43ABFF]  text-base"}
            >
              申请任务
            </PermissionButton>
            <PermissionButton
              permissionKey={"Collection_PlanCreate"}
              className={"mt-2 bg-[#43ABFF] hover:bg-[#43ABFF]  text-base"}
              onClick={() => navigate("/task-create")}
            >
              创建任务
            </PermissionButton>
          </div>*/}
        </div>
        <div className={"flex-1 p-4"}>
          {currentType === "普通任务" ? <TaskDataTable/> : <ApplyTaskDataTable/>}
        </div>
      </div>
    </div>
  );
};

export default TaskList;

