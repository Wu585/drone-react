import FitScreen from "@fit-screen/react";
import FlightStatistics from "@/components/drone/screen/FlightStatistics.tsx";
import DeviceStatistics from "@/components/drone/screen/DeviceStatistics.tsx";
import WorkOrder from "@/components/drone/screen/WorkOrder.tsx";
import MediaStatistics from "@/components/drone/screen/MediaStatistics.tsx";
import GMap from "@/components/drone/public/GMap.tsx";

const Screen = () => {
  return (
    <FitScreen width={3840} height={1080} mode={"fit"}>
      <div className={"w-full h-full bg-screen-full"}>
        <header className={"h-[148px] bg-screen-header flex justify-center absolute top-0 w-full"}>
          <div className={"text-[37px] text-[#cfefff] tracking-[5px] pt-[10px]"}>
            翼枭无人机数据可视化大屏
          </div>
        </header>
        <div
          className={"border-2 border-red-500 h-full pt-[78px] px-[53px] pb-[36px] grid grid-cols-4 gap-[20px] z-50"}>
          <div className={"col-span-1 space-y-[20px]"}>
            <FlightStatistics/>
            <DeviceStatistics/>
          </div>
          <div className={"col-span-2"}>
            <GMap/>
          </div>
          <div className={"col-span-1 space-y-[20px]"}>
            <WorkOrder/>
            <MediaStatistics/>
          </div>
        </div>
      </div>
    </FitScreen>
  );
};

export default Screen;

