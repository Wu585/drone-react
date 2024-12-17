import closePng from "@/assets/images/panel-close.png";
import xpgxcPng from "@/assets/images/xpgxc-camera.png";

interface PanelProps {
  onClose?: () => void;
}

const Panel = ({onClose}: PanelProps) => {
  return (
    <div style={{
      backgroundSize: "100% 100%"
    }} className={"bg-facilities-panel h-full w-full bg-100% relative"}>
      <div className={"absolute top-[28px] left-[48px] text-[22px] font-semibold"}>共享仓2910</div>
      <img onClick={onClose} className={"absolute right-[24px] top-[48px] cursor-pointer"} src={closePng} alt=""/>
      <div className={"flex absolute top-[68px] left-[48px] space-x-8"}>
        <div>
          <span>位置：</span>
          <span className={"text-[#3ADEFF]"}>奉浦街道</span>
        </div>
        <div>
          <span>柜数：</span>
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
      <div className={"absolute top-[110px] w-full flex px-6 py-4 space-x-8"}>
        <div className={"grid grid-cols-5 gap-4"}>
          {
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,24,25,26].map(() => <span style={{
              background: "rgba(255,255,255,0.29)",
              border: " 1px solid rgba(255,255,255,0.5)"
            }} className={"h-[50px] w-[32px]"}></span>)
          }
        </div>
        <div className={""}>
          <img src={xpgxcPng} alt=""/>
        </div>
      </div>
    </div>
  );
};

export default Panel;

