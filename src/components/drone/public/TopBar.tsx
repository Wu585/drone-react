import {ArrowDown, CircleUser, LogOut, Users} from "lucide-react";
import {ELocalStorageKey} from "@/types/enum.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useNavigate} from "react-router-dom";
import {useCurrentUser, useWorkspaceList} from "@/hooks/drone";
import {useCallback} from "react";

const TopBar = () => {
  const username = localStorage.getItem(ELocalStorageKey.Username);
  const navigate = useNavigate();
  const {data: currentUser, mutate: mutateCurrentUser} = useCurrentUser();
  const {data: workSpaceList, mutate: mutateWorkspaceList} = useWorkspaceList();

  const currentWorkSpace = workSpaceList?.find(item =>
    item.workspace_id === localStorage.getItem(ELocalStorageKey.WorkspaceId)
  )?.workspace_name || "未选择组织";

  const handleSwitchWorkspace = useCallback(async (workspaceId: string) => {
    localStorage.setItem(ELocalStorageKey.WorkspaceId, workspaceId);
    await Promise.all([
      mutateCurrentUser(),
      mutateWorkspaceList()
    ]);
    window.location.reload();
  }, [mutateCurrentUser, mutateWorkspaceList]);

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={"h-[70px] bg-gradient-to-b from-[#1f2849]/[.82] to-[#325088]/[.82] " +
      "flex justify-between items-center px-[66px] py-[18px]"}>
      {/*<div className={"text-[24px] font-semibold"}>{currentWorkSpace}无人机管理平台</div>*/}
      <div className={"text-[24px] font-semibold"}>绣花针低空管控平台</div>
      <div className={"flex space-x-4"}>
        <CircleUser/>
        <span>{currentUser?.username || "未登录"} |</span>
        <span>{"当前组织: " + currentWorkSpace}</span>
        {username && <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ArrowDown/>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <div className={"flex w-full"} onClick={() => navigate("/organs")}>
                <Users className="mr-2 h-4 w-4"/>
                <span>我的组织</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className={"flex w-full"} onClick={() => navigate("/depart")}>
                <Users className="mr-2 h-4 w-4"/>
                <span>我的部门</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout}>
              <div className={"flex w-full"}>
                <LogOut className="mr-2 h-4 w-4"/>
                <span>登出</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>}
      </div>
    </div>
  );
};

export default TopBar;

