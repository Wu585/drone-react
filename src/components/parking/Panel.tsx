import closePng from "@/assets/images/panel-close.png";

interface PanelProps {
  onClose?: () => void;
  title?: string;
  iframeUrl: string;
}

const Panel = ({onClose, title, iframeUrl}: PanelProps) => {
  return (
    <div style={{
      backgroundSize: "100% 100%"
    }} className={"bg-facilities-panel h-full w-full bg-100% relative"}>
      <div className={"absolute top-[28px] left-[48px] text-[22px] font-semibold"}>{title}</div>
      <img onClick={onClose} className={"absolute right-[24px] top-[48px] cursor-pointer"} src={closePng} alt=""/>
      <div className={"absolute top-[110px] w-full h-[850px] flex px-6 py-2 space-x-8"}>
        <div className={"w-full overflow-auto"}>
          <iframe className={"w-full h-full"} src={iframeUrl}></iframe>
        </div>
      </div>
    </div>
  );
};

export default Panel;

