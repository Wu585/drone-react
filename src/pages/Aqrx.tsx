import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import {cn} from "@/lib/utils.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import ToolBar from "@/components/toolbar/ToolBar.tsx";
import aqrx1Png from "@/assets/images/aqrx-1.png";
import aqrx2Png from "@/assets/images/aqrx-2.png";
import aqrx3Png from "@/assets/images/aqrx-3.png";
import aqrx4Png from "@/assets/images/aqrx-4.png";
import CommonFullPie from "@/components/public/CommonFullPie.tsx";

const Aqrx = () => {
  const {isFullScreen} = useSceneStore();

  return (
    <>
      {
        isFullScreen &&
        <>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"街道健康舒适情况"}>
              <div className={"mt-8 bg-rain-time flex pl-[50px] items-center space-x-16 py-4"}>
                <img src={aqrx1Png} alt=""/>
                <div className={"flex flex-col space-y-2"}>
                  <span className={"text-[30px] font-bold text-[#FFB24D]"}>85</span>
                  <span>内涝积水点密度（个/平方公里）</span>
                </div>
              </div>
              <div className={"mt-8 bg-rain-time flex pl-[50px] items-center space-x-16 py-4"}>
                <img src={aqrx2Png} alt=""/>
                <div className={"flex flex-col space-y-2"}>
                  <span className={"text-[30px] font-bold text-[#FFB24D]"}>10%</span>
                  <span>道路交通事故万车死亡率（人/万车）</span>
                </div>
              </div>
              <div className={"mt-8 bg-rain-time flex pl-[50px] items-center space-x-16 py-4"}>
                <img src={aqrx3Png} alt=""/>
                <div className={"flex flex-col space-y-2"}>
                  <span className={"text-[30px] font-bold text-[#FFB24D]"}>15%</span>
                  <span>安全事故死亡率（人/万人）</span>
                </div>
              </div>
              <div className={"mt-8 bg-rain-time flex pl-[50px] items-center space-x-16 py-4"}>
                <img src={aqrx4Png} alt=""/>
                <div className={"flex flex-col space-y-2"}>
                  <span className={"text-[30px] font-bold text-[#FFB24D]"}>1.9</span>
                  <span>人均避难场所面积（平方米/人）</span>
                </div>
              </div>
              <div className={"h-[300px]"}>
                <CommonFullPie
                  color={["#0CFFC4", "#4082E4"]}
                  data={[
                    {name: "小型普通 消防站覆盖率", value: 60},
                    {name: "大型普通 消防站覆盖率", value: 40},
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

export default Aqrx;

