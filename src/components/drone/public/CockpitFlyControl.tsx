import CockpitTitle from "@/components/drone/public/CockpitTitle.tsx";
import Keyboard from "@/components/drone/public/Keyboard.tsx";
import {ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, RedoDot} from "lucide-react";
import CockpitButton from "@/components/drone/public/CockpitButton.tsx";

const CockpitFlyControl = () => {
  return (
    <>
      <CockpitTitle title={"飞行控制"}/>
      <div className={"grid grid-cols-4 px-[48px] pt-[24px] gap-[32px]"}>
        <div className={"col-span-3 grid grid-cols-3 gap-y-4"}>
          <div className={"content-center flex flex-col space-y-2"}>
            <RedoDot className={"transform scale-x-[-1]"}/>
            <Keyboard keyboard={"Q"}/>
          </div>
          <div className={"content-center flex flex-col space-y-2"}>
            <ChevronUp/>
            <Keyboard keyboard={"W"}/>
          </div>
          <div className={"content-center flex flex-col space-y-2"}>
            <RedoDot/>
            <Keyboard keyboard={"E"}/>
          </div>
          <div className={"content-center flex flex-col space-y-2"}>
            <Keyboard keyboard={"A"}/>
            <ChevronLeft/>
          </div>
          <div className={"content-center flex flex-col space-y-2"}>
            <Keyboard keyboard={"S"}/>
            <ChevronDown/>
          </div>
          <div className={"content-center flex flex-col space-y-2"}>
            <Keyboard keyboard={"D"}/>
            <ChevronRight/>
          </div>
        </div>
        <div className={"space-y-4"}>
          <div className={"content-center flex flex-col space-y-2"}>
            <ArrowUp/>
            <Keyboard keyboard={"↑"}/>
          </div>
          <div className={"content-center flex flex-col space-y-2"}>
            <Keyboard keyboard={"↓"}/>
            <ArrowDown/>
          </div>
        </div>
      </div>
      <div className={"px-[48px] pt-[24px] grid grid-cols-2 gap-x-[32px] gap-y-2"}>
        <CockpitButton>高速模式</CockpitButton>
        <CockpitButton>返航</CockpitButton>
        <CockpitButton>飞行设置</CockpitButton>
      </div>
    </>
  );
};

export default CockpitFlyControl;

