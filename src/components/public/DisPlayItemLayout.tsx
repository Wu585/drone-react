import {FC, PropsWithChildren, ReactNode} from "react";

interface DisPlayItemLayoutProps {
  title?: string;
  action?: ReactNode;
}

const DisPlayItemLayout: FC<PropsWithChildren<DisPlayItemLayoutProps>> = ({title, action, children}) => {
  return (
    <div className={"w-[500px] font-NotoCJK"}>
      <div className={"bg-display-item-title w-[full] bg-cover h-[54px] bg-no-repeat flex justify-between"}>
        <div style={{
          background: "linear-gradient(to bottom, rgb(243, 250, 255), rgb(24, 143, 221))",
          WebkitTextFillColor: "transparent",
          WebkitBackgroundClip: "text", // 使用 WebKit 前缀
        }} className={"text-[20px] pl-[48px] pt-[4px] font-Alimama whitespace-nowrap"}>{title}</div>
        <div className={"pr-[32px] text-[12px]"}>{action}</div>
      </div>
      <div className={"py-[10px] w-[500px]"}>
        {children}
      </div>
    </div>
  );
};

export default DisPlayItemLayout;

