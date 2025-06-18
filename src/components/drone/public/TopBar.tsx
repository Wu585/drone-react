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
import logo from "@/assets/images/drone/logo.png";
import wenduPng from "@/assets/images/drone/cockpit/wendu.png";
import fengliPng from "@/assets/images/drone/cockpit/fengli.png";
import fengxiangPng from "@/assets/images/drone/cockpit/fengxiang.png";
import qingPng from "@/assets/images/drone/qing.png";
import {useWeatherInfo} from "@/hooks/flood-prevention/api.ts";

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

  const {data: weatherInfo} = useWeatherInfo("101021000");

  return (
    <div className={"h-[70px] bg-gradient-to-b from-[#1f2849]/[.82] to-[#325088]/[.82] " +
      "flex justify-between items-center px-[30px] py-[18px] whitespace-nowrap"}>
      <div className={"text-[24px] font-semibold content-center space-x-2"}>
        <img src={logo} alt=""/>
        <span className={"tracking-wider"}>绣花针低空管控平台</span>
      </div>
      <div className={"flex space-x-4"}>
        <div className="flex space-x-6 text-lg mr-8">
          <div>奉贤区：</div>
          <div className={"space-x-2 content-center"}>
            <img className={"h-6"} src={wenduPng} alt=""/>
            <span>{weatherInfo?.[0]?.realtime.sendibleTemp}°C</span>
          </div>
          <div className={"space-x-2 content-center"}>
            <img className={"h-6"} src={qingPng} alt=""/>
            <span>{weatherInfo?.[0]?.realtime.weather}</span>
          </div>
          <div className={"space-x-2 content-center"}>
            <img className={"h-6"} src={fengliPng} alt=""/>
            <span>{weatherInfo?.[0]?.realtime.wS}</span>
          </div>
          <div className={"space-x-2 content-center"}>
            <img className={"h-6"} src={fengxiangPng} alt=""/>
            <span>{weatherInfo?.[0]?.realtime.wD}</span>
          </div>
        </div>

        <CircleUser/>
        <span>{currentUser?.username || "未登录"} |</span>
        <span>{"当前组织: " + currentWorkSpace}</span>
        {username && <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ArrowDown/>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <div className={"flex w-full"} onClick={() => {
                navigate(`/organs`);
              }}>
                <Users className="mr-2 h-4 w-4"/>
                <span>我的组织</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className={"flex w-full"} onClick={() => {
                const tmpWorkspaceId = localStorage.getItem(ELocalStorageKey.WorkspacePrimaryKey);
                navigate(`/depart?id=${tmpWorkspaceId}`);
              }}>
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

