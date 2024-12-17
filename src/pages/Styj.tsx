import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import {cn} from "@/lib/utils.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import ToolBar from "@/components/toolbar/ToolBar.tsx";
import elderlyHouse from "@/assets/images/elderly-house.png";
import CommonFullPie from "@/components/public/CommonFullPie.tsx";
import WaveProgress from "@/components/public/WaveProgress.tsx";
import MonitorBar from "@/components/bright-kitchen/MonitorBar.tsx";

const Styj = () => {
  const {isFullScreen} = useSceneStore();

  return (
    <>
      {
        isFullScreen &&
        <>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"生态宜居情况"}>
              <div className={"w-full h-[200px]"}>
                <div>区域开发强度</div>
                <MonitorBar/>
              </div>
              <div className={"mt-16 bg-rain-time flex justify-center items-center space-x-16 py-4"}>
                <img src={elderlyHouse} alt=""/>
                <div className={"flex flex-col space-y-2"}>
                  <span className={"text-[30px] font-bold text-[#FFB24D]"}>567</span>
                  <span>新建住宅（高度超过80米）数量</span>
                </div>
              </div>
              <div className={"h-[300px]"}>
                <CommonFullPie
                  color={["#0CFFC4", "#4082E4"]}
                  data={[
                    {name: "新建建筑绿色建筑占比", value: 60},
                    {name: "非新建建筑绿色建筑占比", value: 40},
                  ]}
                />
              </div>
              <div className={"grid grid-cols-2 gap-4"}>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={70}/>
                  </div>
                  <div>绿道服务半径覆盖率</div>
                </div>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={50} border={"border-[#3DFF61]"} fill={"#3DFF61"}/>
                  </div>
                  <div>公园绿地服务半径覆盖率</div>
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

export default Styj;

