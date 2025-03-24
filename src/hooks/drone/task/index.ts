import {Task} from "@/hooks/drone";
import {MediaStatus, MediaStatusColorMap, MediaStatusMap, TaskStatusColor, TaskStatusMap} from "@/types/task.ts";

export function formatTaskStatus(task: Task) {
  const statusObj = {
    text: "",
    color: ""
  };
  const {status} = task;
  statusObj.text = TaskStatusMap[status];
  statusObj.color = TaskStatusColor[status];
  return statusObj;
}

export const groupTasksByDate = (tasks: Task[]) => {
  const groups: { [key: string]: Task[] } = {};

  tasks.forEach(task => {
    const date = task.begin_time.split(" ")[0]; // 获取日期部分
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
  });

  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])); // 按日期倒序排列
};

export function formatMediaTaskStatus(task: Task) {
  const statusObj = {
    text: "",
    color: "",
    number: "",
    status: MediaStatus.Empty,
  };
  const {media_count, uploaded_count, uploading} = task;
  if (media_count === null || media_count === undefined || isNaN(media_count)) {
    return statusObj;
  }
  const expectedFileCount = media_count || 0;
  const uploadedFileCount = uploaded_count || 0;
  if (media_count === 0) {
    statusObj.text = MediaStatusMap[MediaStatus.Empty];
    statusObj.color = MediaStatusColorMap[MediaStatus.Empty];
  } else if (media_count === uploaded_count) {
    statusObj.text = MediaStatusMap[MediaStatus.Success];
    statusObj.color = MediaStatusColorMap[MediaStatus.Success];
    statusObj.number = `(${uploadedFileCount}/${expectedFileCount})`;
    statusObj.status = MediaStatus.Success;
  } else {
    if (uploading) {
      statusObj.text = MediaStatusMap[MediaStatus.Uploading];
      statusObj.color = MediaStatusColorMap[MediaStatus.Uploading];
      statusObj.status = MediaStatus.Uploading;
    } else {
      statusObj.text = MediaStatusMap[MediaStatus.ToUpload];
      statusObj.color = MediaStatusColorMap[MediaStatus.ToUpload];
      statusObj.status = MediaStatus.ToUpload;
    }
    statusObj.number = `(${uploadedFileCount}/${expectedFileCount})`;
  }
  return statusObj;
}

export enum UpdateTaskStatus {
  Suspend = 0, // 暂停
  Resume = 1, // 恢复
}
