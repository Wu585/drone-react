import {cn} from "@/lib/utils.ts";
import {ReactNode, useState} from "react";
import titleArrowPng from "@/assets/images/drone/title-arrow.png";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";

type TabItem = {
  name: string;
  icon: ReactNode;
  content: ReactNode;
  permission: string
};

type TabbedLayoutProps = {
  title: string;
  defaultTab: string;
  tabs: TabItem[];
  headerActions?: ReactNode;
  showTitleArrow?: boolean;
  isFullPage?: boolean;
};

export const TabbedLayout = ({
                               title,
                               defaultTab,
                               tabs,
                               headerActions,
                               showTitleArrow = true,
                               isFullPage = false,
                             }: TabbedLayoutProps) => {
  const [currentTab, setCurrentTab] = useState(defaultTab);

  const currentContent = tabs.find((tab) => tab.name === currentTab)?.content;

  return (
    <div
      className={cn("w-full h-full flex bg-gradient-to-r from-[#172A4F]/[.6] to-[#233558]/[.6]", isFullPage && "rounded-lg")}>
      <div
        className={cn("flex-1 border-[#43ABFF] flex flex-col rounded-r-lg border-[1px]", isFullPage ? "rounded-lg" : "border-l-0")}>
        <div className={"flex justify-between items-center"}>
          <div className={"py-4 px-4 flex space-x-4"}>
            {showTitleArrow && <img src={titleArrowPng} alt=""/>}
            <div className={"space-x-2"}>
              <span>{title}</span>
              {tabs.length > 1 && (
                <>
                  <span>|</span>
                  <span>{currentTab}</span>
                </>
              )}
            </div>
          </div>
          {headerActions}
        </div>

        {tabs.length > 1 && (
          <div className={"flex space-x-8 px-4"}>
            {tabs.map((item) => (
              <CommonButton
                permissionKey={item.permission}
                key={item.name}
                style={{
                  backgroundSize: "100% 100%",
                }}
                className={cn(
                  "w-[211px] h-[38px] text-sm cursor-pointer justify-start pl-8 space-x-2 rounded-none",
                  currentTab === item.name ? "bg-tab-active" : "bg-tab"
                )}
                onClick={() => setCurrentTab(item.name)}
              >
                <span className={cn(currentTab === item.name && "text-[#A1F4FA]")}>
                  {item.icon}
                </span>
                <span
                  className={cn(
                    currentTab === item.name &&
                    "bg-gradient-to-b from-[#E8FFFE] via-[#A1F4FA] to-[#589AE4] bg-clip-text text-transparent"
                  )}
                >
                  {item.name}
                </span>
              </CommonButton>
            ))}
          </div>
        )}

        <div className={"flex-1 p-4"}>{currentContent}</div>
      </div>
    </div>
  );
};
