import {Link, useLocation, useNavigate} from "react-router-dom";
import {ArrowDown, CircleUser, LogOut} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useEffect} from "react";

interface Menu {
  name: string;
  href: string;
}

export const menuList: Menu[] = [
  {
    name: "首页",
    href: "/home"
  },
  {
    name: "资源中心",
    href: "/resource-center"
  },
  {
    name: "开发中心",
    href: "/develop-center"
  },
];

const Header = () => {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {user, setUser} = useSceneStore();

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
    <div className={"bg-hgyq-header flex justify-between z-50 fixed top-0 w-full"}>
      <h1 className={"px-[70px] text-[28px] py-[15px]"}>上海化学工业区</h1>
      <div className={"flex justify-center items-center space-x-[82px] tracking-[2px]"}>
        <div className={"mt-[11px] grid grid-cols-3"}>
          {menuList.map(item =>
            <Link
              className={cn("w-[145px] h-[61px] flex items-center justify-center text-center",
                pathname === item?.href ? "bg-hgyq-header-menu-active" : "")}
              to={item.href} key={item.href}>{item.name}</Link>)}
        </div>
        <div className={"px-[25px] flex space-x-[12px]"}>
          <CircleUser/>
          {user.username ? <>
            <span>{user.username}</span>
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
          </> : <> <Link to={"/login"}>登录</Link>
            <span>|</span>
            <Link to={"register"}>注册</Link></>}
        </div>
      </div>
    </div>
  );
};

export default Header;

