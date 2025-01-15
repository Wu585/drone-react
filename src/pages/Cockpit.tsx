import FitScreen from "@fit-screen/react";
import batteryPng from "@/assets/images/drone/cockpit/battery.png";
import workTimePng from "@/assets/images/drone/cockpit/work-time.png";
import flyTimePng from "@/assets/images/drone/cockpit/fly-time.png";
import rtkPng from "@/assets/images/drone/cockpit/rtk.png";
import CockpitTitle from "@/components/drone/public/CockpitTitle.tsx";
import weatherBasePng from "@/assets/images/drone/cockpit/weather-base.png";
import cloudyPng from "@/assets/images/drone/cockpit/cloudy.png";
import humidityPng from "@/assets/images/drone/cockpit/humidity.png";
import rainyPng from "@/assets/images/drone/cockpit/rainy.png";
import windyPng from "@/assets/images/drone/cockpit/windy.png";
import windPowerPng from "@/assets/images/drone/cockpit/wind-power.png";
import CockpitFlyControl from "@/components/drone/public/CockpitFlyControl.tsx";
import {Input} from "@/components/ui/input.tsx";

const Cockpit = () => {
  return (
    <FitScreen width={1920} height={1080} mode="full">
      <div className={"h-full bg-cockpit bg-full-size relative grid grid-cols-5"}>
        <header className={"bg-cockpit-header h-[164px] bg-full-size absolute top-0 w-full left-0"}></header>
        <div className={"col-span-1"}>
          <div className={"mt-[123px] ml-[53px] mb-[16px]"}>
            <CockpitTitle title={"机场直播"} />
          </div>
          <div className={"border-2 w-[360px] h-[186px] ml-[30px]"}>

          </div>
          <div className={"border-2 w-[360px] h-[244px] mt-[10px] ml-[30px]"}>

          </div>
          <div className={"ml-[53px] py-[30px]"}>
            <CockpitTitle title={"飞行器基本参数"} />
          </div>
          <div className={"ml-[53px] mr-[32px] space-y-4"}>
            <div className={"w-[290px] bg-fly-params bg-full-size grid grid-cols-6 items-center py-[16px] px-[16px]"}>
              <span className={"col-span-4"}>飞行作业高（ALT）</span>
              <Input
                className={"col-span-2 h-[22px] bg-[#072E62]/[.7] border-[1px] border-[#0076C9]/[.85] rounded-[1px]"}/>
            </div>
            <div className={"w-[290px] bg-fly-params bg-full-size grid grid-cols-6 items-center py-[16px] px-[16px]"}>
              <span className={"col-span-4"}>返航高（ALT）</span>
              <Input
                className={"col-span-2 h-[22px] bg-[#072E62]/[.7] border-[1px] border-[#0076C9]/[.85] rounded-[1px]"}/>
            </div>
            <div className={"w-[290px] bg-fly-params bg-full-size grid grid-cols-6 items-center py-[16px] px-[16px]"}>
              <span className={"col-span-4"}>目标点高度（AGL）</span>
              <Input
                className={"col-span-2 h-[22px] bg-[#072E62]/[.7] border-[1px] border-[#0076C9]/[.85] rounded-[1px]"}/>
            </div>
          </div>
        </div>
        <div className={"col-span-3"}>
          <div className={"h-[596px] bg-center-video mt-[52px] bg-full-size"}></div>
          <div className={"grid grid-cols-3"}>
            <div className={"col-span-1 content-center py-8"}>
              <div className={"grid grid-cols-2 gap-10"}>
              <div className={"flex space-x-4"}>
                  <img src={batteryPng} alt=""/>
                  <div className={"flex flex-col justify-center space-y-2"}>
                    <span className={"text-[12px] text-[#D0D0D0]"}>电池电量</span>
                    <span>65%</span>
                  </div>
                </div>
                <div className={"flex space-x-4"}>
                  <img src={workTimePng} alt=""/>
                  <div className={"flex flex-col justify-center space-y-2"}>
                    <span className={"text-[12px] text-[#D0D0D0] whitespace-nowrap"}>剩余作业时长</span>
                    <span>30min</span>
                  </div>
                </div>
                <div className={"flex space-x-4"}>
                  <img src={flyTimePng} alt=""/>
                  <div className={"flex flex-col justify-center space-y-2"}>
                    <span className={"text-[12px] text-[#D0D0D0]"}>剩余飞行时长</span>
                    <span>30min</span>
                  </div>
                </div>
                <div className={"flex space-x-4"}>
                  <img src={rtkPng} alt=""/>
                  <div className={"flex flex-col justify-center space-y-2"}>
                    <span className={"text-[12px] text-[#D0D0D0]"}>电池电量</span>
                    <span>65%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={"col-span-1 border-2"}></div>
            <div className={"col-span-1"}>
              <CockpitTitle title={"飞行器当前状态"}/>
              <div className={"space-y-[10px] mt-[64px]"}>
                <div className={"grid grid-cols-2 px-[26px]"}>
                  <span>当前状态：</span>
                  <span>正在启动</span>
                </div>
                <div>
                  <div className={"grid grid-cols-2 px-[26px]"}>
                    <span>设备型号：</span>
                    <span>Dock 2</span>
                  </div>
                </div>
                <div>
                  <div className={"grid grid-cols-2 px-[26px]"}>
                    <span>设备SN：</span>
                    <span>7CTDM3D00B0UPL</span>
                  </div>
                </div>
                <div>
                  <div className={"grid grid-cols-2 px-[26px]"}>
                    <span>设备项目呼号：</span>
                    <span>曙光中学</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={"col-span-1 pt-[236px]"}>
          <CockpitTitle title={"实时气象"}/>
          <div className={"flex"}>
            <div className={"flex flex-col content-center"}>
              <img className={"translate-y-12"} src={cloudyPng} alt=""/>
              <img src={weatherBasePng} alt=""/>
            </div>
            <div className={"pl-[32px] space-y-4 flex flex-col justify-center"}>
              <span>温度：</span>
              <div className={"text-[34px]"}>17.4°C</div>
              <div>
                <span>当前状态：</span>
                <span className={"text-[#2BE7FF]"}>适合飞行</span>
              </div>
            </div>
          </div>
          <div className={"grid grid-cols-2 mt-[16px]"}>
            <div className={"flex"}>
              <img src={humidityPng} alt=""/>
              <div className={"flex flex-col"}>
                <span>湿度</span>
                <span className={"text-[18px] text-[#32A3FF]"}>60%</span>
              </div>
            </div>
            <div className={"flex"}>
              <img src={rainyPng} alt=""/>
              <div className={"flex flex-col"}>
                <span>降雨</span>
                <span className={"text-[18px] text-[#32A3FF]"}>48（mm）</span>
              </div>
            </div>
            <div className={"flex"}>
              <img src={windyPng} alt=""/>
              <div className={"flex flex-col"}>
                <span>风向</span>
                <span className={"text-[18px] text-[#32A3FF]"}>东南风</span>
              </div>
            </div>
            <div className={"flex"}>
              <img src={windPowerPng} alt=""/>
              <div className={"flex flex-col"}>
                <span>风力</span>
                <span className={"text-[18px] text-[#32A3FF]"}>2级</span>
              </div>
            </div>
          </div>
          <div>
            <CockpitFlyControl/>
          </div>
        </div>
      </div>
    </FitScreen>
  );
};

export default Cockpit;

