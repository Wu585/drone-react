import titleIcon from "@/assets/images/drone/screen/title-icon.png";
import {getScreenImageUrl} from "@/lib/utils.ts";
import {cn} from "@/lib/utils.ts";

const MediaStatistics = () => {
  const menuList = [
    {
      name: "总空间",
      image: "zkj",
      percent: 20,
      color: "#FF4D4F",
      gradient: "from-[#FF4D4F]/80 to-[#FF4D4F]"
    },
    {
      name: "视频",
      image: "sp",
      percent: 10,
      color: "#FFA940",
      gradient: "from-[#FFA940]/80 to-[#FFA940]"
    },
    {
      name: "照片",
      image: "zp",
      percent: 10,
      color: "#73D13D",
      gradient: "from-[#73D13D]/80 to-[#73D13D]"
    },
    {
      name: "压缩包",
      image: "ysb"
    }
  ];

  return (
    <div className={"bg-screen-content bg-full-size flex flex-col pr-[40px] "}>
      <header className={"bg-screen-title pl-[43px] bg-full-size h-[45px] flex items-center"}>媒体库统计</header>
      <div className={"flex-1 pb-[30px] pl-[33px]"}>
        <div className={"flex items-center space-x-[20px] text-[12px] py-[13px]"}>
          <img src={titleIcon} className={"w-[12px]"} alt=""/>
          <span>使用空间统计</span>
        </div>
        <div className={"h-[100px] flex flex-col justify-center space-y-4"}>
          <div className={"h-[16px] bg-[#072E62]/[.7] w-full relative rounded-sm overflow-hidden"}>
            {menuList.map((item, index) => (
              <div
                key={item.name}
                className={cn(
                  "absolute h-full bg-gradient-to-r transition-all duration-500",
                  item.gradient
                )}
                style={{
                  width: `${item.percent}%`,
                  left: `${menuList.slice(0, index).reduce((acc, cur) => acc + (cur.percent || 0), 0)}%`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              </div>
            ))}
          </div>
          <div className="flex space-x-4">
            {menuList.map(item => (
              <div key={item.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-[#CFEFFF]">
                  {item.name} {item.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className={"flex space-x-[32px]"}>
          {menuList.map(item =>
            <div key={item.name} className={"bg-full-size bg-screen-media-content " +
              "w-[174px] h-[64px] flex items-center space-x-4"}>
              <img src={getScreenImageUrl(item.image)} alt=""/>
              <div className={"flex flex-col"}>
                <span className={"font-semibold text-[#CFEFFF] text-[22px]"}>100G</span>
                <span className={"text-[#CFEFFF] text-[14px]"}>{item.name}</span>
              </div>
            </div>)}
        </div>
      </div>
    </div>
  );
};

export default MediaStatistics;

