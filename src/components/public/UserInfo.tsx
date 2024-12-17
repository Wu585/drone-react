import {Icon} from "@/components/public/Icon.tsx";
import {useDateTime} from "@/hooks/public/date-time.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {ArrowDown, LogOut} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";

const UserInfo = () => {
  const {date, weekDay, time} = useDateTime();
  const {isFullScreen, setIsFullScreen, user, setUser} = useSceneStore();
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    setUser({
      ...user,
      username
    });
  }, []);

  const onFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const onLogout = () => {
    localStorage.removeItem("username");
    setUser({
      username: "",
      password: ""
    });
    navigate("/login");
  };

  return (
    <>
      <div className={"flex items-center justify-center px-[12px]"}>
        <div className={"flex space-x-2 mr-2 justify-center items-center"}>
          <Icon name={"avatar"}/>
          <span>{user.username}用户</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ArrowDown/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onLogout}>
                <div className={"flex w-full justify-center"}>
                  <LogOut className="mr-2 h-4 w-4"/>
                  <span>登出</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className={"opacity-5"}>|</span>
        </div>
        <div className={"flex flex-col mr-2 justify-center items-center"}>
          <Link to={"/manage-system"} className={"flex items-center justify-center cursor-pointer"}>
            <Icon name={"jumplink"}/>
            <span>系统运维</span>
            <span className={"opacity-5"}>|</span>
          </Link>
          <Link to={"/shared-dock"} className={"flex items-center justify-center cursor-pointer"}>
            <Icon name={"jumplink"}/>
            <span>共享对接</span>
            <span className={"opacity-5"}>|</span>
          </Link>
        </div>
        <div className={"flex justify-center space-x-2 items-center mr-4"}>
          <div className={"flex flex-col justify-center items-center "}>
            <div>{date}</div>
            <div>{weekDay}</div>
          </div>
          <span className={"opacity-5"}>|</span>
        </div>
        <div className={"font-bold text-[26px] mr-[4px]"}>
          {time}
        </div>
        <div>
          <Icon name={"full-screen"} className={"cursor-pointer"} onClick={onFullScreen}/>
        </div>
      </div>
    </>
  );
};

export default UserInfo;

