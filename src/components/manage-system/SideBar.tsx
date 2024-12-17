import {Menu} from "@/components/manage-system/menu.tsx";

const SideBar = () => {
  return (
    <aside className={"fixed top-14 left-0 z-20 w-72 h-screen p-[22px]"}>
      <Menu isOpen={true}/>
    </aside>
  );
};

export default SideBar;

