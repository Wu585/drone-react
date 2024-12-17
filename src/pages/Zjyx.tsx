import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import {cn} from "@/lib/utils.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import ToolBar from "@/components/toolbar/ToolBar.tsx";
import WaveProgress from "@/components/public/WaveProgress.tsx";

const Zjyx = () => {
  const {isFullScreen} = useSceneStore();

  return (
    <>
      {
        isFullScreen &&
        <>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"街道整洁有序情况"}>
              <div className={"grid grid-cols-2 gap-4"}>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={70}/>
                  </div>
                  <div>街道立杆、空中线路规整性</div>
                </div>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={50} border={"border-[#3DFF61]"} fill={"#3DFF61"}/>
                  </div>
                  <div>街道车辆停放有序性</div>
                </div>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={30}/>
                  </div>
                  <div>重要管网监测监控覆盖率</div>
                </div>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={80} border={"border-[#3DFF61]"} fill={"#3DFF61"}/>
                  </div>
                  <div>井盖完好率</div>
                </div>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={70}/>
                  </div>
                  <div className={"whitespace-nowrap"}>实施专业化物业管理的住宅珊小区占比</div>
                </div>
              </div>
            </DisPlayItemLayout>
          </div>
        </>
      }
      <div className={"absolute z-20 right-[50px] bottom-[32px]"}>
        <ToolBar/>
      </div>
      <div style={{
        backgroundSize: "100% 100%"
      }} className={cn("bg-side-container bg-no-repeat w-[560px] h-full absolute top-0 left-0 z-5 my-[80px]",
        isFullScreen ? "w-[560px]" : "w-0")}/>
    </>
  );
};

export default Zjyx;

