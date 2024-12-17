import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import {cn} from "@/lib/utils.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import ToolBar from "@/components/toolbar/ToolBar.tsx";
import WaveProgress from "@/components/public/WaveProgress.tsx";

const Dybr = () => {
  const {isFullScreen} = useSceneStore();

  return (
    <>
      {
        isFullScreen &&
        <>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"街道多元包容情况"}>
              <div className={"grid grid-cols-2 gap-4"}>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={70}/>
                  </div>
                  <div>道路无障碍设施设置率</div>
                </div>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={50} border={"border-[#3DFF61]"} fill={"#3DFF61"}/>
                  </div>
                  <div>常住人口住房保障服务覆盖率</div>
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

export default Dybr;

