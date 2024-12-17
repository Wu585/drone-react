import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import {cn} from "@/lib/utils.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import ToolBar from "@/components/toolbar/ToolBar.tsx";
import elderlyHouse from "@/assets/images/elderly-house.png";
import CommonFullPie from "@/components/public/CommonFullPie.tsx";
import WaveProgress from "@/components/public/WaveProgress.tsx";

const Jkss = () => {
  const {isFullScreen} = useSceneStore();

  return (
    <>
      {
        isFullScreen &&
        <>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"街道健康舒适情况"}>
              <div className={"grid grid-cols-2 gap-4"}>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={70}/>
                  </div>
                  <div>完整居住社区覆盖率</div>
                </div>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={50} border={"border-[#3DFF61]"} fill={"#3DFF61"}/>
                  </div>
                  <div>社区便民商业服务设施覆盖率</div>
                </div>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={30}/>
                  </div>
                  <div>社区老年服务站覆盖率</div>
                </div>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={80} border={"border-[#3DFF61]"} fill={"#3DFF61"}/>
                  </div>
                  <div>普惠性幼儿园覆盖率</div>
                </div>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={70}/>
                  </div>
                  <div>社区卫生服务中心门诊分担率</div>
                </div>
                <div className={"flex flex-col justify-center items-center space-y-4"}>
                  <div className={"w-[100px] h-[100px]"}>
                    <WaveProgress progress={50} border={"border-[#3DFF61]"} fill={"#3DFF61"}/>
                  </div>
                  <div>老旧小区改造达标率</div>
                </div>
              </div>
              <div className={"mt-8 bg-rain-time flex justify-center items-center space-x-16 py-4"}>
                <img src={elderlyHouse} alt=""/>
                <div className={"flex flex-col space-y-2"}>
                  <span className={"text-[30px] font-bold text-[#FFB24D]"}>85</span>
                  <span>人均社区体育场面积（平方米/人）</span>
                </div>
              </div>
              <div className={"h-[300px]"}>
                <CommonFullPie
                  color={["#0CFFC4", "#4082E4"]}
                  data={[
                    {name: "新建住宅密度超过30%", value: 60},
                    {name: "新建住宅密度小于30%", value: 40},
                  ]}/>
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

export default Jkss;

