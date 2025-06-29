import TaskDataTable from "@/components/drone/tasklist/TaskDataTable.tsx";
import ApplyTaskDataTable from "@/components/drone/tasklist/ApplyTaskDataTable.tsx";
import {AppWindowMac, Dock} from "lucide-react";
import {TabbedLayout} from "@/components/drone/public/TabbedLayout.tsx";

const TaskList = () => {

  const taskTypes = [
    {
      name: "普通任务",
      icon: <AppWindowMac size={16}/>,
      content: <TaskDataTable/>,
    },
    {
      name: "申请任务",
      icon: <Dock size={16}/>,
      content: <ApplyTaskDataTable/>,
    }
  ];

  return <TabbedLayout title="任务计划库" defaultTab="普通任务" tabs={taskTypes}/>;
};

export default TaskList;

