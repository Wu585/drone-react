import closePng from "@/assets/images/panel-close.png";
import camerPng from "@/assets/images/wrcs-camera.png";
import {Dot} from "lucide-react";

interface PanelProps {
  onClose?: () => void;
}

const Panel = ({onClose}: PanelProps) => {
  return (
    <div style={{
      backgroundSize: "100% 100%"
    }} className={"bg-facilities-panel h-full w-full bg-100% relative"}>
      <div className={"absolute top-[28px] left-[48px] text-[22px] font-semibold"}>无人值守超市</div>
      <img onClick={onClose} className={"absolute right-[24px] top-[48px] cursor-pointer"} src={closePng} alt=""/>
      <div className={"flex absolute top-[68px] left-[48px] space-x-8"}>
        <div>
          <span>位置：</span>
          <span className={"text-[#3ADEFF]"}>奉浦街道</span>
        </div>
        <div>
          <span>监控数量：</span>
          <span className={"text-[#3ADEFF]"}>5</span>
        </div>
        <div>
          <span>联系人：</span>
          <span className={"text-[#3ADEFF]"}>芦二广</span>
        </div>
        <div>
          <span>联系方式：</span>
          <span className={"text-[#3ADEFF]"}>13341870016</span>
        </div>
      </div>
      <div className={"absolute top-[110px] w-full grid grid-cols-3 gap-4 px-8 py-4"}>
        <div>
          <img src={camerPng} alt=""/>
          <div className={"flex justify-between"}>
            <span>收银台</span>
            <div className={"flex text-[#00FF79]"}>
              <Dot/>
              <span> 在线</span>
            </div>
          </div>
        </div>
        <div>
          <img src={camerPng} alt=""/>
          <div className={"flex justify-between"}>
            <span>收银台</span>
            <div className={"flex text-[#00FF79]"}>
              <Dot/>
              <span> 在线</span>
            </div>
          </div>
        </div>
        <div>
          <img src={camerPng} alt=""/>
          <div className={"flex justify-between"}>
            <span>收银台</span>
            <div className={"flex text-[#00FF79]"}>
              <Dot/>
              <span> 在线</span>
            </div>
          </div>
        </div>
        <div>
          <img src={camerPng} alt=""/>
          <div className={"flex justify-between"}>
            <span>收银台</span>
            <div className={"flex text-[#00FF79]"}>
              <Dot/>
              <span> 在线</span>
            </div>
          </div>
        </div>
        <div>
          <img src={camerPng} alt=""/>
          <div className={"flex justify-between"}>
            <span>收银台</span>
            <div className={"flex text-[#00FF79]"}>
              <Dot/>
              <span> 在线</span>
            </div>
          </div>
        </div>
        <div>
          <img src={camerPng} alt=""/>
          <div className={"flex justify-between"}>
            <span>收银台</span>
            <div className={"flex text-[#00FF79]"}>
              <Dot/>
              <span> 在线</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panel;

