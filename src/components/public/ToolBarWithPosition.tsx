import {cn} from "@/lib/utils.ts";
import ToolBar from "@/components/toolbar/ToolBar.tsx";
import {useSceneStore} from "@/store/useSceneStore.ts";

const ToolBarWithPosition = () => {
  const {isFullScreen} = useSceneStore();

  return (
    <div className={cn("absolute z-20 right-[580px] bottom-[32px]", !isFullScreen && "right-[50px]")}>
      <ToolBar/>
    </div>
  );
};

export default ToolBarWithPosition;

