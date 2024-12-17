import { FC, PropsWithChildren } from "react";
import { cn } from "@/lib/utils.ts";

interface DetailPanelLayoutProps {
  title: string;
  content?: Record<string, any>;
  onClose?: () => void;
  size?: "normal" | "large";
  contentType?: "json" | "component";
}

const DetailPanelLayout: FC<PropsWithChildren<DetailPanelLayoutProps>> =
  ({ title, content = {}, size, onClose, contentType = "json", children }) => {
    const isImageUrl = (url: string) => {
      return /\.(jpeg|jpg|gif|png|svg)$/.test(url);
    };

    return (
      <div style={{
        backgroundSize: "100% 100%"
      }} className={"h-full w-full bg-bicycle-detail-bg px-[22px] relative bg-no-repeat z-20"}>
        <div
          className={cn("text-[#f3f3f3] text-[20px] font-[600]", size === "large" ? "py-[28px]" : "py-[14px]")}>{title}</div>
        <div className={cn("absolute right-[8px] text-[36px] cursor-pointer", size === "large" ? "top-[8px]" : "top-0")}
             onClick={onClose}>×
        </div>
        <div className={"flex flex-col py-[16px]"}>
          {
            contentType === "json" ? Object.keys(content).map(key => {
              const value = content[key];
              return (
                <div className={"py-[6px] flex space-x-[64px]"} key={key}>
                  <span className={"w-[100px] whitespace-nowrap"}>{key}</span>
                  {isImageUrl(value) ? (
                    <img src={value} alt={key} className="w-[100px] h-auto" />
                  ) : (
                    <span className={"text-[16px] text-[#57b2ff] font-[500]"}>{value}</span>
                  )}
                </div>
              );
            }) : children
          }
        </div>
      </div>
    );
  };

export default DetailPanelLayout;
