import {useNavigate} from "react-router-dom";
import TaskDataTable from "@/components/drone/tasklist/TaskDataTable.tsx";
import titleArrowPng from "@/assets/images/drone/title-arrow.png";
import {Button} from "@/components/ui/button.tsx";

const TaskList = () => {
  const navigate = useNavigate();

  return (
    <div className={"w-full h-full flex"}>
      <div className={"flex-1 border-[#43ABFF] border-[1px] border-l-0 flex flex-col rounded-r-lg"}>
        <h1 className={"flex justify-between items-center"}>
          <div className={"py-4 px-4 flex space-x-4"}>
            <img src={titleArrowPng} alt=""/>
            <span>任务计划库</span>
          </div>
          <Button className={"mx-4 mt-2 bg-[#43ABFF] hover:bg-[#43ABFF]"} onClick={() => navigate("/task-create")}>
            <span>创建任务</span>
          </Button>
        </h1>
        <div className={"flex-1 p-4"}>
          <TaskDataTable/>
        </div>
      </div>
    </div>
  );
};

export default TaskList;

