import {ArrowDown, CircleUserRound, LogOut, UserPlus, Users} from "lucide-react";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useNavigate} from "react-router-dom";
import {useCurrentUser, useWorkspaceList} from "@/hooks/drone";
import logo from "@/assets/images/drone/logo.png";
import wenduPng from "@/assets/images/drone/cockpit/wendu.png";
import fengliPng from "@/assets/images/drone/cockpit/fengli.png";
import fengxiangPng from "@/assets/images/drone/cockpit/fengxiang.png";
import qingPng from "@/assets/images/drone/qing.png";
import {useWeatherInfo} from "@/hooks/flood-prevention/api.ts";
import {CommonDropDownMenu, CommonDropDownMenuItem} from "@/components/drone/public/CommonDropDownMenu.tsx";
import {IconButton} from "@/components/drone/public/IconButton.tsx";

const TopBar = () => {
  const username = localStorage.getItem(ELocalStorageKey.Username);
  const navigate = useNavigate();
  const {data: currentUser} = useCurrentUser();
  const {data: workSpaceList} = useWorkspaceList();

  const currentWorkSpace = workSpaceList?.find(item =>
    item.workspace_id === localStorage.getItem(ELocalStorageKey.WorkspaceId)
  );

  /*  const handleSwitchWorkspace = useCallback(async (workspaceId: string) => {
      localStorage.setItem(ELocalStorageKey.WorkspaceId, workspaceId);
      await Promise.all([
        mutateCurrentUser(),
        mutateWorkspaceList()
      ]);
      window.location.reload();
    }, [mutateCurrentUser, mutateWorkspaceList]);*/

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const {data: weatherInfo} = useWeatherInfo("101021000");

  return (
    <div className={"h-[70px] bg-gradient-to-b from-[#1A3369]/[.82] to-[#305286] " +
      "flex justify-between items-center px-[30px] py-[18px] whitespace-nowrap"}>
      <div className={"text-[24px] font-semibold content-center space-x-2"}>
        <img src={logo} alt=""/>
        <span className={"tracking-wider"}>{currentWorkSpace?.platform_name || "绣花针低空管控平台"}</span>
      </div>
      <div className={"flex space-x-4"}>
        {weatherInfo && <div className="flex space-x-6 text-lg mr-2">
          {/*<div>奉贤区：</div>*/}
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
        </div>}
        <div className={"content-center space-x-3"}>
          <CircleUserRound strokeWidth={1.25}/>
          <span>姓名： {currentUser?.name || "未登录"} </span>
          <span>{"当前组织: " + currentWorkSpace?.workspace_name || "未选择组织"}</span>
        </div>

        {username && <CommonDropDownMenu
          trigger={<IconButton>
            <ArrowDown/>
          </IconButton>}>
          <CommonDropDownMenuItem permissionKey={"Collection_WorkspaceView"} onClick={() => {
            navigate(`/organs`);
          }}>
            <div className={"flex w-full"}>
              <Users className="mr-2 h-4 w-4"/>
              <span>我的组织</span>
            </div>
          </CommonDropDownMenuItem>
          <CommonDropDownMenuItem onClick={() => {
            const tmpWorkspaceId = localStorage.getItem(ELocalStorageKey.WorkspacePrimaryKey);
            navigate(`/depart?id=${tmpWorkspaceId}`);
          }}>
            <div className={"flex w-full"}>
              <UserPlus className="mr-2 h-4 w-4"/>
              <span>我的部门</span>
            </div>
          </CommonDropDownMenuItem>
          <CommonDropDownMenuItem onClick={onLogout}>
            <div className={"flex w-full"}>
              <LogOut className="mr-2 h-4 w-4"/>
              <span>登出</span>
            </div>
          </CommonDropDownMenuItem>
        </CommonDropDownMenu>}
      </div>
    </div>
  );
};

export default TopBar;

