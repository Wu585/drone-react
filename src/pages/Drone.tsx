import { useRef} from "react";
import Panel from "@/components/travel-cloud/Panel.tsx";
import ToolBar from "@/components/toolbar/ToolBar.tsx";

const Drone = () => {
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {<div ref={panelRef} className={"absolute w-[1840px] h-[880px] z-50 left-1/2 top-1/2"} style={{
        transform: "translate(-50%,-50%)"
      }}>
        <Panel title={"无人机平台"} iframeUrl={"http://10.248.226.147:18001/"}/>
      </div>
      }
      <div className={"absolute z-20 right-[50px] bottom-[32px]"}>
        <ToolBar/>
      </div>
    </>
  );
};

export default Drone;

