import UserInfo from "@/components/manage-system/UserInfo.tsx";

const Header = () => {
  return (
    <div className={"text-black flex justify-between p-[22px]"}>
      <div className={"text-[24px] text-[#263339] font-bold"}>奉浦街道数字家园运维管理系统</div>
      <UserInfo/>
    </div>
  );
};

export default Header;

