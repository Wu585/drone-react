import {ArrowDown, CircleUser, LogOut} from "lucide-react";
import {ELocalStorageKey} from "@/types/enum.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useNavigate} from "react-router-dom";

const TopBar = () => {
  const username = localStorage.getItem(ELocalStorageKey.Username);
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <div className={"h-[70px] bg-gradient-to-b from-[#1D3A7A]/[.82] to-[#1157B4]/[.82] " +
      "flex justify-between items-center px-[66px] py-[18px]"}>
      <div className={"text-[24px] font-semibold"}>翼枭航空科技有限公司</div>
      <div className={"flex space-x-4"}>
        <CircleUser/>
        <span>{username || "未登录"}</span>
        {username && <DropdownMenu>
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
        </DropdownMenu>}
      </div>
    </div>
  );
};

export default TopBar;

