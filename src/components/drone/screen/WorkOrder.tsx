import titleIcon from "@/assets/images/drone/screen/title-icon.png";
import CommonBarChart from "@/components/public/CommonBarChart.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

const WorkOrder = () => {
  const statusList = [
    {name: "已归档", percent: 25, color: "#73D13D"},
    {name: "待上报", percent: 25, color: "#FF4D4F"},
    {name: "待审核", percent: 25, color: "#40A9FF"},
    {name: "待处理", percent: 25, color: "#FFA940"}
  ];

  return (
    <div className={"bg-screen-content bg-full-size flex flex-col pr-[40px] h-[673px]"}>
      <header className={"bg-screen-title pl-[43px] bg-full-size h-[45px] flex items-center"}>工单统计</header>
      <div className={"flex-1 pb-[30px] pl-[33px]"}>
        <div className={"flex items-center space-x-[20px] text-[12px] py-[13px]"}>
          <img src={titleIcon} className={"w-[12px]"} alt=""/>
          <span>状态统计</span>
        </div>
        <div className={"grid grid-cols-2"}>
          <div className={"relative w-[200px] h-[200px]"}>
            {/* 背景图片 */}
            <div className="absolute inset-0 bg-screen-work-order bg-full-size"/>

            {/* 中心数字 */}
            <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
              <span className="text-4xl font-bold text-[#40A9FF]">55</span>
              <span className="text-sm text-[#CFEFFF]">总数</span>
            </div>

            {/* 环形进度条 - 调整圆环大小 */}
            <svg className="w-full h-full -rotate-90 relative z-20">
              {statusList.map((item, index) => {
                const radius = 60;  // 减小半径
                const circumference = 2 * Math.PI * radius;
                const offset = circumference * (1 - item.percent / 100);
                const rotation = statusList
                  .slice(0, index)
                  .reduce((acc, cur) => acc + (cur.percent * 3.6), 0);

                return (
                  <circle
                    key={item.name}
                    className="transition-all duration-500"
                    cx="100"
                    cy="100"
                    r={radius}  // 使用新的半径
                    fill="none"
                    stroke={item.color}
                    strokeWidth="8"  // 减小线条宽度
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: "center",
                    }}
                  />
                );
              })}
            </svg>

            {/* 四个角的标签 - 调整标签位置 */}
            {statusList.map((item, index) => {
              const angle = -45 + (index * 90);
              const radius = 125;  // 调整标签到中心的距离
              const x = radius * Math.cos((angle * Math.PI) / 180);
              const y = radius * Math.sin((angle * Math.PI) / 180);

              return (
                <div
                  key={item.name}
                  className="absolute flex items-center whitespace-nowrap z-30"
                  style={{
                    left: `${100 + x}px`,
                    top: `${100 + y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="text-xs text-[#CFEFFF]">{item.name}</span>
                  <span
                    className="ml-1 text-xs"
                    style={{color: item.color}}
                  >
                    -{item.percent}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className={"space-y-4"}>
            <Select defaultValue={"2025"}>
              <SelectTrigger style={{
                backgroundSize: "100% 100%"
              }} className="w-[100px] h-[20px] bg-transparent bg-screen-select border-none text-[16px] font-semibold">
                <SelectValue placeholder="Theme"/>
              </SelectTrigger>
              <SelectContent className={"min-w-[88px]"}>
                <SelectItem value="2024">2025-1</SelectItem>
                <SelectItem value="2025">2025-2</SelectItem>
                <SelectItem value="2026">2025-3</SelectItem>
              </SelectContent>
            </Select>
            <div className={"h-[200px]"}>
              <CommonBarChart xAxisData={["1", "2", "3", "4", "5", "6"]} seriesData={[10, 20, 30, 20, 10, 8]}/>
            </div>
          </div>
        </div>
        <div className={"flex items-center space-x-[20px] text-[12px] py-[13px]"}>
          <img src={titleIcon} className={"w-[12px]"} alt=""/>
          <span>类别统计</span>
        </div>
        <div className={"grid grid-cols-2 gap-[30px]"}>
          <div className={""}>
            <Select defaultValue={"2025"}>
              <SelectTrigger style={{
                backgroundSize: "100% 100%"
              }} className="w-[100px] h-[20px] bg-transparent bg-screen-select border-none text-[16px] font-semibold">
                <SelectValue placeholder="Theme"/>
              </SelectTrigger>
              <SelectContent className={"min-w-[88px]"}>
                <SelectItem value="2024">2025-1</SelectItem>
                <SelectItem value="2025">2025-2</SelectItem>
                <SelectItem value="2026">2025-3</SelectItem>
              </SelectContent>
            </Select>
            <div className={"h-[300px]"}>
              <CommonBarChart type={"column"}
                              xAxisData={["环卫市容", "河道污染", "房屋管理", "突发事件", "工厂工地", "公共设施"]}
                // xAxisData={["环卫市容", "河道污染", "房屋管理", "突发事件", "工厂工地", "公共设施"]}
                // seriesData={[10, 20, 30, 20, 10, 8]}
                              seriesData={[10, 20, 30, 20, 10, 8]}
              />
            </div>
          </div>
          <div className={""}>
            <Select>
              <SelectTrigger style={{
                backgroundSize: "100% 100%"
              }} className="w-[120px] h-[20px] bg-transparent bg-screen-select border-none text-[16px] font-semibold">
                <SelectValue placeholder="选择类型"/>
              </SelectTrigger>
              <SelectContent className={"min-w-[88px]"}>
                <SelectItem value="2024">2025-1</SelectItem>
                <SelectItem value="2025">2025-2</SelectItem>
                <SelectItem value="2026">2025-3</SelectItem>
              </SelectContent>
            </Select>
            <div className={"h-[300px]"}>
              <CommonBarChart
                xAxisData={["环卫市容", "河道污染", "房屋管理", "突发事件", "工厂工地", "公共设施"]}
                // xAxisData={["环卫市容", "河道污染", "房屋管理", "突发事件", "工厂工地", "公共设施"]}
                // seriesData={[10, 20, 30, 20, 10, 8]}
                seriesData={[10, 20, 30, 20, 10, 8]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrder;

