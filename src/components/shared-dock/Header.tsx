import SharedDockMenu from "@/components/shared-dock/SharedDockMenu.tsx";
import UserInfo from "@/components/shared-dock/UserInfo.tsx";

const Header = () => {
  return (
    <div className={"bg-shared-dock-header h-[80px] relative"}>
      <div className={"absolute left-[534px] h-full"}>
        <SharedDockMenu/>
      </div>
      <div className={"absolute right-[32px] h-full"}>
        <UserInfo/>
      </div>
    </div>
  );
};

export default Header;

