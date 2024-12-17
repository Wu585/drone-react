import {Icon} from "@/components/public/Icon.tsx";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {ArrowDown, CornerUpLeft, LogOut} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";

const UserInfo = () => {
  const {user, setUser} = useSceneStore();
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    setUser({
      ...user,
      username
    });
  }, []);

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
      <div className={"flex items-center justify-center px-[12px] h-full"}>
        <div className={"flex space-x-2 mr-12 justify-center items-center"}>
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
        </div>
        <div className={"flex flex-col mr-2 justify-center items-center"}>
          <Link to={"/street"} className={"flex items-center justify-center cursor-pointer"}>
            <CornerUpLeft className={"mr-2"}/>
            <span>返回大屏</span>
            <span className={"opacity-5"}>|</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default UserInfo;

