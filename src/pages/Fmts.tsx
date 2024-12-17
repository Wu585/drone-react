import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import {cn} from "@/lib/utils.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import ToolBar from "@/components/toolbar/ToolBar.tsx";
import elderlyHouse from "@/assets/images/elderly-house.png";
import CommonFullPie from "@/components/public/CommonFullPie.tsx";

const Fmts = () => {
  const {isFullScreen} = useSceneStore();

  return (
    <>
      {
        isFullScreen &&
        <>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"街道健康舒适情况"}>
              <div className={"mt-8 bg-rain-time flex justify-center items-center space-x-16 py-4"}>
                <img src={elderlyHouse} alt=""/>
                <div className={"flex flex-col space-y-2"}>
                  <span className={"text-[30px] font-bold text-[#FFB24D]"}>85</span>
                  <span>街道历史风貌破坏负面时间数量（个）</span>
                </div>
              </div>
              <div className={"h-[300px]"}>
                <CommonFullPie
                  color={["#0CFFC4", "#4082E4"]}
                  data={[
                    {name: "街道历史文化街区保护 修缮率", value: 60},
                    {name: "非街道历史文化街区保护 修缮率", value: 40},
                  ]}/>
              </div>
              <div className={"h-[300px]"}>
                <CommonFullPie
                  color={["#0CFFC4", "#4082E4"]}
                  data={[
                    {name: "街道历史建筑空置率", value: 60},
                    {name: "非街道历史建筑空置率", value: 40},
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

export default Fmts;

