import {useNavigate} from "react-router-dom";
import TaskDataTable from "@/components/drone/tasklist/TaskDataTable.tsx";
import titleArrowPng from "@/assets/images/drone/title-arrow.png";
import {Button} from "@/components/ui/button.tsx";
import {useAjax} from "@/lib/http.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {HTTP_PREFIX_Wayline} from "@/hooks/drone";
import dayjs from "dayjs";
import {toast} from "@/components/ui/use-toast";
import {cn} from "@/lib/utils.ts";
import {useState} from "react";
import ApplyTaskDataTable from "@/components/drone/tasklist/ApplyTaskDataTable.tsx";
import PermissionButton from "@/components/drone/public/PermissionButton.tsx";

const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

const TaskList = () => {
  const navigate = useNavigate();
  const {post} = useAjax();
  const onGenerateReports = async () => {
    try {
      const res: any = await post(
        `${HTTP_PREFIX_Wayline}/workspaces/${workspaceId}/flight-reports/generate`,
        {},
        // 设置响应类型为 blob
        {responseType: "blob"}
      );

      // 创建 Blob 对象
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `飞行报告_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.xlsx`; // 设置文件名

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("下载报告失败:", error);
      toast({
        variant: "destructive",
        description: "下载报告失败"
      });
    }
  };

  const taskTypes = [
    {
      name: "普通任务"
    },
    {
      name: "申请任务"
    }
  ];

  const [currentType, setCurrentType] = useState("普通任务");

  return (
    <div className={"w-full h-full flex"}>
      <div className={"flex-1 border-[#43ABFF] border-[1px] border-l-0 flex flex-col rounded-r-lg"}>
        <h1 className={"flex justify-between items-center"}>
          <div className={"py-4 px-4 flex space-x-4"}>
            <img src={titleArrowPng} alt=""/>
            <span>任务计划库</span>
          </div>

        </h1>
        <div className={"flex space-x-8 px-4 items-center justify-between"}>
          <div className={"flex"}>
            {taskTypes.map(item =>
              <div key={item.name} style={{
                backgroundSize: "100% 100%"
              }} className={cn("bg-device w-[193px] h-[34px] text-[16px] flex content-center cursor-pointer",
                currentType === item.name ? "text-[#A1F4FA]" : "")} onClick={() => setCurrentType(item.name)}>
                {item.name}
              </div>)}
          </div>
          <div className={"flex items-center space-x-4"}>
            <PermissionButton
              permissionKey={"Collection_PlanCreate"}
              onClick={() => navigate("/task-create-apply")}
              className={"mt-2 bg-[#43ABFF] hover:bg-[#43ABFF]"}
            >
              申请任务
            </PermissionButton>
            <PermissionButton
              permissionKey={"Collection_PlanCreate"}
              className={"mt-2 bg-[#43ABFF] hover:bg-[#43ABFF]"}
              onClick={() => navigate("/task-create")}
            >
              创建任务
            </PermissionButton>
            <Button className={"mt-2 bg-[#43ABFF] hover:bg-[#43ABFF]"} onClick={onGenerateReports}>
              <span>导出飞行报告</span>
            </Button>
          </div>
        </div>
        <div className={"flex-1 p-4"}>
          {currentType === "普通任务" ? <TaskDataTable/> : <ApplyTaskDataTable/>}
        </div>
      </div>
    </div>
  );
};

export default TaskList;

