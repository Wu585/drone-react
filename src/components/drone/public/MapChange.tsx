import {useState} from "react";
import bzImage from "@/assets/images/drone/map/bz.png";
import yxImage from "@/assets/images/drone/map/yx.png";
import {cn} from "@/lib/utils";
import {findMapLayer} from "@/lib/view.ts";

const MapChange = () => {
  const [selectedMap, setSelectedMap] = useState<"bz" | "yx">("bz");

  return (
    <div
      className={cn(
        "relative group flex items-center",  // 改为水平布局
        "transition-all duration-300 ease-in-out",
        "bg-black/50 rounded-l-lg overflow-hidden",
        // 默认状态只显示一小部分，悬浮时展开
        "h-[80px] w-[40px] hover:w-[280px]"  // 调整宽度以适应横向布局
      )}
    >
      {/* 标准地图 */}
      <div
        className={cn(
          "h-full cursor-pointer p-2 shrink-0",  // 添加 shrink-0 防止压缩
          "transition-all duration-200",
          selectedMap === "bz" && "bg-white/10"
        )}
        onClick={() => {
          setSelectedMap("bz");
          findMapLayer("矢量图").show = true;
          findMapLayer("影像").show = false;
          if (viewer2) {
            findMapLayer("矢量图", viewer2).show = true;
            findMapLayer("影像", viewer2).show = false;
          }
        }}
      >
        <img
          className="h-full w-[120px] object-cover"  // 调整图片尺寸
          src={bzImage}
          alt="标准地图"
        />
      </div>

      {/* 卫星地图 */}
      <div
        className={cn(
          "h-full cursor-pointer p-2 shrink-0",  // 添加 shrink-0 防止压缩
          "transition-all duration-200",
          selectedMap === "yx" && "bg-white/10"
        )}
        onClick={() => {
          findMapLayer("矢量图").show = false;
          findMapLayer("影像").show = true;
          if (viewer2) {
            findMapLayer("矢量图", viewer2).show = false;
            findMapLayer("影像", viewer2).show = true;
          }
        }}
      >
        <img
          className="h-full w-[120px] object-cover"  // 调整图片尺寸
          src={yxImage}
          alt="卫星地图"
        />
      </div>
    </div>
  );
};

export default MapChange;

