import {ELocalStorageKey} from "@/types/enum.ts";
import {useDepartList, useMembers, useWorkspaceList} from "@/hooks/drone";
import {useMemo, useState} from "react";

const currentWorkSpaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

// 获取当前组织信息
export const useCurrentWorkSpace = () => {
  const {data: workSpaceList} = useWorkspaceList();
  return useMemo(() => {
    return workSpaceList?.find(item => item.workspace_id === currentWorkSpaceId);
  }, [workSpaceList]);
};

// 获取当前组织下的部门列表
export const useCurrentDepartList = () => {
  const currentWorkSpace = useCurrentWorkSpace();
  console.log('currentWorkSpace');
  console.log(currentWorkSpace);
  const {data: departList} = useDepartList();
  console.log('departList');
  console.log(departList);
  return useMemo(() => {
    return departList?.filter(item => item.workspace === currentWorkSpace?.id) || [];
  }, [departList, currentWorkSpace]);
};

// 根据部门id获取部门下的用户列表
export const useUserListByDepartId = () => {
  const [departId, setDepartId] = useState(0);

  const {data} = useMembers(currentWorkSpaceId, {
    page: 1,
    page_size: 1000,
    total: 0
  });

  const userList = data?.list.filter(item => item.organs.includes(departId)) || [];
  return {
    departId,
    setDepartId,
    userList
  };
};
