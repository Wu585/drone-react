import {useNavigate} from "react-router-dom";
import TaskDataTable from "@/components/drone/tasklist/TaskDataTable.tsx";
import titleArrowPng from "@/assets/images/drone/title-arrow.png";
import {Button} from "@/components/ui/button.tsx";
import {useAjax} from "@/lib/http.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {HTTP_PREFIX_Wayline} from "@/hooks/drone";
import dayjs from "dayjs";
import {toast} from "@/components/ui/use-toast";

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

  return (
    <div className={"w-full h-full flex"}>
      <div className={"flex-1 border-[#43ABFF] border-[1px] border-l-0 flex flex-col rounded-r-lg"}>
        <h1 className={"flex justify-between items-center"}>
          <div className={"py-4 px-4 flex space-x-4"}>
            <img src={titleArrowPng} alt=""/>
            <span>任务计划库</span>
          </div>
          <div>
            <Button className={"mx-4 mt-2 bg-[#43ABFF] hover:bg-[#43ABFF]"} onClick={() => navigate("/task-create")}>
              <span>申请任务</span>
            </Button>
            <Button className={"mx-4 mt-2 bg-[#43ABFF] hover:bg-[#43ABFF]"} onClick={() => navigate("/task-create")}>
              <span>创建任务</span>
            </Button>
            <Button className={"mx-4 mt-2 bg-[#43ABFF] hover:bg-[#43ABFF]"} onClick={onGenerateReports}>
              <span>导出飞行报告</span>
            </Button>
          </div>
        </h1>
        <div className={"flex-1 p-4"}>
          <TaskDataTable/>
        </div>
      </div>
    </div>
  );
};

export default TaskList;

